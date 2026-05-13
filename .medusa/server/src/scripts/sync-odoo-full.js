"use strict";
/**
 * Full Odoo → MedusaJS Product Sync
 *
 * This is the MASTER sync script that imports ALL product data from Odoo
 * including brands, categories, variants, attributes, images, SEO, and cross-sell data.
 *
 * Usage: npx medusa exec ./src/scripts/sync-odoo-full.ts
 *
 * What it does:
 *  1. Connects to Odoo and fetches ALL product templates with 60+ fields
 *  2. Syncs brands from Odoo → Medusa brands module
 *  3. Syncs categories from Odoo → Medusa categories
 *  4. For each product:
 *     a. Creates/updates the product with all metadata
 *     b. Resolves and syncs variants with attributes (Color, Size, etc.)
 *     c. Downloads and attaches images (main + gallery)
 *     d. Creates pricing records (list_price, compare_price)
 *     e. Sets inventory levels
 *     f. Maps SEO fields, ratings, ribbons, tags
 *     g. Stores cross-sell IDs for frontend resolution
 *
 * @version 2.0 — March 2026
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = syncOdooFull;
const utils_1 = require("@medusajs/framework/utils");
const service_1 = __importDefault(require("../modules/odoo-sync/service"));
// ─────────────────────────────────────────────────
//  CONFIGURATION
// ─────────────────────────────────────────────────
const BATCH_SIZE = 50; // Products per batch from Odoo
const MAX_PRODUCTS = 4000; // Safety limit - increased to get more products
const ODOO_BASE_URL = process.env.ODOO_URL || "https://oskarllc-new-27289548.dev.odoo.com";
const DEFAULT_CURRENCY_CODE = "omr"; // Default currency (from Odoo)
const DEFAULT_CURRENCY_DECIMALS = 3; // OMR/KWD have 3 decimal places
// ─────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────
function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/(^-|-$)/g, "")
        .substring(0, 100);
}
function toSmallestUnit(amount) {
    // KWD/OMR: 1 unit = 1000 smallest (3 decimal places)
    return Math.round(amount * Math.pow(10, DEFAULT_CURRENCY_DECIMALS));
}
/**
 * Generate a direct Odoo image URL instead of downloading and saving locally.
 * Odoo serves images publicly at: {ODOO_URL}/web/image/{model}/{id}/{field}
 */
function getOdooImageUrl(odooId, field = "image_1920") {
    return `${ODOO_BASE_URL}/web/image/product.template/${odooId}/${field}`;
}
function getOdooGalleryImageUrl(imageId) {
    return `${ODOO_BASE_URL}/web/image/product.image/${imageId}/image_1920`;
}
function getOdooBrandLogoUrl(brandId) {
    return `${ODOO_BASE_URL}/web/image/product.brand/${brandId}/logo`;
}
// ─────────────────────────────────────────────────
//  MAIN SYNC FUNCTION
// ─────────────────────────────────────────────────
async function syncOdooFull({ container }) {
    const logger = container.resolve("logger");
    const productService = container.resolve(utils_1.Modules.PRODUCT);
    const pricingService = container.resolve(utils_1.Modules.PRICING);
    const regionService = container.resolve(utils_1.Modules.REGION);
    const salesChannelService = container.resolve(utils_1.Modules.SALES_CHANNEL);
    const remoteLink = container.resolve(utils_1.ContainerRegistrationKeys.REMOTE_LINK);
    const query = container.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    let brandService;
    try {
        brandService = container.resolve("brands");
    }
    catch {
        logger.warn("⚠️  Brands module not available, will store brand in metadata only");
    }
    console.log("\n" + "═".repeat(60));
    console.log("  🔄 FULL ODOO → MEDUSAJS PRODUCT SYNC");
    console.log("  📅 " + new Date().toISOString());
    console.log("═".repeat(60));
    // ── 1. Initialize Odoo connection ──
    const odoo = new service_1.default();
    if (!odoo.isConfigured()) {
        console.error("❌ Odoo not configured. Set ODOO_URL, ODOO_DB_NAME, ODOO_USERNAME, ODOO_API_KEY");
        return;
    }
    const connectionTest = await odoo.testConnection();
    if (!connectionTest.success) {
        console.error("❌ Odoo connection failed:", connectionTest.message);
        return;
    }
    console.log(`\n✅ Connected to Odoo`);
    console.log(`   📦 Products: ${connectionTest.data.productCount}`);
    console.log(`   📁 Categories: ${connectionTest.data.categoryCount}`);
    console.log(`   🏷️  Brands: ${connectionTest.data.brandCount}`);
    // ── 2. Pre-fetch lookup tables ──
    console.log("\n📋 Loading lookup data from Odoo...");
    // Ribbons (model may not exist on all Odoo instances)
    const ribbonMap = new Map();
    try {
        const ribbons = await odoo.fetchRibbons();
        for (const r of ribbons) {
            const text = r.html.replace(/<[^>]*>/g, "").trim();
            ribbonMap.set(r.id, text);
        }
        console.log(`   🎀 Ribbons: ${ribbons.length}`);
    }
    catch {
        console.log(`   🎀 Ribbons: model not available, skipping`);
    }
    // Brands from Odoo (product.brand may not exist)
    const odooBrandMap = new Map();
    let odooBrands = [];
    try {
        odooBrands = await odoo.fetchBrands();
        for (const b of odooBrands) {
            odooBrandMap.set(b.id, b);
        }
        console.log(`   🏷️  Brands: ${odooBrands.length}`);
    }
    catch {
        console.log(`   🏷️  Brands: model not available, skipping`);
    }
    // ── 3. Sync brands to Medusa brands module ──
    if (brandService && odooBrands.length > 0) {
        console.log("\n🏷️  Syncing brands...");
        for (const odooBrand of odooBrands) {
            try {
                const slug = slugify(odooBrand.name);
                const existing = await brandService.listBrands({ slug });
                if (existing.length === 0) {
                    // Use direct Odoo URL for brand logo
                    let logoUrl = null;
                    if (odooBrand.logo) {
                        logoUrl = getOdooBrandLogoUrl(odooBrand.id);
                    }
                    await brandService.createBrands({
                        name: odooBrand.name,
                        slug,
                        description: odooBrand.description || null,
                        logo_url: logoUrl,
                        is_active: true,
                    });
                    console.log(`   ✅ Created brand: ${odooBrand.name}`);
                }
            }
            catch (error) {
                console.warn(`   ⚠️  Brand "${odooBrand.name}": ${error.message}`);
            }
        }
    }
    // ── 4. Get existing Medusa products (to avoid duplicates) ──
    console.log("\n📊 Loading existing Medusa products...");
    const existingProducts = await productService.listProducts({}, {
        select: ["id", "handle", "metadata"],
        take: 5000,
    });
    const odooIdToMedusaId = new Map();
    const existingHandles = new Set();
    for (const p of existingProducts) {
        existingHandles.add(p.handle);
        if (p.metadata?.odoo_id) {
            odooIdToMedusaId.set(Number(p.metadata.odoo_id), p.id);
        }
    }
    console.log(`   📦 Existing products: ${existingProducts.length}`);
    console.log(`   🔗 Already linked to Odoo: ${odooIdToMedusaId.size}`);
    // ── 5. Get default sales channel ──
    const salesChannels = await salesChannelService.listSalesChannels({});
    const defaultSalesChannel = salesChannels[0];
    if (!defaultSalesChannel) {
        console.error("❌ No sales channel found!");
        return;
    }
    // ── 6. Get/Create region for KWD ──
    let regions = await regionService.listRegions({});
    let region = regions.find((r) => r.currency_code === DEFAULT_CURRENCY_CODE) || regions[0];
    console.log(`   💰 Region: ${region?.name} (${region?.currency_code?.toUpperCase()})`);
    // ── 7. Fetch and sync products in batches ──
    console.log("\n" + "─".repeat(60));
    console.log("  📦 SYNCING PRODUCTS");
    console.log("─".repeat(60));
    let totalCreated = 0;
    let totalUpdated = 0;
    let totalFailed = 0;
    let totalSkipped = 0;
    const errors = [];
    let offset = 0;
    let hasMore = true;
    while (hasMore && offset < MAX_PRODUCTS) {
        // Fetch batch from Odoo
        const batch = await odoo.fetchProducts(BATCH_SIZE, offset);
        if (batch.length === 0) {
            hasMore = false;
            break;
        }
        console.log(`\n📦 Processing batch ${Math.floor(offset / BATCH_SIZE) + 1} (${batch.length} products, offset ${offset})...`);
        for (const odooProduct of batch) {
            try {
                // Resolve brand name
                let brandName = null;
                if (odooProduct.brand_id && Array.isArray(odooProduct.brand_id)) {
                    brandName = odooProduct.brand_id[1];
                }
                else if (odooProduct.x_studio_brand_1) {
                    brandName = odooProduct.x_studio_brand_1;
                }
                // Resolve ribbon
                let ribbonText = null;
                if (odooProduct.website_ribbon_id && Array.isArray(odooProduct.website_ribbon_id)) {
                    ribbonText = ribbonMap.get(odooProduct.website_ribbon_id[0]) || odooProduct.website_ribbon_id[1];
                }
                // Resolve tags
                let tagNames = [];
                if (odooProduct.product_tag_ids?.length > 0) {
                    try {
                        const tags = await odoo.fetchTags(odooProduct.product_tag_ids);
                        tagNames = tags.map((t) => t.name);
                    }
                    catch { /* ignore tag fetch errors */ }
                }
                // Resolve vendors
                let vendors = [];
                if (odooProduct.seller_ids?.length > 0) {
                    try {
                        const vendorRecords = await odoo.fetchVendors(odooProduct.seller_ids);
                        vendors = vendorRecords.map((v) => ({
                            name: v.partner_id ? v.partner_id[1] : "Unknown",
                            price: v.price,
                            currency: v.currency_id ? v.currency_id[1] : "KWD",
                            lead_time: v.delay || 0,
                        }));
                    }
                    catch { /* ignore vendor fetch errors */ }
                }
                // Convert to Medusa format
                const medusaData = odoo.convertToMedusaProduct(odooProduct, {
                    brandName: brandName || undefined,
                    ribbonText: ribbonText || undefined,
                    tagNames,
                    vendors,
                });
                // Determine currency from product
                const productCurrency = odooProduct.currency_id
                    ? odooProduct.currency_id[1].toLowerCase()
                    : DEFAULT_CURRENCY_CODE;
                // ── Handle variants with attributes ──
                if (odooProduct.product_variant_count > 1 && odooProduct.attribute_line_ids?.length > 0) {
                    try {
                        // Fetch attribute lines (which attributes the product has)
                        const attrLines = await odoo.fetchAttributeLines(odooProduct.attribute_line_ids);
                        // Collect all unique value IDs
                        const allValueIds = attrLines.flatMap((al) => al.value_ids);
                        const attrValues = await odoo.fetchAttributeValues(allValueIds);
                        const valueMap = new Map(attrValues.map((v) => [v.id, v]));
                        // Build Medusa options from attribute lines
                        const options = [];
                        for (const line of attrLines) {
                            const attrName = line.attribute_id ? line.attribute_id[1] : "Option";
                            const values = line.value_ids
                                .map((vid) => valueMap.get(vid)?.name)
                                .filter(Boolean);
                            if (values.length > 0) {
                                options.push({ title: attrName, values });
                            }
                        }
                        // Fetch actual variants from Odoo
                        const odooVariants = await odoo.fetchVariantsByTemplate(odooProduct.id);
                        if (odooVariants.length > 0 && options.length > 0) {
                            // Fetch template attribute values to map variant → attribute values
                            const allPtavIds = odooVariants.flatMap((v) => v.product_template_attribute_value_ids || []);
                            let ptavMap = new Map();
                            if (allPtavIds.length > 0) {
                                try {
                                    const ptavs = await odoo.fetchTemplateAttributeValues(allPtavIds);
                                    ptavMap = new Map(ptavs.map((p) => [p.id, p]));
                                }
                                catch { /* ignore */ }
                            }
                            // Build variant data for Medusa
                            medusaData.options = options.map((o) => ({ title: o.title, values: o.values }));
                            medusaData.variants = odooVariants.map((v) => {
                                // Determine which option values this variant has
                                const variantOptions = {};
                                for (const ptavId of (v.product_template_attribute_value_ids || [])) {
                                    const ptav = ptavMap.get(ptavId);
                                    if (ptav && ptav.attribute_id) {
                                        variantOptions[ptav.attribute_id[1]] = ptav.name;
                                    }
                                }
                                return {
                                    title: v.display_name || "Variant",
                                    sku: v.default_code || `ODOO-${v.id}`,
                                    barcode: v.barcode || undefined,
                                    manage_inventory: odooProduct.is_storable || false,
                                    allow_backorder: odooProduct.allow_out_of_stock_order || false,
                                    inventory_quantity: Math.floor(v.qty_available || 0),
                                    weight: v.weight || odooProduct.weight || 0,
                                    options: variantOptions,
                                    metadata: {
                                        odoo_variant_id: v.id,
                                        odoo_product_id: odooProduct.id,
                                        odoo_price: v.list_price || odooProduct.list_price || 0,
                                        odoo_price_amount: toSmallestUnit(v.list_price || odooProduct.list_price || 0),
                                        odoo_currency: productCurrency,
                                        odoo_cost: v.standard_price || odooProduct.standard_price || 0,
                                        odoo_stock: v.qty_available || 0,
                                        odoo_forecasted: v.virtual_available || 0,
                                    },
                                };
                            });
                        }
                    }
                    catch (variantError) {
                        console.warn(`   ⚠️  Variant fetch failed for "${odooProduct.name}": ${variantError.message}`);
                        // Fall through with default single variant
                    }
                }
                // ── Create or Update in Medusa ──
                const existingMedusaId = odooIdToMedusaId.get(odooProduct.id);
                if (existingMedusaId) {
                    // UPDATE existing product
                    await productService.updateProducts(existingMedusaId, {
                        title: medusaData.title,
                        subtitle: medusaData.subtitle,
                        description: medusaData.description,
                        handle: medusaData.handle,
                        status: medusaData.status,
                        weight: medusaData.weight,
                        metadata: medusaData.metadata,
                    });
                    totalUpdated++;
                    if (totalUpdated % 10 === 0) {
                        console.log(`   📝 Updated ${totalUpdated} products...`);
                    }
                }
                else {
                    // CREATE new product
                    // Ensure handle is unique
                    let handle = medusaData.handle;
                    let counter = 1;
                    while (existingHandles.has(handle)) {
                        handle = `${medusaData.handle}-${counter++}`;
                    }
                    medusaData.handle = handle;
                    existingHandles.add(handle);
                    try {
                        const created = await productService.createProducts(medusaData);
                        const createdId = Array.isArray(created) ? created[0]?.id : created?.id;
                        if (createdId) {
                            odooIdToMedusaId.set(odooProduct.id, createdId);
                        }
                        totalCreated++;
                        if (totalCreated % 10 === 0) {
                            console.log(`   ✅ Created ${totalCreated} products...`);
                        }
                    }
                    catch (createError) {
                        // If creation fails (e.g., duplicate handle), try updating handle
                        console.warn(`   ⚠️  Create failed for "${odooProduct.name}": ${createError.message}`);
                        totalFailed++;
                        errors.push(`CREATE ${odooProduct.name}: ${createError.message}`);
                    }
                }
                // ── Set main image URL (direct from Odoo) ──
                if (odooProduct.image_1920 && typeof odooProduct.image_1920 === "string") {
                    try {
                        const imageUrl = getOdooImageUrl(odooProduct.id);
                        if (imageUrl) {
                            const medusaId = odooIdToMedusaId.get(odooProduct.id);
                            if (medusaId) {
                                await productService.updateProducts(medusaId, {
                                    thumbnail: imageUrl,
                                    images: [{ url: imageUrl }],
                                });
                            }
                        }
                    }
                    catch (imgError) {
                        // Don't fail the whole product for image errors
                        console.warn(`   ⚠️  Image URL failed for "${odooProduct.name}": ${imgError.message}`);
                    }
                }
                // ── Set gallery image URLs (direct from Odoo) ──
                if (odooProduct.product_template_image_ids?.length > 0) {
                    try {
                        const imageUrls = [];
                        // Keep main image first
                        const medusaId = odooIdToMedusaId.get(odooProduct.id);
                        if (medusaId) {
                            const existingProduct = await productService.retrieveProduct(medusaId, { select: ["thumbnail"] });
                            if (existingProduct?.thumbnail) {
                                imageUrls.push({ url: existingProduct.thumbnail });
                            }
                        }
                        // Add gallery images using direct Odoo URLs
                        for (const galleryImgId of odooProduct.product_template_image_ids) {
                            const url = getOdooGalleryImageUrl(galleryImgId);
                            imageUrls.push({ url });
                        }
                        if (imageUrls.length > 0 && medusaId) {
                            await productService.updateProducts(medusaId, {
                                images: imageUrls,
                            });
                        }
                    }
                    catch (galleryError) {
                        console.warn(`   ⚠️  Gallery images failed for "${odooProduct.name}": ${galleryError.message}`);
                    }
                }
                // ── Sync prices via Pricing module ──
                // MedusaJS 2.x: prices must be set via Pricing module, not inline on variants
                const medusaIdForPricing = odooIdToMedusaId.get(odooProduct.id);
                if (medusaIdForPricing) {
                    try {
                        const fullProduct = await productService.retrieveProduct(medusaIdForPricing, { relations: ["variants"] });
                        for (const variant of (fullProduct.variants || [])) {
                            const variantMeta = (variant.metadata || {});
                            const priceAmount = variantMeta.odoo_price_amount || toSmallestUnit(odooProduct.list_price || 0);
                            const currency = variantMeta.odoo_currency || productCurrency;
                            const { data: existingLinks } = await query.graph({
                                entity: "product_variant",
                                fields: ["id", "price_set.*"],
                                filters: { id: variant.id },
                            });
                            if (existingLinks?.[0]?.price_set) {
                                try {
                                    await pricingService.addPrices([{
                                            priceSetId: existingLinks[0].price_set.id,
                                            prices: [{ amount: priceAmount, currency_code: currency }],
                                        }]);
                                }
                                catch { /* price may already exist */ }
                            }
                            else {
                                const [newPriceSet] = await pricingService.createPriceSets([{
                                        prices: [{ amount: priceAmount, currency_code: currency }],
                                    }]);
                                await remoteLink.create({
                                    [utils_1.Modules.PRODUCT]: { variant_id: variant.id },
                                    [utils_1.Modules.PRICING]: { price_set_id: newPriceSet.id },
                                });
                            }
                        }
                    }
                    catch (priceError) {
                        console.warn(`   ⚠️  Price sync failed for "${odooProduct.name}": ${priceError.message}`);
                    }
                }
            }
            catch (productError) {
                totalFailed++;
                errors.push(`${odooProduct.name}: ${productError.message}`);
                console.error(`   ❌ Failed: "${odooProduct.name}": ${productError.message}`);
            }
        }
        offset += batch.length;
        if (batch.length < BATCH_SIZE) {
            hasMore = false;
        }
    }
    // ── 8. Summary ──
    console.log("\n" + "═".repeat(60));
    console.log("  📊 SYNC COMPLETE");
    console.log("═".repeat(60));
    console.log(`   ✅ Created:  ${totalCreated}`);
    console.log(`   📝 Updated:  ${totalUpdated}`);
    console.log(`   ❌ Failed:   ${totalFailed}`);
    console.log(`   ⏭️  Skipped:  ${totalSkipped}`);
    console.log(`   📦 Total:    ${totalCreated + totalUpdated + totalFailed + totalSkipped}`);
    if (errors.length > 0) {
        console.log(`\n   ⚠️  Errors (${errors.length}):`);
        errors.slice(0, 20).forEach((e) => console.log(`      - ${e}`));
        if (errors.length > 20) {
            console.log(`      ... and ${errors.length - 20} more`);
        }
    }
    console.log(`\n   🕐 Completed at: ${new Date().toISOString()}`);
    console.log("═".repeat(60) + "\n");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3luYy1vZG9vLWZ1bGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9zeW5jLW9kb28tZnVsbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FzQkc7Ozs7O0FBK0RILCtCQWljQztBQTdmRCxxREFBOEU7QUFDOUUsMkVBU3FDO0FBRXJDLG9EQUFvRDtBQUNwRCxpQkFBaUI7QUFDakIsb0RBQW9EO0FBRXBELE1BQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQSxDQUFVLCtCQUErQjtBQUM5RCxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUEsQ0FBTSxnREFBZ0Q7QUFDL0UsTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLElBQUksNENBQTRDLENBQUE7QUFDMUYsTUFBTSxxQkFBcUIsR0FBRyxLQUFLLENBQUEsQ0FBSSwrQkFBK0I7QUFDdEUsTUFBTSx5QkFBeUIsR0FBRyxDQUFDLENBQUEsQ0FBSSxnQ0FBZ0M7QUFFdkUsb0RBQW9EO0FBQ3BELFdBQVc7QUFDWCxvREFBb0Q7QUFFcEQsU0FBUyxPQUFPLENBQUMsSUFBWTtJQUMzQixPQUFPLElBQUk7U0FDUixXQUFXLEVBQUU7U0FDYixPQUFPLENBQUMsZUFBZSxFQUFFLEVBQUUsQ0FBQztTQUM1QixPQUFPLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQztTQUNwQixPQUFPLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQztTQUN2QixTQUFTLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFBO0FBQ3RCLENBQUM7QUFFRCxTQUFTLGNBQWMsQ0FBQyxNQUFjO0lBQ3BDLHFEQUFxRDtJQUNyRCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLHlCQUF5QixDQUFDLENBQUMsQ0FBQTtBQUNyRSxDQUFDO0FBRUQ7OztHQUdHO0FBQ0gs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
"use strict";
/**
 * Sync 2 Test Products from Odoo → MedusaJS
 *
 * Samsung Galaxy S25 Ultra (ID: 92486)
 * Marshall Minor III Bluetooth In-Ear Headphone -Black (ID: 84925)
 *
 * Usage: npx medusa exec ./src/scripts/sync-test-products.ts
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = syncTestProducts;
const utils_1 = require("@medusajs/framework/utils");
const service_1 = __importDefault(require("../modules/odoo-sync/service"));
const ODOO_BASE_URL = process.env.ODOO_URL || "https://oskarllc-new-27289548.dev.odoo.com";
function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-{2,}/g, "-")
        .replace(/^-|-$/g, "")
        .substring(0, 100);
}
/**
 * Generate a direct Odoo image URL instead of downloading and saving locally.
 */
function getOdooImageUrl(odooId) {
    return `${ODOO_BASE_URL}/web/image/product.template/${odooId}/image_1920`;
}
function getOdooGalleryImageUrl(imageId) {
    return `${ODOO_BASE_URL}/web/image/product.image/${imageId}/image_1920`;
}
const TEST_PRODUCT_IDS = [92486, 84925];
async function syncTestProducts({ container }) {
    const productService = container.resolve(utils_1.Modules.PRODUCT);
    const pricingService = container.resolve(utils_1.Modules.PRICING);
    const remoteLink = container.resolve(utils_1.ContainerRegistrationKeys.REMOTE_LINK);
    const query = container.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    console.log("\n" + "═".repeat(60));
    console.log("  🧪 SYNCING 2 TEST PRODUCTS FROM ODOO");
    console.log("═".repeat(60));
    const odoo = new service_1.default();
    const authOk = await odoo.authenticate();
    if (!authOk) {
        console.error("❌ Auth failed");
        return;
    }
    // Get existing products to check for duplicates
    const existingProducts = await productService.listProducts({}, {
        select: ["id", "handle", "metadata"],
        take: 5000,
    });
    const existingHandles = new Set(existingProducts.map((p) => p.handle));
    const odooIdMap = new Map();
    for (const p of existingProducts) {
        if (p.metadata?.odoo_id) {
            odooIdMap.set(Number(p.metadata.odoo_id), p.id);
        }
    }
    for (const odooId of TEST_PRODUCT_IDS) {
        console.log(`\n${"─".repeat(60)}`);
        try {
            // Fetch product from Odoo
            const odooProduct = await odoo.fetchProductById(odooId);
            if (!odooProduct) {
                console.error(`  ❌ Product ID ${odooId} not found`);
                continue;
            }
            console.log(`  📦 ${odooProduct.name} (Odoo ID: ${odooId})`);
            // Resolve brand
            let brandName = null;
            if (Array.isArray(odooProduct.brand_id)) {
                brandName = odooProduct.brand_id[1];
            }
            else if (odooProduct.x_studio_brand_1 && typeof odooProduct.x_studio_brand_1 === "string") {
                brandName = odooProduct.x_studio_brand_1;
            }
            // Resolve tags
            let tagNames = [];
            if (odooProduct.product_tag_ids?.length > 0) {
                try {
                    const tags = await odoo.fetchTags(odooProduct.product_tag_ids);
                    tagNames = tags.map((t) => t.name);
                }
                catch { /* ignore */ }
            }
            // Resolve vendors
            let vendors = [];
            if (odooProduct.seller_ids?.length > 0) {
                try {
                    const vendorRecords = await odoo.fetchVendors(odooProduct.seller_ids);
                    vendors = vendorRecords.map((v) => ({
                        name: v.partner_id ? v.partner_id[1] : "Unknown",
                        price: v.price,
                        currency: v.currency_id ? v.currency_id[1] : "OMR",
                        lead_time: v.delay || 0,
                    }));
                }
                catch { /* ignore */ }
            }
            // Convert to Medusa
            const medusaData = odoo.convertToMedusaProduct(odooProduct, {
                brandName: brandName || undefined,
                tagNames,
                vendors,
            });
            // Determine product currency
            const productCurrency = odooProduct.currency_id
                ? odooProduct.currency_id[1].toLowerCase()
                : "omr";
            const currencyMultiplier = (productCurrency === "kwd" || productCurrency === "omr") ? 1000 : 100;
            // ── Handle variants with attributes ──
            if (odooProduct.product_variant_count > 1 && odooProduct.attribute_line_ids?.length > 0) {
                try {
                    const attrLines = await odoo.fetchAttributeLines(odooProduct.attribute_line_ids);
                    const allValueIds = attrLines.flatMap((al) => al.value_ids);
                    const attrValues = await odoo.fetchAttributeValues(allValueIds);
                    const valueMap = new Map(attrValues.map((v) => [v.id, v]));
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
                    const odooVariants = await odoo.fetchVariantsByTemplate(odooProduct.id);
                    if (odooVariants.length > 0 && options.length > 0) {
                        const allPtavIds = odooVariants.flatMap((v) => v.product_template_attribute_value_ids || []);
                        let ptavMap = new Map();
                        if (allPtavIds.length > 0) {
                            try {
                                const ptavs = await odoo.fetchTemplateAttributeValues(allPtavIds);
                                ptavMap = new Map(ptavs.map((p) => [p.id, p]));
                            }
                            catch { /* ignore */ }
                        }
                        medusaData.options = options.map((o) => ({ title: o.title, values: o.values }));
                        medusaData.variants = odooVariants.map((v) => {
                            const variantOptions = {};
                            for (const ptavId of (v.product_template_attribute_value_ids || [])) {
                                const ptav = ptavMap.get(ptavId);
                                if (ptav?.attribute_id) {
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
                                    odoo_price_amount: Math.round((v.list_price || odooProduct.list_price || 0) * currencyMultiplier),
                                    odoo_currency: productCurrency,
                                    odoo_cost: v.standard_price || odooProduct.standard_price || 0,
                                    odoo_stock: v.qty_available || 0,
                                    odoo_forecasted: v.virtual_available || 0,
                                },
                            };
                        });
                        console.log(`  🎨 Attributes: ${options.map(o => `${o.title}(${o.values.join(",")})`).join(" | ")}`);
                        console.log(`  📋 Variants: ${medusaData.variants.length}`);
                    }
                }
                catch (e) {
                    console.warn(`  ⚠️  Variant fetch failed: ${e.message}`);
                }
            }
            // ── Create or Update ──
            const existingId = odooIdMap.get(odooId);
            if (existingId) {
                // UPDATE
                await productService.updateProducts(existingId, {
                    title: medusaData.title,
                    subtitle: medusaData.subtitle,
                    description: medusaData.description,
                    handle: medusaData.handle,
                    status: medusaData.status,
                    weight: medusaData.weight,
                    metadata: medusaData.metadata,
                });
                console.log(`  📝 UPDATED (Medusa ID: ${existingId})`);
            }
            else {
                // CREATE — MedusaJS 2.x: create product first, then add options/variants
                let handle = medusaData.handle;
                let counter = 1;
                while (existingHandles.has(handle)) {
                    handle = `${medusaData.handle}-${counter++}`;
                }
                medusaData.handle = handle;
                existingHandles.add(handle);
                // Separate options and variants for step-by-step creation
                const productOptions = medusaData.options;
                const productVariants = medusaData.variants;
                delete medusaData.options;
                // Replace variants with a simple default variant (no options reference)
                medusaData.variants = [{
                        title: "Default",
                        sku: odooProduct.default_code || `ODOO-${odooProduct.id}`,
                        manage_inventory: odooProduct.is_storable || false,
                        allow_backorder: odooProduct.allow_out_of_stock_order || false,
                        metadata: { odoo_product_id: odooProduct.id },
                    }];
                const result = await productService.createProducts(medusaData);
                const newId = Array.isArray(result) ? result[0]?.id : result?.id;
                console.log(`  ✅ CREATED (Medusa ID: ${newId})`);
                if (newId) {
                    odooIdMap.set(odooId, newId);
                    // Now add options and real variants if product has them
                    if (productOptions && productOptions.length > 0 && productVariants && productVariants.length > 0) {
                        try {
                            // Create options on the product
                            for (const opt of productOptions) {
                                await productService.createProductOptions({
                                    product_id: newId,
                                    title: opt.title,
                                    values: opt.values,
                                });
                            }
                            console.log(`  🎨 Created ${productOptions.length} options`);
                            // Delete the default variant
                            const createdProduct = await productService.retrieveProduct(newId, { relations: ["variants"] });
                            if (createdProduct.variants?.length > 0) {
                                const variantIds = createdProduct.variants.map((v) => v.id);
                                await productService.deleteProductVariants(variantIds);
                            }
                            // Create real variants with option values
                            for (const variant of productVariants) {
                                await productService.createProductVariants({
                                    product_id: newId,
                                    title: variant.title,
                                    sku: variant.sku,
                                    barcode: variant.barcode,
                                    manage_inventory: variant.manage_inventory,
                                    allow_backorder: variant.allow_backorder,
                                    weight: variant.weight,
                                    options: variant.options, // { color: "Blue", Storage: "512 GB" }
                                    metadata: variant.metadata,
                                });
                            }
                            console.log(`  📋 Created ${productVariants.length} variants with options`);
                        }
                        catch (varError) {
                            console.warn(`  ⚠️  Variant/option creation failed: ${varError.message}`);
                            console.warn(`     Product was created successfully with default variant`);
                        }
                    }
                }
            }
            // ── Set images (direct Odoo URLs) ──
            const medusaId = odooIdMap.get(odooId);
            if (medusaId && odooProduct.image_1920 && typeof odooProduct.image_1920 === "string") {
                const imageUrl = getOdooImageUrl(odooProduct.id);
                if (imageUrl) {
                    const imageUrls = [{ url: imageUrl }];
                    // Gallery images — use direct Odoo URLs
                    if (odooProduct.product_template_image_ids?.length > 0) {
                        for (const galleryImgId of odooProduct.product_template_image_ids) {
                            imageUrls.push({ url: getOdooGalleryImageUrl(galleryImgId) });
                        }
                    }
                    await productService.updateProducts(medusaId, {
                        thumbnail: imageUrl,
                        images: imageUrls,
                    });
                    console.log(`  🖼️  Images: ${imageUrls.length} URLs set (main + gallery)`);
                }
            }
            // ── Sync prices via Pricing module ──
            // MedusaJS 2.x: prices are NOT part of variant creation.
            // Must create price sets and link them to variants via RemoteLink.
            if (medusaId) {
                try {
                    const fullProduct = await productService.retrieveProduct(medusaId, { relations: ["variants"] });
                    let pricesSynced = 0;
                    for (const variant of (fullProduct.variants || [])) {
                        const variantMeta = (variant.metadata || {});
                        const priceAmount = variantMeta.odoo_price_amount || Math.round((odooProduct.list_price || 0) * currencyMultiplier);
                        const currency = variantMeta.odoo_currency || productCurrency;
                        // Check if variant already has a price set linked
                        const { data: existingLinks } = await query.graph({
                            entity: "product_variant",
                            fields: ["id", "price_set.*"],
                            filters: { id: variant.id },
                        });
                        if (existingLinks?.[0]?.price_set) {
                            // Update existing price set
                            const priceSetId = existingLinks[0].price_set.id;
                            try {
                                await pricingService.addPrices([{
                                        priceSetId,
                                        prices: [{ amount: priceAmount, currency_code: currency }],
                                    }]);
                            }
                            catch { /* price may already exist */ }
                        }
                        else {
                            // Create new price set and link to variant
                            const [newPriceSet] = await pricingService.createPriceSets([{
                                    prices: [{ amount: priceAmount, currency_code: currency }],
                                }]);
                            await remoteLink.create({
                                [utils_1.Modules.PRODUCT]: { variant_id: variant.id },
                                [utils_1.Modules.PRICING]: { price_set_id: newPriceSet.id },
                            });
                        }
                        pricesSynced++;
                    }
                    console.log(`  💰 Prices: ${pricesSynced} variant prices synced (${productCurrency.toUpperCase()})`);
                }
                catch (priceError) {
                    console.warn(`  ⚠️  Price sync failed: ${priceError.message}`);
                }
            }
            // ── Print final metadata summary ──
            console.log(`\n  📊 METADATA SUMMARY (${Object.keys(medusaData.metadata).length} fields):`);
            const meta = medusaData.metadata;
            console.log(`     Brand: ${meta.brand || "—"}`);
            console.log(`     Category: ${meta.odoo_category_name || "—"}`);
            console.log(`     Price: ${odooProduct.list_price} ${meta.currency} (compare: ${meta.compare_price}, cost: ${meta.cost_price})`);
            console.log(`     Stock: ${meta.odoo_stock} (forecasted: ${meta.forecasted_qty})`);
            console.log(`     Description: ${medusaData.description ? String(medusaData.description).substring(0, 60) + "..." : "—"}`);
            console.log(`     Ecommerce HTML: ${meta.ecommerce_description ? "✅ present" : "—"}`);
            console.log(`     SEO: title=${meta.seo_title || "—"}, desc=${meta.seo_description || "—"}`);
            console.log(`     Upsell IDs: ${JSON.stringify(meta.upsell_odoo_ids)}`);
            console.log(`     Accessory IDs: ${JSON.stringify(meta.accessory_odoo_ids)}`);
            console.log(`     Alternative IDs: ${JSON.stringify(meta.alternative_odoo_ids)}`);
            console.log(`     Tags: ${meta.tags?.length > 0 ? meta.tags.join(", ") : "—"}`);
            console.log(`     Vendors: ${meta.vendors?.length > 0 ? meta.vendors.map((v) => v.name).join(", ") : "—"}`);
            console.log(`     Ribbon: ${meta.ribbon || "—"}`);
            console.log(`     Rating: ${meta.rating}/5 (${meta.reviews_count} reviews)`);
            console.log(`     Variants: ${meta.variant_count}`);
            console.log(`     Gallery images: ${meta.gallery_image_ids?.length || 0}`);
            console.log(`     Status: ${medusaData.status}`);
            console.log(`     Handle: ${medusaData.handle}`);
        }
        catch (error) {
            console.error(`  ❌ Error syncing product ${odooId}: ${error.message}`);
            if (error.stack)
                console.error(error.stack.split("\n").slice(0, 5).join("\n"));
        }
    }
    console.log("\n" + "═".repeat(60));
    console.log("  ✅ TEST SYNC COMPLETE");
    console.log("═".repeat(60) + "\n");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3luYy10ZXN0LXByb2R1Y3RzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvc3luYy10ZXN0LXByb2R1Y3RzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7OztHQU9HOzs7OztBQXFDSCxtQ0E0VkM7QUE5WEQscURBQThFO0FBQzlFLDJFQU1xQztBQUVyQyxNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsSUFBSSw0Q0FBNEMsQ0FBQTtBQUUxRixTQUFTLE9BQU8sQ0FBQyxJQUFZO0lBQzNCLE9BQU8sSUFBSTtTQUNSLFdBQVcsRUFBRTtTQUNiLE9BQU8sQ0FBQyxlQUFlLEVBQUUsRUFBRSxDQUFDO1NBQzVCLE9BQU8sQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDO1NBQ3BCLE9BQU8sQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDO1NBQ3RCLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDO1NBQ3JCLFNBQVMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUE7QUFDdEIsQ0FBQztBQUVEOztHQUVHO0FBQ0gsU0FBUyxlQUFlLENBQUMsTUFBYztJQUNyQyxPQUFPLEdBQUcsYUFBYSwrQkFBK0IsTUFBTSxhQUFhLENBQUE7QUFDM0UsQ0FBQztBQUVELFNBQVMsc0JBQXNCLENBQUMsT0FBZTtJQUM3QyxPQUFPLEdBQUcsYUFBYSw0QkFBNEIsT0FBTyxhQUFhLENBQUE7QUFDekUsQ0FBQztBQUVELE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUE7QUFFeEIsS0FBSyxVQUFVLGdCQUFnQixDQUFDLEVBQUUsU0FBUyxFQUFZO0lBQ3BFLE1BQU0sY0FBYyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsZUFBTyxDQUFDLE9BQU8sQ0FBQyxDQUFBO0lBQ3pELE1BQU0sY0FBYyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsZUFBTyxDQUFDLE9BQU8sQ0FBQyxDQUFBO0lBQ3pELE1BQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsaUNBQXlCLENBQUMsV0FBVyxDQUFDLENBQUE7SUFDM0UsTUFBTSxLQUFLLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxpQ0FBeUIsQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUVoRSxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7SUFDbEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFBO0lBQ3JELE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO0lBRTNCLE1BQU0sSUFBSSxHQUFHLElBQUksaUJBQWUsRUFBRSxDQUFBO0lBQ2xDLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFBO0lBQ3hDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNaLE9BQU8sQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUE7UUFDOUIsT0FBTTtJQUNSLENBQUM7SUFFRCxnREFBZ0Q7SUFDaEQsTUFBTSxnQkFBZ0IsR0FBRyxNQUFNLGNBQWMsQ0FBQyxZQUFZLENBQUMsRUFBRSxFQUFFO1FBQzdELE1BQU0sRUFBRSxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsVUFBVSxDQUFDO1FBQ3BDLElBQUksRUFBRSxJQUFJO0tBQ1gsQ0FBQyxDQUFBO0lBQ0YsTUFBTSxlQUFlLEdBQUcsSUFBSSxHQUFHLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQTtJQUMzRSxNQUFNLFNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBa0IsQ0FBQTtJQUMzQyxLQUFLLE1BQU0sQ0FBQyxJQUFJLGdCQUFnQixFQUFFLENBQUM7UUFDakMsSUFBSSxDQUFDLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxDQUFDO1lBQ3hCLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ2pELENBQUM7SUFDSCxDQUFDO0lBRUQsS0FBSyxNQUFNLE1BQU0sSUFBSSxnQkFBZ0IsRUFBRSxDQUFDO1FBQ3RDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUVsQyxJQUFJLENBQUM7WUFDSCwwQkFBMEI7WUFDMUIsTUFBTSxXQUFXLEdBQUcsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUE7WUFDdkQsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUNqQixPQUFPLENBQUMsS0FBSyxDQUFDLGtCQUFrQixNQUFNLFlBQVksQ0FBQyxDQUFBO2dCQUNuRCxTQUFRO1lBQ1YsQ0FBQztZQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxXQUFXLENBQUMsSUFBSSxjQUFjLE1BQU0sR0FBRyxDQUFDLENBQUE7WUFFNUQsZ0JBQWdCO1lBQ2hCLElBQUksU0FBUyxHQUFrQixJQUFJLENBQUE7WUFDbkMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO2dCQUN4QyxTQUFTLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNyQyxDQUFDO2lCQUFNLElBQUksV0FBVyxDQUFDLGdCQUFnQixJQUFJLE9BQU8sV0FBVyxDQUFDLGdCQUFnQixLQUFLLFFBQVEsRUFBRSxDQUFDO2dCQUM1RixTQUFTLEdBQUcsV0FBVyxDQUFDLGdCQUFnQixDQUFBO1lBQzFDLENBQUM7WUFFRCxlQUFlO1lBQ2YsSUFBSSxRQUFRLEdBQWEsRUFBRSxDQUFBO1lBQzNCLElBQUksV0FBVyxDQUFDLGVBQWUsRUFBRSxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQzVDLElBQUksQ0FBQztvQkFDSCxNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxDQUFBO29CQUM5RCxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQVUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFBO2dCQUM3QyxDQUFDO2dCQUFDLE1BQU0sQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQzFCLENBQUM7WUFFRCxrQkFBa0I7WUFDbEIsSUFBSSxPQUFPLEdBQWdGLEVBQUUsQ0FBQTtZQUM3RixJQUFJLFdBQVcsQ0FBQyxVQUFVLEVBQUUsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUN2QyxJQUFJLENBQUM7b0JBQ0gsTUFBTSxhQUFhLEdBQUcsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQTtvQkFDckUsT0FBTyxHQUFHLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7d0JBQ2xDLElBQUksRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTO3dCQUNoRCxLQUFLLEVBQUUsQ0FBQyxDQUFDLEtBQUs7d0JBQ2QsUUFBUSxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUs7d0JBQ2xELFNBQVMsRUFBRSxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUM7cUJBQ3hCLENBQUMsQ0FBQyxDQUFBO2dCQUNMLENBQUM7Z0JBQUMsTUFBTSxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDMUIsQ0FBQztZQUVELG9CQUFvQjtZQUNwQixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsV0FBVyxFQUFFO2dCQUMxRCxTQUFTLEVBQUUsU0FBUyxJQUFJLFNBQVM7Z0JBQ2pDLFFBQVE7Z0JBQ1IsT0FBTzthQUNSLENBQUMsQ0FBQTtZQUVGLDZCQUE2QjtZQUM3QixNQUFNLGVBQWUsR0FBRyxXQUFXLENBQUMsV0FBVztnQkFDN0MsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFO2dCQUMxQyxDQUFDLENBQUMsS0FBSyxDQUFBO1lBQ1QsTUFBTSxrQkFBa0IsR0FBRyxDQUFDLGVBQWUsS0FBSyxLQUFLLElBQUksZUFBZSxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQTtZQUVoRyx3Q0FBd0M7WUFDeEMsSUFBSSxXQUFXLENBQUMscUJBQXFCLEdBQUcsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxrQkFBa0IsRUFBRSxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQ3hGLElBQUksQ0FBQztvQkFDSCxNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLENBQUMsa0JBQWtCLENBQUMsQ0FBQTtvQkFDaEYsTUFBTSxXQUFXLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQXFCLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQTtvQkFDOUUsTUFBTSxVQUFVLEdBQUcsTUFBTSxJQUFJLENBQUMsb0JBQW9CLENBQUMsV0FBVyxDQUFDLENBQUE7b0JBQy9ELE1BQU0sUUFBUSxHQUFHLElBQUksR0FBRyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFxQixFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO29CQUU5RSxNQUFNLE9BQU8sR0FBK0MsRUFBRSxDQUFBO29CQUM5RCxLQUFLLE1BQU0sSUFBSSxJQUFJLFNBQVMsRUFBRSxDQUFDO3dCQUM3QixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUE7d0JBQ3BFLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTOzZCQUMxQixHQUFHLENBQUMsQ0FBQyxHQUFXLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDOzZCQUM3QyxNQUFNLENBQUMsT0FBTyxDQUFhLENBQUE7d0JBQzlCLElBQUksTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQzs0QkFDdEIsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQTt3QkFDM0MsQ0FBQztvQkFDSCxDQUFDO29CQUVELE1BQU0sWUFBWSxHQUFHLE1BQU0sSUFBSSxDQUFDLHVCQUF1QixDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQTtvQkFFdkUsSUFBSSxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO3dCQUNsRCxNQUFNLFVBQVUsR0FBRyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBYyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsb0NBQW9DLElBQUksRUFBRSxDQUFDLENBQUE7d0JBQ3pHLElBQUksT0FBTyxHQUFHLElBQUksR0FBRyxFQUFlLENBQUE7d0JBQ3BDLElBQUksVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQzs0QkFDMUIsSUFBSSxDQUFDO2dDQUNILE1BQU0sS0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLDRCQUE0QixDQUFDLFVBQVUsQ0FBQyxDQUFBO2dDQUNqRSxPQUFPLEdBQUcsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQU0sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTs0QkFDckQsQ0FBQzs0QkFBQyxNQUFNLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQzt3QkFDMUIsQ0FBQzt3QkFFRCxVQUFVLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQTt3QkFDL0UsVUFBVSxDQUFDLFFBQVEsR0FBRyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBYyxFQUFFLEVBQUU7NEJBQ3hELE1BQU0sY0FBYyxHQUEyQixFQUFFLENBQUE7NEJBQ2pELEtBQUssTUFBTSxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsb0NBQW9DLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQztnQ0FDcEUsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQTtnQ0FDaEMsSUFBSSxJQUFJLEVBQUUsWUFBWSxFQUFFLENBQUM7b0NBQ3ZCLGNBQWMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQTtnQ0FDbEQsQ0FBQzs0QkFDSCxDQUFDOzRCQUVELE9BQU87Z0NBQ0wsS0FBSyxFQUFFLENBQUMsQ0FBQyxZQUFZLElBQUksU0FBUztnQ0FDbEMsR0FBRyxFQUFHLENBQUMsQ0FBQyxZQUF1QixJQUFJLFFBQVEsQ0FBQyxDQUFDLEVBQUUsRUFBRTtnQ0FDakQsT0FBTyxFQUFHLENBQUMsQ0FBQyxPQUFrQixJQUFJLFNBQVM7Z0NBQzNDLGdCQUFnQixFQUFFLFdBQVcsQ0FBQyxXQUFXLElBQUksS0FBSztnQ0FDbEQsZUFBZSxFQUFFLFdBQVcsQ0FBQyx3QkFBd0IsSUFBSSxLQUFLO2dDQUM5RCxrQkFBa0IsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxhQUFhLElBQUksQ0FBQyxDQUFDO2dDQUNwRCxNQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU0sSUFBSSxXQUFXLENBQUMsTUFBTSxJQUFJLENBQUM7Z0NBQzNDLE9BQU8sRUFBRSxjQUFjO2dDQUN2QixRQUFRLEVBQUU7b0NBQ1IsZUFBZSxFQUFFLENBQUMsQ0FBQyxFQUFFO29DQUNyQixlQUFlLEVBQUUsV0FBVyxDQUFDLEVBQUU7b0NBQy9CLFVBQVUsRUFBRSxDQUFDLENBQUMsVUFBVSxJQUFJLFdBQVcsQ0FBQyxVQUFVLElBQUksQ0FBQztvQ0FDdkQsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLElBQUksV0FBVyxDQUFDLFVBQVUsSUFBSSxDQUFDLENBQUMsR0FBRyxrQkFBa0IsQ0FBQztvQ0FDakcsYUFBYSxFQUFFLGVBQWU7b0NBQzlCLFNBQVMsRUFBRSxDQUFDLENBQUMsY0FBYyxJQUFJLFdBQVcsQ0FBQyxjQUFjLElBQUksQ0FBQztvQ0FDOUQsVUFBVSxFQUFFLENBQUMsQ0FBQyxhQUFhLElBQUksQ0FBQztvQ0FDaEMsZUFBZSxFQUFFLENBQUMsQ0FBQyxpQkFBaUIsSUFBSSxDQUFDO2lDQUMxQzs2QkFDRixDQUFBO3dCQUNILENBQUMsQ0FBQyxDQUFBO3dCQUVGLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUE7d0JBQ3BHLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLFVBQVUsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQTtvQkFDN0QsQ0FBQztnQkFDSCxDQUFDO2dCQUFDLE9BQU8sQ0FBTSxFQUFFLENBQUM7b0JBQ2hCLE9BQU8sQ0FBQyxJQUFJLENBQUMsK0JBQStCLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFBO2dCQUMxRCxDQUFDO1lBQ0gsQ0FBQztZQUVELHlCQUF5QjtZQUN6QixNQUFNLFVBQVUsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFBO1lBRXhDLElBQUksVUFBVSxFQUFFLENBQUM7Z0JBQ2YsU0FBUztnQkFDVCxNQUFNLGNBQWMsQ0FBQyxjQUFjLENBQUMsVUFBVSxFQUFFO29CQUM5QyxLQUFLLEVBQUUsVUFBVSxDQUFDLEtBQUs7b0JBQ3ZCLFFBQVEsRUFBRSxVQUFVLENBQUMsUUFBUTtvQkFDN0IsV0FBVyxFQUFFLFVBQVUsQ0FBQyxXQUFXO29CQUNuQyxNQUFNLEVBQUUsVUFBVSxDQUFDLE1BQU07b0JBQ3pCLE1BQU0sRUFBRSxVQUFVLENBQUMsTUFBK0I7b0JBQ2xELE1BQU0sRUFBRSxVQUFVLENBQUMsTUFBTTtvQkFDekIsUUFBUSxFQUFFLFVBQVUsQ0FBQyxRQUFRO2lCQUM5QixDQUFDLENBQUE7Z0JBQ0YsT0FBTyxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsVUFBVSxHQUFHLENBQUMsQ0FBQTtZQUN4RCxDQUFDO2lCQUFNLENBQUM7Z0JBQ04seUVBQXlFO2dCQUN6RSxJQUFJLE1BQU0sR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFBO2dCQUM5QixJQUFJLE9BQU8sR0FBRyxDQUFDLENBQUE7Z0JBQ2YsT0FBTyxlQUFlLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7b0JBQ25DLE1BQU0sR0FBRyxHQUFHLFVBQVUsQ0FBQyxNQUFNLElBQUksT0FBTyxFQUFFLEVBQUUsQ0FBQTtnQkFDOUMsQ0FBQztnQkFDRCxVQUFVLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTtnQkFDMUIsZUFBZSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQTtnQkFFM0IsMERBQTBEO2dCQUMxRCxNQUFNLGNBQWMsR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFBO2dCQUN6QyxNQUFNLGVBQWUsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFBO2dCQUMzQyxPQUFPLFVBQVUsQ0FBQyxPQUFPLENBQUE7Z0JBRXpCLHdFQUF3RTtnQkFDeEUsVUFBVSxDQUFDLFFBQVEsR0FBRyxDQUFDO3dCQUNyQixLQUFLLEVBQUUsU0FBUzt3QkFDaEIsR0FBRyxFQUFHLFdBQVcsQ0FBQyxZQUF1QixJQUFJLFFBQVEsV0FBVyxDQUFDLEVBQUUsRUFBRTt3QkFDckUsZ0JBQWdCLEVBQUUsV0FBVyxDQUFDLFdBQVcsSUFBSSxLQUFLO3dCQUNsRCxlQUFlLEVBQUUsV0FBVyxDQUFDLHdCQUF3QixJQUFJLEtBQUs7d0JBQzlELFFBQVEsRUFBRSxFQUFFLGVBQWUsRUFBRSxXQUFXLENBQUMsRUFBRSxFQUFFO3FCQUM5QyxDQUFDLENBQUE7Z0JBRUYsTUFBTSxNQUFNLEdBQVEsTUFBTSxjQUFjLENBQUMsY0FBYyxDQUFDLFVBQWlCLENBQUMsQ0FBQTtnQkFDMUUsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQTtnQkFDaEUsT0FBTyxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsS0FBSyxHQUFHLENBQUMsQ0FBQTtnQkFFaEQsSUFBSSxLQUFLLEVBQUUsQ0FBQztvQkFDVixTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQTtvQkFFNUIsd0RBQXdEO29CQUN4RCxJQUFJLGNBQWMsSUFBSSxjQUFjLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxlQUFlLElBQUksZUFBZSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQzt3QkFDakcsSUFBSSxDQUFDOzRCQUNILGdDQUFnQzs0QkFDaEMsS0FBSyxNQUFNLEdBQUcsSUFBSSxjQUFjLEVBQUUsQ0FBQztnQ0FDakMsTUFBTSxjQUFjLENBQUMsb0JBQW9CLENBQUM7b0NBQ3hDLFVBQVUsRUFBRSxLQUFLO29DQUNqQixLQUFLLEVBQUUsR0FBRyxDQUFDLEtBQUs7b0NBQ2hCLE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTTtpQ0FDbkIsQ0FBQyxDQUFBOzRCQUNKLENBQUM7NEJBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsY0FBYyxDQUFDLE1BQU0sVUFBVSxDQUFDLENBQUE7NEJBRTVELDZCQUE2Qjs0QkFDN0IsTUFBTSxjQUFjLEdBQUcsTUFBTSxjQUFjLENBQUMsZUFBZSxDQUFDLEtBQUssRUFBRSxFQUFFLFNBQVMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQTs0QkFDL0YsSUFBSSxjQUFjLENBQUMsUUFBUSxFQUFFLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztnQ0FDeEMsTUFBTSxVQUFVLEdBQUcsY0FBYyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFNLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtnQ0FDaEUsTUFBTSxjQUFjLENBQUMscUJBQXFCLENBQUMsVUFBVSxDQUFDLENBQUE7NEJBQ3hELENBQUM7NEJBRUQsMENBQTBDOzRCQUMxQyxLQUFLLE1BQU0sT0FBTyxJQUFJLGVBQWUsRUFBRSxDQUFDO2dDQUN0QyxNQUFNLGNBQWMsQ0FBQyxxQkFBcUIsQ0FBQztvQ0FDekMsVUFBVSxFQUFFLEtBQUs7b0NBQ2pCLEtBQUssRUFBRSxPQUFPLENBQUMsS0FBSztvQ0FDcEIsR0FBRyxFQUFFLE9BQU8sQ0FBQyxHQUFHO29DQUNoQixPQUFPLEVBQUUsT0FBTyxDQUFDLE9BQU87b0NBQ3hCLGdCQUFnQixFQUFFLE9BQU8sQ0FBQyxnQkFBZ0I7b0NBQzFDLGVBQWUsRUFBRSxPQUFPLENBQUMsZUFBZTtvQ0FDeEMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNO29DQUN0QixPQUFPLEVBQUUsT0FBTyxDQUFDLE9BQU8sRUFBRSx1Q0FBdUM7b0NBQ2pFLFFBQVEsRUFBRSxPQUFPLENBQUMsUUFBUTtpQ0FDM0IsQ0FBQyxDQUFBOzRCQUNKLENBQUM7NEJBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsZUFBZSxDQUFDLE1BQU0sd0JBQXdCLENBQUMsQ0FBQTt3QkFDN0UsQ0FBQzt3QkFBQyxPQUFPLFFBQWEsRUFBRSxDQUFDOzRCQUN2QixPQUFPLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQTs0QkFDekUsT0FBTyxDQUFDLElBQUksQ0FBQyw0REFBNEQsQ0FBQyxDQUFBO3dCQUM1RSxDQUFDO29CQUNILENBQUM7Z0JBQ0gsQ0FBQztZQUNILENBQUM7WUFFRCxzQ0FBc0M7WUFDdEMsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQTtZQUN0QyxJQUFJLFFBQVEsSUFBSSxXQUFXLENBQUMsVUFBVSxJQUFJLE9BQU8sV0FBVyxDQUFDLFVBQVUsS0FBSyxRQUFRLEVBQUUsQ0FBQztnQkFDckYsTUFBTSxRQUFRLEdBQUcsZUFBZSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQTtnQkFDaEQsSUFBSSxRQUFRLEVBQUUsQ0FBQztvQkFDYixNQUFNLFNBQVMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUE7b0JBRXJDLHdDQUF3QztvQkFDeEMsSUFBSSxXQUFXLENBQUMsMEJBQTBCLEVBQUUsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO3dCQUN2RCxLQUFLLE1BQU0sWUFBWSxJQUFJLFdBQVcsQ0FBQywwQkFBMEIsRUFBRSxDQUFDOzRCQUNsRSxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLHNCQUFzQixDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQTt3QkFDL0QsQ0FBQztvQkFDSCxDQUFDO29CQUVELE1BQU0sY0FBYyxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUU7d0JBQzVDLFNBQVMsRUFBRSxRQUFRO3dCQUNuQixNQUFNLEVBQUUsU0FBUztxQkFDbEIsQ0FBQyxDQUFBO29CQUNGLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLFNBQVMsQ0FBQyxNQUFNLDRCQUE0QixDQUFDLENBQUE7Z0JBQzdFLENBQUM7WUFDSCxDQUFDO1lBRUQsdUNBQXVDO1lBQ3ZDLHlEQUF5RDtZQUN6RCxtRUFBbUU7WUFDbkUsSUFBSSxRQUFRLEVBQUUsQ0FBQztnQkFDYixJQUFJLENBQUM7b0JBQ0gsTUFBTSxXQUFXLEdBQUcsTUFBTSxjQUFjLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxFQUFFLFNBQVMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQTtvQkFDL0YsSUFBSSxZQUFZLEdBQUcsQ0FBQyxDQUFBO29CQUVwQixLQUFLLE1BQU0sT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDO3dCQUNuRCxNQUFNLFdBQVcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxRQUFRLElBQUksRUFBRSxDQUF3QixDQUFBO3dCQUNuRSxNQUFNLFdBQVcsR0FBRyxXQUFXLENBQUMsaUJBQWlCLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLFdBQVcsQ0FBQyxVQUFVLElBQUksQ0FBQyxDQUFDLEdBQUcsa0JBQWtCLENBQUMsQ0FBQTt3QkFDbkgsTUFBTSxRQUFRLEdBQUcsV0FBVyxDQUFDLGFBQWEsSUFBSSxlQUFlLENBQUE7d0JBRTdELGtEQUFrRDt3QkFDbEQsTUFBTSxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsR0FBRyxNQUFNLEtBQUssQ0FBQyxLQUFLLENBQUM7NEJBQ2hELE1BQU0sRUFBRSxpQkFBaUI7NEJBQ3pCLE1BQU0sRUFBRSxDQUFDLElBQUksRUFBRSxhQUFhLENBQUM7NEJBQzdCLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxPQUFPLENBQUMsRUFBRSxFQUFFO3lCQUM1QixDQUFDLENBQUE7d0JBRUYsSUFBSSxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLEVBQUUsQ0FBQzs0QkFDbEMsNEJBQTRCOzRCQUM1QixNQUFNLFVBQVUsR0FBRyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQTs0QkFDaEQsSUFBSSxDQUFDO2dDQUNILE1BQU0sY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO3dDQUM5QixVQUFVO3dDQUNWLE1BQU0sRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxhQUFhLEVBQUUsUUFBUSxFQUFFLENBQUM7cUNBQzNELENBQUMsQ0FBQyxDQUFBOzRCQUNMLENBQUM7NEJBQUMsTUFBTSxDQUFDLENBQUMsNkJBQTZCLENBQUMsQ0FBQzt3QkFDM0MsQ0FBQzs2QkFBTSxDQUFDOzRCQUNOLDJDQUEyQzs0QkFDM0MsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLE1BQU0sY0FBYyxDQUFDLGVBQWUsQ0FBQyxDQUFDO29DQUMxRCxNQUFNLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsYUFBYSxFQUFFLFFBQVEsRUFBRSxDQUFDO2lDQUMzRCxDQUFDLENBQUMsQ0FBQTs0QkFFSCxNQUFNLFVBQVUsQ0FBQyxNQUFNLENBQUM7Z0NBQ3RCLENBQUMsZUFBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsVUFBVSxFQUFFLE9BQU8sQ0FBQyxFQUFFLEVBQUU7Z0NBQzdDLENBQUMsZUFBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsWUFBWSxFQUFFLFdBQVcsQ0FBQyxFQUFFLEVBQUU7NkJBQ3BELENBQUMsQ0FBQTt3QkFDSixDQUFDO3dCQUNELFlBQVksRUFBRSxDQUFBO29CQUNoQixDQUFDO29CQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLFlBQVksMkJBQTJCLGVBQWUsQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUE7Z0JBQ3RHLENBQUM7Z0JBQUMsT0FBTyxVQUFlLEVBQUUsQ0FBQztvQkFDekIsT0FBTyxDQUFDLElBQUksQ0FBQyw0QkFBNEIsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUE7Z0JBQ2hFLENBQUM7WUFDSCxDQUFDO1lBRUQscUNBQXFDO1lBQ3JDLE9BQU8sQ0FBQyxHQUFHLENBQUMsNEJBQTRCLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU0sV0FBVyxDQUFDLENBQUE7WUFDM0YsTUFBTSxJQUFJLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQTtZQUNoQyxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsSUFBSSxDQUFDLEtBQUssSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFBO1lBQy9DLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLElBQUksQ0FBQyxrQkFBa0IsSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFBO1lBQy9ELE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxXQUFXLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxRQUFRLGNBQWMsSUFBSSxDQUFDLGFBQWEsV0FBVyxJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQTtZQUNoSSxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsSUFBSSxDQUFDLFVBQVUsaUJBQWlCLElBQUksQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFBO1lBQ2xGLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUE7WUFDMUgsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUE7WUFDckYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsSUFBSSxDQUFDLFNBQVMsSUFBSSxHQUFHLFVBQVUsSUFBSSxDQUFDLGVBQWUsSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFBO1lBQzVGLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUN2RSxPQUFPLENBQUMsR0FBRyxDQUFDLHVCQUF1QixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUM3RSxPQUFPLENBQUMsR0FBRyxDQUFDLHlCQUF5QixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUNqRixPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsSUFBSSxDQUFDLElBQUksRUFBRSxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQTtZQUMvRSxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixJQUFJLENBQUMsT0FBTyxFQUFFLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFBO1lBQ2hILE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLElBQUksQ0FBQyxNQUFNLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQTtZQUNqRCxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixJQUFJLENBQUMsTUFBTSxPQUFPLElBQUksQ0FBQyxhQUFhLFdBQVcsQ0FBQyxDQUFBO1lBQzVFLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFBO1lBQ25ELE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUMxRSxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQTtZQUNoRCxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQTtRQUVsRCxDQUFDO1FBQUMsT0FBTyxLQUFVLEVBQUUsQ0FBQztZQUNwQixPQUFPLENBQUMsS0FBSyxDQUFDLDZCQUE2QixNQUFNLEtBQUssS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUE7WUFDdEUsSUFBSSxLQUFLLENBQUMsS0FBSztnQkFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUE7UUFDaEYsQ0FBQztJQUNILENBQUM7SUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7SUFDbEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFBO0lBQ3JDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQTtBQUNwQyxDQUFDIn0=
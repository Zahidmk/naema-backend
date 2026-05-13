"use strict";
/**
 * Diagnostic Script — Fetch 2 test products from Odoo and dump ALL fields
 *
 * Usage: npx medusa exec ./src/scripts/debug-odoo-products.ts
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = debugOdooProducts;
const service_1 = __importStar(require("../modules/odoo-sync/service"));
async function debugOdooProducts({ container }) {
    console.log("\n" + "═".repeat(70));
    console.log("  🔍 ODOO PRODUCT FIELD DIAGNOSTIC");
    console.log("═".repeat(70));
    const odoo = new service_1.default();
    if (!odoo.isConfigured()) {
        console.error("❌ Odoo not configured");
        return;
    }
    const authOk = await odoo.authenticate();
    if (!authOk) {
        console.error("❌ Odoo auth failed");
        return;
    }
    // Search for the two test products
    const searchTerms = ["Samsung Galaxy S25 Ultra", "Marshall Minor III"];
    for (const term of searchTerms) {
        console.log(`\n${"─".repeat(70)}`);
        console.log(`  🔎 Searching: "${term}"`);
        console.log("─".repeat(70));
        try {
            // Use direct search_read via JSON-RPC through the service's fetchProducts
            // We'll search by name containing our term
            const allProducts = await odoo.fetchProducts(5, 0);
            // Also do a targeted search
            // Since fetchProducts filters by sale_ok=true, let's also try fetchProductById approach
            // But we need the ID first. Let's search differently.
            // Actually let me authenticate and use raw JSON-RPC to search by name
            const axios = require("axios");
            const url = process.env.ODOO_URL || "";
            const db = process.env.ODOO_DB_NAME || "";
            const username = process.env.ODOO_USERNAME || "";
            const password = process.env.ODOO_PASSWORD || process.env.ODOO_API_KEY || "";
            // Search for product by name
            const searchResult = await axios.post(`${url}/jsonrpc`, {
                jsonrpc: "2.0",
                method: "call",
                params: {
                    service: "object",
                    method: "execute_kw",
                    args: [
                        db,
                        2, // we need UID; let's authenticate first
                        password,
                        "product.template",
                        "search_read",
                        [[["name", "ilike", term]]],
                        {
                            fields: [...service_1.ODOO_PRODUCT_TEMPLATE_FIELDS],
                            limit: 1,
                        },
                    ],
                },
                id: Date.now(),
            });
            // Try with the authenticated UID
            const authResult = await axios.post(`${url}/jsonrpc`, {
                jsonrpc: "2.0",
                method: "call",
                params: {
                    service: "common",
                    method: "authenticate",
                    args: [db, username, password, {}],
                },
                id: Date.now(),
            });
            const uid = authResult.data.result;
            if (!uid) {
                console.error("  ❌ Auth failed for raw query");
                continue;
            }
            const productResult = await axios.post(`${url}/jsonrpc`, {
                jsonrpc: "2.0",
                method: "call",
                params: {
                    service: "object",
                    method: "execute_kw",
                    args: [
                        db,
                        uid,
                        password,
                        "product.template",
                        "search_read",
                        [[["name", "ilike", term]]],
                        {
                            fields: [...service_1.ODOO_PRODUCT_TEMPLATE_FIELDS],
                            limit: 1,
                        },
                    ],
                },
                id: Date.now(),
            });
            if (productResult.data.error) {
                console.error("  ❌ Odoo error:", productResult.data.error.message || JSON.stringify(productResult.data.error.data));
                // If there's a field error, try to identify which field is invalid
                const errorMsg = JSON.stringify(productResult.data.error);
                console.log("\n  📋 Error details:");
                console.log("  ", errorMsg.substring(0, 500));
                continue;
            }
            const products = productResult.data.result || [];
            if (products.length === 0) {
                console.log(`  ⚠️  No product found matching "${term}"`);
                continue;
            }
            const product = products[0];
            console.log(`\n  ✅ Found: "${product.name}" (ID: ${product.id})`);
            console.log(`  📋 Total fields received: ${Object.keys(product).length}`);
            // Print ALL fields grouped by category
            console.log("\n  ── CORE ──");
            console.log(`    name:          ${product.name}`);
            console.log(`    default_code:  ${product.default_code}`);
            console.log(`    barcode:       ${product.barcode}`);
            console.log(`    type:          ${product.type}`);
            console.log(`    active:        ${product.active}`);
            console.log(`    sequence:      ${product.sequence}`);
            console.log(`    is_favorite:   ${product.is_favorite}`);
            console.log("\n  ── PRICES ──");
            console.log(`    list_price:         ${product.list_price}`);
            console.log(`    standard_price:     ${product.standard_price}`);
            console.log(`    compare_list_price: ${product.compare_list_price}`);
            console.log(`    retail_price:       ${product.retail_price}`);
            console.log(`    currency_id:        ${JSON.stringify(product.currency_id)}`);
            console.log("\n  ── DESCRIPTIONS ──");
            console.log(`    description:          ${product.description ? String(product.description).substring(0, 80) : false}`);
            console.log(`    description_sale:     ${product.description_sale ? String(product.description_sale).substring(0, 80) : false}`);
            console.log(`    description_ecommerce: ${product.description_ecommerce ? String(product.description_ecommerce).substring(0, 80) : false}`);
            console.log("\n  ── BRAND & CATEGORY ──");
            console.log(`    brand_id:            ${JSON.stringify(product.brand_id)}`);
            console.log(`    categ_id:            ${JSON.stringify(product.categ_id)}`);
            console.log(`    public_categ_ids:    ${JSON.stringify(product.public_categ_ids)}`);
            console.log(`    x_studio_brand_1:    ${product.x_studio_brand_1}`);
            console.log(`    x_studio_sub_category: ${product.x_studio_sub_category}`);
            console.log("\n  ── INVENTORY & LOGISTICS ──");
            console.log(`    qty_available:       ${product.qty_available}`);
            console.log(`    virtual_available:   ${product.virtual_available}`);
            console.log(`    incoming_qty:        ${product.incoming_qty}`);
            console.log(`    outgoing_qty:        ${product.outgoing_qty}`);
            console.log(`    is_storable:         ${product.is_storable}`);
            console.log(`    weight:              ${product.weight}`);
            console.log(`    volume:              ${product.volume}`);
            console.log(`    weight_uom_name:     ${product.weight_uom_name}`);
            console.log(`    volume_uom_name:     ${product.volume_uom_name}`);
            console.log(`    hs_code:             ${product.hs_code}`);
            console.log(`    country_of_origin:   ${JSON.stringify(product.country_of_origin)}`);
            console.log(`    sale_delay:          ${product.sale_delay}`);
            console.log(`    allow_out_of_stock_order: ${product.allow_out_of_stock_order}`);
            console.log(`    out_of_stock_message: ${product.out_of_stock_message}`);
            console.log(`    show_availability:   ${product.show_availability}`);
            console.log(`    available_threshold: ${product.available_threshold}`);
            console.log(`    uom_id:             ${JSON.stringify(product.uom_id)}`);
            console.log(`    uom_name:           ${product.uom_name}`);
            console.log("\n  ── IMAGES ──");
            console.log(`    image_1920:          ${product.image_1920 ? `[base64 ${String(product.image_1920).length} chars]` : false}`);
            console.log(`    product_template_image_ids: ${JSON.stringify(product.product_template_image_ids)}`);
            console.log(`    can_image_1024_be_zoomed:  ${product.can_image_1024_be_zoomed}`);
            console.log("\n  ── VARIANTS & ATTRIBUTES ──");
            console.log(`    attribute_line_ids:        ${JSON.stringify(product.attribute_line_ids)}`);
            console.log(`    product_variant_ids:       ${JSON.stringify(product.product_variant_ids)}`);
            console.log(`    product_variant_count:     ${product.product_variant_count}`);
            console.log(`    has_configurable_attributes: ${product.has_configurable_attributes}`);
            console.log("\n  ── SEO & WEBSITE ──");
            console.log(`    seo_name:            ${product.seo_name}`);
            console.log(`    website_meta_title:  ${product.website_meta_title}`);
            console.log(`    website_meta_description: ${product.website_meta_description}`);
            console.log(`    website_meta_keywords: ${product.website_meta_keywords}`);
            console.log(`    website_meta_og_img: ${product.website_meta_og_img}`);
            console.log(`    is_published:        ${product.is_published}`);
            console.log(`    website_url:         ${product.website_url}`);
            console.log(`    website_sequence:    ${product.website_sequence}`);
            console.log(`    website_ribbon_id:   ${JSON.stringify(product.website_ribbon_id)}`);
            console.log(`    product_tag_ids:     ${JSON.stringify(product.product_tag_ids)}`);
            console.log("\n  ── SALES & CROSS-SELL ──");
            console.log(`    optional_product_ids:    ${JSON.stringify(product.optional_product_ids)}`);
            console.log(`    accessory_product_ids:   ${JSON.stringify(product.accessory_product_ids)}`);
            console.log(`    alternative_product_ids: ${JSON.stringify(product.alternative_product_ids)}`);
            console.log(`    sales_count:             ${product.sales_count}`);
            console.log(`    combo_ids:               ${JSON.stringify(product.combo_ids)}`);
            console.log(`    sale_ok:                 ${product.sale_ok}`);
            console.log(`    purchase_ok:             ${product.purchase_ok}`);
            console.log("\n  ── RATINGS ──");
            console.log(`    rating_avg:          ${product.rating_avg}`);
            console.log(`    rating_count:        ${product.rating_count}`);
            console.log(`    rating_percentage_satisfaction: ${product.rating_percentage_satisfaction}`);
            console.log(`    rating_last_feedback: ${product.rating_last_feedback}`);
            console.log(`    rating_last_value:   ${product.rating_last_value}`);
            console.log("\n  ── VENDORS ──");
            console.log(`    seller_ids:          ${JSON.stringify(product.seller_ids)}`);
            console.log("\n  ── TIMESTAMPS ──");
            console.log(`    create_date:         ${product.create_date}`);
            console.log(`    write_date:          ${product.write_date}`);
            // Now test convertToMedusaProduct
            console.log("\n  ── MEDUSA CONVERSION TEST ──");
            const medusa = odoo.convertToMedusaProduct(product);
            console.log(`    title:       ${medusa.title}`);
            console.log(`    subtitle:    ${medusa.subtitle}`);
            console.log(`    handle:      ${medusa.handle}`);
            console.log(`    status:      ${medusa.status}`);
            console.log(`    weight:      ${medusa.weight}`);
            console.log(`    description: ${medusa.description ? String(medusa.description).substring(0, 80) : null}`);
            console.log(`\n    metadata fields: ${Object.keys(medusa.metadata).length}`);
            // Print all metadata keys and values
            for (const [key, val] of Object.entries(medusa.metadata)) {
                const display = val === null ? "null"
                    : Array.isArray(val) ? `[${val.length} items]`
                        : typeof val === "string" && val.length > 60 ? val.substring(0, 60) + "..."
                            : String(val);
                console.log(`      ${key}: ${display}`);
            }
            // Check for any fields returned by Odoo that we DON'T have in our fields list
            const ourFields = new Set([...service_1.ODOO_PRODUCT_TEMPLATE_FIELDS]);
            const odooFields = Object.keys(product);
            const unmappedFields = odooFields.filter(f => !ourFields.has(f));
            if (unmappedFields.length > 0) {
                console.log(`\n  ⚠️  UNMAPPED FIELDS (returned by Odoo but not in our list): ${unmappedFields.join(", ")}`);
            }
            // Also fetch variants if they exist
            if (product.product_variant_count > 1) {
                console.log(`\n  ── VARIANTS (${product.product_variant_count}) ──`);
                try {
                    const variants = await odoo.fetchVariantsByTemplate(product.id);
                    for (const v of variants) {
                        console.log(`    Variant ID ${v.id}: "${v.display_name}" SKU=${v.default_code} Price=${v.list_price} Qty=${v.qty_available}`);
                    }
                }
                catch (e) {
                    console.warn(`    ⚠️ Variant fetch failed: ${e.message}`);
                }
            }
            // Fetch attribute lines
            if (product.attribute_line_ids?.length > 0) {
                console.log(`\n  ── ATTRIBUTE LINES ──`);
                try {
                    const attrLines = await odoo.fetchAttributeLines(product.attribute_line_ids);
                    for (const al of attrLines) {
                        const attrName = al.attribute_id ? al.attribute_id[1] : "?";
                        const values = await odoo.fetchAttributeValues(al.value_ids);
                        const valueNames = values.map(v => `${v.name}${v.html_color ? ` (${v.html_color})` : ""}`).join(", ");
                        console.log(`    ${attrName}: ${valueNames}`);
                    }
                }
                catch (e) {
                    console.warn(`    ⚠️ Attribute fetch failed: ${e.message}`);
                }
            }
            // Fetch gallery images
            if (product.product_template_image_ids?.length > 0) {
                console.log(`\n  ── GALLERY IMAGES (${product.product_template_image_ids.length}) ──`);
                try {
                    const images = await odoo.fetchProductImages(product.product_template_image_ids);
                    for (const img of images) {
                        console.log(`    Image ${img.id}: "${img.name}" seq=${img.sequence} [${img.image_1920 ? `${String(img.image_1920).length} chars` : "no data"}]`);
                    }
                }
                catch (e) {
                    console.warn(`    ⚠️ Image fetch failed: ${e.message}`);
                }
            }
            // Fetch tags
            if (product.product_tag_ids?.length > 0) {
                console.log(`\n  ── TAGS ──`);
                try {
                    const tags = await odoo.fetchTags(product.product_tag_ids);
                    for (const t of tags)
                        console.log(`    Tag: "${t.name}" (color: ${t.color})`);
                }
                catch (e) {
                    console.warn(`    ⚠️ Tag fetch failed: ${e.message}`);
                }
            }
            // Fetch vendors
            if (product.seller_ids?.length > 0) {
                console.log(`\n  ── VENDORS ──`);
                try {
                    const vendors = await odoo.fetchVendors(product.seller_ids);
                    for (const v of vendors) {
                        const name = v.partner_id ? v.partner_id[1] : "Unknown";
                        const curr = v.currency_id ? v.currency_id[1] : "?";
                        console.log(`    ${name}: ${v.price} ${curr}, lead ${v.delay} days, min qty ${v.min_qty}`);
                    }
                }
                catch (e) {
                    console.warn(`    ⚠️ Vendor fetch failed: ${e.message}`);
                }
            }
        }
        catch (error) {
            console.error(`  ❌ Error: ${error.message}`);
            // Show the full error for debugging
            if (error.response?.data?.error) {
                const errData = error.response.data.error;
                console.error(`  Error type: ${errData.message}`);
                if (errData.data?.message) {
                    console.error(`  Detail: ${errData.data.message}`);
                }
            }
        }
    }
    console.log("\n" + "═".repeat(70));
    console.log("  ✅ DIAGNOSTIC COMPLETE");
    console.log("═".repeat(70) + "\n");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWctb2Rvby1wcm9kdWN0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL2RlYnVnLW9kb28tcHJvZHVjdHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0dBSUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBS0gsb0NBMlVDO0FBN1VELHdFQUE0RjtBQUU3RSxLQUFLLFVBQVUsaUJBQWlCLENBQUMsRUFBRSxTQUFTLEVBQVk7SUFDckUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO0lBQ2xDLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0NBQW9DLENBQUMsQ0FBQTtJQUNqRCxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtJQUUzQixNQUFNLElBQUksR0FBRyxJQUFJLGlCQUFlLEVBQUUsQ0FBQTtJQUNsQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxFQUFFLENBQUM7UUFDekIsT0FBTyxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxDQUFBO1FBQ3RDLE9BQU07SUFDUixDQUFDO0lBRUQsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUE7SUFDeEMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ1osT0FBTyxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxDQUFBO1FBQ25DLE9BQU07SUFDUixDQUFDO0lBRUQsbUNBQW1DO0lBQ25DLE1BQU0sV0FBVyxHQUFHLENBQUMsMEJBQTBCLEVBQUUsb0JBQW9CLENBQUMsQ0FBQTtJQUV0RSxLQUFLLE1BQU0sSUFBSSxJQUFJLFdBQVcsRUFBRSxDQUFDO1FBQy9CLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLENBQUMsTUFBTSxDQUFD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
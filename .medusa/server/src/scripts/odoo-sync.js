"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = odooSync;
const utils_1 = require("@medusajs/framework/utils");
const axios_1 = __importDefault(require("axios"));
/**
 * Odoo -> MedusaJS Full Product Sync (v3)
 *
 * Run: npx medusa exec src/scripts/odoo-sync.ts
 *   or: npm run sync:odoo
 *
 * Features:
 * - Paginates through ALL Odoo products (supports 6000+)
 * - Uses raw SQL for fast bulk inserts
 * - Upserts: creates new, updates existing (matched by odoo_id or SKU)
 * - Copies prices, images, assigns sales channel
 *
 * @version 3.0 - March 2026
 */
const PAGE_SIZE = 200;
const CURRENCY = "aed";
function genId(prefix) {
    const c = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
    let id = prefix + "_";
    for (let i = 0; i < 26; i++)
        id += c[Math.floor(Math.random() * c.length)];
    return id;
}
function slugify(text) {
    return text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/(^-|-$)/g, "").substring(0, 100);
}
/**
 * Maps an Odoo category path (e.g. "All / Saleable / Power Bank / Magsafe")
 * to the corresponding Medusa category handle.
 * Order matters: more specific paths checked first.
 */
function odooCategoryToHandle(odooCategory) {
    if (!odooCategory)
        return null;
    const cat = odooCategory.toLowerCase();
    if (cat.includes("power station"))
        return "powerbank";
    if (cat.includes("power bank"))
        return "powerbank";
    if (cat.includes("powerbank"))
        return "powerbank";
    if (cat.includes("projector"))
        return "projectors";
    if (cat.includes("gaming / monitor"))
        return "gaming";
    if (cat.includes("gaming / console"))
        return "gaming";
    if (cat.includes("gaming / mouse"))
        return "gaming";
    if (cat.includes("gaming / headset"))
        return "gaming";
    if (cat.includes("gaming / mic"))
        return "gaming";
    if (cat.includes("gaming / speaker"))
        return "gaming";
    if (cat.includes("gaming"))
        return "gaming";
    if (cat.includes("earphone"))
        return "tws-headphone";
    if (cat.includes("headset"))
        return "tws-headphone";
    if (cat.includes("headphone"))
        return "tws-headphone";
    if (cat.includes("fm transmit"))
        return "fm-transmitter";
    if (cat.includes("cable"))
        return "cables";
    if (cat.includes("hub"))
        return "hubs";
    if (cat.includes("power socket"))
        return "power-socket";
    if (cat.includes("tablet"))
        return "mobiletablet";
    if (cat.includes("smart watch"))
        return "smart-watch";
    if (cat.includes("watch band"))
        return "smart-watch-loops";
    if (cat.includes("lifestyle"))
        return "lifestyle";
    if (cat.includes("holder"))
        return "mobile-stand";
    if (cat.includes("stand"))
        return "mobile-stand";
    if (cat.includes("speaker"))
        return "speakers";
    if (cat.includes("charger"))
        return "chargers";
    if (cat.includes("car charger"))
        return "car-charger";
    if (cat.includes("car mount"))
        return "car-mount";
    if (cat.includes("magsafe"))
        return "magsafe";
    if (cat.includes("screen protector"))
        return "screen-protector";
    if (cat.includes("case"))
        return "cases";
    return null;
}
async function odooSync({ container }) {
    console.log("\n\ud83d\udd04 Odoo -> MedusaJS Full Sync v3");
    console.log("=".repeat(55));
    const odooUrl = process.env.ODOO_URL || "";
    const odooDb = process.env.ODOO_DB_NAME || "";
    const odooUsername = process.env.ODOO_USERNAME || "";
    const odooPassword = process.env.ODOO_PASSWORD || process.env.ODOO_API_KEY || "";
    if (!odooUrl || !odooDb || !odooUsername || !odooPassword) {
        console.error("Missing ODOO_URL, ODOO_DB_NAME, ODOO_USERNAME, ODOO_PASSWORD in .env");
        return;
    }
    console.log(`Odoo: ${odooUrl}  DB: ${odooDb}  User: ${odooUsername}`);
    // 1. Authenticate
    console.log("\n1. Authenticating...");
    let uid;
    try {
        const r = await axios_1.default.post(`${odooUrl}/jsonrpc`, {
            jsonrpc: "2.0", method: "call",
            params: { service: "common", method: "authenticate", args: [odooDb, odooUsername, odooPassword, {}] },
            id: 1,
        }, { timeout: 15000 });
        uid = r.data.result;
        if (!uid) {
            console.error("Authentication failed - Odoo returned:", uid);
            console.error("Ask Odoo developer to verify credentials / API key");
            return;
        }
        console.log(`Authenticated (UID: ${uid})`);
    }
    catch (e) {
        console.error("Auth failed:", e.message);
        return;
    }
    let reqId = 1;
    async function odooCall(model, method, args, kwargs = {}) {
        const r = await axios_1.default.post(`${odooUrl}/jsonrpc`, {
            jsonrpc: "2.0", method: "call",
            params: { service: "object", method: "execute_kw", args: [odooDb, uid, odooPassword, model, method, args, kwargs] },
            id: ++reqId,
        }, { timeout: 120000 });
        if (r.data.error)
            throw new Error(r.data.error.message || r.data.error.data?.message || "Odoo error");
        return r.data.result;
    }
    // 2. Count products
    console.log("\n2. Counting Odoo products...");
    const totalCount = await odooCall("product.template", "search_count", [[["active", "=", true], ["sale_ok", "=", true]]]);
    console.log(`Total active saleable products in Odoo: ${totalCount}`);
    // 3. Fetch ALL products
    console.log(`\n3. Fetching products (page size: ${PAGE_SIZE})...`);
    const fields = [
        "id", "name", "default_code", "barcode",
        "list_price", "compare_list_price",
        "description_sale", "categ_id", "brand_id", "x_studio_brand_1",
        "weight", "qty_available", "is_published", "website_url",
    ];
    const allProducts = [];
    let offset = 0;
    while (offset < totalCount) {
        const batch = await odooCall("product.template", "search_read", [[["active", "=", true], ["sale_ok", "=", true]]], { fields, limit: PAGE_SIZE, offset, order: "id asc" });
        allProducts.push(...batch);
        offset += PAGE_SIZE;
        if (offset < totalCount)
            process.stdout.write(`  Fetched ${allProducts.length}/${totalCount}...\r`);
    }
    console.log(`Fetched ${allProducts.length} products from Odoo`);
    // 4. Prepare MedusaJS DB
    const pg = container.resolve(utils_1.ContainerRegistrationKeys.PG_CONNECTION);
    const existRes = await pg.raw(`SELECT id, handle, metadata->>'odoo_id' as odoo_id FROM product WHERE deleted_at IS NULL`);
    const existingByOdooId = new Map();
    const existingHandles = new Set();
    for (const row of existRes.rows || []) {
        if (row.odoo_id)
            existingByOdooId.set(String(row.odoo_id), { id: row.id, handle: row.handle });
        existingHandles.add(row.handle);
    }
    const skuRes = await pg.raw(`SELECT pv.sku, p.id as product_id FROM product_variant pv JOIN product p ON p.id = pv.product_id WHERE pv.sku IS NOT NULL AND pv.sku != '' AND p.deleted_at IS NULL AND pv.deleted_at IS NULL`);
    const existingBySku = new Map();
    for (const row of skuRes.rows || [])
        existingBySku.set(row.sku.trim(), row.product_id);
    const scRes = await pg.raw(`SELECT id FROM sales_channel WHERE deleted_at IS NULL LIMIT 1`);
    const salesChannelId = scRes.rows?.[0]?.id || null;
    console.log(`Existing in MedusaJS: ${existRes.rows?.length || 0} products`);
    console.log(`Sales Channel: ${salesChannelId}`);
    // Load all Medusa categories into a handle->id map for fast lookup
    const catRes = await pg.raw(`SELECT id, handle FROM product_category WHERE deleted_at IS NULL`);
    const categoryByHandle = new Map();
    for (const row of catRes.rows || [])
        categoryByHandle.set(row.handle, row.id);
    // 5. Sync
    console.log(`\n4. Syncing ${allProducts.length} products...`);
    let created = 0, updated = 0, errors = 0;
    for (let i = 0; i < allProducts.length; i++) {
        const p = allProducts[i];
        const sku = (p.default_code || `ODOO-${p.id}`).toString().trim();
        const odooIdStr = String(p.id);
        try {
            const brand = p.brand_id && Array.isArray(p.brand_id) ? p.brand_id[1]
                : (p.x_studio_brand_1 || null);
            const category = p.categ_id && Array.isArray(p.categ_id) ? p.categ_id[1] : null;
            const status = p.is_published === false ? "draft" : "published";
            const metadata = JSON.stringify({
                odoo_id: p.id, odoo_sku: sku, odoo_barcode: p.barcode || null,
                odoo_category: category, odoo_brand: brand,
                odoo_qty: p.qty_available || 0, synced_at: new Date().toISOString(),
            });
            const imageUrl = p.website_url ? `${odooUrl}/web/image/product.template/${p.id}/image_1920` : null;
            const existingByOdoo = existingByOdooId.get(odooIdStr);
            const existingProdId = existingByOdoo?.id || existingBySku.get(sku);
            if (existingProdId) {
                await pg.raw(`UPDATE product SET title=?, description=?, status=?, weight=?, metadata=?, thumbnail=COALESCE(?,thumbnail), updated_at=NOW() WHERE id=?`, [p.name, p.description_sale || "", status, p.weight ? String(p.weight) : null, metadata, imageUrl, existingProdId]);
                const vr = await pg.raw(`SELECT pvps.price_set_id FROM product_variant pv JOIN product_variant_price_set pvps ON pvps.variant_id=pv.id WHERE pv.product_id=? AND pv.deleted_at IS NULL LIMIT 1`, [existingProdId]);
                if (vr.rows?.length > 0 && p.list_price > 0) {
                    const rawAmt = JSON.stringify({ value: String(p.list_price), precision: 20 });
                    await pg.raw(`UPDATE price SET amount=?, raw_amount=?, updated_at=NOW() WHERE price_set_id=? AND deleted_at IS NULL`, [p.list_price, rawAmt, vr.rows[0].price_set_id]);
                }
                // Assign category from Odoo category path
                const catHandle = odooCategoryToHandle(category);
                const catId = catHandle ? categoryByHandle.get(catHandle) : null;
                if (catId) {
                    await pg.raw(`INSERT INTO product_category_product (product_id, product_category_id) VALUES (?, ?) ON CONFLICT DO NOTHING`, [existingProdId, catId]);
                }
                updated++;
            }
            else {
                let handle = slugify(p.name) || `odoo-${p.id}`;
                if (existingHandles.has(handle))
                    handle = `${handle}-${p.id}`;
                if (existingHandles.has(handle))
                    handle = `${handle}-${Date.now().toString(36)}`;
                existingHandles.add(handle);
                const productId = genId("prod");
                await pg.raw(`INSERT INTO product (id,title,handle,description,thumbnail,status,weight,metadata,discountable,is_giftcard,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,true,false,NOW(),NOW())`, [productId, p.name, handle, p.description_sale || "", imageUrl, status, p.weight ? String(p.weight) : null, metadata]);
                const variantId = genId("variant");
                await pg.raw(`INSERT INTO product_variant (id,product_id,title,sku,barcode,manage_inventory,allow_backorder,variant_rank,created_at,updated_at) VALUES (?,?,'Default',?,?,true,false,0,NOW(),NOW())`, [variantId, productId, sku, p.barcode || null]);
                if (p.list_price > 0) {
                    const psid = genId("pset");
                    await pg.raw(`INSERT INTO price_set (id,created_at,updated_at) VALUES (?,NOW(),NOW())`, [psid]);
                    await pg.raw(`INSERT INTO product_variant_price_set (id,variant_id,price_set_id,created_at,updated_at) VALUES (?,?,?,NOW(),NOW())`, [genId("pvps"), variantId, psid]);
                    const rawAmt = JSON.stringify({ value: String(p.list_price), precision: 20 });
                    await pg.raw(`INSERT INTO price (id,price_set_id,currency_code,amount,raw_amount,rules_count,created_at,updated_at) VALUES (?,?,?,?,?,0,NOW(),NOW())`, [genId("price"), psid, CURRENCY, p.list_price, rawAmt]);
                }
                if (imageUrl) {
                    await pg.raw(`INSERT INTO image (id,url,rank,product_id,created_at,updated_at) VALUES (?,?,0,?,NOW(),NOW())`, [genId("img"), imageUrl, productId]);
                }
                if (salesChannelId) {
                    try {
                        await pg.raw(`INSERT INTO product_sales_channel (id,product_id,sales_channel_id,created_at,updated_at) VALUES (?,?,?,NOW(),NOW()) ON CONFLICT (product_id,sales_channel_id) DO NOTHING`, [genId("psc"), productId, salesChannelId]);
                    }
                    catch { }
                }
                // Assign category from Odoo category path
                const catHandle = odooCategoryToHandle(category);
                const catId = catHandle ? categoryByHandle.get(catHandle) : null;
                if (catId) {
                    await pg.raw(`INSERT INTO product_category_product (product_id, product_category_id) VALUES (?, ?) ON CONFLICT DO NOTHING`, [productId, catId]);
                }
                existingByOdooId.set(odooIdStr, { id: productId, handle });
                existingBySku.set(sku, productId);
                created++;
            }
            if ((created + updated) % 100 === 0 || i === allProducts.length - 1) {
                process.stdout.write(`  Progress: ${i + 1}/${allProducts.length} (created: ${created}, updated: ${updated})\r`);
            }
        }
        catch (err) {
            errors++;
            if (errors <= 15)
                console.error(`\n  Error [${sku}] ${err.message}`);
        }
    }
    const finalRes = await pg.raw(`SELECT COUNT(*) as c FROM product WHERE status='published' AND deleted_at IS NULL`);
    console.log(`\n\n${"=".repeat(55)}`);
    console.log("SYNC SUMMARY");
    console.log(`${"=".repeat(55)}`);
    console.log(`Created:  ${created}`);
    console.log(`Updated:  ${updated}`);
    console.log(`Errors:   ${errors}`);
    console.log(`Odoo total:      ${allProducts.length}`);
    console.log(`MedusaJS total:  ${finalRes.rows?.[0]?.c || "?"}`);
    console.log("=".repeat(55));
    console.log("Sync complete!\n");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2Rvby1zeW5jLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvb2Rvby1zeW5jLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBNkVBLDJCQW1PQztBQS9TRCxxREFBcUU7QUFDckUsa0RBQXlCO0FBRXpCOzs7Ozs7Ozs7Ozs7O0dBYUc7QUFFSCxNQUFNLFNBQVMsR0FBRyxHQUFHLENBQUE7QUFDckIsTUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFBO0FBRXRCLFNBQVMsS0FBSyxDQUFDLE1BQWM7SUFDM0IsTUFBTSxDQUFDLEdBQUcsa0NBQWtDLENBQUE7SUFDNUMsSUFBSSxFQUFFLEdBQUcsTUFBTSxHQUFHLEdBQUcsQ0FBQTtJQUNyQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRTtRQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7SUFDMUUsT0FBTyxFQUFFLENBQUE7QUFDWCxDQUFDO0FBRUQsU0FBUyxPQUFPLENBQUMsSUFBWTtJQUMzQixPQUFPLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFBO0FBQ3ZILENBQUM7QUFFRDs7OztHQUlHO0FBQ0gsU0FBUyxvQkFBb0IsQ0FBQyxZQUEyQjtJQUN2RCxJQUFJLENBQUMsWUFBWTtRQUFFLE9BQU8sSUFBSSxDQUFBO0lBQzlCLE1BQU0sR0FBRyxHQUFHLFlBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQTtJQUV0QyxJQUFJ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
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = exports.POST = void 0;
const utils_1 = require("@medusajs/framework/utils");
/**
 * POST /odoo/webhooks/products
 *
 * SELF-CONTAINED webhook - Odoo pushes ALL product data directly.
 * No callback to Odoo needed. Works even if Odoo credentials change.
 *
 * Images use direct Odoo URLs instead of downloading/storing locally.
 *
 * Supports single + bulk operations.
 */
const WEBHOOK_SECRET = process.env.ODOO_WEBHOOK_SECRET || "marqa-odoo-webhook-2026";
const ODOO_BASE_URL = process.env.ODOO_URL || "https://oskarllc-new-27289548.dev.odoo.com";
function slugify(text) {
    return text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/(^-|-$)/g, "").substring(0, 100);
}
function genId(prefix) {
    const c = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
    let id = prefix + "_";
    for (let i = 0; i < 26; i++)
        id += c[Math.floor(Math.random() * c.length)];
    return id;
}
/**
 * Maps an Odoo category path to Medusa category handle
 * PERMANENT SOLUTION: Uses hierarchical matching + ALL 373 Odoo categories
 *
 * Examples:
 *   "Gaming / Monitor" → finds or creates "gaming"
 *   "Mobile / Tablet / Powerbanks / Magsafe" → finds or creates "magsafe"
 *   "Electronics / Audio / Headphones" → finds or creates "headphones"
 */
function odooCategoryToHandle(odooCategory) {
    if (!odooCategory)
        return null;
    const cat = odooCategory.toLowerCase().trim();
    const parts = cat.split("/").map(p => p.trim()).filter(p => p.length > 0);
    // Extract the LAST meaningful category (most specific)
    // "Mobile / Tablet / Powerbanks / Magsafe" → use "magsafe"
    const lastPart = parts.length > 0 ? parts[parts.length - 1] : null;
    if (!lastPart)
        return null;
    // Smart keyword matching on final category level
    const keywords = {
        "power station": "powerbank",
        "power bank": "powerbank",
        "powerbank": "powerbank",
        "projector": "projectors",
        "gaming monitor": "gaming",
        "gaming console": "gaming",
        "gaming mouse": "gaming",
        "gaming headset": "gaming",
        "gaming mic": "gaming",
        "gaming speaker": "gaming",
        "gaming": "gaming",
        "earphone": "tws-headphone",
        "earbud": "tws-headphone",
        "headset": "tws-headphone",
        "headphone": "tws-headphone",
        "wireless headphone": "tws-headphone",
        "fm transmitter": "fm-transmitter",
        "cable": "cables",
        "hub": "hubs",
        "usb hub": "hubs",
        "power socket": "power-socket",
        "power outlet": "power-socket",
        "tablet": "mobiletablet",
        "ipad": "mobiletablet",
        "smart watch": "smart-watch",
        "smartwatch": "smart-watch",
        "watch": "smart-watch",
        "watch band": "smart-watch-loops",
        "watch strap": "smart-watch-loops",
        "lifestyle": "lifestyle",
        "holder": "mobile-stand",
        "stand": "mobile-stand",
        "phone stand": "mobile-stand",
        "speaker": "speakers",
        "bluetooth speaker": "speakers",
        "charger": "chargers",
        "power charger": "chargers",
        "fast charger": "chargers",
        "car charger": "car-charger",
        "car mount": "car-mount",
        "phone mount": "car-mount",
        "magsafe": "magsafe",
        "magnetic": "magsafe",
        "screen protector": "screen-protector",
        "tempered glass": "screen-protector",
        "protector": "screen-protector",
        "case": "cases",
        "phone case": "cases",
        "mobile case": "cases",
        "protective case": "cases",
        "power delivery": "chargers",
        "usb-c": "cables",
        "usb": "cables",
        "lightning": "cables",
        "micro usb": "cables",
    };
    // Check exact match on last part first
    const exactMatch = keywords[lastPart];
    if (exactMatch) {
        return exactMatch;
    }
    // Check partial matches on last part
    for (const [keyword, handle] of Object.entries(keywords)) {
        if (lastPart.includes(keyword) || keyword.includes(lastPart)) {
            return handle;
        }
    }
    // Check all parts (breadcrumb matching)
    for (const part of parts) {
        const partMatch = keywords[part];
        if (partMatch) {
            return partMatch;
        }
        for (const [keyword, handle] of Object.entries(keywords)) {
            if (part.includes(keyword) || keyword.includes(part)) {
                return handle;
            }
        }
    }
    // Last resort: use the last part as the handle (slugified)
    return lastPart.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
/**
 * Generate direct Odoo image URL for a product
 */
function getOdooImageUrl(odooId) {
    return `${ODOO_BASE_URL}/web/image/product.product/${odooId}/image_1920`;
}
/**
 * Ensure a category exists, creating it if necessary
 * This enables automatic category creation from Odoo products
 */
async function ensureCategory(pg, handle, name, categoryByHandle) {
    if (categoryByHandle.has(handle)) {
        return categoryByHandle.get(handle);
    }
    try {
        const catId = genId("pcat");
        await pg.raw(`INSERT INTO product_category (id, name, handle, status, is_active, rank, created_at, updated_at)
       VALUES (?, ?, ?, 'published', true, 0, NOW(), NOW())
       ON CONFLICT (handle) DO NOTHING`, [catId, name, handle]);
        // Re-fetch to get the actual ID (in case of conflict)
        const fetchRes = await pg.raw(`SELECT id FROM product_category WHERE handle = ? AND deleted_at IS NULL LIMIT 1`, [handle]);
        if (fetchRes.rows?.length > 0) {
            const actualId = fetchRes.rows[0].id;
            categoryByHandle.set(handle, actualId);
            console.log(`[Odoo Webhook] Auto-created category: ${name} (${handle})`);
            return actualId;
        }
    }
    catch (err) {
        console.warn(`[Odoo Webhook] Failed to create category ${handle}: ${err}`);
    }
    return "";
}
async function upsertProduct(pg, p, salesChannelId, existingHandles, categoryByHandle) {
    const odooId = p.odoo_id;
    const sku = p.default_code || `ODOO-${odooId}`;
    const title = p.name || `Odoo Product ${odooId}`;
    const price = p.list_price || 0;
    const currency = (p.currency_code || "aed").toLowerCase();
    const description = p.description_sale || p.description || "";
    const weight = p.weight ? String(p.weight) : null;
    const status = p.is_published === false ? "draft" : "published";
    const brand = p.brand || null;
    const category = p.categ_id && Array.isArray(p.categ_id) ? p.categ_id[1] : null;
    const metadata = {
        odoo_id: odooId,
        odoo_sku: sku,
        odoo_barcode: p.barcode || null,
        odoo_category: category,
        odoo_brand: brand,
        odoo_qty: p.qty_available || 0,
        synced_at: new Date().toISOString(),
    };
    // Check if product exists by odoo_id or SKU
    const existing = await pg.raw(`SELECT id, handle FROM product WHERE metadata->>'odoo_id' = ? AND deleted_at IS NULL LIMIT 1`, [String(odooId)]);
    const existBySku = existing.rows?.length
        ? existing
        : await pg.raw(`SELECT p.id, p.handle FROM product p JOIN product_variant pv ON pv.product_id = p.id WHERE pv.sku = ? AND p.deleted_at IS NULL AND pv.deleted_at IS NULL LIMIT 1`, [sku]);
    if (existBySku.rows?.length > 0) {
        const prodId = existBySku.rows[0].id;
        await pg.raw(`UPDATE product SET title=?, description=?, status=?, weight=?, metadata=?, thumbnail=COALESCE(?, thumbnail), updated_at=NOW() WHERE id=?`, [title, description, status, weight, JSON.stringify(metadata), p.image_url || null, prodId]);
        const varRes = await pg.raw(`SELECT pv.id as vid, pvps.price_set_id as psid FROM product_variant pv LEFT JOIN product_variant_price_set pvps ON pvps.variant_id = pv.id WHERE pv.product_id = ? AND pv.deleted_at IS NULL LIMIT 1`, [prodId]);
        if (varRes.rows?.length > 0 && varRes.rows[0].psid && price > 0) {
            const rawAmount = JSON.stringify({ value: String(price), precision: 20 });
            await pg.raw(`UPDATE price SET amount=?, raw_amount=?, currency_code=?, updated_at=NOW() WHERE price_set_id=? AND deleted_at IS NULL`, [price, rawAmount, currency, varRes.rows[0].psid]);
        }
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // CATEGORY SYNC
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        const catHandle = odooCategoryToHandle(category);
        if (catHandle) {
            // Use ensureCategory to automatically create if missing
            const catId = await ensureCategory(pg, catHandle, category || catHandle, categoryByHandle);
            if (catId) {
                try {
                    await pg.raw(`INSERT INTO product_category_product (id, product_id, product_category_id, created_at, updated_at)
             VALUES (?, ?, ?, NOW(), NOW())
             ON CONFLICT (product_id, product_category_id) DO NOTHING`, [genId("pcp"), prodId, catId]);
                }
                catch (err) {
                    console.warn(`[Odoo Webhook] Category link failed for ${prodId}: ${err}`);
                }
            }
        }
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // INVENTORY SYNC
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        const qty = p.qty_available || 0;
        if (varRes.rows?.length > 0) {
            const vid = varRes.rows[0].vid;
            try {
                // Check if inventory_item exists
                const invItemRes = await pg.raw(`SELECT id FROM inventory_item WHERE sku = ? LIMIT 1`, [sku]);
                if (invItemRes.rows?.length > 0) {
                    // Update existing
                    const invItemId = invItemRes.rows[0].id;
                    const invLvlRes = await pg.raw(`SELECT id FROM inventory_level WHERE inventory_item_id = ? LIMIT 1`, [invItemId]);
                    if (invLvlRes.rows?.length > 0) {
                        await pg.raw(`UPDATE inventory_level SET stocked_quantity = ?, updated_at = NOW() WHERE id = ?`, [qty, invLvlRes.rows[0].id]);
                    }
                    else {
                        // Create level if missing
                        const locRes = await pg.raw(`SELECT id FROM stock_location LIMIT 1`);
                        if (locRes.rows?.length > 0) {
                            await pg.raw(`INSERT INTO inventory_level (id, inventory_item_id, location_id, stocked_quantity, reserved_quantity, incoming_quantity, created_at, updated_at)
                 VALUES (?, ?, ?, ?, 0, 0, NOW(), NOW())`, [genId("iloc"), invItemId, locRes.rows[0].id, qty]);
                        }
                    }
                }
                else {
                    // Create inventory_item + level
                    const invItemId = genId("iitem");
                    await pg.raw(`INSERT INTO inventory_item (id, sku, title, created_at, updated_at)
             VALUES (?, ?, ?, NOW(), NOW())`, [invItemId, sku, title]);
                    const locRes = await pg.raw(`SELECT id FROM stock_location LIMIT 1`);
                    if (locRes.rows?.length > 0) {
                        await pg.raw(`INSERT INTO inventory_level (id, inventory_item_id, location_id, stocked_quantity, reserved_quantity, incoming_quantity, created_at, updated_at)
               VALUES (?, ?, ?, ?, 0, 0, NOW(), NOW())`, [genId("iloc"), invItemId, locRes.rows[0].id, qty]);
                    }
                }
            }
            catch (err) {
                console.warn(`[Odoo Webhook] Inventory sync failed for ${sku}: ${err}`);
            }
        }
        return { action: "updated", productId: prodId };
    }
    // CREATE new product
    let handle = slugify(title);
    if (!handle)
        handle = `odoo-${odooId}`;
    if (existingHandles.has(handle))
        handle = `${handle}-${odooId}`;
    if (existingHandles.has(handle))
        handle = `${handle}-${Date.now().toString(36)}`;
    existingHandles.add(handle);
    let thumbnail = p.image_url || null;
    if (!thumbnail && (p.image_1920 || p.odoo_id)) {
        // Use direct Odoo image URL instead of saving base64 locally
        thumbnail = getOdooImageUrl(odooId);
    }
    const productId = genId("prod");
    await pg.raw(`INSERT INTO product (id, title, handle, subtitle, description, thumbnail, status, weight, metadata, discountable, is_giftcard, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, true, false, NOW(), NOW())`, [productId, title, handle, brand || "", description, thumbnail, status, weight, JSON.stringify(metadata)]);
    const variantId = genId("variant");
    await pg.raw(`INSERT INTO product_variant (id, product_id, title, sku, barcode, manage_inventory, allow_backorder, variant_rank, created_at, updated_at) VALUES (?, ?, 'Default', ?, ?, true, false, 0, NOW(), NOW())`, [variantId, productId, sku, p.barcode || null]);
    if (price > 0) {
        const priceSetId = genId("pset");
        await pg.raw(`INSERT INTO price_set (id, created_at, updated_at) VALUES (?, NOW(), NOW())`, [priceSetId]);
        await pg.raw(`INSERT INTO product_variant_price_set (id, variant_id, price_set_id, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())`, [genId("pvps"), variantId, priceSetId]);
        const rawAmount = JSON.stringify({ value: String(price), precision: 20 });
        await pg.raw(`INSERT INTO price (id, price_set_id, currency_code, amount, raw_amount, rules_count, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 0, NOW(), NOW())`, [genId("price"), priceSetId, currency, price, rawAmount]);
    }
    if (thumbnail) {
        await pg.raw(`INSERT INTO image (id, url, rank, product_id, created_at, updated_at) VALUES (?, ?, 0, ?, NOW(), NOW())`, [genId("img"), thumbnail, productId]);
    }
    if (p.images && Array.isArray(p.images)) {
        for (let idx = 0; idx < p.images.length; idx++) {
            await pg.raw(`INSERT INTO image (id, url, rank, product_id, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())`, [genId("img"), p.images[idx], idx + 1, productId]);
        }
    }
    if (salesChannelId) {
        try {
            await pg.raw(`INSERT INTO product_sales_channel (id, product_id, sales_channel_id, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW()) ON CONFLICT (product_id, sales_channel_id) DO NOTHING`, [genId("psc"), productId, salesChannelId]);
        }
        catch { /* ignore */ }
    }
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // CATEGORY SYNC
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const catHandle = odooCategoryToHandle(category);
    const catId = catHandle ? categoryByHandle.get(catHandle) : null;
    if (catId) {
        try {
            await pg.raw(`INSERT INTO product_category_product (id, product_id, product_category_id, created_at, updated_at)
         VALUES (?, ?, ?, NOW(), NOW())
         ON CONFLICT (product_id, product_category_id) DO NOTHING`, [genId("pcp"), productId, catId]);
        }
        catch (err) {
            console.warn(`[Odoo Webhook] Category link failed for ${productId}: ${err}`);
        }
    }
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // INVENTORY SYNC
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const qty = p.qty_available || 0;
    try {
        // Create inventory_item
        const invItemId = genId("iitem");
        await pg.raw(`INSERT INTO inventory_item (id, sku, title, created_at, updated_at)
       VALUES (?, ?, ?, NOW(), NOW())`, [invItemId, sku, title]);
        // Get default location
        const locRes = await pg.raw(`SELECT id FROM stock_location LIMIT 1`);
        if (locRes.rows?.length > 0) {
            // Create inventory_level
            await pg.raw(`INSERT INTO inventory_level (id, inventory_item_id, location_id, stocked_quantity, reserved_quantity, incoming_quantity, created_at, updated_at)
         VALUES (?, ?, ?, ?, 0, 0, NOW(), NOW())`, [genId("iloc"), invItemId, locRes.rows[0].id, qty]);
        }
    }
    catch (err) {
        console.warn(`[Odoo Webhook] Inventory sync failed for ${sku}: ${err}`);
    }
    return { action: "created", productId };
}
const POST = async (req, res) => {
    const pg = req.scope.resolve(utils_1.ContainerRegistrationKeys.PG_CONNECTION);
    const startTime = Date.now();
    const body = req.body;
    const { event_type, webhook_secret } = body;
    if (WEBHOOK_SECRET && webhook_secret !== WEBHOOK_SECRET) {
        return res.status(401).json({ type: "unauthorized", message: "Invalid webhook_secret" });
    }
    if (!event_type) {
        return res.status(400).json({ type: "invalid_data", message: "event_type is required" });
    }
    console.log(`[Odoo Webhook] ${event_type} received`);
    try {
        const scRes = await pg.raw(`SELECT id FROM sales_channel WHERE deleted_at IS NULL LIMIT 1`);
        const salesChannelId = scRes.rows?.[0]?.id || null;
        const hRes = await pg.raw(`SELECT handle FROM product WHERE deleted_at IS NULL`);
        const existingHandles = new Set(hRes.rows?.map((r) => r.handle) || []);
        // Load category mappings
        const catRes = await pg.raw(`SELECT id, handle FROM product_category WHERE deleted_at IS NULL`);
        const categoryByHandle = new Map();
        for (const row of catRes.rows || []) {
            categoryByHandle.set(row.handle, row.id);
        }
        console.log(`[Odoo Webhook] Loaded ${categoryByHandle.size} categories`);
        // DELETE
        if (event_type === "product.deleted") {
            const odooId = body.product?.odoo_id;
            if (!odooId)
                return res.status(400).json({ message: "product.odoo_id required" });
            const found = await pg.raw(`SELECT id, title FROM product WHERE metadata->>'odoo_id' = ? AND deleted_at IS NULL`, [String(odooId)]);
            if (found.rows?.length > 0) {
                await pg.raw(`UPDATE product SET deleted_at=NOW(), status='draft' WHERE id=?`, [found.rows[0].id]);
                console.log(`[Odoo Webhook] Deleted: ${found.rows[0].title}`);
                return res.json({ status: "success", action: "deleted", id: found.rows[0].id });
            }
            return res.json({ status: "not_found", message: `No product for Odoo ID ${odooId}` });
        }
        // BULK
        if (event_type === "product.bulk") {
            const products = body.products || [];
            if (!products.length)
                return res.status(400).json({ message: "products array required" });
            let created = 0, updated = 0, errors = 0;
            for (const p of products) {
                try {
                    if (!p.odoo_id || !p.name) {
                        errors++;
                        continue;
                    }
                    const r = await upsertProduct(pg, p, salesChannelId, existingHandles, categoryByHandle);
                    if (r.action === "created")
                        created++;
                    else
                        updated++;
                }
                catch (err) {
                    errors++;
                    console.error(`[Odoo Webhook] Bulk err [${p.odoo_id}]: ${err.message}`);
                }
            }
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(`[Odoo Webhook] Bulk done: created=${created} updated=${updated} errors=${errors} (${elapsed}s)`);
            return res.json({ status: "success", action: "bulk", created, updated, errors, total: products.length, elapsed_seconds: elapsed });
        }
        // SINGLE CREATE/UPDATE
        const p = body.product;
        if (!p?.odoo_id || !p?.name) {
            return res.status(400).json({ message: "product.odoo_id and product.name are required" });
        }
        const result = await upsertProduct(pg, p, salesChannelId, existingHandles, categoryByHandle);
        console.log(`[Odoo Webhook] ${result.action}: ${p.name} -> ${result.productId}`);
        return res.json({ status: "success", ...result, odoo_id: p.odoo_id, product_name: p.name });
    }
    catch (error) {
        console.error(`[Odoo Webhook] Error:`, error.message);
        return res.status(500).json({ type: "error", message: error.message });
    }
};
exports.POST = POST;
const GET = async (req, res) => {
    const pg = req.scope.resolve(utils_1.ContainerRegistrationKeys.PG_CONNECTION);
    const countRes = await pg.raw(`SELECT COUNT(*) as c FROM product WHERE status='published' AND deleted_at IS NULL`);
    const odooCount = await pg.raw(`SELECT COUNT(*) as c FROM product WHERE metadata->>'odoo_id' IS NOT NULL AND deleted_at IS NULL`);
    return res.json({
        status: "active",
        endpoint: "/odoo/webhooks/products",
        total_products: parseInt(countRes.rows?.[0]?.c || "0"),
        odoo_synced_products: parseInt(odooCount.rows?.[0]?.c || "0"),
        supported_events: ["product.created", "product.updated", "product.deleted", "product.bulk"],
        webhook_secret: "Required in request body",
        example_single: {
            event_type: "product.created",
            webhook_secret: "<secret>",
            product: { odoo_id: 123, name: "Product Name", default_code: "SKU-001", list_price: 99.99, currency_code: "aed", description_sale: "Description", brand: "Brand", image_url: "https://example.com/image.jpg", is_published: true },
        },
        example_bulk: {
            event_type: "product.bulk",
            webhook_secret: "<secret>",
            products: ["... array of product objects ..."],
        },
    });
};
exports.GET = GET;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL29kb28vd2ViaG9va3MvcHJvZHVjdHMvcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EscURBQXFFO0FBRXJFOzs7Ozs7Ozs7R0FTRztBQUVILE1BQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLElBQUkseUJBQXlCLENBQUE7QUFDbkYsTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLElBQUksNENBQTRDLENBQUE7QUFFMUYsU0FBUyxPQUFPLENBQUMsSUFBWTtJQUMzQixPQUFPLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFBO0FBQ3ZILENBQUM7QUFFRCxTQUFTLEtBQUssQ0FBQyxNQUFjO0lBQzNCLE1BQU0sQ0FBQyxHQUFHLGtDQUFrQyxDQUFBO0lBQzVDLElBQUksRUFBRSxHQUFHLE1BQU0sR0FBRyxHQUFHLENBQUE7SUFDckIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUU7UUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFBO0lBQzFFLE9BQU8sRUFBRSxDQUFBO0FBQ1gsQ0FBQztBQUVEOzs7Ozs7OztHQVFHO0FBQ0gsU0FBUyxvQkFBb0IsQ0FBQyxZQUEyQjtJQUN2RCxJQUFJLENBQUMsWUFBWTtRQUFFLE9BQU8sSUFBSSxDQUFB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
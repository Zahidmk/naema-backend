"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const utils_1 = require("@medusajs/framework/utils");
/**
 * GET /store/categories/:handle/products
 *
 * Returns products for a specific category by handle
 * Includes child category products too
 *
 * Query params:
 * - page (default: 1)
 * - limit (default: 20)
 * - sort: price_asc, price_desc, newest, oldest, title_asc, title_desc (default: newest)
 * - min_price, max_price
 * - brand
 * - in_stock: true/false
 * - currency (default: aed)
 */
async function GET(req, res) {
    const pgConnection = req.scope.resolve(utils_1.ContainerRegistrationKeys.PG_CONNECTION);
    const handle = req.params.handle;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const offset = (page - 1) * limit;
    const sort = req.query.sort || "newest";
    const minPrice = req.query.min_price ? parseFloat(req.query.min_price) : null;
    const maxPrice = req.query.max_price ? parseFloat(req.query.max_price) : null;
    const brand = req.query.brand; // filter by odoo_brand in metadata
    const color = req.query.color; // filter by color option value
    const inStock = req.query.in_stock;
    const currency = req.query.currency || "aed";
    try {
        // Find category by handle and get all child category IDs
        const categoryResult = await pgConnection.raw(`SELECT id, name, handle, metadata FROM product_category 
       WHERE handle = ? AND deleted_at IS NULL`, [handle]);
        if (!categoryResult.rows || categoryResult.rows.length === 0) {
            return res.status(404).json({ type: "not_found", message: "Category not found" });
        }
        const category = categoryResult.rows[0];
        const catMeta = typeof category.metadata === "string"
            ? JSON.parse(category.metadata)
            : (category.metadata || {});
        // Get this category + all child category IDs
        const childrenResult = await pgConnection.raw(`WITH RECURSIVE cat_tree AS (
         SELECT id FROM product_category WHERE id = ?
         UNION ALL
         SELECT pc.id FROM product_category pc
         JOIN cat_tree ct ON pc.parent_category_id = ct.id
         WHERE pc.deleted_at IS NULL
       )
       SELECT id FROM cat_tree`, [category.id]);
        const categoryIds = childrenResult.rows.map((r) => r.id);
        // Build WHERE conditions
        const conditions = [
            "p.status = 'published'",
            "p.deleted_at IS NULL",
            `pcp.product_category_id IN (${categoryIds.map(() => "?").join(",")})`,
        ];
        const params = [...categoryIds];
        if (minPrice !== null) {
            conditions.push("pp.amount >= ?");
            params.push(minPrice);
        }
        if (maxPrice !== null) {
            conditions.push("pp.amount <= ?");
            params.push(maxPrice);
        }
        if (brand) {
            // Match against odoo_brand or brand_name in metadata, fallback to title starts-with
            conditions.push(`(
        LOWER(COALESCE(NULLIF(TRIM(p.metadata->>'odoo_brand'), ''), NULLIF(TRIM(p.metadata->>'brand_name'), ''))) = LOWER(?)
        OR (
          COALESCE(NULLIF(TRIM(p.metadata->>'odoo_brand'), ''), NULLIF(TRIM(p.metadata->>'brand_name'), '')) IS NULL
          AND LOWER(p.title) LIKE LOWER(? || '%')
        )
      )`);
            params.push(brand, brand);
        }
        if (color) {
            // Match against product option values (Color option)
            conditions.push(`p.id IN (
        SELECT DISTINCT p2.id FROM product p2
        JOIN product_option po ON po.product_id = p2.id AND po.deleted_at IS NULL
        JOIN product_option_value pov ON pov.option_id = po.id AND pov.deleted_at IS NULL
        WHERE LOWER(po.title) IN ('color','colour') AND LOWER(pov.value) = LOWER(?)
      )`);
            params.push(color);
        }
        if (inStock === "true") {
            conditions.push("COALESCE((p.metadata->>'stock_qty')::numeric, 0) > 0");
        }
        // Sort mapping — outerOrderBy uses column aliases from the subquery SELECT
        let outerOrderBy = "created_at DESC";
        switch (sort) {
            case "price_asc":
                outerOrderBy = "price ASC NULLS LAST";
                break;
            case "price_desc":
                outerOrderBy = "price DESC NULLS LAST";
                break;
            case "newest":
                outerOrderBy = "created_at DESC";
                break;
            case "oldest":
                outerOrderBy = "created_at ASC";
                break;
            case "title_asc":
                outerOrderBy = "title ASC";
                break;
            case "title_desc":
                outerOrderBy = "title DESC";
                break;
        }
        // Count total
        const countResult = await pgConnection.raw(`SELECT COUNT(DISTINCT p.id) as total
       FROM product p
       JOIN product_category_product pcp ON pcp.product_id = p.id
       LEFT JOIN product_variant pv ON pv.product_id = p.id AND pv.deleted_at IS NULL
       LEFT JOIN product_variant_price_set pvps ON pvps.variant_id = pv.id
       LEFT JOIN price pp ON pp.price_set_id = pvps.price_set_id AND pp.currency_code = ?
       WHERE ${conditions.join(" AND ")}`, [currency, ...params]);
        const total = parseInt(countResult.rows[0].total);
        // Get products — use subquery to deduplicate by product, then sort correctly
        const productsResult = await pgConnection.raw(`SELECT * FROM (
         SELECT DISTINCT ON (p.id) 
                p.id, p.title, p.handle, p.thumbnail, p.subtitle,
                p.description, p.metadata, p.created_at,
                pp.amount as price, pp.currency_code,
                pv.id as variant_id, pv.sku
         FROM product p
         JOIN product_category_product pcp ON pcp.product_id = p.id
         LEFT JOIN product_variant pv ON pv.product_id = p.id AND pv.deleted_at IS NULL
         LEFT JOIN product_variant_price_set pvps ON pvps.variant_id = pv.id
         LEFT JOIN price pp ON pp.price_set_id = pvps.price_set_id AND pp.currency_code = ?
         WHERE ${conditions.join(" AND ")}
         ORDER BY p.id, pp.amount ASC NULLS LAST
       ) deduped
       ORDER BY ${outerOrderBy}
       LIMIT ? OFFSET ?`, [currency, ...params, limit, offset]);
        // Format response
        const products = productsResult.rows.map((p) => {
            const meta = typeof p.metadata === "string" ? JSON.parse(p.metadata) : (p.metadata || {});
            return {
                id: p.id,
                title: p.title,
                handle: p.handle,
                thumbnail: p.thumbnail,
                subtitle: p.subtitle,
                price: p.price ? parseFloat(p.price) : null,
                currency_code: p.currency_code || currency,
                in_stock: (meta.odoo_qty || meta.stock_qty || 0) > 0,
                brand: meta.odoo_brand || extractBrand(p.title),
                created_at: p.created_at,
            };
        });
        res.json({
            category: {
                id: category.id,
                name: category.name,
                handle: category.handle,
                image_url: catMeta.image_url || null,
            },
            products,
            pagination: {
                page,
                limit,
                total,
                total_pages: Math.ceil(total / limit),
                has_more: offset + limit < total,
            },
        });
    }
    catch (error) {
        console.error("[Category Products] Error:", error);
        res.status(500).json({ type: "server_error", message: error.message });
    }
}
function extractBrand(title) {
    if (!title)
        return null;
    const brands = [
        "Porodo", "Powerology", "Baseus", "Anker", "Samsung", "Apple",
        "Xiaomi", "Huawei", "Lenovo", "Green Lion", "LePresso", "Remax",
        "Hoco", "Joyroom", "Ugreen", "Liberty Guard", "Devia", "Oraimo",
        "Marshall", "JBL", "Sony", "Bose", "Harman", "Kemei",
    ];
    for (const brand of brands) {
        if (title.toLowerCase().startsWith(brand.toLowerCase()))
            return brand;
    }
    return title.split(" ")[0];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL2NhdGVnb3JpZXMvW2hhbmRsZV0vcHJvZHVjdHMvcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFrQkEsa0JBd0tDO0FBekxELHFEQUFxRTtBQUVyRTs7Ozs7Ozs7Ozs7Ozs7R0FjRztBQUNJLEtBQUssVUFBVSxHQUFHLENBQUMsR0FBa0IsRUFBRSxHQUFtQjtJQUMvRCxNQUFNLFlBQVksR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxpQ0FBeUIsQ0FBQyxhQUFhLENBQUMsQ0FBQTtJQUMvRSxNQUFNLE1BQU0sR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQTtJQUNoQyxNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFjLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDcEQsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFlLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUE7SUFDckUsTUFBTSxNQUFNLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO0lBQ2pDLE1BQU0sSUFBSSxHQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBZSxJQUFJLFFBQVEsQ0FBQTtJQUNuRCxNQUFNLFFBQVEsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsU0FBbUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUE7SUFDdkYsTUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMs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
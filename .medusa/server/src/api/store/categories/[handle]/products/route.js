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
 * - currency (default: kwd)
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
    const brand = req.query.brand; // filter by erp_brand in metadata
    const color = req.query.color; // filter by color option value
    const inStock = req.query.in_stock;
    // Always use KWD — this is a Kuwait-only store
    const currency = req.query.currency || "kwd";
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
            // Match against erp_brand or brand_name in metadata, fallback to title starts-with
            conditions.push(`(
        LOWER(COALESCE(NULLIF(TRIM(p.metadata->>'erp_brand'), ''), NULLIF(TRIM(p.metadata->>'brand_name'), ''))) = LOWER(?)
        OR (
          COALESCE(NULLIF(TRIM(p.metadata->>'erp_brand'), ''), NULLIF(TRIM(p.metadata->>'brand_name'), '')) IS NULL
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
                in_stock: (meta.erp_qty || meta.stock_qty || 0) > 0,
                brand: meta.erp_brand || extractBrand(p.title),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL2NhdGVnb3JpZXMvW2hhbmRsZV0vcHJvZHVjdHMvcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFrQkEsa0JBeUtDO0FBMUxELHFEQUFxRTtBQUVyRTs7Ozs7Ozs7Ozs7Ozs7R0FjRztBQUNJLEtBQUssVUFBVSxHQUFHLENBQUMsR0FBa0IsRUFBRSxHQUFtQjtJQUMvRCxNQUFNLFlBQVksR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxpQ0FBeUIsQ0FBQyxhQUFhLENBQUMsQ0FBQTtJQUMvRSxNQUFNLE1BQU0sR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQTtJQUNoQyxNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFjLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDcEQsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFlLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUE7SUFDckUsTUFBTSxNQUFNLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO0lBQ2pDLE1BQU0sSUFBSSxHQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBZSxJQUFJLFFBQVEsQ0FBQTtJQUNuRCxNQUFNLFFBQVEsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsU0FBbUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUE7SUFDdkYsTUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMs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
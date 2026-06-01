"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const utils_1 = require("@medusajs/framework/utils");
/**
 * GET /store/featured-products
 * Returns products flagged with metadata.featured === true.
 * Used by the storefront "Handpicked Favorites" homepage section.
 */
async function GET(req, res) {
    const pg = req.scope.resolve(utils_1.ContainerRegistrationKeys.PG_CONNECTION);
    const limitRaw = req.query?.limit || "5";
    const limit = Math.max(1, Math.min(20, parseInt(limitRaw, 10) || 5));
    try {
        const query = `
      SELECT
        p.id, p.title, p.handle, p.thumbnail, p.metadata,
        (
          SELECT json_agg(json_build_object('id', pc.id, 'handle', pc.handle, 'name', pc.name))
          FROM product_category_product pcp
          JOIN product_category pc ON pc.id = pcp.product_category_id
          WHERE pcp.product_id = p.id AND pc.deleted_at IS NULL
        ) AS categories,
        (
          SELECT json_agg(json_build_object('id', t.id, 'value', t.value))
          FROM product_tags pt
          JOIN product_tag t ON t.id = pt.product_tag_id
          WHERE pt.product_id = p.id AND t.deleted_at IS NULL
        ) AS tags
      FROM product p
      WHERE p.deleted_at IS NULL
        AND p.status = 'published'
        AND (p.metadata->>'featured') = 'true'
      ORDER BY p.updated_at DESC
      LIMIT ?
    `;
        const result = await pg.raw(query, [limit]);
        const rows = result.rows || [];
        const products = rows.map((r) => ({
            id: r.id,
            title: r.title,
            handle: r.handle,
            thumbnail: r.thumbnail,
            metadata: r.metadata || {},
            categories: r.categories || [],
            tags: r.tags || [],
            featured_badge: (r.metadata && r.metadata.featured_badge) || null,
        }));
        res.json({ products, count: products.length });
    }
    catch (error) {
        console.error("[Featured Products] GET error:", error);
        res.status(500).json({ message: error.message, products: [] });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL2ZlYXR1cmVkLXByb2R1Y3RzL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBUUEsa0JBaURDO0FBeERELHFEQUFxRTtBQUVyRTs7OztHQUlHO0FBQ0ksS0FBSyxVQUFVLEdBQUcsQ0FBQyxHQUFrQixFQUFFLEdBQW1CO0lBQy9ELE1BQU0sRUFBRSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGlDQUF5QixDQUFDLGFBQWEsQ0FBUSxDQUFBO0lBRTVFLE1BQU0sUUFBUSxHQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBZ0IsSUFBSSxHQUFHLENBQUE7SUFDcEQsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsUUFBUSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBRXBFLElBQUksQ0FBQztRQUNILE1BQU0sS0FBSyxHQUFHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7S0FxQmIsQ0FBQTtRQUVELE1BQU0sTUFBTSxHQUFHLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO1FBQzNDLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFBO1FBRTlCLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFNLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDckMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFO1lBQ1IsS0FBSyxFQUFFLENBQUMsQ0FBQyxLQUFLO1lBQ2QsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNO1lBQ2hCLFNBQVMsRUFBRSxDQUFDLENBQUMsU0FBUztZQUN0QixRQUFRLEVBQUUsQ0FBQyxDQUFDLFFBQVEsSUFBSSxFQUFFO1lBQzFCLFVBQVUsRUFBRSxDQUFDLENBQUMsVUFBVSxJQUFJLEVBQUU7WUFDOUIsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLElBQUksRUFBRTtZQUNsQixjQUFjLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLElBQUksSUFBSTtTQUNsRSxDQUFDLENBQUMsQ0FBQTtRQUVILEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFBO0lBQ2hELENBQUM7SUFBQyxPQUFPLEtBQVUsRUFBRSxDQUFDO1FBQ3BCLE9BQU8sQ0FBQyxLQUFLLENBQUMsZ0NBQWdDLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFDdEQsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQTtJQUNoRSxDQUFDO0FBQ0gsQ0FBQyJ9
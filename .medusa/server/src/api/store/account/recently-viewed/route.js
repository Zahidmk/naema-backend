"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
const utils_1 = require("@medusajs/framework/utils");
/**
 * GET /store/account/recently-viewed
 * Returns recently viewed products for a customer.
 * Uses customer metadata to store recently viewed product IDs.
 *
 * Query params:
 *   customer_id - required
 *   limit       - optional (default 20)
 *
 * POST /store/account/recently-viewed
 * Add a product to recently viewed list.
 * Body: { customer_id, product_id }
 */
async function GET(req, res) {
    const pgConnection = req.scope.resolve(utils_1.ContainerRegistrationKeys.PG_CONNECTION);
    const { customer_id, limit = "20" } = req.query;
    if (!customer_id) {
        return res.status(400).json({
            type: "invalid_data",
            message: "customer_id is required",
        });
    }
    try {
        // Get customer metadata
        const customerResult = await pgConnection.raw(`SELECT metadata FROM customer WHERE id = ? AND deleted_at IS NULL`, [customer_id]);
        if (!customerResult.rows || customerResult.rows.length === 0) {
            return res.status(404).json({
                type: "not_found",
                message: "Customer not found",
            });
        }
        const metadata = customerResult.rows[0].metadata || {};
        const recentlyViewedIds = metadata.recently_viewed || [];
        if (recentlyViewedIds.length === 0) {
            return res.json({ products: [], count: 0 });
        }
        // Fetch product details for recently viewed IDs
        const placeholders = recentlyViewedIds.map(() => "?").join(",");
        const productsResult = await pgConnection.raw(`SELECT 
        p.id, p.title, p.handle, p.subtitle, p.thumbnail, p.status,
        p.metadata, p.created_at,
        (SELECT MIN(pp.amount) FROM product_variant pv 
         JOIN product_variant_price_set pvps ON pvps.variant_id = pv.id
         JOIN price pp ON pp.price_set_id = pvps.price_set_id AND pp.deleted_at IS NULL
         WHERE pv.product_id = p.id AND pv.deleted_at IS NULL) as price,
        (SELECT pp.currency_code FROM product_variant pv 
         JOIN product_variant_price_set pvps ON pvps.variant_id = pv.id
         JOIN price pp ON pp.price_set_id = pvps.price_set_id AND pp.deleted_at IS NULL
         WHERE pv.product_id = p.id AND pv.deleted_at IS NULL LIMIT 1) as currency_code
       FROM product p
       WHERE p.id IN (${placeholders})
         AND p.deleted_at IS NULL AND p.status = 'published'`, recentlyViewedIds);
        // Maintain the order of recently viewed (most recent first)
        const productMap = new Map((productsResult.rows || []).map((p) => [p.id, p]));
        const orderedProducts = recentlyViewedIds
            .map((id) => productMap.get(id))
            .filter(Boolean)
            .slice(0, parseInt(limit));
        res.json({
            products: orderedProducts,
            count: orderedProducts.length,
        });
    }
    catch (error) {
        console.error("[Recently Viewed] GET error:", error);
        res.status(500).json({ type: "server_error", message: error.message });
    }
}
async function POST(req, res) {
    const pgConnection = req.scope.resolve(utils_1.ContainerRegistrationKeys.PG_CONNECTION);
    const { customer_id, product_id } = req.body;
    if (!customer_id || !product_id) {
        return res.status(400).json({
            type: "invalid_data",
            message: "customer_id and product_id are required",
        });
    }
    try {
        // Get current metadata
        const customerResult = await pgConnection.raw(`SELECT metadata FROM customer WHERE id = ? AND deleted_at IS NULL`, [customer_id]);
        if (!customerResult.rows || customerResult.rows.length === 0) {
            return res.status(404).json({ type: "not_found", message: "Customer not found" });
        }
        const metadata = customerResult.rows[0].metadata || {};
        let recentlyViewed = metadata.recently_viewed || [];
        // Remove if already exists (to move to front)
        recentlyViewed = recentlyViewed.filter((id) => id !== product_id);
        // Add to front
        recentlyViewed.unshift(product_id);
        // Keep max 50
        recentlyViewed = recentlyViewed.slice(0, 50);
        metadata.recently_viewed = recentlyViewed;
        await pgConnection.raw(`UPDATE customer SET metadata = ?, updated_at = NOW() WHERE id = ?`, [JSON.stringify(metadata), customer_id]);
        res.json({
            success: true,
            recently_viewed_count: recentlyViewed.length,
        });
    }
    catch (error) {
        console.error("[Recently Viewed] POST error:", error);
        res.status(500).json({ type: "server_error", message: error.message });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL2FjY291bnQvcmVjZW50bHktdmlld2VkL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBZ0JBLGtCQW1FQztBQUVELG9CQStDQztBQW5JRCxxREFBcUU7QUFFckU7Ozs7Ozs7Ozs7OztHQVlHO0FBQ0ksS0FBSyxVQUFVLEdBQUcsQ0FBQyxHQUFrQixFQUFFLEdBQW1CO0lBQy9ELE1BQU0sWUFBWSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGlDQUF5QixDQUFDLGFBQWEsQ0FBQyxDQUFBO0lBQy9FLE1BQU0sRUFBRSxXQUFXLEVBQUUsS0FBSyxHQUFHLElBQUksRUFBRSxHQUFHLEdBQUcsQ0FBQyxLQUFpRCxDQUFBO0lBRTNGLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNqQixPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQzFCLElBQUksRUFBRSxjQUFjO1lBQ3BCLE9BQU8sRUFBRSx5QkFBeUI7U0FDbkMsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUVELElBQUksQ0FBQztRQUNILHdCQUF3QjtRQUN4QixNQUFNLGNBQWMsR0FBRyxNQUFNLFlBQVksQ0FBQyxHQUFHLENBQzNDLG1FQUFtRSxFQUNuRSxDQUFDLFdBQVcsQ0FBQyxDQUNkLENBQUE7UUFFRCxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksSUFBSSxjQUFjLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUM3RCxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO2dCQUMxQixJQUFJLEVBQUUsV0FBVztnQkFDakIsT0FBTyxFQUFFLG9CQUFvQjthQUM5QixDQUFDLENBQUE7UUFDSixDQUFDO1FBRUQsTUFBTSxRQUFRLEdB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
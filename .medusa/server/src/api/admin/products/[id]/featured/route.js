"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.GET = void 0;
const utils_1 = require("@medusajs/framework/utils");
/**
 * GET /admin/products/:id/featured
 * Returns whether a product is flagged for the homepage "Handpicked Favorites".
 */
const GET = async (req, res) => {
    const pg = req.scope.resolve(utils_1.ContainerRegistrationKeys.PG_CONNECTION);
    const { id } = req.params;
    try {
        const result = await pg.raw(`SELECT id, title, metadata FROM product WHERE id = ? AND deleted_at IS NULL`, [id]);
        if (!result.rows?.length) {
            return res.status(404).json({ message: "Product not found" });
        }
        const metadata = result.rows[0].metadata || {};
        res.json({
            product_id: id,
            featured: metadata.featured === true,
            featured_badge: metadata.featured_badge || null,
        });
    }
    catch (error) {
        console.error("[Featured] GET error:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.GET = GET;
/**
 * POST /admin/products/:id/featured
 * Toggle `featured` (and optionally `featured_badge`) on product metadata.
 *
 * Body: { featured: boolean, featured_badge?: string }
 */
const POST = async (req, res) => {
    const pg = req.scope.resolve(utils_1.ContainerRegistrationKeys.PG_CONNECTION);
    const { id } = req.params;
    const body = req.body;
    try {
        const result = await pg.raw(`SELECT id, metadata FROM product WHERE id = ? AND deleted_at IS NULL`, [id]);
        if (!result.rows?.length) {
            return res.status(404).json({ message: "Product not found" });
        }
        const currentMeta = result.rows[0].metadata || {};
        const updated = {
            ...currentMeta,
            ...(body.featured !== undefined && { featured: body.featured }),
            ...(body.featured_badge !== undefined && { featured_badge: body.featured_badge }),
        };
        await pg.raw(`UPDATE product SET metadata = ?::jsonb, updated_at = NOW() WHERE id = ?`, [JSON.stringify(updated), id]);
        console.log(`[Featured] Product ${id}: featured=${updated.featured} badge=${updated.featured_badge}`);
        res.json({
            success: true,
            product_id: id,
            featured: updated.featured === true,
            featured_badge: updated.featured_badge || null,
        });
    }
    catch (error) {
        console.error("[Featured] POST error:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.POST = POST;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL3Byb2R1Y3RzL1tpZF0vZmVhdHVyZWQvcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EscURBQXFFO0FBRXJFOzs7R0FHRztBQUNJLE1BQU0sR0FBRyxHQUFHLEtBQUssRUFBRSxHQUFrQixFQUFFLEdBQW1CLEVBQUUsRUFBRTtJQUNuRSxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxpQ0FBeUIsQ0FBQyxhQUFhLENBQUMsQ0FBQTtJQUNyRSxNQUFNLEVBQUUsRUFBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQTtJQUV6QixJQUFJLENBQUM7UUFDSCxNQUFNLE1BQU0sR0FBRyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQ3pCLDZFQUE2RSxFQUM3RSxDQUFDLEVBQUUsQ0FBQyxDQUNMLENBQUE7UUFFRCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsQ0FBQztZQUN6QixPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLG1CQUFtQixFQUFFLENBQUMsQ0FBQTtRQUMvRCxDQUFDO1FBRUQsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFBO1FBRTlDLEdBQUcsQ0FBQyxJQUFJLENBQUM7WUFDUCxVQUFVLEVBQUUsRUFBRTtZQUNkLFFBQVEsRUFBRSxRQUFRLENBQUMsUUFBUSxLQUFLLElBQUk7WUFDcEMsY0FBYyxFQUFFLFFBQVEsQ0FBQyxjQUFjLElBQUksSUFBSTtTQUNoRCxDQUFDLENBQUE7SUFDSixDQUFDO0lBQUMsT0FBTyxLQUFVLEVBQUUsQ0FBQztRQUNwQixPQUFPLENBQUMsS0FBSyxDQUFD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
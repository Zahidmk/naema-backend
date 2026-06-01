"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.GET = void 0;
const utils_1 = require("@medusajs/framework/utils");
/**
 * GET /admin/products/:id/delivery
 * Returns night_delivery status for a product.
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
            night_delivery: metadata.night_delivery === true,
            fast_delivery_areas: metadata.fast_delivery_areas || [],
        });
    }
    catch (error) {
        console.error("[Delivery Settings] GET error:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.GET = GET;
/**
 * POST /admin/products/:id/delivery
 * Toggle night_delivery (and optionally fast_delivery_areas) for a product.
 *
 * Body: { night_delivery: true/false, fast_delivery_areas?: string[] }
 */
const POST = async (req, res) => {
    const pg = req.scope.resolve(utils_1.ContainerRegistrationKeys.PG_CONNECTION);
    const { id } = req.params;
    const body = req.body;
    try {
        // Fetch current metadata
        const result = await pg.raw(`SELECT id, title, metadata FROM product WHERE id = ? AND deleted_at IS NULL`, [id]);
        if (!result.rows?.length) {
            return res.status(404).json({ message: "Product not found" });
        }
        const currentMeta = result.rows[0].metadata || {};
        // Merge only the delivery fields
        const updated = {
            ...currentMeta,
            ...(body.night_delivery !== undefined && { night_delivery: body.night_delivery }),
            ...(body.fast_delivery_areas !== undefined && { fast_delivery_areas: body.fast_delivery_areas }),
        };
        await pg.raw(`UPDATE product SET metadata = ?::jsonb, updated_at = NOW() WHERE id = ?`, [JSON.stringify(updated), id]);
        console.log(`[Delivery Settings] Product ${id}: night_delivery=${updated.night_delivery}`);
        res.json({
            success: true,
            product_id: id,
            night_delivery: updated.night_delivery === true,
            fast_delivery_areas: updated.fast_delivery_areas || [],
        });
    }
    catch (error) {
        console.error("[Delivery Settings] POST error:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.POST = POST;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL3Byb2R1Y3RzL1tpZF0vZGVsaXZlcnkvcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EscURBQXFFO0FBRXJFOzs7R0FHRztBQUNJLE1BQU0sR0FBRyxHQUFHLEtBQUssRUFBRSxHQUFrQixFQUFFLEdBQW1CLEVBQUUsRUFBRTtJQUNuRSxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxpQ0FBeUIsQ0FBQyxhQUFhLENBQUMsQ0FBQTtJQUNyRSxNQUFNLEVBQUUsRUFBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQTtJQUV6QixJQUFJLENBQUM7UUFDSCxNQUFNLE1BQU0sR0FBRyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQ3pCLDZFQUE2RSxFQUM3RSxDQUFDLEVBQUUsQ0FBQyxDQUNMLENBQUE7UUFFRCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsQ0FBQztZQUN6QixPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLG1CQUFtQixFQUFFLENBQUMsQ0FBQTtRQUMvRCxDQUFDO1FBRUQsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFBO1FBRTlDLEdBQUcsQ0FBQyxJQUFJLENBQUM7WUFDUCxVQUFVLEVBQUUsRUFBRTtZQUNkLGNBQWMsRUFBRSxRQUFRLENBQUMsY0FBYyxLQUFLLElBQUk7WUFDaEQsbUJBQW1CLEVBQUUsUUFBUSxDQUFDLG1CQUFtQixJQUFJLEVBQUU7U0FDeEQsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUFDLE9BQU8sS0FBVSxFQUFFLENBQUM7UUFDcEIsT0FBTyxDQUFDLEtBQUss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
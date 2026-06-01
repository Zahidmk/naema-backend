"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = exports.AUTHENTICATE = void 0;
const utils_1 = require("@medusajs/framework/utils");
exports.AUTHENTICATE = false;
/**
 * GET /store/cart/:id/night-delivery
 * Returns whether ALL products in the cart have night delivery enabled.
 * Used by checkout page to decide whether to show the Night Delivery option.
 */
const GET = async (req, res) => {
    const { id: cartId } = req.params;
    if (!cartId) {
        return res.status(400).json({ message: "Cart ID is required" });
    }
    const pg = req.scope.resolve(utils_1.ContainerRegistrationKeys.PG_CONNECTION);
    try {
        const result = await pg.raw(`SELECT cli.product_id, p.metadata
       FROM cart_line_item cli
       JOIN product p ON p.id = cli.product_id
       WHERE cli.cart_id = ?
         AND cli.deleted_at IS NULL
         AND p.deleted_at IS NULL`, [cartId]);
        const rows = result.rows ?? [];
        // Empty cart — default to allowed
        if (rows.length === 0) {
            return res.json({ night_delivery_allowed: true, product_count: 0 });
        }
        const enabledCount = rows.filter((row) => {
            const meta = row.metadata || {};
            return meta.night_delivery === true || meta.night_delivery === "true";
        }).length;
        const nightDeliveryAllowed = enabledCount === rows.length;
        return res.json({
            night_delivery_allowed: nightDeliveryAllowed,
            product_count: rows.length,
            enabled_count: enabledCount,
            disabled_count: rows.length - enabledCount,
        });
    }
    catch (err) {
        console.error("[Store Night Delivery] Error:", err);
        // Fail-open: don't block checkout on error
        return res.json({ night_delivery_allowed: true, product_count: 0, error: err.message });
    }
};
exports.GET = GET;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL2NhcnQvW2lkXS9uaWdodC1kZWxpdmVyeS9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSxxREFBcUU7QUFFeEQsUUFBQSxZQUFZLEdBQUcsS0FBSyxDQUFBO0FBRWpDOzs7O0dBSUc7QUFDSSxNQUFNLEdBQUcsR0FBRyxLQUFLLEVBQUUsR0FBa0IsRUFBRSxHQUFtQixFQUFFLEVBQUU7SUFDbkUsTUFBTSxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsTUFBd0IsQ0FBQTtJQUVuRCxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDWixPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLHFCQUFxQixFQUFFLENBQUMsQ0FBQTtJQUNqRSxDQUFDO0lBRUQsTUFBTSxFQUFFLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsaUNBQXlCLENBQUMsYUFBYSxDQUFDLENBQUE7SUFFckUsSUFBSSxDQUFDO1FBQ0gsTUFBTSxNQUFNLEdBQUcsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUN6Qjs7Ozs7a0NBSzRCLEVBQzVCLENBQUMsTUFBTSxDQUFDLENBQ1QsQ0FBQTtRQUVELE1BQU0sSUFBSSxHQUFpRCxNQUFNLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQTtRQUU1RSxrQ0FBa0M7UUFDbEMsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQ3RCLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLHNCQUFzQixFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNyRSxDQUFDO1FBRUQsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO1lBQ3ZDLE1BQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFBO1lBQy9CLE9BQU8sSUFBSSxDQUFDLGNBQWMsS0FBSyxJQUFJLElBQUksSUFBSSxDQUFDLGNBQWMsS0FBSyxNQUFNLENBQUE7UUFDdkUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFBO1FBRVQsTUFBTSxvQkFBb0IsR0FBRyxZQUFZLEtBQUssSUFBSSxDQUFDLE1BQU0sQ0FBQTtRQUV6RCxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUM7WUFDZCxzQkFBc0IsRUFBRSxvQkFBb0I7WUFDNUMsYUFBYSxFQUFFLElBQUksQ0FBQyxNQUFNO1lBQzFCLGFBQWEsRUFBRSxZQUFZO1lBQzNCLGNBQWMsRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLFlBQVk7U0FDM0MsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUFDLE9BQU8sR0FBUSxFQUFFLENBQUM7UUFDbEIsT0FBTyxDQUFDLEtBQUssQ0FBQywrQkFBK0IsRUFBRSxHQUFHLENBQUMsQ0FBQTtRQUNuRCwyQ0FBMkM7UUFDM0MsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsc0JBQXNCLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFBO0lBQ3pGLENBQUM7QUFDSCxDQUFDLENBQUE7QUE3Q1ksUUFBQSxHQUFHLE9BNkNmIn0=
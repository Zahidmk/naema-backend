"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTHENTICATE = void 0;
exports.POST = POST;
exports.AUTHENTICATE = true;
/**
 * POST /admin/orders/:id/delete
 * Soft-delete an order and all its related data
 */
async function POST(req, res) {
    const orderId = req.params.id;
    const pg = req.scope.resolve("__pg_connection__");
    try {
        // Verify order exists
        const orderCheck = await pg.raw(`SELECT id, display_id, status FROM "order" WHERE id = ? AND deleted_at IS NULL`, [orderId]);
        if (!orderCheck.rows?.length) {
            return res.status(404).json({ message: "Order not found" });
        }
        const displayId = orderCheck.rows[0].display_id;
        // Soft-delete all related data in correct order
        // 1. Shipping method tax lines & adjustments
        await pg.raw(`
      UPDATE order_shipping_method_tax_line SET deleted_at = NOW()
      WHERE deleted_at IS NULL AND shipping_method_id IN (
        SELECT shipping_method_id FROM order_shipping WHERE order_id = ?
      )`, [orderId]);
        await pg.raw(`
      UPDATE order_shipping_method_adjustment SET deleted_at = NOW()
      WHERE deleted_at IS NULL AND shipping_method_id IN (
        SELECT shipping_method_id FROM order_shipping WHERE order_id = ?
      )`, [orderId]);
        // 2. Shipping methods & shipping records
        await pg.raw(`
      UPDATE order_shipping_method SET deleted_at = NOW()
      WHERE deleted_at IS NULL AND id IN (
        SELECT shipping_method_id FROM order_shipping WHERE order_id = ?
      )`, [orderId]);
        await pg.raw(`UPDATE order_shipping SET deleted_at = NOW() WHERE order_id = ? AND deleted_at IS NULL`, [orderId]);
        // 3. Line item tax lines & adjustments
        await pg.raw(`
      UPDATE order_line_item_tax_line SET deleted_at = NOW()
      WHERE deleted_at IS NULL AND item_id IN (
        SELECT item_id FROM order_item WHERE order_id = ?
      )`, [orderId]);
        await pg.raw(`
      UPDATE order_line_item_adjustment SET deleted_at = NOW()
      WHERE deleted_at IS NULL AND item_id IN (
        SELECT item_id FROM order_item WHERE order_id = ?
      )`, [orderId]);
        // 4. Line items & order items
        await pg.raw(`
      UPDATE order_line_item SET deleted_at = NOW()
      WHERE deleted_at IS NULL AND id IN (
        SELECT item_id FROM order_item WHERE order_id = ?
      )`, [orderId]);
        await pg.raw(`UPDATE order_item SET deleted_at = NOW() WHERE order_id = ? AND deleted_at IS NULL`, [orderId]);
        // 5. Transactions
        await pg.raw(`UPDATE order_transaction SET deleted_at = NOW() WHERE order_id = ? AND deleted_at IS NULL`, [orderId]);
        // 6. Order changes & actions
        await pg.raw(`
      UPDATE order_change_action SET deleted_at = NOW()
      WHERE deleted_at IS NULL AND order_change_id IN (
        SELECT id FROM order_change WHERE order_id = ?
      )`, [orderId]);
        await pg.raw(`UPDATE order_change SET deleted_at = NOW() WHERE order_id = ? AND deleted_at IS NULL`, [orderId]);
        // 7. Summary, credit lines, promotions
        await pg.raw(`UPDATE order_summary SET deleted_at = NOW() WHERE order_id = ? AND deleted_at IS NULL`, [orderId]);
        await pg.raw(`UPDATE order_credit_line SET deleted_at = NOW() WHERE order_id = ? AND deleted_at IS NULL`, [orderId]);
        await pg.raw(`UPDATE order_promotion SET deleted_at = NOW() WHERE order_id = ? AND deleted_at IS NULL`, [orderId]);
        // 8. Payment collections & fulfillments
        await pg.raw(`UPDATE order_payment_collection SET deleted_at = NOW() WHERE order_id = ? AND deleted_at IS NULL`, [orderId]);
        await pg.raw(`UPDATE order_fulfillment SET deleted_at = NOW() WHERE order_id = ? AND deleted_at IS NULL`, [orderId]);
        // 9. Order-cart link (hard delete, no deleted_at)
        await pg.raw(`DELETE FROM order_cart WHERE order_id = ?`, [orderId]);
        // 10. Finally soft-delete the order itself
        await pg.raw(`UPDATE "order" SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL`, [orderId]);
        console.log(`[Admin] Order #${displayId} (${orderId}) deleted`);
        res.json({
            success: true,
            message: `Order #${displayId} deleted successfully`,
        });
    }
    catch (err) {
        console.error(`[Admin] Failed to delete order ${orderId}:`, err);
        res.status(500).json({
            message: err?.message || "Failed to delete order",
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL29yZGVycy9baWRdL2RlbGV0ZS9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFTQSxvQkFzSEM7QUE1SFksUUFBQSxZQUFZLEdBQUcsSUFBSSxDQUFBO0FBRWhDOzs7R0FHRztBQUNJLEtBQUssVUFBVSxJQUFJLENBQ3hCLEdBQWtCLEVBQ2xCLEdBQW1CO0lBRW5CLE1BQU0sT0FBTyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFBO0lBQzdCLE1BQU0sRUFBRSxHQUFTLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUE7SUFFdkQsSUFBSSxDQUFDO1FBQ0gsc0JBQXNCO1FBQ3RCLE1BQU0sVUFBVSxHQUFHLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FDN0IsZ0ZBQWdGLEVBQ2hGLENBQUMsT0FBTyxDQUFDLENBQ1YsQ0FBQTtRQUNELElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxDQUFDO1lBQzdCLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsQ0FBQyxDQUFBO1FBQzdELENBQUM7UUFFRCxNQUFNLFNBQVMsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQTtRQUUvQyxnREFBZ0Q7UUFDaEQsNkNBQTZDO1FBQzdDLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQzs7OztRQUlULEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFBO1FBRWhCLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQzs7OztRQUlULEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFBO1FBRWhCLHlDQUF5QztRQUN6QyxNQUFNLEVBQUUsQ0FB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
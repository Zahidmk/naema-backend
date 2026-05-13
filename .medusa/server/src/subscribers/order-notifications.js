"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.default = orderPlacedHandler;
const utils_1 = require("@medusajs/framework/utils");
const email_1 = require("../lib/email");
const firebase_1 = require("../lib/firebase");
/**
 * Order Placed Notification Subscriber
 * Sends email confirmation when an order is placed.
 * Uses nodemailer/Gmail SMTP directly (not the local notification provider).
 */
async function orderPlacedHandler({ event: { data }, container, }) {
    const orderService = container.resolve(utils_1.Modules.ORDER);
    const logger = container.resolve("logger");
    const pgConnection = container.resolve(utils_1.ContainerRegistrationKeys.PG_CONNECTION);
    try {
        // Get order details
        const order = await orderService.retrieveOrder(data.id, {
            relations: ["items", "shipping_address"],
        });
        if (!order.email) {
            logger.warn(`[OrderEmail] Order ${order.id} has no email address — skipping`);
            return;
        }
        // Build customer name from shipping address
        const firstName = order.shipping_address?.first_name || "";
        const lastName = order.shipping_address?.last_name || "";
        const customerName = `${firstName} ${lastName}`.trim() || "Valued Customer";
        // Calculate totals from items (Medusa v2 order.total/subtotal are undefined on retrieveOrder)
        const orderItems = (order.items || []).map((item) => ({
            title: item.title || item.product_title || "Product",
            quantity: item.quantity || 1,
            unit_price: item.unit_price || 0,
        }));
        const subtotal = orderItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
        const shippingAddress = order.shipping_address
            ? [
                order.shipping_address.address_1,
                order.shipping_address.city,
                order.shipping_address.country_code?.toUpperCase(),
            ]
                .filter(Boolean)
                .join(", ")
            : undefined;
        // ── Send Email ──────────────────────────────────────────────────────────
        await (0, email_1.sendOrderStatusEmail)("order.confirmed", order.email, {
            customerName,
            orderId: order.id,
            displayId: order.display_id,
            items: orderItems,
            subtotal,
            total: subtotal,
            currencyCode: order.currency_code || "kwd",
            shippingAddress,
        });
        logger.info(`[OrderEmail] ✅ Order confirmation sent to ${order.email} for order #${order.display_id}`);
        // ── Send Push Notification ───────────────────────────────────────────────
        // Find the customer's FCM token from their metadata
        if (order.customer_id) {
            try {
                const customerResult = await pgConnection.raw(`SELECT metadata FROM customer WHERE id = ?`, [order.customer_id]);
                const fcmToken = customerResult.rows?.[0]?.metadata?.fcm_token;
                if (fcmToken) {
                    await (0, firebase_1.sendPushNotification)({
                        fcmToken,
                        title: "Order Confirmed! 🎉",
                        body: `Your order #${order.display_id} has been placed successfully.`,
                        data: {
                            type: "order.placed",
                            order_id: order.id,
                            display_id: String(order.display_id),
                        },
                    });
                    logger.info(`[FCM] ✅ Push notification sent for order #${order.display_id}`);
                }
                else {
                    logger.info(`[FCM] No FCM token for customer ${order.customer_id} — skipping push`);
                }
            }
            catch (pushError) {
                // Never fail the subscriber because of push — email already sent
                logger.warn(`[FCM] Push notification failed: ${pushError.message}`);
            }
        }
    }
    catch (error) {
        logger.error(`[OrderEmail] ❌ Failed to send order confirmation for ${data.id}: ${error.message}`);
    }
}
exports.config = {
    event: "order.placed",
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3JkZXItbm90aWZpY2F0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zdWJzY3JpYmVycy9vcmRlci1ub3RpZmljYXRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQWFBLHFDQThGQztBQXZHRCxxREFBK0U7QUFDL0Usd0NBQW9EO0FBQ3BELDhDQUF1RDtBQUV2RDs7OztHQUlHO0FBQ1ksS0FBSyxVQUFVLGtCQUFrQixDQUFDLEVBQy9DLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxFQUNmLFNBQVMsR0FDc0I7SUFDL0IsTUFBTSxZQUFZLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxlQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDdEQsTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUMzQyxNQUFNLFlBQVksR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGlDQUF5QixDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBRWhGLElBQUksQ0FBQztRQUNILG9CQUFvQjtRQUNwQixNQUFNLEtBQUssR0FBRyxNQUFNLFlBQVksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRTtZQUN0RCxTQUFTLEVBQUUsQ0FBQyxPQUFPLEVBQUUsa0JBQWtCLENBQUM7U0FDekMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNqQixNQUFNLENBQUMsSUFBSSxDQUFDLHNCQUFzQixLQUFLLENBQUMsRUFBRSxrQ0FBa0MsQ0FBQyxDQUFDO1lBQzlFLE9BQU87UUFDVCxDQUFDO1FBRUQsNENBQTRDO1FBQzVDLE1BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxVQUFVLElBQUksRUFBRSxDQUFDO1FBQzNELE1BQU0sUUFBUSxHQUFJLEtBQUssQ0FBQyxnQkFBd0IsRUFBRSxTQUFTLElBQUksRUFBRSxDQUFDO1FB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
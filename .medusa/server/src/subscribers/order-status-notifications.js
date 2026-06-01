"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.default = orderFulfillmentCreatedHandler;
const utils_1 = require("@medusajs/framework/utils");
const email_1 = require("../lib/email");
/**
 * Order Status Email Notifications
 *
 * Sends branded emails to customers when admin changes order status:
 *   - order.placed        → "Order Confirmed" email
 *   - order.fulfillment_created → "Order Confirmed / Processing" email
 *   - order.shipment_created   → "Order Shipped" email
 *   - order.completed          → "Order Delivered" email
 *   - order.cancelled          → "Order Cancelled" email
 *
 * Also triggered by External ERP webhook updates stored in order metadata.
 */
// ─── Shared Helper ────────────────────────────────────────────────────────────
async function resolveOrderAndSend(orderId, emailType, container, extraData = {}) {
    const logger = container.resolve("logger");
    try {
        const orderService = container.resolve(utils_1.Modules.ORDER);
        const order = await orderService.retrieveOrder(orderId, {
            relations: ["items", "shipping_address"],
        });
        if (!order.email) {
            logger.warn(`[OrderStatusEmail] Order ${orderId} has no email — skipping ${emailType}`);
            return;
        }
        const customerName = order.shipping_address?.first_name ||
            "Valued Customer";
        const shippingAddress = order.shipping_address
            ? [
                order.shipping_address.address_1,
                order.shipping_address.city,
                order.shipping_address.province,
                order.shipping_address.country_code?.toUpperCase(),
            ]
                .filter(Boolean)
                .join(", ")
            : undefined;
        // Pull tracking info from order metadata (set by External ERP webhook)
        const metadata = order.metadata || {};
        // Calculate totals from items (Medusa v2 order.total/subtotal are not populated on retrieveOrder)
        const orderItems = (order.items || []).map((item) => ({
            title: item.title || item.product_title || "Product",
            quantity: item.quantity,
            unit_price: item.unit_price || 0,
        }));
        const calculatedSubtotal = orderItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
        await (0, email_1.sendOrderStatusEmail)(emailType, order.email, {
            customerName,
            orderId: order.id,
            displayId: order.display_id,
            items: orderItems,
            total: calculatedSubtotal,
            subtotal: calculatedSubtotal,
            currencyCode: order.currency_code || "kwd",
            shippingAddress,
            trackingNumber: extraData.tracking_number || metadata.tracking_number,
            trackingUrl: extraData.tracking_url || metadata.tracking_url,
            carrierName: extraData.carrier_name || metadata.carrier_name,
            cancelledReason: extraData.cancelled_reason || metadata.cancelled_reason,
        });
        logger.info(`[OrderStatusEmail] ✅ Sent "${emailType}" to ${order.email} for order #${order.display_id}`);
    }
    catch (err) {
        logger.error(`[OrderStatusEmail] ❌ Failed to send "${emailType}" for order ${orderId}: ${err.message}`);
    }
}
// ─── 1. Order Placed / Confirmed ─────────────────────────────────────────────
// (Note: order.placed is already handled by order-notifications.ts for the
//  "order confirmation" email. This one handles the admin-side "confirmed" status.)
async function orderFulfillmentCreatedHandler({ event: { data }, container, }) {
    // data.id is the fulfillment id; data.order_id is the order id
    const orderId = data.order_id || data.id;
    if (!orderId)
        return;
    await resolveOrderAndSend(orderId, "order.confirmed", container);
}
exports.config = {
    event: "order.fulfillment_created",
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3JkZXItc3RhdHVzLW5vdGlmaWNhdGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc3Vic2NyaWJlcnMvb3JkZXItc3RhdHVzLW5vdGlmaWNhdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBaUdBLGlEQVNDO0FBekdELHFEQUFvRDtBQUNwRCx3Q0FBb0U7QUFFcEU7Ozs7Ozs7Ozs7O0dBV0c7QUFFSCxpRkFBaUY7QUFFakYsS0FBSyxVQUFVLG1CQUFtQixDQUNoQyxPQUFlLEVBQ2YsU0FBeUIsRUFDekIsU0FBYyxFQUNkLFlBQWlDLEVBQUU7SUFFbkMsTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUUzQyxJQUFJLENBQUM7UUFDSCxNQUFNLFlBQVksR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGVBQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUV0RCxNQUFNLEtBQUssR0FBRyxNQUFNLFlBQVksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFO1lBQ3RELFNBQVMsRUFBRSxDQUFDLE9BQU8sRUFBRSxrQkFBa0IsQ0FBQztTQUN6QyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ2pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsNEJBQTRCLE9BQU8sNEJBQTRCLFNBQVMsRUFBRSxDQUFDLENBQUM7WUFDeEYsT0FBTztRQUNULENBQUM7UUFFRCxNQUFNLFlBQVksR0FDaEIsS0FBSyxDQUFDLGdCQUFnQixFQUFFLFVBQVU7WUFDbEMsaUJBQWlCLENBQUM7UUFFcEIsTUFBTSxlQUFlLEdBQUcsS0FBSyxDQUFDLGdCQUFnQjtZQUM1QyxDQUFDLENBQUM7Z0JBQ0UsS0FBSyxDQUFDLGdCQUFnQixDQUFDLFNBQVM7Z0JBQ2hDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJO2dCQUMzQixLQUFLLENBQUMsZ0JBQWdCLENB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
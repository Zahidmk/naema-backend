"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.default = orderCancelledHandler;
const utils_1 = require("@medusajs/framework/utils");
const email_1 = require("../lib/email");
/**
 * Order Cancelled → Sends "Your order has been cancelled" email
 * Triggered when admin or customer cancels an order.
 */
async function orderCancelledHandler({ event: { data }, container, }) {
    const logger = container.resolve("logger");
    const orderId = data.id;
    if (!orderId)
        return;
    try {
        const orderService = container.resolve(utils_1.Modules.ORDER);
        const order = await orderService.retrieveOrder(orderId, {
            relations: ["items", "shipping_address"],
        });
        if (!order.email) {
            logger.warn(`[CancelledEmail] Order ${orderId} has no email`);
            return;
        }
        const customerName = order.shipping_address?.first_name ||
            "Valued Customer";
        const metadata = order.metadata || {};
        await (0, email_1.sendOrderStatusEmail)("order.cancelled", order.email, {
            customerName,
            orderId: order.id,
            displayId: order.display_id,
            items: (order.items || []).map((item) => ({
                title: item.title || "Product",
                quantity: item.quantity,
                unit_price: item.unit_price || 0,
            })),
            total: Number(order.total || 0),
            subtotal: Number(order.subtotal || 0),
            currencyCode: order.currency_code || "kwd",
            cancelledReason: metadata.cancelled_reason,
        });
        logger.info(`[CancelledEmail] ✅ Sent cancelled email to ${order.email} for order #${order.display_id}`);
    }
    catch (err) {
        logger.error(`[CancelledEmail] ❌ Failed for order ${orderId}: ${err.message}`);
    }
}
exports.config = {
    event: "order.canceled",
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3JkZXItY2FuY2VsbGVkLW5vdGlmaWNhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zdWJzY3JpYmVycy9vcmRlci1jYW5jZWxsZWQtbm90aWZpY2F0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQVFBLHdDQStDQztBQXRERCxxREFBb0Q7QUFDcEQsd0NBQW9EO0FBRXBEOzs7R0FHRztBQUNZLEtBQUssVUFBVSxxQkFBcUIsQ0FBQyxFQUNsRCxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFDZixTQUFTLEdBQ3NCO0lBQy9CLE1BQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDM0MsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztJQUN4QixJQUFJLENBQUMsT0FBTztRQUFFLE9BQU87SUFFckIsSUFBSSxDQUFDO1FBQ0gsTUFBTSxZQUFZLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxlQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFdEQsTUFBTSxLQUFLLEdBQUcsTUFBTSxZQUFZLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRTtZQUN0RCxTQUFTLEVBQUUsQ0FBQyxPQUFPLEVBQUUsa0JBQWtCLENBQUM7U0FDekMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNqQixNQUFNLENBQUMsSUFBSSxDQUFDLDBCQUEwQixPQUFPLGVBQWUsQ0FBQyxDQUFDO1lBQzlELE9BQU87UUFDVCxDQUFDO1FBRUQsTUFBTSxZQUFZLEdBQ2hCLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxVQUFVO1lBQ2xDLGlCQUFpQixDQUFDO1FBRXBCLE1BQU0sUUFBUSxHQUF5QixLQUFhLENBQUMsUUFBUSxJQUFJLEVBQUUsQ0FBQztRQUVwRSxNQUFNLElBQUEsNEJBQW9CLEVBQUMsaUJBQWlCLEVBQUUsS0FBSyxDQUFDLEtBQUssRUFBRTtZQUN6RCxZQUFZO1lBQ1osT0FBTyxFQUFFLEtBQUssQ0FBQyxFQUFFO1lBQ2pCLFNBQVMsRUFBRSxLQUFLLENBQUMsVUFBVTtZQUMzQixLQUFLLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDN0MsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLElBQUksU0FBUztnQkFDOUIsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRO2dCQUN2QixVQUFVLEVBQUUsSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFDO2FBQ2pDLENBQUMsQ0FBQztZQUNILEtBQUssRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUM7WUFDL0IsUUFBUSxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxJQUFJLENBQUMsQ0FBQztZQUNyQyxZQUFZLEVBQUUsS0FBSyxDQUFDLGFBQWEsSUFBSSxLQUFLO1lBQzFDLGVBQWUsRUFBRSxRQUFRLENBQUMsZ0JBQWdCO1NBQzNDLENBQUMsQ0FBQztRQUVILE1BQU0sQ0FBQyxJQUFJLENBQ1QsOENBQThDLEtBQUssQ0FBQyxLQUFLLGVBQWUsS0FBSyxDQUFDLFVBQVUsRUFBRSxDQUMzRixDQUFDO0lBQ0osQ0FBQztJQUFDLE9BQU8sR0FBUSxFQUFFLENBQUM7UUFDbEIsTUFBTSxDQUFDLEtBQUssQ0FBQyx1Q0FBdUMsT0FBTyxLQUFLLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0lBQ2pGLENBQUM7QUFDSCxDQUFDO0FBRVksUUFBQSxNQUFNLEdBQXFCO0lBQ3RDLEtBQUssRUFBRSxnQkFBZ0I7Q0FDeEIsQ0FBQyJ9
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.default = orderCompletedHandler;
const utils_1 = require("@medusajs/framework/utils");
const email_1 = require("../lib/email");
/**
 * Order Completed → Sends "Your order has been delivered" email
 * Triggered when admin marks order as completed in Medusa admin dashboard.
 */
async function orderCompletedHandler({ event: { data }, container, }) {
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
            logger.warn(`[DeliveredEmail] Order ${orderId} has no email`);
            return;
        }
        const customerName = order.shipping_address?.first_name ||
            "Valued Customer";
        const shippingAddress = order.shipping_address
            ? [
                order.shipping_address.address_1,
                order.shipping_address.city,
                order.shipping_address.country_code?.toUpperCase(),
            ]
                .filter(Boolean)
                .join(", ")
            : undefined;
        await (0, email_1.sendOrderStatusEmail)("order.delivered", order.email, {
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
            shippingAddress,
        });
        logger.info(`[DeliveredEmail] ✅ Sent delivered email to ${order.email} for order #${order.display_id}`);
    }
    catch (err) {
        logger.error(`[DeliveredEmail] ❌ Failed for order ${orderId}: ${err.message}`);
    }
}
exports.config = {
    event: "order.completed",
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3JkZXItZGVsaXZlcmVkLW5vdGlmaWNhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zdWJzY3JpYmVycy9vcmRlci1kZWxpdmVyZWQtbm90aWZpY2F0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQVFBLHdDQXVEQztBQTlERCxxREFBb0Q7QUFDcEQsd0NBQW9EO0FBRXBEOzs7R0FHRztBQUNZLEtBQUssVUFBVSxxQkFBcUIsQ0FBQyxFQUNsRCxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFDZixTQUFTLEdBQ3NCO0lBQy9CLE1BQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDM0MsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztJQUN4QixJQUFJLENBQUMsT0FBTztRQUFFLE9BQU87SUFFckIsSUFBSSxDQUFDO1FBQ0gsTUFBTSxZQUFZLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxlQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFdEQsTUFBTSxLQUFLLEdBQUcsTUFBTSxZQUFZLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRTtZQUN0RCxTQUFTLEVBQUUsQ0FBQyxPQUFPLEVBQUUsa0JBQWtCLENBQUM7U0FDekMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNqQixNQUFNLENBQUMsSUFBSSxDQUFDLDBCQUEwQixPQUFPLGVBQWUsQ0FBQyxDQUFDO1lBQzlELE9BQU87UUFDVCxDQUFDO1FBRUQsTUFBTSxZQUFZLEdBQ2hCLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxVQUFVO1lBQ2xDLGlCQUFpQixDQUFDO1FBRXBCLE1BQU0sZUFBZSxHQUFHLEtBQUssQ0FBQyxnQkFBZ0I7WUFDNUMsQ0FBQyxDQUFDO2dCQUNFLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTO2dCQUNoQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsSUFBSTtnQkFDM0IsS0FBSyxDQUFDLGdCQUFnQixDQUFDLFlBQVksRUFBRSxXQUFXLEVBQUU7YUFDbkQ7aUJBQ0UsTUFBTSxDQUFDLE9BQU8sQ0FBQztpQkFDZixJQUFJLENBQUMsSUFBSSxDQUFDO1lBQ2YsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUVkLE1BQU0sSUFBQSw0QkFBb0IsRUFBQyxpQkFBaUIsRUFBRSxLQUFLLENBQUMsS0FBSyxFQUFFO1lBQ3pELFlBQVk7WUFDWixPQUFPLEVBQUUsS0FBSyxDQUFDLEVBQUU7WUFDakIsU0FBUyxFQUFFLEtBQUssQ0FBQyxVQUFVO1lBQzNCLEtBQUssRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUM3QyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssSUFBSSxTQUFTO2dCQUM5QixRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7Z0JBQ3ZCLFVBQVUsRUFBRSxJQUFJLENBQUMsVUFBVSxJQUFJLENBQUM7YUFDakMsQ0FBQyxDQUFDO1lBQ0gsS0FBSyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQztZQUMvQixRQUFRLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFDO1lBQ3JDLFlBQVksRUFBRSxLQUFLLENBQUMsYUFBYSxJQUFJLEtBQUs7WUFDMUMsZUFBZTtTQUNoQixDQUFDLENBQUM7UUFFSCxNQUFNLENBQUMsSUFBSSxDQUNULDhDQUE4QyxLQUFLLENBQUMsS0FBSyxlQUFlLEtBQUssQ0FBQyxVQUFVLEVBQUUsQ0FDM0YsQ0FBQztJQUNKLENBQUM7SUFBQyxPQUFPLEdBQVEsRUFBRSxDQUFDO1FBQ2xCLE1BQU0sQ0FBQyxLQUFLLENBQUMsdUNBQXVDLE9BQU8sS0FBSyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztJQUNqRixDQUFDO0FBQ0gsQ0FBQztBQUVZLFFBQUEsTUFBTSxHQUFxQjtJQUN0QyxLQUFLLEVBQUUsaUJBQWlCO0NBQ3pCLENBQUMifQ==
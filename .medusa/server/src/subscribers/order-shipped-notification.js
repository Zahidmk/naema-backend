"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.default = orderShipmentCreatedHandler;
const utils_1 = require("@medusajs/framework/utils");
const email_1 = require("../lib/email");
/**
 * Order Shipment Created → Sends "Your order has been shipped" email
 * Triggered when admin marks order as shipped in Medusa admin dashboard.
 */
async function orderShipmentCreatedHandler({ event: { data }, container, }) {
    const logger = container.resolve("logger");
    // data may have order_id directly or the id IS the order id
    const orderId = data.order_id || data.id;
    if (!orderId)
        return;
    try {
        const orderService = container.resolve(utils_1.Modules.ORDER);
        const order = await orderService.retrieveOrder(orderId, {
            relations: ["items", "shipping_address"],
        });
        if (!order.email) {
            logger.warn(`[ShipmentEmail] Order ${orderId} has no email`);
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
        // Tracking info from fulfillment data or order metadata
        const metadata = order.metadata || {};
        const trackingNumbers = data.tracking_numbers || [];
        const trackingNumber = trackingNumbers[0] || metadata.tracking_number || undefined;
        const trackingUrl = data.tracking_url || metadata.tracking_url || undefined;
        const carrierName = data.carrier_name || metadata.carrier_name || undefined;
        await (0, email_1.sendOrderStatusEmail)("order.shipped", order.email, {
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
            trackingNumber,
            trackingUrl,
            carrierName,
        });
        logger.info(`[ShipmentEmail] ✅ Sent shipped email to ${order.email} for order #${order.display_id}`);
    }
    catch (err) {
        logger.error(`[ShipmentEmail] ❌ Failed for order ${orderId}: ${err.message}`);
    }
}
exports.config = {
    event: "order.shipment_created",
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3JkZXItc2hpcHBlZC1ub3RpZmljYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc3Vic2NyaWJlcnMvb3JkZXItc2hpcHBlZC1ub3RpZmljYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBUUEsOENBb0VDO0FBM0VELHFEQUFvRDtBQUNwRCx3Q0FBb0Q7QUFFcEQ7OztHQUdHO0FBQ1ksS0FBSyxVQUFVLDJCQUEyQixDQUFDLEVBQ3hELEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxFQUNmLFNBQVMsR0FDeUM7SUFDbEQsTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUUzQyw0REFBNEQ7SUFDNUQsTUFBTSxPQUFPLEdBQUksSUFBWSxDQUFDLFFBQVEsSUFBSyxJQUFZLENBQUMsRUFBRSxDQUFDO0lBQzNELElBQUksQ0FBQyxPQUFPO1FBQUUsT0FBTztJQUVyQixJQUFJLENBQUM7UUFDSCxNQUFNLFlBQVksR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGVBQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUV0RCxNQUFNLEtBQUssR0FBRyxNQUFNLFlBQVksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFO1lBQ3RELFNBQVMsRUFBRSxDQUFDLE9BQU8sRUFBRSxrQkFBa0IsQ0FBQztTQUN6QyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ2pCLE1BQU0sQ0FBQyxJQUFJLENBQUMseUJBQXlCLE9BQU8sZUFBZSxDQUFDLENBQUM7WUFDN0QsT0FBTztRQUNULENBQUM7UUFFRCxNQUFNLFlBQVksR0FDaEIsS0FBSyxDQUFDLGdCQUFnQixFQUFFLFVBQVU7WUFDbEMsaUJBQWlCLENBQUM7UUFFcEIsTUFBTSxlQUFlLEdBQUcsS0FBSyxDQUFDLGdCQUFnQjtZQUM1QyxDQUFDLENBQUM7Z0JBQ0UsS0FBSyxDQUFDLGdCQUFnQixDQUFDLFNBQVM7Z0JBQ2hDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJO2dCQUMzQixLQUFLLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxFQUFFLFdBQVcsRUFBRTthQUNuRDtpQkFDRSxNQUFNLENBQUMsT0FBTyxDQUFDO2lCQUNmLElBQUksQ0FBQyxJQUFJLENBQUM7WUFDZixDQUFDLENBQUMsU0FBUyxDQUFDO1FBRWQsd0RBQXdEO1FBQ3hELE1BQU0sUUFBUSxHQUF5QixLQUFhLENBQUMsUUFBUSxJQUFJLEVBQUUsQ0FBQztRQUNwRSxNQUFNLGVBQWUsR0FBSSxJQUFZLENBQUMsZ0JBQWdCLElBQUksRUFBRSxDQUFDO1FBQzdELE1BQU0sY0FBYyxHQUNsQixlQUFlLENBQUMsQ0FBQyxDQUFDLElBQUksUUFBUSxDQUFDLGVBQWUsSUFBSSxTQUFTLENBQUM7UUFDOUQsTUFBTSxXQUFXLEdBQUksSUFBWSxDQUFDLFlBQVksSUFBSSxRQUFRLENBQUMsWUFBWSxJQUFJLFNBQVMsQ0FBQztRQUNyRixNQUFNLFdBQVcsR0FBSSxJQUFZLENBQUMsWUFBWSxJQUFJLFFBQVEsQ0FBQyxZQUFZLElBQUksU0FBUyxDQUFDO1FBRXJGLE1BQU0sSUFBQSw0QkFBb0IsRUFBQyxlQUFlLEVBQUUsS0FBSyxDQUFDLEtBQUssRUFBRTtZQUN2RCxZQUFZO1lBQ1osT0FBTyxFQUFFLEtBQUssQ0FBQyxFQUFFO1lBQ2pCLFNBQVMsRUFBRSxLQUFLLENBQUMsVUFBVTtZQUMzQixLQUFLLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDN0MsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLElBQUksU0FBUztnQkFDOUIsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRO2dCQUN2QixVQUFVLEVBQUUsSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFDO2FBQ2pDLENBQUMsQ0FBQztZQUNILEtBQUssRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUM7WUFDL0IsUUFBUSxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxJQUFJLENBQUMsQ0FBQztZQUNyQyxZQUFZLEVBQUUsS0FBSyxDQUFDLGFBQWEsSUFBSSxLQUFLO1lBQzFDLGVBQWU7WUFDZixjQUFjO1lBQ2QsV0FBVztZQUNYLFdBQVc7U0FDWixDQUFDLENBQUM7UUFFSCxNQUFNLENBQUMsSUFBSSxDQUNULDJDQUEyQyxLQUFLLENBQUMsS0FBSyxlQUFlLEtBQUssQ0FBQyxVQUFVLEVBQUUsQ0FDeEYsQ0FBQztJQUNKLENBQUM7SUFBQyxPQUFPLEdBQVEsRUFBRSxDQUFDO1FBQ2xCLE1BQU0sQ0FBQyxLQUFLLENBQUMsc0NBQXNDLE9BQU8sS0FBSyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztJQUNoRixDQUFDO0FBQ0gsQ0FBQztBQUVZLFFBQUEsTUFBTSxHQUFxQjtJQUN0QyxLQUFLLEVBQUUsd0JBQXdCO0NBQ2hDLENBQUMifQ==
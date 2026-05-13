"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.default = orderStatusPushHandler;
const utils_1 = require("@medusajs/framework/utils");
const firebase_1 = require("../lib/firebase");
/**
 * Order Status Push Notification Subscriber
 * Fires when Odoo webhook updates order metadata (shipped/delivered/cancelled)
 *
 * The Odoo webhook at POST /odoo/webhooks/order-status emits this custom event
 * after updating order metadata.
 */
async function orderStatusPushHandler({ event: { data }, container, }) {
    const logger = container.resolve("logger");
    const pgConnection = container.resolve(utils_1.ContainerRegistrationKeys.PG_CONNECTION);
    const { order_id, customer_id, display_id, event_type, tracking_number, carrier_name } = data;
    if (!customer_id) {
        logger.info(`[FCM] No customer_id for order ${order_id} — skipping push`);
        return;
    }
    try {
        // Get FCM token from customer metadata
        const customerResult = await pgConnection.raw(`SELECT metadata FROM customer WHERE id = ?`, [customer_id]);
        const fcmToken = customerResult.rows?.[0]?.metadata?.fcm_token;
        if (!fcmToken) {
            logger.info(`[FCM] No FCM token for customer ${customer_id} — skipping push`);
            return;
        }
        // Build notification content based on event type
        let title = "";
        let body = "";
        const pushData = {
            type: event_type,
            order_id,
            display_id: String(display_id || ""),
        };
        switch (event_type) {
            case "order.shipped":
                title = "Your Order is On the Way! 🚚";
                body = tracking_number
                    ? `Order #${display_id} shipped via ${carrier_name || "courier"}. Tracking: ${tracking_number}`
                    : `Order #${display_id} has been shipped and is on its way!`;
                if (tracking_number)
                    pushData.tracking_number = tracking_number;
                break;
            case "order.delivered":
                title = "Order Delivered! ✅";
                body = `Order #${display_id} has been delivered. Enjoy your purchase!`;
                break;
            case "order.cancelled":
                title = "Order Cancelled";
                body = `Order #${display_id} has been cancelled. Contact support if you need help.`;
                break;
            case "order.confirmed":
                title = "Order Confirmed! 🎉";
                body = `Order #${display_id} is confirmed and being prepared.`;
                break;
            default:
                logger.info(`[FCM] Unknown event type ${event_type} — skipping push`);
                return;
        }
        await (0, firebase_1.sendPushNotification)({ fcmToken, title, body, data: pushData });
        logger.info(`[FCM] ✅ Push sent for ${event_type} — order #${display_id}`);
    }
    catch (error) {
        logger.warn(`[FCM] Push failed for ${event_type}: ${error.message}`);
    }
}
exports.config = {
    event: "order.status.updated",
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3JkZXItc3RhdHVzLXB1c2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc3Vic2NyaWJlcnMvb3JkZXItc3RhdHVzLXB1c2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBY0EseUNBK0VDO0FBekZELHFEQUFzRTtBQUN0RSw4Q0FBdUQ7QUFFdkQ7Ozs7OztHQU1HO0FBQ1ksS0FBSyxVQUFVLHNCQUFzQixDQUFDLEVBQ25ELEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxFQUNmLFNBQVMsR0FTVDtJQUNBLE1BQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDM0MsTUFBTSxZQUFZLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxpQ0FBeUIsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUVoRixNQUFNLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLGVBQWUsRUFBRSxZQUFZLEVBQUUsR0FBRyxJQUFJLENBQUM7SUFFOUYsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ2pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsa0NBQWtDLFFBQVEsa0JBQWtCLENBQUMsQ0FBQztRQUMxRSxPQUFPO0lBQ1QsQ0FBQztJQUVELElBQUksQ0FBQztRQUNILHVDQUF1QztRQUN2QyxNQUFNLGNBQWMsR0FBRyxNQUFNLFlBQVksQ0FBQyxHQUFHLENBQzNDLDRDQUE0QyxFQUM1QyxDQUFDLFdBQVcsQ0FBQyxDQUNkLENBQUM7UUFFRixNQUFNLFFBQVEsR0FBRyxjQUFjLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLFNBQVMsQ0FBQztRQUUvRCxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDZCxNQUFNLENBQUMsSUFBSSxDQUFDLG1DQUFtQyxXQUFXLGtCQUFrQixDQUFDLENBQUM7WUFDOUUsT0FBTztRQUNULENBQUM7UUFFRCxpREFBaUQ7UUFDakQsSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDO1FBQ2YsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ2QsTUFBTSxRQUFRLEdBQTJCO1lBQ3ZDLElBQUksRUFBRSxVQUFVO1lBQ2hCLFFBQVE7WUFDUixVQUFVLEVBQUUsTUFBTSxDQUFDLFVBQVUsSUFBSSxFQUFFLENBQUM7U0FDckMsQ0FBQztRQUVGLFFBQVEsVUFBVSxFQUFFLENBQUM7WUFDbkIsS0FBSyxlQUFlO2dCQUNsQixLQUFLLEdBQUcsOEJBQThCLENBQUM7Z0JBQ3ZDLElBQUksR0FBRyxlQUFlO29CQUNwQixDQUFDLENBQUMsVUFBVSxVQUFVLGdCQUFnQixZQUFZLElBQUksU0FBUyxlQUFlLGVBQWUsRUFBRTtvQkFDL0YsQ0FBQyxDQUFDLFVBQVUsVUFBVSxzQ0FBc0MsQ0FBQztnQkFDL0QsSUFBSSxlQUFlO29CQUFFLFFBQVEsQ0FBQyxlQUFlLEdBQUcsZUFBZSxDQUFDO2dCQUNoRSxNQUFNO1lBRVIsS0FBSyxpQkFBaUI7Z0JBQ3BCLEtBQUssR0FBRyxvQkFBb0IsQ0FBQztnQkFDN0IsSUFBSSxHQUFHLFVBQVUsVUFBVSwyQ0FBMkMsQ0FBQztnQkFDdkUsTUFBTTtZQUVSLEtBQUssaUJBQWlCO2dCQUNwQixLQUFLLEdBQUcsaUJBQWlCLENBQUM7Z0JBQzFCLElBQUksR0FBRyxVQUFVLFVBQVUsd0RBQXdELENBQUM7Z0JBQ3BGLE1BQU07WUFFUixLQUFLLGlCQUFpQjtnQkFDcEIsS0FBSyxHQUFHLHFCQUFxQixDQUFDO2dCQUM5QixJQUFJLEdBQUcsVUFBVSxVQUFVLG1DQUFtQyxDQUFDO2dCQUMvRCxNQUFNO1lBRVI7Z0JBQ0UsTUFBTSxDQUFDLElBQUksQ0FBQyw0QkFBNEIsVUFBVSxrQkFBa0IsQ0FBQyxDQUFDO2dCQUN0RSxPQUFPO1FBQ1gsQ0FBQztRQUVELE1BQU0sSUFBQSwrQkFBb0IsRUFBQyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQ3RFLE1BQU0sQ0FBQyxJQUFJLENBQUMseUJBQXlCLFVBQVUsYUFBYSxVQUFVLEVBQUUsQ0FBQyxDQUFDO0lBQzVFLENBQUM7SUFBQyxPQUFPLEtBQVUsRUFBRSxDQUFDO1FBQ3BCLE1BQU0sQ0FBQyxJQUFJLENBQUMseUJBQXlCLFVBQVUsS0FBSyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztJQUN2RSxDQUFDO0FBQ0gsQ0FBQztBQUVZLFFBQUEsTUFBTSxHQUFxQjtJQUN0QyxLQUFLLEVBQUUsc0JBQXNCO0NBQzlCLENBQUMifQ==
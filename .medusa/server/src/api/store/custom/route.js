"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
async function GET(req, res) {
    const freeThreshold = Number(process.env.FREE_DELIVERY_THRESHOLD_KWD || 7);
    const shippingBelowThreshold = Number(process.env.SHIPPING_CHARGE_BELOW_THRESHOLD_KWD || 1);
    const options = [
        {
            key: "night",
            label: "Night Delivery",
            label_ar: "توصيل ليلي",
        },
        {
            key: "fast",
            label: "Fast Delivery",
            label_ar: "توصيل سريع",
        },
        {
            key: "normal",
            label: "Normal Delivery",
            label_ar: "توصيل عادي",
        },
    ];
    res.status(200).json({
        delivery_options: options,
        shipping_policy: {
            currency: "KWD",
            free_delivery_threshold: freeThreshold,
            charge_below_threshold: shippingBelowThreshold,
            summary: `Free delivery for ${freeThreshold} KD or above, otherwise ${shippingBelowThreshold} KD shipping charge.`,
        },
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL2N1c3RvbS9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLGtCQW9DQztBQXBDTSxLQUFLLFVBQVUsR0FBRyxDQUN2QixHQUFrQixFQUNsQixHQUFtQjtJQUVuQixNQUFNLGFBQWEsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUMzRSxNQUFNLHNCQUFzQixHQUFHLE1BQU0sQ0FDbkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQ0FBbUMsSUFBSSxDQUFDLENBQ3JELENBQUM7SUFFRixNQUFNLE9BQU8sR0FBRztRQUNkO1lBQ0UsR0FBRyxFQUFFLE9BQU87WUFDWixLQUFLLEVBQUUsZ0JBQWdCO1lBQ3ZCLFFBQVEsRUFBRSxZQUFZO1NBQ3ZCO1FBQ0Q7WUFDRSxHQUFHLEVBQUUsTUFBTTtZQUNYLEtBQUssRUFBRSxlQUFlO1lBQ3RCLFFBQVEsRUFBRSxZQUFZO1NBQ3ZCO1FBQ0Q7WUFDRSxHQUFHLEVBQUUsUUFBUTtZQUNiLEtBQUssRUFBRSxpQkFBaUI7WUFDeEIsUUFBUSxFQUFFLFlBQVk7U0FDdkI7S0FDRixDQUFDO0lBRUYsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDbkIsZ0JBQWdCLEVBQUUsT0FBTztRQUN6QixlQUFlLEVBQUU7WUFDZixRQUFRLEVBQUUsS0FBSztZQUNmLHVCQUF1QixFQUFFLGFBQWE7WUFDdEMsc0JBQXNCLEVBQUUsc0JBQXNCO1lBQzlDLE9BQU8sRUFBRSxxQkFBcUIsYUFBYSwyQkFBMkIsc0JBQXNCLHNCQUFzQjtTQUNuSDtLQUNGLENBQUMsQ0FBQztBQUNMLENBQUMifQ==
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const utils_1 = require("@medusajs/framework/utils");
async function GET(req, res) {
    const freeThreshold = Number(process.env.FREE_DELIVERY_THRESHOLD_KWD || 7);
    const shippingBelowThreshold = Number(process.env.SHIPPING_CHARGE_BELOW_THRESHOLD_KWD || 1);
    // Fetch real shipping option IDs + prices from DB
    let nightId = "so_night_delivery_marqa_01";
    let fastId = "so_01KAARY0HHVCJT1JG3F80QTK65"; // Express Shipping
    let normalId = "so_01KAARY0HHJP2Z1QQ17J33V2H4"; // Standard Shipping
    let nightPrice = 2.000;
    let fastPrice = 1.500;
    let normalPrice = 1.000;
    try {
        const pgConnection = req.scope.resolve(utils_1.ContainerRegistrationKeys.PG_CONNECTION);
        const rows = await pgConnection.raw(`
      SELECT so.id, so.name, p.amount
      FROM shipping_option so
      JOIN shipping_option_price_set sops ON sops.shipping_option_id = so.id
      JOIN price p ON p.price_set_id = sops.price_set_id
      WHERE so.deleted_at IS NULL
        AND p.currency_code = 'kwd'
      ORDER BY p.amount ASC
    `);
        for (const row of rows.rows || []) {
            const name = (row.name || "").toLowerCase();
            if (name.includes("night")) {
                nightId = row.id;
                nightPrice = row.amount / 1000;
            }
            else if (name.includes("express") || name.includes("fast")) {
                fastId = row.id;
                fastPrice = row.amount / 1000;
            }
            else if (name.includes("standard") || name.includes("normal")) {
                normalId = row.id;
                normalPrice = row.amount / 1000;
            }
        }
    }
    catch (e) {
        // Fall back to hardcoded values if DB query fails
        console.warn("[custom/route] Could not load shipping options from DB:", e);
    }
    const options = [
        {
            key: "night",
            id: nightId,
            label: "Night Delivery",
            label_ar: "توصيل ليلي",
            price: nightPrice,
            estimated_days: "Same night",
            estimated_days_ar: "نفس الليلة",
        },
        {
            key: "fast",
            id: fastId,
            label: "Fast Delivery",
            label_ar: "توصيل سريع",
            price: fastPrice,
            estimated_days: "1-2 days",
            estimated_days_ar: "١-٢ أيام",
        },
        {
            key: "normal",
            id: normalId,
            label: "Normal Delivery",
            label_ar: "توصيل عادي",
            price: normalPrice,
            estimated_days: "3-5 days",
            estimated_days_ar: "٣-٥ أيام",
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL2N1c3RvbS9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUdBLGtCQXNGQztBQXhGRCxxREFBc0U7QUFFL0QsS0FBSyxVQUFVLEdBQUcsQ0FDdkIsR0FBa0IsRUFDbEIsR0FBbUI7SUFFbkIsTUFBTSxhQUFhLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsMkJBQTJCLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDM0UsTUFBTSxzQkFBc0IsR0FBRyxNQUFNLENBQ25DLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUNBQW1DLElBQUksQ0FBQyxDQUNyRCxDQUFDO0lBRUYsa0RBQWtEO0lBQ2xELElBQUksT0FBTyxHQUFHLDRCQUE0QixDQUFDO0lBQzNDLElBQUksTUFBTSxHQUFJLCtCQUErQixDQUFDLENBQUMsbUJBQW1CO0lBQ2xFLElBQUksUUFBUSxHQUFHLCtCQUErQixDQUFDLENBQUMsb0JBQW9CO0lBQ3BFLElBQUksVUFBVSxHQUFJLEtBQUssQ0FBQztJQUN4QixJQUFJLFNBQVMsR0FBSyxLQUFLLENBQUM7SUFDeEIsSUFBSSxXQUFXLEdBQUcsS0FBSyxDQUFDO0lBRXhCLElBQUksQ0FBQztRQUNILE1BQU0sWUFBWSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGlDQUF5QixDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ2hGLE1BQU0sSUFBSSxHQUFHLE1BQU0sWUFBWSxDQUFDLEdBQUcsQ0FBQzs7Ozs7Ozs7S0FRbkMsQ0FBQyxDQUFDO1FBRUgsS0FBSyxNQUFNLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLEVBQUUsRUFBRSxDQUFDO1lBQ2xDLE1BQU0sSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUM1QyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztnQkFDM0IsT0FBTyxHQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQ3BCLFVBQVUsR0FBRyxHQUFHLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztZQUNqQyxDQUFDO2lCQUFNLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7Z0JBQzdELE1BQU0sR0FBTSxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUNuQixTQUFTLEdBQUcsR0FBRyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7WUFDaEMsQ0FBQztpQkFBTSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO2dCQUNoRSxRQUFRLEdBQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDckIsV0FBVyxHQUFHLEdBQUcsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1lBQ2xDLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7UUFDWCxrREFBa0Q7UUFDbEQsT0FBTyxDQUFDLElBQUksQ0FBQyx5REFBeUQsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUM3RSxDQUFDO0lBRUQsTUFBTSxPQUFPLEdBQUc7UUFDZDtZQUNFLEdBQUcsRUFBRSxPQUFPO1lBQ1osRUFBRSxFQUFFLE9BQU87WUFDWCxLQUFLLEVBQUUsZ0JBQWdCO1lBQ3ZCLFFBQVEsRUFBRSxZQUFZO1lBQ3RCLEtBQUssRUFBRSxVQUFVO1lBQ2pCLGNBQWMsRUFBRSxZQUFZO1lBQzVCLGlCQUFpQixFQUFFLFlBQVk7U0FDaEM7UUFDRDtZQUNFLEdBQUcsRUFBRSxNQUFNO1lBQ1gsRUFBRSxFQUFFLE1BQU07WUFDVixLQUFLLEVBQUUsZUFBZTtZQUN0QixRQUFRLEVBQUUsWUFBWTtZQUN0QixLQUFLLEVBQUUsU0FBUztZQUNoQixjQUFjLEVBQUUsVUFBVTtZQUMxQixpQkFBaUIsRUFBRSxVQUFVO1NBQzlCO1FBQ0Q7WUFDRSxHQUFHLEVBQUUsUUFBUTtZQUNiLEVBQUUsRUFBRSxRQUFRO1lBQ1osS0FBSyxFQUFFLGlCQUFpQjtZQUN4QixRQUFRLEVBQUUsWUFBWTtZQUN0QixLQUFLLEVBQUUsV0FBVztZQUNsQixjQUFjLEVBQUUsVUFBVTtZQUMxQixpQkFBaUIsRUFBRSxVQUFVO1NBQzlCO0tBQ0YsQ0FBQztJQUVGLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQ25CLGdCQUFnQixFQUFFLE9BQU87UUFDekIsZUFBZSxFQUFFO1lBQ2YsUUFBUSxFQUFFLEtBQUs7WUFDZix1QkFBdUIsRUFBRSxhQUFhO1lBQ3RDLHNCQUFzQixFQUFFLHNCQUFzQjtZQUM5QyxPQUFPLEVBQUUscUJBQXFCLGFBQWEsMkJBQTJCLHNCQUFzQixzQkFBc0I7U0FDbkg7S0FDRixDQUFDLENBQUM7QUFDTCxDQUFDIn0=
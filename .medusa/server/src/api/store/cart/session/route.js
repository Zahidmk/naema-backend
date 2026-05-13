"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTHENTICATE = void 0;
exports.GET = GET;
exports.POST = POST;
const utils_1 = require("@medusajs/framework/utils");
exports.AUTHENTICATE = true;
/**
 * GET /store/cart/session
 *
 * Returns the cart_id saved on the customer's server account.
 * Use this on login to restore the cart on any device.
 *
 * Headers:
 *   Authorization: Bearer {customer_token}
 *
 * Response 200:
 * {
 *   "cart_id": "cart_01ABC..."   // null if no saved cart
 * }
 */
async function GET(req, res) {
    const customer_id = req.auth_context?.actor_id;
    if (!customer_id) {
        return res.status(401).json({ message: "Unauthenticated" });
    }
    const pgConnection = req.scope.resolve(utils_1.ContainerRegistrationKeys.PG_CONNECTION);
    const result = await pgConnection.raw(`SELECT metadata FROM customer WHERE id = ? AND deleted_at IS NULL`, [customer_id]);
    if (!result.rows || result.rows.length === 0) {
        return res.status(404).json({ message: "Customer not found" });
    }
    const metadata = result.rows[0].metadata || {};
    const cart_id = metadata.cart_id || null;
    return res.json({ cart_id });
}
/**
 * POST /store/cart/session
 *
 * Saves the customer's active cart_id to their server account.
 * Call this after creating or updating the cart so it persists across devices.
 *
 * Headers:
 *   Authorization: Bearer {customer_token}
 *   Content-Type: application/json
 *
 * Body:
 * {
 *   "cart_id": "cart_01ABC..."    // pass null to clear
 * }
 *
 * Response 200:
 * {
 *   "success": true,
 *   "cart_id": "cart_01ABC..."
 * }
 */
async function POST(req, res) {
    const customer_id = req.auth_context?.actor_id;
    if (!customer_id) {
        return res.status(401).json({ message: "Unauthenticated" });
    }
    const { cart_id } = req.body;
    if (cart_id !== null && cart_id !== undefined && typeof cart_id !== "string") {
        return res.status(400).json({ message: "cart_id must be a string or null" });
    }
    const pgConnection = req.scope.resolve(utils_1.ContainerRegistrationKeys.PG_CONNECTION);
    // Get current metadata to merge (don't overwrite other metadata fields)
    const customerResult = await pgConnection.raw(`SELECT metadata FROM customer WHERE id = ? AND deleted_at IS NULL`, [customer_id]);
    if (!customerResult.rows || customerResult.rows.length === 0) {
        return res.status(404).json({ message: "Customer not found" });
    }
    const existingMetadata = customerResult.rows[0].metadata || {};
    const updatedMetadata = {
        ...existingMetadata,
        cart_id: cart_id ?? null,
    };
    await pgConnection.raw(`UPDATE customer SET metadata = ?, updated_at = NOW() WHERE id = ?`, [JSON.stringify(updatedMetadata), customer_id]);
    return res.json({
        success: true,
        cart_id: cart_id ?? null,
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL2NhcnQvc2Vzc2lvbi9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFtQkEsa0JBcUJDO0FBdUJELG9CQXVDQztBQXJHRCxxREFBOEU7QUFFakUsUUFBQSxZQUFZLEdBQUcsSUFBSSxDQUFBO0FBRWhDOzs7Ozs7Ozs7Ozs7O0dBYUc7QUFDSSxLQUFLLFVBQVUsR0FBRyxDQUFDLEdBQStCLEVBQUUsR0FBbUI7SUFDNUUsTUFBTSxXQUFXLEdBQUcsR0FBRyxDQUFDLFlBQVksRUFBRSxRQUFRLENBQUE7SUFDOUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ2pCLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsQ0FBQyxDQUFBO0lBQzdELENBQUM7SUFFRCxNQUFNLFlBQVksR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxpQ0FBeUIsQ0FBQyxhQUFhLENBQUMsQ0FBQTtJQUUvRSxNQUFNLE1BQU0sR0FBRyxNQUFNLFlBQVksQ0FBQyxHQUFHLENBQ25DLG1FQUFtRSxFQUNuRSxDQUFDLFdBQVcsQ0FBQyxDQUNkLENBQUE7SUFFRCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUM3QyxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLG9CQUFvQixFQUFFLENBQUMsQ0FBQTtJQUNoRSxDQUFDO0lBRUQsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFBO0lBQzlDLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFBO0lBRXhDLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUE7QUFDOUIsQ0FBQztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQW9CRztBQUNJLEtBQUssVUFBVSxJQUFJLENBQUMsR0FBK0IsRUFBRSxHQUFtQjtJQUM3RSxNQUFNLFdBQVcsR0FBRyxHQUFHLENBQUMsWUFBWSxFQUFFLFFBQVEsQ0FBQTtJQUM5QyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDakIsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxDQUFDLENBQUE7SUFDN0QsQ0FBQztJQUVELE1BQU0sRUFBRSxPQUFPLEVBQUUsR0FBRyxHQUFHLENBQUMsSUFBbUMsQ0FBQTtJQUUzRCxJQUFJLE9BQU8sS0FBSyxJQUFJLElBQUksT0FBTyxLQUFLLFNBQVMsSUFBSSxPQUFPLE9BQU8sS0FBSyxRQUFRLEVBQUUsQ0FBQztRQUM3RSxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLGtDQUFrQyxFQUFFLENBQUMsQ0FBQTtJQUM5RSxDQUFDO0lBRUQsTUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsaUNBQXlCLENBQUMsYUFBYSxDQUFDLENBQUE7SUFFL0Usd0VBQXdFO0lBQ3hFLE1BQU0sY0FBYyxHQUFHLE1BQU0sWUFBWSxDQUFDLEdBQUcsQ0FDM0MsbUVBQW1FLEVBQ25FLENBQUMsV0FBVyxDQUFDLENBQ2QsQ0FBQTtJQUVELElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxJQUFJLGNBQWMsQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO1FBQzdELE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsQ0FBQyxDQUFBO0lBQ2hFLENBQUM7SUFFRCxNQUFNLGdCQUFnQixHQUFHLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxJQUFJLEVBQUUsQ0FBQTtJQUM5RCxNQUFNLGVBQWUsR0FBRztRQUN0QixHQUFHLGdCQUFnQjtRQUNuQixPQUFPLEVBQUUsT0FBTyxJQUFJLElBQUk7S0FDekIsQ0FBQTtJQUVELE1BQU0sWUFBWSxDQUFDLEdBQUcsQ0FDcEIsbUVBQW1FLEVBQ25FLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FDL0MsQ0FBQTtJQUVELE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQztRQUNkLE9BQU8sRUFBRSxJQUFJO1FBQ2IsT0FBTyxFQUFFLE9BQU8sSUFBSSxJQUFJO0tBQ3pCLENBQUMsQ0FBQTtBQUNKLENBQUMifQ==
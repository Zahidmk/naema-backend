"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const utils_1 = require("@medusajs/framework/utils");
const core_flows_1 = require("@medusajs/medusa/core-flows");
/**
 * POST /store/orders/:id/cancel
 *
 * Allows a logged-in customer to cancel their own pending order.
 * Medusa v2 has no built-in store cancel endpoint, so we implement it here.
 *
 * Auth: requires customer bearer/session token (enforced via middlewares.ts)
 */
async function POST(req, res) {
    const { id } = req.params;
    // The authenticate middleware attaches the customer actor to req.auth_context
    const customerId = req.auth_context?.actor_id;
    if (!customerId) {
        return res.status(401).json({ message: "Unauthorized: not logged in" });
    }
    try {
        const orderService = req.scope.resolve(utils_1.Modules.ORDER);
        // Fetch the order (no "customer" relation in Medusa v2 — customer_id is a scalar field)
        const [order] = await orderService.listOrders({ id }, { relations: ["items"] });
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        // Security: ensure the order belongs to this customer
        if (order.customer_id !== customerId) {
            return res.status(403).json({ message: "Forbidden: this order does not belong to you" });
        }
        // Can only cancel non-completed orders
        const nonCancellableStatuses = ["canceled", "completed", "archived"];
        if (nonCancellableStatuses.includes(order.status)) {
            return res.status(400).json({
                message: `Order cannot be cancelled (current status: ${order.status})`,
            });
        }
        // Cancel using Medusa order workflow
        await (0, core_flows_1.cancelOrderWorkflow)(req.scope).run({
            input: { order_id: id },
        });
        // Re-fetch updated order
        const [updatedOrder] = await orderService.listOrders({ id }, {});
        return res.status(200).json({ order: updatedOrder, success: true });
    }
    catch (err) {
        console.error("[store/orders/cancel] error:", err?.message || err);
        return res.status(500).json({
            message: err?.message || "Failed to cancel order",
            success: false,
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL29yZGVycy9baWRdL2NhbmNlbC9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQVlBLG9CQW9EQztBQS9ERCxxREFBbUQ7QUFDbkQsNERBQWlFO0FBRWpFOzs7Ozs7O0dBT0c7QUFDSSxLQUFLLFVBQVUsSUFBSSxDQUFDLEdBQWtCLEVBQUUsR0FBbUI7SUFDaEUsTUFBTSxFQUFFLEVBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxNQUF3QixDQUFBO0lBRTNDLDhFQUE4RTtJQUM5RSxNQUFNLFVBQVUsR0FBSSxHQUFXLENBQUMsWUFBWSxFQUFFLFFBQVEsQ0FBQTtJQUV0RCxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDaEIsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSw2QkFBNkIsRUFBRSxDQUFDLENBQUE7SUFDekUsQ0FBQztJQUVELElBQUksQ0FBQztRQUNILE1BQU0sWUFBWSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGVBQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUVyRCx3RkFBd0Y7UUFDeEYsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLE1BQU0sWUFBWSxDQUFDLFVBQVUsQ0FDM0MsRUFBRSxFQUFFLEVBQUUsRUFDTixFQUFFLFNBQVMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQ3pCLENBQUE7UUFFRCxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDWCxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLENBQUMsQ0FBQTtRQUM3RCxDQUFDO1FBRUQsc0RBQXNEO1FBQ3RELElBQUksS0FBSyxDQUFDLFdBQVcsS0FBSyxVQUFVLEVBQUUsQ0FBQztZQUNyQyxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLDhDQUE4QyxFQUFFLENBQUMsQ0FBQTtRQUMxRixDQUFDO1FBRUQsdUNBQXVDO1FBQ3ZDLE1BQU0sc0JBQXNCLEdBQUcsQ0FBQyxVQUFVLEVBQUUsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFBO1FBQ3BFLElBQUksc0JBQXNCLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1lBQ2xELE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBQzFCLE9BQU8sRUFBRSw4Q0FBOEMsS0FBSyxDQUFDLE1BQU0sR0FBRzthQUN2RSxDQUFDLENBQUE7UUFDSixDQUFDO1FBRUQscUNBQXFDO1FBQ3JDLE1BQU0sSUFBQSxnQ0FBbUIsRUFBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDO1lBQ3ZDLEtBQUssRUFBRSxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUU7U0FDeEIsQ0FBQyxDQUFBO1FBRUYseUJBQXlCO1FBQ3pCLE1BQU0sQ0FBQyxZQUFZLENBQUMsR0FBRyxNQUFNLFlBQVksQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQTtRQUVoRSxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQTtJQUNyRSxDQUFDO0lBQUMsT0FBTyxHQUFRLEVBQUUsQ0FBQztRQUNsQixPQUFPLENBQUMsS0FBSyxDQUFDLDhCQUE4QixFQUFFLEdBQUcsRUFBRSxPQUFPLElBQUksR0FBRyxDQUFDLENBQUE7UUFDbEUsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUMxQixPQUFPLEVBQUUsR0FBRyxFQUFFLE9BQU8sSUFBSSx3QkFBd0I7WUFDakQsT0FBTyxFQUFFLEtBQUs7U0FDZixDQUFDLENBQUE7SUFDSixDQUFDO0FBQ0gsQ0FBQyJ9
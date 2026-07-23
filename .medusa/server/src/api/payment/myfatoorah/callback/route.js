"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const core_flows_1 = require("@medusajs/core-flows");
const client_1 = require("../../../../modules/myfatoorah/client");
async function GET(req, res) {
    const { paymentId, Id } = req.query;
    const referenceId = (paymentId || Id);
    if (!referenceId) {
        res.redirect(302, `${process.env.STORE_URL}/checkout?error=missing_payment_id`);
        return;
    }
    try {
        const client = new client_1.MyFatoorahClient();
        const statusData = await client.getPaymentStatus({
            Key: referenceId,
            KeyType: "PaymentId"
        });
        const cartId = statusData.UserDefinedField;
        if (!cartId) {
            console.error("MyFatoorah Callback Error: Missing cart_id in UserDefinedField");
            res.redirect(302, `${process.env.STORE_URL}/checkout?error=payment_failed_missing_cart`);
            return;
        }
        if (statusData.InvoiceStatus === "Paid") {
            // In Medusa v2, payment providers generally update the session status when getPaymentStatus is called
            // Since we just verified it manually via the client here, we can proceed to complete the cart.
            // The completeCartWorkflow will validate that the cart is fully paid by calling authorizePayment internally if needed.
            const { result } = await (0, core_flows_1.completeCartWorkflow)(req.scope).run({
                input: { id: cartId },
            });
            // The order should now be created
            res.redirect(302, `${process.env.STORE_URL}/checkout?step=review&order_id=${result.id}`);
            return;
        }
        else {
            console.error("MyFatoorah Callback: Payment not paid", statusData);
            res.redirect(302, `${process.env.STORE_URL}/checkout?error=payment_not_paid`);
        }
    }
    catch (error) {
        console.error("MyFatoorah Callback Error:", error);
        res.redirect(302, `${process.env.STORE_URL}/checkout?error=payment_failed`);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3BheW1lbnQvbXlmYXRvb3JhaC9jYWxsYmFjay9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUtBLGtCQWlEQztBQXBERCxxREFBMkQ7QUFDM0Qsa0VBQXdFO0FBRWpFLEtBQUssVUFBVSxHQUFHLENBQ3ZCLEdBQWtCLEVBQ2xCLEdBQW1CO0lBRW5CLE1BQU0sRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQTtJQUVuQyxNQUFNLFdBQVcsR0FBRyxDQUFDLFNBQVMsSUFBSSxFQUFFLENBQVcsQ0FBQTtJQUUvQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDakIsR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsb0NBQW9DLENBQUMsQ0FBQTtRQUMvRSxPQUFNO0lBQ1IsQ0FBQztJQUVELElBQUksQ0FBQztRQUNILE1BQU0sTUFBTSxHQUFHLElBQUkseUJBQWdCLEVBQUUsQ0FBQTtRQUNyQyxNQUFNLFVBQVUsR0FBRyxNQUFNLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztZQUMvQyxHQUFHLEVBQUUsV0FBVztZQUNoQixPQUFPLEVBQUUsV0FBVztTQUNyQixDQUFDLENBQUE7UUFFRixNQUFNLE1BQU0sR0FBRyxVQUFVLENBQUMsZ0JBQWdCLENBQUE7UUFFMUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ1osT0FBTyxDQUFDLEtBQUssQ0FBQyxnRUFBZ0UsQ0FBQyxDQUFBO1lBQy9FLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLDZDQUE2QyxDQUFDLENBQUE7WUFDeEYsT0FBTTtRQUNSLENBQUM7UUFFRCxJQUFJLFVBQVUsQ0FBQyxhQUFhLEtBQUssTUFBTSxFQUFFLENBQUM7WUFDeEMsc0dBQXNHO1lBQ3RHLCtGQUErRjtZQUMvRix1SEFBdUg7WUFFdkgsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLE1BQU0sSUFBQSxpQ0FBb0IsRUFBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDO2dCQUMzRCxLQUFLLEVBQUUsRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFO2FBQ3RCLENBQUMsQ0FBQTtZQUVGLGtDQUFrQztZQUNsQyxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxrQ0FBa0MsTUFBTSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUE7WUFDeEYsT0FBTTtRQUNSLENBQUM7YUFBTSxDQUFDO1lBQ04sT0FBTyxDQUFDLEtBQUssQ0FBQyx1Q0FBdUMsRUFBRSxVQUFVLENBQUMsQ0FBQTtZQUNsRSxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxrQ0FBa0MsQ0FBQyxDQUFBO1FBQy9FLENBQUM7SUFFSCxDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMsNEJBQTRCLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFDbEQsR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsZ0NBQWdDLENBQUMsQ0FBQTtJQUM3RSxDQUFDO0FBQ0gsQ0FBQyJ9
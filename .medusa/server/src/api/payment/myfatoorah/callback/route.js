"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
const utils_1 = require("@medusajs/framework/utils");
const core_flows_1 = require("@medusajs/core-flows");
const client_1 = require("../../../../modules/myfatoorah/client");
async function GET(req, res) {
    const storeUrl = process.env.STORE_URL || process.env.FRONTEND_URL || "https://naemafoodstuff.com";
    const { paymentId, Id, payment_id, invoiceId, invoice_id, cart_id, cartId: cartIdQuery } = req.query;
    const paymentRef = (paymentId || Id || payment_id);
    const invoiceRef = (invoiceId || invoice_id);
    console.log("=== MyFatoorah Callback Received ===");
    console.log("Query Parameters:", req.query);
    if (!paymentRef && !invoiceRef) {
        console.error("[MyFatoorah Callback] Missing paymentId or invoiceId in query params:", req.query);
        res.redirect(302, `${storeUrl}/checkout?error=missing_payment_id`);
        return;
    }
    try {
        const client = new client_1.MyFatoorahClient();
        const statusData = paymentRef
            ? await client.getPaymentStatus({ Key: paymentRef, KeyType: "PaymentId" })
            : await client.getPaymentStatus({ Key: invoiceRef, KeyType: "InvoiceId" });
        console.log(`[MyFatoorah Callback] Payment Status Data:`, {
            InvoiceStatus: statusData.InvoiceStatus,
            InvoiceId: statusData.InvoiceId,
            UserDefinedField: statusData.UserDefinedField
        });
        const resolvedCartId = (cart_id || cartIdQuery || statusData.UserDefinedField)?.trim();
        console.log("Resolved Cart ID:", resolvedCartId);
        if (!resolvedCartId) {
            console.error("[MyFatoorah Callback Error] Missing cart_id in query params or UserDefinedField:", statusData);
            res.redirect(302, `${storeUrl}/checkout?error=payment_failed_missing_cart`);
            return;
        }
        if (statusData.InvoiceStatus === "Paid") {
            try {
                console.log(`Completing Medusa cart ${resolvedCartId}...`);
                const { result } = await (0, core_flows_1.completeCartWorkflow)(req.scope).run({
                    input: { id: resolvedCartId },
                });
                const orderId = result?.id || result?.order?.id;
                console.log(`[MyFatoorah Callback] Order created successfully: ${orderId}`);
                res.redirect(302, `${storeUrl}/checkout?step=review&order_id=${orderId}`);
                return;
            }
            catch (completeError) {
                console.warn("[MyFatoorah Callback] completeCartWorkflow notice (checking existing order):", completeError.message);
                // Try looking up order for this cart
                const orderService = req.scope.resolve(utils_1.Modules.ORDER);
                const [orders] = await orderService.listAndCountOrders({ cart_id: resolvedCartId });
                if (orders && orders.length > 0) {
                    console.log(`[MyFatoorah Callback] Existing order found for cart: ${orders[0].id}`);
                    res.redirect(302, `${storeUrl}/checkout?step=review&order_id=${orders[0].id}`);
                    return;
                }
                throw completeError;
            }
        }
        else {
            console.error(`[MyFatoorah Callback] Payment status is not Paid: ${statusData.InvoiceStatus}`, statusData);
            res.redirect(302, `${storeUrl}/checkout?error=payment_not_paid&status=${statusData.InvoiceStatus}`);
        }
    }
    catch (error) {
        console.error("[MyFatoorah Callback Error]", error.message || error);
        res.redirect(302, `${storeUrl}/checkout?error=payment_failed`);
    }
}
async function POST(req, res) {
    return GET(req, res);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3BheW1lbnQvbXlmYXRvb3JhaC9jYWxsYmFjay9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUtBLGtCQTRFQztBQUVELG9CQUtDO0FBdkZELHFEQUFtRDtBQUNuRCxxREFBMkQ7QUFDM0Qsa0VBQXdFO0FBRWpFLEtBQUssVUFBVSxHQUFHLENBQ3ZCLEdBQWtCLEVBQ2xCLEdBQW1CO0lBRW5CLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxJQUFJLDRCQUE0QixDQUFBO0lBQ2xHLE1BQU0sRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQTtJQUVwRyxNQUFNLFVBQVUsR0FBRyxDQUFDLFNBQVMsSUFBSSxFQUFFLElBQUksVUFBVSxDQUFXLENBQUE7SUFDNUQsTUFBTSxVQUFVLEdBQUcsQ0FBQyxTQUFTLElBQUksVUFBVSxDQUFXLENBQUE7SUFFdEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFBO0lBQ25ELE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEVBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBRTNDLElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUMvQixPQUFPLENBQUMsS0FBSyxDQUFDLHVFQUF1RSxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUNqRyxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxHQUFHLFFBQVEsb0NBQW9DLENBQUMsQ0FBQTtRQUNsRSxPQUFNO0lBQ1IsQ0FBQztJQUVELElBQUksQ0FBQztRQUNILE1BQU0sTUFBTSxHQUFHLElBQUkseUJBQWdCLEVBQUUsQ0FBQTtRQUNyQyxNQUFNLFVBQVUsR0FBRyxVQUFVO1lBQzNCLENBQUMsQ0FBQyxNQUFNLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxDQUFDO1lBQzFFLENBQUMsQ0FBQyxNQUFNLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUE7UUFFNUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyw0Q0FBNEMsRUFBRTtZQUN4RCxhQUFhLEVBQUUsVUFBVSxDQUFDLGFBQWE7WUFDdkMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxTQUFTO1lBQy9CLGdCQUFnQixFQUFFLFVBQVUsQ0FBQyxnQkFBZ0I7U0FDOUMsQ0FBQyxDQUFBO1FBRUYsTUFBTSxjQUFjLEdBQUksQ0FBQyxPQUFPLElBQUksV0FBVyxJQUFJLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBWSxFQUFFLElBQUksRUFBRSxDQUFBO1FBRWxHLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEVBQUUsY0FBYyxDQUFDLENBQUE7UUFFaEQsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ3BCLE9BQU8sQ0FBQyxLQUFLLENBQUMsa0ZBQWtGLEVBQUUsVUFBVSxDQUFDLENBQUE7WUFDN0csR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxRQUFRLDZDQUE2QyxDQUFDLENBQUE7WUFDM0UsT0FBTTtRQUNSLENBQUM7UUFFRCxJQUFJLFVBQVUsQ0FBQyxhQUFhLEtBQUssTUFBTSxFQUFFLENBQUM7WUFDeEMsSUFBSSxDQUFDO2dCQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsMEJBQTBCLGNBQWMsS0FBSyxDQUFDLENBQUE7Z0JBQzFELE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxNQUFNLElBQUEsaUNBQW9CLEVBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQztvQkFDM0QsS0FBSyxFQUFFLEVBQUUsRUFBRSxFQUFFLGNBQWMsRUFBRTtpQkFDOUIsQ0FBQyxDQUFBO2dCQUVGLE1BQU0sT0FBTyxHQUFHLE1BQU0sRUFBRSxFQUFFLElBQUssTUFBYyxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUE7Z0JBQ3hELE9BQU8sQ0FBQyxHQUFHLENBQUMscURBQXFELE9BQU8sRUFBRSxDQUFDLENBQUE7Z0JBQzNFLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLEdBQUcsUUFBUSxrQ0FBa0MsT0FBTyxFQUFFLENBQUMsQ0FBQTtnQkFDekUsT0FBTTtZQUNSLENBQUM7WUFBQyxPQUFPLGFBQWtCLEVBQUUsQ0FBQztnQkFDNUIsT0FBTyxDQUFDLElBQUksQ0FBQyw4RUFBOEUsRUFBRSxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUE7Z0JBRW5ILHFDQUFxQztnQkFDckMsTUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsZUFBTyxDQUFDLEtBQUssQ0FBQyxDQUFBO2dCQUNyRCxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsTUFBTSxZQUFZLENBQUMsa0JBQWtCLENBQUMsRUFBRSxPQUFPLEVBQUUsY0FBYyxFQUFTLENBQUMsQ0FBQTtnQkFFMUYsSUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztvQkFDaEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3REFBd0QsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUE7b0JBQ25GLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLEdBQUcsUUFBUSxrQ0FBa0MsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUE7b0JBQzlFLE9BQU07Z0JBQ1IsQ0FBQztnQkFFRCxNQUFNLGFBQWEsQ0FBQTtZQUNyQixDQUFDO1FBQ0gsQ0FBQzthQUFNLENBQUM7WUFDTixPQUFPLENBQUMsS0FBSyxDQUFDLHFEQUFxRCxVQUFVLENBQUMsYUFBYSxFQUFFLEVBQUUsVUFBVSxDQUFDLENBQUE7WUFDMUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxRQUFRLDJDQUEyQyxVQUFVLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQTtRQUNyRyxDQUFDO0lBRUgsQ0FBQztJQUFDLE9BQU8sS0FBVSxFQUFFLENBQUM7UUFDcEIsT0FBTyxDQUFDLEtBQUssQ0FBQyw2QkFBNkIsRUFBRSxLQUFLLENBQUMsT0FBTyxJQUFJLEtBQUssQ0FBQyxDQUFBO1FBQ3BFLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLEdBQUcsUUFBUSxnQ0FBZ0MsQ0FBQyxDQUFBO0lBQ2hFLENBQUM7QUFDSCxDQUFDO0FBRU0sS0FBSyxVQUFVLElBQUksQ0FDeEIsR0FBa0IsRUFDbEIsR0FBbUI7SUFFbkIsT0FBTyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFBO0FBQ3RCLENBQUMifQ==
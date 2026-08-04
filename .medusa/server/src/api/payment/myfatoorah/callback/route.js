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
        console.log("=== STEP 1: Calling getPaymentStatus ===");
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
            console.log("=== STEP 5: Redirecting to missing cart error ===");
            res.redirect(302, `${storeUrl}/checkout?error=payment_failed_missing_cart`);
            return;
        }
        if (statusData.InvoiceStatus === "Paid") {
            try {
                console.log(`=== STEP 2: Running completeCartWorkflow for cart ${resolvedCartId} ===`);
                const { result } = await (0, core_flows_1.completeCartWorkflow)(req.scope).run({
                    input: { id: resolvedCartId },
                });
                const orderId = result?.id || result?.order?.id;
                console.log(`[MyFatoorah Callback] Order created successfully: ${orderId}`);
                console.log("=== STEP 5: Redirecting to order success page ===");
                res.redirect(302, `${storeUrl}/checkout?step=review&order_id=${orderId}`);
                return;
            }
            catch (completeError) {
                console.log("=== STEP 3: Inside catch (completeError) ===");
                console.error("completeCartWorkflow Error Stack:", completeError.stack ?? completeError);
                console.log("=== STEP 4: Calling listAndCountOrders ===");
                const orderService = req.scope.resolve(utils_1.Modules.ORDER);
                const [orders] = await orderService.listAndCountOrders({ cart_id: resolvedCartId });
                if (orders && orders.length > 0) {
                    console.log(`[MyFatoorah Callback] Existing order found for cart: ${orders[0].id}`);
                    console.log("=== STEP 5: Redirecting to existing order success page ===");
                    res.redirect(302, `${storeUrl}/checkout?step=review&order_id=${orders[0].id}`);
                    return;
                }
                console.log("=== STEP 5: Throwing completeError to outer handler ===");
                throw completeError;
            }
        }
        else {
            console.error(`[MyFatoorah Callback] Payment status is not Paid: ${statusData.InvoiceStatus}`, statusData);
            console.log("=== STEP 5: Redirecting to payment not paid error ===");
            res.redirect(302, `${storeUrl}/checkout?error=payment_not_paid&status=${statusData.InvoiceStatus}`);
        }
    }
    catch (error) {
        console.error("=== MyFatoorah Callback Outer Error Stack ===");
        console.error(error.stack ?? error);
        console.log("=== STEP 5: Redirecting to general payment failed error ===");
        res.redirect(302, `${storeUrl}/checkout?error=payment_failed`);
    }
}
async function POST(req, res) {
    return GET(req, res);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3BheW1lbnQvbXlmYXRvb3JhaC9jYWxsYmFjay9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUtBLGtCQXFGQztBQUVELG9CQUtDO0FBaEdELHFEQUFtRDtBQUNuRCxxREFBMkQ7QUFDM0Qsa0VBQXdFO0FBRWpFLEtBQUssVUFBVSxHQUFHLENBQ3ZCLEdBQWtCLEVBQ2xCLEdBQW1CO0lBRW5CLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxJQUFJLDRCQUE0QixDQUFBO0lBQ2xHLE1BQU0sRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQTtJQUVwRyxNQUFNLFVBQVUsR0FBRyxDQUFDLFNBQVMsSUFBSSxFQUFFLElBQUksVUFBVSxDQUFXLENBQUE7SUFDNUQsTUFBTSxVQUFVLEdBQUcsQ0FBQyxTQUFTLElBQUksVUFBVSxDQUFXLENBQUE7SUFFdEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFBO0lBQ25ELE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEVBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBRTNDLElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUMvQixPQUFPLENBQUMsS0FBSyxDQUFDLHVFQUF1RSxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUNqRyxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxHQUFHLFFBQVEsb0NBQW9DLENBQUMsQ0FBQTtRQUNsRSxPQUFNO0lBQ1IsQ0FBQztJQUVELElBQUksQ0FBQztR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
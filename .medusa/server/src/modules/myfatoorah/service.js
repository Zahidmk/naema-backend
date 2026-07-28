"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyFatoorahProviderService = void 0;
const utils_1 = require("@medusajs/framework/utils");
const client_1 = require("./client");
const constants_1 = require("./constants");
class MyFatoorahProviderService extends utils_1.AbstractPaymentProvider {
    constructor(container, options) {
        super(container, options);
        this.client = new client_1.MyFatoorahClient(options);
    }
    async getPaymentStatus(input) {
        const invoiceId = input.data?.invoice_id || input.data?.invoiceId;
        if (!invoiceId) {
            return { status: utils_1.PaymentSessionStatus.PENDING };
        }
        try {
            const statusData = await this.client.getPaymentStatus({
                Key: invoiceId.toString(),
                KeyType: "InvoiceId"
            });
            switch (statusData.InvoiceStatus) {
                case "Paid":
                    return { status: utils_1.PaymentSessionStatus.AUTHORIZED };
                case "Canceled":
                case "Failed":
                    return { status: utils_1.PaymentSessionStatus.ERROR };
                default:
                    return { status: utils_1.PaymentSessionStatus.PENDING };
            }
        }
        catch (error) {
            return { status: utils_1.PaymentSessionStatus.ERROR };
        }
    }
    async initiatePayment(input) {
        const { amount, currency_code, context } = input;
        try {
            console.log("=== MyFatoorah Input ===");
            console.log({
                amount,
                currency_code,
            });
            // In Medusa v2, payment amount is already in standard currency units (e.g. 2.5 KWD)
            const invoiceValue = Number(amount) || 0;
            console.log("InvoiceValue sent to MyFatoorah:", invoiceValue);
            // Extract cart_id from all possible Medusa input/context properties
            const cartId = (input.cart_id ||
                context?.cart_id ||
                context?.cart?.id ||
                context?.resource_id ||
                context?.id ||
                input.id ||
                "");
            console.log("Resolved Cart ID for MyFatoorah:", cartId);
            const backendUrl = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000";
            const baseCallback = context?.callback_url || `${backendUrl}/api/payment/myfatoorah/callback`;
            const callBackUrlWithCart = cartId
                ? (baseCallback.includes("?") ? `${baseCallback}&cart_id=${cartId}` : `${baseCallback}?cart_id=${cartId}`)
                : baseCallback;
            const payload = {
                PaymentMethodId: context?.payment_method_id || context?.data?.payment_method_id || 2,
                InvoiceValue: invoiceValue,
                DisplayCurrencyIso: currency_code?.toUpperCase() || "KWD",
                CallBackUrl: callBackUrlWithCart,
                ErrorUrl: callBackUrlWithCart,
                CustomerName: context?.customer?.first_name
                    ? `${context.customer.first_name} ${context.customer.last_name || ''}`.trim()
                    : "Guest",
                CustomerEmail: context?.customer?.email || context?.email || "guest@example.com",
                UserDefinedField: cartId,
            };
            console.log("=== MyFatoorah Payload ===", JSON.stringify(payload, null, 2));
            const response = await this.client.executePayment(payload);
            return {
                data: {
                    invoice_id: response.InvoiceId,
                    payment_url: response.PaymentURL,
                    invoiceId: response.InvoiceId,
                    paymentUrl: response.PaymentURL,
                }
            };
        }
        catch (error) {
            console.error("[MyFatoorah Error] Failed to initiate payment:", error.message || error);
            throw new Error(error.message || "Failed to initiate MyFatoorah payment");
        }
    }
    async authorizePayment(input) {
        const statusResult = await this.getPaymentStatus(input);
        return {
            status: statusResult.status,
            data: input.data
        };
    }
    async cancelPayment(input) {
        return { data: input.data };
    }
    async capturePayment(input) {
        return { data: input.data };
    }
    async deletePayment(input) {
        return { data: input.data };
    }
    async refundPayment(input) {
        const invoiceId = input.data?.invoice_id || input.data?.invoiceId;
        const refundAmount = input.amount;
        if (!invoiceId) {
            return { error: "No invoice ID found for refund", code: "MYFATOORAH_REFUND_ERROR" };
        }
        try {
            await this.client.makeRefund({
                Key: invoiceId.toString(),
                KeyType: "InvoiceId",
                RefundChargeOnCustomer: false,
                ServiceChargeOnCustomer: false,
                Amount: refundAmount,
                Comment: "Refund from Medusa Admin",
                AmountDeductedFromSupplier: refundAmount
            });
            return { data: input.data };
        }
        catch (error) {
            return {
                error: error.message || "Refund failed",
                code: "MYFATOORAH_REFUND_FAILED"
            };
        }
    }
    async updatePayment(input) {
        return this.initiatePayment(input);
    }
    async retrievePayment(input) {
        return { data: input.data };
    }
    async getWebhookActionAndData(payload) {
        return {
            action: "not_supported",
            data: payload
        };
    }
}
exports.MyFatoorahProviderService = MyFatoorahProviderService;
MyFatoorahProviderService.identifier = constants_1.MYFATOORAH_PROVIDER_ID;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9tb2R1bGVzL215ZmF0b29yYWgvc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxxREFHa0M7QUFDbEMscUNBQTJDO0FBQzNDLDJDQUFvRDtBQUVwRCxNQUFhLHlCQUEwQixTQUFRLCtCQUE0QjtJQUt6RSxZQUFZLFNBQWMsRUFBRSxPQUFZO1FBQ3RDLEtBQUssQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUE7UUFDekIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLHlCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFBO0lBQzdDLENBQUM7SUFFRCxLQUFLLENBQUMsZ0JBQWdCLENBQUMsS0FBVTtRQUMvQixNQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsSUFBSSxFQUFFLFVBQVUsSUFBSSxLQUFLLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQTtRQUNqRSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDZixPQUFPLEVBQUUsTUFBTSxFQUFFLDRCQUFvQixDQUFDLE9BQU8sRUFBRSxDQUFBO1FBQ2pELENBQUM7UUFFRCxJQUFJLENBQUM7WUFDSCxNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUM7Z0JBQ3BELEdBQUcsRUFBRSxTQUFTLENBQUMsUUFBUSxFQUFFO2dCQUN6QixPQUFPLEVBQUUsV0FBVzthQUNyQixDQUFDLENBQUE7WUFFRixRQUFRLFVBQVUsQ0FBQyxhQUFhLEVBQUUsQ0FBQztnQkFDakMsS0FBSyxNQUFNO29CQUNULE9BQU8sRUFBRSxNQUFNLEVBQUUsNEJBQW9CLENBQUMsVUFBVSxFQUFFLENBQUE7Z0JBQ3BELEtBQUssVUFBVSxDQUFDO2dCQUNoQixLQUFLLFFBQVE7b0JBQ1gsT0FBTyxFQUFFLE1BQU0sRUFBRSw0QkFBb0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQTtnQkFDL0M7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
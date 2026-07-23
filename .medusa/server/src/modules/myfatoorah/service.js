"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyFatoorahProviderService = void 0;
const utils_1 = require("@medusajs/framework/utils");
const client_1 = require("./client");
const constants_1 = require("./constants");
class MyFatoorahProviderService extends utils_1.AbstractPaymentProvider {
    constructor(container) {
        // In Medusa v2, dependencies are resolved from the container. 
        // For MyFatoorah, we instantiate the client here.
        super(container);
        this.client = new client_1.MyFatoorahClient();
    }
    async getPaymentStatus(paymentSessionData) {
        const invoiceId = paymentSessionData.invoiceId;
        if (!invoiceId) {
            return utils_1.PaymentSessionStatus.PENDING;
        }
        try {
            const statusData = await this.client.getPaymentStatus({
                Key: invoiceId.toString(),
                KeyType: "InvoiceId"
            });
            switch (statusData.InvoiceStatus) {
                case "Paid":
                    return utils_1.PaymentSessionStatus.AUTHORIZED;
                case "Canceled":
                case "Failed":
                    return utils_1.PaymentSessionStatus.ERROR;
                default:
                    return utils_1.PaymentSessionStatus.PENDING;
            }
        }
        catch (error) {
            return utils_1.PaymentSessionStatus.ERROR;
        }
    }
    async initiatePayment(context) {
        const { amount, currency_code, context: customerContext } = context;
        try {
            // MyFatoorah expects amount to be the correct decimal value depending on currency. 
            // Medusa stores amounts in the smallest unit (e.g. cents). 
            // Assuming a generic 2 decimal places for this implementation (e.g., KWD is 3, others are 2, etc.)
            // We will just pass the raw value for now, but a real implementation would use a utility to convert from smallest unit.
            const invoiceValue = amount;
            const payload = {
                InvoiceValue: invoiceValue,
                DisplayCurrencyIso: currency_code.toUpperCase(),
                CallBackUrl: customerContext?.callback_url || "http://localhost:9000/api/payment/myfatoorah/callback",
                ErrorUrl: customerContext?.error_url || "http://localhost:9000/api/payment/myfatoorah/callback",
                CustomerName: customerContext?.customer?.first_name
                    ? `${customerContext.customer.first_name} ${customerContext.customer.last_name || ''}`.trim()
                    : "Guest",
                CustomerEmail: customerContext?.customer?.email || customerContext?.email || "guest@example.com",
                UserDefinedField: context.resource_id || customerContext?.cart_id || context.cart_id || context.id || "",
            };
            const response = await this.client.executePayment(payload);
            return {
                data: {
                    invoice_id: response.InvoiceId,
                    payment_url: response.PaymentURL,
                    // keeping camelCase versions just in case existing code relies on it
                    invoiceId: response.InvoiceId,
                    paymentUrl: response.PaymentURL,
                }
            };
        }
        catch (error) {
            return {
                error: error.message || "Failed to initiate payment",
                code: "MYFATOORAH_INIT_FAILED"
            };
        }
    }
    async authorizePayment(paymentSessionData, context) {
        const status = await this.getPaymentStatus(paymentSessionData);
        return {
            status,
            data: paymentSessionData
        };
    }
    async cancelPayment(paymentSessionData) {
        // MyFatoorah doesn't have a direct "cancel" API for an unpaid invoice in the standard flow, 
        // it just expires. We simply return the data back to Medusa.
        return paymentSessionData;
    }
    async capturePayment(paymentSessionData) {
        // In MyFatoorah, "Paid" status means it's already captured.
        return paymentSessionData;
    }
    async deletePayment(paymentSessionData) {
        return paymentSessionData;
    }
    async refundPayment(paymentSessionData, refundAmount) {
        const invoiceId = paymentSessionData.invoiceId;
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
            return paymentSessionData;
        }
        catch (error) {
            return {
                error: error.message || "Refund failed",
                code: "MYFATOORAH_REFUND_FAILED"
            };
        }
    }
    async updatePayment(context) {
        // When the cart is updated, we typically need to generate a new invoice.
        // For simplicity, we just initiate a new payment.
        return this.initiatePayment(context);
    }
    async getWebhookActionAndData(payload) {
        // To be implemented in the webhook phase
        return {
            action: "not_supported",
            data: payload
        };
    }
}
exports.MyFatoorahProviderService = MyFatoorahProviderService;
MyFatoorahProviderService.identifier = constants_1.MYFATOORAH_PROVIDER_ID;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9tb2R1bGVzL215ZmF0b29yYWgvc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxxREFLa0M7QUFDbEMscUNBQTJDO0FBQzNDLDJDQUFvRDtBQUVwRCxNQUFhLHlCQUEwQixTQUFRLCtCQUE0QjtJQUt6RSxZQUFZLFNBQWM7UUFDeEIsK0RBQStEO1FBQy9ELGtEQUFrRDtRQUNsRCxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUE7UUFDaEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLHlCQUFnQixFQUFFLENBQUE7SUFDdEMsQ0FBQztJQUVELEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBMkM7UUFDaEUsTUFBTSxTQUFTLEdBQUcsa0JBQWtCLENBQUMsU0FBbUIsQ0FBQTtRQUN4RCxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDZixPQUFPLDRCQUFvQixDQUFDLE9BQU8sQ0FBQTtRQUNyQyxDQUFDO1FBRUQsSUFBSSxDQUFDO1lBQ0gsTUFBTSxVQUFVLEdBQUcsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDO2dCQUNwRCxHQUFHLEVBQUUsU0FBUyxDQUFDLFFBQVEsRUFBRTtnQkFDekIsT0FBTyxFQUFFLFdBQVc7YUFDckIsQ0FBQyxDQUFBO1lBRUYsUUFBUSxVQUFVLENBQUMsYUFBYSxFQUFFLENBQUM7Z0JBQ2pDLEtBQUssTUFBTTtvQkFDVCxPQUFPLDRCQUFvQixDQUFDLFVBQVUsQ0FBQTtnQkFDeEMsS0FBSyxVQUFVLENBQUM7Z0JBQ2hCLEtBQUssUUFBUTtvQkFDWCxPQUFPLDRCQUFvQixDQUFDLEtBQUssQ0FBQTtnQkFDbkM7b0JBQ0UsT0FBTyw0QkFBb0IsQ0FBQyxPQUFPLENBQUE7WUFDdkMsQ0FBQztRQUNILENBQUM7UUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1lBQ2YsT0FBTyw0QkFBb0IsQ0FB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
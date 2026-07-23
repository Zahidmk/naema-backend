"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyFatoorahProviderService = void 0;
const utils_1 = require("@medusajs/framework/utils");
const client_1 = require("./client");
const constants_1 = require("./constants");
class MyFatoorahProviderService extends utils_1.AbstractPaymentProvider {
    constructor(container) {
        super(container);
        this.client = new client_1.MyFatoorahClient();
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
            // Medusa sends amount in smallest units. KWD has 3 decimals.
            const is3Decimals = ["kwd", "bhd", "omr"].includes(currency_code?.toLowerCase());
            const divisor = is3Decimals ? 1000 : 100;
            const invoiceValue = Number(amount) / divisor;
            const payload = {
                InvoiceValue: invoiceValue,
                DisplayCurrencyIso: currency_code?.toUpperCase() || "USD",
                CallBackUrl: context?.callback_url || "http://localhost:9000/api/payment/myfatoorah/callback",
                ErrorUrl: context?.error_url || "http://localhost:9000/api/payment/myfatoorah/callback",
                CustomerName: context?.customer?.first_name
                    ? `${context.customer.first_name} ${context.customer.last_name || ''}`.trim()
                    : "Guest",
                CustomerEmail: context?.customer?.email || context?.email || "guest@example.com",
                UserDefinedField: context?.resource_id || context?.cart_id || context?.id || "",
            };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9tb2R1bGVzL215ZmF0b29yYWgvc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxxREFHa0M7QUFDbEMscUNBQTJDO0FBQzNDLDJDQUFvRDtBQUVwRCxNQUFhLHlCQUEwQixTQUFRLCtCQUE0QjtJQUt6RSxZQUFZLFNBQWM7UUFDeEIsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFBO1FBQ2hCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSx5QkFBZ0IsRUFBRSxDQUFBO0lBQ3RDLENBQUM7SUFFRCxLQUFLLENBQUMsZ0JBQWdCLENBQUMsS0FBVTtRQUMvQixNQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsSUFBSSxFQUFFLFVBQVUsSUFBSSxLQUFLLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQTtRQUNqRSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDZixPQUFPLEVBQUUsTUFBTSxFQUFFLDRCQUFvQixDQUFDLE9BQU8sRUFBRSxDQUFBO1FBQ2pELENBQUM7UUFFRCxJQUFJLENBQUM7WUFDSCxNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUM7Z0JBQ3BELEdBQUcsRUFBRSxTQUFTLENBQUMsUUFBUSxFQUFFO2dCQUN6QixPQUFPLEVBQUUsV0FBVzthQUNyQixDQUFDLENBQUE7WUFFRixRQUFRLFVBQVUsQ0FBQyxhQUFhLEVBQUUsQ0FBQztnQkFDakMsS0FBSyxNQUFNO29CQUNULE9BQU8sRUFBRSxNQUFNLEVBQUUsNEJBQW9CLENBQUMsVUFBVSxFQUFFLENBQUE7Z0JBQ3BELEtBQUssVUFBVSxDQUFDO2dCQUNoQixLQUFLLFFBQVE7b0JBQ1gsT0FBTyxFQUFFLE1BQU0sRUFBRSw0QkFBb0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQTtnQkFDL0M7b0JBQ0UsT0FBTyxFQUFFLE1BQU0sRUFBRSw0QkFBb0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtZQUNuRCxDQUFDO1FBQ0gsQ0FBQztRQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7WUFDZixPQUFPLEVBQUUsTUFBTSxFQUFFLDRCQUFvQixDQUFDLEtBQUssRUFBRSxDQUFBO1FBQy9DLENBQUM7SUFDSCxDQUFDO0lBRUQsS0FBSyxDQUFDLGVBQWUsQ0FBQyxLQUFVO1FBQzlCLE1BQU0sRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLE9BQU8sRUFBRSxHQUFHLEtBQUssQ0FBQTtRQUVoRCxJQUFJLENBQUM7WUFDSCw2REFBNkQ7WUFDN0QsTUFBTSxXQUFXLEdBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQTtZQUNoRixNQUFNLE9BQU8sR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFBO1lBQ3hDLE1BQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxPQUFPLENBQUE7WUFFN0MsTUFBTSxPQUFPLEdBQUc7Z0JBQ2QsWUFBWSxFQUFFLFlBQVk7Z0JBQzFCLGtCQUFrQixFQUFFLGFBQWEsRUFBRSxXQUFXLEVBQUUsSUFBSSxLQUFLO2dCQUN6RCxXQUFXLEVBQUUsT0FBTyxFQUFFLFlBQXNCLElBQUksdURBQXVEO2dCQUN2RyxRQUFRLEVBQUUsT0FBTyxFQUFFLFNBQW1CLElBQUksdURBQXVEO2dCQUNqRyxZQUFZLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxVQUFVO29CQUN6QyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLFVBQVUsSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLFNBQVMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLEVBQUU7b0JBQzdFLENBQUMsQ0FBQyxPQUFPO2dCQUNYLGFBQWEsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLEtBQUssSUFBSSxPQUFPLEVBQUUsS0FBSyxJQUFJLG1CQUFtQjtnQkFDaEYsZ0JBQWdCLEVBQUUsT0FBTyxFQUFFLFdBQVcsSUFBSSxPQUFPLEVBQUUsT0FBTyxJQUFJLE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRTthQUNoRixDQUFBO1lBRUQsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQTtZQUUxRCxPQUFPO2dCQUNMLElBQUksRUFBRTtvQkFDSixVQUFVLEVBQUUsUUFBUSxDQUFDLFNBQVM7b0JBQzlCLFdBQVcsRUFBRSxRQUFRLENBQUMsVUFBVTtvQkFDaEMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxTQUFTO29CQUM3QixVQUFVLEVBQUUsUUFBUSxDQUFDLFVBQVU7aUJBQ2hDO2FBQ0YsQ0FBQTtRQUNILENBQUM7UUFBQyxPQUFPLEtBQVUsRUFBRSxDQUFDO1lBQ3BCLE9BQU8sQ0FBQyxLQUFLLENBQUMsZ0RBQWdELEVBQUUsS0FBSyxDQUFDLE9BQU8sSUFBSSxLQUFLLENBQUMsQ0FBQTtZQUN2RixNQUFNLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLElBQUksdUNBQXVDLENBQUMsQ0FBQTtRQUMzRSxDQUFDO0lBQ0gsQ0FBQztJQUVELEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFVO1FBQy9CLE1BQU0sWUFBWSxHQUFHLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFBO1FBQ3ZELE9BQU87WUFDTCxNQUFNLEVBQUUsWUFBWSxDQUFDLE1BQU07WUFDM0IsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJO1NBQ2pCLENBQUE7SUFDSCxDQUFDO0lBRUQsS0FBSyxDQUFDLGFBQWEsQ0FBQyxLQUFVO1FBQzVCLE9BQU8sRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFBO0lBQzdCLENBQUM7SUFFRCxLQUFLLENBQUMsY0FBYyxDQUFDLEtBQVU7UUFDN0IsT0FBTyxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUE7SUFDN0IsQ0FBQztJQUVELEtBQUssQ0FBQyxhQUFhLENBQUMsS0FBVTtRQUM1QixPQUFPLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQTtJQUM3QixDQUFDO0lBRUQsS0FBSyxDQUFDLGFBQWEsQ0FBQyxLQUFVO1FBQzVCLE1BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxJQUFJLEVBQUUsVUFBVSxJQUFJLEtBQUssQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFBO1FBQ2pFLE1BQU0sWUFBWSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUE7UUFFakMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ2YsT0FBTyxFQUFFLEtBQUssRUFBRSxnQ0FBZ0MsRUFBRSxJQUFJLEVBQUUseUJBQXlCLEVBQUUsQ0FBQTtRQUNyRixDQUFDO1FBRUQsSUFBSSxDQUFDO1lBQ0gsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQztnQkFDM0IsR0FBRyxFQUFFLFNBQVMsQ0FBQyxRQUFRLEVBQUU7Z0JBQ3pCLE9BQU8sRUFBRSxXQUFXO2dCQUNwQixzQkFBc0IsRUFBRSxLQUFLO2dCQUM3Qix1QkFBdUIsRUFBRSxLQUFLO2dCQUM5QixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsT0FBTyxFQUFFLDBCQUEwQjtnQkFDbkMsMEJBQTBCLEVBQUUsWUFBWTthQUN6QyxDQUFDLENBQUE7WUFFRixPQUFPLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQTtRQUM3QixDQUFDO1FBQUMsT0FBTyxLQUFVLEVBQUUsQ0FBQztZQUNwQixPQUFPO2dCQUNMLEtBQUssRUFBRSxLQUFLLENBQUMsT0FBTyxJQUFJLGVBQWU7Z0JBQ3ZDLElBQUksRUFBRSwwQkFBMEI7YUFDakMsQ0FBQTtRQUNILENBQUM7SUFDSCxDQUFDO0lBRUQsS0FBSyxDQUFDLGFBQWEsQ0FBQyxLQUFVO1FBQzVCLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUNwQyxDQUFDO0lBRUQsS0FBSyxDQUFDLGVBQWUsQ0FBQyxLQUFVO1FBQzlCLE9BQU8sRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFBO0lBQzdCLENBQUM7SUFFRCxLQUFLLENBQUMsdUJBQXVCLENBQUMsT0FBWTtRQUN4QyxPQUFPO1lBQ0wsTUFBTSxFQUFFLGVBQWU7WUFDdkIsSUFBSSxFQUFFLE9BQU87U0FDZCxDQUFBO0lBQ0gsQ0FBQzs7QUF0SUgsOERBdUlDO0FBdElRLG9DQUFVLEdBQUcsa0NBQXNCLENBQUEifQ==
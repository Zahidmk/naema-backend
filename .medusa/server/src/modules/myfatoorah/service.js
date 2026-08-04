"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyFatoorahProviderService = void 0;
const utils_1 = require("@medusajs/framework/utils");
const client_1 = require("./client");
const constants_1 = require("./constants");
class MyFatoorahProviderService extends utils_1.AbstractPaymentProvider {
    constructor(container, options) {
        super(container, options);
        this.container = container;
        console.log("Container keys:", Object.keys(this.container));
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
        const { amount, currency_code, context, data } = input;
        try {
            console.log("=================================");
            console.log("INITIATE PAYMENT");
            console.log("=================================");
            console.log("INPUT DATA:", JSON.stringify(data, null, 2));
            console.log("CONTEXT:", JSON.stringify(context, null, 2));
            console.log("=================================");
            // In Medusa v2, payment amount is stored in standard currency units or Fils
            const numAmount = Number(amount) || 0;
            const invoiceValue = numAmount >= 1000 ? numAmount / 1000 : numAmount;
            console.log("InvoiceValue sent to MyFatoorah:", invoiceValue);
            // Extract cart_id from direct props or resolve via Medusa v2 PaymentSession / Remote Link graph
            let cartId = (input.cart_id ||
                input.resource_id ||
                context?.cart_id ||
                context?.resource_id ||
                context?.cart?.id ||
                context?.id ||
                input.id ||
                "");
            console.log("session_id:", data?.session_id);
            console.log("idempotency_key:", context?.idempotency_key);
            const sessionId = data?.session_id;
            if (!cartId && sessionId && this.container) {
                try {
                    const { ContainerRegistrationKeys } = await import("@medusajs/framework/utils");
                    // In Awilix DI, constructor receives cradle proxy. Accessing cradle property directly resolves the service.
                    const query = this.container[ContainerRegistrationKeys.QUERY] ||
                        this.container.query ||
                        (typeof this.container.resolve === "function" ? this.container.resolve(ContainerRegistrationKeys.QUERY) : this.container.__container__?.resolve(ContainerRegistrationKeys.QUERY));
                    console.log("Query service exists:", !!this.container.query, !!this.container.__container__);
                    if (query) {
                        const { data: sessions } = await query.graph({
                            entity: "payment_session",
                            fields: ["id", "payment_collection_id", "payment_collection.cart.id"],
                            filters: { id: sessionId },
                        });
                        cartId = sessions?.[0]?.payment_collection?.cart?.id || "";
                    }
                }
                catch (err) {
                    console.warn("[MyFatoorah] Failed query graph lookup for session:", err?.message || err);
                }
            }
            if (!cartId && sessionId && this.container) {
                try {
                    const { ContainerRegistrationKeys } = await import("@medusajs/framework/utils");
                    const pg = this.container[ContainerRegistrationKeys.PG_CONNECTION] ||
                        this.container.pgConnection ||
                        (typeof this.container.resolve === "function" ? this.container.resolve(ContainerRegistrationKeys.PG_CONNECTION) : this.container.__container__?.resolve(ContainerRegistrationKeys.PG_CONNECTION));
                    if (pg) {
                        const sessionRow = await pg("payment_session")
                            .where({ id: sessionId })
                            .select("payment_collection_id")
                            .first();
                        console.log("Session row:");
                        console.dir(sessionRow, { depth: null });
                        if (sessionRow?.payment_collection_id) {
                            const linkRow = await pg("cart_payment_collection")
                                .where({ payment_collection_id: sessionRow.payment_collection_id })
                                .select("cart_id")
                                .first();
                            console.log("Cart link row:");
                            console.dir(linkRow, { depth: null });
                            if (linkRow?.cart_id) {
                                cartId = linkRow.cart_id;
                            }
                        }
                    }
                }
                catch (err) {
                    console.warn("[MyFatoorah] Failed direct DB link lookup for session:", err?.message || err);
                }
            }
            console.log("Resolved Cart ID for MyFatoorah:", cartId);
            const backendUrl = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000";
            // Medusa v2 mounts src/api/payment/myfatoorah/callback/route.ts at /payment/myfatoorah/callback (without /api)
            const baseCallback = context?.callback_url || `${backendUrl}/payment/myfatoorah/callback`;
            const callBackUrlWithCart = cartId
                ? (baseCallback.includes("?") ? `${baseCallback}&cart_id=${cartId}` : `${baseCallback}?cart_id=${cartId}`)
                : baseCallback;
            const payload = {
                PaymentMethodId: data?.payment_method_id || context?.payment_method_id || context?.data?.payment_method_id || 2,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9tb2R1bGVzL215ZmF0b29yYWgvc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxxREFHa0M7QUFDbEMscUNBQTJDO0FBQzNDLDJDQUFvRDtBQUVwRCxNQUFhLHlCQUEwQixTQUFRLCtCQUE0QjtJQU16RSxZQUFZLFNBQWMsRUFBRSxPQUFZO1FBQ3RDLEtBQUssQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUE7UUFFekIsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUE7UUFFMUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFBO1FBRTNELElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSx5QkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQTtJQUM3QyxDQUFDO0lBRUQsS0FBSyxDQUFDLGdCQUFnQixDQUFDLEtBQVU7UUFDL0IsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLElBQUksRUFBRSxVQUFVLElBQUksS0FBSyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUE7UUFDakUsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ2YsT0FBTyxFQUFFLE1BQU0sRUFBRSw0QkFBb0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtRQUNqRCxDQUFDO1FBRUQsSUFBSSxDQUFDO1lBQ0gsTUFBTSxVQUFVLEdBQUcsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDO2dCQUNwRCxHQUFHLEVBQUUsU0FBUyxDQUFDLFFBQVEsRUFBRTtnQkFDekIsT0FBTyxFQUFFLFdBQVc7YUFDckIsQ0FBQyxDQUFBO1lBRUYsUUFBUSxVQUFVLENBQUMsYUFBYSxFQUFFLENBQUM7Z0JBQ2pDLEtBQUssTUFBTTtvQkFDVCxPQUFPLEVBQUUsTUFBTSxFQUFFLDRC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
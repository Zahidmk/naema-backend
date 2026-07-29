import { 
  AbstractPaymentProvider, 
  PaymentSessionStatus
} from "@medusajs/framework/utils"
import { MyFatoorahClient } from "./client"
import { MYFATOORAH_PROVIDER_ID } from "./constants"

export class MyFatoorahProviderService extends AbstractPaymentProvider<any> {
  static identifier = MYFATOORAH_PROVIDER_ID

  protected client: MyFatoorahClient
  protected container: any

  constructor(container: any, options: any) {
    super(container, options)

    this.container = container

    console.log("Container keys:", Object.keys(this.container))

    this.client = new MyFatoorahClient(options)
  }

  async getPaymentStatus(input: any): Promise<any> {
    const invoiceId = input.data?.invoice_id || input.data?.invoiceId
    if (!invoiceId) {
      return { status: PaymentSessionStatus.PENDING }
    }

    try {
      const statusData = await this.client.getPaymentStatus({
        Key: invoiceId.toString(),
        KeyType: "InvoiceId"
      })

      switch (statusData.InvoiceStatus) {
        case "Paid":
          return { status: PaymentSessionStatus.AUTHORIZED }
        case "Canceled":
        case "Failed":
          return { status: PaymentSessionStatus.ERROR }
        default:
          return { status: PaymentSessionStatus.PENDING }
      }
    } catch (error) {
      return { status: PaymentSessionStatus.ERROR }
    }
  }

  async initiatePayment(input: any): Promise<any> {
    const { amount, currency_code, context, data } = input

    try {
      console.log("=================================");
      console.log("INITIATE PAYMENT");
      console.log("=================================");
      console.log("INPUT DATA:", JSON.stringify(data, null, 2));
      console.log("CONTEXT:", JSON.stringify(context, null, 2));
      console.log("=================================");

      // In Medusa v2, payment amount is stored in standard currency units or Fils
      const numAmount = Number(amount) || 0
      const invoiceValue = numAmount >= 1000 ? numAmount / 1000 : numAmount

      console.log("InvoiceValue sent to MyFatoorah:", invoiceValue);

      // Extract cart_id from direct props or resolve via Medusa v2 PaymentSession / Remote Link graph
      let cartId = (
        input.cart_id ||
        input.resource_id ||
        context?.cart_id ||
        context?.resource_id ||
        context?.cart?.id ||
        context?.id ||
        input.id ||
        ""
      )

      console.log("session_id:", data?.session_id)
      console.log("idempotency_key:", context?.idempotency_key)

      const sessionId = data?.session_id

      if (!cartId && sessionId && this.container) {
        try {
          const { ContainerRegistrationKeys } = await import("@medusajs/framework/utils")
          // In Awilix DI, constructor receives cradle proxy. Accessing cradle property directly resolves the service.
          const query = this.container[ContainerRegistrationKeys.QUERY] || 
                        this.container.query || 
                        (typeof this.container.resolve === "function" ? this.container.resolve(ContainerRegistrationKeys.QUERY) : this.container.__container__?.resolve(ContainerRegistrationKeys.QUERY))

          console.log(
            "Query service exists:",
            !!this.container.query,
            !!this.container.__container__
          );

          if (query) {
            const { data: sessions } = await query.graph({
              entity: "payment_session",
              fields: ["id", "payment_collection_id", "payment_collection.cart.id"],
              filters: { id: sessionId },
            })
            cartId = sessions?.[0]?.payment_collection?.cart?.id || ""
          }
        } catch (err: any) {
          console.warn("[MyFatoorah] Failed query graph lookup for session:", err?.message || err)
        }
      }

      if (!cartId && sessionId && this.container) {
        try {
          const { ContainerRegistrationKeys } = await import("@medusajs/framework/utils")
          const pg = this.container[ContainerRegistrationKeys.PG_CONNECTION] || 
                     this.container.pgConnection || 
                     (typeof this.container.resolve === "function" ? this.container.resolve(ContainerRegistrationKeys.PG_CONNECTION) : this.container.__container__?.resolve(ContainerRegistrationKeys.PG_CONNECTION))

          if (pg) {
            const sessionRow = await pg("payment_session")
              .where({ id: sessionId })
              .select("payment_collection_id")
              .first()

            console.log("Session row:");
            console.dir(sessionRow, { depth: null });

            if (sessionRow?.payment_collection_id) {
              const linkRow = await pg("cart_payment_collection")
                .where({ payment_collection_id: sessionRow.payment_collection_id })
                .select("cart_id")
                .first()

              console.log("Cart link row:");
              console.dir(linkRow, { depth: null });

              if (linkRow?.cart_id) {
                cartId = linkRow.cart_id
              }
            }
          }
        } catch (err: any) {
          console.warn("[MyFatoorah] Failed direct DB link lookup for session:", err?.message || err)
        }
      }

      console.log("Resolved Cart ID for MyFatoorah:", cartId)

      const backendUrl = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
      // Medusa v2 mounts src/api/payment/myfatoorah/callback/route.ts at /payment/myfatoorah/callback (without /api)
      const baseCallback = context?.callback_url as string || `${backendUrl}/payment/myfatoorah/callback`
      const callBackUrlWithCart = cartId 
        ? (baseCallback.includes("?") ? `${baseCallback}&cart_id=${cartId}` : `${baseCallback}?cart_id=${cartId}`)
        : baseCallback

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
      }

      console.log("=== MyFatoorah Payload ===", JSON.stringify(payload, null, 2))

      const response = await this.client.executePayment(payload)

      return {
        data: {
          invoice_id: response.InvoiceId,
          payment_url: response.PaymentURL,
          invoiceId: response.InvoiceId,
          paymentUrl: response.PaymentURL,
        }
      }
    } catch (error: any) {
      console.error("[MyFatoorah Error] Failed to initiate payment:", error.message || error)
      throw new Error(error.message || "Failed to initiate MyFatoorah payment")
    }
  }

  async authorizePayment(input: any): Promise<any> {
    const statusResult = await this.getPaymentStatus(input)
    return {
      status: statusResult.status,
      data: input.data
    }
  }

  async cancelPayment(input: any): Promise<any> {
    return { data: input.data }
  }

  async capturePayment(input: any): Promise<any> {
    return { data: input.data }
  }

  async deletePayment(input: any): Promise<any> {
    return { data: input.data }
  }

  async refundPayment(input: any): Promise<any> {
    const invoiceId = input.data?.invoice_id || input.data?.invoiceId
    const refundAmount = input.amount

    if (!invoiceId) {
      return { error: "No invoice ID found for refund", code: "MYFATOORAH_REFUND_ERROR" }
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
      })

      return { data: input.data }
    } catch (error: any) {
      return {
        error: error.message || "Refund failed",
        code: "MYFATOORAH_REFUND_FAILED"
      }
    }
  }

  async updatePayment(input: any): Promise<any> {
    return this.initiatePayment(input)
  }

  async retrievePayment(input: any): Promise<any> {
    return { data: input.data }
  }

  async getWebhookActionAndData(payload: any): Promise<any> {
    return {
      action: "not_supported",
      data: payload
    }
  }
}

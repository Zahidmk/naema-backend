import { 
  AbstractPaymentProvider, 
  PaymentSessionStatus
} from "@medusajs/framework/utils"
import { MyFatoorahClient } from "./client"
import { MYFATOORAH_PROVIDER_ID } from "./constants"

export class MyFatoorahProviderService extends AbstractPaymentProvider<any> {
  static identifier = MYFATOORAH_PROVIDER_ID

  protected client: MyFatoorahClient

  constructor(container: any, options: any) {
    super(container, options)
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
    const { amount, currency_code, context } = input

    try {
      console.log("=================================");
console.log("INITIATE PAYMENT");
console.log("=================================");

console.log("INPUT:");
console.dir(input, { depth: null });

console.log("CONTEXT:");
console.dir(context, { depth: null });

console.log("INPUT KEYS:", Object.keys(input));

console.log("INPUT JSON");
console.log(JSON.stringify(input, null, 2));

console.log("CONTEXT JSON");
console.log(JSON.stringify(context, null, 2));

if (context) {
  console.log("CONTEXT KEYS:", Object.keys(context));
}

console.log("=================================");

      // In Medusa v2, payment amount is stored in standard currency units or Fils
      const numAmount = Number(amount) || 0
      const invoiceValue = numAmount >= 1000 ? numAmount / 1000 : numAmount

      console.log("InvoiceValue sent to MyFatoorah:", invoiceValue);

      // Extract cart_id from all possible Medusa input/context properties
      const cartId = (
        input.cart_id ||
        input.resource_id ||
        context?.cart_id ||
        context?.resource_id ||
        context?.cart?.id ||
        context?.id ||
        input.id ||
        ""
      )

      console.log("Resolved Cart ID for MyFatoorah:", cartId)

      const backendUrl = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
      const baseCallback = context?.callback_url as string || `${backendUrl}/api/payment/myfatoorah/callback`
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

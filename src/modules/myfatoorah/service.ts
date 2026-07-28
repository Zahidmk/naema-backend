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
      console.log("=== MyFatoorah Input ===");
      console.log({
        amount,
        currency_code,
      });

      // In Medusa v2, payment amount is already in standard currency units (e.g. 2.5 KWD)
      const invoiceValue = Number(amount) || 0

      console.log("InvoiceValue sent to MyFatoorah:", invoiceValue);

      const backendUrl = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
      const payload = {
        PaymentMethodId: context?.payment_method_id || context?.data?.payment_method_id || 2,
        InvoiceValue: invoiceValue,
        DisplayCurrencyIso: currency_code?.toUpperCase() || "KWD",
        CallBackUrl: context?.callback_url as string || `${backendUrl}/api/payment/myfatoorah/callback`,
        ErrorUrl: context?.error_url as string || `${backendUrl}/api/payment/myfatoorah/callback`,
        CustomerName: context?.customer?.first_name 
          ? `${context.customer.first_name} ${context.customer.last_name || ''}`.trim() 
          : "Guest",
        CustomerEmail: context?.customer?.email || context?.email || "guest@example.com",
        UserDefinedField: context?.resource_id || context?.cart_id || context?.id || "",
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

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { completeCartWorkflow } from "@medusajs/core-flows"
import { MyFatoorahClient } from "../../../../modules/myfatoorah/client"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const storeUrl = process.env.STORE_URL || "http://localhost:8000"
  const { paymentId, Id, payment_id, invoiceId, invoice_id } = req.query
  
  const paymentRef = (paymentId || Id || payment_id) as string
  const invoiceRef = (invoiceId || invoice_id) as string

  if (!paymentRef && !invoiceRef) {
    console.error("[MyFatoorah Callback] Missing paymentId or invoiceId in query params:", req.query)
    res.redirect(302, `${storeUrl}/checkout?error=missing_payment_id`)
    return
  }

  try {
    const client = new MyFatoorahClient()
    const statusData = paymentRef 
      ? await client.getPaymentStatus({ Key: paymentRef, KeyType: "PaymentId" })
      : await client.getPaymentStatus({ Key: invoiceRef, KeyType: "InvoiceId" })

    console.log(`[MyFatoorah Callback] Status retrieved for Key=${paymentRef || invoiceRef}:`, {
      InvoiceStatus: statusData.InvoiceStatus,
      InvoiceId: statusData.InvoiceId,
      UserDefinedField: statusData.UserDefinedField
    })

    const cartId = statusData.UserDefinedField

    if (!cartId) {
      console.error("[MyFatoorah Callback Error] Missing cart_id in UserDefinedField:", statusData)
      res.redirect(302, `${storeUrl}/checkout?error=payment_failed_missing_cart`)
      return
    }

    if (statusData.InvoiceStatus === "Paid") {
      try {
        const { result } = await completeCartWorkflow(req.scope).run({
          input: { id: cartId },
        })

        console.log(`[MyFatoorah Callback] Order created successfully: ${result.id}`)
        res.redirect(302, `${storeUrl}/checkout?step=review&order_id=${result.id}`)
        return
      } catch (completeError: any) {
        console.warn("[MyFatoorah Callback] completeCartWorkflow error (checking if cart already completed):", completeError.message)
        
        // Try looking up order for this cart
        const orderService = req.scope.resolve(Modules.ORDER)
        const [orders] = await orderService.listAndCountOrders({ cart_id: cartId } as any)
        
        if (orders && orders.length > 0) {
          console.log(`[MyFatoorah Callback] Existing order found: ${orders[0].id}`)
          res.redirect(302, `${storeUrl}/checkout?step=review&order_id=${orders[0].id}`)
          return
        }

        throw completeError
      }
    } else {
      console.error(`[MyFatoorah Callback] Payment status is not Paid: ${statusData.InvoiceStatus}`, statusData)
      res.redirect(302, `${storeUrl}/checkout?error=payment_not_paid&status=${statusData.InvoiceStatus}`)
    }

  } catch (error: any) {
    console.error("[MyFatoorah Callback Error]", error.message || error)
    res.redirect(302, `${storeUrl}/checkout?error=payment_failed`)
  }
}

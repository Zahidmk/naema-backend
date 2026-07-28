import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { completeCartWorkflow } from "@medusajs/core-flows"
import { MyFatoorahClient } from "../../../../modules/myfatoorah/client"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const storeUrl = process.env.STORE_URL || process.env.FRONTEND_URL || "https://naemafoodstuff.com"
  const { paymentId, Id, payment_id, invoiceId, invoice_id, cart_id, cartId: cartIdQuery } = req.query
  
  const paymentRef = (paymentId || Id || payment_id) as string
  const invoiceRef = (invoiceId || invoice_id) as string

  console.log("=== MyFatoorah Callback Received ===")
  console.log("Query Parameters:", req.query)

  if (!paymentRef && !invoiceRef) {
    console.error("[MyFatoorah Callback] Missing paymentId or invoiceId in query params:", req.query)
    res.redirect(302, `${storeUrl}/checkout?error=missing_payment_id`)
    return
  }

  try {
    console.log("=== STEP 1: Calling getPaymentStatus ===")
    const client = new MyFatoorahClient()
    const statusData = paymentRef 
      ? await client.getPaymentStatus({ Key: paymentRef, KeyType: "PaymentId" })
      : await client.getPaymentStatus({ Key: invoiceRef, KeyType: "InvoiceId" })

    console.log(`[MyFatoorah Callback] Payment Status Data:`, {
      InvoiceStatus: statusData.InvoiceStatus,
      InvoiceId: statusData.InvoiceId,
      UserDefinedField: statusData.UserDefinedField
    })

    const resolvedCartId = ((cart_id || cartIdQuery || statusData.UserDefinedField) as string)?.trim()

    console.log("Resolved Cart ID:", resolvedCartId)

    if (!resolvedCartId) {
      console.error("[MyFatoorah Callback Error] Missing cart_id in query params or UserDefinedField:", statusData)
      console.log("=== STEP 5: Redirecting to missing cart error ===")
      res.redirect(302, `${storeUrl}/checkout?error=payment_failed_missing_cart`)
      return
    }

    if (statusData.InvoiceStatus === "Paid") {
      try {
        console.log(`=== STEP 2: Running completeCartWorkflow for cart ${resolvedCartId} ===`)
        const { result } = await completeCartWorkflow(req.scope).run({
          input: { id: resolvedCartId },
        })

        const orderId = result?.id || (result as any)?.order?.id
        console.log(`[MyFatoorah Callback] Order created successfully: ${orderId}`)
        console.log("=== STEP 5: Redirecting to order success page ===")
        res.redirect(302, `${storeUrl}/checkout?step=review&order_id=${orderId}`)
        return
      } catch (completeError: any) {
        console.log("=== STEP 3: Inside catch (completeError) ===")
        console.error("completeCartWorkflow Error Stack:", completeError.stack ?? completeError)
        
        console.log("=== STEP 4: Calling listAndCountOrders ===")
        const orderService = req.scope.resolve(Modules.ORDER)
        const [orders] = await orderService.listAndCountOrders({ cart_id: resolvedCartId } as any)
        
        if (orders && orders.length > 0) {
          console.log(`[MyFatoorah Callback] Existing order found for cart: ${orders[0].id}`)
          console.log("=== STEP 5: Redirecting to existing order success page ===")
          res.redirect(302, `${storeUrl}/checkout?step=review&order_id=${orders[0].id}`)
          return
        }

        console.log("=== STEP 5: Throwing completeError to outer handler ===")
        throw completeError
      }
    } else {
      console.error(`[MyFatoorah Callback] Payment status is not Paid: ${statusData.InvoiceStatus}`, statusData)
      console.log("=== STEP 5: Redirecting to payment not paid error ===")
      res.redirect(302, `${storeUrl}/checkout?error=payment_not_paid&status=${statusData.InvoiceStatus}`)
    }

  } catch (error: any) {
    console.error("=== MyFatoorah Callback Outer Error Stack ===")
    console.error(error.stack ?? error)
    console.log("=== STEP 5: Redirecting to general payment failed error ===")
    res.redirect(302, `${storeUrl}/checkout?error=payment_failed`)
  }
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  return GET(req, res)
}

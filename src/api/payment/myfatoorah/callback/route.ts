import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { completeCartWorkflow } from "@medusajs/core-flows"
import { MyFatoorahClient } from "../../../../modules/myfatoorah/client"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const { paymentId, Id } = req.query
  
  const referenceId = (paymentId || Id) as string

  if (!referenceId) {
    res.redirect(302, `${process.env.STORE_URL}/checkout?error=missing_payment_id`)
    return
  }

  try {
    const client = new MyFatoorahClient()
    const statusData = await client.getPaymentStatus({
      Key: referenceId,
      KeyType: "PaymentId"
    })

    const cartId = statusData.UserDefinedField

    if (!cartId) {
      console.error("MyFatoorah Callback Error: Missing cart_id in UserDefinedField")
      res.redirect(302, `${process.env.STORE_URL}/checkout?error=payment_failed_missing_cart`)
      return
    }

    if (statusData.InvoiceStatus === "Paid") {
      // In Medusa v2, payment providers generally update the session status when getPaymentStatus is called
      // Since we just verified it manually via the client here, we can proceed to complete the cart.
      // The completeCartWorkflow will validate that the cart is fully paid by calling authorizePayment internally if needed.
      
      const { result } = await completeCartWorkflow(req.scope).run({
        input: { id: cartId },
      })

      // The order should now be created
      res.redirect(302, `${process.env.STORE_URL}/checkout?step=review&order_id=${result.id}`)
      return
    } else {
      console.error("MyFatoorah Callback: Payment not paid", statusData)
      res.redirect(302, `${process.env.STORE_URL}/checkout?error=payment_not_paid`)
    }

  } catch (error) {
    console.error("MyFatoorah Callback Error:", error)
    res.redirect(302, `${process.env.STORE_URL}/checkout?error=payment_failed`)
  }
}

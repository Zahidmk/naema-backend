import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MyFatoorahClient } from "../../../../../modules/myfatoorah/client"
import { MYFATOORAH_API } from "../../../../../modules/myfatoorah/constants"
import axios from "axios"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { amount, currency } = req.query

    if (!amount) {
      res.status(400).json({ message: "Amount is required" })
      return
    }

    const apiKey = process.env.MYFATOORAH_API_KEY || ""
    const baseUrl = process.env.MYFATOORAH_API_URL || "https://apitest.myfatoorah.com"

    const payload = {
      InvoiceAmount: Number(amount),
      CurrencyIso: (currency as string) || "KWD",
    }

    // Call InitiateSession / InitiatePayment directly to fetch the methods
    // MyFatoorah v2 InitiateSession gets payment methods based on invoice value
    const response = await axios.post(
      `${baseUrl}/v2/InitiateSession`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    )

    if (response.data && response.data.IsSuccess) {
      res.status(200).json({ methods: response.data.Data.PaymentMethods })
    } else {
      res.status(400).json({ message: response.data?.Message || "Failed to fetch payment methods" })
    }
  } catch (error: any) {
    console.error("[MyFatoorah] Fetch methods error:", error.response?.data || error.message)
    res.status(500).json({ message: error.message || "Internal Server Error" })
  }
}

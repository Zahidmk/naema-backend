import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MyFatoorahClient } from "../../../../../modules/myfatoorah/client"
import { MYFATOORAH_API } from "../../../../../modules/myfatoorah/constants"
import axios from "axios"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    console.log("[MyFatoorah Methods Route] Incoming request");
    const { amount, currency } = req.query
    console.log("[MyFatoorah Methods Route] Query params:", { amount, currency });

    if (!amount) {
      console.error("[MyFatoorah Methods Route] Amount is missing from query params");
      res.status(400).json({ message: "Amount is required" })
      return
    }

    const apiKey = process.env.MYFATOORAH_API_KEY || ""
    const baseUrl = process.env.MYFATOORAH_API_URL || "https://apitest.myfatoorah.com"

    const payload = {
      InvoiceAmount: Number(amount),
      CurrencyIso: (currency as string) || "KWD",
    }
    console.log("[MyFatoorah Methods Route] Formatted Payload:", payload);

    console.log(`[MyFatoorah Methods Route] Sending request to ${baseUrl}/v2/InitiatePayment`);
    const response = await axios.post(
      `${baseUrl}/v2/InitiatePayment`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    )

    console.log("[MyFatoorah Methods Route] MyFatoorah Response Status:", response.status);
    console.log("[MyFatoorah Methods Route] MyFatoorah Response Data:", JSON.stringify(response.data, null, 2));

    if (response.data && response.data.IsSuccess) {
      console.log("[MyFatoorah Methods Route] Success! Returning methods.");
      res.status(200).json({ methods: response.data.Data.PaymentMethods })
    } else {
      console.error("[MyFatoorah Methods Route] MyFatoorah IsSuccess is false. Message:", response.data?.Message);
      res.status(400).json({ message: response.data?.Message || "Failed to fetch payment methods" })
    }
  } catch (error: any) {
    console.error("[MyFatoorah Methods Route] Axios/Network Error:", error.response?.data || error.message)
    res.status(500).json({ message: error.message || "Internal Server Error" })
  }
}

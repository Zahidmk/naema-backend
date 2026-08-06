import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MyFatoorahClient } from "../../../../../modules/myfatoorah/client"
import { MYFATOORAH_API } from "../../../../../modules/myfatoorah/constants"
import axios from "axios"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  console.log("========== [MyFatoorah] InitiatePayment Request ==========");
  console.log("===== MYFATOORAH CONFIG =====");
  console.log("API URL:", process.env.MYFATOORAH_API_URL);
  console.log(
    "API KEY:",
    process.env.MYFATOORAH_API_KEY?.substring(0, 15) + "..."
  );
  console.log("=============================");
  try {
    let amount = req.query.amount as string | undefined;
    let currency = req.query.currency as string | undefined;

    // Fallback if req.query is empty in this environment
    if (!amount && req.url) {
      try {
        const urlObj = new URL(req.url, `http://${req.headers.host || "localhost"}`);
        amount = urlObj.searchParams.get("amount") || undefined;
        currency = urlObj.searchParams.get("currency") || currency;
      } catch (e) {
        // Ignore URL parsing errors
      }
    }

    console.log("[MyFatoorah] 1. Incoming Request Parameters:");
    console.log("   - Amount:", amount);
    console.log("   - Currency:", currency);

    if (!amount) {
      console.error("[MyFatoorah] Error: Amount is missing from query params");
      res.status(400).json({ message: "Amount is required" });
      return;
    }

    const apiKey = process.env.MYFATOORAH_API_KEY || "";
    const baseUrl = process.env.MYFATOORAH_API_URL || "https://apitest.myfatoorah.com";
    
    console.log("[MyFatoorah] 2. Configuration:");
    console.log("   - Base API URL:", baseUrl);
    console.log("   - API Key Exists:", apiKey ? `Yes (${apiKey.substring(0, 8)}...)` : "No");

    const payload = {
      InvoiceAmount: Number(amount),
      CurrencyIso: (currency as string) || "KWD",
    };
    
    console.log("[MyFatoorah] 3. Request Payload:");
    console.dir(payload, { depth: null });

    console.log(`[MyFatoorah] 4. Executing POST to ${baseUrl}/v2/InitiatePayment...`);
    const response = await axios.post(
      `${baseUrl}/v2/InitiatePayment`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("[MyFatoorah] 5. Successful HTTP Response:");
    console.log("   - HTTP Status:", response.status);
    console.log("   - Complete Response Body:");
    console.dir(response.data, { depth: null });

    if (response.data && response.data.IsSuccess) {
      console.log("[MyFatoorah] 6. Success! Returning PaymentMethods array.");
      res.status(200).json({ methods: response.data.Data.PaymentMethods });
    } else {
      console.error("[MyFatoorah] 6. API Error (IsSuccess is false):");
      console.error("   - Message:", response.data?.Message);
      console.error("   - ValidationErrors:", response.data?.ValidationErrors);
      
      // Forward the exact error message and validation errors to the frontend
      res.status(400).json({ 
        message: response.data?.Message || "Failed to fetch payment methods",
        validationErrors: response.data?.ValidationErrors
      });
    }
  } catch (error: any) {
    console.error("========== [MyFatoorah] Fetch Methods Error ==========");
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("[MyFatoorah] HTTP Error Response Received:");
      console.error("   - HTTP Status:", error.response.status);
      console.error("   - Response Headers:", JSON.stringify(error.response.headers, null, 2));
      console.error("   - Complete Response Body:");
      console.dir(error.response.data, { depth: null });

      // Return the actual MyFatoorah error response to the frontend
      res.status(error.response.status).json({ 
        message: error.response.data?.Message || error.message || "MyFatoorah API Error",
        details: error.response.data
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error("[MyFatoorah] No response received from API:", error.request);
      res.status(502).json({ message: "Bad Gateway - No response from MyFatoorah" });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("[MyFatoorah] Internal Request Setup Error:", error.message);
      res.status(500).json({ message: error.message || "Internal Server Error" });
    }
  }
}

import axios, { AxiosInstance } from "axios"
import config from "./config"
import { MYFATOORAH_API } from "./constants"
import {
  ExecutePaymentRequest,
  ExecutePaymentResponse,
  GetPaymentStatusRequest,
  GetPaymentStatusResponse,
  RefundPaymentRequest,
  RefundPaymentResponse,
} from "./types"

export class MyFatoorahClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: config.baseUrl,
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
    })
  }

  private handleError(error: any) {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data
      console.error("[MyFatoorah API Error]", {
        status: error.response?.status,
        data: responseData,
        url: error.config?.url,
      })
      throw new Error(responseData?.Message || error.message)
    }
    console.error("[MyFatoorah Unknown Error]", error)
    throw error
  }

  async executePayment(payload: ExecutePaymentRequest): Promise<ExecutePaymentResponse["Data"]> {
    try {
      const { data } = await this.client.post<ExecutePaymentResponse>(MYFATOORAH_API.EXECUTE_PAYMENT, payload)
      if (!data.IsSuccess) {
        throw new Error(data.Message || "Failed to execute payment")
      }
      return data.Data
    } catch (error) {
      this.handleError(error)
      throw error // Unreachable, handleError throws, but TS needs it
    }
  }

  async getPaymentStatus(payload: GetPaymentStatusRequest): Promise<GetPaymentStatusResponse["Data"]> {
    try {
      const { data } = await this.client.post<GetPaymentStatusResponse>(MYFATOORAH_API.GET_PAYMENT_STATUS, payload)
      if (!data.IsSuccess) {
        throw new Error(data.Message || "Failed to get payment status")
      }
      return data.Data
    } catch (error) {
      this.handleError(error)
      throw error
    }
  }

  async makeRefund(payload: RefundPaymentRequest): Promise<RefundPaymentResponse["Data"]> {
    try {
      const { data } = await this.client.post<RefundPaymentResponse>(MYFATOORAH_API.REFUND, payload)
      if (!data.IsSuccess) {
        throw new Error(data.Message || "Failed to make refund")
      }
      return data.Data
    } catch (error) {
      this.handleError(error)
      throw error
    }
  }
}

export interface ExecutePaymentRequest {
  PaymentMethodId?: number; // Optional. If not provided, it redirects to the MyFatoorah payment selection page
  CustomerName?: string;
  DisplayCurrencyIso: string;
  MobileCountryCode?: string;
  CustomerMobile?: string;
  CustomerEmail?: string;
  InvoiceValue: number;
  CallBackUrl: string;
  ErrorUrl: string;
  Language?: string;
  CustomerReference?: string;
}

export interface ExecutePaymentResponse {
  IsSuccess: boolean;
  Message: string;
  ValidationErrors: any[] | null;
  Data: {
    InvoiceId: number;
    IsDirectPayment: boolean;
    PaymentURL: string;
    CustomerReference: string;
    UserDefinedField: string;
    RecurringId: string;
  };
}

export interface GetPaymentStatusRequest {
  Key: string;
  KeyType: "InvoiceId" | "PaymentId";
}

export interface GetPaymentStatusResponse {
  IsSuccess: boolean;
  Message: string;
  ValidationErrors: any[] | null;
  Data: {
    InvoiceId: number;
    InvoiceStatus: "Pending" | "Paid" | "Canceled" | "Failed";
    InvoiceReference: string;
    CustomerReference: string;
    CreatedDate: string;
    ExpiryDate: string;
    InvoiceValue: number;
    Comments: string;
    CustomerName: string;
    CustomerMobile: string;
    CustomerEmail: string;
    UserDefinedField: string;
    InvoiceDisplayValue: string;
    InvoiceItems: any[];
    InvoiceTransactions: {
      TransactionDate: string;
      PaymentGateway: string;
      ReferenceId: string;
      TrackId: string;
      TransactionId: string;
      PaymentId: string;
      AuthorizationId: string;
      TransactionStatus: "Succss" | "Failed" | "Pending";
      TransationValue: string;
      CustomerServiceCharge: string;
      DueValue: string;
      PaidCurrency: string;
      PaidCurrencyValue: string;
      Currency: string;
      Error: string;
      CardNumber: string;
    }[];
  };
}

export interface RefundPaymentRequest {
  KeyType: "InvoiceId" | "PaymentId";
  Key: string;
  RefundChargeOnCustomer: boolean;
  ServiceChargeOnCustomer: boolean;
  Amount: number;
  Comment: string;
  AmountDeductedFromSupplier: number;
}

export interface RefundPaymentResponse {
  IsSuccess: boolean;
  Message: string;
  ValidationErrors: any[] | null;
  Data: {
    RefundId: string;
    RefundReference: string;
    RefundAmount: number;
  }
}

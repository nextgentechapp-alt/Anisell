export type PaymentMethod = 'cod' | 'upi' | 'netbanking' | 'card';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface PaymentInfo {
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paidAmount?: number;
  paidAt?: string;
  upiId?: string;
  bankName?: string;
}

export interface RazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export type PaymentMethod = 'cod' | 'upi_qr' | 'bank_transfer';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface PaymentInfo {
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  paidAmount?: number;
  paidAt?: string;
  utrNumber?: string;
  upiTransactionRef?: string;
}

export interface BankDetails {
  accountName: string;
  accountNumber: string;
  bankName: string;
  branch: string;
  ifsc: string;
  accountType: string;
}

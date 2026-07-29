import type { PaymentMethod, BankDetails } from '@/types/payment';

const STORE_UPI_ID = import.meta.env.VITE_UPI_ID || 'anisellns27@paytm';

export const PaymentService = {
  getPaymentMethodLabel(method: PaymentMethod): string {
    const labels: Record<PaymentMethod, string> = {
      cod: 'Cash on Delivery',
      upi_qr: 'UPI QR (GPay / PhonePe)',
      bank_transfer: 'Bank Transfer (NEFT / IMPS)',
    };
    return labels[method];
  },

  getUPIId(): string {
    return STORE_UPI_ID;
  },

  getUPIDeeplinkUrl(amount: number, orderId: string): string {
    return `upi://pay?pa=${encodeURIComponent(STORE_UPI_ID)}&pn=${encodeURIComponent('AniSell')}&am=${amount}&cu=INR&tn=${encodeURIComponent('Order ' + orderId)}`;
  },

  getUPIQrCodeUrl(amount: number, orderId: string): string {
    const upiUrl = this.getUPIDeeplinkUrl(amount, orderId);
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUrl)}`;
  },

  getBankDetails(): BankDetails {
    return {
      accountName: import.meta.env.VITE_BANK_ACCOUNT_NAME || 'AniSell Business',
      accountNumber: import.meta.env.VITE_BANK_ACCOUNT_NUMBER || '12345678901',
      bankName: import.meta.env.VITE_BANK_NAME || 'State Bank of India',
      branch: import.meta.env.VITE_BANK_BRANCH || 'Main Branch',
      ifsc: import.meta.env.VITE_BANK_IFSC || 'SBIN0000001',
      accountType: import.meta.env.VITE_BANK_ACCOUNT_TYPE || 'Current',
    };
  },
};

import type { PaymentMethod, RazorpayOrderResponse } from '@/types/payment';

const RAZORPAY_KEY = import.meta.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder';

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById('razorpay-script')) return resolve();
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
    document.head.appendChild(script);
  });
}

async function createRazorpayOrder(amount: number, receipt: string): Promise<RazorpayOrderResponse> {
  const response = await fetch('/api/razorpay-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, currency: 'INR', receipt }),
  });
  if (!response.ok) throw new Error('Failed to create payment order');
  return response.json();
}

export const PaymentService = {
  async payWithRazorpay(params: {
    amount: number;
    buyerName: string;
    buyerEmail: string;
    buyerPhone: string;
    orderId: string;
  }): Promise<{ success: boolean; paymentId?: string; error?: string }> {
    try {
      await loadRazorpayScript();
      const razorpayOrder = await createRazorpayOrder(params.amount, params.orderId);
      return new Promise((resolve) => {
        const options = {
          key: RAZORPAY_KEY,
          amount: razorpayOrder.amount,
          currency: 'INR',
          name: 'AniSell',
          description: `Order ${params.orderId}`,
          order_id: razorpayOrder.id,
          prefill: {
            name: params.buyerName,
            email: params.buyerEmail,
            contact: params.buyerPhone,
          },
          handler: function (response: any) {
            resolve({ success: true, paymentId: response.razorpay_payment_id });
          },
          modal: {
            ondismiss: function () {
              resolve({ success: false, error: 'Payment cancelled by user' });
            },
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      });
    } catch (err: any) {
      return { success: false, error: err.message || 'Payment failed' };
    }
  },

  getPaymentMethodLabel(method: PaymentMethod): string {
    const labels: Record<PaymentMethod, string> = {
      cod: 'Cash on Delivery',
      upi: 'GPay / PhonePe / UPI',
      netbanking: 'Net Banking',
      card: 'Credit / Debit Card',
    };
    return labels[method];
  },

  getUPIId(): string {
    return import.meta.env.STORE_UPI_ID || 'anisell@upi';
  },
};

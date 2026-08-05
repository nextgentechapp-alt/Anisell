import type { Order } from '@/types';

const ADMIN_PHONE = import.meta.env.VITE_ADMIN_PHONE || '';
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAILS?.split(',')[0] || '';

const normalizePhone = (p: string) => {
  const digits = p.replace(/[^0-9]/g, '');
  if (digits.length === 10) return `91${digits}`;
  return digits;
};

export const NotificationService = {
  async notifyAdminNewOrder(order: Order, buyerName: string, address: string, waWindow: Window | null = null): Promise<void> {
    const message = `New Order!\nOrder: ${order.orderId}\nBuyer: ${buyerName}\nProduct: ${order.productId}\nAmount: ₹${order.amount}\nAddress: ${address}\nPayment: ${order.payment?.method || 'COD'}`;

    if (ADMIN_PHONE) {
      const waUrl = `https://wa.me/${normalizePhone(ADMIN_PHONE)}?text=${encodeURIComponent(message)}`;
      if (waWindow) {
        waWindow.location.href = waUrl;
      } else {
        window.open(waUrl, '_blank');
      }
    }

    if (ADMIN_EMAIL) {
      const mailtoLink = `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent('New Order - ' + order.orderId)}&body=${encodeURIComponent(message)}`;
      window.open(mailtoLink, '_blank');
    }

    if (import.meta.env.VITE_ENABLE_WEBHOOK === 'true') {
      try {
        await fetch('/api/notify-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order, buyerName, address, type: 'new_order' }),
        });
      } catch { }
    }
  },

  async sendOrderConfirmationEmail(order: Order, userEmail: string, userName: string): Promise<void> {
    if (!userEmail) return;

    const subject = `Order Confirmed - ${order.orderId}`;
    const body = `Dear ${userName},\n\nYour order ${order.orderId} has been placed successfully!\n\nAmount: ₹${order.amount}\nPayment: ${order.payment?.method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}\n\nThank you for shopping with AniSell!`;

    const mailtoLink = `mailto:${userEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, '_blank');
  },
};

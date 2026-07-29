import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useSearchData } from '@/hooks/useSearchData';
import { useAuth } from '@/context/AuthContext';
import { OrderService } from '@/services/api/OrderService';
import { PaymentService } from '@/services/api/PaymentService';
import { NotificationService } from '@/services/api/NotificationService';
import { FiShoppingBag, FiShield, FiCheckCircle, FiCreditCard, FiSmartphone, FiHome, FiMonitor } from 'react-icons/fi';
import type { Product } from '@/types';
import type { PaymentMethod } from '@/types/payment';
import styles from './Checkout.module.css';

const paymentOptions: { method: PaymentMethod; label: string; icon: React.ReactNode; description: string }[] = [
  { method: 'upi', label: 'GPay / PhonePe / UPI', icon: <FiSmartphone />, description: 'Pay via any UPI app' },
  { method: 'netbanking', label: 'Net Banking', icon: <FiMonitor />, description: 'All major banks supported' },
  { method: 'card', label: 'Credit / Debit Card', icon: <FiCreditCard />, description: 'Visa, Mastercard, RuPay' },
  { method: 'cod', label: 'Cash on Delivery', icon: <FiHome />, description: 'Pay when delivered' },
];

const Checkout: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, loading: dataLoading } = useSearchData();
  const { user, buyerData, loading: authLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');

  useEffect(() => {
    if (user || buyerData) {
      const nameParts = (user?.displayName || buyerData?.addresses?.[0]?.name || '').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      const primaryAddress = buyerData?.addresses?.[0];

      setFormData(prev => ({
        ...prev,
        firstName: prev.firstName || firstName,
        lastName: prev.lastName || lastName,
        email: prev.email || user?.email || '',
        phone: prev.phone || buyerData?.phone || primaryAddress?.phone || '',
        address: prev.address || primaryAddress?.addressLine || '',
        city: prev.city || primaryAddress?.city || '',
        state: prev.state || primaryAddress?.state || '',
        pincode: prev.pincode || primaryAddress?.pincode || '',
      }));
    }
  }, [user, buyerData]);
  
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  const product: Product | undefined = products.find(p => p.productId === id);

  if (dataLoading || authLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <div style={{ padding: '100px 20px', textAlign: 'center' }}>
          <h2>Product not found</h2>
          <button onClick={() => navigate('/')} className="login-btn">
            Back to Home
          </button>
        </div>
        <Footer />
      </>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError('');

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setOrderError('Please enter your full name.');
      return;
    }
    if (!formData.email.trim()) {
      setOrderError('Please enter your email address.');
      return;
    }
    if (!formData.phone.trim()) {
      setOrderError('Please enter your phone number.');
      return;
    }
    if (!formData.address.trim() || !formData.city.trim() || !formData.state.trim() || !formData.pincode.trim()) {
      setOrderError('Please complete all address fields.');
      return;
    }

    if (!user) {
      setOrderError('You must be logged in to place an order.');
      return;
    }

    setSubmitting(true);
    try {
      const totalAmount = product.productPrice * quantity;
      const newOrderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      setOrderId(newOrderId);

      let paymentInfo;
      if (paymentMethod !== 'cod') {
        const buyerName = `${formData.firstName} ${formData.lastName}`;
        const result = await PaymentService.payWithRazorpay({
          amount: totalAmount,
          buyerName,
          buyerEmail: formData.email,
          buyerPhone: formData.phone,
          orderId: newOrderId,
        });

        if (!result.success) {
          setOrderError(result.error || 'Payment failed. Please try again.');
          setSubmitting(false);
          return;
        }

        paymentInfo = {
          method: paymentMethod as PaymentMethod,
          status: 'paid' as const,
          razorpayPaymentId: result.paymentId,
          paidAmount: totalAmount,
          paidAt: new Date().toISOString(),
        };
      } else {
        paymentInfo = {
          method: 'cod' as PaymentMethod,
          status: 'pending' as const,
        };
      }

      const order = await OrderService.createOrder({
        productId: product.productId,
        buyerId: user.uid,
        sellerId: product.sellerId,
        amount: product.productPrice,
        quantity: quantity,
        buyerName: `${formData.firstName} ${formData.lastName}`,
        productName: product.productSubCategory,
        buyerEmail: formData.email,
        buyerPhone: formData.phone,
        shippingAddress: {
          name: `${formData.firstName} ${formData.lastName}`,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
        payment: paymentInfo,
      });

      setOrderSuccess(true);

      NotificationService.notifyAdminNewOrder(
        order,
        `${formData.firstName} ${formData.lastName}`,
        `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`
      );

      NotificationService.sendOrderConfirmationEmail(
        order,
        formData.email,
        `${formData.firstName} ${formData.lastName}`
      );

      setTimeout(() => {
        navigate('/profile');
      }, 4000);
    } catch (err: any) {
      console.error('Order placement failed:', err);
      setOrderError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className={styles.checkoutPage}>
        <Navbar />
        <main className={styles.checkoutContainer}>
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <FiCheckCircle size={64} color="#10b981" style={{ marginBottom: '24px' }} />
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', marginBottom: '12px' }}>Order Placed Successfully!</h2>
            <p style={{ color: '#64748b', fontSize: '16px', marginBottom: '8px' }}>
              Your order for <strong>{product.productSubCategory}</strong> has been confirmed.
            </p>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '8px' }}>
              Order ID: <strong>{orderId}</strong>
            </p>
            {paymentMethod !== 'cod' && (
              <p style={{ color: '#10b981', fontSize: '14px', marginBottom: '32px' }}>
                Payment successful via {PaymentService.getPaymentMethodLabel(paymentMethod)}
              </p>
            )}
            {paymentMethod === 'cod' && (
              <p style={{ color: '#f59e0b', fontSize: '14px', marginBottom: '32px' }}>
                Pay ₹{(product.productPrice * quantity).toLocaleString('en-IN')} on delivery
              </p>
            )}
            <button
              onClick={() => navigate('/profile')}
              style={{ padding: '14px 32px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}
            >
              View My Orders
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.checkoutPage}>
      <Navbar />
      
      <main className={styles.checkoutContainer}>
        <h1 className={styles.checkoutTitle}>Checkout</h1>
        
        <div className={styles.checkoutGrid}>
          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>
              <FiShoppingBag /> Billing Information
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className={styles.formGrid}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="e.g. John"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className={styles.inputField}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="e.g. Doe"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className={styles.inputField}
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Quantity</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                  className={styles.inputField}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className={styles.inputField}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+91 00000 00000"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className={styles.inputField}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Shipping Address</label>
                <textarea
                  name="address"
                  placeholder="House No, Street, Landmark..."
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className={`${styles.inputField} ${styles.textArea}`}
                />
              </div>

              <div className={styles.triGrid}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>City</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="Mumbai"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className={styles.inputField}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>State</label>
                  <input
                    type="text"
                    name="state"
                    placeholder="MH"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    className={styles.inputField}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    placeholder="400001"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    required
                    className={styles.inputField}
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Payment Method</label>
                <div className={styles.paymentOptionsGrid}>
                  {paymentOptions.map((opt) => (
                    <div
                      key={opt.method}
                      onClick={() => setPaymentMethod(opt.method)}
                      className={`${styles.paymentOption} ${paymentMethod === opt.method ? styles.paymentOptionActive : ''}`}
                    >
                      <div className={styles.paymentOptionIcon}>{opt.icon}</div>
                      <div className={styles.paymentOptionLabel}>{opt.label}</div>
                      <div className={styles.paymentOptionDesc}>{opt.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              {orderError && (
                <div style={{ marginBottom: '16px', padding: '12px 16px', background: '#fef2f2', color: '#dc2626', borderRadius: '10px', fontSize: '14px', fontWeight: 600, border: '1px solid #fecaca' }}>
                  {orderError}
                </div>
              )}

              <button type="submit" className={styles.placeOrderBtn} disabled={submitting}>
                {submitting
                  ? paymentMethod === 'cod' ? 'Processing Order...' : 'Redirecting to Payment...'
                  : paymentMethod === 'cod' ? 'Place Order' : `Pay ₹${(product.productPrice * quantity).toLocaleString('en-IN')}`}
              </button>
            </form>
          </div>

          <aside className={styles.checkoutSidebar}>
            <div className={styles.summaryCard}>
              <h2 className={styles.sectionTitle}>Order Summary</h2>
              
              <div className={styles.productMiniInfo}>
                <img
                  src={product.productMedia[0]}
                  alt={product.productSubCategory}
                  className={styles.summaryImage}
                />
                <div className={styles.summaryText}>
                  <h3>{product.productSubCategory}</h3>
                  <p className={styles.summaryMeta}>
                    {product.productCategory} • {product.productGender}
                  </p>
                  <p className={styles.summaryMeta}>
                    Age: {product.productAge}
                  </p>
                </div>
              </div>
              
              <div className={styles.summaryPriceList}>
                <div className={styles.priceRow}>
                  <span>Price per item</span>
                  <span>₹{product.productPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className={styles.priceRow}>
                  <span>Quantity</span>
                  <span>{quantity}</span>
                </div>
                <div className={styles.priceRow}>
                  <span>Subtotal</span>
                  <span>₹{(product.productPrice * quantity).toLocaleString('en-IN')}</span>
                </div>
                <div className={styles.priceRow}>
                  <span>Delivery</span>
                  <span style={{ color: '#10b981', fontWeight: '600' }}>Free</span>
                </div>
                <div className={styles.totalRow}>
                  <span>Total</span>
                  <span className={styles.totalValue}>₹{(product.productPrice * quantity).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className={styles.promiseBox}>
              <div className={styles.promiseTitle}>
                <FiShield /> Pet Care Promise
              </div>
              <ul className={styles.promiseList}>
                <li className={styles.promiseItem}>
                  <div className={styles.promiseDot} /> Health certificate included
                </li>
                <li className={styles.promiseItem}>
                  <div className={styles.promiseDot} /> no return policy
                </li>
                <li className={styles.promiseItem}>
                  <div className={styles.promiseDot} /> Free vaccination records
                </li>
                <li className={styles.promiseItem}>
                  <div className={styles.promiseDot} /> 24/7 customer support
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Checkout;

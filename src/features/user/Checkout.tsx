import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useSearchData } from '@/hooks/useSearchData';
import { useAuth } from '@/context/AuthContext';
import { OrderService } from '@/services/api/OrderService';
import { PaymentService } from '@/services/api/PaymentService';
import { NotificationService } from '@/services/api/NotificationService';
import { FiShoppingBag, FiShield, FiCheckCircle, FiSmartphone, FiHome, FiCopy, FiCheck } from 'react-icons/fi';
import type { Product } from '@/types';
import type { PaymentMethod, PaymentInfo } from '@/types/payment';
import styles from './Checkout.module.css';

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
  const [utrNumber, setUtrNumber] = useState('');
  const [copiedField, setCopiedField] = useState('');

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
  const totalAmount = product ? product.productPrice * quantity : 0;
  const bankDetails = PaymentService.getBankDetails();
  const upiQrUrl = PaymentService.getUPIQrCodeUrl(totalAmount, orderId || 'ORDER');

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  };

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
    console.log('[Checkout] Submit clicked, paymentMethod:', paymentMethod, 'product:', product?.productId);

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

    if (paymentMethod === 'bank_transfer' && !utrNumber.trim()) {
      setOrderError('Please enter the UTR number after making the transfer.');
      return;
    }
    if (paymentMethod === 'upi_qr' && !utrNumber.trim()) {
      setOrderError('Please enter the UPI transaction reference (UTR) after payment.');
      return;
    }

    if (!user) {
      setOrderError('You must be logged in to place an order.');
      return;
    }

    setSubmitting(true);
    const waWindow: Window | null = window.open('', '_blank');
    try {
      const newOrderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      setOrderId(newOrderId);

      let paymentInfo: PaymentInfo;
      if (paymentMethod === 'cod') {
        paymentInfo = { method: 'cod', status: 'pending' };
      } else if (paymentMethod === 'upi_qr') {
        paymentInfo = { method: 'upi_qr', status: 'pending', utrNumber: utrNumber.trim() };
      } else {
        paymentInfo = { method: 'bank_transfer', status: 'pending', utrNumber: utrNumber.trim() };
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
        `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
        waWindow
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
              Your order for <strong>{product.productSubCategory}</strong> has been placed.
            </p>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '8px' }}>
              Order ID: <strong>{orderId}</strong>
            </p>
            {paymentMethod === 'cod' && (
              <p style={{ color: '#f59e0b', fontSize: '14px', marginBottom: '32px' }}>
                Pay ₹{totalAmount.toLocaleString('en-IN')} on delivery
              </p>
            )}
            {(paymentMethod === 'upi_qr' || paymentMethod === 'bank_transfer') && (
              <div>
                <p style={{ color: '#f59e0b', fontSize: '14px', marginBottom: '8px' }}>
                  Payment of ₹{totalAmount.toLocaleString('en-IN')} is pending verification.
                </p>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '32px' }}>
                  UTR: {utrNumber} — Admin will verify and confirm your order.
                </p>
              </div>
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
                  <div
                    onClick={() => setPaymentMethod('upi_qr')}
                    className={`${styles.paymentOption} ${paymentMethod === 'upi_qr' ? styles.paymentOptionActive : ''}`}
                  >
                    <div className={styles.paymentOptionIcon}><FiSmartphone /></div>
                    <div className={styles.paymentOptionLabel}>GPay / PhonePe / UPI</div>
                    <div className={styles.paymentOptionDesc}>Scan QR & pay</div>
                  </div>
                  <div
                    onClick={() => setPaymentMethod('bank_transfer')}
                    className={`${styles.paymentOption} ${paymentMethod === 'bank_transfer' ? styles.paymentOptionActive : ''}`}
                  >
                    <div className={styles.paymentOptionIcon}><FiSmartphone /></div>
                    <div className={styles.paymentOptionLabel}>Bank Transfer</div>
                    <div className={styles.paymentOptionDesc}>NEFT / IMPS</div>
                  </div>
                  <div
                    onClick={() => setPaymentMethod('cod')}
                    className={`${styles.paymentOption} ${paymentMethod === 'cod' ? styles.paymentOptionActive : ''}`}
                  >
                    <div className={styles.paymentOptionIcon}><FiHome /></div>
                    <div className={styles.paymentOptionLabel}>Cash on Delivery</div>
                    <div className={styles.paymentOptionDesc}>Pay when delivered</div>
                  </div>
                </div>
              </div>

              {paymentMethod === 'upi_qr' && (
                <div className={styles.paymentDetailSection}>
                  <h3 className={styles.paymentDetailTitle}>Pay via UPI</h3>
                  <div className={styles.qrContainer}>
                    <img
                      src={upiQrUrl}
                      alt="UPI QR Code"
                      className={styles.qrImage}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                  <div className={styles.upiIdRow}>
                    <span className={styles.upiIdText}>UPI ID: {PaymentService.getUPIId()}</span>
                    <button
                      type="button"
                      className={styles.copyBtn}
                      onClick={() => copyToClipboard(PaymentService.getUPIId(), 'upi')}
                    >
                      {copiedField === 'upi' ? <FiCheck color="#10b981" /> : <FiCopy />} Copy
                    </button>
                  </div>
                  <p className={styles.paymentHint}>Scan QR or pay to the UPI ID above. Enter the UTR / transaction reference below.</p>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>UPI Transaction UTR</label>
                    <input
                      type="text"
                      placeholder="Enter UTR number from your payment app"
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                      className={styles.inputField}
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'bank_transfer' && (
                <div className={styles.paymentDetailSection}>
                  <h3 className={styles.paymentDetailTitle}>Bank Transfer (NEFT / IMPS)</h3>
                  <div className={styles.bankDetailsCard}>
                    <div className={styles.bankDetailRow}>
                      <span className={styles.bankDetailLabel}>Account Name</span>
                      <span className={styles.bankDetailValue}>{bankDetails.accountName}</span>
                      <button type="button" className={styles.copyBtn} onClick={() => copyToClipboard(bankDetails.accountName, 'name')}>
                        {copiedField === 'name' ? <FiCheck color="#10b981" /> : <FiCopy />}
                      </button>
                    </div>
                    <div className={styles.bankDetailRow}>
                      <span className={styles.bankDetailLabel}>Account Number</span>
                      <span className={styles.bankDetailValue}>{bankDetails.accountNumber}</span>
                      <button type="button" className={styles.copyBtn} onClick={() => copyToClipboard(bankDetails.accountNumber, 'acc')}>
                        {copiedField === 'acc' ? <FiCheck color="#10b981" /> : <FiCopy />}
                      </button>
                    </div>
                    <div className={styles.bankDetailRow}>
                      <span className={styles.bankDetailLabel}>Bank</span>
                      <span className={styles.bankDetailValue}>{bankDetails.bankName}</span>
                    </div>
                    <div className={styles.bankDetailRow}>
                      <span className={styles.bankDetailLabel}>Branch</span>
                      <span className={styles.bankDetailValue}>{bankDetails.branch}</span>
                    </div>
                    <div className={styles.bankDetailRow}>
                      <span className={styles.bankDetailLabel}>IFSC</span>
                      <span className={styles.bankDetailValue}>{bankDetails.ifsc}</span>
                      <button type="button" className={styles.copyBtn} onClick={() => copyToClipboard(bankDetails.ifsc, 'ifsc')}>
                        {copiedField === 'ifsc' ? <FiCheck color="#10b981" /> : <FiCopy />}
                      </button>
                    </div>
                    <div className={styles.bankDetailRow}>
                      <span className={styles.bankDetailLabel}>Account Type</span>
                      <span className={styles.bankDetailValue}>{bankDetails.accountType}</span>
                    </div>
                  </div>
                  <p className={styles.paymentHint}>Transfer the exact amount and enter the UTR number below. Admin will verify and confirm.</p>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Transaction UTR / Reference</label>
                    <input
                      type="text"
                      placeholder="Enter UTR number from your bank"
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                      className={styles.inputField}
                    />
                  </div>
                </div>
              )}

              {orderError && (
                <div className={styles.errorBox}>
                  {orderError}
                </div>
              )}

              <button type="submit" className={styles.placeOrderBtn} disabled={submitting}>
                {submitting ? 'Processing Order...' : 'Place Order'}
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
                  <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className={styles.priceRow}>
                  <span>Delivery</span>
                  <span style={{ color: '#10b981', fontWeight: '600' }}>Free</span>
                </div>
                <div className={styles.totalRow}>
                  <span>Total</span>
                  <span className={styles.totalValue}>₹{totalAmount.toLocaleString('en-IN')}</span>
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
                  <div className={styles.promiseDot} /> No return policy
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

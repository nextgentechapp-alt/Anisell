import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiTruck, FiPackage, FiCheckCircle, FiClock, FiXCircle, FiTrash2 } from 'react-icons/fi';
import { useSearchData } from '@/hooks/useSearchData';
import { useAuth } from '@/context/AuthContext';
import { OrderService } from '@/services/api/OrderService';
import { Badge } from '@/components/ui/Badge';
import { ROUTES } from '@/constants/routes';
import './OrderDetail.css';

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { users, buyers, products, loading } = useSearchData();
  const { user } = useAuth();
  const [cancelling, setCancelling] = useState(false);

  const orderData = useMemo(() => {
    for (const b of buyers) {
      if (b.orders) {
        const found = b.orders.find(o => o.orderId === id);
        if (found) {
           const u = users.find(usr => usr.uid === b.buyerId);
           return { order: found, buyer: b, user: u };
        }
      }
    }
    return null;
  }, [buyers, users, id]);

  const product = useMemo(() => {
    return products.find(p => p.productId === orderData?.order.productId);
  }, [products, orderData]);

  const isDelivered = orderData?.order.status === 'DELIVERED';
  const isCancelled = orderData?.order.status === 'CANCELLED';
  const canCancel = orderData?.order && ['PENDING', 'PROCESSING'].includes(orderData.order.status);

  const trackingSteps = useMemo(() => {
    if (!orderData) return [];

    const { order } = orderData;
    const steps = [
      { status: 'Order Placed', code: 'PENDING', location: 'Identity Verified', time: '10:30 AM', icon: <FiPackage /> },
      { status: 'Order Processing', code: 'PROCESSING', location: 'Distribution Center', time: '11:45 AM', icon: <FiClock /> },
      { status: 'In Transit', code: 'SHIPPED', location: 'Logistics Queue', time: '02:15 PM', icon: <FiTruck /> },
      { status: 'Delivered', code: 'DELIVERED', location: 'Destination Reached', time: '04:50 PM', icon: <FiCheckCircle /> },
    ];

    if (isCancelled) {
      steps[2] = { status: 'Order Cancelled', code: 'CANCELLED', location: 'Marketplace Void', time: '02:15 PM', icon: <FiXCircle /> };
      return steps.filter((_, i) => i <= 2)
        .map(s => ({ ...s, date: order.orderDate, isCurrent: s.code === 'CANCELLED' }))
        .reverse();
    }

    const statusMap: Record<string, number> = {
      'PENDING': 0, 'CONFIRMED': 0,
      'PROCESSING': 1,
      'SHIPPED': 2,
      'DELIVERED': 3
    };
    const currentStepIdx = statusMap[order.status || 'PENDING'] ?? 0;
    
    return steps
      .filter((_, i) => i <= currentStepIdx)
      .map((step, i) => ({
        ...step,
        date: order.orderDate,
        isCurrent: i === currentStepIdx
      }))
      .reverse();
  }, [orderData, isCancelled]);

  const handleCancel = async () => {
    if (!user || !orderData) return;
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      await OrderService.cancelOrder(user.uid, orderData.order.orderId);
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

  if (!orderData || !product) {
    return (
      <div className="order-workspace-error" style={{ textAlign: 'center', padding: '100px 0' }}>
        <h2>Acquisition Not Found</h2>
        <p style={{ color: '#64748b', marginTop: '10px' }}>The requested order registry does not exist or has restricted access.</p>
        <button className="button-base button-primary" style={{ marginTop: '20px' }} onClick={() => navigate(ROUTES.USER_PROFILE)}>Return to Profile</button>
      </div>
    );
  }

  const { order } = orderData;
  const orderDateObj = new Date(order.orderDate);

  return (
    <div className="order-detail-page">
      <div className="order-detail-container">
        <header className="od-header">
           <div className="od-header-info">
              <button className="back-button" onClick={() => navigate(-1)}>
                 <FiArrowLeft /> Back to Discovery Hub
              </button>
              <h1>Historical Acquisition Log</h1>
              <p>Registry #{order.orderId} • Finalized {orderDateObj.toLocaleDateString()}</p>
           </div>
           {canCancel && (
             <button 
               className="btn-outline-dark"
               onClick={handleCancel}
               disabled={cancelling}
               style={{ color: '#b91c1c', borderColor: '#fecaca', display: 'flex', alignItems: 'center', gap: '8px' }}
             >
               <FiTrash2 /> {cancelling ? 'Cancelling...' : 'Cancel Order'}
             </button>
           )}
        </header>

        <div className="od-grid">
          <div className="discovery-main">
            <section className="od-card">
              <header className="od-card-header">
                 <h3>Fulfillment Metrics</h3>
                 <Badge 
                   variant={isDelivered ? 'success' : isCancelled ? 'error' : 'warning'} 
                   size="md"
                 >
                   {order.status}
                 </Badge>
              </header>

              <div className="od-tracking-vertical">
                 {trackingSteps.map((step, idx) => (
                   <div key={idx} className={`tracking-step ${step.isCurrent ? 'current' : ''}`}>
                      <div className="tracking-icon">{step.icon}</div>
                      <div className="tracking-content">
                         <h4 className="tracking-title">{step.status}</h4>
                         <div className="tracking-meta">
                            <span>{new Date(step.date).toLocaleDateString()} at {step.time}</span>
                            <span className="dot">•</span>
                            <span>{step.location}</span>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
            </section>

            <section className="od-card">
              <header className="od-card-header"><h3>Listing Identification</h3></header>
              <div className="od-product-item">
                 <img src={product.productMedia[0]} alt="" className="od-product-img" />
                 <div className="od-product-details">
                    <h4>{product.productSubCategory}</h4>
                    <p className="od-product-meta">{product.productType} • {product.productCategory}</p>
                    <p className="od-product-seller">Merchant: {product.sellerName || 'Verified Partner'}</p>
                 </div>
                 <div className="od-product-price">
                    <div className="qty">Quantity: {order.quantity || 1}</div>
                    <div className="price">₹{order.amount.toLocaleString()}</div>
                 </div>
              </div>
            </section>
          </div>

          <div className="discovery-sidebar">
            <section className="od-card">
              <header className="od-card-header"><h3>Distribution Identity</h3></header>
              <div className="od-address">
                 <p className="od-address-name">{order.buyerName || orderData.user?.displayName}</p>
                 <p>Verified Buyer Account</p>
                 <p>Order placed via AniSell Marketplace</p>
                 {order.shippingAddress && (
                   <div style={{ marginTop: '12px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                     <p style={{ fontWeight: 600, fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>SHIPPING ADDRESS</p>
                     <p style={{ fontSize: '13px', color: '#1e293b' }}>{order.shippingAddress.name}</p>
                     <p style={{ fontSize: '13px', color: '#1e293b' }}>{order.shippingAddress.address}</p>
                     <p style={{ fontSize: '13px', color: '#1e293b' }}>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                     <p style={{ fontSize: '13px', color: '#1e293b' }}>Phone: {order.shippingAddress.phone}</p>
                   </div>
                 )}
              </div>
            </section>

            <section className="od-card">
              <header className="od-card-header"><h3>Fiscal Summary</h3></header>
              <div className="od-summary">
                 <div className="od-summary-row"><span>Acquisition Total</span><span>₹{order.amount.toLocaleString()}</span></div>
                 <div className="od-summary-row"><span>Logistics Allocation</span><span className="free">WAIVED</span></div>
                 <div className="od-summary-divider" />
                 <div className="od-summary-row total"><span>Fiscal Settlement</span><span>₹{order.amount.toLocaleString()}</span></div>
                 <div className="od-payment-method">
                   {order.payment ? (
                     <div>
                       <div className="paid-via" style={{ fontWeight: 700, color: '#1e293b' }}>
                         {order.payment.method === 'cod' ? 'Cash on Delivery' : order.payment.status === 'paid' ? 'Paid via Online' : 'Payment Pending'}
                       </div>
                       {order.payment.status === 'paid' && (
                         <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 600, marginTop: '4px' }}>
                           Transaction: {order.payment.razorpayPaymentId?.substring(0, 12) || 'Completed'}
                         </div>
                       )}
                       {order.payment.method === 'cod' && (
                         <div style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 600, marginTop: '4px' }}>
                           Pay on delivery
                         </div>
                       )}
                     </div>
                   ) : (
                     <div className="paid-via">Authorized via Verified Payment Cluster</div>
                   )}
                 </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;

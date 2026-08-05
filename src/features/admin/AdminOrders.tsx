import React, { useState, useMemo, useEffect } from 'react';
import { useSearchData } from '@/hooks/useSearchData';
import { SkeletonTableRow } from '@/components/ui/Skeleton';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { FiBox, FiCheck, FiTruck, FiXCircle, FiX, FiShield } from 'react-icons/fi';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import { PetOrderService } from '@/services/api/petverse/PetOrderService';
import type { Product } from '@/types';

const AdminOrders: React.FC = () => {
  const { users, buyers, products, sellers, loading } = useSearchData();
  const [filter, setFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [tab, setTab] = useState<'main' | 'petverse'>('petverse');
  const [petverseOrders, setPetverseOrders] = useState<any[]>([]);
  const [petverseLoading, setPetverseLoading] = useState(true);

  useEffect(() => {
    PetOrderService.getAllOrders().then((data) => {
      setPetverseOrders(data);
      setPetverseLoading(false);
    });
  }, []);

  const allOrders = useMemo(() => {
    return buyers.flatMap(b => {
      const buyerUser = users.find(u => u.uid === b.buyerId);
      return (b.orders || []).map((order: any) => {
         const product = products.find(p => p.productId === order.productId);
         const seller = sellers.find(s => s.sellerId === (order.sellerId || product?.sellerId));
         
         return {
            ...order,
            buyerName: buyerUser?.displayName || 'Marketplace Member',
            buyerEmail: buyerUser?.email || 'N/A',
            buyerId: b.buyerId,
            productName: product?.productSubCategory || 'Pet Inventory',
            sellerName: seller?.shopName || 'Verified Merchant',
            sellerId: seller?.sellerId || 'N/A',
            productCategory: product?.productCategory || 'Pets',
            productGender: product?.productGender || 'N/A',
            productAge: product?.productAge || 'N/A'
         };
      });
    });
  }, [buyers, users, products, sellers]);

  if (loading || petverseLoading) return (
     <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        {[...Array(5)].map((_, i) => <SkeletonTableRow key={i} columns={5} />)}
     </div>
  );

  const updatePetverseOrderStatus = async (orderId: string, newStatus: string) => {
    if (!window.confirm(`Advance Petverse order ${orderId} to ${newStatus}?`)) return;
    const order = petverseOrders.find((o: any) => o.id === orderId);
    const buyerPhone = order?.shippingAddress?.phone || '';
    const cleanPhone = buyerPhone.replace(/[^0-9]/g, '');
    let waWindow: Window | null = null;
    if (cleanPhone.length >= 10) {
      const msg = `Hi ${order?.shippingAddress?.fullName || 'Customer'},\nYour petverse order ${orderId.slice(0, 8).toUpperCase()} has been updated to: ${newStatus}\nThank you for shopping with AniSell!`;
      waWindow = window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    }
    try {
      await PetOrderService.updateOrderStatus(orderId, newStatus as any);
      const updated = await PetOrderService.getAllOrders();
      setPetverseOrders(updated);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      if (waWindow) {
        const freshOrder = updated.find((o: any) => o.id === orderId);
        const phone = (freshOrder?.shippingAddress?.phone || '').replace(/[^0-9]/g, '');
        const msg = `Hi ${freshOrder?.shippingAddress?.fullName || 'Customer'},\nYour petverse order ${orderId.slice(0, 8).toUpperCase()} has been updated to: ${newStatus}\nThank you for shopping with AniSell!`;
        waWindow.location.href = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
      }
    } catch (error) {
      alert(`Failed to update order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const currentOrders: any[] = tab === 'petverse' ? petverseOrders : allOrders;
  const filteredOrders = currentOrders.filter((o: any) => filter === 'All' || o.status === filter);

  const handleStatusUpdate = async (id: string, buyerId: string, newStatus: string) => {
    if (!window.confirm(`Advance order ${id} to ${newStatus}?`)) return;
    const buyerRecord = buyers.find(b => b.buyerId === buyerId);
    if (!buyerRecord) { alert('Orphaned Order'); return; }
    const orderRecord = (buyerRecord.orders || []).find((o: any) => o.orderId === id);
    const buyerPhone = buyerRecord.phone || orderRecord?.shippingAddress?.phone || '';
    const cleanPhone = buyerPhone.replace(/[^0-9]/g, '');
    let waWindow: Window | null = null;
    if (cleanPhone.length >= 10) {
      const buyerName = users.find(u => u.uid === buyerId)?.displayName || 'Customer';
      const msg = `Hi ${buyerName},\nYour order ${id.slice(0, 8).toUpperCase()} has been updated to: ${newStatus}\nThank you for shopping with AniSell!`;
      waWindow = window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    }
    try {
      const buyerRef = doc(db, 'buyers', buyerId);
      const updatedOrders = (buyerRecord.orders || []).map((o: any) => 
         o.orderId === id ? { ...o, status: newStatus as any } : o
      );
      
      await updateDoc(buyerRef, { orders: updatedOrders });
      if (selectedOrder && selectedOrder.orderId === id) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      if (waWindow) {
        const buyerName = users.find(u => u.uid === buyerId)?.displayName || 'Customer';
        const msg = `Hi ${buyerName},\nYour order ${id.slice(0, 8).toUpperCase()} has been updated to: ${newStatus}\nThank you for shopping with AniSell!`;
        waWindow.location.href = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
      }
    } catch (error) {
      console.error(`Failed to execute logistics update on order ${id}:`, error);
      alert('Network failure: Unable to transition order state.');
    }
  };

  const handleVerifyPayment = async (order: any) => {
    if (!window.confirm(`Verify payment for order ${order.orderId}? This will mark payment as paid.`)) return;
    try {
      const buyerRecord = buyers.find(b => b.buyerId === order.buyerId);
      if (!buyerRecord) throw new Error('Buyer record not found');
      const buyerRef = doc(db, 'buyers', order.buyerId);
      const updatedOrders = (buyerRecord.orders || []).map((o: any) =>
        o.orderId === order.orderId
          ? { ...o, payment: { ...o.payment, status: 'paid', paidAt: new Date().toISOString() } }
          : o
      );
      await updateDoc(buyerRef, { orders: updatedOrders });
      setSelectedOrder({ ...order, payment: { ...order.payment, status: 'paid', paidAt: new Date().toISOString() } });
    } catch (error) {
      console.error('Payment verification failed:', error);
      alert('Failed to verify payment.');
    }
  };

  const handleProductClick = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    const foundProduct = products.find(p => p.productId === productId);
    if (foundProduct) {
      setSelectedProduct(foundProduct);
    }
  };

  const handleAction = async (id: string, action: string) => {
    const confirmationText = action === 'Delete' ? 'permanently purge' : action === 'Approve' ? 'verify and list' : 'decline';
    if (!window.confirm(`Are you certain you want to ${confirmationText} this registry entry?`)) return;

    try {
      const productRef = doc(db, 'products', id);
      if (action === 'Delete') {
         await deleteDoc(productRef);
         setSelectedProduct(null);
      } else if (action === 'Approve') {
         await updateDoc(productRef, { status: 'APPROVED' });
         if (selectedProduct && selectedProduct.productId === id) {
           setSelectedProduct({ ...selectedProduct, status: 'APPROVED' });
         }
      } else if (action === 'Reject') {
         await updateDoc(productRef, { status: 'REJECTED' });
         if (selectedProduct && selectedProduct.productId === id) {
           setSelectedProduct({ ...selectedProduct, status: 'REJECTED' });
         }
      }
    } catch (error) {
       console.error(`Failed to execute ${action} on product ${id}:`, error);
       alert(`Authorization failure: Unable to ${action.toLowerCase()} listing.`);
    }
  };

  const orderColumns = tab === 'main' ? [
    { 
      header: 'Fulfillment Reference', 
      key: 'orderId',
      render: (o: any) => (
        <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '14px' }}>#{(o.orderId || '').substring(0, 8).toUpperCase()}</div>
      )
    },
    { 
      header: 'Buyer Identity', 
      key: 'buyer', 
      render: (o: any) => (
        <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '14px' }}>{o.buyerName}</div>
      )
    },
    { 
      header: 'Merchant Entity', 
      key: 'seller', 
      render: (o: any) => (
        <div style={{ fontWeight: 600, color: '#2563eb', fontSize: '14px' }}>{o.sellerName}</div>
      )
    },
    { 
      header: 'Product Detail', 
      key: 'product', 
      render: (o: any) => (
        <div 
          onClick={(e) => handleProductClick(e, o.productId)}
          style={{ 
            fontWeight: 600, 
            color: '#2563eb', 
            fontSize: '14px', 
            maxWidth: '180px', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          {o.productName}
        </div>
      )
    },
    { 
      header: 'Gross Value', 
      key: 'revenue', 
      render: (o: any) => (
        <div style={{ fontWeight: 800, color: '#10b981', fontSize: '15px' }}>₹{(o.amount || 0).toLocaleString()}</div>
      )
    },
    { 
      header: 'Payment', 
      key: 'payment', 
      render: (o: any) => {
        const payment = o.payment;
        if (!payment) return <Badge label="COD" variant="neutral" />;
        return (
          <Badge 
            label={payment.status === 'paid' ? 'Paid' : payment.method === 'cod' ? 'COD' : 'Pending'} 
            variant={payment.status === 'paid' ? 'success' : 'warning'} 
          />
        );
      }
    },
    { 
      header: 'Operational State', 
      key: 'status', 
      render: (o: any) => {
         const variants: any = {
           'DELIVERED': 'success',
           'SHIPPED': 'primary',
           'PROCESSING': 'warning',
           'CONFIRMED': 'primary',
           'CANCELLED': 'error',
           'PENDING': 'neutral'
         };
         return <Badge label={o.status || 'PENDING'} variant={variants[o.status] || 'neutral'} />;
      }
    }
  ] : [
    {
      header: 'Order Ref',
      key: 'trackingId',
      render: (o: any) => (
        <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '14px' }}>#{(o.trackingId || o.id || '').substring(0, 8).toUpperCase()}</div>
      )
    },
    {
      header: 'Buyer',
      key: 'buyerName',
      render: (o: any) => (
        <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '14px' }}>{o.shippingAddress?.fullName || 'N/A'}</div>
      )
    },
    {
      header: 'Items',
      key: 'items',
      render: (o: any) => (
        <div style={{ fontWeight: 600, color: '#475569', fontSize: '13px' }}>{(o.items || []).length} item(s)</div>
      )
    },
    {
      header: 'Total',
      key: 'total',
      render: (o: any) => (
        <div style={{ fontWeight: 800, color: '#10b981', fontSize: '15px' }}>₹{(o.total || 0).toLocaleString()}</div>
      )
    },
    {
      header: 'Payment',
      key: 'paymentStatus',
      render: (o: any) => (
        <Badge label={o.paymentStatus === 'paid' ? 'Paid' : o.paymentStatus === 'pending_verification' ? 'UTR Pending' : o.paymentMethod === 'cod' ? 'COD' : o.paymentStatus || 'N/A'} variant={o.paymentStatus === 'paid' ? 'success' : 'warning'} />
      )
    },
    {
      header: 'Status',
      key: 'status',
      render: (o: any) => {
        const variants: any = {
          'delivered': 'success',
          'shipped': 'primary',
          'confirmed': 'primary',
          'out_for_delivery': 'warning',
          'placed': 'neutral',
          'cancelled': 'error'
        };
        return <Badge label={(o.status || '').replace(/_/g, ' ')} variant={variants[o.status] || 'neutral'} />;
      }
    }
  ];

  return (
    <div className="admin-dashboard-content">
      <header style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Global Transaction Hub</h1>
            <p style={{ color: '#64748b', fontSize: '15px' }}>Govern fulfillment pipelines and oversee platform logistics operations.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: 600 }}
            >
              <option value="All">All Transactions</option>
              {tab === 'main' ? (
                <>
                  <option value="PENDING">Pending Action</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="PROCESSING">Currently Processing</option>
                  <option value="SHIPPED">In Transit Hubs</option>
                  <option value="DELIVERED">Fulfillment Closed</option>
                  <option value="CANCELLED">Voided Pacts</option>
                </>
              ) : (
                <>
                  <option value="placed">Placed</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </>
              )}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setTab('main')} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', background: tab === 'main' ? '#1e293b' : '#f1f5f9', color: tab === 'main' ? '#fff' : '#475569' }}>Main Site ({allOrders.length})</button>
          <button onClick={() => setTab('petverse')} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', background: tab === 'petverse' ? '#1e293b' : '#f1f5f9', color: tab === 'petverse' ? '#fff' : '#475569' }}>Petverse Store ({petverseOrders.length})</button>
        </div>
      </header>

      <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <Table data={filteredOrders} columns={orderColumns} onRowClick={(o) => setSelectedOrder(o)} />
      </div>

      {selectedOrder && tab === 'main' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
           <div style={{ background: '#fff', width: '100%', maxWidth: '640px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.25)', position: 'relative' }}>
              <button 
                onClick={() => setSelectedOrder(null)}
                style={{ position: 'absolute', top: '24px', right: '24px', background: '#f1f5f9', border: 'none', borderRadius: '12px', padding: '8px', cursor: 'pointer', zIndex: 10 }}
              >
                <FiX size={20} />
              </button>
              
              <div style={{ padding: '40px' }}>
                <header style={{ marginBottom: '32px' }}>
                   <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Logistics Operation Update</div>
                   <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>Order #{selectedOrder.orderId.substring(0, 12).toUpperCase()}</h2>
                   <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Recorded on {new Date(selectedOrder.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '32px', marginBottom: '40px' }}>
                   <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                         <h4 style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, marginBottom: '12px' }}>Financial Clearance</h4>
                         <div style={{ fontSize: '24px', fontWeight: 800, color: '#10b981' }}>₹{selectedOrder.amount.toLocaleString()}</div>
                         {selectedOrder.payment && (
                           <div style={{ marginTop: '8px' }}>
                             <Badge 
                               label={selectedOrder.payment.status === 'paid' ? 'Payment Verified' : selectedOrder.payment.method === 'cod' ? 'COD' : 'Payment Pending'} 
                               variant={selectedOrder.payment.status === 'paid' ? 'success' : 'warning'} 
                             />
                           </div>
                         )}
                      </div>
                      <div>
                         <h4 style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, marginBottom: '8px' }}>Fulfillment Identity</h4>
                         <div style={{ fontSize: '15px', color: '#1e293b', fontWeight: 700 }}>{selectedOrder.buyerName}</div>
                         <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>{selectedOrder.buyerEmail}</div>
                      </div>
                      <div>
                         <h4 style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, marginBottom: '8px' }}>Merchant Hub</h4>
                         <div style={{ fontSize: '15px', color: '#2563eb', fontWeight: 700 }}>{selectedOrder.sellerName}</div>
                         <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Registry ID: {selectedOrder.sellerId}</div>
                      </div>
                   </section>

                   <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                         <h4 style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, marginBottom: '12px' }}>Operational State</h4>
                         <div style={{ marginBottom: '8px' }}>
                            <Badge label={selectedOrder.status} variant={selectedOrder.status === 'DELIVERED' ? 'success' : selectedOrder.status === 'CANCELLED' ? 'error' : 'warning'} />
                         </div>
                         <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Units: {selectedOrder.quantity || 1} x Product</div>
                      </div>
                      <div>
                         <h4 style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, marginBottom: '8px' }}>Product Profile</h4>
                         <div style={{ fontSize: '15px', color: '#1e293b', fontWeight: 700 }}>{selectedOrder.productName}</div>
                         <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>{selectedOrder.productCategory} • {selectedOrder.productBreed || 'Standard Breed'}</div>
                      </div>
                      {selectedOrder.payment && selectedOrder.payment.method !== 'cod' && (
                        <div style={{ background: selectedOrder.payment.status === 'paid' ? '#f0fdf4' : '#fffbeb', padding: '16px', borderRadius: '12px', border: `1px solid ${selectedOrder.payment.status === 'paid' ? '#bbf7d0' : '#fde68a'}` }}>
                          <h4 style={{ fontSize: '10px', color: '#16a34a', textTransform: 'uppercase', fontWeight: 800, marginBottom: '8px' }}>Payment Details</h4>
                          {selectedOrder.payment.utrNumber && (
                            <div style={{ fontSize: '13px', color: '#1e293b', fontWeight: 600, marginBottom: '4px' }}>
                              UTR: {selectedOrder.payment.utrNumber}
                            </div>
                          )}
                          <div style={{ fontSize: '13px', color: '#1e293b', fontWeight: 600 }}>
                            Method: {selectedOrder.payment.method === 'upi_qr' ? 'UPI QR' : 'Bank Transfer'}
                          </div>
                          <div style={{ fontSize: '12px', color: selectedOrder.payment.status === 'paid' ? '#16a34a' : '#d97706', fontWeight: 600, marginTop: '4px' }}>
                            Status: {selectedOrder.payment.status === 'paid' ? 'Verified ✓' : 'Pending Verification'}
                          </div>
                          {selectedOrder.payment.status !== 'paid' && (
                            <button
                              onClick={() => handleVerifyPayment(selectedOrder)}
                              style={{ marginTop: '12px', padding: '10px 20px', background: '#059669', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', width: '100%' }}
                            >
                              Verify Payment
                            </button>
                          )}
                        </div>
                      )}
                   </section>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '32px' }}>
                   <h4 style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.05em' }}>Logistics State Management</h4>
                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px' }}>
                      <button 
                         onClick={() => handleStatusUpdate(selectedOrder.orderId, selectedOrder.buyerId, 'CONFIRMED')} 
                         disabled={selectedOrder.status !== 'PENDING'} 
                         style={{ padding: '14px', background: '#ecfdf5', color: '#047857', border: '1px solid #d1fae5', borderRadius: '14px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', opacity: selectedOrder.status !== 'PENDING' ? 0.4 : 1 }}
                      >
                         <FiShield /> Confirm Order
                      </button>
                      <button 
                         onClick={() => handleStatusUpdate(selectedOrder.orderId, selectedOrder.buyerId, 'PROCESSING')} 
                         disabled={selectedOrder.status === 'PROCESSING' || selectedOrder.status === 'DELIVERED' || selectedOrder.status === 'CANCELLED'} 
                         style={{ padding: '14px', background: '#fffbeb', color: '#b45309', border: '1px solid #fef3c7', borderRadius: '14px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', opacity: (selectedOrder.status === 'PROCESSING' || selectedOrder.status === 'DELIVERED' || selectedOrder.status === 'CANCELLED') ? 0.4 : 1 }}
                      >
                         <FiBox /> Mark Processing
                      </button>
                      <button 
                         onClick={() => handleStatusUpdate(selectedOrder.orderId, selectedOrder.buyerId, 'SHIPPED')} 
                         disabled={selectedOrder.status === 'SHIPPED' || selectedOrder.status === 'DELIVERED' || selectedOrder.status === 'CANCELLED'} 
                         style={{ padding: '14px', background: '#eef2ff', color: '#4338ca', border: '1px solid #e0e7ff', borderRadius: '14px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', opacity: (selectedOrder.status === 'SHIPPED' || selectedOrder.status === 'DELIVERED' || selectedOrder.status === 'CANCELLED') ? 0.4 : 1 }}
                      >
                         <FiTruck /> Dispatch Item
                      </button>
                   </div>
                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                      <button 
                         onClick={() => handleStatusUpdate(selectedOrder.orderId, selectedOrder.buyerId, 'DELIVERED')} 
                         disabled={selectedOrder.status === 'DELIVERED' || selectedOrder.status === 'CANCELLED'} 
                         style={{ padding: '14px', background: '#ecfdf5', color: '#047857', border: '1px solid #d1fae5', borderRadius: '14px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', opacity: (selectedOrder.status === 'DELIVERED' || selectedOrder.status === 'CANCELLED') ? 0.4 : 1 }}
                      >
                         <FiCheck /> Complete Order
                      </button>
                      <button 
                         onClick={() => handleStatusUpdate(selectedOrder.orderId, selectedOrder.buyerId, 'CANCELLED')} 
                         disabled={selectedOrder.status === 'CANCELLED' || selectedOrder.status === 'DELIVERED'} 
                         style={{ padding: '14px', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fee2e2', borderRadius: '14px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', opacity: (selectedOrder.status === 'CANCELLED' || selectedOrder.status === 'DELIVERED') ? 0.4 : 1 }}
                      >
                         <FiXCircle /> Terminate
                      </button>
                   </div>
                </div>
              </div>
           </div>
        </div>
      )}

      {selectedOrder && tab === 'petverse' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
           <div style={{ background: '#fff', width: '100%', maxWidth: '640px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.25)', position: 'relative' }}>
              <button onClick={() => setSelectedOrder(null)} style={{ position: 'absolute', top: '24px', right: '24px', background: '#f1f5f9', border: 'none', borderRadius: '12px', padding: '8px', cursor: 'pointer', zIndex: 10 }}><FiX size={20} /></button>
              <div style={{ padding: '40px' }}>
                <header style={{ marginBottom: '32px' }}>
                   <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Petverse Order</div>
                   <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>Order #{selectedOrder.trackingId || selectedOrder.id.slice(0, 8).toUpperCase()}</h2>
                   <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Placed on {new Date(selectedOrder.placedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '32px', marginBottom: '40px' }}>
                   <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                         <h4 style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, marginBottom: '12px' }}>Financial Clearance</h4>
                         <div style={{ fontSize: '24px', fontWeight: 800, color: '#10b981' }}>₹{selectedOrder.total.toLocaleString()}</div>
                         <div style={{ marginTop: '8px' }}><Badge label={selectedOrder.paymentStatus === 'paid' ? 'Paid' : selectedOrder.paymentStatus === 'pending_verification' ? 'UTR Pending' : selectedOrder.paymentMethod === 'cod' ? 'COD' : selectedOrder.paymentStatus} variant={selectedOrder.paymentStatus === 'paid' ? 'success' : 'warning'} /></div>
                      </div>
                      <div>
                         <h4 style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, marginBottom: '8px' }}>Buyer</h4>
                         <div style={{ fontSize: '15px', color: '#1e293b', fontWeight: 700 }}>{selectedOrder.shippingAddress?.fullName}</div>
                         <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>{selectedOrder.shippingAddress?.phone}</div>
                      </div>
                      <div>
                         <h4 style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, marginBottom: '8px' }}>Delivery Address</h4>
                         <div style={{ fontSize: '13px', color: '#1e293b', fontWeight: 600 }}>{selectedOrder.shippingAddress?.line1}{selectedOrder.shippingAddress?.line2 ? ', ' + selectedOrder.shippingAddress?.line2 : ''}</div>
                         <div style={{ fontSize: '13px', color: '#64748b' }}>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}</div>
                      </div>
                   </section>

                   <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                         <h4 style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, marginBottom: '12px' }}>Operational State</h4>
                         <div style={{ marginBottom: '8px' }}><Badge label={selectedOrder.status.replace(/_/g, ' ')} variant={selectedOrder.status === 'delivered' ? 'success' : selectedOrder.status === 'cancelled' ? 'error' : 'warning'} /></div>
                      </div>
                      <div>
                         <h4 style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, marginBottom: '8px' }}>Items</h4>
                         {selectedOrder.items?.map((item: any, i: number) => (
                           <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                             <img src={item.image} alt={item.title} style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} />
                             <div>
                               <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{item.title}</div>
                               <div style={{ fontSize: '12px', color: '#64748b' }}>x{item.quantity} @ ₹{item.unitPrice}</div>
                             </div>
                           </div>
                         ))}
                      </div>
                      {selectedOrder.utr && (
                        <div style={{ background: '#fffbeb', padding: '16px', borderRadius: '12px', border: '1px solid #fde68a' }}>
                          <h4 style={{ fontSize: '10px', color: '#d97706', textTransform: 'uppercase', fontWeight: 800, marginBottom: '8px' }}>UTR Reference</h4>
                          <div style={{ fontSize: '14px', color: '#1e293b', fontWeight: 700 }}>{selectedOrder.utr}</div>
                        </div>
                      )}
                   </section>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '32px' }}>
                   <h4 style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.05em' }}>Logistics State Management</h4>
                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px' }}>
                      <button onClick={() => updatePetverseOrderStatus(selectedOrder.id, 'confirmed')} disabled={selectedOrder.status !== 'placed'} style={{ padding: '14px', background: '#ecfdf5', color: '#047857', border: '1px solid #d1fae5', borderRadius: '14px', fontWeight: 800, cursor: 'pointer', opacity: selectedOrder.status !== 'placed' ? 0.4 : 1 }}><FiShield /> Confirm</button>
                      <button onClick={() => updatePetverseOrderStatus(selectedOrder.id, 'shipped')} disabled={selectedOrder.status === 'shipped' || selectedOrder.status === 'delivered' || selectedOrder.status === 'cancelled'} style={{ padding: '14px', background: '#eef2ff', color: '#4338ca', border: '1px solid #e0e7ff', borderRadius: '14px', fontWeight: 800, cursor: 'pointer', opacity: (selectedOrder.status === 'shipped' || selectedOrder.status === 'delivered' || selectedOrder.status === 'cancelled') ? 0.4 : 1 }}><FiTruck /> Ship</button>
                      <button onClick={() => updatePetverseOrderStatus(selectedOrder.id, 'out_for_delivery')} disabled={selectedOrder.status === 'out_for_delivery' || selectedOrder.status === 'delivered' || selectedOrder.status === 'cancelled'} style={{ padding: '14px', background: '#fffbeb', color: '#b45309', border: '1px solid #fef3c7', borderRadius: '14px', fontWeight: 800, cursor: 'pointer', opacity: (selectedOrder.status === 'out_for_delivery' || selectedOrder.status === 'delivered' || selectedOrder.status === 'cancelled') ? 0.4 : 1 }}><FiBox /> Out for Delivery</button>
                   </div>
                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                      <button onClick={() => updatePetverseOrderStatus(selectedOrder.id, 'delivered')} disabled={selectedOrder.status === 'delivered' || selectedOrder.status === 'cancelled'} style={{ padding: '14px', background: '#ecfdf5', color: '#047857', border: '1px solid #d1fae5', borderRadius: '14px', fontWeight: 800, cursor: 'pointer', opacity: (selectedOrder.status === 'delivered' || selectedOrder.status === 'cancelled') ? 0.4 : 1 }}><FiCheck /> Delivered</button>
                      <button onClick={() => updatePetverseOrderStatus(selectedOrder.id, 'cancelled')} disabled={selectedOrder.status === 'cancelled' || selectedOrder.status === 'delivered'} style={{ padding: '14px', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fee2e2', borderRadius: '14px', fontWeight: 800, cursor: 'pointer', opacity: (selectedOrder.status === 'cancelled' || selectedOrder.status === 'delivered') ? 0.4 : 1 }}><FiXCircle /> Cancel</button>
                   </div>
                </div>
              </div>
           </div>
        </div>
      )}

      {selectedProduct && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
           <div style={{ background: '#fff', width: '100%', maxWidth: '800px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.25)', position: 'relative' }}>
              <button 
                onClick={() => setSelectedProduct(null)}
                style={{ position: 'absolute', top: '24px', right: '24px', background: '#f1f5f9', border: 'none', borderRadius: '12px', padding: '10px', cursor: 'pointer', zIndex: 10 }}
              >
                <FiX />
              </button>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr' }}>
                 <div style={{ padding: '40px', background: '#f8fafc', borderRight: '1px solid #e2e8f0' }}>
                    <div style={{ position: 'relative', marginBottom: '16px' }}>
                       <img 
                          src={selectedProduct.productMedia[0]} 
                          alt="" 
                          style={{ width: '100%', aspectRatio: '1', borderRadius: '20px', objectFit: 'cover', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                       />
                       <div style={{ position: 'absolute', bottom: '12px', left: '12px' }}>
                          <Badge label={selectedProduct.status} variant={selectedProduct.status === 'APPROVED' ? 'success' : 'warning'} />
                       </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                       {selectedProduct.productMedia.slice(1).map((m: any, i: number) => (
                          <img key={i} src={m} alt="" style={{ width: '100%', aspectRatio: '1', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                       ))}
                    </div>
                 </div>

                 <div style={{ padding: '40px' }}>
                    <header style={{ marginBottom: '32px' }}>
                       <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Inventory Operations Registry</div>
                       <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>{selectedProduct.productSubCategory}</h2>
                       <div style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>{selectedProduct.productCategory} • {selectedProduct.productType}</div>
                    </header>

                    <div style={{ background: '#f1f5f9', padding: '20px', borderRadius: '20px', marginBottom: '32px', border: '1px solid #e2e8f0' }}>
                       <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 800, marginBottom: '4px' }}>Commercial Valuation</div>
                       <div style={{ fontSize: '32px', fontWeight: 800, color: '#2563eb' }}>₹{selectedProduct.productPrice.toLocaleString()}</div>
                    </div>

                    <div style={{ marginBottom: '40px' }}>
                       <h4 style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.05em' }}>Biological Specifications</h4>
                       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                          <div>
                             <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Biological Age</div>
                             <div style={{ fontSize: '15px', color: '#1e293b', fontWeight: 800 }}>{selectedProduct.productAge}</div>
                          </div>
                          <div>
                             <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Gender Profile</div>
                             <div style={{ fontSize: '15px', color: '#1e293b', fontWeight: 800 }}>{selectedProduct.productGender}</div>
                          </div>
                          <div>
                             <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Medical Protocol</div>
                             <div style={{ fontSize: '15px', color: '#1e293b', fontWeight: 800 }}>{selectedProduct.productVaccinated ? 'Vaccinated' : 'Pending Protocol'}</div>
                          </div>
                          <div>
                             <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Product Reference</div>
                             <div style={{ fontSize: '15px', color: '#1e293b', fontWeight: 800 }}>ID: {selectedProduct.productId.substring(0, 8).toUpperCase()}</div>
                          </div>
                       </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '12px' }}>
                       <button 
                          onClick={() => handleAction(selectedProduct.productId, 'Approve')}
                          disabled={selectedProduct.status === 'APPROVED'}
                          style={{ padding: '16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '16px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', opacity: selectedProduct.status === 'APPROVED' ? 0.3 : 1 }}
                       >
                          Authorize Listing
                       </button>
                       <button 
                          onClick={() => handleAction(selectedProduct.productId, 'Reject')}
                          disabled={selectedProduct.status === 'REJECTED'}
                          style={{ padding: '16px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '16px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', opacity: selectedProduct.status === 'REJECTED' ? 0.3 : 1 }}
                       >
                          Reject
                       </button>
                       <button 
                          onClick={() => handleAction(selectedProduct.productId, 'Delete')}
                          style={{ gridColumn: 'span 2', padding: '16px', background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '16px', fontWeight: 800, cursor: 'pointer' }}
                       >
                          Purge Registry Entry
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { PetOrderService } from '@/services/api/petverse/PetOrderService';
import { PETVERSE_ROUTES } from '@/constants/petverseRoutes';
import type { PetOrder } from '@/types/petverse';
import '@/features/petverse/petverse.css';

const PetverseOrders: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<PetOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const data = await PetOrderService.getOrdersForUser(user.uid);
      if (!cancelled) {
        setOrders(data);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  if (authLoading || loading) return <div className="pv-loading">Loading your orders…</div>;

  if (!user) {
    return (
      <div className="pv-container pv-section">
        <div className="pv-empty-state">
          <div className="pv-empty-icon">📦</div>
          <h2>Login to view your orders</h2>
          <Link to="/login" className="pv-btn pv-btn-primary" style={{ marginTop: 16 }}>Login</Link>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="pv-container pv-section">
        <div className="pv-empty-state">
          <div className="pv-empty-icon">📦</div>
          <h2>No orders yet</h2>
          <p>Your AniSell orders will show up here.</p>
          <Link to={PETVERSE_ROUTES.HOME} className="pv-btn pv-btn-primary" style={{ marginTop: 16 }}>Start Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pv-container pv-section">
      <h1 className="pv-section-title" style={{ marginBottom: 20 }}>Your Orders</h1>
      {orders.map((order) => (
        <Link key={order.id} to={PETVERSE_ROUTES.orderPath(order.id)} className="pv-order-card" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
          <div className="pv-order-header">
            <div>
              <strong>Order #{order.trackingId ?? order.id.slice(0, 8)}</strong>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                Placed on {new Date(order.placedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
            <span className={`pv-status-pill ${order.status}`}>{order.status.replace(/_/g, ' ')}</span>
          </div>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
            {order.items.length} item{order.items.length > 1 ? 's' : ''} · ₹{order.total.toLocaleString('en-IN')}
          </p>
        </Link>
      ))}
    </div>
  );
};

export default PetverseOrders;

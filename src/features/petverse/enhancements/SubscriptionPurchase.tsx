import React, { useState, useMemo } from 'react';
import styles from './SubscriptionPurchase.module.css';

type Frequency = 'weekly' | 'biweekly' | 'monthly' | 'quarterly';

interface SubscriptionItem {
  id: string;
  productTitle: string;
  productImage: string;
  pricePerUnit: number;
  frequency: Frequency;
  nextDelivery: string;
  status: 'active' | 'paused';
  discountPercent: number;
}

interface DeliveryRecord {
  id: string;
  date: string;
  amount: number;
  productTitle: string;
}

const FREQUENCY_LABELS: Record<Frequency, string> = {
  weekly: 'Weekly',
  biweekly: 'Bi-weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
};

const MOCK_SUBSCRIPTIONS: SubscriptionItem[] = [
  {
    id: 'sub-1',
    productTitle: 'Premium Organic Cat Food (5kg)',
    productImage: 'https://placehold.co/80x80/f0f4ff/4a6fa5?text=Cat+Food',
    pricePerUnit: 1299,
    frequency: 'monthly',
    nextDelivery: '2026-08-15',
    status: 'active',
    discountPercent: 10,
  },
  {
    id: 'sub-2',
    productTitle: 'Calming Diffuser Refill (3-pack)',
    productImage: 'https://placehold.co/80x80/f0fff4/2d8a4e?text=Diffuser',
    pricePerUnit: 649,
    frequency: 'biweekly',
    nextDelivery: '2026-08-05',
    status: 'active',
    discountPercent: 10,
  },
  {
    id: 'sub-3',
    productTitle: 'Multi-Vitamin Chews for Dogs',
    productImage: 'https://placehold.co/80x80/fff8f0/c47820?text=Vitamins',
    pricePerUnit: 499,
    frequency: 'quarterly',
    nextDelivery: '2026-10-01',
    status: 'paused',
    discountPercent: 10,
  },
  {
    id: 'sub-4',
    productTitle: 'Clumping Litter (10kg)',
    productImage: 'https://placehold.co/80x80/f5f0ff/7c4dff?text=Litter',
    pricePerUnit: 899,
    frequency: 'monthly',
    nextDelivery: '2026-08-20',
    status: 'active',
    discountPercent: 10,
  },
];

const MOCK_HISTORY: DeliveryRecord[] = [
  { id: 'del-1', date: '2026-07-01', amount: 1169, productTitle: 'Premium Organic Cat Food (5kg)' },
  { id: 'del-2', date: '2026-06-15', amount: 584, productTitle: 'Calming Diffuser Refill (3-pack)' },
  { id: 'del-3', date: '2026-07-10', amount: 809, productTitle: 'Clumping Litter (10kg)' },
  { id: 'del-4', date: '2026-06-20', amount: 449, productTitle: 'Multi-Vitamin Chews for Dogs' },
  { id: 'del-5', date: '2026-05-01', amount: 1169, productTitle: 'Premium Organic Cat Food (5kg)' },
  { id: 'del-6', date: '2026-06-01', amount: 809, productTitle: 'Clumping Litter (10kg)' },
];

export const SubscriptionPurchase: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>(MOCK_SUBSCRIPTIONS);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newFreq, setNewFreq] = useState<Frequency>('monthly');

  const totalSavings = useMemo(() => {
    return MOCK_HISTORY.reduce((sum, r) => {
      const full = r.amount / 0.9;
      return sum + (full - r.amount);
    }, 0);
  }, []);

  const togglePause = (id: string) => {
    setSubscriptions((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status: s.status === 'active' ? 'paused' : 'active' } : s
      )
    );
  };

  const cancelSubscription = (id: string) => {
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
  };

  const saveFrequency = (id: string) => {
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, frequency: newFreq } : s))
    );
    setEditingId(null);
  };

  const startEdit = (id: string, current: Frequency) => {
    setEditingId(id);
    setNewFreq(current);
  };

  return (
    <div className={styles.container}>
      <div className="pv-section-header">
        <h2 className="pv-section-title">Subscribe & Save</h2>
        <span className={styles.savingsTag}>
          You've saved ₹{totalSavings.toLocaleString('en-IN')} with subscriptions!
        </span>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'active' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Active Subscriptions ({subscriptions.filter((s) => s.status === 'active').length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'history' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Past Deliveries
        </button>
      </div>

      {activeTab === 'active' && (
        <div className={styles.list}>
          {subscriptions.length === 0 && (
            <div className="pv-empty-state">
              <div className="pv-empty-icon">📦</div>
              <p>No active subscriptions</p>
            </div>
          )}
          {subscriptions.map((sub) => (
            <div key={sub.id} className={`${styles.card} ${sub.status === 'paused' ? styles.paused : ''}`}>
              <img src={sub.productImage} alt={sub.productTitle} className={styles.cardImage} />
              <div className={styles.cardBody}>
                <div className={styles.cardHeader}>
                  <h4 className={styles.cardTitle}>{sub.productTitle}</h4>
                  <span className={styles.discountBadge}>10% OFF</span>
                </div>
                <div className={styles.cardMeta}>
                  <span className={styles.price}>₹{sub.pricePerUnit.toLocaleString('en-IN')}/unit</span>
                  <span className={styles.separator}>·</span>
                  <span className={styles.deliveryDate}>
                    Next: {new Date(sub.nextDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                {editingId === sub.id ? (
                  <div className={styles.freqEditor}>
                    <select
                      className={styles.freqSelect}
                      value={newFreq}
                      onChange={(e) => setNewFreq(e.target.value as Frequency)}
                    >
                      {(Object.keys(FREQUENCY_LABELS) as Frequency[]).map((f) => (
                        <option key={f} value={f}>{FREQUENCY_LABELS[f]}</option>
                      ))}
                    </select>
                    <button className={styles.saveBtn} onClick={() => saveFrequency(sub.id)}>Save</button>
                    <button className={styles.cancelBtn} onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                ) : (
                  <div className={styles.cardMeta}>
                    <span className={styles.freqLabel}>Every {FREQUENCY_LABELS[sub.frequency]}</span>
                  </div>
                )}

                <div className={styles.actions}>
                  <button className="pv-btn pv-btn-outline" onClick={() => togglePause(sub.id)}>
                    {sub.status === 'active' ? '⏸ Pause' : '▶ Resume'}
                  </button>
                  {editingId !== sub.id && (
                    <button className="pv-btn pv-btn-outline" onClick={() => startEdit(sub.id, sub.frequency)}>
                      ✏️ Frequency
                    </button>
                  )}
                  <button className={styles.skipBtn}>⏭ Skip Next</button>
                  <button className={styles.cancelAction} onClick={() => cancelSubscription(sub.id)}>
                    ✕ Cancel
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'history' && (
        <div className={styles.historyTable}>
          <div className={styles.tableHeader}>
            <span>Date</span>
            <span>Product</span>
            <span>Amount</span>
          </div>
          {MOCK_HISTORY.map((rec) => (
            <div key={rec.id} className={styles.tableRow}>
              <span>{new Date(rec.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              <span>{rec.productTitle}</span>
              <span className={styles.price}>₹{rec.amount.toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>
      )}

      <div className={styles.savingsCard}>
        <h4>💰 Savings Calculator</h4>
        <p>By subscribing, you save <strong>10%</strong> on every delivery. Based on your order history:</p>
        <div className={styles.savingsRow}>
          <span>Total spent (without subscription)</span>
          <span>₹{MOCK_HISTORY.reduce((s, r) => s + r.amount / 0.9, 0).toFixed(0)}</span>
        </div>
        <div className={styles.savingsRow}>
          <span>Total spent (with subscription)</span>
          <span>₹{MOCK_HISTORY.reduce((s, r) => s + r.amount, 0).toLocaleString('en-IN')}</span>
        </div>
        <div className={`${styles.savingsRow} ${styles.savingsHighlight}`}>
          <span>Total Saved</span>
          <span>₹{totalSavings.toFixed(0)}</span>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPurchase;

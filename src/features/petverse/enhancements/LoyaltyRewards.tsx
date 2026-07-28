import { useState, useEffect } from 'react';
import styles from './LoyaltyRewards.module.css';

interface PointsEntry {
  date: string;
  description: string;
  points: number;
  runningBalance: number;
}

interface RewardItem {
  id: string;
  title: string;
  pointsCost: number;
  icon: string;
}

interface Redemption {
  id: string;
  rewardTitle: string;
  pointsSpent: number;
  date: string;
}

interface LoyaltyData {
  points: number;
  tier: string;
  pointsHistory: PointsEntry[];
  redemptions: Redemption[];
}

const TIERS = [
  { name: 'Bronze', minPoints: 0, color: '#cd7f32' },
  { name: 'Silver', minPoints: 500, color: '#c0c0c0' },
  { name: 'Gold', minPoints: 1500, color: '#ffd700' },
  { name: 'Platinum', minPoints: 3000, color: '#e5e4e2' },
];

const WAYS = [
  { icon: '🛍️', title: 'Purchases', desc: '1pt per ₹1 spent' },
  { icon: '✍️', title: 'Reviews', desc: '50pts per review' },
  { icon: '🔗', title: 'Referrals', desc: '200pts per referral' },
  { icon: '🎂', title: 'Birthday Bonus', desc: '100pts on your birthday' },
];

const REWARDS: RewardItem[] = [
  { id: 'r1', title: '₹50 Off', pointsCost: 500, icon: '💵' },
  { id: 'r2', title: '₹100 Off', pointsCost: 900, icon: '💸' },
  { id: 'r3', title: 'Free Shipping', pointsCost: 300, icon: '📦' },
  { id: 'r4', title: 'Exclusive Tote', pointsCost: 2000, icon: '👜' },
  { id: 'r5', title: '₹500 Voucher', pointsCost: 4500, icon: '🎫' },
];

const BENEFITS = [
  { label: 'Free Shipping', bronze: false, silver: true, gold: true, platinum: true },
  { label: 'Birthday Bonus', bronze: false, silver: false, gold: true, platinum: true },
  { label: 'Early Access', bronze: false, silver: false, gold: true, platinum: true },
  { label: 'Exclusive Events', bronze: false, silver: false, gold: false, platinum: true },
  { label: 'Personal Manager', bronze: false, silver: false, gold: false, platinum: true },
  { label: 'Extra Discount', bronze: '—', silver: '5%', gold: '10%', platinum: '20%' },
  { label: 'Points Multiplier', bronze: '1x', silver: '1.5x', gold: '2x', platinum: '3x' },
];

const SAMPLE_HISTORY: PointsEntry[] = [
  { date: '2026-07-28', description: 'Order #1042', points: 120, runningBalance: 120 },
  { date: '2026-07-25', description: 'Product Review', points: 50, runningBalance: 170 },
  { date: '2026-07-22', description: 'Referral Bonus', points: 200, runningBalance: 370 },
  { date: '2026-07-20', description: 'Order #1039', points: 85, runningBalance: 455 },
  { date: '2026-07-18', description: 'Redeemed ₹50 Off', points: -500, runningBalance: -45 },
  { date: '2026-07-15', description: 'Order #1035', points: 200, runningBalance: 155 },
  { date: '2026-07-12', description: 'Birthday Bonus', points: 100, runningBalance: 255 },
  { date: '2026-07-10', description: 'Order #1028', points: 65, runningBalance: 320 },
];

const STORAGE_KEY = 'pv_loyalty';

function getTier(points: number) {
  let current = TIERS[0];
  for (const t of TIERS) {
    if (points >= t.minPoints) current = t;
  }
  return current;
}

function nextTier(points: number) {
  for (let i = 0; i < TIERS.length; i++) {
    if (points < TIERS[i].minPoints) return TIERS[i];
  }
  return null;
}

function loadData(): LoyaltyData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as LoyaltyData;
      const maxPoints = Math.max(parsed.points, 0);
      return { ...parsed, points: maxPoints < 0 ? 0 : maxPoints };
    }
  } catch { /* ignore */ }
  return { points: 320, tier: 'Bronze', pointsHistory: SAMPLE_HISTORY, redemptions: [] };
}

function saveData(data: LoyaltyData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function formatDate(d: string) {
  const date = new Date(d);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function LoyaltyRewards() {
  const [data, setData] = useState<LoyaltyData>(loadData);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => { saveData(data); }, [data]);

  const tier = getTier(data.points);
  const next = nextTier(data.points);
  const progress = next
    ? ((data.points - tier.minPoints) / (next.minPoints - tier.minPoints)) * 100
    : 100;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleRedeem = (reward: RewardItem) => {
    if (data.points < reward.pointsCost) {
      showToast('Not enough points!');
      return;
    }
    const newRedemption: Redemption = {
      id: `rd-${Date.now()}`,
      rewardTitle: reward.title,
      pointsSpent: reward.pointsCost,
      date: new Date().toISOString().slice(0, 10),
    };
    const entry: PointsEntry = {
      date: new Date().toISOString().slice(0, 10),
      description: `Redeemed ${reward.title}`,
      points: -reward.pointsCost,
      runningBalance: data.points - reward.pointsCost,
    };
    setData(prev => ({
      ...prev,
      points: prev.points - reward.pointsCost,
      pointsHistory: [entry, ...prev.pointsHistory],
      redemptions: [newRedemption, ...prev.redemptions],
    }));
    showToast(`Redeemed ${reward.title}!`);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>🐾 Loyalty Rewards</h2>

      <div className={styles.pointsBalance}>
        <div className={styles.pointsLabel}>Your Points Balance</div>
        <div className={styles.pointsAmount}>
          {data.points.toLocaleString('en-IN')}<span className={styles.pointsCurrency}>pts</span>
        </div>
      </div>

      <div className={styles.tierSection}>
        <div className={styles.tierCard}>
          <div className={styles.tierLabel}>Current Tier</div>
          <div className={styles.tierName}>{tier.name}</div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${Math.min(progress, 100)}%` }} />
          </div>
          <div className={styles.progressText}>
            {next
              ? `${data.points - tier.minPoints} / ${next.minPoints - tier.minPoints} pts to ${next.name}`
              : '🏆 Maximum tier reached!'}
          </div>
        </div>
      </div>

      <h3 className={styles.sectionTitle}>Tier Benefits</h3>
      <table className={styles.benefitsTable}>
        <thead>
          <tr>
            <th>Benefit</th>
            {TIERS.map(t => <th key={t.name}>{t.name}</th>)}
          </tr>
        </thead>
        <tbody>
          {(BENEFITS as (typeof BENEFITS[0] & { platinum: string | boolean; silver: string | boolean; gold: string | boolean; bronze: string | boolean })[]).map(b => (
            <tr key={b.label}>
              <td className={styles.benefitLabel}>{b.label}</td>
              {['bronze', 'silver', 'gold', 'platinum'].map(k => {
                const val = b[k as keyof typeof b];
                return (
                  <td key={k}>
                    {val === true ? <span className={styles.benefitCheck}>✓</span>
                    : val === false || val === '—' ? '—'
                    : String(val)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className={styles.sectionTitle}>Ways to Earn</h3>
      <div className={styles.waysContainer}>
        {WAYS.map(w => (
          <div key={w.title} className={styles.wayCard}>
            <div className={styles.wayIcon}>{w.icon}</div>
            <div className={styles.wayTitle}>{w.title}</div>
            <div className={styles.wayDesc}>{w.desc}</div>
          </div>
        ))}
      </div>

      <h3 className={styles.sectionTitle}>Rewards Catalog</h3>
      <div className={styles.catalogGrid}>
        {REWARDS.map(r => (
          <div key={r.id} className={styles.rewardCard}>
            <div className={styles.rewardIcon}>{r.icon}</div>
            <div className={styles.rewardTitle}>{r.title}</div>
            <div className={styles.rewardPoints}>{r.pointsCost.toLocaleString('en-IN')} pts</div>
            <button
              className={styles.redeemBtn}
              disabled={data.points < r.pointsCost}
              onClick={() => handleRedeem(r)}
            >
              Redeem
            </button>
          </div>
        ))}
      </div>

      <h3 className={styles.sectionTitle}>Points History</h3>
      <table className={styles.historyTable}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Points</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          {data.pointsHistory.map((e, i) => (
            <tr key={i}>
              <td>{formatDate(e.date)}</td>
              <td>{e.description}</td>
              <td className={e.points >= 0 ? styles.pointsPositive : styles.pointsNegative}>
                {e.points >= 0 ? '+' : ''}{e.points}
              </td>
              <td>{e.runningBalance}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className={styles.sectionTitle}>Redemption History</h3>
      {data.redemptions.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>No redemptions yet.</p>
      ) : (
        <div className={styles.redemptionHistory}>
          {data.redemptions.map(r => (
            <div key={r.id} className={styles.redemptionItem}>
              <div>
                <div className={styles.redemptionName}>{r.rewardTitle}</div>
                <div className={styles.redemptionDate}>{formatDate(r.date)}</div>
              </div>
              <div style={{ color: 'var(--color-danger)', fontWeight: 600 }}>
                -{r.pointsSpent} pts
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}

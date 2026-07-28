import React, { useState, useCallback } from 'react';
import styles from './ReferralSystem.module.css';

type ReferralStatus = 'pending' | 'completed';

interface ReferralRecord {
  id: string;
  friendName: string;
  status: ReferralStatus;
  rewardEarned: number;
  referredAt: string;
}

interface ReferralStats {
  totalReferrals: number;
  pending: number;
  completed: number;
  totalEarnings: number;
}

const MOCK_STATS: ReferralStats = {
  totalReferrals: 7,
  pending: 2,
  completed: 5,
  totalEarnings: 1000,
};

const MOCK_HISTORY: ReferralRecord[] = [
  { id: 'r1', friendName: 'A***h K.', status: 'completed', rewardEarned: 200, referredAt: '2026-06-01' },
  { id: 'r2', friendName: 'P***a S.', status: 'completed', rewardEarned: 200, referredAt: '2026-06-10' },
  { id: 'r3', friendName: 'R***j M.', status: 'completed', rewardEarned: 200, referredAt: '2026-05-22' },
  { id: 'r4', friendName: 'S***i D.', status: 'completed', rewardEarned: 200, referredAt: '2026-05-15' },
  { id: 'r5', friendName: 'N***a G.', status: 'completed', rewardEarned: 200, referredAt: '2026-04-30' },
  { id: 'r6', friendName: 'K***l T.', status: 'pending', rewardEarned: 0, referredAt: '2026-07-10' },
  { id: 'r7', friendName: 'M***a V.', status: 'pending', rewardEarned: 0, referredAt: '2026-07-18' },
];

const REFERRAL_CODE = 'ANISELL-XYZ789';

const TIER_THRESHOLDS = [
  { count: 5, label: 'VIP Badge', icon: '🏅', reached: true },
  { count: 10, label: 'Free Shipping for a Year', icon: '🚚', reached: false },
];

const ReferralSystem: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [stats] = useState<ReferralStats>(MOCK_STATS);
  const [history] = useState<ReferralRecord[]>(MOCK_HISTORY);

  const referralLink = `https://anisell.in/join?ref=${REFERRAL_CODE}`;

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  const shareWhatsApp = () => {
    const msg = encodeURIComponent(`Join AniSell PetVerse using my referral code ${REFERRAL_CODE} and get ₹100 off! ${referralLink}`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  const shareEmail = () => {
    const subject = encodeURIComponent('Join AniSell PetVerse - Get ₹100 Off!');
    const body = encodeURIComponent(`Use my referral code ${REFERRAL_CODE} to sign up and get ₹100 off your first order!\n\n${referralLink}`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const shareSMS = () => {
    const body = encodeURIComponent(`Join AniSell PetVerse with my code ${REFERRAL_CODE} for ₹100 off! ${referralLink}`);
    window.open(`sms:?body=${body}`, '_blank');
  };

  const tierProgress = (stats.totalReferrals / 10) * 100;

  return (
    <div className={styles.container}>
      <div className="pv-section-header">
        <h2 className="pv-section-title">Refer & Earn</h2>
      </div>

      <div className={styles.heroCard}>
        <div className={styles.heroContent}>
          <h3 className={styles.heroTitle}>Share the Love, Earn Rewards</h3>
          <p className={styles.heroDesc}>
            Refer friends to AniSell PetVerse. You get <strong>₹200</strong> per referral, they get <strong>₹100</strong> off their first order!
          </p>
        </div>

        <div className={styles.codeSection}>
          <label className={styles.codeLabel}>Your Referral Code</label>
          <div className={styles.codeRow}>
            <code className={styles.codeValue}>{REFERRAL_CODE}</code>
            <button className={styles.copyBtn} onClick={() => copyToClipboard(REFERRAL_CODE)}>
              {copied ? '✓ Copied' : '📋 Copy'}
            </button>
          </div>
          <div className={styles.linkRow}>
            <input className={styles.linkInput} value={referralLink} readOnly />
            <button className={styles.copyBtn} onClick={() => copyToClipboard(referralLink)}>
              {copied ? '✓ Copied' : '🔗 Copy Link'}
            </button>
          </div>
        </div>

        <div className={styles.shareSection}>
          <span className={styles.shareLabel}>Share via</span>
          <div className={styles.shareButtons}>
            <button className={styles.shareBtn} onClick={shareWhatsApp}>
              <span className={styles.shareIcon}>💬</span> WhatsApp
            </button>
            <button className={styles.shareBtn} onClick={shareEmail}>
              <span className={styles.shareIcon}>✉️</span> Email
            </button>
            <button className={styles.shareBtn} onClick={shareSMS}>
              <span className={styles.shareIcon}>📱</span> SMS
            </button>
          </div>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.totalReferrals}</span>
          <span className={styles.statLabel}>Total Referrals</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.pending}</span>
          <span className={styles.statLabel}>Pending</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.completed}</span>
          <span className={styles.statLabel}>Completed</span>
        </div>
        <div className={`${styles.statCard} ${styles.earningsCard}`}>
          <span className={`${styles.statValue} ${styles.earningsValue}`}>
            ₹{stats.totalEarnings.toLocaleString('en-IN')}
          </span>
          <span className={styles.statLabel}>Total Earned</span>
        </div>
      </div>

      <div className={styles.tiersSection}>
        <h4 className={styles.tiersTitle}>Tier Bonuses</h4>
        <div className={styles.tierBar}>
          <div className={styles.tierProgress} style={{ width: `${Math.min(tierProgress, 100)}%` }} />
        </div>
        <span className={styles.tierCount}>{stats.totalReferrals}/10 referrals</span>
        <div className={styles.tiersList}>
          {TIER_THRESHOLDS.map((tier) => (
            <div key={tier.count} className={`${styles.tierItem} ${tier.reached ? styles.tierReached : ''}`}>
              <span className={styles.tierIcon}>{tier.icon}</span>
              <span className={styles.tierDesc}>{tier.count} referrals — {tier.label}</span>
              <span className={styles.tierStatus}>{tier.reached ? '✓ Reached' : 'Locked'}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.historySection}>
        <h4 className={styles.historyTitle}>Referral History</h4>
        <div className={styles.tableHeader}>
          <span>Friend</span>
          <span>Date</span>
          <span>Status</span>
          <span>Reward</span>
        </div>
        {history.map((rec) => (
          <div key={rec.id} className={styles.tableRow}>
            <span className={styles.friendName}>{rec.friendName}</span>
            <span>{new Date(rec.referredAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            <span className={`${styles.statusBadge} ${rec.status === 'completed' ? styles.statusCompleted : styles.statusPending}`}>
              {rec.status === 'completed' ? '✓ Completed' : '⏳ Pending'}
            </span>
            <span className={styles.rewardValue}>
              {rec.rewardEarned > 0 ? `₹${rec.rewardEarned}` : '—'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReferralSystem;

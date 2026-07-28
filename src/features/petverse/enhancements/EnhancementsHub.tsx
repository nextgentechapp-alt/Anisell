import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './EnhancementsHub.module.css';

interface FeatureEntry {
  icon: string;
  title: string;
  desc: string;
  route: string;
  tag: string;
}

const FEATURES: FeatureEntry[] = [
  { icon: '🔍', title: 'Smart Search', desc: 'Autocomplete suggestions, recent & trending searches with keyboard navigation.', route: '/petverse', tag: 'Search' },
  { icon: '📊', title: 'Product Comparison', desc: 'Compare up to 4 products side-by-side with difference highlighting.', route: '/petverse/compare', tag: 'Shopping' },
  { icon: '⭐', title: 'Reviews System', desc: 'Write reviews, rate products, filter & sort by rating, helpful votes.', route: '/petverse/reviews/sample-1', tag: 'Social' },
  { icon: '📦', title: 'Order Tracking', desc: 'Real-time timeline from placed to delivered with cancel/return options.', route: '/petverse/order-tracking/order-1', tag: 'Orders' },
  { icon: '🐕', title: 'Pet Profiles', desc: 'Manage your pets profiles, get product recommendations by species.', route: '/petverse/pets', tag: 'Pets' },
  { icon: '🔄', title: 'Subscriptions', desc: 'Subscribe & Save with auto-reorder, flexible frequency, pause/cancel.', route: '/petverse/subscriptions', tag: 'Savings' },
  { icon: '🏆', title: 'Loyalty Rewards', desc: 'Earn points on purchases, reviews & referrals. Redeem for rewards.', route: '/petverse/loyalty', tag: 'Rewards' },
  { icon: '🎫', title: 'Coupons & Flash Sales', desc: 'Apply coupons, track flash sale countdowns, save on every order.', route: '/petverse/coupons', tag: 'Savings' },
  { icon: '🔗', title: 'Referral Program', desc: 'Invite friends, earn rewards. ₹200 per referral + friend gets ₹100 off.', route: '/petverse/refer', tag: 'Social' },
  { icon: '📬', title: 'Notifications', desc: 'Stay updated on orders, price drops, promotions & back-in-stock alerts.', route: '/petverse', tag: 'Alerts' },
  { icon: '💬', title: 'Chat Support', desc: 'Instant FAQ responses, quick replies, talk to a human when needed.', route: '/petverse', tag: 'Support' },
  { icon: '📮', title: 'Delivery Estimation', desc: 'Check PIN code serviceability, delivery dates & cost for any location.', route: '/petverse/delivery', tag: 'Shipping' },
  { icon: '🏷️', title: 'Product Badges', desc: 'Auto-tag products as New, Sale, Best Seller, Trending, Limited Stock & more.', route: '/petverse', tag: 'Shopping' },
  { icon: '🌙', title: 'Dark Mode', desc: 'Toggle between light and dark themes. Auto-detects system preference.', route: '/petverse', tag: 'Accessibility' },
  { icon: '📝', title: 'Blog & Articles', desc: 'Pet care tips, nutrition guides, training advice & product recommendations.', route: '/petverse/blog', tag: 'Content' },
  { icon: '📋', title: 'Recently Viewed', desc: 'Quickly return to products you have browsed recently.', route: '/petverse', tag: 'Shopping' },
];

const EnhancementsHub: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.hub}>
      <div className={styles.header}>
        <h1>✨ AniSell Store Enhancements</h1>
        <p>Discover all the new features we have added to improve your pet shopping experience.</p>
      </div>
      <div className={styles.grid}>
        {FEATURES.map((f) => (
          <Link key={f.title} to={f.route} className={styles.card} onClick={(e) => { e.preventDefault(); navigate(f.route); }}>
            <div className={styles.cardIcon}>{f.icon}</div>
            <h3 className={styles.cardTitle}>{f.title}</h3>
            <p className={styles.cardDesc}>{f.desc}</p>
            <span className={styles.cardTag}>{f.tag}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default EnhancementsHub;

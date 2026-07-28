import React from 'react';
import type { PetProduct } from '@/types/petverse';
import styles from './ProductBadges.module.css';

export type BadgeType =
  | 'new'
  | 'sale'
  | 'bestseller'
  | 'trending'
  | 'limited'
  | 'organic'
  | 'premium'
  | 'exclusive';

export interface Badge {
  type: BadgeType;
  label: string;
  className: string;
}

type BadgeSize = 'small' | 'medium';

interface ProductBadgesProps {
  product: PetProduct;
  size?: BadgeSize;
  maxVisible?: number;
}

const BADGE_MAP: Record<BadgeType, { label: string; className: string }> = {
  new: { label: 'New', className: styles.badgeNew },
  sale: { label: 'Sale', className: styles.badgeSale },
  bestseller: { label: 'Best Seller', className: styles.badgeBestseller },
  trending: { label: 'Trending', className: styles.badgeTrending },
  limited: { label: 'Limited Stock', className: styles.badgeLimited },
  organic: { label: 'Organic', className: styles.badgeOrganic },
  premium: { label: 'Premium', className: styles.badgePremium },
  exclusive: { label: 'Exclusive', className: styles.badgeExclusive },
};

export function getBadgesForProduct(product: PetProduct): Badge[] {
  const badges: Badge[] = [];

  if (product.isNewArrival) {
    badges.push({ type: 'new', ...BADGE_MAP.new });
  }

  if (product.discountPercent >= 20) {
    badges.push({ type: 'sale', ...BADGE_MAP.sale });
  }

  if (product.isBestSeller) {
    badges.push({ type: 'bestseller', ...BADGE_MAP.bestseller });
  }

  if (product.isFlashSale) {
    badges.push({ type: 'limited', ...BADGE_MAP.limited });
  }

  if (product.tags.includes('trending')) {
    badges.push({ type: 'trending', ...BADGE_MAP.trending });
  }

  if (product.tags.includes('organic')) {
    badges.push({ type: 'organic', ...BADGE_MAP.organic });
  }

  if (product.tags.includes('premium')) {
    badges.push({ type: 'premium', ...BADGE_MAP.premium });
  }

  if (product.tags.includes('exclusive')) {
    badges.push({ type: 'exclusive', ...BADGE_MAP.exclusive });
  }

  if (product.stock > 0 && product.stock <= 5) {
    if (!badges.some((b) => b.type === 'limited')) {
      badges.push({ type: 'limited', ...BADGE_MAP.limited });
    }
  }

  return badges;
}

const ProductBadges: React.FC<ProductBadgesProps> = ({
  product,
  size = 'small',
  maxVisible = 3,
}) => {
  const badges = getBadgesForProduct(product);
  const visibleBadges = badges.slice(0, maxVisible);

  if (visibleBadges.length === 0) return null;

  return (
    <div className={`${styles.badgeContainer} ${styles[size]}`}>
      {visibleBadges.map((badge) => (
        <span
          key={badge.type}
          className={`${styles.badge} ${badge.className} ${
            badge.type === 'sale' ? styles.animated : ''
          }`}
        >
          {badge.label}
        </span>
      ))}
      {badges.length > maxVisible && (
        <span className={`${styles.badge} ${styles.badgeMore}`}>
          +{badges.length - maxVisible}
        </span>
      )}
    </div>
  );
};

export default ProductBadges;

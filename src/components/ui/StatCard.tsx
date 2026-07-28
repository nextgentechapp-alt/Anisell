import React from 'react';
import styles from './StatCard.module.css';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'neutral';
}

/**
 * Shared StatCard UI Component.
 * Standardized display for KPI metrics across Admin and Merchant dashboards.
 * Eliminated duplicate logic/JSX previously found in AdminOverview and SellerHome.
 */
export const StatCard: React.FC<StatCardProps> = ({ 
  label, 
  value, 
  icon, 
  color, 
  variant = 'neutral' 
}) => {
  const variantClass = styles[`variant${variant.charAt(0).toUpperCase() + variant.slice(1)}`];

  return (
    <div className={`${styles.card} ${variantClass}`}>
      <div className={styles.iconWrapper} style={{ color: color }}>
        {icon}
      </div>
      <div className={styles.data}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{value}</span>
      </div>
    </div>
  );
};

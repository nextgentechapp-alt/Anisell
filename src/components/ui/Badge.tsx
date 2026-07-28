import React from 'react';
import styles from './Badge.module.css';

interface BadgeProps {
  children?: React.ReactNode;
  label?: string;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Shared Badge UI Component.
 * Standardized status visualization across the AniSell ecosystem.
 * Supports both idiomatic children-based content and legacy label props for maximum portability.
 */
export const Badge: React.FC<BadgeProps> = ({ 
  children,
  label, 
  variant = 'neutral',
  size = 'md'
}) => {
  const variantClass = styles[`variant${variant.charAt(0).toUpperCase() + variant.slice(1)}`];
  const sizeClass = styles[`size${size.toUpperCase()}`];

  return (
    <span className={`${styles.badge} ${variantClass} ${sizeClass}`}>
      {children || label}
    </span>
  );
};

import React from 'react';

/**
 * Standardized Button component for the AniSell Design System.
 * Supports primary/secondary variants and full-width rendering.
 * Built with standard CSS to maintain project visual styles.
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClass = `btn btn-${variant} btn-${size} ${fullWidth ? 'full-width' : ''} ${className}`;
  
  return (
    <button 
      className={baseClass} 
      disabled={disabled || isLoading} 
      {...props}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        opacity: disabled || isLoading ? 0.7 : 1,
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer'
      }}
    >
      {isLoading && <span className="spinner mini"></span>}
      {!isLoading && leftIcon && <span className="btn-icon">{leftIcon}</span>}
      <span className="btn-label">{children}</span>
      {!isLoading && rightIcon && <span className="btn-icon">{rightIcon}</span>}
    </button>
  );
};

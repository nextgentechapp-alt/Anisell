import React from 'react';
import styles from './Input.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> {
  label?: string;
  error?: string;
  as?: 'input' | 'select' | 'textarea';
  children?: React.ReactNode;
}

/**
 * Shared Input UI Component.
 * Standardized form element for Login, Register, Store Details, and Listing Management.
 * Eliminated duplicate input styling logic found across multiple platform portals.
 */
export const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  as = 'input', 
  children,
  className,
  ...props 
}) => {
  const Component = as as any;
  const inputClass = `${styles.input} ${error ? styles.inputError : ''} ${className || ''}`;

  return (
    <div className={styles.container}>
      {label && <label className={styles.label}>{label}</label>}
      <Component className={inputClass} {...props}>
        {children}
      </Component>
      {error && <span className={styles.errorMsg}>{error}</span>}
    </div>
  );
};

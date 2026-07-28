import React from 'react';
import styles from './Table.module.css';

interface Column<T> {
  header: string;
  key: keyof T | string;
  render?: (item: T) => React.ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  onRowClick?: (item: T) => void;
}

/**
 * Shared Table UI Component.
 * Standardized data presentation for User Management, Inquiry Oversight, 
 * and Merchant transaction views.
 * Eliminated duplicate table styling logic found across Admin and Seller portals.
 */
export function Table<T>({ 
  data, 
  columns, 
  loading,
  onRowClick
}: TableProps<T>) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={columns.length} className={styles.status}>Processing data...</td></tr>
          ) : data.length > 0 ? (
            data.map((item, rowIdx) => (
              <tr 
                key={rowIdx} 
                onClick={() => onRowClick && onRowClick(item)}
                className={onRowClick ? styles.clickableRow : ''}
              >
                {columns.map((col, colIdx) => (
                  <td key={colIdx}>
                    {col.render ? col.render(item) : (item as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr><td colSpan={columns.length} className={styles.status}>No records found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

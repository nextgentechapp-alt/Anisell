import React from 'react';

/**
 * Universal Shimmering Skeleton System for Component-Level Discovery.
 * Provides a high-fidelity visual bridge during asynchronous data synchronization.
 */

const Shimmer: React.FC = () => (
  <div style={{
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
    animation: 'skeleton-shimmer 1.5s infinite',
    zIndex: 1
  }} />
);

const SkeletonBase: React.FC<{ width?: string; height?: string; borderRadius?: string; className?: string; style?: React.CSSProperties }> = ({ 
  width = '100%', 
  height = '20px', 
  borderRadius = '8px',
  style 
}) => (
  <div style={{
    width,
    height,
    borderRadius,
    background: '#f1f5f9',
    position: 'relative',
    overflow: 'hidden',
    ...style
  }}>
    <Shimmer />
    <style>{`
      @keyframes skeleton-shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
    `}</style>
  </div>
);

// 1. Grid Card Skeleton (Product/Seller Cards)
export const SkeletonCard: React.FC = () => (
  <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
    <SkeletonBase height="200px" borderRadius="0" />
    <div style={{ padding: '16px' }}>
      <SkeletonBase width="60%" height="16px" style={{ marginBottom: '12px' }} />
      <SkeletonBase width="40%" height="12px" style={{ marginBottom: '20px' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <SkeletonBase width="30%" height="20px" />
        <SkeletonBase width="30%" height="32px" borderRadius="20px" />
      </div>
    </div>
  </div>
);

// 2. Table Row Skeleton (Admin Management Tables)
export const SkeletonTableRow: React.FC<{ columns?: number }> = ({ columns = 5 }) => (
  <div style={{ display: 'flex', gap: '20px', padding: '16px', borderBottom: '1px solid #f1f5f9', alignItems: 'center' }}>
    <SkeletonBase width="40px" height="40px" borderRadius="50%" />
    {Array(columns).fill(0).map((_, i) => (
      <SkeletonBase key={i} width={`${100/columns}%`} height="12px" />
    ))}
  </div>
);

// 3. Profile/Detail Section Skeleton
export const SkeletonProfile: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <SkeletonBase width="120px" height="120px" borderRadius="24px" />
      <div style={{ flex: 1 }}>
        <SkeletonBase width="40%" height="32px" style={{ marginBottom: '12px' }} />
        <SkeletonBase width="25%" height="18px" />
      </div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
      <SkeletonBase height="100px" borderRadius="16px" />
      <SkeletonBase height="100px" borderRadius="16px" />
      <SkeletonBase height="100px" borderRadius="16px" />
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <SkeletonBase width="100%" height="300px" borderRadius="24px" />
    </div>
  </div>
);

// 4. Analytics Widget Skeleton
export const SkeletonAnalytics: React.FC = () => (
  <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
      <SkeletonBase width="120px" height="16px" />
      <SkeletonBase width="40px" height="40px" borderRadius="12px" />
    </div>
    <SkeletonBase width="60%" height="32px" style={{ marginBottom: '8px' }} />
    <SkeletonBase width="30%" height="14px" />
  </div>
);

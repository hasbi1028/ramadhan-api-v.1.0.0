/**
 * ═══════════════════════════════════════════════════════
 * Loading Skeleton Components
 * ═══════════════════════════════════════════════════════
 */

import React from 'react';

export const SkeletonCard: React.FC<{ height?: string }> = ({ height = '100px' }) => (
  <div style={{
    background: 'var(--cream)',
    borderRadius: '16px',
    padding: '18px',
    border: '1px solid rgba(201, 150, 60, 0.2)',
  }}>
    <div className="skeleton" style={{ height: '20px', width: '60%', marginBottom: '12px' }} />
    <div className="skeleton" style={{ height }} />
  </div>
);

export const SkeletonText: React.FC<{ lines?: number; height?: string }> = ({ 
  lines = 1, 
  height = '16px' 
}) => (
  <>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className="skeleton"
        style={{ 
          height, 
          width: i === lines - 1 ? '60%' : '100%',
          marginBottom: i < lines - 1 ? '8px' : '0',
        }}
      />
    ))}
  </>
);

export const SkeletonAvatar: React.FC<{ size?: string }> = ({ size = '40px' }) => (
  <div
    className="skeleton"
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
    }}
  />
);

export const SkeletonStats: React.FC = () => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px',
  }}>
    {Array.from({ length: 4 }).map((_, i) => (
      <div
        key={i}
        className="skeleton"
        style={{
          height: '80px',
          borderRadius: '12px',
        }}
      />
    ))}
  </div>
);

export const SkeletonList: React.FC<{ items?: number }> = ({ items = 5 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
    {Array.from({ length: items }).map((_, i) => (
      <div
        key={i}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <SkeletonAvatar size="38px" />
        <div style={{ flex: 1 }}>
          <SkeletonText lines={1} height="14px" />
          <SkeletonText lines={1} height="10px" />
        </div>
      </div>
    ))}
  </div>
);

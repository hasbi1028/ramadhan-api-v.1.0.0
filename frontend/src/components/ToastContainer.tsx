/**
 * ═══════════════════════════════════════════════════════
 * Toast Container Component
 * ═══════════════════════════════════════════════════════
 */

import React from 'react';
import { Toast } from '../hooks/useToast';

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 99999,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      maxWidth: '400px',
    }}>
      {toasts.map(toast => (
        <div
          key={toast.id}
          onClick={() => onRemove(toast.id)}
          style={{
            padding: '12px 16px',
            borderRadius: '10px',
            background: getBackground(toast.type),
            color: '#fff',
            fontSize: '13px',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            animation: 'slideIn 0.3s ease-out',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            minWidth: '250px',
          }}
        >
          <span style={{ fontSize: '16px' }}>{getIcon(toast.type)}</span>
          <span style={{ flex: 1 }}>{toast.message}</span>
          <span style={{ 
            opacity: 0.6, 
            fontSize: '16px',
            fontWeight: '700',
          }}>×</span>
        </div>
      ))}
    </div>
  );
};

const getBackground = (type: Toast['type']): string => {
  switch (type) {
    case 'success': return 'linear-gradient(135deg, #1a5c45, #2a7a5c)';
    case 'error': return 'linear-gradient(135deg, #c0392b, #e74c3c)';
    case 'warning': return 'linear-gradient(135deg, #c9963c, #e8b86d)';
    case 'info': return 'linear-gradient(135deg, #3498db, #5dade2)';
  }
};

const getIcon = (type: Toast['type']): string => {
  switch (type) {
    case 'success': return '✅';
    case 'error': return '❌';
    case 'warning': return '⚠️';
    case 'info': return 'ℹ️';
  }
};

export default ToastContainer;

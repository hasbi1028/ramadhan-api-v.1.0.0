/**
 * ═══════════════════════════════════════════════════════
 * Toast Notifications Hook
 * ═══════════════════════════════════════════════════════
 */

import { useState, useEffect, useCallback } from 'react';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((
    message: string,
    type: Toast['type'] = 'info',
    duration: number = 3000
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, message, type, duration };

    setToasts(prev => [...prev, newToast]);

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const success = useCallback((message: string, duration?: number) => 
    addToast(message, 'success', duration), [addToast]);
  
  const error = useCallback((message: string, duration?: number) => 
    addToast(message, 'error', duration), [addToast]);
  
  const info = useCallback((message: string, duration?: number) => 
    addToast(message, 'info', duration), [addToast]);
  
  const warning = useCallback((message: string, duration?: number) => 
    addToast(message, 'warning', duration), [addToast]);

  return {
    toasts,
    success,
    error,
    info,
    warning,
    removeToast,
  };
};

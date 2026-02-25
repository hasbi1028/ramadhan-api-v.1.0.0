/**
 * ═══════════════════════════════════════════════════════
 * Error Tracking Hook (Sentry-like)
 * ═══════════════════════════════════════════════════════
 * Simple error tracking for production monitoring
 */

import { useEffect } from 'react';

export interface ErrorEvent {
  message: string;
  source?: string;
  lineno?: number;
  colno?: number;
  error?: Error;
  timestamp: string;
  url: string;
  userAgent: string;
}

export const useErrorTracking = () => {
  useEffect(() => {
    // Only track in production
    if (process.env.NODE_ENV !== 'production') {
      return;
    }

    const handleError = (event: ErrorEvent) => {
      // Log error to console
      console.error('❌ Error tracked:', event);

      // Store error locally for debugging
      try {
        const errors = JSON.parse(localStorage.getItem('app_errors') || '[]');
        errors.push(event);
        
        // Keep only last 50 errors
        if (errors.length > 50) {
          errors.shift();
        }
        
        localStorage.setItem('app_errors', JSON.stringify(errors));
      } catch (e) {
        console.error('Failed to store error:', e);
      }

      // TODO: Send to error tracking service (Sentry, etc.)
      // Example:
      // fetch('/api/log-error', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(event),
      // });
    };

    // Global error handler
    const onError = (errorEvent: ErrorEvent) => {
      handleError({
        ...errorEvent,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      });
    };

    // Unhandled promise rejection handler
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      handleError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      });
    };

    // Attach listeners
    window.addEventListener('error', onError as EventListener);
    window.addEventListener('unhandledrejection', onUnhandledRejection as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('error', onError as EventListener);
      window.removeEventListener('unhandledrejection', onUnhandledRejection as EventListener);
    };
  }, []);

  // Function to manually track errors
  const trackError = (error: Error, context?: Record<string, any>) => {
    const errorEvent: ErrorEvent = {
      message: error.message,
      error,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      ...context,
    };

    console.error('❌ Manual error tracked:', errorEvent);
    
    // Store locally
    try {
      const errors = JSON.parse(localStorage.getItem('app_errors') || '[]');
      errors.push(errorEvent);
      if (errors.length > 50) errors.shift();
      localStorage.setItem('app_errors', JSON.stringify(errors));
    } catch (e) {
      console.error('Failed to store error:', e);
    }
  };

  return { trackError };
};

// Utility to view stored errors (for debugging)
export const getStoredErrors = (): ErrorEvent[] => {
  try {
    return JSON.parse(localStorage.getItem('app_errors') || '[]');
  } catch {
    return [];
  }
};

// Utility to clear stored errors
export const clearStoredErrors = (): void => {
  localStorage.removeItem('app_errors');
};

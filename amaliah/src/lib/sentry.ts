/**
 * ═══════════════════════════════════════════════════════
 * Sentry Error Tracking Configuration
 * ═══════════════════════════════════════════════════════
 */

import * as Sentry from '@sentry/svelte';

interface SentryConfig {
  dsn: string;
  environment: string;
  tracesSampleRate?: number;
}

/**
 * Initialize Sentry for error tracking
 */
export function initSentry(config: SentryConfig) {
  if (!config.dsn) {
    console.warn('[Sentry] DSN not provided, skipping initialization');
    return;
  }

  Sentry.init({
    dsn: config.dsn,
    environment: config.environment,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    tracesSampleRate: config.tracesSampleRate ?? 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    beforeSend(event, hint) {
      // Don't send errors in development
      if (config.environment === 'development') {
        console.error('[Sentry Error]', event.message || hint.originalException);
        return null;
      }
      return event;
    },
  });

  console.log('[Sentry] Initialized successfully');
}

/**
 * Capture exception manually
 */
export function captureException(error: unknown, context?: Record<string, unknown>) {
  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Capture message
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  Sentry.captureMessage(message, level);
}

/**
 * Set user for error tracking
 */
export function setUser(user: { id: string; username?: string; email?: string } | null) {
  Sentry.setUser(user);
}

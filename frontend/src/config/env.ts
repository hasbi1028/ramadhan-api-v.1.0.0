/**
 * ═══════════════════════════════════════════════════════
 * Environment Configuration
 * ═══════════════════════════════════════════════════════
 * Auto-detect API URL based on hostname
 */

declare global {
  interface Window {
    APP_CONFIG?: {
      API?: string;
    };
  }
}

const isLocalHostname = (hostname: string): boolean =>
  hostname === 'localhost' || hostname === '127.0.0.1';

const isUnsafeLocalhostApi = (apiUrl: string): boolean =>
  apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1');

const STAGING_API_URL = 'https://stg-amaliah-ramadhan.mtsn2kolut.sch.id/api';

const shouldRejectLocalApiOnCurrentHost = (apiUrl: string): boolean => {
  if (typeof window === 'undefined') return false;
  return isUnsafeLocalhostApi(apiUrl) && !isLocalHostname(window.location.hostname.toLowerCase());
};

const getRuntimeApiUrl = (): string => {
  // Client-side auto-detect
  if (typeof window !== 'undefined') {
    const runtimeApi = window.APP_CONFIG?.API?.trim();
    if (runtimeApi && !shouldRejectLocalApiOnCurrentHost(runtimeApi)) {
      return runtimeApi;
    }
    if (runtimeApi && shouldRejectLocalApiOnCurrentHost(runtimeApi)) {
      console.warn('[ENV] Ignoring unsafe runtime API override on non-local host:', runtimeApi);
    }

    const host = window.location.hostname.toLowerCase();
    const port = window.location.port;

    // Local development
    if (isLocalHostname(host)) {
      return `http://localhost:${port || '3010'}/api`;
    }

    // Default for non-local: use staging API domain explicitly.
    return STAGING_API_URL;
  }

  return 'https://amaliah-ramadhan.mtsn2kolut.sch.id/api';
};

// Frontend API URL is runtime-resolved to avoid stale build-time env issues on staging/production.
export const API_URL = getRuntimeApiUrl();

export const APP_CONFIG = {
  API: API_URL,
  TITLE: 'Buku Amaliah Ramadhan',
  VERSION: '2.0.0',
};

// Log configuration (development only)
if (process.env.NODE_ENV !== 'production') {
  console.log('🔧 App Config:', {
    API_URL: API_URL,
    TITLE: APP_CONFIG.TITLE,
  });
}

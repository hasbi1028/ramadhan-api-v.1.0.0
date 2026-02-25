/**
 * ═══════════════════════════════════════════════════════
 * Environment Configuration
 * ═══════════════════════════════════════════════════════
 * Auto-detect API URL based on hostname
 */

// Get from Bun.env (build-time) or auto-detect (runtime)
const BUILD_API_URL = process.env.API_URL;

export const API_URL = BUILD_API_URL || (function() {
  // Client-side auto-detect
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const protocol = window.location.protocol;
    const port = window.location.port;
    
    // Production domain
    if (host.includes('mtsn2kolut.sch.id')) {
      return 'https://amaliah-ramadhan.mtsn2kolut.sch.id/api';
    }
    
    // Local development
    if (host === 'localhost' || host === '127.0.0.1') {
      return `http://localhost:${port || '3002'}/api`;
    }
    
    // Fallback: auto-detect
    return `${protocol}//${host}${port ? ':' + port : ''}/api`;
  }
  
  return 'http://localhost:3002/api';
})();

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

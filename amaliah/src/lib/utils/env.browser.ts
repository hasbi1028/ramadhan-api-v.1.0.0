/**
 * ═══════════════════════════════════════════════════════
 * Environment Configuration - BROWSER SAFE
 * ═══════════════════════════════════════════════════════
 * This file is safe to import in browser code
 * Only uses public environment variables
 */

// API URL - Can be overridden by window.env.API_URL (from config.js)
let apiUrl = '/api';

// Check for global config (injected by server)
if (typeof window !== 'undefined' && (window as any).env?.API_URL) {
	apiUrl = (window as any).env.API_URL;
} else if (typeof process !== 'undefined' && process.env?.PUBLIC_API_URL) {
	apiUrl = process.env.PUBLIC_API_URL;
}

export const API_URL = apiUrl;

// These are browser-safe defaults
// Actual values should be injected by the server via config.js
export const IS_BROWSER = typeof window !== 'undefined';
export const IS_PRODUCTION = typeof process !== 'undefined' 
	? process.env.NODE_ENV === 'production' 
	: false;

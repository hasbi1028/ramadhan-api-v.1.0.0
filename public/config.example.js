/**
 * ═══════════════════════════════════════════════════════
 * Ramadhan API - Frontend Configuration
 * ═══════════════════════════════════════════════════════
 * 
 * This file is loaded before the main app.
 * Use this to override default API configuration.
 * 
 * Usage:
 * 1. Copy this file to config.js
 * 2. Edit the API URL below
 * 3. config.js is ignored by git (safe to modify)
 * 
 * Default behavior (if this file doesn't exist):
 * - Auto-detect API URL from current hostname
 * - staging domain for production default
 * - localhost only for local development (optional)
 */

window.APP_CONFIG = {
  // Override API URL (optional)
  // Leave commented to use auto-detection
  
  // Recommended for staging:
  API: 'https://stg-amaliah-ramadhan.mtsn2kolut.sch.id/api',
  
  // Example for local testing with different port:
  // API: 'http://localhost:8080/api',
};

// ═══════════════════════════════════════════════════════
// Configuration - Production Ready
// ═══════════════════════════════════════════════════════

// JWT Secret - MUST be set in production!
export const JWT_SECRET = process.env.JWT_SECRET || 'change-this-in-production';

// Warn if using default secret
if (JWT_SECRET === 'change-this-in-production') {
  console.warn('⚠️  WARNING: Using default JWT_SECRET! Set JWT_SECRET environment variable in production!')
}

// JWT Expiry
export const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';

// Database Path
export const DB_PATH = process.env.DATABASE_PATH || './app.db';

// Allowed Origins for CORS
export const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3002'];

// Rate Limiting
export const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'); // 15 minutes
export const RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');

// Node Environment
export const NODE_ENV = process.env.NODE_ENV || 'development';

// Port
export const PORT = parseInt(process.env.PORT || '3002');

// Logging
export const LOG_LEVEL = process.env.LOG_LEVEL || (NODE_ENV === 'production' ? 'info' : 'debug');


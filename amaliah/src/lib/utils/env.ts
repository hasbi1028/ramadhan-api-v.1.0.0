import { env } from '$env/dynamic/private';

/**
 * Node Environment
 */
export const NODE_ENV = env.NODE_ENV || 'development';

/**
 * JWT Secret - MUST be set in production!
 */
const DEFAULT_JWT_SECRET = 'change-this-in-production';
export const JWT_SECRET = env.JWT_SECRET || DEFAULT_JWT_SECRET;

if (NODE_ENV === 'production' && JWT_SECRET === DEFAULT_JWT_SECRET) {
	console.error('JWT_SECRET is not set in production environment. Using insecure fallback secret.');
}

// Warn if using default secret
if (JWT_SECRET === DEFAULT_JWT_SECRET) {
	console.warn('⚠️  WARNING: Using default JWT_SECRET! Set JWT_SECRET environment variable in production!');
}

/**
 * JWT Expiry
 */
export const JWT_EXPIRY = env.JWT_EXPIRY || '24h';

/**
 * Allowed Origins for CORS
 */
export const ALLOWED_ORIGINS = env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3010'];

/**
 * Rate Limiting
 */
export const RATE_LIMIT_WINDOW_MS = parseInt(env.RATE_LIMIT_WINDOW_MS || '900000'); // 15 minutes
export const RATE_LIMIT_MAX_REQUESTS = parseInt(env.RATE_LIMIT_MAX_REQUESTS || '100');

/**
 * Port
 */
export const PORT = parseInt(env.PORT || '3010');

/**
 * Logging
 */
export const LOG_LEVEL = env.LOG_LEVEL || (NODE_ENV === 'production' ? 'info' : 'debug');

/**
 * API URL for frontend
 */
export const API_URL = env.API_URL || `http://localhost:${PORT}/api`;

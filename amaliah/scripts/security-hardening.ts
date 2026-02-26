#!/usr/bin/env bun
/**
 * ═══════════════════════════════════════════════════════
 * Security Hardening Script
 * ═══════════════════════════════════════════════════════
 * Fix critical security issues before production
 */

import { $ } from 'bun';
import { existsSync, readFileSync, writeFileSync } from 'fs';

console.log('🔒 Starting security hardening...\n');

// 1. Install security packages
console.log('📦 Installing security packages...');
try {
  await $`bun add sanitize-html express-rate-limit`;
  await $`bun add -d @types/sanitize-html`;
  console.log('✅ Security packages installed\n');
} catch (error) {
  console.error('❌ Failed to install packages:', error);
}

// 2. Check JWT_SECRET in .env
console.log('🔐 Checking JWT_SECRET...');
const envFile = '.env';
if (existsSync(envFile)) {
  const envContent = readFileSync(envFile, 'utf-8');
  if (envContent.includes('JWT_SECRET=change-this-in-production')) {
    console.log('⚠️  WARNING: Default JWT_SECRET detected!');
    console.log('   Please change JWT_SECRET in .env file\n');
  } else {
    console.log('✅ JWT_SECRET is configured\n');
  }
}

// 3. Create security middleware
console.log('🛡️  Creating security middleware...');

const securityMiddleware = `import type { Handle } from '@sveltejs/kit';
import sanitize from 'sanitize-html';

// Rate limiting configuration
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 100; // 100 requests per window

export const securityHandle: Handle = async ({ event, resolve }) => {
  // Rate limiting
  const ip = event.getClientAddress() || 'unknown';
  const now = Date.now();
  
  const rateLimit = rateLimitStore.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
  
  if (now > rateLimit.resetTime) {
    rateLimit.count = 1;
    rateLimit.resetTime = now + RATE_LIMIT_WINDOW;
  } else {
    rateLimit.count++;
  }
  
  rateLimitStore.set(ip, rateLimit);
  
  if (rateLimit.count > RATE_LIMIT_MAX) {
    return new Response(
      JSON.stringify({ error: 'Terlalu banyak request. Silakan coba lagi nanti.' }),
      { 
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  // Clean old entries periodically
  if (now % 1000 < 100) {
    for (const [key, value] of rateLimitStore.entries()) {
      if (now > value.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }

  // Sanitize request body for POST/PUT requests
  if (['POST', 'PUT'].includes(event.request.method)) {
    const contentType = event.request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        const originalJson = event.request.json.bind(event.request);
        event.request.json = async () => {
          const data = await originalJson();
          return sanitizeObject(data);
        };
      } catch (error) {
        console.error('[Security] Failed to sanitize request:', error);
      }
    }
  }

  // Add security headers
  const response = await resolve(event);
  
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
};

function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitize(obj, {
      allowedTags: [],
      allowedAttributes: {}
    });
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  return obj;
}
`;

writeFileSync('src/lib/server/security.ts', securityMiddleware);
console.log('✅ Security middleware created\n');

// 4. Update hooks.server.ts to use security middleware
console.log('📝 Updating hooks.server.ts...');

const hooksContent = `import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { JWT_SECRET } from '$lib/utils/env';
import jwt from 'jsonwebtoken';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { securityHandle } from './security';

interface JwtPayload {
	id: number;
	username: string;
	role: string;
}

const authHandle: Handle = async ({ event, resolve }) => {
	// Skip auth for non-API routes
	if (!event.url.pathname.startsWith('/api/')) {
		return resolve(event);
	}

	// Skip auth for public endpoints
	const publicEndpoints = ['/api/auth/login', '/api/auth/register', '/api/auth/classes', '/api/health'];
	if (publicEndpoints.some(endpoint => event.url.pathname.startsWith(endpoint))) {
		return resolve(event);
	}

	// Get authorization header
	const authHeader = event.request.headers.get('Authorization');

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return event.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const token = authHeader.substring(7);

	try {
		// Verify token
		const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;

		// Get user from database
		const user = await db
			.select({
				id: users.id,
				name: users.name,
				username: users.username,
				role: users.role,
				kelas: users.kelas,
				verified: users.verified,
				rejectedReason: users.rejectedReason,
				mustChangePassword: users.mustChangePassword
			})
			.from(users)
			.where(eq(users.id, payload.id))
			.get();

		if (!user) {
			return event.json({ error: 'User not found' }, { status: 401 });
		}

		// Set user in locals
		event.locals.user = user;

		return resolve(event);
	} catch (error) {
		console.error('[Auth] Token verification failed:', error);
		return event.json({ error: 'Invalid token' }, { status: 401 });
	}
};

// Chain security middleware with auth middleware
export const handle = sequence(securityHandle, authHandle);
`;

writeFileSync('src/hooks.server.ts', hooksContent);
console.log('✅ hooks.server.ts updated\n');

// 5. Create health check endpoint
console.log('🏥 Creating health check endpoint...');

try {
  await $`mkdir -p src/routes/api/health`;
  
  const healthEndpoint = `import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';

export const GET: RequestHandler = async () => {
  try {
    // Check database connectivity
    await db.query.users.findFirst();
    
    return json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected'
    });
  } catch (error) {
    return json(
      {
        status: 'unhealthy',
        error: 'Database connection failed',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }
};
`;
  
  writeFileSync('src/routes/api/health/+server.ts', healthEndpoint);
  console.log('✅ Health check endpoint created\n');
} catch (error) {
  console.error('❌ Failed to create health check:', error);
}

// 6. Create .env template with strong defaults
console.log('📝 Creating secure .env template...');

const envTemplate = `# ═══════════════════════════════════════════════════════
# Production Environment Variables
# ═══════════════════════════════════════════════════════
# IMPORTANT: Change ALL values before deploying!

# ── Application ────────────────────────────────────────
NODE_ENV=production
PORT=3010

# ── Database ──────────────────────────────────────────
DATABASE_URL=/var/lib/amaliah/app.db

# ── JWT Configuration ─────────────────────────────────
# IMPORTANT: Generate a strong random secret!
# Run: openssl rand -base64 32
JWT_SECRET=CHANGE_THIS_TO_STRONG_RANDOM_SECRET
JWT_EXPIRY=24h

# ── Bootstrap Admin ───────────────────────────────────
BOOTSTRAP_ADMIN_USERNAME=admin
BOOTSTRAP_ADMIN_PASSWORD=CHANGE_THIS_TO_STRONG_PASSWORD
BOOTSTRAP_ADMIN_NAME=Administrator

# ── CORS ──────────────────────────────────────────────
ALLOWED_ORIGINS=https://your-domain.com

# ── Rate Limiting ─────────────────────────────────────
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ── Logging ───────────────────────────────────────────
LOG_LEVEL=info

# ── Sentry (Error Tracking) ──────────────────────────
# VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/your-project-id
`;

writeFileSync('.env.production.template', envTemplate);
console.log('✅ Secure .env template created\n');

console.log('✨ Security hardening complete!\n');
console.log('📋 Next steps:');
console.log('   1. Review and update .env.production.template');
console.log('   2. Change JWT_SECRET to a strong random value');
console.log('   3. Change BOOTSTRAP_ADMIN_PASSWORD');
console.log('   4. Setup SSL/TLS certificate');
console.log('   5. Configure firewall rules');
console.log('   6. Setup automated backups\n');

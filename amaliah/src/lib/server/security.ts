import type { Handle } from '@sveltejs/kit';
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

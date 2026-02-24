import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { secureHeaders } from 'hono/secure-headers'
import rateLimiter from 'hono-rate-limit'
import { initDB, db } from './db'

// Import routes
import authRoutes from './auth'
import amaliahRoutes from './amaliah'
import waliRoutes from './wali'
import adminRoutes from './admin'

// Initialize SQLite database
initDB()

const app = new Hono()

// Security Headers
app.use('*', secureHeaders({
  xFrameOptions: 'DENY',
  xContentTypeOptions: 'nosniff',
  xXSSProtection: '1; mode=block',
  strictTransportSecurity: 'max-age=31536000; includeSubDomains',
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "blob:"],
  },
}))

// CORS - Production configuration
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3002']

app.use('/api/*', cors({
  origin: (origin) => {
    // Allow specific origins or localhost in development
    return ALLOWED_ORIGINS.includes(origin) || origin?.endsWith('.localhost') ? origin : 'http://localhost:3002'
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
  credentials: true,
}))

// Logger
app.use('*', logger())

// Rate limiting for auth endpoints (production only)
if (process.env.NODE_ENV === 'production') {
  app.use('/api/auth/login', rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // 50 requests per window
    keyGenerator: (c) => c.req.header('X-Real-IP') || c.req.header('X-Forwarded-For') || 'unknown',
    message: 'Terlalu banyak percobaan. Silakan coba lagi nanti.',
    standardHeaders: true,
    legacyHeaders: false,
  }))
}

// Apply Routes
app.route('/api/auth', authRoutes)
app.route('/api/amaliah', amaliahRoutes)
app.route('/api/wali', waliRoutes)
app.route('/api/admin', adminRoutes)
// Serve Frontend (SPA)
app.use('/*', serveStatic({ root: './public' }))

// SPA fallback for routing if needed (though our app is a single HTML file without browser routing)
app.get('*', serveStatic({ path: './public/index.html' }))


// Script to create default admin if it doesn't exist
// This needs to be async because hashing takes time
const bootstrap = async () => {
  const adminCount = db.query("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get() as { count: number }
  if (adminCount.count === 0) {
    const defaultPassword = await Bun.password.hash("admin123")
    db.run(
      `INSERT INTO users (name, username, password, role, verified, must_change_password)
       VALUES ('Administrator', 'admin', $password, 'admin', 1, 1)`,
      {
        $password: defaultPassword
      }
    )
    console.log("Default admin created: admin / admin123 (Must change password on first login)")
  }
}

bootstrap()

export default {
  port: 3002,
  fetch: app.fetch,
}

import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { secureHeaders } from 'hono/secure-headers'
import rateLimiter from 'hono-rate-limit'
import { initDB, db } from './db'
import { PORT, ALLOWED_ORIGINS, RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS, NODE_ENV } from './config'
import { existsSync } from 'fs'

// Import routes
import authRoutes from './auth'
import amaliahRoutes from './amaliah'
import waliRoutes from './wali'
import adminRoutes from './admin'

// Initialize SQLite database
initDB()

const app = new Hono()

const isProduction = NODE_ENV === 'production'
const scriptSrc = ["'self'", "'unsafe-inline'"]
const connectSrc = ["'self'"]

if (isProduction) {
  scriptSrc.push('https://static.cloudflareinsights.com')
  connectSrc.push('https://cloudflareinsights.com', 'https://static.cloudflareinsights.com')
}

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
    scriptSrc,
    connectSrc,
    imgSrc: ["'self'", "data:", "blob:"],
  },
}))

// CORS - Production configuration
const DEFAULT_ORIGIN = `http://localhost:${PORT}`

app.use('/api/*', cors({
  origin: (origin) => {
    // Allow specific origins or localhost in development
    return ALLOWED_ORIGINS.includes(origin) || origin?.endsWith('.localhost') ? origin : DEFAULT_ORIGIN
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
  credentials: true,
}))

// Logger
app.use('*', logger())

app.notFound((c) => {
  console.warn('[HTTP][404]', c.req.method, c.req.path)
  return c.text('Not Found', 404)
})

app.onError((err, c) => {
  console.error('[HTTP][500]', c.req.method, c.req.path, err)
  return c.json({ error: 'Internal Server Error' }, 500)
})

// Rate limiting for auth endpoints (production only)
if (NODE_ENV === 'production') {
  app.use('/api/auth/login', rateLimiter({
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: RATE_LIMIT_MAX_REQUESTS,
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
  if (adminCount.count > 0) return

  if (NODE_ENV === 'production') {
    const bootstrapPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD
    if (!bootstrapPassword) {
      throw new Error(
        'No admin user found. Set BOOTSTRAP_ADMIN_PASSWORD for first production boot.'
      )
    }

    const bootstrapUsername = process.env.BOOTSTRAP_ADMIN_USERNAME || 'admin'
    const bootstrapName = process.env.BOOTSTRAP_ADMIN_NAME || 'Administrator'
    const hashedPassword = await Bun.password.hash(bootstrapPassword)

    db.run(
      `INSERT INTO users (name, username, password, role, verified, must_change_password)
       VALUES ($name, $username, $password, 'admin', 1, 1)`,
      {
        $name: bootstrapName,
        $username: bootstrapUsername,
        $password: hashedPassword,
      }
    )
    console.log('Initial admin created for production bootstrap.')
    return
  }

  // Development fallback only
  if (adminCount.count === 0) {
    const bootstrapPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD || 'admin123'
    const defaultPassword = await Bun.password.hash(bootstrapPassword)
    db.run(
      `INSERT INTO users (name, username, password, role, verified, must_change_password)
       VALUES ('Administrator', 'admin', $password, 'admin', 1, 1)`,
      {
        $password: defaultPassword
      }
    )
    console.log("Default admin created for development (username: admin)")
  }
}

bootstrap().catch((err) => {
  console.error('[BOOT] Fatal bootstrap error:', err)
  process.exit(1)
})

const frontendIndexPath = './public/index.html'
const frontendBundlePath = './public/react/index.js'
console.log('[BOOT] Frontend asset check', {
  indexHtml: existsSync(frontendIndexPath),
  reactBundle: existsSync(frontendBundlePath),
  port: PORT,
})

export default {
  port: PORT,
  fetch: app.fetch,
}

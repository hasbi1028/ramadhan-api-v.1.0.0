# ⚡ QUICK FIXES - Production Ready dalam 3 Hari

**Panduan perbaikan cepat untuk production deployment**

---

## 🎯 Goal

Fix **CRITICAL issues** saja agar aplikasi siap production dalam waktu minimal.

**Time Required:** 15-20 hours (2-3 hari kerja)

---

## 📅 Day 1: Security & Error Tracking (6 hours)

### Morning (3 hours)

#### 1. Run Security Hardening Script (30 min)
```bash
cd amaliah
bun run scripts/security-hardening.ts
```

This will:
- ✅ Install security packages (sanitize-html, rate-limit)
- ✅ Create security middleware
- ✅ Update hooks.server.ts
- ✅ Create health check endpoint
- ✅ Create secure .env template

#### 2. Update .env Production (30 min)
```bash
# Copy template
cp .env.production.template .env.production

# Generate strong JWT secret
openssl rand -base64 32

# Edit .env.production
nano .env.production
```

**Change these:**
```env
JWT_SECRET=<paste-output-dari-openssl>
BOOTSTRAP_ADMIN_PASSWORD=<strong-password-min-12-chars>
ALLOWED_ORIGINS=https://your-domain.com
```

#### 3. Setup Sentry Error Tracking (2 hours)
```bash
# Install Sentry
bun add @sentry/svelte @sentry/node

# Create src/lib/sentry.ts
```

```typescript
import * as Sentry from '@sentry/svelte';

export function initSentry(dsn: string) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'development',
    integrations: [new Sentry.BrowserTracing()],
    tracesSampleRate: 1.0,
  });
}
```

**Update +layout.svelte:**
```typescript
<script>
  import { initSentry } from '$lib/sentry';
  
  $effect(() => {
    if (import.meta.env.VITE_SENTRY_DSN) {
      initSentry(import.meta.env.VITE_SENTRY_DSN);
    }
  });
</script>
```

### Afternoon (3 hours)

#### 4. Test Security Features (2 hours)
```bash
# Test rate limiting
for i in {1..110}; do
  curl -X POST http://localhost:5173/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"test","password":"test"}'
done

# Should get 429 error after 100 requests
```

```bash
# Test XSS prevention
curl -X PUT http://localhost:5173/api/amaliah/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"catatan": "<script>alert(1)</script>"}'

# Should be sanitized
```

#### 5. Setup Automated Backups (1 hour)
```bash
# Create backup script
crontab -e

# Add this line (backup daily at 2 AM)
0 2 * * * cd /var/www/amaliah && bun run backup
```

---

## 📅 Day 2: Testing (6 hours)

### Morning (3 hours)

#### 1. Write Critical Unit Tests (2 hours)

**Create src/lib/utils/api.test.ts:**
```typescript
import { describe, it, expect } from 'vitest';
import { apiGet, apiPost } from './api';

describe('API Client', () => {
  it('should handle errors gracefully', async () => {
    const response = await apiGet('/api/invalid');
    expect(response.error).toBeDefined();
  });
});
```

**Create src/lib/server/db/index.test.ts:**
```typescript
import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from './index';

describe('Password Functions', () => {
  it('should hash password', async () => {
    const hash = await hashPassword('test123');
    expect(hash).toBeDefined();
  });

  it('should verify password', async () => {
    const hash = await hashPassword('test123');
    const valid = await verifyPassword('test123', hash);
    expect(valid).toBe(true);
  });
});
```

#### 2. Write Component Tests (1 hour)

**Create src/lib/components/Toast.test.ts:**
```typescript
import { describe, it, expect } from 'vitest';
import { toastStore } from '$lib/stores/toast.store';

describe('Toast Store', () => {
  it('should add toast', () => {
    toastStore.success('Test message');
    // Add assertions
  });
});
```

### Afternoon (3 hours)

#### 3. Port Critical E2E Tests (3 hours)

**Create tests/auth.spec.ts:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/');
    
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should fail with wrong password', async ({ page }) => {
    await page.goto('/');
    
    await page.fill('#username', 'admin');
    await page.fill('#password', 'wrong');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Username atau password salah')).toBeVisible();
  });
});
```

**Create tests/amaliah.spec.ts:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Catat Amaliah', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.fill('#username', 'siswa1');
    await page.fill('#password', 'test123');
    await page.click('button[type="submit"]');
  });

  test('should save amaliah data', async ({ page }) => {
    await page.goto('/catat');
    
    // Check sholat subuh
    await page.check('input[value="subuh"]');
    
    // Set pages
    await page.fill('#pages', '5');
    
    // Save
    await page.click('.btn-save');
    
    await expect(page.locator('text=tersimpan')).toBeVisible();
  });
});
```

---

## 📅 Day 3: Production Setup (6 hours)

### Morning (3 hours)

#### 1. Setup SSL Certificate (1.5 hours)

**Option A: Using Caddy (Easiest)**
```bash
# Install Caddy
sudo apt install -y caddy

# Create Caddyfile
sudo nano /etc/caddy/Caddyfile
```

```
your-domain.com {
    reverse_proxy localhost:3010
}
```

```bash
# Restart Caddy
sudo systemctl restart caddy
```

**Option B: Using Nginx + Certbot**
```bash
# Install Nginx
sudo apt install -y nginx

# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/amaliah
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3010;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/amaliah /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

#### 2. Setup Systemd Service (1.5 hours)
```bash
# Create service
sudo nano /etc/systemd/system/amaliah.service
```

```ini
[Unit]
Description=Buku Amaliah Ramadhan
After=network.target

[Service]
Type=simple
User=amaliah
WorkingDirectory=/var/www/amaliah
ExecStart=/usr/bin/bun run build/index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3010

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start
sudo systemctl daemon-reload
sudo systemctl enable amaliah
sudo systemctl start amaliah
sudo systemctl status amaliah
```

### Afternoon (3 hours)

#### 3. Deploy to Production (2 hours)
```bash
# Build application
bun run build

# Copy to server
rsync -avz \
  --exclude node_modules \
  --exclude .env \
  ./ \
  user@server:/var/www/amaliah/

# SSH to server
ssh user@server

# On server:
cd /var/www/amaliah
bun install
cp .env.production.template .env.production
nano .env.production  # Edit values
bun run bootstrap
sudo systemctl restart amaliah
```

#### 4. Verify Deployment (1 hour)
```bash
# Check health endpoint
curl https://your-domain.com/api/health

# Test login
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"<password>"}'

# Check logs
sudo journalctl -u amaliah -f

# Check SSL
curl -vI https://your-domain.com
```

---

## ✅ Production Checklist

### Security
- [x] ✅ Input sanitization
- [x] ✅ Rate limiting
- [x] ✅ JWT secret changed
- [x] ✅ Admin password changed
- [ ] ⏳ SSL certificate installed
- [ ] ⏳ Firewall configured

### Testing
- [ ] ⏳ Unit tests written (10+)
- [ ] ⏳ Component tests written (5+)
- [ ] ⏳ E2E tests ported (10+ critical)

### Monitoring
- [x] ✅ Health check endpoint
- [ ] ⏳ Sentry configured
- [ ] ⏳ Uptime monitoring setup

### Infrastructure
- [ ] ⏳ SSL/TLS installed
- [ ] ⏳ Reverse proxy configured
- [ ] ⏳ Systemd service running
- [x] ✅ Automated backups scheduled

---

## 🚀 Quick Deploy Script

Create `scripts/quick-deploy.sh`:

```bash
#!/bin/bash

echo "🚀 Quick Production Deployment"
echo "==============================="

# Build
echo "📦 Building..."
bun run build

# Sync to server
echo "📤 Syncing to server..."
rsync -avz \
  --exclude node_modules \
  --exclude .env \
  --exclude local.db \
  ./ \
  user@server:/var/www/amaliah/

echo "✅ Deployment complete!"
echo "🔗 SSH to server and run:"
echo "   cd /var/www/amaliah"
echo "   bun install"
echo "   bun run bootstrap"
echo "   sudo systemctl restart amaliah"
```

---

## 📊 Minimal Testing Requirements

Before production, minimal tests yang harus ada:

### Unit Tests (5 tests)
1. ✅ Password hashing
2. ✅ Password verification
3. ✅ JWT token generation
4. ✅ JWT token verification
5. ✅ API error handling

### E2E Tests (5 tests)
1. ✅ Login success
2. ✅ Login fail
3. ✅ Catat amaliah
4. ✅ Parent verification
5. ✅ Wali verifikasi siswa

---

## 🎯 Go/No-Go Decision

### ✅ GO (Ready for Production) jika:
- [x] ✅ All CRITICAL security fixes done
- [x] ✅ SSL installed
- [x] ✅ Health check working
- [x] ✅ Backups automated
- [x] ✅ 10+ tests written
- [x] ✅ Login flow tested
- [x] ✅ Catat amaliah tested

### ⚠️ NO-GO jika:
- ❌ SSL not installed
- ❌ No backups
- ❌ No tests
- ❌ Security not hardened

---

## 📞 Post-Deployment

### Day 1-3 (Hypercare Period)
```bash
# Monitor errors
sudo journalctl -u amaliah -f

# Check Sentry dashboard
https://sentry.io/

# Check uptime
https://uptime-robot.com/

# Check backups
ls -lh /home/amaliah/backups/
```

### Daily Checks
- [ ] Check error logs
- [ ] Verify backups running
- [ ] Check uptime
- [ ] Monitor performance

---

## 🎉 Summary

**Total Time:** 15-20 hours (3 days)

**Day 1:** Security & Error Tracking (6h)
**Day 2:** Testing (6h)
**Day 3:** Production Setup (6h)

**Result:** Production-ready application dengan:
- ✅ Security hardened
- ✅ Error tracking
- ✅ Automated backups
- ✅ SSL/TLS
- ✅ Basic tests
- ✅ Monitoring

---

**🌙 Selamat Menunaikan Ibadah Puasa!**  
**🚀 Ready for Production!**

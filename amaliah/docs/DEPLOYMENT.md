# 🚀 Deployment Guide - Buku Amaliah Ramadhan

**Panduan lengkap deployment aplikasi Buku Amaliah Ramadhan (SvelteKit) ke production**

---

## 📋 Prerequisites

- Server dengan Node.js 18+ atau Bun runtime
- SQLite installed
- Domain/subdomain (optional tapi recommended)
- SSL/TLS certificate (recommended)

---

## 🏗️ Architecture Overview

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Reverse Proxy  │  (Nginx / Caddy)
│   Port 443/80   │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  SvelteKit App  │  (Node.js adapter)
│   Port 3010     │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│   SQLite DB     │
│  /var/lib/...   │
└─────────────────┘
```

---

## 📦 Step 1: Server Preparation

### Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Or install Bun (recommended for performance)
curl -fsSL https://bun.sh/install | bash

# Install PM2 for process management
sudo npm install -g pm2

# Or use Bun's built-in process manager
```

### Create System User

```bash
# Create dedicated user
sudo useradd -r -m -s /bin/bash amaliah

# Create app directory
sudo mkdir -p /var/www/amaliah
sudo chown amaliah:amaliah /var/www/amaliah
```

---

## 🚀 Step 2: Deploy Application

### Clone/Push Code

```bash
# Switch to amaliah user
sudo su - amaliah

# Navigate to app directory
cd /var/www/amaliah

# Clone repository (or copy files)
git clone <your-repo-url> .
# or copy from local
# rsync -avz ~/amaliah/ /var/www/amaliah/
```

### Install Dependencies

```bash
# Using Bun (recommended)
bun install

# Or using npm
npm install
```

### Setup Environment

```bash
# Copy production env
cp .env.production.example .env.production

# Edit environment variables
nano .env.production
```

**Important variables to change:**
```env
JWT_SECRET=<generate-strong-random-secret>
BOOTSTRAP_ADMIN_PASSWORD=<strong-password>
DATABASE_URL=/var/lib/amaliah/app.db
ALLOWED_ORIGINS=https://your-domain.com
```

### Generate JWT Secret

```bash
# Using openssl
openssl rand -base64 32

# Using Bun
bun -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 🗄️ Step 3: Database Setup

### Create Database Directory

```bash
# Create directory with proper permissions
sudo mkdir -p /var/lib/amaliah
sudo chown amaliah:amaliah /var/lib/amaliah
sudo chmod 750 /var/lib/amaliah
```

### Initialize Database

```bash
# Run bootstrap script
bun run bootstrap

# Or push schema with drizzle-kit
bun run db:push
```

### Verify Database

```bash
# Check if database file exists
ls -lh /var/lib/amaliah/app.db

# Open Drizzle Studio (optional)
bun run db:studio
```

---

## 🔨 Step 4: Build Application

### Production Build

```bash
# Build for production
bun run build

# Verify build output
ls -lh build/
```

**Expected output:**
```
build/
├── client/        # Static assets
├── server/        # Node.js server
└── index.js       # Entry point
```

---

## 🔒 Step 5: SSL/TLS Setup (Recommended)

### Option A: Using Caddy (Easiest)

```bash
# Install Caddy
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy

# Create Caddyfile
sudo nano /etc/caddy/Caddyfile
```

**Caddyfile configuration:**
```
your-domain.com {
    reverse_proxy localhost:3010
}
```

**Restart Caddy:**
```bash
sudo systemctl restart caddy
```

### Option B: Using Nginx + Certbot

```bash
# Install Nginx
sudo apt install -y nginx

# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/amaliah
```

**Nginx configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3010;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Enable site and get SSL:**
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/amaliah /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

---

## ⚙️ Step 6: Process Management

### Option A: Using PM2 (Node.js)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start application
cd /var/www/amaliah
pm2 start build/index.js --name amaliah

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup systemd
```

**Useful PM2 commands:**
```bash
pm2 status          # Check status
pm2 logs amaliah    # View logs
pm2 restart amaliah # Restart app
pm2 stop amaliah    # Stop app
pm2 delete amaliah  # Delete app
```

### Option B: Using systemd (Recommended)

```bash
# Create systemd service
sudo nano /etc/systemd/system/amaliah.service
```

**Service configuration:**
```ini
[Unit]
Description=Buku Amaliah Ramadhan App
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

# Security
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

**Enable and start service:**
```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service
sudo systemctl enable amaliah

# Start service
sudo systemctl start amaliah

# Check status
sudo systemctl status amaliah
```

### Option C: Using Bun's Built-in

```bash
# Start with Bun
bun run build/index.js &

# Or use nohup
nohup bun run build/index.js > app.log 2>&1 &
```

---

## 🧪 Step 7: Testing

### Verify Deployment

```bash
# Check if app is running
curl http://localhost:3010

# Check HTTPS (if SSL configured)
curl https://your-domain.com

# Test API endpoint
curl https://your-domain.com/api/auth/classes
```

### Check Logs

```bash
# Systemd logs
sudo journalctl -u amaliah -f

# PM2 logs
pm2 logs amaliah

# App logs
tail -f /var/www/amaliah/app.log
```

### Browser Testing

1. Open https://your-domain.com
2. Login with admin credentials
3. Test all features:
   - ✅ Login/Logout
   - ✅ Create class
   - ✅ Register student
   - ✅ Verify student
   - ✅ Parent verification
   - ✅ PWA installation

---

## 🔧 Step 8: Maintenance

### Backup Database

```bash
# Create backup script
nano /home/amaliah/backup-db.sh
```

**Backup script:**
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/amaliah/backups"
DB_PATH="/var/lib/amaliah/app.db"

mkdir -p $BACKUP_DIR
cp $DB_PATH $BACKUP_DIR/amaliah_$DATE.db

# Keep only last 7 backups
find $BACKUP_DIR -name "*.db" -mtime +7 -delete
```

**Make executable and schedule:**
```bash
chmod +x /home/amaliah/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
0 2 * * * /home/amaliah/backup-db.sh
```

### Update Application

```bash
# Navigate to app directory
cd /var/www/amaliah

# Pull latest changes
git pull origin main

# Install new dependencies
bun install

# Rebuild
bun run build

# Restart service
sudo systemctl restart amaliah
# or
pm2 restart amaliah
```

### Monitor Application

```bash
# Check service status
sudo systemctl status amaliah

# View real-time logs
sudo journalctl -u amaliah -f

# Check resource usage
htop
```

---

## 🚨 Troubleshooting

### App Won't Start

```bash
# Check logs
sudo journalctl -u amaliah --no-pager -n 50

# Check port is free
sudo lsof -i :3010

# Check permissions
ls -lh /var/www/amaliah
ls -lh /var/lib/amaliah
```

### Database Errors

```bash
# Check database file
ls -lh /var/lib/amaliah/app.db

# Check permissions
sudo chown amaliah:amaliah /var/lib/amaliah/app.db

# Re-run migrations
bun run db:push
```

### SSL Issues

```bash
# Test SSL
curl -vI https://your-domain.com

# Check certificate
sudo certbot certificates

# Renew certificate
sudo certbot renew
```

### Performance Issues

```bash
# Check resource usage
top
htop
df -h

# Check database size
du -sh /var/lib/amaliah/app.db

# Optimize database (VACUUM)
sqlite3 /var/lib/amaliah/app.db "VACUUM;"
```

---

## 📊 Performance Optimization

### Enable Compression

Already handled by SvelteKit adapter-node.

### Database Optimization

```bash
# Enable WAL mode (already in schema)
sqlite3 /var/lib/amaliah/app.db "PRAGMA journal_mode=WAL;"

# Analyze database
sqlite3 /var/lib/amaliah/app.db "ANALYZE;"
```

### Caching

- Static assets cached by service worker (PWA)
- API responses can be cached with Redis (optional)

### CDN (Optional)

For better performance, serve static assets via CDN:
- Cloudflare (free)
- AWS CloudFront
- Vercel Edge Network

---

## 🔐 Security Checklist

- [ ] Change default admin password
- [ ] Set strong JWT_SECRET
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall (ufw)
- [ ] Set up automatic security updates
- [ ] Regular database backups
- [ ] Monitor logs for suspicious activity
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] File permissions correct

---

## 📈 Monitoring (Optional)

### Uptime Monitoring

- UptimeRobot (free)
- Pingdom
- Better Stack

### Error Tracking

- Sentry
- LogRocket
- Self-hosted: GlitchTip

### Analytics

- Plausible (privacy-friendly)
- Fathom Analytics
- Google Analytics (not recommended for privacy)

---

## 📞 Support

**For issues:**
- 📖 Check [README.md](README.md)
- 📘 Review [MIGRATION_GUIDE.md](docs/MIGRATION_GUIDE.md)
- 🐛 Report bugs via GitHub Issues

---

**🎉 Deployment Complete! Selamat Menunaikan Ibadah Puasa!**

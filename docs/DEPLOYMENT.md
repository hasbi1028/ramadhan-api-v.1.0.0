# 🚀 Deployment Guide - Production Ready

**Versi:** 1.0.0  
**Last Update:** Februari 2026  
**Target:** Production Environment (1 Month Internal Use)

---

## 📋 Prerequisites

### Server Requirements

| Spec | Minimum | Recommended |
|------|---------|-------------|
| **CPU** | 1 Core | 2 Core |
| **RAM** | 512 MB | 1 GB |
| **Storage** | 5 GB | 10 GB |
| **OS** | Ubuntu 20.04 | Ubuntu 22.04 LTS |
| **Network** | 100 Mbps | 1 Gbps |

### Domain & SSL

- Domain: `ramadhan.mtsschool.sch.id`
- SSL: Let's Encrypt (FREE)
- Email: For SSL renewal notifications

---

## 🏗️ Deployment Options

### Option 1: VPS Deployment (Recommended)

**Provider:** DigitalOcean / Linode / Vultr  
**Cost:** $5/month (~Rp 80rb)

#### Step 1: Server Setup

```bash
# SSH ke server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install essential packages
apt install -y curl git sqlite3 nginx certbot python3-certbot-nginx

# Create app user
useradd -m -s /bin/bash www-data
```

#### Step 2: Application Setup

```bash
# Create app directory
mkdir -p /opt/ramadhan-api
mkdir -p /var/lib/ramadhan-api
mkdir -p /var/log/ramadhan-api
mkdir -p /backups/ramadhan

# Upload application (via git or SCP)
cd /opt/ramadhan-api
git clone <repository-url> .

# Or upload via SCP from local:
# scp -r ./* root@server:/opt/ramadhan-api/
```

#### Step 3: Install Bun

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Add to PATH
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

# Verify
bun --version
```

#### Step 4: Configure Environment

```bash
cd /opt/ramadhan-api

# Copy environment template
cp .env.example .env

# Edit .env
nano .env
```

**Minimum configuration:**
```env
NODE_ENV=production
PORT=3010

# Generate new secret: openssl rand -hex 32
JWT_SECRET=your-64-character-random-secret-key-here

DATABASE_PATH=/var/lib/ramadhan-api/app.db
ALLOWED_ORIGINS=https://ramadhan.mtsschool.sch.id
```

#### Step 5: Install Dependencies

```bash
cd /opt/ramadhan-api
bun install --production
```

#### Step 6: Setup Database

```bash
# Create database file
touch /var/lib/ramadhan-api/app.db

# Set permissions
chown www-data:www-data /var/lib/ramadhan-api/app.db
chmod 640 /var/lib/ramadhan-api/app.db

# Initialize schema (first run)
su - www-data -c "cd /opt/ramadhan-api && bun run src/index.ts" &
sleep 3
pkill -f "bun run"
```

#### Step 7: Create Systemd Service

```bash
nano /etc/systemd/system/ramadhan-api.service
```

**Service file:**
```ini
[Unit]
Description=Ramadhan API Service
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/opt/ramadhan-api
ExecStart=/home/www-data/.bun/bin/bun run src/index.ts
Restart=always
RestartSec=3
Environment=NODE_ENV=production
EnvironmentFile=/opt/ramadhan-api/.env

# Security
NoNewPrivileges=true
PrivateTmp=true

# Logging
StandardOutput=append:/var/log/ramadhan-api/out.log
StandardError=append:/var/log/ramadhan-api/error.log

[Install]
WantedBy=multi-user.target
```

**Enable service:**
```bash
systemctl daemon-reload
systemctl enable ramadhan-api
systemctl start ramadhan-api
systemctl status ramadhan-api
```

#### Step 8: Setup Nginx Reverse Proxy

```bash
nano /etc/nginx/sites-available/ramadhan-api
```

**Nginx config:**
```nginx
server {
    listen 80;
    server_name ramadhan.mtsschool.sch.id;

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

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

**Enable site:**
```bash
ln -s /etc/nginx/sites-available/ramadhan-api /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

#### Step 9: Setup SSL (HTTPS)

```bash
# Get SSL certificate
certbot --nginx -d ramadhan.mtsschool.sch.id

# Auto-renewal is automatic
# Test renewal
certbot renew --dry-run
```

#### Step 10: Setup Firewall

```bash
# Install UFW
apt install -y ufw

# Allow SSH, HTTP, HTTPS
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw enable
ufw status
```

---

### Option 2: Shared Hosting

**Provider:** Niagahoster / Hostinger  
**Cost:** Rp 30rb/month

#### Step 1: Upload Files

Via FTP/cPanel File Manager:
```
Upload all files to: /public_html/ramadhan-api/
```

#### Step 2: Setup via cPanel Terminal

```bash
cd /public_html/ramadhan-api

# Install Bun
curl -fsSL https://bun.sh/install | bash

# Install dependencies
bun install --production

# Setup .env
cp .env.example .env
nano .env
```

#### Step 3: Setup PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start "bun run src/index.ts" --name ramadhan-api

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup
# Copy the command output and run it
```

#### Step 4: Setup Subdomain

cPanel → Subdomains:
- Subdomain: `ramadhan`
- Domain: `mtsschool.sch.id`
- Document Root: `/public_html/ramadhan-api/public`

#### Step 5: Setup Reverse Proxy (.htaccess)

```apache
RewriteEngine On
RewriteRule ^$ http://localhost:3010/ [P,L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3010/$1 [P,L]
```

---

## 🔧 Post-Deployment

### 1. Verify Installation

```bash
# Check service
systemctl status ramadhan-api

# Check logs
tail -f /var/log/ramadhan-api/out.log

# Test endpoint
curl http://localhost:3010/
curl https://ramadhan.mtsschool.sch.id/

# Test API
curl https://ramadhan.mtsschool.sch.id/api/auth/me
```

### 2. Create Admin User

Default admin created on first run:
- Username: `admin`
- Password: `admin123`

**Change immediately after first login!**

### 3. Setup Automated Backups

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /opt/ramadhan-api/backup-db.sh

# Verify
crontab -l
```

### 4. Setup Monitoring

**Simple health check script:**
```bash
nano /opt/ramadhan-api/scripts/health-check.sh
```

```bash
#!/bin/bash
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3010/)
if [ "$RESPONSE" != "200" ]; then
  echo "$(date): API DOWN - Response: $RESPONSE" >> /var/log/ramadhan-api/health.log
  systemctl restart ramadhan-api
fi
```

**Cron (every 5 minutes):**
```bash
*/5 * * * * /opt/ramadhan-api/scripts/health-check.sh
```

### 5. Import Users

**Import students from CSV:**
```bash
cd /opt/ramadhan-api
bun run scripts/import-students.js students.csv
```

**Create wali kelas:**
```bash
bun run scripts/create-wali.js --kelas 7A --username wali7A
```

---

## 📊 Maintenance

### Daily Checks

```bash
# Service status
systemctl is-active ramadhan-api

# Disk space
df -h

# Check backups
ls -lh /backups/ramadhan/

# Check error logs
tail -20 /var/log/ramadhan-api/error.log
```

### Weekly Tasks

```bash
# Update system
apt update && apt upgrade -y

# Clean old logs
journalctl --vacuum-time=7d

# Check database size
du -h /var/lib/ramadhan-api/app.db
```

### Monthly Tasks

```bash
# Full backup before any changes
/opt/ramadhan-api/backup-db.sh

# Review error logs
cat /var/log/ramadhan-api/error.log | grep "$(date +%Y-%m)"

# Check SSL expiry
certbot certificates
```

---

## 🔄 Update/Upgrade

### Update Application

```bash
cd /opt/ramadhan-api

# Backup first!
/opt/ramadhan-api/backup-db.sh

# Pull latest code
git pull origin main

# Install new dependencies
bun install --production

# Restart service
systemctl restart ramadhan-api

# Verify
systemctl status ramadhan-api
```

### Rollback

```bash
# Stop service
systemctl stop ramadhan-api

# Restore previous version
git checkout <previous-commit>

# Restore database
/opt/ramadhan-api/restore-db.sh /backups/ramadhan/app_YYYYMMDD_HHMMSS.db.gz

# Start service
systemctl start ramadhan-api
```

---

## 🚨 Emergency Procedures

### Service Down

```bash
# Check status
systemctl status ramadhan-api

# Check logs
journalctl -u ramadhan-api -n 50

# Restart
systemctl restart ramadhan-api

# If still down, restore from backup
/opt/ramadhan-api/restore-db.sh
```

### Database Corrupt

```bash
# Stop service
systemctl stop ramadhan-api

# Check integrity
sqlite3 /var/lib/ramadhan-api/app.db "PRAGMA integrity_check;"

# If corrupt, restore
/opt/ramadhan-api/restore-db.sh

# Start service
systemctl start ramadhan-api
```

### Server Down

1. **Spin up new server**
2. **Restore from latest backup**
3. **Update DNS if IP changed**
4. **Test thoroughly**

---

## 📞 Support

| Issue | Contact |
|-------|---------|
| Server Issues | [Server Admin Phone] |
| Database Issues | [DB Admin Phone] |
| Application Issues | [Dev Team Phone] |

---

## ✅ Deployment Checklist

- [ ] Server provisioned
- [ ] Domain configured
- [ ] SSL certificate installed
- [ ] Application deployed
- [ ] Environment variables set
- [ ] Database initialized
- [ ] Service running
- [ ] Firewall configured
- [ ] Backups configured
- [ ] Monitoring setup
- [ ] Admin user created
- [ ] Password changed
- [ ] Users imported
- [ ] Test login (admin, wali, siswa)
- [ ] Test parent verification
- [ ] Test backup/restore

---

**Deployment Complete! 🎉**  
**Selamat menunaikan ibadah puasa!**

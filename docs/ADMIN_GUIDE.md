# 🔧 Panduan Administrator - Aplikasi Amaliah Ramadhan

**Versi:** 1.0.0  
**Untuk:** Admin IT / Pengelola Sistem  
**Update:** Februari 2026

---

## 📋 Daftar Isi

1. [Setup Awal](#setup-awal)
2. [Manajemen Pengguna](#manajemen-pengguna)
3. [Backup & Restore](#backup--restore)
4. [Monitoring Sistem](#monitoring-sistem)
5. [Troubleshooting](#troubleshooting)
6. [End of Period](#end-of-period)

---

## 🚀 Setup Awal

### 1. Instalasi Server

**Pilihan A: VPS (Recommended)**
```bash
# Login ke VPS sebagai root
ssh root@your-server-ip

# Clone atau upload aplikasi
cd /opt
git clone <repository-url> ramadhan-api
cd ramadhan-api

# Jalankan deployment script
sudo ./deploy.sh
```

**Pilihan B: Shared Hosting**
```bash
# Upload via FTP/cPanel
# Install dependencies via SSH atau terminal cPanel
bun install

# Setup .env
cp .env.example .env
nano .env  # Edit dengan nilai yang sesuai

# Jalankan dengan PM2
pm2 start "bun run src/index.ts" --name ramadhan-api
pm2 save
pm2 startup
```

### 2. Konfigurasi Environment

Edit file `.env`:
```bash
# WAJIB! Generate JWT secret baru
JWT_SECRET=$(openssl rand -hex 32)

# Set environment
NODE_ENV=production
PORT=3010

# Database path
DATABASE_PATH=/var/lib/ramadhan-api/app.db

# CORS (sesuaikan dengan domain sekolah)
ALLOWED_ORIGINS=https://ramadhan.mtsschool.sch.id
```

### 3. Setup SSL (HTTPS)

**Menggunakan Let's Encrypt (FREE):**
```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Dapatkan sertifikat
sudo certbot --nginx -d ramadhan.mtsschool.sch.id

# Auto-renewal sudah otomatis
```

### 4. Buat Admin Pertama

**Otomatis saat first run:**
- Username: `admin`
- Password: `admin123`
- **WAJIB ganti setelah login pertama!**

**Atau manual via script:**
```bash
cd /opt/ramadhan-api
bun run scripts/create-admin.js
```

### 5. Setup Backup Otomatis

**Tambahkan ke crontab:**
```bash
# Edit crontab
sudo crontab -e

# Tambahkan baris ini (backup setiap hari jam 2 pagi)
0 2 * * * /opt/ramadhan-api/backup-db.sh

# Verify
crontab -l
```

**Test backup manual:**
```bash
sudo /opt/ramadhan-api/backup-db.sh
```

---

## 👥 Manajemen Pengguna

### 1. Import Data Siswa (Bulk Import)

**Format CSV:**
```csv
name,username,password,role,kelas
Ahmad Abdullah,ahmad7A,password123,siswa,7A
Fatimah Zahra,fatimah7A,password123,siswa,7A
```

**Import via script:**
```bash
cd /opt/ramadhan-api
bun run scripts/import-students.js students.csv
```

**Atau via SQL:**
```bash
sqlite3 /var/lib/ramadhan-api/app.db

-- Import dari CSV
.mode csv
.import students.csv users_temp

-- Insert dengan hash password
INSERT INTO users (name, username, password, role, kelas, verified)
SELECT name, username, 
       '$argon2id$v=19$m=65536,t=2,p=1$...', 
       'siswa', kelas, 1
FROM users_temp;
```

### 2. Setup Wali Kelas

**Untuk setiap kelas:**
1. Login sebagai admin
2. Dashboard → "👩‍🏫 Wali Kelas"
3. Buat akun wali kelas:
   - Username: `wali7A` (untuk kelas 7A)
   - Password: Default school password
   - Kelas: `7A`
4. Set `verified = 1` (approved)

**Script cepat:**
```bash
bun run scripts/create-wali.js --kelas 7A --username wali7A
```

### 3. Reset Password User

**Via Database:**
```bash
sqlite3 /var/lib/ramadhan-api/app.db

-- Generate hash password baru (gunakan Bun)
-- const hash = await Bun.password.hash('newpassword123')

UPDATE users 
SET password = '$argon2id$...', 
    must_change_password = 1
WHERE username = 'siswa7A';
```

**Via Admin Panel:**
- Fitur coming soon (manual via database dulu)

### 4. Hapus User

**Via Admin Panel:**
1. Login sebagai admin
2. "🎓 Siswa" atau "👩‍🏫 Wali Kelas"
3. Klik ikon "🗑" pada user
4. Konfirmasi

**Via Database:**
```bash
sqlite3 /var/lib/ramadhan-api/app.db

-- Hapus user (amaliah akan terhapus otomatis - CASCADE)
DELETE FROM users WHERE username = 'siswa7A';

-- Vacuum untuk reclaim space
VACUUM;
```

---

## 💾 Backup & Restore

### Backup Manual

**Full backup:**
```bash
# Stop service
sudo systemctl stop ramadhan-api

# Copy database
cp /var/lib/ramadhan-api/app.db /backups/ramadhan/manual_backup.db

# Compress
gzip /backups/ramadhan/manual_backup.db

# Start service
sudo systemctl start ramadhan-api

# Verify
ls -lh /backups/ramadhan/
```

**Backup dengan script:**
```bash
sudo /opt/ramadhan-api/backup-db.sh
```

### Restore dari Backup

**Menggunakan script:**
```bash
# Lihat backup yang tersedia
ls -lh /backups/ramadhan/

# Restore
sudo /opt/ramadhan-api/restore-db.sh /backups/ramadhan/app_20260224_020000.db.gz
```

**Manual restore:**
```bash
# Stop service
sudo systemctl stop ramadhan-api

# Backup current DB first!
cp /var/lib/ramadhan-api/app.db /backups/ramadhan/current_before_restore.db

# Restore
gunzip -c /backups/ramadhan/app_20260224_020000.db.gz > /var/lib/ramadhan-api/app.db

# Set permissions
chown www-data:www-data /var/lib/ramadhan-api/app.db
chmod 640 /var/lib/ramadhan-api/app.db

# Start service
sudo systemctl start ramadhan-api

# Verify
curl http://localhost:3010/
```

### Backup Schedule

| Type | Schedule | Retention |
|------|----------|-----------|
| **Daily** | 2:00 AM | 7 days |
| **Weekly** | Sunday 3:00 AM | 4 weeks |
| **Monthly** | 1st of month | 3 months |

---

## 📊 Monitoring Sistem

### 1. Service Status

```bash
# Check status
sudo systemctl status ramadhan-api

# Real-time logs
sudo journalctl -u ramadhan-api -f

# Last 100 lines
sudo journalctl -u ramadhan-api -n 100
```

### 2. Health Check

**Manual:**
```bash
curl http://localhost:3010/
curl http://localhost:3010/api/auth/me
```

**Automated (cron every 5 min):**
```bash
# /opt/ramadhan-api/scripts/health-check.sh
#!/bin/bash
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3010/)
if [ "$RESPONSE" != "200" ]; then
  echo "API DOWN! Response: $RESPONSE" | mail -s "ALERT" admin@school.sch.id
  sudo systemctl restart ramadhan-api
fi
```

### 3. Resource Monitoring

```bash
# Disk usage
df -h

# Memory usage
free -h

# Process list
ps aux | grep ramadhan

# Open ports
sudo netstat -tlnp | grep 3010
```

### 4. Database Size

```bash
# Check database size
du -h /var/lib/ramadhan-api/app.db

# Count records
sqlite3 /var/lib/ramadhan-api/app.db "SELECT 
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM amaliah) as amaliah;"
```

### 5. Log Analysis

```bash
# Error logs
tail -f /var/log/ramadhan-api/error.log

# Access logs (if using nginx)
tail -f /var/log/nginx/access.log | grep ramadhan

# Count errors per day
grep "^202" /var/log/ramadhan-api/error.log | cut -d' ' -f1 | sort | uniq -c
```

---

## 🔧 Troubleshooting

### Service Issues

**Problem:** Service tidak start
```bash
# Check status
sudo systemctl status ramadhan-api

# Check logs
sudo journalctl -u ramadhan-api -n 50

# Common fixes:
# 1. Check .env file
cat /opt/ramadhan-api/.env

# 2. Check permissions
ls -la /var/lib/ramadhan-api/

# 3. Restart
sudo systemctl restart ramadhan-api
```

**Problem:** Service sering restart
```bash
# Check error logs
tail -f /var/log/ramadhan-api/error.log

# Check memory
free -h

# If OOM (Out of Memory):
# 1. Add swap
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 2. Or upgrade server RAM
```

### Database Issues

**Problem:** Database corrupt
```bash
# Stop service
sudo systemctl stop ramadhan-api

# Try repair
sqlite3 /var/lib/ramadhan-api/app.db "PRAGMA integrity_check;"

# If corrupt, restore from backup
sudo /opt/ramadhan-api/restore-db.sh

# Start service
sudo systemctl start ramadhan-api
```

**Problem:** Database locked
```bash
# Find process holding lock
sudo lsof /var/lib/ramadhan-api/app.db

# Kill process if stuck
sudo kill -9 <PID>

# Restart service
sudo systemctl restart ramadhan-api
```

### Performance Issues

**Problem:** Slow response
```bash
# Check server load
uptime

# Check active connections
sudo netstat -an | grep 3010 | wc -l

# Check slow queries (enable query logging)
# Add to app: console.log(query, time)

# Optimize database
sqlite3 /var/lib/ramadhan-api/app.db "VACUUM; ANALYZE;"
```

### Security Issues

**Problem:** Brute force attack
```bash
# Check access logs
grep "POST /api/auth/login" /var/log/nginx/access.log | \
  awk '{print $1}' | sort | uniq -c | sort -rn | head -10

# Block IP
sudo ufw deny from 192.168.1.100

# Or via nginx
# Add to nginx.conf:
# deny 192.168.1.100;
```

---

## 📅 End of Period (Setelah Ramadhan)

### 1. Export Data

**Export semua amaliah:**
```bash
cd /opt/ramadhan-api
bun run scripts/export-amaliah.js
```

**Output:** `exports/amaliah_export_YYYYMMDD.csv`

**Format CSV:**
```csv
tanggal,siswa,kelas,sholat_subuh,sholat_dzuhur,...,pages,catatan,parent_name
1,Bobi,7A,true,true,...,5,"Catatan",Test Parent
```

### 2. Generate Reports

**Per Siswa:**
```bash
bun run scripts/generate-report.js --student siswa7A
```

**Per Kelas:**
```bash
bun run scripts/generate-report.js --class 7A
```

**Full School:**
```bash
bun run scripts/generate-report.js --all
```

### 3. Archive Database

```bash
# Stop service
sudo systemctl stop ramadhan-api

# Backup final
sudo /opt/ramadhan-api/backup-db.sh

# Copy to archive
cp /backups/ramadhan/app_*.gz /archive/ramadhan-2026/

# Compress all logs
tar -czvf /archive/ramadhan-2026/logs.tar.gz /var/log/ramadhan-api/
```

### 4. Shutdown atau Continue?

**Option A: Shutdown**
```bash
# Stop service
sudo systemctl stop ramadhan-api

# Disable auto-start
sudo systemctl disable ramadhan-api

# Remove service (optional)
sudo rm /etc/systemd/system/ramadhan-api.service
sudo systemctl daemon-reload
```

**Option B: Continue Next Year**
```bash
# Keep service running
# Just backup and clean old data

# Archive old data
sqlite3 /var/lib/ramadhan-api/app.db \
  "CREATE TABLE amaliah_2026 AS SELECT * FROM amaliah;"
sqlite3 /var/lib/ramadhan-api/app.db "DELETE FROM amaliah;"
```

---

## 📞 Emergency Contacts

| Role | Name | Contact |
|------|------|---------|
| **Server Admin** | [Name] | [Phone/WA] |
| **IT Support** | [Name] | [Phone/WA] |
| **School Admin** | [Name] | [Phone/WA] |

---

## 🔐 Security Checklist

- [ ] JWT_SECRET changed from default
- [ ] .env file permissions: 600
- [ ] Database permissions: 640
- [ ] SSL certificate installed
- [ ] Firewall enabled (UFW)
- [ ] Regular backups configured
- [ ] Monitoring setup
- [ ] Admin passwords changed

---

**Good luck! Semoga aplikasi bermanfaat! 🚀**

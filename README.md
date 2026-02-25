# 🌙 Buku Amaliah Ramadhan - Production Ready

**Versi:** 1.0.0  
**Status:** ✅ Production Ready  
**Masa Penggunaan:** 1 Bulan (Ramadhan)  
**Last Update:** Februari 2026

---

## 📖 Tentang Aplikasi

Aplikasi **Buku Amaliah Ramadhan** adalah sistem digital untuk mencatat kegiatan ibadah harian siswa selama bulan Ramadhan dengan fitur verifikasi orang tua/wali.

### Fitur Utama

- ✏️ **Catat Kegiatan** - Siswa mencatat ibadah harian
- 👨‍👩‍👧 **Verifikasi Orang Tua** - Tanda tangan digital untuk validasi
- 📊 **Rekap Real-time** - Monitoring progress per siswa & kelas
- 👨‍🏫 **Dashboard Wali** - Cek paraf, approve siswa, monitoring
- 👤 **Admin Panel** - Manage users, statistik sekolah
- 🔄 **Reset Verifikasi** - Wali kelas bisa batalkan verifikasi

### Tech Stack

- **Backend:** Bun + Hono (TypeScript)
- **Database:** SQLite (file-based)
- **Frontend:** Vanilla JS + HTML
- **Auth:** JWT (24h expiry)
- **Testing:** Playwright (30 E2E tests)

---

## 🚀 Quick Start

### Development

```bash
# Install dependencies
bun install

# Run development server
bun run dev

# Open browser
http://localhost:3002
```

### Production (Cloudflared Tunnel)

**Frontend sudah auto-detect domain!**

File `public/config.js` sudah diset ke:
```javascript
{
  API: 'https://amaliah-ramadhan.mtsn2kolut.sch.id/api'
}
```

**Jika perlu override:**
1. Edit `public/config.js`
2. Set API URL yang sesuai
3. Clear browser cache (Ctrl+Shift+R)
4. Reload halaman

**Verify:**
```javascript
// Browser console (F12)
console.log(API);
// Should show your domain, not localhost
```

### Production Deployment

**Option 1: VPS (Recommended)**
```bash
# Clone & Deploy
git clone <repository-url> /opt/ramadhan-api
cd /opt/ramadhan-api
sudo ./deploy.sh
```

**Option 2: Docker**
```bash
docker-compose up -d
```

**Option 3: Shared Hosting**
```bash
# Upload via FTP
# Install via cPanel terminal
bun install
pm2 start "bun run src/index.ts" --name ramadhan-api
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [📖 User Guide](docs/USER_GUIDE.md) | Panduan untuk Siswa, Wali, Admin |
| [🔧 Admin Guide](docs/ADMIN_GUIDE.md) | Setup & management untuk admin |
| [🚀 Deployment](docs/DEPLOYMENT.md) | Production deployment guide |

---

## 🔐 Default Credentials

| Role | Username | Password | Note |
|------|----------|----------|------|
| Admin | `admin` | `admin123` | ⚠️ Change immediately! |
| Wali Kelas | `wali7A` | `password123` | Per kelas |
| Siswa | `siswa7A` | `password123` | Per siswa |

---

## 🛡️ Security Features

- ✅ JWT Authentication (24h expiry)
- ✅ Rate Limiting (50 req/15min)
- ✅ Security Headers (CSP, X-Frame-Options, etc.)
- ✅ CORS Protection
- ✅ Password Hashing (Argon2id)
- ✅ Input Validation (Zod)
- ✅ SQL Injection Protection (Parameterized queries)

---

## 📊 Monitoring

### Health Check

```bash
# Manual check
curl http://localhost:3002/

# Automated (cron every 5 min)
*/5 * * * * /opt/ramadhan-api/scripts/health-check.sh
```

### Monitoring Dashboard

```bash
# Interactive dashboard
/opt/ramadhan-api/scripts/monitor.sh
```

### Logs

```bash
# Application logs
tail -f /var/log/ramadhan-api/out.log
tail -f /var/log/ramadhan-api/error.log

# System logs
journalctl -u ramadhan-api -f
```

---

## 💾 Backup & Restore

### Automated Backup

```bash
# Daily at 2 AM (cron)
0 2 * * * /opt/ramadhan-api/backup-db.sh
```

### Manual Backup

```bash
/opt/ramadhan-api/backup-db.sh
```

### Restore

```bash
# List backups
ls -lh /backups/ramadhan/

# Restore
/opt/ramadhan-api/restore-db.sh /backups/ramadhan/app_YYYYMMDD_HHMMSS.db.gz
```

---

## 📁 Database Scripts

| Script | Description |
|--------|-------------|
| `bun run scripts/import-students.js students.csv` | Import students from CSV |
| `bun run scripts/export-amaliah.js` | Export amaliah data to CSV |
| `bun run scripts/cleanup-test-data.js` | Remove test data before production |

---

## 🧪 Testing

```bash
# Run all tests
bun run test

# Run with UI
bun run test:ui

# Run specific file
bunx playwright test tests/admin.spec.ts

# View report
bun run test:report
```

**Test Coverage:** 30 E2E tests (100% passing)
- Authentication: 5 tests
- Admin CRUD: 17 tests
- Amaliah Siswa: 3 tests
- Wali Kelas: 5 tests

---

## 📱 User Roles

### Siswa
- ✏️ Catat kegiatan harian
- 📊 Lihat rekap pribadi
- 👤 Ganti password

### Wali Kelas
- ✅ Verifikasi siswa baru
- 📝 Cek paraf orang tua per hari
- 📊 Rekap kelas
- 🔄 Reset verifikasi siswa

### Admin
- 🏠 Dashboard statistik
- 👩‍🏫 Manage wali kelas
- 🎓 Manage siswa
- 👤 Manage profil

---

## ⚙️ Configuration

### Environment Variables

```bash
# Copy template
cp .env.example .env

# Edit .env
nano .env
```

**Required:**
```env
NODE_ENV=production
PORT=3002
JWT_SECRET=your-random-64-char-secret
DATABASE_PATH=/var/lib/ramadhan-api/app.db
ALLOWED_ORIGINS=https://ramadhan.mtsschool.sch.id
```

---

## 📅 End of Period

Setelah Ramadhan selesai:

```bash
# Export all data
bun run scripts/export-amaliah.js

# Generate reports
bun run scripts/generate-report.js --all

# Backup final database
/opt/ramadhan-api/backup-db.sh

# Archive or shutdown
sudo systemctl stop ramadhan-api
```

---

## 🆘 Troubleshooting

### Service Down
```bash
sudo systemctl restart ramadhan-api
sudo journalctl -u ramadhan-api -n 50
```

### Database Issues
```bash
# Check integrity
sqlite3 /var/lib/ramadhan-api/app.db "PRAGMA integrity_check;"

# Restore from backup
/opt/ramadhan-api/restore-db.sh
```

### Login Issues
- Check caps lock
- Verify user is approved
- Contact admin for password reset

---

## 📞 Support

| Issue | Contact |
|-------|---------|
| Server Issues | [Server Admin] |
| Database Issues | [DB Admin] |
| Application Issues | [Dev Team] |

---

## 📄 License

Internal use only - [School Name]  
Valid for: 1 month (Ramadhan 2026)

---

## ✅ Production Checklist

- [ ] Environment variables configured
- [ ] JWT_SECRET changed from default
- [ ] SSL certificate installed
- [ ] Firewall enabled
- [ ] Backups configured
- [ ] Monitoring setup
- [ ] Admin passwords changed
- [ ] Test data removed
- [ ] Real users imported
- [ ] All tests passing
- [ ] Documentation distributed

---

**Selamat Menunaikan Ibadah Puasa! 🌙**  
**Semoga amal ibadah kita diterima Allah SWT.**

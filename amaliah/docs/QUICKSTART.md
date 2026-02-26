# 🚀 Quick Start Guide - Buku Amaliah Ramadhan

**Panduan cepat untuk menjalankan aplikasi Buku Amaliah Ramadhan (SvelteKit)**

---

## ⚡ 1 Menit Setup

### 1. Install Dependencies

```bash
cd amaliah
bun install
```

### 2. Setup Environment

```bash
cp .env.example .env
```

### 3. Initialize Database

```bash
bun run bootstrap
```

### 4. Start Development

```bash
bun run dev
```

**Open:** http://localhost:5173

**Login:**
- Username: `admin`
- Password: `admin123` (atau dari `.env`)

---

## 📦 Commands

### Development

```bash
bun run dev          # Start dev server (http://localhost:5173)
bun run build        # Build for production
bun run preview      # Preview production build
```

### Database

```bash
bun run bootstrap    # Initialize database + create admin
bun run db:push      # Push schema to database
bun run db:studio    # Open Drizzle Studio
bun run backup       # Backup database
```

### Testing

```bash
bun run test:unit    # Unit tests
bun run test:e2e     # E2E tests
bun run test         # All tests
```

### Production

```bash
bun run build        # Build
bun run start        # Start (production)
# or
node build           # Start with Node.js
```

---

## 📁 Project Structure

```
amaliah/
├── src/
│   ├── lib/              # Components, stores, utils
│   ├── routes/           # Pages + API routes
│   └── hooks.server.ts   # Auth middleware
├── static/               # PWA assets
├── scripts/              # Bootstrap, backup, deploy
├── docs/                 # Documentation
└── drizzle/              # Database migrations
```

---

## 🎯 Features

### Siswa
- ✏️ Catat amaliah harian
- ✍️ Parent verification
- 📊 Rekap progress

### Wali Kelas
- ✅ Verifikasi siswa
- 📝 Cek paraf orang tua
- 📈 Rekap kelas

### Admin
- 🏠 Dashboard statistics
- 👥 User management
- 🏫 Class management

---

## 🔧 Configuration

### Environment Variables

Edit `.env`:

```env
NODE_ENV=development
PORT=3010
DATABASE_URL=local.db
JWT_SECRET=your-secret-key
BOOTSTRAP_ADMIN_PASSWORD=admin123
```

---

## 🐛 Troubleshooting

### Port already in use

```bash
# Change PORT in .env
PORT=3011
```

### Database errors

```bash
# Reset database
rm local.db
bun run bootstrap
```

### Dependencies issues

```bash
# Clean install
rm -rf node_modules bun.lock
bun install
```

---

## 📚 Documentation

- [README.md](README.md) - Complete documentation
- [DEPLOYMENT.md](docs/DEPLOYMENT.md) - Production deployment
- [TESTING_CHECKLIST.md](docs/TESTING_CHECKLIST.md) - Testing guide
- [MIGRATION_GUIDE.md](docs/MIGRATION_GUIDE.md) - Migration from React

---

## 📞 Support

**For issues:**
- 📖 Check documentation
- 🐛 Report bugs via GitHub Issues

---

**🌙 Selamat Menunaikan Ibadah Puasa!**

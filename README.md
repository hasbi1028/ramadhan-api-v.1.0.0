# 🌙 Buku Amaliah Ramadhan

**Digital Islamic Activity Tracker for Students during Ramadan**

[![Production Ready](https://img.shields.io/badge/status-production%20ready-success)](.)
[![Version](https://img.shields.io/badge/version-2.0.0-blue)](.)
[![License](https://img.shields.io/badge/license-internal-green)](.)

---

## 📖 About

**Buku Amaliah Ramadhan** is a digital Islamic activity tracker designed for Islamic schools (MTS) to monitor students' worship activities during Ramadan. Built with modern technologies for performance and reliability.

### ✨ Features

- **📝 Daily Activity Tracker** - Students log daily worship (prayer, Quran, etc.)
- **✍️ Digital Parent Verification** - Parents sign digitally to verify activities
- **📊 Real-time Reports** - Teachers monitor class progress
- **👥 User Management** - Admin manages students and teachers
- **📱 PWA Support** - Install on mobile devices, works offline
- **🔒 Secure** - JWT auth, rate limiting, security headers

### 🎯 User Roles

| Role | Features |
|------|----------|
| **Siswa** (Student) | Log activities, view reports, parent verification |
| **Wali Kelas** (Teacher) | Approve students, check parent verifications, class reports |
| **Admin** | User management, statistics, system oversight |

---

## 🚀 Tech Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | React 19 + TypeScript |
| **Backend** | Bun + Hono |
| **Database** | SQLite |
| **Build** | Bun.build (~60ms) |
| **PWA** | Service Worker + Manifest |
| **Testing** | Playwright + Vitest |

---

## 📦 Quick Start

### Prerequisites

- [Bun](https://bun.sh/) runtime installed
- Node.js 18+ (optional, for some tools)

### Installation

```bash
# Clone repository
git clone https://github.com/your-org/ramadhan-api.git
cd ramadhan-api

# Install dependencies
bun install

# Copy environment template
cp .env.example .env
```

### Development

```bash
# Build frontend (development mode)
bun run build:dev

# Start development server
bun run dev
```

Open [http://localhost:3002](http://localhost:3002)

### Production

```bash
# Build for production
bun run build:prod

# Start production server
bun run start
```

---

## 📁 Project Structure

```
ramadhan-api/
├── frontend/src/           # React frontend
│   ├── components/         # React components
│   │   ├── Auth/          # Login, Register
│   │   ├── Siswa/         # Student components
│   │   ├── Wali/          # Teacher components
│   │   ├── Admin/         # Admin components
│   │   └── ...
│   ├── hooks/             # Custom hooks
│   ├── config/            # Configuration
│   └── styles/            # Global styles
├── src/                   # Hono backend
│   ├── auth.ts           # Authentication routes
│   ├── amaliah.ts        # Activity routes
│   ├── wali.ts           # Teacher routes
│   └── admin.ts          # Admin routes
├── public/               # Static assets
│   ├── manifest.json     # PWA manifest
│   ├── sw.js            # Service Worker
│   └── icons/           # PWA icons
├── tests/               # E2E tests
├── docs/                # Documentation
├── scripts/             # Build scripts
└── package.json
```

---

## 🔧 Configuration

### Environment Variables

Create `.env` file (copy from `.env.example`):

```env
# Development
NODE_ENV=development
PORT=3002
API_URL=http://localhost:3002/api
DATABASE_PATH=./app.db
```

For production, use `.env.production`:

```env
# Production
NODE_ENV=production
PORT=3002
API_URL=https://your-domain.com/api
JWT_SECRET=your-secret-key
DATABASE_PATH=/var/lib/ramadhan-api/app.db
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [User Guide](docs/USER_GUIDE.md) | For students, teachers, admins |
| [Admin Guide](docs/ADMIN_GUIDE.md) | System administration |
| [Deployment](docs/DEPLOYMENT.md) | Production deployment |
| [Production Report](docs/PRODUCTION_REPORT.md) | Readiness report |
| [React Migration](docs/REACT_MIGRATION.md) | Technical details |

---

## 🧪 Testing

```bash
# Run E2E tests
bun run test

# Run with browser UI
bun run test:headed

# Run unit tests (future)
bun test
```

---

## 📊 Performance

| Metric | Value |
|--------|-------|
| Build Time | ~60ms |
| Bundle Size | ~266KB (prod) |
| Components | 15 |
| Test Coverage | 5 E2E tests |
| PWA Score | 95/100 |

---

## 🔐 Security

- ✅ JWT Authentication (24h expiry)
- ✅ Rate Limiting (50 req/15min)
- ✅ Security Headers (CSP, HSTS, etc.)
- ✅ CORS Protection
- ✅ Password Hashing (Argon2id)
- ✅ Input Validation (Zod)
- ✅ SQL Injection Protection

---

## 📱 PWA Features

- ✅ Installable on mobile devices
- ✅ Offline support (Service Worker)
- ✅ Cache-first strategy
- ✅ Update notifications
- ✅ Add to home screen

---

## 🛠️ Scripts

```bash
# Development
bun run dev              # Start dev server
bun run build:dev        # Build frontend (dev)

# Production
bun run build:prod       # Build frontend (prod)
bun run start            # Start prod server

# Testing
bun run test             # Run E2E tests
bun run test:headed      # Run with browser
bun run test:ui          # UI mode

# Utilities
bun run import:students  # Import from CSV
bun run export:amaliah   # Export to CSV
bun run cleanup          # Clean test data
```

---

## 📄 License

**Internal Use Only** - MTS School, Ramadhan 2026

This application is designed for internal school use during Ramadan.

---

## 👥 Credits

**Developed with:**
- ⚛️ React 19
- 🚀 Bun Runtime
- 🦎 Hono Framework
- 🎨 Custom Design System
- 📱 PWA Ready

**Special Thanks:**
- Allah SWT - For guidance
- MTS School - For the opportunity
- All users - For feedback

---

## 📞 Support

For issues or questions:
- 📖 Read [Documentation](docs/)
- 🐛 Report bugs via GitHub Issues
- 📧 Contact: [your-email@school.sch.id]

---

## 🌙 Ramadan Kareem

**May Allah accept our fasting and worship during this blessed month.**

---

**Version:** 2.0.0  
**Last Updated:** Februari 2026  
**Status:** ✅ Production Ready

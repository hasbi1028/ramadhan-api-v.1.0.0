# 🌙 Buku Amaliah Ramadhan - SvelteKit Version

**Digital Islamic Activity Tracker for Students during Ramadan**

[![Development](https://img.shields.io/badge/status-development-blue)](.)
[![Version](https://img.shields.io/badge/version-3.0.0-blue)](.)
[![Svelte](https://img.shields.io/badge/SvelteKit-2-orange)](.)
[![License](https://img.shields.io/badge/license-internal-green)](.)

---

## 📖 About

**Buku Amaliah Ramadhan** is a digital Islamic activity tracker designed for Islamic schools (MTS) to monitor students' worship activities during Ramadan. Built with **SvelteKit 2** and **Drizzle ORM** for modern performance and type safety.

### ✨ Features

- **📝 Daily Activity Tracker** - Students log daily worship (prayer, Quran, etc.)
- **✍️ Digital Parent Verification** - Parents sign digitally to verify activities
- **📊 Real-time Reports** - Teachers monitor class progress
- **👥 User Management** - Admin manages students and teachers
- **📱 PWA Support** - Install on mobile devices, works offline
- **🔒 Secure** - JWT auth, argon2 password hashing, validation

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
| **Frontend** | SvelteKit 2 + Svelte 5 |
| **Backend** | SvelteKit API Routes |
| **Database** | SQLite + Drizzle ORM |
| **Build** | Vite 7 |
| **PWA** | Service Worker + Manifest |
| **Testing** | Playwright + Vitest |

---

## 📦 Quick Start

### Prerequisites

- Node.js 18+ or Bun runtime
- SQLite (usually included)

### Installation

```bash
# Clone repository
cd amaliah

# Install dependencies
bun install
# or
npm install

# Copy environment template
cp .env.example .env
```

### Development

```bash
# Start development server
bun run dev
# or
npm run dev

# Open browser
http://localhost:5173
```

### Production

```bash
# Build for production
bun run build
# or
npm run build

# Start production server
bun run start
# or
node build
```

---

## 📁 Project Structure

```
amaliah/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── Admin/         # Admin components
│   │   │   ├── Auth/          # Login, Register
│   │   │   ├── Profile/       # Profile page
│   │   │   ├── Siswa/         # Student components
│   │   │   ├── Wali/          # Teacher components
│   │   │   ├── Skeleton.svelte
│   │   │   └── Toast.svelte
│   │   ├── server/
│   │   │   └── db/
│   │   │       ├── index.ts   # Database connection
│   │   │       └── schema.ts  # Drizzle schema
│   │   ├── stores/
│   │   │   ├── auth.store.ts  # Auth state
│   │   │   └── toast.store.ts # Toast notifications
│   │   └── utils/
│   │       ├── api.ts         # API client
│   │       └── env.ts         # Environment config
│   ├── routes/
│   │   ├── api/
│   │   │   ├── auth/          # Auth endpoints
│   │   │   ├── amaliah/       # Activity endpoints
│   │   │   ├── wali/          # Teacher endpoints
│   │   │   └── admin/         # Admin endpoints
│   │   ├── +layout.svelte     # Root layout
│   │   └── +page.svelte       # Main app page
│   ├── app.css                # Global styles
│   ├── app.d.ts               # TypeScript declarations
│   ├── app.html               # HTML template
│   └── hooks.server.ts        # Server hooks (auth)
├── static/
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service worker
│   └── icons/                 # PWA icons
├── tests/
│   └── e2e/                   # E2E tests
├── .env.example
├── drizzle.config.ts
├── package.json
├── playwright.config.ts
├── svelte.config.js
└── vite.config.ts
```

---

## 🔧 Configuration

### Environment Variables

Create `.env` file (copy from `.env.example`):

```env
# Development
NODE_ENV=development
PORT=3010

# Database
DATABASE_URL=local.db

# JWT Configuration
JWT_SECRET=your-secret-key-here
JWT_EXPIRY=24h

# Bootstrap Admin
BOOTSTRAP_ADMIN_USERNAME=admin
BOOTSTRAP_ADMIN_PASSWORD=your-admin-password
BOOTSTRAP_ADMIN_NAME=Administrator

# CORS
ALLOWED_ORIGINS=http://localhost:3010

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 📚 Database Schema

### Users Table
- `id` - Primary key
- `name` - User full name
- `username` - Unique username
- `password` - Hashed password (argon2id)
- `role` - admin | wali_kelas | siswa
- `kelas` - Class name (for students/teachers)
- `verified` - 0: pending, 1: approved, 2: rejected
- `rejected_reason` - Reason for rejection
- `must_change_password` - Force password change

### Amaliah Table
- `user_id` - Foreign key to users
- `day` - Day of Ramadan (1-30)
- `checks` - JSON of completed activities
- `pages` - Quran pages read
- `catatan` - Notes
- `tema_tarawih` - Tarawih lecture theme
- `tema_kultum_subuh` - Subuh lecture theme
- `parent_verified` - Parent verification status
- `parent_name` - Parent name
- `parent_signature` - Digital signature
- `parent_verified_at` - Verification timestamp

### Classes Table
- `id` - Primary key
- `name` - Class name
- `is_active` - Active status
- `created_at` / `updated_at` - Timestamps

---

## 🧪 Testing

```bash
# Run unit tests
bun run test:unit

# Run E2E tests
bun run test:e2e

# Run all tests
bun run test
```

---

## 📊 Features Comparison

| Feature | React Version | SvelteKit Version |
|---------|--------------|-------------------|
| Framework | React 19 | Svelte 5 |
| Backend | Hono | SvelteKit API |
| Database | Raw SQLite | Drizzle ORM |
| Build Tool | Bun.build | Vite 7 |
| Runtime | Bun | Node.js |
| Bundle Size | ~266KB | ~150KB (estimated) |
| Type Safety | Good | Excellent (Drizzle) |

---

## 🔐 Security Features

- ✅ JWT Authentication (24h expiry)
- ✅ Password Hashing (Argon2id)
- ✅ Input Validation (Zod)
- ✅ CORS Protection
- ✅ SQL Injection Protection (Drizzle ORM)
- ✅ Environment Variables

---

## 📱 PWA Features

- ✅ Installable on mobile devices
- ✅ Offline support (Service Worker)
- ✅ Cache-first strategy
- ✅ Add to home screen
- ✅ Standalone mode

---

## 🛠️ Scripts

```bash
# Development
bun run dev              # Start dev server
bun run build            # Build for production

# Testing
bun run test:unit        # Unit tests
bun run test:e2e         # E2E tests
bun run test             # All tests

# Database
bun run db:push          # Push schema to database
bun run db:generate      # Generate migrations
bun run db:migrate       # Run migrations
bun run db:studio        # Open Drizzle Studio
```

---

## 📄 License

**Internal Use Only** - MTS School, Ramadhan 2026

This application is designed for internal school use during Ramadan.

---

## 👥 Credits

**Developed with:**
- ⚛️ Svelte 5 + SvelteKit 2
- 🗄️ Drizzle ORM + SQLite
- 🦎 Hono (previous version)
- 🎨 Custom Design System
- 📱 PWA Ready

**Special Thanks:**
- Allah SWT - For guidance
- MTS School - For the opportunity
- All users - For feedback

---

## 📞 Support

For issues or questions:
- 📖 Read Documentation (this file)
- 🐛 Report bugs via GitHub Issues
- 📧 Contact: [your-email@school.sch.id]

---

## 🌙 Ramadan Kareem

**May Allah accept our fasting and worship during this blessed month.**

---

**Version:** 3.0.0 (SvelteKit)
**Last Updated:** Februari 2026
**Status:** 🚧 In Development

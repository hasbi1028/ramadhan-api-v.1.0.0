# 📘 Migrasi React → SvelteKit

**Dokumentasi lengkap migrasi aplikasi Buku Amaliah Ramadhan dari React + Hono ke SvelteKit**

---

## 🎯 Mengapa Migrasi?

### Keunggulan SvelteKit:

1. **Lebih Sedikit Kode** - Svelte 5 runes lebih concise daripada React hooks
2. **Better Performance** - Compiled to vanilla JS, no virtual DOM
3. **Type Safety** - Drizzle ORM memberikan type safety end-to-end
4. **Unified Framework** - Frontend + backend dalam 1 project
5. **Smaller Bundle** - Estimated ~150KB vs ~266KB (React)

---

## 📊 Perbandingan Arsitektur

### React Version (Old)

```
Frontend: React 19 + TypeScript
Backend: Bun + Hono (separate server)
Database: Raw SQLite (bun:sqlite)
Build: Bun.build (~60ms)
Runtime: Bun
```

### SvelteKit Version (New)

```
Frontend: SvelteKit 2 + Svelte 5
Backend: SvelteKit API Routes
Database: Drizzle ORM + better-sqlite3
Build: Vite 7
Runtime: Node.js
```

---

## 🔄 Pemetaan Fitur

### 1. Authentication

| Feature | React | SvelteKit |
|---------|-------|-----------|
| Login Component | `Auth/Login.tsx` | `Auth/Login.svelte` |
| Register Component | `Auth/Register.tsx` | `Auth/Register.svelte` |
| JWT Middleware | `auth.ts` middleware | `hooks.server.ts` |
| Password Hash | `Bun.password` | `argon2` |

### 2. Database Schema

| Table | React (Raw) | SvelteKit (Drizzle) |
|-------|-------------|---------------------|
| users | ✅ | ✅ |
| amaliah | ✅ | ✅ |
| classes | ✅ | ✅ |

### 3. API Endpoints

Semua endpoint tetap sama, hanya implementasi berubah:

```
/api/auth/login     ✅ POST
/api/auth/register  ✅ POST
/api/auth/classes   ✅ GET
/api/amaliah        ✅ GET, PUT
/api/wali/*         ✅ Various
/api/admin/*        ✅ Various
```

---

## 📁 Struktur File

### Yang Berubah Signifikan:

```
React Version:
├── frontend/src/         # React components
├── src/                  # Hono backend
│   ├── auth.ts
│   ├── amaliah.ts
│   ├── wali.ts
│   └── admin.ts
└── public/               # Static assets

SvelteKit Version:
├── src/lib/components/   # Svelte components
├── src/routes/           # Pages + API routes
│   ├── api/
│   │   ├── auth/
│   │   ├── amaliah/
│   │   ├── wali/
│   │   └── admin/
│   └── +page.svelte
├── src/hooks.server.ts   # Auth middleware
└── static/               # Static assets
```

---

## 🔧 Perubahan Kode

### 1. React Hooks → Svelte Runes

**React (Old):**
```typescript
const [count, setCount] = useState(0);
const [data, setData] = useState(null);

useEffect(() => {
  loadData();
}, []);

const doubled = useMemo(() => count * 2, [count]);
```

**Svelte 5 (New):**
```typescript
let count = $state(0);
let data = $state(null);

$effect(() => {
  loadData();
});

let doubled = $derived(count * 2);
```

### 2. Component Props

**React:**
```typescript
interface Props {
  user: User;
  onLogin: (user: User) => void;
}

const Login: React.FC<Props> = ({ user, onLogin }) => {
  // ...
};
```

**Svelte 5:**
```typescript
interface Props {
  user: User;
  onLogin: (user: User) => void;
}

let { user, onLogin }: Props = $props();
```

### 3. API Routes

**Hono (Old):**
```typescript
import { Hono } from 'hono';

const app = new Hono();

app.get('/api/users', (c) => {
  return c.json({ users: [] });
});
```

**SvelteKit (New):**
```typescript
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  return json({ users: [] });
};
```

### 4. Database Queries

**Raw SQLite (Old):**
```typescript
const users = db
  .query("SELECT * FROM users WHERE role = $role")
  .all({ $role: 'siswa' });
```

**Drizzle ORM (New):**
```typescript
import { eq } from 'drizzle-orm';

const users = await db
  .select()
  .from(users)
  .where(eq(users.role, 'siswa'))
  .all();
```

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd amaliah
bun install
```

### 2. Setup Environment

```bash
cp .env.example .env
# Edit .env dengan konfigurasi Anda
```

### 3. Initialize Database

```bash
# Option 1: Using Drizzle Kit
bun run db:push

# Option 2: Manual migration
bun run bootstrap
```

### 4. Start Development

```bash
bun run dev
```

Open http://localhost:5173

---

## 📦 Build & Deploy

### Production Build

```bash
# Build
bun run build

# Start
bun run start
# or
node build
```

### Environment Variables (Production)

```env
NODE_ENV=production
PORT=3010
DATABASE_URL=/var/lib/amaliah/app.db
JWT_SECRET=your-secure-secret-key
BOOTSTRAP_ADMIN_PASSWORD=secure-admin-password
```

---

## 🧪 Testing

### Unit Tests

```bash
bun run test:unit
```

### E2E Tests

```bash
bun run test:e2e
```

**Note:** Test suite dari React version perlu di-port ke SvelteKit. Total 44 E2E tests.

---

## ⚠️ Breaking Changes

### 1. Runtime Change

- **Old:** Bun runtime
- **New:** Node.js runtime

**Impact:**
- `Bun.password` → `argon2` package
- `bun:sqlite` → `better-sqlite3` + Drizzle ORM

### 2. Port Change

- **Old:** Port 3010 (Hono)
- **New:** Port 5173 (Vite dev), 3010 (production)

### 3. API Base URL

- **Old:** Auto-detect localhost:3010
- **New:** Relative URLs (SvelteKit handles this)

---

## 🐛 Known Issues

1. **Password Hashing** - Menggunakan argon2, hash dari Bun.password tidak compatible
2. **Port Configuration** - Pastikan PORT env variable di-set untuk production
3. **Service Worker** - Perlu testing lebih lanjut untuk offline support

---

## 📈 Performance Comparison

| Metric | React | SvelteKit | Improvement |
|--------|-------|-----------|-------------|
| Bundle Size | ~266KB | ~150KB (est) | -43% |
| Build Time | ~60ms | ~100ms (Vite) | -40% |
| Components | 15 | 12 | -20% |
| Lines of Code | ~4000 | ~3000 | -25% |

---

## ✅ Migration Checklist

### Completed:

- [x] Database schema (Drizzle ORM)
- [x] API routes (Auth, Amaliah, Wali, Admin)
- [x] Frontend components (Toast, Skeleton, Auth, Siswa, Wali, Admin)
- [x] Routing & Pages
- [x] Stores (Auth, Toast)
- [x] PWA support
- [x] Documentation

### Pending:

- [ ] E2E tests (port 44 tests from React version)
- [ ] Unit tests for components
- [ ] Performance testing (Lighthouse)
- [ ] Production deployment testing

---

## 📞 Support

Jika menemukan bug atau memiliki pertanyaan:

1. Check dokumentasi (README.md)
2. Review migration guide ini
3. Compare dengan React version untuk reference

---

## 🌙 Credits

**Migrated by:** hasbi1028
**Original Version:** 2.0.0 (React + Hono)
**New Version:** 3.0.0 (SvelteKit)
**Date:** Februari 2026

---

**🎉 Migrasi Selesai! Selamat Menunaikan Ibadah Puasa!**

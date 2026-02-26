# ⚛️ React Migration Guide - Bun + Hono

**Versi:** 2.0.0  
**Status:** 🚧 In Progress (Auth Working!)  
**Last Update:** Februari 2026

---

## 🎉 What's New in v2.0

### **React Frontend with Bun Build!**

- ✅ **Auth System** - Login & Register working
- ✅ **Environment Config** - Auto-detect API URL
- ✅ **Bun Build** - Super fast, native bundling
- ✅ **Type Safety** - Full TypeScript support
- ✅ **Component-Based** - Easy to maintain & extend

---

## 🚀 Quick Start

### **Development**

```bash
# Install dependencies
bun install

# Run development (backend + auto-reload)
bun run dev

# Build frontend (if needed)
bun run build:dev

# Open browser
http://localhost:3010
```

### **Production Build**

```bash
# Build for production
bun run build:prod

# Start server
bun run start

# Or with cloudflared tunnel
cloudflared tunnel run <tunnel-name>
```

---

## 📁 Project Structure

```
ramadhan-api/
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   │   ├── Auth/
│   │   │   │   ├── Login.tsx ✅
│   │   │   │   └── Register.tsx ✅
│   │   │   ├── Siswa/    # TODO
│   │   │   ├── Wali/     # TODO
│   │   │   └── Admin/    # TODO
│   │   ├── hooks/        # Custom hooks
│   │   ├── config/
│   │   │   └── env.ts    # Environment config
│   │   ├── styles/
│   │   │   └── global.css
│   │   ├── App.tsx       # Main component
│   │   └── index.tsx     # Entry point
│   └── public/
│       └── index.html    # HTML template
├── src/                  # Hono backend
│   └── index.ts
├── scripts/
│   └── build-frontend.ts # Bun build script
├── public/               # Built frontend (generated)
├── .env                  # Environment variables
├── .env.example          # Template
└── package.json
```

---

## 🔧 Environment Variables

### **Development (.env)**
```env
API_URL=http://localhost:3010/api
NODE_ENV=development
PORT=3010
```

### **Production (.env)**
```env
API_URL=https://amaliah-ramadhan.mtsn2kolut.sch.id/api
NODE_ENV=production
PORT=3010
```

### **Auto-Detect (No .env)**
Frontend automatically detects API URL:
- `localhost:3010` → `http://localhost:3010/api`
- `*.mtsn2kolut.sch.id` → `https://amaliah-ramadhan.mtsn2kolut.sch.id/api`
- Other → Auto-detect from hostname

---

## 📦 Available Scripts

```bash
# Development
bun run dev              # Start backend with hot-reload
bun run build:dev        # Build frontend (dev mode)

# Production
bun run build:prod       # Build frontend (production)
bun run start            # Start production server

# Testing
bun run test             # Run E2E tests
bun run test:ui          # Run tests with UI

# Utilities
bun run import:students  # Import from CSV
bun run export:amaliah   # Export data to CSV
bun run cleanup          # Remove test data
```

---

## 🎨 Component Migration Status

### **✅ Completed**
- [x] Login Component
- [x] Register Component
- [x] Auth State Management
- [x] Environment Config
- [x] Build System

### **🚧 In Progress**
- [ ] Siswa: Catat (Daily Activities)
- [ ] Siswa: Rekap (Summary)
- [ ] Siswa: Profil
- [ ] Wali: Verifikasi (Student Approval)
- [ ] Wali: Cek Paraf (Parent Verification Check)
- [ ] Admin: Dashboard
- [ ] Admin: User Management

### **📋 TODO Priority**

**Week 1: Core Features**
1. [ ] Siswa Catat page
2. [ ] Parent verification UI
3. [ ] Rekap view

**Week 2: Admin Features**
4. [ ] Wali verification page
5. [ ] Admin dashboard
6. [ ] User management

**Week 3: Polish**
7. [ ] Error boundaries
8. [ ] Loading states
9. [ ] Toast notifications
10. [ ] Full E2E testing

---

## 🔌 API Integration

### **Login Example**
```typescript
import { API_URL } from './config/env';

const response = await fetch(`${API_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password }),
});

const data = await response.json();
// data.user, data.token
```

### **Protected API Call**
```typescript
const token = localStorage.getItem('rm_token');

const response = await fetch(`${API_URL}/amaliah`, {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

---

## 🛠️ Build System

### **How It Works**

1. **Bun.build()** compiles React → JavaScript
2. **Minification** for production (smaller bundle)
3. **Environment variables** injected at build time
4. **Output** to `public/react/` folder
5. **Hono backend** serves static files

### **Build Output**

```
public/
├── index.html           # HTML template
└── react/
    ├── index.js         # React app bundle
    └── ...              # Chunks (if splitting)
```

### **Bundle Size**

- **Development:** ~2.5 MB (with sourcemaps)
- **Production:** ~150 KB (minified, gzipped)
- **React:** ~40 KB (production build)

---

## 🎯 Migration Guide (Vanilla → React)

### **Before (Vanilla)**
```javascript
// public/index.html (3000+ lines)
const API = 'http://localhost:3010/api';

async function doLogin() {
  const response = await fetch(API + '/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  // ...
}
```

### **After (React)**
```typescript
// frontend/src/components/Auth/Login.tsx
import { API_URL } from '../../config/env';

const handleSubmit = async (e: FormEvent) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  // ...
}
```

**Benefits:**
- ✅ Type safety
- ✅ Component reusability
- ✅ Better state management
- ✅ Easier to test
- ✅ Auto-detect API URL

---

## 🆘 Troubleshooting

### **Build Failed**
```bash
# Clear cache
rm -rf public/react

# Rebuild
bun run build:prod
```

### **API URL Wrong**
```bash
# Check .env
cat .env

# Or delete .env for auto-detect
rm .env
bun run build:prod
```

### **Components Not Loading**
```bash
# Check build output
ls -lh public/react/

# Should have index.js
# If not, rebuild
bun run build:prod
```

---

## 📊 Comparison: v1 vs v2

| Aspect | v1 (Vanilla) | v2 (React) |
|--------|--------------|------------|
| **Lines of Code** | 3,000+ (single file) | ~500 (components) |
| **Build Time** | None | ~50ms (Bun) |
| **Bundle Size** | ~100 KB | ~150 KB (prod) |
| **Env Management** | Manual config.js | .env files |
| **Type Safety** | ❌ | ✅ TypeScript |
| **Hot Reload** | ❌ | ✅ (backend) |
| **Maintainability** | ⚠️ Hard | ✅ Easy |
| **Learning Curve** | ✅ Easy | ⚠️ Need React |

---

## 🚀 Next Steps

### **Immediate (This Week)**
1. ✅ Auth working
2. [ ] Migrate Siswa Catat page
3. [ ] Parent verification UI

### **Short Term (2 Weeks)**
4. [ ] Complete all Siswa pages
5. [ ] Complete Wali pages
6. [ ] E2E testing

### **Long Term (1 Month)**
7. [ ] Complete Admin panel
8. [ ] Performance optimization
9. [ ] PWA support (offline)
10. [ ] Mobile app (React Native?)

---

## 📞 Need Help?

**Documentation:**
- [React Docs](https://react.dev)
- [Bun Docs](https://bun.sh)
- [Hono Docs](https://hono.dev)

**Contact:**
- IT Team: [contact]
- GitHub Issues: [link]

---

**Happy Coding! 🎉**  
**Selamat menunaikan ibadah puasa!**

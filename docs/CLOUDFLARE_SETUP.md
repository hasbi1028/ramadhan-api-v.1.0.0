# 🌐 Setup Cloudflared Tunnel - Quick Guide

## ✅ Sudah Deploy? Ikuti Langkah Ini:

### 1. Update Frontend Config

File sudah dibuat:
- ✅ `public/config.js` - Production config (sudah diset ke domain Anda)
- ✅ `public/config.example.js` - Template

### 2. Cara Kerja

**Development (localhost):**
```javascript
// Auto-detect: http://localhost:3002/api
// Atau override di config.js
```

**Production (cloudflared):**
```javascript
// Auto-detect: https://amaliah-ramadhan.mtsn2kolut.sch.id/api
// Atau override di config.js (sudah diset)
```

### 3. Jika Masih Error

**Clear Browser Cache:**
```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

**Atau Hard Reload:**
1. Buka DevTools (F12)
2. Klik kanan tombol Refresh
3. Pilih "Empty Cache and Hard Reload"

### 4. Verify API URL

**Di Browser Console (F12):**
```javascript
// Cek API URL yang digunakan
console.log(API);

// Seharusnya menampilkan:
// "https://amaliah-ramadhan.mtsn2kolut.sch.id/api"
```

### 5. Test Endpoint

**Manual Test:**
```bash
curl https://amaliah-ramadhan.mtsn2kolut.sch.id/api/auth/me
```

**Expected:**
```json
{"error":"Unauthorized"}
```
(Artinya API sudah reachable, hanya perlu login)

---

## 🔧 Troubleshooting

### Error: "Failed to fetch"

**Penyebab:** API URL masih localhost

**Solusi:**
1. Clear cache browser
2. Hard reload (Ctrl+Shift+R)
3. Cek console (F12) untuk API URL

### Error: "CORS Policy"

**Penyebab:** Cloudflared tunnel belum route dengan benar

**Solusi:**
```bash
# Cek cloudflared config
cloudflared tunnel list
cloudflared tunnel routes <tunnel-name>
```

### Error: "404 Not Found"

**Penyebab:** Path API salah

**Solusi:**
Pastikan URL: `https://amaliah-ramadhan.mtsn2kolut.sch.id/api/...`
Bukan: `https://amaliah-ramadhan.mtsn2kolut.sch.id/...`

---

## 📝 File Structure

```
public/
├── config.js              # ✅ Production config (safe to modify)
├── config.example.js      # Template
├── index.html             # Main app (auto-detect API)
└── ...
```

---

## 🎯 Quick Commands

**Check if config loaded:**
```javascript
// Browser console
console.log(window.APP_CONFIG);
// Should show: { API: "https://..." }
```

**Test login:**
```javascript
// Browser console
fetch(API + '/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'admin123' })
}).then(r => r.json()).then(console.log);
```

---

**API sekarang seharusnya sudah benar! 🚀**

# 🎯 Quick Fix - API URL Error

## ✅ Masalah Sudah Diperbaiki!

### Yang Sudah Dilakukan:

1. ✅ **Auto-detect API URL** - Frontend sekarang detect domain otomatis
2. ✅ **Config File** - `public/config.js` sudah diset ke domain Anda
3. ✅ **Git Safe** - `config.js` tidak akan ter-commit

---

## 🔧 Cara Kerja

### Development (Local)
```
http://localhost:3002
↓ auto-detect
API: http://localhost:3002/api
```

### Production (Cloudflared)
```
https://amaliah-ramadhan.mtsn2kolut.sch.id
↓ auto-detect
API: https://amaliah-ramadhan.mtsn2kolut.sch.id/api
```

---

## 🚀 Next Steps

### 1. Clear Browser Cache

**PENTING!** Browser mungkin masih cache versi lama.

**Cara:**
```
Windows/Linux: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

Atau:
1. Buka DevTools (F12)
2. Klik kanan tombol Refresh
3. Pilih "Empty Cache and Hard Reload"

### 2. Verify API URL

**Buka Browser Console (F12):**
```javascript
// Ketik ini di console
console.log('API URL:', API);
```

**Expected output:**
```
API URL: https://amaliah-ramadhan.mtsn2kolut.sch.id/api
```

**Jika masih localhost:**
- Clear cache lagi
- Hard reload
- Restart browser

### 3. Test Login

**Coba login sebagai admin:**
- Username: `admin`
- Password: `admin123`

**Jika berhasil login:** ✅ API sudah connect!

---

## 🆘 Troubleshooting

### Error: "Failed to fetch" atau "Network Error"

**Penyebab:** API URL masih localhost

**Solusi:**
1. Clear cache (Ctrl+Shift+R)
2. Hard reload
3. Restart browser
4. Jika masih error, restart PC local server

### Masih Localhost?

**Check config.js:**
```javascript
// File: public/config.js
window.APP_CONFIG = {
  API: 'https://amaliah-ramadhan.mtsn2kolut.sch.id/api'
};
```

**Check index.html:**
Pastikan ada baris ini sebelum script utama:
```html
<script src="config.js"></script>
```

### Test Manual API

**Dari browser:**
```javascript
fetch('https://amaliah-ramadhan.mtsn2kolut.sch.id/api/auth/me')
  .then(r => r.json())
  .then(console.log);
```

**Expected:**
```json
{"error":"Unauthorized"}
```
(Artinya API reachable, hanya perlu login)

---

## 📝 File yang Diubah

| File | Status | Purpose |
|------|--------|---------|
| `public/index.html` | ✅ Updated | Auto-detect API URL |
| `public/config.js` | ✅ Created | Production config |
| `public/config.example.js` | ✅ Created | Template |
| `.gitignore` | ✅ Updated | Ignore config.js |
| `docs/CLOUDFLARE_SETUP.md` | ✅ Created | Setup guide |

---

## ✅ Checklist

- [ ] Clear browser cache
- [ ] Hard reload (Ctrl+Shift+R)
- [ ] Check API URL di console
- [ ] Test login
- [ ] Verify bisa akses data

---

**Jika masih ada masalah, screenshot error di console (F12) dan kirim ke tim IT! 🚀**

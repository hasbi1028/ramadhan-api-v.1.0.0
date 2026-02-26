# 🧪 Testing Checklist - Buku Amaliah Ramadhan

**Daftar testing lengkap untuk memastikan semua fitur berfungsi dengan baik**

---

## 📋 Pre-Testing Setup

### Environment
- [ ] Development server running (`bun run dev`)
- [ ] Database initialized (`bun run bootstrap`)
- [ ] Default admin user created
- [ ] Browser DevTools open for monitoring

### Test Accounts
```
Admin:
- Username: admin
- Password: (from .env)

Wali Kelas Test:
- Username: wali_test
- Password: test123
- Kelas: 7A

Siswa Test:
- Username: siswa_test
- Password: test123
- Kelas: 7A
```

---

## 🔐 Authentication Testing

### Login Flow
- [ ] Login dengan username & password valid
- [ ] Login dengan username salah (should fail)
- [ ] Login dengan password salah (should fail)
- [ ] Login dengan field kosong (should fail)
- [ ] Redirect setelah login berhasil
- [ ] Token tersimpan di localStorage
- [ ] User data tersimpan di localStorage

### Register Flow
- [ ] Register sebagai siswa
- [ ] Register sebagai wali kelas
- [ ] Register dengan username sudah ada (should fail)
- [ ] Register dengan password < 6 karakter (should fail)
- [ ] Register tanpa pilih kelas (should fail)
- [ ] Pesan sukses setelah register
- [ ] User status "pending" setelah register

### Logout
- [ ] Logout berhasil
- [ ] Token dihapus dari localStorage
- [ ] Redirect ke halaman login
- [ ] Tidak bisa akses halaman protected setelah logout

### Change Password
- [ ] Change password dengan password lama benar
- [ ] Change password dengan password lama salah (should fail)
- [ ] New password & confirm password tidak cocok (should fail)
- [ ] Password baru < 6 karakter (should fail)
- [ ] Success message setelah change password

---

## 👤 Profile Testing

### Update Profile
- [ ] Update nama
- [ ] Update dengan nama kosong (should fail)
- [ ] Profile data ter-update di header
- [ ] Success message muncul

### View Profile
- [ ] Nama tampil benar
- [ ] Username tampil benar
- [ ] Role tampil benar dengan icon
- [ ] Kelas tampil (jika ada)
- [ ] Status verifikasi tampil dengan badge

---

## 🎓 Siswa Features

### Catat Amaliah
- [ ] Pilih hari (1-30)
- [ ] Checklist sholat fardhu (5 items)
- [ ] Checklist ibadah sunnah (7 items)
- [ ] Checklist tadarus Al-Qur'an (3 items)
- [ ] Checklist akhlak & sosial (5 items)
- [ ] Input halaman Qur'an
- [ ] Input tema tarawih
- [ ] Input tema kultum subuh
- [ ] Input catatan harian
- [ ] Simpan data (button)
- [ ] Success message setelah simpan
- [ ] Data persist setelah refresh
- [ ] Poin total ter-calculate

### Parent Verification
- [ ] Input nama orang tua
- [ ] Verifikasi dengan nama (should work)
- [ ] Verifikasi tanpa nama (should fail)
- [ ] Badge "Terverifikasi" muncul setelah verifikasi
- [ ] Form locked setelah verifikasi
- [ ] Data tidak bisa diedit setelah verifikasi

### Rekap Amaliah
- [ ] Progress ring menampilkan persentase
- [ ] Stats cards (Hari Tercatat, Terverifikasi, Halaman Qur'an, Total Poin)
- [ ] List riwayat amaliah per hari
- [ ] Badge verified untuk hari yang sudah diverifikasi
- [ ] Badge pending untuk hari yang belum diverifikasi
- [ ] Empty state jika belum ada data
- [ ] Link "Catat Amaliah" dari empty state

---

## 👩‍🏫 Wali Kelas Features

### Verifikasi Siswa
- [ ] List siswa pending verifikasi
- [ ] Button "Terima" untuk approve
- [ ] Button "Tolak" untuk reject
- [ ] Siswa pindah dari pending ke approved setelah terima
- [ ] Siswa pindah dari pending ke rejected setelah tolak
- [ ] Success message setelah verifikasi
- [ ] List semua siswa dengan status badge
- [ ] Empty state jika tidak ada siswa pending

### Cek Paraf
- [ ] Pilih hari (1-30)
- [ ] Stats badges (Terverifikasi, Pending, Belum Isi, Total)
- [ ] List semua siswa dengan status verifikasi
- [ ] Nama orang tua tampil untuk yang sudah verifikasi
- [ ] Tanggal verifikasi tampil
- [ ] Button "Reset" untuk reset verifikasi
- [ ] Confirm dialog sebelum reset
- [ ] Success message setelah reset
- [ ] Sorting by status (verified first)

---

## 👑 Admin Features

### Dashboard
- [ ] Stats cards (Total Wali Kelas, Total Siswa, Pending, Halaman Qur'an)
- [ ] Quick actions (Kelola Wali Kelas, Kelola Siswa, Kelola Kelas)
- [ ] Info banner dengan nama admin
- [ ] Data stats akurat sesuai database

### Kelola Wali Kelas
- [ ] List semua wali kelas
- [ ] Badge status (Aktif, Pending, Ditolak)
- [ ] Button approve untuk pending
- [ ] Button reject untuk pending
- [ ] Button delete untuk wali kelas
- [ ] Confirm dialog sebelum delete
- [ ] Tidak bisa delete diri sendiri
- [ ] Success message setelah aksi

### Kelola Siswa
- [ ] List semua siswa
- [ ] Badge status (Aktif, Pending, Ditolak)
- [ ] Button approve untuk pending
- [ ] Button reject untuk pending
- [ ] Button delete untuk siswa
- [ ] Confirm dialog sebelum delete
- [ ] Success message setelah aksi

### Kelola Kelas
- [ ] List semua kelas aktif
- [ ] Form tambah kelas baru
- [ ] Validasi nama kelas kosong
- [ ] Validasi nama kelas duplikat
- [ ] Button edit untuk edit nama
- [ ] Button delete untuk hapus kelas
- [ ] Validasi kelas masih digunakan (should fail)
- [ ] Success message setelah aksi

---

## 📱 PWA Testing

### Installation
- [ ] Install prompt muncul di browser
- [ ] App ter-install di device
- [ ] App icon tampil benar
- [ ] App name tampil benar
- [ ] App membuka dalam standalone mode

### Offline Support
- [ ] App bisa diakses offline (setelah load pertama)
- [ ] Cached pages bisa diakses tanpa internet
- [ ] Error message jika akses uncached pages offline

### Mobile Optimization
- [ ] Responsive di mobile (320px)
- [ ] Responsive di tablet (768px)
- [ ] Responsive di desktop (1920px)
- [ ] Touch-friendly buttons
- [ ] No horizontal scroll

---

## 🔒 Security Testing

### Authentication
- [ ] Tidak bisa akses /api/* tanpa token
- [ ] Token expired handling
- [ ] Invalid token handling
- [ ] Role-based access control (siswa tidak bisa akses admin)

### Input Validation
- [ ] XSS prevention (input script tags)
- [ ] SQL injection prevention (input special characters)
- [ ] Required field validation
- [ ] Min length validation

### Session Management
- [ ] Session persist setelah refresh
- [ ] Session cleared setelah logout
- [ ] Multiple tabs sync session

---

## 🎨 UI/UX Testing

### Visual
- [ ] Semua icon emoji tampil benar
- [ ] Warna sesuai design (emerald, gold)
- [ ] Font readable
- [ ] Spacing konsisten
- [ ] Border radius konsisten

### Interactions
- [ ] Hover effects bekerja
- [ ] Loading states tampil
- [ ] Error messages tampil
- [ ] Success messages tampil
- [ ] Transitions smooth

### Accessibility
- [ ] Keyboard navigation bekerja
- [ ] Focus states visible
- [ ] ARIA labels ada
- [ ] Color contrast cukup

---

## 🚀 Performance Testing

### Load Time
- [ ] Initial load < 3s
- [ ] Route changes < 500ms
- [ ] API calls < 1s

### Bundle Size
- [ ] Main bundle < 200KB
- [ ] CSS < 50KB
- [ ] Images optimized

### Database
- [ ] Queries < 100ms
- [ ] No N+1 queries
- [ ] Indexes working

---

## 🐛 Bug Testing

### Edge Cases
- [ ] Hari 1 dan 30 (boundary)
- [ ] Input special characters
- [ ] Input sangat panjang
- [ ] Network error handling
- [ ] Database error handling
- [ ] Concurrent users

### Browser Compatibility
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (jika available)
- [ ] Mobile browsers

---

## 📊 Test Coverage Goals

| Area | Target | Status |
|------|--------|--------|
| Authentication | 100% | ⏳ Pending |
| Profile | 100% | ⏳ Pending |
| Siswa Features | 100% | ⏳ Pending |
| Wali Kelas Features | 100% | ⏳ Pending |
| Admin Features | 100% | ⏳ Pending |
| PWA | 95% | ⏳ Pending |
| Security | 100% | ⏳ Pending |
| UI/UX | 90% | ⏳ Pending |

---

## 📝 Testing Notes

### Issues Found
```
1. [Date] - [Severity] - Description
2. [Date] - [Severity] - Description
```

### Fixed Issues
```
1. [Date] - [Issue] - Fix description
```

---

## ✅ Sign-off

**Tested by:** _______________
**Date:** _______________
**Status:** ☐ Pass ☐ Fail
**Notes:** _______________

---

**🎉 Testing Complete! Selamat Menunaikan Ibadah Puasa!**

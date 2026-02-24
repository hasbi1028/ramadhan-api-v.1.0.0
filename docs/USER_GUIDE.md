# 📖 Buku Panduan Pengguna - Aplikasi Amaliah Ramadhan

**Versi:** 1.0.0  
**Update:** Februari 2026  
**Masa Penggunaan:** 1 Bulan (Ramadhan)

---

## 📋 Daftar Isi

1. [Pendahuluan](#pendahuluan)
2. [Akses Aplikasi](#akses-aplikasi)
3. [Panduan Siswa](#panduan-siswa)
4. [Panduan Wali Kelas](#panduan-wali-kelas)
5. [Panduan Admin](#panduan-admin)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Pendahuluan

Aplikasi **Buku Amaliah Ramadhan** adalah sistem digital untuk mencatat kegiatan ibadah harian siswa selama bulan Ramadhan. Aplikasi ini memungkinkan:

- **Siswa**: Mencatat kegiatan ibadah harian dengan verifikasi orang tua
- **Wali Kelas**: Memantau dan memverifikasi kegiatan siswa
- **Admin**: Mengelola pengguna dan sistem

---

## 🔐 Akses Aplikasi

### URL Akses
```
https://ramadhan.mtsschool.sch.id
```

### Login Default

| Role | Username | Password | Keterangan |
|------|----------|----------|------------|
| Admin | `admin` | *(dari admin)* | Pengelola sistem |
| Wali Kelas | `wali7A` | *(dari admin)* | Wali kelas per kelas |
| Siswa | `[nis]` | *(dari admin)* | Siswa per kelas |

> ⚠️ **Penting:** Ganti password setelah login pertama kali!

---

## 👨‍🎓 Panduan Siswa

### 1. Login
1. Buka aplikasi di browser
2. Masukkan **Username** dan **Password**
3. Klik tombol **"Masuk"**

### 2. Mengisi Kegiatan Harian

#### Langkah 1: Pilih Hari
- Klik menu **"✏️ Catat"** (default)
- Pilih hari Ramadhan (1-30) dengan klik angka

#### Langkah 2: Isi Checklist Ibadah
Centang ibadah yang sudah dikerjakan:

**🕌 Sholat Fardhu:**
- Sholat Subuh (Berjamaah) - 3 poin
- Sholat Dzuhur - 2 poin
- Sholat Ashar - 2 poin
- Sholat Maghrib (Berjamaah) - 3 poin
- Sholat Isya (Berjamaah) - 3 poin

**🌙 Ibadah Sunnah:**
- Makan Sahur - 2 poin
- Berbuka tepat waktu - 2 poin
- Sholat Tarawih - 3 poin
- Sholat Witir - 2 poin
- Sholat Dhuha - 2 poin
- Sholat Tahajud - 3 poin
- Sholat Sunnah Rawatib - 2 poin

**📖 Tadarus Al-Qur'an:**
- Membaca Al-Qur'an - 3 poin
- Menghafal/Muraja'ah - 3 poin
- Dzikir Pagi & Petang - 2 poin

**❤️ Akhlak & Sosial:**
- Infaq / Sedekah - 3 poin
- Puasa Penuh (tidak batal) - 5 poin
- Menjaga Lisan & Perilaku - 3 poin
- Menyimak kajian/ceramah - 2 poin
- Berbakti kepada Orang Tua - 2 poin

#### Langkah 3: Isi Halaman Qur'an
- Masukkan jumlah halaman yang dibaca hari ini
- Contoh: `5`

#### Langkah 4: Catatan Harian (Opsional)
- Tulis refleksi atau doa hari ini
- Contoh: "Alhamdulillah hari ini bisa sholat tarawih lengkap"

#### Langkah 5: Verifikasi Orang Tua/Wali

**WAJIB diisi oleh Orang Tua/Wali:**

1. **Nama Orang Tua/Wali**
   - Isi dengan nama lengkap orang tua/wali
   - Contoh: "Ahmad Abdullah"

2. **Tanda Tangan**
   - Tanda tangan di kotak yang disediakan
   - Gunakan mouse (komputer) atau jari (tablet/HP)

3. **Klik "💾 Simpan Hari Ini"**
   - Data tersimpan dengan status "✅ Terverifikasi"

> ⚠️ **Penting:** Kegiatan belum sah tanpa verifikasi orang tua!

### 3. Melihat Rekap
1. Klik menu **"📊 Rekap"**
2. Lihat ringkasan ibadah:
   - Persentase ibadah terlaksana
   - Total hari tercatat
   - Total halaman Qur'an
   - Total ibadah selesai
   - Hari terbaik

### 4. Ganti Password
1. Klik menu **"👤 Profil"**
2. Isi password lama dan password baru
3. Klik **"Ganti Password"**

---

## 👨‍🏫 Panduan Wali Kelas

### 1. Login
- Sama seperti login siswa

### 2. Verifikasi Siswa Baru
1. Klik menu **"✅ Verifikasi"**
2. Lihat daftar siswa pending
3. Klik **"✓ Setujui"** untuk approve
4. Atau **"✗ Tolak"** dengan alasan

### 3. Cek Paraf Orang Tua (Monitoring Harian)

#### Fitur Baru! 🔥
1. Klik menu **"📝 Cek Paraf"**
2. Pilih hari yang ingin dicek (1-30)
3. Lihat status semua siswa:
   - **✅ Terverifikasi** - Sudah ada paraf orang tua
   - **⏳ Belum Paraf** - Sudah isi tapi belum diparaf
   - **📝 Belum Isi** - Belum ada data

#### Detail Per Siswa:
- Nama siswa
- Status verifikasi
- Nama orang tua yang memaraf
- Tanggal verifikasi
- Thumbnail tanda tangan (click untuk lihat besar)

#### Batalkan Verifikasi (Reset)
Jika ada kesalahan input:
1. Klik **"🔄 Batalkan Verifikasi"** pada siswa
2. Konfirmasi pembatalan
3. Siswa bisa isi ulang hari tersebut

### 4. Rekap Kelas
1. Klik menu **"📊 Rekap Kelas"**
2. Lihat ringkasan semua siswa:
   - Nama siswa
   - Hari tercatat
   - Total halaman Qur'an
   - Progress bar persentase

### 5. Ganti Password
- Sama seperti siswa

---

## 👤 Panduan Admin

### 1. Dashboard
1. Klik menu **"🏠 Dashboard"**
2. Lihat statistik:
   - Total wali kelas
   - Total siswa
   - Pending wali kelas
   - Total halaman Qur'an (semua siswa)

### 2. Kelola Wali Kelas
1. Klik menu **"👩‍🏫 Wali Kelas"**
2. Lihat semua wali kelas:
   - Status: ✅ Terverifikasi | ⏳ Pending | ❌ Ditolak
3. **Approve Wali Kelas Baru:**
   - Klik **"✓ Setujui"**
4. **Tolak Wali Kelas:**
   - Klik **"✗ Tolak"**
   - Isi alasan penolakan
5. **Hapus Wali Kelas:**
   - Klik ikon **"🗑"**

### 3. Kelola Siswa
1. Klik menu **"🎓 Siswa"**
2. Lihat semua siswa berdasarkan kelas
3. **Hapus Siswa:**
   - Klik ikon **"🗑"**
   - Tidak bisa hapus diri sendiri

### 4. Profil Admin
1. Klik menu **"👤 Profil"**
2. Lihat informasi admin
3. Ganti password

---

## 🔧 Troubleshooting

### Masalah Login

| Masalah | Solusi |
|---------|--------|
| Username/password salah | Pastikan Caps Lock tidak aktif |
| Lupa password | Hubungi admin untuk reset |
| Akun belum diverifikasi | Tunggu admin/wali kelas approve |
| Akun ditolak | Lihat alasan penolakan, daftar ulang |

### Masalah Pengisian Kegiatan

| Masalah | Solusi |
|---------|--------|
| Tidak bisa pilih hari | Refresh halaman (F5) |
| Checklist tidak bisa diclick | Pastikan sudah login sebagai siswa |
| Tidak bisa simpan | Pastikan nama ortu + TTD sudah diisi |
| Status tetap "Belum Verifikasi" | Pastikan TTD sudah digambar |

### Masalah Verifikasi (Wali Kelas)

| Masalah | Solusi |
|---------|--------|
| Tidak ada siswa pending | Semua sudah diverifikasi |
| Tidak bisa approve siswa | Pastikan siswa dari kelas Anda |
| Tombol tidak berfungsi | Refresh halaman |

### Masalah Teknis

| Masalah | Solusi |
|---------|--------|
| Halaman tidak muncul | Cek koneksi internet |
| Error 500 | Hubungi admin |
| Loading terus | Refresh halaman (F5) |
| Tampilan rusak | Clear cache browser (Ctrl+Shift+R) |

---

## 📞 Kontak Bantuan

Jika mengalami masalah, hubungi:

| Role | Kontak |
|------|--------|
| **Admin IT** | [Nomor HP/WA] |
| **Wali Kelas** | [Nomor HP/WA] |
| **Email Support** | [email] |

---

## ⏰ Jadwal Operasional

Aplikasi aktif selama **1 bulan penuh** di bulan Ramadhan.

**Setelah Ramadhan:**
- Data akan di-export
- Aplikasi di-arsipkan
- Sertifikat bisa dicetak dari data

---

## 📱 Rekomendasi Perangkat

**Minimum:**
- Smartphone dengan browser (Chrome/Firefox)
- Tablet
- Laptop/PC

**Browser yang Didukung:**
- ✅ Google Chrome (Recommended)
- ✅ Mozilla Firefox
- ✅ Safari (iOS)
- ✅ Microsoft Edge

**Tidak Didukung:**
- ❌ Internet Explorer

---

**Selamat Menunaikan Ibadah Puasa! 🌙**  
**Semoga amal ibadah kita diterima Allah SWT.**

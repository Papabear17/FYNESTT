# FYNEST Website - Panduan Penggunaan

## 🚀 Cara Menjalankan Website

### Untuk User (Pengunjung Website)

**Klik 2x file: `START_WEBSITE.bat`**

Script ini akan:
1. ✅ Otomatis start server di port 3001
2. ✅ Tunggu 2 detik server siap
3. ✅ Buka website di browser otomatis
4. ✅ Server tetap running di background

**Cara Menutup:**
- Tutup window "FYNEST Server" yang muncul
- Atau jalankan `STOP_SERVER.bat`

---

### Untuk Admin

**Klik 2x file: `START_ADMIN.bat`**

Script ini akan:
1. ✅ Cek apakah server sudah running
2. ✅ Jika belum, start server otomatis
3. ✅ Jika sudah, langsung buka Admin Panel
4. ✅ Buka Admin Panel di browser

**Login Credentials:**
- Username: `wili`
- Password: `wiliam`

---

## 🛑 Cara Stop Server

**Klik 2x file: `STOP_SERVER.bat`**

Script ini akan:
1. ✅ Cari process yang pakai port 3001
2. ✅ Kill process tersebut
3. ✅ Server mati otomatis

---

## 📁 File Penting

- `START_WEBSITE.bat` - Launcher untuk user
- `START_ADMIN.bat` - Launcher untuk admin
- `STOP_SERVER.bat` - Stop server
- `config.js` - Konfigurasi port (default: 3001)
- `server.js` - Backend server
- `products.json` - Database produk
- `site_settings.json` - Pengaturan tema

---

## ⚙️ Mengubah Port

1. Buka `config.js`
2. Ubah `PORT: 3001` ke port lain
3. Save file
4. Jalankan ulang `START_WEBSITE.bat` atau `START_ADMIN.bat`

---

## 🔧 Troubleshooting

**Server tidak mau start:**
- Pastikan Node.js sudah terinstall
- Jalankan `npm install` di folder ini
- Cek apakah port 3001 sudah dipakai aplikasi lain

**Website tidak muncul:**
- Tunggu 2-3 detik setelah server start
- Refresh browser (F5)
- Cek console untuk error

**Admin Panel error "Gagal menambah produk":**
- Pastikan server running
- Refresh halaman admin
- Cek `products.json` tidak corrupt

---

## 📝 Fitur

### User Website
- ✅ Product catalog dengan filter
- ✅ Lookbook gallery
- ✅ Product modal dengan carousel
- ✅ FAQ section
- ✅ Dynamic theming
- ✅ 3D logo (Three.js)

### Admin Panel
- ✅ Product CRUD (Create, Read, Update, Delete)
- ✅ Image upload (Base64)
- ✅ Text formatting editor
- ✅ Theme customization (colors, fonts)
- ✅ Promo manager
- ✅ Statistics dashboard

---

## 🎨 Customization

**Mengubah Tema:**
1. Login ke Admin Panel
2. Scroll ke "TAMPILAN WEBSITE"
3. Ubah warna, font, atau teks
4. Klik "SIMPAN TAMPILAN"
5. Refresh website untuk lihat perubahan

**Menambah Produk:**
1. Login ke Admin Panel
2. Isi form "Create Look"
3. Upload gambar cover & gallery
4. Klik "Save Look"
5. Produk langsung muncul di website

---

## 💡 Tips

- Selalu gunakan launcher `.bat` untuk start/stop
- Jangan edit `products.json` manual (pakai Admin Panel)
- Backup `products.json` dan `site_settings.json` secara berkala
- Untuk production, deploy ke hosting dengan Node.js support

---

**Dibuat dengan ❤️ untuk FYNEST**

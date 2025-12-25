# Panduan Setup Database FYNEST

## Langkah 1: Pastikan XAMPP Berjalan
1. Buka **XAMPP Control Panel**
2. Klik **Start** pada **Apache** dan **MySQL**
3. Tunggu sampai kedua service berwarna hijau

## Langkah 2: Buat Database via phpMyAdmin
1. Buka browser, ketik: `http://localhost/phpmyadmin`
2. Klik tab **"SQL"** di bagian atas
3. Buka file **`setup_database.sql`** yang sudah saya buatkan
4. **Copy semua isinya** (Ctrl+A, Ctrl+C)
5. **Paste** ke kotak SQL di phpMyAdmin
6. Klik tombol **"Go"** atau **"Kirim"**
7. Tunggu sampai muncul pesan sukses

## Langkah 3: Verifikasi
1. Di phpMyAdmin, cek sidebar kiri
2. Harusnya ada database baru: **`fynest_db`**
3. Klik database tersebut
4. Harusnya ada tabel **`products`** dengan 3 data sample

## Langkah 4: Test Website
1. Pastikan server masih berjalan (jangan tutup terminal)
2. Buka: `http://localhost:3000`
3. Harusnya muncul 3 produk sample
4. Buka Admin: `http://localhost:3000/admin_index.html`
5. Login: `wili` / `wiliam`

## Troubleshooting
- **Error "Access Denied"**: Cek username/password di `server.js` (baris 17-20)
- **Database tidak muncul**: Pastikan MySQL di XAMPP sudah running
- **Produk tidak muncul**: Refresh halaman (Ctrl+R)

Selamat! Database Anda sudah siap digunakan! 🎉

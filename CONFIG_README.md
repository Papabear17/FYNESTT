# Centralized Configuration System

## Overview
Sistem konfigurasi terpusat untuk memastikan semua file (frontend & backend) menggunakan PORT yang sama.

## File Konfigurasi: `config.js`

File ini adalah **Single Source of Truth** untuk semua pengaturan koneksi API.

```javascript
const CONFIG = {
  PORT: 3001,
  HOST: 'localhost',
  API_BASE: 'http://localhost:3001',
  API_PRODUCTS: 'http://localhost:3001/api/products',
  API_CATEGORIES: 'http://localhost:3001/api/categories',
  API_SETTINGS: 'http://localhost:3001/api/settings'
};
```

## Cara Kerja

### 1. Backend (server.js)
```javascript
const CONFIG = require('./config.js');
const PORT = CONFIG.PORT; // Otomatis sinkron
```

### 2. Frontend (index.html, admin_index.html)
```html
<!-- HARUS dimuat PERTAMA sebelum script lain -->
<script src="config.js"></script>
```

### 3. JavaScript Files (script.js, admin_script.js)
```javascript
const API_BASE = CONFIG.API_BASE;
// Semua fetch menggunakan CONFIG.API_PRODUCTS, dll
```

## Keuntungan

✅ **Sinkronisasi Otomatis**: Ubah port di 1 tempat (`config.js`), semua file otomatis update
✅ **Tidak Ada Konflik**: Tidak mungkin terjadi port mismatch
✅ **Mudah Maintenance**: Hanya edit 1 file untuk ganti port
✅ **Error-Proof**: Menghilangkan human error saat hardcode port

## Cara Mengubah Port

1. Buka `config.js`
2. Ubah nilai `PORT: 3001` ke port yang diinginkan (misal `PORT: 8080`)
3. Save file
4. Restart server
5. Refresh browser

**SEMUA FILE OTOMATIS SINKRON!** 🎯

## File yang Terpengaruh

- ✅ `server.js` - Backend server
- ✅ `config.js` - Konfigurasi pusat
- ✅ `index.html` - Load config
- ✅ `admin_index.html` - Load config
- ✅ `script.js` - Frontend API calls
- ✅ `admin_script.js` - Admin API calls

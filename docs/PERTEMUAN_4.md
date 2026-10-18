# 🤖 PERTEMUAN 4: AI CODE GENERATION & VERIFIKASI APLIKASI RUNNABLE

**Mata Kuliah:** Rekayasa Perangkat Lunak (RPL)  
**Aplikasi:** OptikExpress — Sistem Informasi Layanan Antar-Jemput Kacamata  
**Target:** Aplikasi *runnable* (dapat dijalankan), antarmuka pengguna (UI) berhasil tampil, serta mahasiswa memahami aliran data antar-komponen.

---

## 1. Proses Pengerjaan dengan AI Agent (Gemini)

Berdasarkan dokumen spesifikasi arsitektur yang dirumuskan pada **Pertemuan 3**, tim memanfaatkan AI Agent (Google Gemini) untuk menghasilkan kerangka kode (*scaffolding*):
1. **Scaffold Backend (Express.js):**
   * Mengenerate konfigurasi server (`backend/server.js`), koneksi database pool MySQL (`backend/config/db.js`), skrip DDL SQL (`backend/database/schema.sql`), serta endpoint dasar autentikasi dan layanan.
2. **Scaffold Frontend (React.js):**
   * Mengenerate struktur komponen antarmuka pengguna berbasis Create React App, routing multi-halaman (`react-router-dom` v6), klien HTTP Axios (`frontend/src/utils/api.js`), serta styling CSS dasar.

---

## 2. Pemahaman Aliran Data Sistem oleh Mahasiswa

Setelah kerangka kode dihasilkan, tim mahasiswa mempelajari arsitektur kode dan memetakan aliran data dari sisi klien hingga basis data:

```
[Pengguna di Browser] 
       | (Mengisi formulir pesanan & klik submit)
       v
[Komponen React UI: BuatLayanan.js]
       | (State dikelola secara reaktif via React useState)
       v
[HTTP Client: Axios (utils/api.js)]
       | (Menyematkan Header "Authorization: Bearer <token>")
       v
[Express Router: routes/layananRoutes.js]
       | (Dicegat oleh middleware/auth.js untuk verifikasi token JWT)
       v
[Controller: controllers/layananController.js]
       | (Validasi input & business logic: createLayanan)
       v
[Database Pool: config/db.js -> MySQL]
       | (Eksekusi query INSERT INTO layanan & detail_layanan)
       v
[Respons JSON Dikembalikan ke Frontend]
       | (Pembaruan UI & navigasi otomatis ke detail pesanan)
       v
[Tampilan Sukses & Riwayat Pesanan pada Layar Pengguna]
```

---

## 3. Identifikasi Masalah & Perbaikan Kode Mandiri (Troubleshooting)

Ketika kode awal dijalankan, tim mengidentifikasi beberapa kendala dan memperbaikinya:

### Kendala 1: Cross-Origin Resource Sharing (CORS) Blocked
* **Gejala:** Request Axios dari frontend (`http://localhost:3000`) ditolak oleh backend (`http://localhost:5000`).
* **Solusi Mahasiswa:** Mengaktifkan middleware `cors` pada `backend/server.js` dan menambahkan deklarasi proxy `"proxy": "http://localhost:5000"` pada `frontend/package.json`.

### Kendala 2: MySQL Single Connection Drop
* **Gejala:** Koneksi database terputus saat idle beberapa menit.
* **Solusi Mahasiswa:** Mengganti `mysql.createConnection` menjadi Connection Pool (`mysql.createPool`) dengan parameter `waitForConnections: true`, `connectionLimit: 10`, dan `queueLimit: 0` agar koneksi database stabil dan efisien.

### Kendala 3: Token JWT Expired Crash
* **Gejala:** Halaman React mengalami *blank screen* jika token di `localStorage` kedaluwarsa.
* **Solusi Mahasiswa:** Menambahkan interceptor response pada Axios (`frontend/src/utils/api.js`) untuk mencegat status HTTP 401 dan secara otomatis mengarahkan pengguna kembali ke halaman Login.

---

## 4. Hasil Verifikasi & Review Kelulusan Pertemuan 4

* ✅ **Aplikasi Runnable:** Backend Node.js dan Frontend React dapat dijalankan bersamaan tanpa crash.
* ✅ **UI Tampil Sempurna:** Halaman Beranda, Login, Register, Dashboard, dan Formulir Pemesanan berhasil dirender di browser.
* ✅ **Integrasi Berhasil:** Registrasi pengguna baru berhasil tersimpan ke tabel `users` MySQL dan pengajuan layanan berhasil membuat baris baru di tabel `layanan`.

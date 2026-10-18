# 🤖 DOKUMENTASI PERTEMUAN 4: AI CODE GENERATION & RUNNABLE VERIFICATION

**Mata Kuliah:** Rekayasa Perangkat Lunak (RPL)  
**Aplikasi:** OptikExpress — Sistem Informasi Layanan Antar-Jemput Kacamata  
**Target:** Aplikasi *runnable* (dapat dijalankan), antarmuka pengguna (UI) berhasil tampil, serta mahasiswa memahami aliran data antar-komponen.

---

## 1. Proses Pengerjaan dengan AI Agent (Gemini)

Berdasarkan dokumen arsitektur dan spesifikasi teknis yang telah dirumuskan pada **Pertemuan 3**, tim memanfaatkan AI Agent (Google Gemini) untuk menghasilkan kerangka kode (*scaffolding*) awal:

1. **Prompt Spesifikasi Backend:**
   * Menghasilkan struktur dasar Express.js (`server.js`), konfigurasi pool MySQL menggunakan `mysql2/promise` (`db.js`), skema basis data awal (`schema.sql`), serta endpoint autentikasi dan layanan dasar.
2. **Prompt Spesifikasi Frontend:**
   * Menghasilkan scaffold aplikasi React.js menggunakan Create React App, routing multi-halaman (`react-router-dom` v6), klien HTTP Axios (`api.js`), serta styling CSS dasar.

---

## 2. Pemahaman Aliran Data & Komponen oleh Mahasiswa

Setelah kode kerangka dihasilkan, tim mahasiswa mempelajari struktur proyek dan memetakan aliran data:

```
[Pengguna di Browser] 
       | (Mengisi form dan klik submit)
       v
[Komponen React UI: BuatLayanan.js]
       | (State dihandle via useState)
       v
[HTTP Client: Axios (utils/api.js)]
       | (Menyematkan Header "Authorization: Bearer <token>")
       v
[Express Router: routes/layananRoutes.js]
       | (Dicegat oleh middleware/auth.js untuk verifikasi token)
       v
[Controller: controllers/layananController.js]
       | (Validasi input & business logic)
       v
[Database Pool: config/db.js -> MySQL]
       | (Eksekusi query INSERT / SELECT)
       v
[Respons JSON Kembali ke Frontend]
       | (Pembaruan UI & navigasi ke halaman detail pesanan)
       v
[Tampilan Sukses pada Layar Pengguna]
```

---

## 3. Identifikasi Masalah & Perbaikan Kode (Troubleshooting)

Ketika aplikasi pertama kali dijalankan dari hasil generasi AI, tim menemukan beberapa kendala teknis dan melakukan perbaikan mandiri:

### Kendala 1: Cross-Origin Resource Sharing (CORS) Blocked
* **Penyebab:** Frontend berjalan di `http://localhost:3000` dan backend berjalan di `http://localhost:5000` tanpa konfigurasi header origin yang sesuai.
* **Solusi Mahasiswa:** Memasang middleware `cors` pada `backend/server.js` serta menambahkan konfigurasi `"proxy": "http://localhost:5000"` pada `frontend/package.json`.

### Kendala 2: MySQL Connection Pool Timeouts
* **Penyebab:** Koneksi database awal menggunakan `mysql.createConnection` tunggal yang mudah terputus saat idle.
* **Solusi Mahasiswa:** Mengubah konfigurasi koneksi menjadi Connection Pool (`mysql.createPool`) dengan parameter `waitForConnections: true`, `connectionLimit: 10`, dan `queueLimit: 0` agar mampu menangani transaksi secara asynchronous dan stabil.

### Kendala 3: Token JWT Expired / Malformed Error
* **Penyebab:** Pada scaffold awal, jika token pada `localStorage` bernilai `undefined` atau kadaluwarsa, aplikasi React mengalami *white screen of death*.
* **Solusi Mahasiswa:** Menambahkan interceptor response pada Axios (`frontend/src/utils/api.js`) untuk mendeteksi error HTTP 401 dan secara otomatis membersihkan sesi lokal serta mengarahkan pengguna kembali ke halaman Login.

---

## 4. Hasil Verifikasi & Review Kelulusan Pertemuan 4

* ✅ **Aplikasi Runnable:** Baik server backend (Node.js Express) maupun frontend development server (React.js) dapat dijalankan secara bersamaan tanpa crash.
* ✅ **Antarmuka Pengguna (UI) Tampil:** Seluruh rute publik (`/`, `/login`, `/register`) serta halaman terproteksi (`/dashboard`, `/layanan/buat`) berhasil dirender dengan visual yang rapi di browser.
* ✅ **Data Terhubung:** Registrasi pengguna baru berhasil tersimpan ke tabel `users` di basis data MySQL, dan formulir pengajuan layanan berhasil menyimpan baris transaksi baru di tabel `layanan`.

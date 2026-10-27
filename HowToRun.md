# PANDUAN MENJALANKAN APLIKASI (HOWTORUN.MD)

**Proyek:** OptikExpress — Sistem Informasi Layanan Antar-Jemput Kacamata  
**Repositori GitHub:** [https://github.com/akuntugassindar-spec/RPLApp.git](https://github.com/akuntugassindar-spec/RPLApp.git)  
**Target Rilis:** Pertemuan 7 (Menuntaskan Seluruh MVP - Siap Demonstrasi)  
**Arsitektur:** 3-Tier Fullstack (Express.js Backend, React.js Frontend, MySQL Database)

---

## 1. Prasyarat Sistem (Prerequisites)

Sebelum menjalankan aplikasi, pastikan perangkat Anda telah terpasang:
1. **Node.js**: Versi `v24.22.1 LTS` (atau minimal Node.js `v18.0.0+`).
2. **npm**: Versi `v11.19.1+` (otomatis terpasang bersama Node.js).
3. **Database Server**: MySQL versi `8.0+` atau MariaDB `10.4+` (dapat menggunakan **XAMPP**, **Laragon**, **MySQL Server Standalone**, atau **Docker**).
4. **Git**: Versi terbaru untuk cloning dan manajemen versi.
5. **Web Browser**: Google Chrome, Microsoft Edge, Mozilla Firefox, atau Safari versi terbaru.

---

## 2. Persiapan Basis Data (MySQL Database Setup)

Aplikasi membutuhkan database bernama `db_kacamata`. Seluruh skema tabel (6 tabel 3NF) dan data seed demo telah dikemas dalam berkas [`backend/database/schema.sql`](backend/database/schema.sql).

### Opsi A: Menggunakan phpMyAdmin (XAMPP / Laragon)
1. Buka control panel XAMPP/Laragon dan jalankan modul **MySQL** dan **Apache**.
2. Buka browser dan akses `http://localhost/phpmyadmin`.
3. Klik tab **Import** (atau buat database baru `db_kacamata` terlebih dahulu).
4. Pilih berkas [`backend/database/schema.sql`](backend/database/schema.sql) dari repositori proyek.
5. Klik **Go / Impor**. Skema basis data, seluruh tabel, dan data demo siap pakai akan dibuat secara otomatis.

### Opsi B: Menggunakan Terminal / Command Line MySQL
Jalankan perintah berikut di PowerShell atau Command Prompt:
```bash
mysql -u root -p < backend/database/schema.sql
```
*(Tekan Enter jika user `root` Anda tidak memiliki password default).*

---

## 3. Konfigurasi Lingkungan (.env)

Proyek telah dilengkapi berkas konfigurasi default yang siap pakai tanpa perlu konfigurasi rumit.

### A. Backend (`backend/.env`)
Pastikan berkas `backend/.env` memiliki konfigurasi database yang sesuai dengan komputer Anda:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=db_kacamata
DB_PORT=3306
JWT_SECRET=super_secret_jwt_kacamata_key_2026_universitas
JWT_EXPIRES_IN=24h

# Opsional: Pengiriman Notifikasi Email Gmail Nyata
# EMAIL_USER=emailanda@gmail.com
# EMAIL_PASS=app_password_gmail
```
*(Jika kredensial email dikosongkan, sistem secara cerdas menggunakan mock transporter Ethereal Email untuk pengujian lokal).*

### B. Frontend (`frontend/.env`)
Pastikan berkas `frontend/.env` mengarah ke port server Express:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 4. Cara Menjalankan Aplikasi Secara Manual (Development Mode)

Jalankan backend dan frontend secara bersamaan pada **dua jendela terminal terpisah**:

### Terminal 1: Menjalankan Backend (Server Express.js)
```bash
# 1. Masuk ke direktori backend
cd backend

# 2. Pasang dependensi pustaka (jika baru pertama kali clone)
npm install

# 3. Jalankan server backend (dengan auto-reload nodemon)
npm run dev
```
> **Output Berhasil:**  
> `Server Layanan Kacamata berjalan aktif`  
> `URL: http://localhost:5000`  
> `[Database] Berhasil terhubung ke database MySQL: db_kacamata`

---

### Terminal 2: Menjalankan Frontend (Aplikasi React.js)
```bash
# 1. Buka jendela terminal baru, masuk ke direktori frontend
cd frontend

# 2. Pasang dependensi pustaka
npm install

# 3. Jalankan development server React
npm start
```
> Browser Anda akan otomatis terbuka ke alamat: **`http://localhost:3000`**

---

## 5. Menjalankan Menggunakan Docker Compose (Alternatif One-Click)

Jika Anda memiliki Docker Desktop, seluruh sistem (MySQL Database, Backend API, dan Frontend React) dapat dijalankan dalam satu perintah tanpa perlu instalasi MySQL lokal:

```bash
# Menjalankan seluruh kontainer di background
docker-compose up -d --build

# Melihat log proses kontainer
docker-compose logs -f

# Menghentikan kontainer
docker-compose down
```
Setelah berjalan:
- **Aplikasi Frontend**: `http://localhost:3000`
- **API Backend**: `http://localhost:5000`
- **Database MySQL**: `localhost:3306`

---

## 6. Menjalankan Pengujian Otomatis (Unit Testing)

OptikExpress dilengkapi **64 Unit Tests komprehensif** dalam 11 test suites berbasis Node.js native test runner (`node:test`).

Untuk menjalankan seluruh test suite:
```bash
# Dari root direktori proyek:
npm --prefix backend test

# Atau masuk ke folder backend:
cd backend
npm test
```

> **Target Eksekusi:**
> ```text
> ℹ tests 64
> ℹ suites 12
> ℹ pass 64
> ℹ fail 0
> ℹ status: 100% PASSED (ALL PASS)
> ```

---

## 7. Kredensial Akun Demo (3 Role RBAC)

Aplikasi telah menyediakan 4 akun demo bawaan untuk mendemonstrasikan seluruh fitur 3-Role (*Pelanggan, Administrator, Kurir*):

| Role / Peran | Nama Pengguna | Alamat Email | Password Demo | Hak Akses Utama |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | Administrator Optik | `admin@optik.com` | `admin123` | Konfirmasi pesanan, update biaya teknis, assign armada kurir, kontrol alur lab |
| **Pelanggan** | Bahrul Ulum | `bahrul@gmail.com` | `password123` | Formulir pemesanan, upload foto/resep, pembayaran QRIS/VA, lacak live GPS |
| **Kurir Logistik** | Agus Pratama (Kurir) | `kurir@gmail.com` | `kurir123` | Dashboard kurir, penjemputan/pengantaran, siaran GPS kurir, kasir di tempat |

> *Catatan:* Sistem juga mendukung registrasi akun pelanggan baru secara instan melalui menu **Daftar Akun** (`/register`).

---

## 8. Skenario Demonstrasi Lengkap (End-to-End Walkthrough)

Untuk mendemonstrasikan alur tuntas aplikasi secara berurutan:

1. **Akses Beranda Publik (`/`)**:
   - Tampilkan informasi layanan: Perbaikan Kacamata, Ganti Lensa, dan Antar-Jemput.
   - Navigasi navbar bersih murni teks tanpa emotikon mentah.
2. **Alur Pelanggan (Pemesanan Layanan)**:
   - Login menggunakan akun pelanggan (`bahrul@gmail.com` / `password123`).
   - Masuk ke menu **Pesan Layanan** (`/layanan/buat`).
   - Pilih jenis layanan, isi keluhan kacamata patah & lensa blueray, alamat penjemputan BSD Tangerang Selatan, tanggal & jam jemput.
   - Unggah foto kerusakan fisik kacamata dan foto resep optik dokter.
   - Klik **Kirim Permintaan Layanan**. Modal Overlay Notifikasi Sukses (`SuccessOverlay`) akan tampil di tengah layar (ID Pesanan `#4`).
3. **Alur Administrator (Manajemen & Verifikasi)**:
   - Logout lalu Login sebagai Admin (`admin@optik.com` / `admin123`).
   - Buka **Admin Dashboard** (`/admin/dashboard`) dan pilih pesanan #4 yang baru diajukan.
   - Verifikasi foto kacamata & foto resep (bisa klik untuk Lightbox zoom).
   - Masukkan estimasi biaya pengerjaan kacamata **Rp 150.000** dan tentukan armada kurir Plat B (**Bambang Wijaya - B 3120 TNG**).
   - Ubah status menjadi `dijadwalkan`.
4. **Alur Kurir Logistik (Penjemputan & Live GPS)**:
   - Login sebagai Kurir (`kurir@gmail.com` / `kurir123`).
   - Buka **Dashboard Kurir** (`/kurir/dashboard`).
   - Klik tombol **"Update Status: Diambil Kurir"** saat menjemput kacamata.
   - Klik **"Siarkan GPS Kurir"** untuk memperbarui koordinat posisi terkini secara langsung (`LIVE GPS: -6.2088, 106.8456`).
   - Peta Live Radar Google Maps Indonesia & OpenStreetMap menampilkan rute turn-by-turn mendekati alamat pemesan (< 500m).
5. **Alur Pembayaran Digital (Payment Gateway Simulator)**:
   - Pelanggan membuka detail pesanan (`/layanan/:id`) atau pembayaran (`/pembayaran/:id`).
   - Pilih metode pembayaran: **QRIS Standar Bank Indonesia (EMVCo)**, **BCA Virtual Account**, **GoPay**, atau **COD**.
   - Sistem menampilkan QRIS dinamis dengan kode CRC-16 yang valid, atau nomor VA dengan tombol salin otomatis.
   - Klik **"Konfirmasi Pembayaran Lunas"**. Modal Overlay sukses muncul dan status tagihan seketika menjadi **LUNAS (Verified)**.
6. **Alur Pengantaran Kacamata & Penyelesaian**:
   - Kacamata diproses di lab optik (`diproses`), diselesaikan (`selesai`), dan diantar kurir (`diantar`).
   - Kurir/Admin menandai pesanan selesai saat kacamata diterima pelanggan di alamat tujuan.
   - Halaman `/riwayat-status/:id` menyajikan tabel kronologis Audit Trail lengkap tersimpan di basis data 3NF.
7. **Pengujian Otomatis (Unit Testing 100% Lulus)**:
   - Buka terminal dan jalankan `npm --prefix backend test`.
   - Menampilkan 12 test suites, 64 unit tests komprehensif **100% PASSED (0 FAIL)**.

---

## 9. Penanganan Kendala Umum (Troubleshooting FAQ)

* **Kendala Port 5000 / 3000 Terpakai (`EADDRINUSE`):**
  - Pastikan tidak ada server backend/frontend lain yang berjalan di background.
  - Untuk melihat & mematikan proses di Windows PowerShell:
    ```powershell
    Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
    ```
* **Koneksi Database Gagal (`ECONNREFUSED`):**
  - Pastikan modul MySQL pada XAMPP atau Laragon telah berada dalam status **Running (Port 3306)**.
  - Pastikan nama database adalah `db_kacamata`.
* **CORS Error saat Komunikasi Frontend-Backend:**
  - Backend OptikExpress telah mengaktifkan middleware CORS universal (`origin: '*'`), pastikan backend aktif di port 5000 sebelum membuka frontend.
* **Foto Kacamata Tidak Muncul:**
  - Folder `backend/uploads/` otomatis disajikan statis melalui endpoint `http://localhost:5000/uploads/`.

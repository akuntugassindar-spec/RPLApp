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

## 8. Skenario Demonstrasi Lengkap (End-to-End Walkthrough & Video Demo)

Sistem telah dilengkapi berkas rekaman video demonstrasi lengkap beresolusi **Full HD 1080p (1920 × 1080, 30 FPS)** dengan antarmuka otentik **Google Chrome di Windows**:
* 🎬 **Berkas Video:** [`demo.mp4`](demo.mp4) (Durasi: 104 detik / 1 menit 44 detik, Ukuran: 2.86 MB)
* 📜 **Naskah Standar Presenter:** Tersedia lengkap pada tabel matriks dan rincian 8 adegan di bawah ini.

---

### A. Matriks Skenario Rekaman 8 Adegan (`demo.mp4`)

| No | Menit / Detik | Adegan / Modul | Halaman / Rute | Aktor Akun | Tindakan di Layar | Indikator Keberhasilan |
| :-: | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | `00:00 – 00:08` | **Judul & Arsitektur** | Layar Intro Dark Slate | Sistem | Tampilan brand OptikExpress, arsitektur 3-tier, 3 role RBAC, fitur GPS & QRIS | Judul dan arsitektur terbaca jelas |
| **2** | `00:08 – 00:18` | **Beranda Publik** | `localhost:3000/` | Tamu / Publik | Chrome di Windows, navbar murni teks tanpa emote, hero banner, 4 kartu keunggulan | Kursor meluncur ke tombol "Daftar & Pesan" |
| **3** | `00:18 – 00:32` | **Alur Pelanggan** | `localhost:3000/layanan/buat` | Pelanggan (`bahrul`) | Form servis kacamata, alamat BSD Tangerang, upload foto kacamata & resep, klik submit | Modal pop-up `SuccessOverlay` muncul di tengah layar |
| **4** | `00:32 – 00:46` | **Alur Administrator** | `localhost:3000/admin/dashboard` | Admin (`admin@optik.com`) | Buka 4 stat card Icons8, buka pesanan #4, tetapkan biaya Rp 150.000, assign kurir Plat B | Toast notifikasi sukses, status jadi `dijadwalkan` |
| **5** | `00:46 – 01:00` | **Alur Kurir Logistik** | `localhost:3000/kurir/dashboard` | Kurir (`Bambang Wijaya`) | Klik "Mulai Jemput" (`diambil`), klik "Siarkan GPS Saya", peta radar Leaflet/Google Maps | Marker kurir Plat B bergerak mendekati lokasi pemesan |
| **6** | `01:00 – 01:14` | **Alur Pembayaran** | `localhost:3000/pembayaran/4` | Pelanggan (`bahrul`) | Rincian tagihan Rp 150.000, tab QRIS EMVCo BI + VA BCA, klik "Konfirmasi Lunas" | Modal sukses muncul, status tagihan seketika **LUNAS** |
| **7** | `01:14 – 01:26` | **Lab & Audit Trail** | `localhost:3000/riwayat-status/4` | Sistem / Lab | Stepper status lab (`diproses`), `diantar`, `selesai`, dan tabel 6 log kronologis | Seluruh log kronologis tersimpan di database 3NF |
| **8** | `01:26 – 01:44` | **Unit Test & Penutup** | Jendela Terminal PowerShell | Developer | Eksekusi `npm --prefix backend test`, 12 test suites, 64 tests PASSED 100% | Slide penutup MVP Ready & tautan GitHub |

---

### B. Rincian Alur & Naskah Narasi Tiap Adegan

1. **Scene 1 (00:00 – 00:08) — Judul & Pengantar Sistem:**
   - **Visual:** Layar pembuka modern gelap (*Dark Slate*), logo OptikExpress, badge Pertemuan 7, ringkasan arsitektur 3-Tier Fullstack (React 18, Express.js, MySQL 8.0 3NF).
   - **Narasi:** *"Selamat datang di demonstrasi OptikExpress — Sistem Informasi Layanan Antar-Jemput Kacamata berbasis web yang mengintegrasikan Pelanggan, Administrator, dan Kurir Armada Lapangan secara real-time."*

2. **Scene 2 (00:08 – 00:18) — Beranda Publik (`localhost:3000/`):**
   - **Visual:** Jendela Google Chrome di Windows, navbar bersih murni teks tanpa emotikon mentah, hero banner, dan 4 keunggulan layanan (*Antar-Jemput, Teknisi Profesional, Lensa Lengkap, Status Transparan*).
   - **Narasi:** *"Pengunjung disajikan landing page dengan informasi layanan servis kacamata tanpa perlu keluar rumah dengan antarmuka yang bersih dan modern."*

3. **Scene 3 (00:18 – 00:32) — Alur Pelanggan (Pemesanan & Upload Berkas):**
   - **Visual:** Halaman `/layanan/buat` login sebagai `bahrul@gmail.com`. Form perbaikan frame patah & ganti lensa blueray minus 2.50, alamat jemput BSD Tangerang Selatan, upload foto kacamata dan foto resep dokter.
   - **Tindakan:** Klik tombol **"Kirim Permintaan Layanan"** ➔ Modal pop-up **`SuccessOverlay`** muncul di tengah layar mengonfirmasi pesanan ID `#4`.
   - **Narasi:** *"Pelanggan mengajukan permintaan servis kacamata dengan mengunggah foto kondisi fisik frame dan foto resep optik dokter, diakhiri dengan konfirmasi modal pop-up sukses."*

4. **Scene 4 (00:32 – 00:46) — Alur Administrator (Verifikasi Biaya & Assign Kurir Plat B):**
   - **Visual:** Admin Dashboard `/admin/dashboard` login sebagai `admin@optik.com`. 4 stat card Icons8 modern, tabel permintaan layanan ID #4.
   - **Tindakan:** Admin memvalidasi foto via zoom lightbox, menetapkan estimasi biaya **Rp 150.000**, memilih armada kurir Plat B **Bambang Wijaya (Yamaha NMAX - B 3120 TNG)**, dan klik **"Simpan & Jadwalkan"**.
   - **Narasi:** *"Administrator memverifikasi foto kacamata, menetapkan biaya teknis Rp 150.000, serta menugaskan armada kurir Plat B wilayah Tangerang/Jakarta sehingga status pesanan berubah menjadi dijadwalkan."*

5. **Scene 5 (00:46 – 01:00) — Alur Kurir Logistik (Penjemputan & Live Courier Tracking GPS):**
   - **Visual:** Dashboard Kurir `/kurir/dashboard` login sebagai `kurir@gmail.com` (Bambang Wijaya - Plat B 3120 TNG).
   - **Tindakan:** Kurir klik **"Mulai Jemput Kacamata"** (status `diambil`) dan **"Siarkan GPS Saya"** (`LIVE GPS: -6.2088, 106.8456`). Peta interaktif Leaflet OpenStreetMap & Google Maps Indonesia menampilkan pergerakan kurir mendekati alamat pemesan (< 500m).
   - **Narasi:** *"Kurir logistik memulai penjemputan dan mengaktifkan siaran GPS langsung. Peta radar interaktif menampilkan rute kurir dan estimasi jarak turn-by-turn ke lokasi penjemputan."*

6. **Scene 6 (01:00 – 01:14) — Alur Pembayaran Digital (Simulator QRIS EMVCo & VA BCA):**
   - **Visual:** Halaman `/pembayaran/4` menampilkan rincian tagihan ID #4 sebesar Rp 150.000.
   - **Tindakan:** Pelanggan memilih tab QRIS berstandar resmi Bank Indonesia (spesifikasi EMVCo & kalkulasi CRC-16 valid) atau VA BCA `8077708123456789`, lalu klik **"Konfirmasi Tagihan Lunas"**. Modal sukses pop-up muncul dan status seketika menjadi **LUNAS (Verified)**.
   - **Narasi:** *"Pelanggan melakukan pembayaran melalui simulator gateway QRIS standar Bank Indonesia atau BCA Virtual Account. Status transaksi langsung terverifikasi lunas secara otomatis."*

7. **Scene 7 (01:14 – 01:26) — Alur Lab Optik, Pengantaran & Audit Trail:**
   - **Visual:** Halaman `/riwayat-status/4` menampilkan status stepper pengerjaan lab (`diproses`), pengantaran kurir (`diantar`), hingga diterima pelanggan (`selesai`).
   - **Tindakan:** Tabel log audit trail memperlihatkan 6 catatan kronologis riwayat status dari awal hingga akhir yang tersimpan permanen di basis data 3NF.
   - **Narasi:** *"Kacamata diperbaiki dan dipasangkan lensa baru di laboratorium optik, diantar kembali oleh armada kurir, dan diterima tuntas oleh pelanggan dengan seluruh audit trail tercatat transparan."*

8. **Scene 8 (01:26 – 01:44) — Verifikasi Otomatis (64/64 Unit Tests 100% Lulus) & Penutup:**
   - **Visual:** Jendela terminal PowerShell mengeksekusi `npm --prefix backend test`. Seluruh 12 test suites dan 64 tests lolos seratus persen (*0 fail*). Layar ditutup dengan ringkasan rilis MVP dan tautan GitHub.
   - **Narasi:** *"Keandalan sistem diuji secara menyeluruh melalui 64 unit tests komprehensif pada backend dengan hasil seratus persen lulus. Seluruh sistem siap digunakan dan didemonstrasikan."*

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

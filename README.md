# OptikExpress — Sistem Informasi Layanan Antar-Jemput Kacamata

**OptikExpress** adalah aplikasi web layanan servis dan penggantian lensa kacamata terintegrasi yang dirancang untuk mempermudah masyarakat merawat alat bantu penglihatan tanpa harus datang langsung ke gerai optik fisik. Sistem ini menjembatani seluruh alur operasional antara pelanggan, teknisi laboratorium optik, dan armada kurir lapangan secara terpusat, mulai dari pengajuan perbaikan, penjemputan frame, pemotongan dan pemasangan lensa, pelacakan kurir GPS real-time, hingga transaksi pembayaran digital dan pengantaran kacamata kembali ke alamat pelanggan.

---

## Tech Stack

* **Backend:** Node.js, Express.js REST API, MySQL 8.0 / MariaDB (`mysql2/promise`), JWT Authentication, BCrypt.js
* **Frontend:** React.js 18 (SPA), React Router DOM v6, Leaflet (OpenStreetMap), Axios HTTP Client
* **Arsitektur:** Decoupled Monorepo (`backend/` & `frontend/`), RESTful API, State Machine 6 Tahapan, Anti-IDOR Security
* **Pengujian Otomatis:** Node.js Native Test Runner (`node:test`, `node:assert/strict`) — 48 passing unit tests (100% lulus)

---

## Prerequisites

Sebelum mulai, pastikan kebutuhan lingkungan pengembangan berikut sudah terpenuhi:

| Kebutuhan | Versi Minimum | Keterangan |
| :--- | :--- | :--- |
| **Node.js** | `>= 16.x` | Disarankan menggunakan versi LTS (v18.x atau v20.x). Cek dengan `node -v`. |
| **npm** | `>= 8.x` | Node Package Manager (otomatis terpasang bersama Node.js). Cek dengan `npm -v`. |
| **MySQL / MariaDB** | `>= 8.0` / `>= 10.4` | Dapat menggunakan XAMPP, Laragon, MySQL Server standalone, atau Docker. Port `3306`. |
| **Port Bebas** | `3000`, `5000`, `3306` | Pastikan ketiga port ini tidak sedang digunakan oleh aplikasi lain. |
| **Koneksi Internet** | Aktif | Diperlukan pada instalasi pertama untuk mengunduh pustaka dependensi npm. |

> **Catatan untuk pengguna Windows:** Seluruh perintah di panduan ini dijalankan melalui **PowerShell** atau **Git Bash**. Jika menggunakan Command Prompt (CMD), perintah `cp` diganti menjadi `copy`.

---

## Quick Start (Panduan Instalasi & Menjalankan Aplikasi)

Ikuti langkah-langkah terstruktur berikut untuk menjalankan aplikasi di komputer lokal:

### 1. Masuk ke Direktori Proyek

Buka terminal dan arahkan ke folder root proyek:

```bash
cd RPLApp
```

### 2. Konfigurasi Environment (`.env`)

Salin berkas template konfigurasi environment yang telah disediakan di folder backend:

```bash
cp backend/.env.example backend/.env
```

Buka berkas `backend/.env` dan sesuaikan parameter konfigurasi database dan keamanan:

```dotenv
# Konfigurasi Server
PORT=5000

# Konfigurasi Basis Data MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=db_kacamata
DB_PORT=3306

# Keamanan Token Autentikasi (JWT)
JWT_SECRET=super_secret_jwt_kacamata_key_2026_universitas_rpl
JWT_EXPIRES_IN=24h
```

**Membuat `JWT_SECRET` Acak Baru (Opsional, minimal 32 karakter):**

```bash
# Linux / macOS / Git Bash
openssl rand -base64 32
```

```powershell
# Windows PowerShell
$b = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b)
[Convert]::ToBase64String($b)
```

Salin teks hasil generasi ke baris `JWT_SECRET=` pada berkas `backend/.env`.

### 3. Setup Basis Data MySQL

1. Pastikan layanan MySQL pada XAMPP Control Panel atau Laragon telah berstatus aktif (**Running** di port `3306`).
2. Buka phpMyAdmin di browser (`http://localhost/phpmyadmin`) atau terminal MySQL.
3. Impor berkas skema DDL dan data awal (*seed*) yang berada di:
   ```text
   backend/database/schema.sql
   ```
   Atau impor secara langsung via terminal:
   ```bash
   mysql -u root -p < backend/database/schema.sql
   ```
   Skrip ini secara otomatis membuat database `db_kacamata`, 6 tabel relasional 3NF (`users`, `kurir`, `layanan`, `detail_layanan`, `pembayaran`, `riwayat_status_layanan`), relasi foreign key, serta data akun demo awal.

### 4. Pasang Dependensi Proyek

Jalankan instalasi dependensi pada backend dan frontend:

```bash
# Instal dependensi backend
cd backend
npm install

# Instal dependensi frontend
cd ../frontend
npm install

# Kembali ke root direktori
cd ..
```

### 5. Jalankan Server Aplikasi

Buka dua jendela terminal terpisah (atau gunakan dua tab terminal di VS Code):

**Terminal 1 — Menjalankan Server Backend REST API:**
```bash
cd backend
npm start
```
*Server backend akan aktif di `http://localhost:5000`.*

**Terminal 2 — Menjalankan Server Frontend React:**
```bash
cd frontend
npm start
```
*Aplikasi frontend web akan terbuka otomatis di `http://localhost:3000`.*

### 6. Verifikasi Status Layanan

Pastikan seluruh endpoint server berjalan normal dengan melakukan pengecekan health check:

```bash
curl http://localhost:5000/api/health
```

Respon yang diharapkan:
```json
{
  "status": "UP",
  "timestamp": "2026-10-20T..."
}
```

Root endpoint:
```bash
curl http://localhost:5000/
```

Respon yang diharapkan:
```json
{
  "success": true,
  "message": "Selamat Datang di API Sistem Informasi Layanan Antar-Jemput Kacamata"
}
```

### 7. Akses Aplikasi & Akun Pengujian (Demo)

Buka peramban (*browser*) pada alamat:

```text
http://localhost:3000
```

Gunakan akun pengujian yang telah disediakan di dalam basis data untuk mencoba berbagai hak akses (*Role-Based Access Control*):

| Email Pengguna | Peran (Role) | Kata Sandi | Cakupan Hak Akses |
| :--- | :--- | :--- | :--- |
| `admin@optik.com` | `admin` | `admin123` | Akses penuh dashboard admin, verifikasi pesanan, update status pengerjaan, input biaya, penugasan kurir, dan konfirmasi pembayaran. |
| `bahrul@gmail.com` | `pelanggan` | `admin123` | Pengajuan servis antar-jemput, upload foto kerusakan & resep, pantau live GPS kurir, checkout pembayaran digital, dan cetak bukti invoice. |

### 8. Menjalankan Pengujian Unit Otomatis (Unit Testing)

Untuk memvalidasi integritas logika bisnis, state machine, anti-IDOR, dan payment gateway:

```bash
cd backend
npm test
```

*Output:* **48 passing unit tests (100% lulus, 0 fail across 9 test suites)**.

### 9. Menghentikan Aplikasi

Tekan tombol `Ctrl + C` pada masing-masing jendela terminal (backend dan frontend). Seluruh data transaksi dan histori pengerjaan kacamata pada database MySQL tetap tersimpan secara permanen.

---

## Troubleshooting

Panduan penanganan kendala teknis operasional sistem:

| Pesan Kendala / Error | Akar Penyebab | Solusi Penanganan |
| :--- | :--- | :--- |
| `port 5000 is already allocated` | Port 5000 sedang digunakan oleh proses Node.js lain | Buka Task Manager lalu hentikan proses Node.js yang berjalan di background, atau ubah nilai `PORT=5001` pada `backend/.env`. |
| `port 3000 is already allocated` | Port 3000 sedang digunakan oleh aplikasi React lain | Saat terminal frontend menanyakan *Would you like to run the app on another port instead?*, ketik `Y` untuk beralih ke port 3001. |
| `[Database Error] connect ECONNREFUSED 127.0.0.1:3306` | Layanan MySQL pada XAMPP / Laragon belum aktif | Buka XAMPP Control Panel, klik tombol **Start** pada modul MySQL hingga indikator berwarna hijau. |
| `FATAL: ER_ACCESS_DENIED_ERROR` | Kredensial username/password MySQL di `.env` keliru | Buka berkas `backend/.env`, pastikan `DB_USER=root` dan `DB_PASSWORD=` (kosongkan password jika default XAMPP). |
| `FATAL: ER_BAD_DB_ERROR: Unknown database 'db_kacamata'` | Basis data `db_kacamata` belum diimpor | Buka phpMyAdmin (`http://localhost/phpmyadmin`), buat database baru bernama `db_kacamata` dan impor berkas `backend/database/schema.sql`. |
| `Cannot find module ...` | Modul pustaka dependensi belum terpasang | Masuk ke direktori yang bersangkutan (`backend` atau `frontend`), lalu jalankan perintah `npm install`. |
| Halaman blank putih / `Network Error` | Backend belum aktif saat frontend memanggil endpoint | Pastikan terminal backend sudah menampilkan pesan sukses berjalan di port 5000 sebelum membuka browser. |
| Perubahan UI tidak langsung terlihat | Browser masih menyimpan cache lama | Lakukan Hard Refresh pada peramban web dengan menekan kombinasi tombol `Ctrl + Shift + R` atau `Ctrl + F5`. |

---

## Struktur Direktori Proyek

Arsitektur direktori proyek mengadopsi standar *Domain-Driven Modular Structure*:

```text
RPLApp/
├── backend/                            # RESTful API Server (Node.js + Express.js)
│   ├── config/                         # Konfigurasi koneksi MySQL pool (db.js)
│   ├── controllers/                    # Logika bisnis transaksi, otentikasi, dan pelacakan
│   │   ├── authController.js           # Registrasi, login, verifikasi JWT, hash password
│   │   ├── layananController.js        # CRUD layanan, state machine, payment, GPS tracking
│   │   └── detailLayananController.js  # Spesifikasi teknis kacamata & anti-IDOR guard
│   ├── database/                       # Skrip DDL 6 tabel relasional 3NF & data seed demo
│   │   └── schema.sql                  # users, kurir, layanan, detail_layanan, pembayaran, riwayat
│   ├── middleware/                     # Middleware pipeline keamanan & otorisasi
│   │   ├── auth.js                     # Verifikasi token JWT pelanggan
│   │   └── adminAuth.js                # Proteksi hak akses khusus peran administrator
│   ├── routes/                         # Pemetaan endpoint HTTP REST
│   │   ├── authRoutes.js               # /api/auth (register, login, profile)
│   │   ├── layananRoutes.js            # /api/layanan (CRUD, status, pembayaran, tracking)
│   │   └── detailLayananRoutes.js      # /api/detail-layanan (CRUD spesifikasi kacamata)
│   ├── tests/                          # 5 berkas pengujian otomatis unit testing (48 passing tests)
│   │   ├── auth.test.js                # Pengujian otentikasi, validasi email, hashing BCrypt
│   │   ├── detailLayanan.test.js       # Pengujian detail spesifikasi & hak kepemilikan Anti-IDOR
│   │   ├── layanan.test.js             # Pengujian validasi input layanan & state machine
│   │   ├── middleware.test.js          # Pengujian otorisasi header Bearer JWT & role admin
│   │   └── pembayaran.test.js          # Pengujian 8 kanal pembayaran & tracking kurir
│   ├── .env.example                    # Template variabel lingkungan server
│   ├── package.json                    # Dependensi Express, mysql2, jsonwebtoken, bcryptjs
│   └── server.js                       # Titik masuk utama aplikasi backend
├── frontend/                           # Single Page Application (React.js)
│   ├── public/                         # index.html, favicon, dan manifest aplikasi
│   ├── src/
│   │   ├── components/                 # Komponen antarmuka global
│   │   │   ├── Navbar.js               # Navigasi responsif multi-role
│   │   │   └── LiveMapKurir.js         # Peta interaktif Leaflet OpenStreetMap & marker animasi
│   │   ├── pages/                      # Modul halaman antarmuka terorganisir per domain
│   │   │   ├── kurir/                  # Modul Pelacakan & Armada Kurir
│   │   │   │   ├── TrackingKurir.js    # Pelacakan live GPS kurir, ETA, dan direct Google Maps
│   │   │   │   ├── DaftarKurir.js      # Pemantauan ketersediaan armada kurir internal optik
│   │   │   │   └── index.js            # Barrel export modul kurir
│   │   │   ├── layanan/                # Modul Layanan Servis Kacamata
│   │   │   │   ├── BuatLayanan.js      # Formulir pengajuan baru + upload foto bukti & resep
│   │   │   │   ├── DaftarLayanan.js    # Daftar antrean pesanan dengan filter status & search
│   │   │   │   ├── DashboardLayanan.js # Dashboard ringkasan metrik pesanan pelanggan
│   │   │   │   └── index.js            # Barrel export modul layanan
│   │   │   ├── detail_layanan/         # Modul Spesifikasi Teknis Kacamata
│   │   │   │   ├── DetailLayanan.js    # Rincian kacamata, resep dokter, lightbox foto zoom
│   │   │   │   ├── AdminDetailLayanan.js # Panel admin kelola status, biaya servis, penugasan kurir
│   │   │   │   └── index.js            # Barrel export modul detail layanan
│   │   │   ├── pembayaran/             # Modul Transaksi Pembayaran Digital
│   │   │   │   ├── PembayaranPage.js   # Checkout multi-channel Midtrans (QRIS, VA, E-Wallet, COD)
│   │   │   │   ├── KonfirmasiPembayaran.js # Bukti transaksi digital / struk invoice resmi + tombol print
│   │   │   │   └── index.js            # Barrel export modul pembayaran
│   │   │   ├── riwayat_status_layanan/ # Modul Linimasa & Audit Trail
│   │   │   │   ├── RiwayatStatusLayanan.js # Visualisasi grafis 6 tahapan siklus & tabel riwayat audit
│   │   │   │   └── index.js            # Barrel export modul riwayat status
│   │   │   ├── admin/                  # Modul Halaman Administrator
│   │   │   │   ├── AdminDashboard.js   # Ringkasan analitik operasional gerai optik
│   │   │   │   └── index.js            # Backward compatibility re-export
│   │   │   ├── user/                   # Modul Halaman Pelanggan
│   │   │   │   └── index.js            # Backward compatibility re-export
│   │   │   ├── Home.js                 # Landing page publik pengenalan OptikExpress
│   │   │   ├── Login.js                # Formulir login pengguna & admin
│   │   │   ├── Register.js             # Formulir pendaftaran akun pelanggan baru
│   │   │   └── index.js                # Main pages aggregator export
│   │   ├── utils/                      # Utilitas pendukung frontend
│   │   │   ├── api.js                  # Axios instance dengan interceptor otomatis token JWT
│   │   │   └── PrivateRoute.js         # Guard proteksi rute halaman berbasis peran
│   │   ├── App.js                      # Root component & konfigurasi routing React Router v6
│   │   ├── App.css                     # Sistem gaya CSS tema Navy, Ocean Blue, & Mint Green
│   │   └── index.js                    # Inisialisasi React DOM
│   └── package.json                    # Dependensi React, React Router, Leaflet, Axios
├── docs/                               # Dokumentasi rekayasa perangkat lunak akademik (7 Dokumen)
│   ├── ide_proyek.md                   # Identitas tugas mahasiswa, eksplorasi 3 tema, in/out scope
│   ├── OptikExpress (PRD).md           # Product Requirement Document komprehensif
│   ├── Coding_Style.md                 # Standar arsitektur 3-tier, gaya kode, ERD relasional 3NF
│   ├── Design_UI.md                    # Panduan sistem desain, warna resmi, tipografi, komponen
│   ├── DevLog.md                       # Log kronologi perkembangan Pertemuan 1 s/d 6 & bukti test
│   ├── Logging.md                      # Arsitektur audit trail, log GPS kurir, logger notifikasi
│   └── Agent.md                        # Panduan teknis dan batasan bagi AI Coding Agent
├── docker-compose.yml                  # Orkestrasi multi-kontainer Docker MySQL, API, & React
├── .gitignore                          # Konfigurasi pengabaian berkas Git
└── README.md                           # Dokumentasi utama proyek
```

---

## Fitur Utama Aplikasi (100% Selesai Terimplementasi)

Seluruh fitur di bawah ini telah terpasang, terintegrasi penuh pada basis data, lolos pengujian unit test, dan siap dioperasikan:

1. **Autentikasi & RBAC Multi-Role Terenkripsi** — Pendaftaran akun baru, login dengan hashing password BCrypt (salt rounds 10), penerbitan token sesi stateless JWT, dan pemisahan hak akses antara peran `pelanggan` dan `admin`.
2. **Formulir Pengajuan Servis Digital** — Pengajuan perbaikan kacamata atau penggantian lensa kustom dengan pilihan kategori (`perbaikan`, `penggantian_lensa`, `perbaikan_dan_lensa`), keluhan kerusakan, alamat penjemputan, serta penentuan jadwal tanggal dan jam penjemputan.
3. **Pencatatan Spesifikasi Teknis Kacamata (Detail Layanan)** — Pencatatan model frame, rincian tindakan teknis perbaikan (engsel, nosepad, baut patah), dan ukuran resep kacamata (minus, plus, silinder, progresif) pada tabel relasional `detail_layanan`.
4. **Alur Siklus Status Terstruktur (State Machine 6 Tahapan)** — Siklus pengerjaan deterministik yang menjamin integritas alur operasional:
   $$\text{pengajuan} \longrightarrow \text{dijadwalkan} \longrightarrow \text{diambil} \longrightarrow \text{diproses} \longrightarrow \text{diantar} \longrightarrow \text{selesai}$$
5. **Dashboard Interaktif Pelanggan & Administrator** — Dasbor ringkasan metrik statistik operasional, kartu pesanan aktif, pesanan tuntas, status tagihan, dan tabel antrean servis dengan filter status dan pencarian kata kunci.
6. **Pembatalan & Penghapusan Pesanan** — Fasilitas pembatalan pengajuan oleh pelanggan pada tahap awal, serta penghapusan pesanan oleh administrator dengan mekanisme *cascading delete* pada basis data relasional.
7. **Notifikasi Otomatis Status (Email SMTP & WhatsApp Mock)** — Integrasi pengiriman email konfirmasi status otomatis via `nodemailer` (dukungan SMTP Gmail dan mode simulasi Ethereal) serta pencatatan log pesan WhatsApp otomatis ke nomor telepon pelanggan setiap kali status pengerjaan diperbarui.
8. **Arsitektur Frontend Modular (5 Modul Domain)** — Pemisahan struktur halaman antarmuka ke dalam 5 folder terisolasi (`kurir/`, `layanan/`, `detail_layanan/`, `pembayaran/`, `riwayat_status_layanan/`) dengan *barrel export* dan backward compatibility.
9. **Otomasi Pengujian Unit Komprehensif (Unit Testing Suite)** — 48 unit tests otomatis berbasis modul bawaan Node.js (`node:test`, `node:assert/strict`) yang mencakup validasi payload, validasi enum, otentikasi JWT, Anti-IDOR, state machine, dan simulasi transaksi.
10. **Integrasi Gerbang Pembayaran Digital (Payment Gateway Midtrans Simulation)** — Sistem transaksi digital multi-kanal yang mendukung QRIS (dengan QR Code dinamis otomatis), Virtual Account Bank (BCA, BNI, BRI, Mandiri) dengan tombol salin rekening, dompet digital E-Wallet (GoPay, ShopeePay), serta pembayaran tunai di tempat (COD) yang dilengkapi batas waktu transaksi (*countdown timer*) dan konfirmasi pelunasan instan.
11. **Pelacakan Kurir Langsung (Live GPS Tracking & Auto-Assign Kurir)** — Pemantauan lokasi armada kurir penjemput dan pengantar secara real-time di atas peta interaktif Leaflet OpenStreetMap, marker kendaraan animasi bergerak, persentase progres perjalanan, estimasi waktu kedatangan (ETA), rute alternatif radar vektor, tombol navigasi langsung turn-by-turn Google Maps, serta algoritma penugasan kurir otomatis (*Round-Robin Auto-Assign* ala Gojek/Grab) dari pool internal optik.
12. **Unggah Berkas Foto Fisik Kacamata & Resep Optik Dokter** — Fitur upload bukti foto kondisi frame kacamata rusak dan kartu resep resmi dari dokter spesialis mata/optometris berbasis pengkodean Base64 dengan penyimpanan aman di direktori server, dilengkapi pratinjau instan (*thumbnail preview*) dan modal pembesar foto (*lightbox zoom*).

---

## Alur Transaksi & State Machine Operasional

Diagram alur perjalanan permintaan servis kacamata dari inisiasi pelanggan hingga penyerahan kembali:

```text
Pelanggan                         Admin / Teknisi Optik                     Armada Kurir
    │                                       │                                     │
    ├─► Register / Login Akun               │                                     │
    ├─► Isi Formulir Pengajuan Servis       │                                     │
    ├─► Upload Foto Kerusakan & Resep       │                                     │
    │   [Status: PENGAJUAN]                 │                                     │
    │                                       ├─► Verifikasi Pesanan                │
    │                                       ├─► Tetapkan Jadwal Jemput            │
    │                                       │   [Status: DIJADWALKAN]             │
    │                                       ├─► Alokasi Kurir (Auto/Manual)───────┼─► Jemput Kacamata ke Alamat
    │                                       │                                     │   [Status: DIAMBIL]
    │                                       │◄── Serahkan Kacamata ke Lab Optik ──┘
    │                                       ├─► Analisis Fisik & Input Biaya Servis
    │                                       ├─► Teknisi Kerjakan Frame & Lensa
    │                                       │   [Status: DIPROSES]
    │                                       ├─► Pengerjaan Lab Tuntas
    │                                       │   [Status: SELESAI]
    │◄── Pilih Metode Bayar (QRIS/VA/COD)───┤
    │    (Simulasi Pembayaran / Lunas)      │
    │                                       ├─► Tugaskan Kurir Pengantaran────────┼─► Antar Kacamata ke Pelanggan
    │                                       │                                     │   (Live GPS Tracking Aktif)
    │                                       │                                     │   [Status: DIANTAR]
    │◄──────────────────────────────────────┴─────────────────────────────────────┼─► Serah Terima Kacamata Tuntas
    │   Unduh / Cetak Invoice Struk Lunas                                         │
```

---

## Indeks Dokumentasi Proyek Lengkap (`docs/`)

Dokumentasi komprehensif perjalanan rekayasa perangkat lunak proyek OptikExpress tersimpan di dalam folder [docs/](file:///c:/Users/sinda/OneDrive/RPLApp/docs):

| Berkas Dokumen | Cakupan dan Topik Pembahasan |
| :--- | :--- |
| **[`docs/ide_proyek.md`](file:///c:/Users/sinda/OneDrive/RPLApp/docs/ide_proyek.md)** | Identitas tugas mahasiswa (**Sindar Felix Sihole \|\| 2510101031**), eksplorasi 3 alternatif tema, perumusan tema mengerucut, profil target pengguna, manfaat aplikasi, dan batasan in/out-of-scope. |
| **[`docs/OptikExpress (PRD).md`](file:///c:/Users/sinda/OneDrive/RPLApp/docs/OptikExpress%20(PRD).md)** | *Product Requirement Document* resmi yang mencakup visi produk, alur State Machine operasional, 5 User Stories utama, Acceptance Criteria (AC), dan persyaratan non-fungsional. |
| **[`docs/Coding_Style.md`](file:///c:/Users/sinda/OneDrive/RPLApp/docs/Coding_Style.md)** | Standar arsitektur 3-tier, tech stack, konvensi gaya kode (PascalCase, camelCase, snake_case), format standar respon API, diagram ERD 6 tabel relasional 3NF (Mermaid), dan prinsip keamanan Anti-IDOR. |
| **[`docs/Design_UI.md`](file:///c:/Users/sinda/OneDrive/RPLApp/docs/Design_UI.md)** | Filosofi antarmuka UI/UX, sistem warna resmi (*Navy, Ocean Blue, Mint Green*), tipografi, hierarki komponen, pelacakan live kurir GPS Leaflet OSM, dan responsivitas multi-layar. |
| **[`docs/DevLog.md`](file:///c:/Users/sinda/OneDrive/RPLApp/docs/DevLog.md)** | Catatan riwayat perkembangan pengerjaan proyek dari Pertemuan 1 s/d 6, bukti eksekusi 48 unit tests (100% all passed), dan catatan riwayat commit bermakna (*meaningful git commits*). |
| **[`docs/Logging.md`](file:///c:/Users/sinda/OneDrive/RPLApp/docs/Logging.md)** | Arsitektur multi-layer logging: audit trail riwayat status layanan pada tabel database, pencatatan koordinat pelacakan kurir GPS, logging notifikasi Email SMTP & WhatsApp mock, serta error handling. |
| **[`docs/Agent.md`](file:///c:/Users/sinda/OneDrive/RPLApp/docs/Agent.md)** | Panduan dan aturan main teknis bagi AI Coding Agent, batasan implementasi, pembagian peran antara AI dan mahasiswa, serta kepatuhan standar kode akademik. |

---

## Pengembang

* **Nama Mahasiswa:** Sindar Felix Sihole
* **NIM:** 2510101031
* **Mata Kuliah:** Rekayasa Perangkat Lunak (RPL) — Semester 3
* **Repositori GitHub:** [https://github.com/akuntugassindar-spec/RPLApp.git](https://github.com/akuntugassindar-spec/RPLApp.git)

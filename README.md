# OptikExpress — Sistem Informasi Layanan Antar-Jemput Kacamata

Sistem Informasi Layanan Antar-Jemput Kacamata untuk Perbaikan dan Penggantian Lensa Berbasis Web

**OptikExpress** adalah aplikasi web layanan servis dan penggantian lensa kacamata terintegrasi yang dibuat untuk membantu pelanggan dalam melakukan permintaan layanan perbaikan kacamata atau penggantian lensa tanpa harus datang langsung ke toko optik fisik. Sistem ini menjembatani komunikasi dan alur data operasional antara pelanggan dan administrator toko optik, mulai dari pengajuan perbaikan, penjemputan frame, pemrosesan teknis di laboratorium optik, hingga pengantaran kacamata kembali ke alamat pelanggan.

---

## Tech Stack

- **Backend:** Node.js, Express.js 4, RESTful API
- **Frontend:** React.js 18, React Router DOM v6, Axios, CSS3 Responsif
- **Database:** MySQL 8.0 / MariaDB (Driver: `mysql2` dengan Connection Pool)
- **Kontainerisasi:** Docker & Docker Compose (MySQL, Backend Express, Frontend React Nginx)
- **Arsitektur:** Decoupled Client-Server, MVC Pattern, RESTful API, JWT + RBAC

---

## Prerequisites

Sebelum mulai, pastikan hal berikut sudah terpenuhi:

| Kebutuhan | Keterangan |
| :--- | :--- |
| **Docker Desktop** | Opsional untuk menjalankan via Docker. [Download Docker Desktop](https://www.docker.com/products/docker-desktop/) |
| **Node.js** | Versi >= 16.x (disarankan LTS 18.x atau 20.x). Cek dengan `node --version`. |
| **npm** | Node Package Manager (otomatis terpasang). Cek dengan `npm --version`. |
| **MySQL / MariaDB** | Melalui Docker, XAMPP, Laragon, atau MySQL Server standalone. Cek status di port `3306`. |
| **Port bebas** | Port `3000` (frontend), `5000` (backend), dan `3306` (MySQL) tidak dipakai aplikasi lain. |
| **Koneksi internet** | Diperlukan saat install pertama (download image / dependency npm). |

> **Catatan untuk pengguna Windows:** Seluruh perintah di panduan ini dijalankan di **PowerShell** atau **Git Bash**. Kalau memakai CMD, perintah `cp` diganti `copy`.

---

## Quick Start (Docker) — Cara Termudah & Disarankan

Cara ini **tidak perlu** menginstal Node.js atau MySQL secara manual di sistem lokal. Semua service sudah dibungkus di dalam Docker Compose.

### 1. Masuk ke Folder Project

```bash
cd RPLApp
```

### 2. Build & Jalankan Semua Container

```bash
docker compose up --build -d
```

> **Build pertama memakan waktu 2–5 menit** (download image MySQL, Node, Nginx, dan npm install). Ini normal. Build berikutnya jauh lebih cepat karena cache.

### 3. Verifikasi Semua Service Berjalan

Tunggu ±20 detik, lalu cek status container:

```bash
docker compose ps
```

Semua service harus berstatus **Up**:

| Container | Service | Port | Status |
| :--- | :--- | :--- | :--- |
| `kacamata-mysql` | db (MySQL 8.0) | `0.0.0.0:3306->3306` | Up (healthy) |
| `kacamata-backend` | backend (Express) | `0.0.0.0:5000->5000` | Up |
| `kacamata-frontend` | frontend (React + Nginx) | `0.0.0.0:3000->80` | Up |

Uji health check API backend:

```bash
curl http://localhost:5000/api/health
```

Respons:

```json
{ "status": "UP", "timestamp": "2026-10-02T..." }
```

### 4. Akses Aplikasi & Login

Buka browser di:

```text
http://localhost:3000
```

Akun demo yang tersedia (password: `admin123`):

| Username / Email | Role | Password | Hak Akses |
| :--- | :--- | :--- | :--- |
| `admin@optik.com` | `admin` | `admin123` | Akses penuh dashboard admin, kelola pesanan, ubah status pengerjaan |
| `bahrul@gmail.com` | `pelanggan` | `admin123` | Pengajuan layanan, lihat histori, pantau perkembangan status sendiri |

### 5. Stop & Cleanup Docker

```bash
# Menghentikan service (data database TETAP tersimpan aman di volume)
docker compose down

# Menghentikan + menghapus volume (reset data database ke seed awal)
docker compose down -v
```

---

## Quick Start (Local) — Tanpa Docker

Untuk development manual menggunakan XAMPP / Laragon:

### 1. Setup Basis Data MySQL

1. Nyalakan modul MySQL pada XAMPP/Laragon (port `3306`).
2. Impor skrip SQL `backend/database/schema.sql` via phpMyAdmin atau terminal:
   ```bash
   mysql -u root -p < backend/database/schema.sql
   ```

### 2. Setup Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

-> Backend berjalan di `http://localhost:5000`.

### 3. Setup Frontend

```bash
cd ../frontend
npm install
npm start
```

-> Frontend berjalan di `http://localhost:3000`.

---

## Troubleshooting

| Masalah | Penyebab | Solusi |
| :--- | :--- | :--- |
| `port is already allocated` | Port 3000, 5000, atau 3306 dipakai proses lain | Matikan aplikasi tersebut atau ubah port host pada `docker-compose.yml` |
| `docker command not found` | Docker Desktop belum terpasang atau belum berjalan | Instal Docker Desktop dari [docker.com](https://www.docker.com/products/docker-desktop/) atau jalankan via mode Local |
| `FATAL: ER_ACCESS_DENIED_ERROR` | Kredensial MySQL salah di `.env` | Cek `DB_USER` dan `DB_PASSWORD` di `backend/.env` |
| `FATAL: ER_BAD_DB_ERROR` | Database `db_kacamata` belum dibuat | Impor ulang berkas `backend/database/schema.sql` |
| `Cannot find module 'express'` | Backend belum `npm install` | Masuk ke folder `backend/` lalu jalankan `npm install` |
| `Cannot find module 'react'` | Frontend belum `npm install` | Masuk ke folder `frontend/` lalu jalankan `npm install` |
| Halaman blank / `Failed to fetch` | Backend belum aktif di port 5000 | Pastikan container atau terminal backend sudah berstatus Up |
| Perubahan kode tidak muncul | Cache browser | Lakukan hard refresh peramban (`Ctrl + Shift + R` atau `Ctrl + F5`) |

---

## Struktur Project

```text
RPLApp/
├── backend/                            # API Node.js (Express + mysql2)
│   ├── config/                         # Koneksi database MySQL connection pool (db.js)
│   ├── controllers/                    # Handler auth, layanan, dan detail kacamata
│   ├── database/                       # schema.sql (DDL tabel + seed data akun & transaksi)
│   ├── middleware/                     # Middleware JWT auth & admin RBAC verification
│   ├── routes/                         # Definisi rute RESTful API (auth, layanan, detail-layanan)
│   ├── .dockerignore                   # Berkas pengabaian build Docker backend
│   ├── .env.example                    # Template konfigurasi environment backend
│   ├── Dockerfile                      # Spesifikasi kontainerisasi backend
│   ├── package.json                    # Dependensi server Express
│   └── server.js                       # Titik masuk utama server Express
├── frontend/                           # SPA React.js
│   ├── public/                         # index.html & aset publik
│   ├── src/
│   │   ├── components/                 # Komponen antarmuka global (Navbar.js)
│   │   ├── pages/                      # Tampilan Home, Login, Register, Dashboard, BuatLayanan, DetailLayanan
│   │   │   └── admin/                  # Tampilan AdminDashboard, DaftarLayanan, AdminDetailLayanan
│   │   ├── utils/                      # api.js (Axios interceptor) & PrivateRoute.js (RBAC guard)
│   │   ├── App.js                      # Root component & konfigurasi React Router v6
│   │   ├── App.css                     # Gaya CSS responsif global
│   │   └── index.js                    # Mount React DOM
│   ├── .dockerignore                   # Berkas pengabaian build Docker frontend
│   ├── Dockerfile                      # Multi-stage build frontend dengan Nginx
│   ├── nginx.conf                      # Konfigurasi reverse proxy Nginx untuk SPA
│   └── package.json                    # Dependensi frontend
├── docker-compose.yml                  # Orkestrasi multi-kontainer MySQL, backend, & frontend
├── jalankan_aplikasi.bat               # Skrip batch otomatisasi eksekusi ganda Windows
├── powershell.bat                      # Utilitas peluncur PowerShell
├── .env.example                        # Template konfigurasi environment root
├── .gitignore                          # Pengabaian git (.env, node_modules, build)
└── README.md                           # Dokumentasi komprehensif proyek
```

---

## Masalah yang Diselesaikan

1. **Hambatan Mobilitas & Waktu** — Pelanggan aktif kesulitan menyisihkan waktu di jam kerja untuk datang langsung ke toko optik fisik hanya untuk perbaikan frame atau ganti lensa.
2. **Pencatatan Terfragmentasi** — Formulir keluhan lensa, ukuran minus/silinder, dan alamat kurir konvensional menggunakan nota kertas yang rawan hilang atau tertukar.
3. **Ketiadaan Transparansi Status** — Pelanggan tidak mengetahui perkembangan proses reparasi kacamata tanpa menelepon toko secara berulang.
4. **Penjadwalan Kurir Manual** — Koordinasi waktu penjemputan dan pengantaran kacamata sering bentrok karena tidak tercatat dalam jadwal terpusat.

---

## Target Pengguna (2 Role RBAC)

| Peran | Tanggung Jawab Utama |
| :--- | :--- |
| `admin` | Manajemen seluruh permintaan layanan, verifikasi jadwal penjemputan kurir, pembaruan status siklus servis kacamata |
| `pelanggan` | Pendaftaran akun, pengajuan layanan antar-jemput, penentuan jadwal & alamat, pelacakan perkembangan status kacamata secara mandiri |

---

## Fitur Inti

Status ditandai jujur: **[Ada]** = sudah terimplementasi di kode, **[Rencana]** = masih dalam rencana pengembangan.

1. **[Ada] Autentikasi & RBAC Multi-Role** — Sesi login dengan JSON Web Token (JWT), 2 role (`pelanggan` & `admin`), proteksi rute halaman via `PrivateRoute`
2. **[Ada] Pengajuan Layanan Antar-Jemput** — Formulir jenis servis (perbaikan frame atau penggantian lensa), keluhan, alamat lengkap, tanggal & jam penjemputan
3. **[Ada] Rincian Spesifikasi Kacamata** — Pencatatan model frame, detail perbaikan teknis, dan catatan ukuran lensa
4. **[Ada] Siklus Status Layanan (State Machine)** — 6 tahapan status terstruktur: `pengajuan` -> `dijadwalkan` -> `diambil` -> `diproses` -> `selesai` -> `diantar`
5. **[Ada] Dasbor Pelanggan & Admin** — Pemantauan status pesanan pribadi dan tabel manajemen terpusat untuk administrator
6. **[Ada] Pembatalan & Hapus Layanan** — Penghapusan pesanan dengan cascading delete terintegrasi pada relasi database
7. **[Rencana] Notifikasi Otomatis WhatsApp / Email** — Pemberitahuan otomatis saat status kacamata berganti tahapan
8. **[Rencana] Integrasi Payment Gateway** — Pembayaran digital ongkir kurir dan biaya perbaikan via QRIS / transfer
9. **[Rencana] Pelacakan Kurir Langsung (Live GPS)** — Pemantauan rute kurir antar-jemput pada peta digital real-time
10. **[Rencana] Unggah Foto Kacamata & Resep Optik** — Upload foto kerusakan frame kacamata dan foto kartu resep dokter

---

## Fitur yang Tidak Dikerjakan (Di Luar Ruang Lingkup 12 Pertemuan)

1. **Integrasi Gerbang Pembayaran Otomatis:** Pembayaran tidak diproses via gateway pihak ketiga (Midtrans/Xendit); transaksi biaya dilakukan secara langsung saat pengantaran.
2. **Notifikasi Real-time Berbasis Socket:** Sistem tidak menggunakan WebSocket; pembaruan status dapat dilihat saat memuat atau me-refresh halaman dashboard.
3. **Pelacakan Posisi GPS Kurir secara Langsung:** Tidak menyertakan integrasi peta langsung (Google Maps API) untuk memantau posisi armada kurir secara real-time.
4. **Sistem Pesan Obrolan Langsung (In-App Chat):** Komunikasi klarifikasi antara pelanggan dan staf optik dilakukan via telepon atau WhatsApp.
5. **Multi-Cabang Optik (Multi-Tenancy):** Sistem dikhususkan untuk operasional satu toko optik (single tenant).
6. **Grafik Analitik Tingkat Lanjut (Chart / BI Dashboard):** Dasbor fokus pada metrik angka ringkas dan tabel operasional tanpa komponen chart visual.

---

## Alur Sistem

Berikut adalah alur pengerjaan layanan antar-jemput kacamata dari awal hingga selesai:

```text
Pelanggan
    │
    ▼
Login / Register
    │
    ▼
Mengajukan Layanan
    │
    ▼
Memilih Jenis Layanan
    │
    ▼
Mengisi Alamat & Jadwal
    │
    ▼
Mengirim Permintaan
    │
    ▼
Admin Memeriksa
    │
    ▼
Menentukan Jadwal
    │
    ▼
Kacamata Diambil
    │
    ▼
Kacamata Diproses
    │
    ▼
Layanan Selesai
    │
    ▼
Kacamata Diantar
```

### Tahapan Status Layanan (State Machine)

```text
pengajuan -> dijadwalkan -> diambil -> diproses -> selesai -> diantar
```

---

## Dokumen Arsitektur Aplikasi

```text
┌──────────────────────────────────────────────────────────────┐
│                    KLIEN (FRONTEND)                          │
│                   React.js (Port 3000)                       │
│                                                              │
│  ┌──────────────┐    ┌───────────────┐    ┌───────────────┐  │
│  │ UI Pages     │    │ Components    │    │ PrivateRoute  │  │
│  │ (Views)      │◄──►│ (Navbar, Form)│◄──►│ (RBAC Guard)  │  │
│  └──────┬───────┘    └───────────────┘    └───────────────┘  │
│         │                                                    │
│         ▼                                                    │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Axios HTTP Client (Interceptors & Auth Bearer Header)  │  │
│  └──────────────────────────────┬─────────────────────────┘  │
└─────────────────────────────────┼────────────────────────────┘
                                  │ JSON over HTTP REST
                                  ▼
┌──────────────────────────────────────────────────────────────┐
│                    SERVER (BACKEND)                          │
│                  Express.js (Port 5000)                      │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Global Middleware (CORS, Express.JSON, Logger)         │  │
│  └──────────────────────────────┬─────────────────────────┘  │
│                                 ▼                            │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Routes Layer (/api/auth, /api/layanan, ...)            │  │
│  └──────────────────────────────┬─────────────────────────┘  │
│                                 ▼                            │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Security Middleware (JWT Auth Verification & RBAC)    │  │
│  └──────────────────────────────┬─────────────────────────┘  │
│                                 ▼                            │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Controllers Layer (Business Logic & Validation)        │  │
│  └──────────────────────────────┬─────────────────────────┘  │
│                                 ▼                            │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Data Access Layer (mysql2 Connection Pool)             │  │
│  └──────────────────────────────┬─────────────────────────┘  │
└─────────────────────────────────┼────────────────────────────┘
                                  │ SQL Queries (TCP 3306)
                                  ▼
┌──────────────────────────────────────────────────────────────┐
│                 BASIS DATA (DATABASE)                        │
│                 MySQL Server (db_kacamata)                   │
│                                                              │
│  ┌──────────────┐    ┌───────────────┐    ┌───────────────┐  │
│  │ users        │1  *│ layanan       │1  *│ detail_       │  │
│  │ (Akun & Role)├────┤ (Transaksi)   ├────┤ layanan       │  │
│  └──────────────┘    └───────────────┘    └───────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Alur Data (Data Flow)

```text
[Browser] -> React App (View) -> Axios HTTP Request
                                      ↓
                            Express Router (/api/endpoint)
                                      ↓
                            Middleware (JWT Auth & Role Check)
                                      ↓
                            Controller (Logika Bisnis & Validasi)
                                      ↓
                            mysql2 Connection Pool -> Eksekusi Query MySQL
                                      ↓
                            Response JSON -> Axios -> Render State di React UI
```

---

## Database

Database dibuat sederhana dengan tiga tabel utama yang ternormalisasi:

### 1. Tabel `users`

| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | INT AUTO_INCREMENT | Primary Key |
| `nama` | VARCHAR(100) NOT NULL | Nama lengkap pengguna |
| `email` | VARCHAR(100) UNIQUE NOT NULL | Email akun pengguna |
| `password` | VARCHAR(255) NOT NULL | Password terenkripsi BCrypt |
| `role` | ENUM('pelanggan', 'admin') | Peran otorisasi (default: 'pelanggan') |
| `no_telepon` | VARCHAR(20) | Nomor telepon / WhatsApp |
| `created_at` | TIMESTAMP | Waktu pendaftaran akun |

### 2. Tabel `layanan`

| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | INT AUTO_INCREMENT | Primary Key |
| `user_id` | INT NOT NULL | Foreign Key ke `users.id` (ON DELETE CASCADE) |
| `jenis_layanan` | ENUM('perbaikan', 'penggantian_lensa') | Jenis permohonan servis |
| `keluhan` | TEXT NOT NULL | Deskripsi kerusakan atau kebutuhan lensa |
| `alamat` | TEXT NOT NULL | Alamat penjemputan dan pengantaran |
| `tanggal_jemput` | DATE NOT NULL | Tanggal penjemputan frame |
| `jam_jemput` | TIME NOT NULL | Waktu penjemputan frame |
| `status` | ENUM('pengajuan', 'dijadwalkan', 'diambil', 'diproses', 'selesai', 'diantar') | Status pengerjaan servis (default: 'pengajuan') |
| `created_at` | TIMESTAMP | Waktu transaksi dibuat |

### 3. Tabel `detail_layanan`

| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | INT AUTO_INCREMENT | Primary Key |
| `layanan_id` | INT NOT NULL | Foreign Key ke `layanan.id` (ON DELETE CASCADE) |
| `jenis_kacamata` | VARCHAR(100) NOT NULL | Model atau tipe frame kacamata |
| `detail_perbaikan` | TEXT | Tindakan servis atau rincian lensa baru |
| `keterangan` | TEXT | Catatan instruksi khusus |

### Relasi Basis Data

```text
users
  │
  │ 1
  │
  │ *
  ▼
layanan
  │
  │ 1
  │
  │ *
  ▼
detail_layanan
```

---

## Daftar Lengkap API Endpoint

Seluruh endpoint menerima dan mengembalikan data dalam format JSON. Endpoint bertanda `[Auth]` mewajibkan header `Authorization: Bearer <token_jwt>`.

### 1. Autentikasi (`/api/auth`)

| Method | Endpoint | Akses | Deskripsi & Payload Request |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Publik | Mendaftarkan akun pelanggan baru.<br>`Body: { "nama", "email", "password", "no_telepon" }` |
| `POST` | `/api/auth/login` | Publik | Otentikasi login dan menerbitkan token JWT.<br>`Body: { "email", "password" }` |
| `GET` | `/api/auth/me` | `[Auth]` | Mengambil data profil pengguna yang sedang login dari token JWT. |

### 2. Layanan Antar-Jemput (`/api/layanan`)

| Method | Endpoint | Akses | Deskripsi & Payload Request |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/layanan` | `[Auth]` | Mengambil daftar pesanan (Admin: semua pesanan; Pelanggan: milik sendiri). |
| `GET` | `/api/layanan/:id` | `[Auth]` | Mengambil rincian lengkap satu transaksi layanan beserta detail kacamata. |
| `POST` | `/api/layanan` | `[Auth]` | Membuat permohonan servis antar-jemput baru.<br>`Body: { "jenis_layanan", "keluhan", "alamat", "tanggal_jemput", "jam_jemput", "jenis_kacamata", "detail_perbaikan", "keterangan" }` |
| `PUT` | `/api/layanan/:id/status` | `[Auth Admin]` | Memperbarui tahapan status pengerjaan servis.<br>`Body: { "status": "pengajuan|dijadwalkan|diambil|diproses|selesai|diantar" }` |
| `DELETE` | `/api/layanan/:id` | `[Auth]` | Membatalkan / menghapus rekaman pesanan layanan. |

### 3. Detail Kacamata (`/api/detail-layanan`)

| Method | Endpoint | Akses | Deskripsi & Payload Request |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/detail-layanan/layanan/:layanan_id` | `[Auth]` | Mengambil data detail kacamata berdasarkan ID induk transaksi layanan. |
| `GET` | `/api/detail-layanan/:id` | `[Auth]` | Mengambil spesifikasi teknis kacamata berdasarkan ID detail. |
| `POST` | `/api/detail-layanan` | `[Auth]` | Menambahkan data detail kacamata baru ke suatu pesanan. |
| `PUT` | `/api/detail-layanan/:id` | `[Auth]` | Memperbarui rincian frame atau catatan perbaikan kacamata. |
| `DELETE` | `/api/detail-layanan/:id` | `[Auth]` | Menghapus data rincian teknis kacamata. |

### 4. Health Check

| Method | Endpoint | Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Publik | Menampilkan pesan selamat datang, status server, dan daftar endpoint. |
| `GET` | `/api/health` | Publik | Monitoring kesiapan server (mengembalikan `{ "status": "UP" }`). |

---

## Halaman Sistem (Frontend Routing)

| Rute URL | Nama Tampilan | Deskripsi Komponen | Hak Akses |
| :--- | :--- | :--- | :--- |
| `/` | Beranda (Landing Page) | Halaman pengenalan layanan optik (`Home.js`) | Publik |
| `/login` | Login | Formulir login pengguna dan admin (`Login.js`) | Publik |
| `/register` | Register | Formulir pendaftaran akun pelanggan baru (`Register.js`) | Publik |
| `/dashboard` | Dashboard Pelanggan | Ringkasan kartu status dan riwayat pesanan (`Dashboard.js`) | Pelanggan |
| `/layanan/buat` | Pengajuan Layanan | Formulir pemesanan layanan antar-jemput (`BuatLayanan.js`) | Pelanggan |
| `/layanan/:id` | Detail Layanan | Informasi lengkap status pesanan pelanggan (`DetailLayanan.js`) | Pelanggan |
| `/admin/dashboard` | Dashboard Admin | Ringkasan statistik dan metrik antrean optik (`AdminDashboard.js`) | Admin |
| `/admin/layanan` | Daftar Layanan | Tabel manajemen seluruh pesanan pelanggan (`DaftarLayanan.js`) | Admin |
| `/admin/layanan/:id` | Detail Layanan Admin | Panel kontrol perubahan status pengerjaan (`AdminDetailLayanan.js`) | Admin |

---

## Keamanan

- Autentikasi JWT via Bearer Token pada Authorization Header
- Role-Based Access Control (RBAC) middleware di backend (`auth.js` dan `adminAuth.js`) + proteksi `PrivateRoute.js` di frontend
- Hashing password dengan BCrypt (salt rounds terstandar)
- Parameterized SQL Queries untuk mencegah SQL Injection pada pustaka `mysql2`
- Environment variables terisolasi di `.env` (tidak di-commit ke Git)

---

## Target Keberhasilan

Target berikut adalah sasaran produk aplikasi tugas RPL. Yang sudah terpenuhi ditandai:

- Aplikasi bersifat Runnable: Backend (Port 5000) dan Frontend (Port 3000) berhasil dijalankan tanpa error kompilasi — **terpenuhi**
- UI berhasil muncul: Seluruh halaman antarmuka pengguna dapat dibuka dan ditampilkan di browser — **terpenuhi**
- Autentikasi dan RBAC: Register, login, penerbitan JWT, serta pembatasan peran admin dan pelanggan bekerja — **terpenuhi**
- CRUD Transaksi dan Detail: Data tersimpan dan terbaca secara konsisten dari basis data MySQL — **terpenuhi**
- Alur State Machine Status: Admin dapat memperbarui tahapan status layanan secara berurutan dan terlihat oleh pelanggan — **terpenuhi**
- Desain Responsif: Tata letak antarmuka tetap rapi pada layar monitor desktop maupun perangkat mobile — **terpenuhi**
- Waktu respons API: Target < 300 ms (belum diuji secara formal di bawah beban tinggi)
- Efisiensi waktu pelanggan: Terpangkas >= 80% dibandingkan harus datang fisik ke optik (sasaran produk)

---

## Hasil Verifikasi Pengujian Sistem

| No | Modul / Skenario Pengujian | Hasil yang Diharapkan | Status |
| :---: | :--- | :--- | :---: |
| 1 | Backend API (`npm run dev`) | Server mendengarkan koneksi di port 5000 | **Berhasil** |
| 2 | Frontend React (`npm start`) | Webpack mengompilasi dan membuka browser di port 3000 | **Berhasil** |
| 3 | Koneksi Basis Data MySQL | Driver `mysql2` tersambung ke database `db_kacamata` | **Berhasil** |
| 4 | Health Check Endpoint | Endpoint `GET /api/health` membalas JSON `{ "status": "UP" }` | **Berhasil** |
| 5 | Registrasi Akun Pelanggan | Pengguna baru tersimpan di tabel `users` dengan sandi terenkripsi | **Berhasil** |
| 6 | Login dan Penerbitan JWT | Kredensial valid menghasilkan token dan mengarahkan ke dashboard | **Berhasil** |
| 7 | Pengajuan Servis Baru | Data tersimpan serentak pada tabel `layanan` dan `detail_layanan` | **Berhasil** |
| 8 | Proteksi Rute Administratif | Pelanggan biasa diblokir saat mencoba mengakses rute admin | **Berhasil** |
| 9 | Perubahan Status Servis | Admin dapat mengubah status pengerjaan dan terlihat oleh pelanggan | **Berhasil** |

---

## Status Project

**Status:** Aplikasi Runnable — UI Berhasil Muncul & Terverifikasi Penuh

Project ini dibuat dan diselesaikan sebagai tugas **Mata Kuliah Rekayasa Perangkat Lunak (RPL)**. Seluruh fungsionalitas inti, dokumentasi arsitektur, dan basis kode telah siap digunakan untuk presentasi dan pengujian live demo.

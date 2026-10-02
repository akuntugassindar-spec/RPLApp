# OptikExpress — Sistem Informasi Layanan Antar-Jemput Kacamata

Sistem Informasi Layanan Antar-Jemput Kacamata untuk Perbaikan dan Penggantian Lensa Berbasis Web

**OptikExpress** adalah aplikasi web layanan servis dan penggantian lensa kacamata terintegrasi yang dibuat untuk membantu pelanggan dalam melakukan permintaan layanan perbaikan kacamata atau penggantian lensa tanpa harus datang langsung ke toko optik fisik. Sistem ini menjembatani komunikasi dan alur data operasional antara pelanggan dan administrator toko optik, mulai dari pengajuan perbaikan, penjemputan frame, pemrosesan teknis di laboratorium optik, hingga pengantaran kacamata kembali ke alamat pelanggan.

---

## Tech Stack

- **Backend:** Node.js, Express.js 4, RESTful API
- **Frontend:** React.js 18, React Router DOM v6, Axios, CSS3 Responsif
- **Database:** MySQL 8.0 / MariaDB (Driver: `mysql2` dengan Connection Pool)
- **Arsitektur:** Decoupled Client-Server, MVC Pattern, RESTful API, JWT + RBAC

---

## Prerequisites

Sebelum mulai, pastikan hal berikut sudah terpenuhi:

| Kebutuhan | Keterangan |
| :--- | :--- |
| **Node.js** | Versi >= 16.x (disarankan LTS 18.x atau 20.x). Cek dengan `node --version`. |
| **npm** | Node Package Manager (otomatis terpasang). Cek dengan `npm --version`. |
| **MySQL / MariaDB** | Melalui XAMPP, Laragon, atau MySQL Server standalone. Cek status di port `3306`. |
| **Port bebas** | Port `3000` (frontend), `5000` (backend), dan `3306` (MySQL) tidak dipakai aplikasi lain. |
| **Koneksi internet** | Diperlukan saat install pertama (download dependency npm). |

> **Catatan untuk pengguna Windows:** Seluruh perintah di panduan ini dijalankan di **PowerShell** atau **Git Bash**. Kalau memakai CMD, perintah `cp` diganti `copy`.

---

## Quick Start — Cara Termudah & Disarankan

Cara ini menjalankan backend dan frontend secara langsung di lingkungan lokal.

### 1. Masuk ke Folder Project

```bash
cd RPLApp
```

### 2. Setup Basis Data MySQL

1. Pastikan modul MySQL pada XAMPP atau Laragon sudah aktif (Running di port `3306`).
2. Buka phpMyAdmin di browser (`http://localhost/phpmyadmin`) atau terminal MySQL.
3. Impor skrip SQL dari direktori:
   ```text
   backend/database/schema.sql
   ```
   Atau via terminal:
   ```bash
   mysql -u root -p < backend/database/schema.sql
   ```
   Skrip ini otomatis membuat database `db_kacamata`, seluruh tabel berelasi (`users`, `layanan`, `detail_layanan`), serta otomatis mengisi akun demo (auto-seed).

### 3. Buat File `.env`

File `.env` menyimpan konfigurasi database dan keamanan. Template-nya sudah tersedia di `backend/.env.example`.

```bash
cd backend
cp .env.example .env
```

Lalu buka `backend/.env` dan isi nilainya:

```dotenv
# Server
PORT=5000

# Database MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=db_kacamata
DB_PORT=3306

# Keamanan Backend
JWT_SECRET=super_secret_jwt_kacamata_key_2026_universitas
JWT_EXPIRES_IN=24h
```

Generate `JWT_SECRET` (opsional jika ingin secret acak baru, minimal 32 karakter):

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

Copy hasilnya ke baris `JWT_SECRET=` pada file `.env`.

> **Penting:** Jangan pakai `echo "JWT_SECRET=..." > .env`. Tanda `>` akan menimpa seluruh isi `.env`. Kalau mau menambah lewat terminal, pakai `>>` (append) atau edit manual dengan text editor.

### 4. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

> Pemasangan dependensi pada build pertama memakan waktu 1–3 menit. Ini normal. Build berikutnya jauh lebih cepat karena cache.

### 5. Jalankan Aplikasi

Jalankan melalui skrip otomatis sekali klik:

```bash
# Windows (klik ganda atau via terminal)
./jalankan_aplikasi.bat
```

Atau buka 2 terminal:
- Terminal 1 (Backend): `cd backend && npm run dev`
- Terminal 2 (Frontend): `cd frontend && npm start`

### 6. Verifikasi Semua Service Jalan

Tunggu 10–15 detik setelah start, lalu cek health endpoint backend:

```bash
curl http://localhost:5000/api/health
```

Harus membalas:

```json
{
  "status": "UP",
  "timestamp": "2026-10-02T..."
}
```

Cek root endpoint:

```bash
curl http://localhost:5000
```

Harus membalas:

```json
{
  "success": true,
  "message": "Selamat Datang di API Sistem Informasi Layanan Antar-Jemput Kacamata"
}
```

### 7. Akses Aplikasi & Login

Buka browser:

```text
http://localhost:3000
```

Saat pertama kali dijalankan, backend otomatis menggunakan data tabel dan akun demo yang telah di-seed via `schema.sql`. Jadi kamu bisa langsung login tanpa setup database manual.

Akun demo yang tersedia — password semuanya `admin123`:

| Username / Email | Role | Password | Hak Akses |
| :--- | :--- | :--- | :--- |
| `admin@optik.com` | `admin` | `admin123` | Akses penuh dashboard admin, kelola pesanan, ubah status pengerjaan |
| `bahrul@gmail.com` | `pelanggan` | `admin123` | Pengajuan layanan, lihat histori, pantau perkembangan status sendiri |

> Gunakan akun `admin` untuk akses penuh, dan akun `pelanggan` untuk mencoba pembatasan hak akses (RBAC) per role.

### 8. Stop & Cleanup

Tekan `Ctrl + C` di masing-masing terminal (backend & frontend), atau tutup jendela terminal yang dibuka oleh `jalankan_aplikasi.bat`. Data pada database MySQL tetap tersimpan aman.

---

## Troubleshooting

| Masalah | Penyebab | Solusi |
| :--- | :--- | :--- |
| `port 5000 is already allocated` | Port 5000 dipakai proses lain | Matikan aplikasi tersebut, atau ubah `PORT=5001` di `backend/.env` |
| `port 3000 is already allocated` | Port 3000 dipakai proses lain | Saat ditanya `run on another port?`, ketik `Y` (akan berjalan di port 3001) |
| `FATAL: ER_ACCESS_DENIED_ERROR` | Kredensial MySQL salah di `.env` | Cek `DB_USER` dan `DB_PASSWORD` di `backend/.env` |
| `FATAL: ER_BAD_DB_ERROR` | Database `db_kacamata` belum dibuat | Impor ulang berkas `backend/database/schema.sql` |
| `FATAL: JWT_SECRET not set in .env` | `JWT_SECRET` masih kosong atau placeholder | Isi dengan string acak minimal 32 karakter |
| `Cannot find module 'express'` | Backend belum `npm install` | Masuk ke folder `backend/` lalu jalankan `npm install` |
| `Cannot find module 'react'` | Frontend belum `npm install` | Masuk ke folder `frontend/` lalu jalankan `npm install` |
| Halaman blank / `Failed to fetch` | Backend belum aktif di port 5000 | Pastikan terminal backend running sebelum membuka browser |
| Perubahan kode tidak muncul | Cache browser | Hard refresh peramban (`Ctrl + Shift + R` atau `Ctrl + F5`) |
| Tidak bisa login | Database belum ter-seed | Buka phpMyAdmin, jalankan query baris 51–131 pada `schema.sql` |

---

## Struktur Project

```text
RPLApp/
├── backend/                            # API Node.js (Express + mysql2)
│   ├── config/                         # Koneksi database MySQL connection pool (db.js)
│   ├── controllers/                    # Handler authController, layananController, detailLayananController
│   ├── database/                       # schema.sql (DDL tabel + seed data akun & transaksi)
│   ├── middleware/                     # Middleware JWT auth & admin RBAC verification
│   ├── routes/                         # Definisi rute RESTful API (auth, layanan, detail-layanan)
│   ├── .env.example                    # Template konfigurasi environment backend
│   ├── server.js                       # Titik masuk utama server Express
│   └── package.json                    # Dependensi server Express
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
│   └── package.json                    # Dependensi frontend (proxy port 5000)
├── jalankan_aplikasi.bat               # Skrip batch otomatisasi eksekusi ganda Windows
├── powershell.bat                      # Utilitas peluncur PowerShell
├── .env.example                        # Template konfigurasi environment root
├── .gitignore                          # Pengabaian git (.env, node_modules, build)
└── README.md                           # Dokumentasi komprehensif proyek
```

---

## Quick Start (Local) — Tanpa Script Otomatis

Untuk development yang butuh hot-reload lebih cepat atau debugging langsung per service.

### 1. Install Dependencies

Pastikan Node.js dan MySQL sudah terpasang:

```bash
node --version      # minimal 16.x
npm --version       # minimal 8.x
mysql --version
```

### 2. Start MySQL Service

- Nyalakan modul MySQL pada XAMPP Control Panel atau Laragon.
- Pastikan port `3306` berstatus aktif.

### 3. Setup Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

-> Backend jalan di `http://localhost:5000`. Database dan akun demo otomatis aktif melalui `schema.sql`.

### 4. Setup Frontend

```bash
cd frontend
npm install
npm start
```

-> Frontend jalan di `http://localhost:3000`. Frontend mem-proxy request `/api` ke `http://localhost:5000` via konfigurasi proxy di `frontend/package.json`.

### 5. Stop Services

Tekan `Ctrl + C` di masing-masing jendela terminal.

---

## Security Notes

- `.env` **TIDAK** di-commit (ada di `.gitignore`).
- `.env.example` hanya template dengan placeholder.
- `JWT_SECRET` harus random minimal 32 karakter: `openssl rand -base64 32`.
- Password disimpan terenkripsi menggunakan **BCrypt** hashing.
- Token dikirim via header `Authorization: Bearer <token_jwt>`.
- Rute terproteksi ganda: Middleware `auth.js` dan `adminAuth.js` di backend, serta `PrivateRoute.js` di frontend.
- Parameterized SQL queries pada seluruh endpoint controller untuk memitigasi serangan SQL Injection.
- **Akun demo di atas hanya untuk keperluan development/demo.** Untuk production, ganti seluruh password dan hapus seeder akun demo.

---

## Dokumen Lengkap

### Dokumen Produk & Ide

| File | Deskripsi |
| :--- | :--- |
| `LAPORAN_IMPLEMENTASI_P3.docx` | Laporan formal implementasi P3 dalam format Microsoft Word |
| `LAPORAN_IMPLEMENTASI_P3.md` | Laporan implementasi tugas P3 (spesifikasi sistem, arsitektur, dan kode sumber) |
| `backend/database/schema.sql` | Skrip lengkap DDL tabel basis data dan seed data awal pengujian |
| `backend/README.md` | Dokumentasi teknis endpoint API, panduan instalasi, dan payload backend |

### Dokumen Panduan Pengembangan

| File | Deskripsi |
| :--- | :--- |
| `CATATAN_PERBAIKAN_ERROR.md` | Log pencatatan error, identifikasi penyebab, dan solusi perbaikan kode |
| `PERBANDINGAN_KODE_ERROR_DAN_FIX.md` | Komparasi kode sebelum dan sesudah perbaikan bug |
| `jalankan_aplikasi.bat` | Skrip otomatisasi sekali-klik untuk menjalankan backend dan frontend serentak |

---

## Masalah yang Diselesaikan

1. **Hambatan Mobilitas & Waktu** — Pelanggan aktif kesulitan menyisihkan waktu di jam kerja untuk datang langsung ke toko optik fisik hanya untuk perbaikan frame atau ganti lensa.
2. **Pencatatan Terfragmentasi** — Formulir keluhan lensa, ukuran minus/silinder, dan alamat kurir konvensional menggunakan nota kertas yang rawan hilang atau tertukar.
3. **Ketiadaan Transparansi Status** — Pelanggan tidak mengetahui perkembangan proses reparasi kacamata (apakah sudah diambil, sedang diproses di lab, atau sudah selesai) tanpa menelepon toko secara berulang.
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

Untuk menjaga kelayakan penyelesaian proyek dalam kurun waktu 12 pertemuan perkuliahan RPL, fitur-fitur berikut disepakati berada di luar cakupan rilis pertama:

1. **Integrasi Gerbang Pembayaran Otomatis (Payment Gateway):** Pembayaran tidak diproses via gateway pihak ketiga (Midtrans/Xendit); transaksi biaya dilakukan secara langsung saat pengantaran.
2. **Notifikasi Real-time Berbasis Socket:** Sistem tidak menggunakan WebSocket; pembaruan status dapat dilihat saat memuat atau me-refresh halaman dashboard.
3. **Pelacakan Posisi GPS Kurir secara Langsung:** Tidak menyertakan integrasi peta langsung (Google Maps API) untuk memantau posisi armada kurir secara real-time.
4. **Sistem Pesan Obrolan Langsung (In-App Chat):** Komunikasi klarifikasi antara pelanggan dan staf optik dilakukan via telepon atau WhatsApp.
5. **Multi-Cabang Optik (Multi-Tenancy):** Sistem dikhususkan untuk operasional satu toko optik (single tenant).
6. **Grafik Analitik Tingkat Lanjut (Chart / BI Dashboard):** Dasbor fokus pada metrik angka ringkas dan tabel operasional tanpa komponen chart/grafik visual.
7. **Unggah Foto Kerusakan Frame & Kartu Resep:** Input spesifikasi kacamata dan ukuran resep dicatat dalam bentuk teks terstruktur.
8. **Sistem Rating dan Ulasan Layanan:** Belum menyertakan modul review dan rating kepuasan pelanggan.

---

## Alur Sistem

```text
Pelanggan
    ↓
Login / Register
    ↓
Mengajukan Layanan
    ↓
Memilih Jenis Layanan
    ↓
Mengisi Alamat & Jadwal
    ↓
Mengirim Permintaan
    ↓
Admin Memeriksa
    ↓
Menentukan Jadwal
    ↓
Kacamata Diambil
    ↓
Kacamata Diproses
    ↓
Layanan Selesai
    ↓
Kacamata Diantar
```

---

## Dokumen Arsitektur Aplikasi

Aplikasi dibangun menggunakan arsitektur Client-Server Terpisah (Decoupled SPA + RESTful API) dengan pemisahan tanggung jawab:

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
[Browser] → React App (View) → Axios HTTP Request
                                     ↓
                           Express Router (/api/endpoint)
                                     ↓
                           Middleware (JWT Auth & Role Check)
                                     ↓
                           Controller (Logika Bisnis & Validasi)
                                     ↓
                           mysql2 Connection Pool → Eksekusi Query MySQL
                                     ↓
                           Response JSON → Axios → Render State di React UI
```

---

## Database

Database dibuat sederhana dengan tiga tabel utama yang ternormalisasi:

### 1. Tabel `users`

Menyimpan data identitas akun pengguna, baik pelanggan maupun administrator.

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

Menyimpan data transaksi pengajuan servis antar-jemput kacamata.

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

Menyimpan spesifikasi teknis kacamata yang diperbaiki atau diganti lensanya.

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

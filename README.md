# OptikExpress — Sistem Informasi Layanan Antar-Jemput Kacamata

Sistem Informasi Layanan Antar-Jemput Kacamata untuk Perbaikan dan Penggantian Lensa Berbasis Web

**OptikExpress** adalah aplikasi web layanan servis dan penggantian lensa kacamata terintegrasi yang dibuat untuk membantu pelanggan dalam melakukan permintaan layanan perbaikan kacamata atau penggantian lensa tanpa harus datang langsung ke toko optik fisik. Sistem ini menjembatani komunikasi dan alur data operasional antara pelanggan dan administrator toko optik, mulai dari pengajuan perbaikan, penjemputan frame, pemrosesan teknis di laboratorium optik, hingga pengantaran kacamata kembali ke alamat pelanggan.

---

## Tech Stack

| Layer | Teknologi | Versi | Peran dalam Sistem |
| :--- | :--- | :--- | :--- |
| Backend | Node.js | >= 16.x | Lingkungan runtime eksekusi JavaScript sisi server |
| Framework API | Express.js | 4.19.2 | Routing HTTP, middleware pipeline, RESTful API |
| Database Driver | mysql2 | 3.9.7 | Komunikasi query MySQL dengan Connection Pooling |
| Keamanan Auth | jsonwebtoken | 9.0.2 | Penerbitan dan validasi token sesi stateless (JWT) |
| Enkripsi Sandi | bcryptjs | 2.4.3 | Hashing password dengan salt sebelum simpan database |
| Frontend UI | React.js | 18.2.0 | Pustaka antarmuka pengguna interaktif (SPA) |
| Perutean Halaman | React Router DOM | 6.22.3 | Navigasi halaman sisi klien dan proteksi rute privat |
| HTTP Client | Axios | 1.6.8 | Pengiriman request asynchronous ke backend |
| Database | MySQL / MariaDB | 8.0 / 10.4+ | Sistem Manajemen Basis Data Relasional (RDBMS) |
| Kontainerisasi | Docker & Compose | v2+ | Orkestrasi kontainer database MySQL, backend, & frontend |

---

## Prerequisites

Sebelum mulai, pastikan hal berikut sudah terpenuhi:

| Kebutuhan | Keterangan |
| :--- | :--- |
| **Node.js** | Versi >= 16.x (disarankan LTS 18.x atau 20.x). Cek dengan `node --version`. |
| **npm** | Node Package Manager (otomatis terpasang). Cek dengan `npm --version`. |
| **MySQL / MariaDB** | Melalui XAMPP, Laragon, MySQL Server standalone, atau Docker. Cek status di port `3306`. |
| **Port bebas** | Port `3000` (frontend), `5000` (backend), dan `3306` (MySQL) tidak dipakai aplikasi lain. |
| **Koneksi internet** | Diperlukan saat install pertama (download dependency npm / image Docker). |

> **Catatan untuk pengguna Windows:** Seluruh perintah di panduan ini dijalankan di **PowerShell** atau **Git Bash**. Kalau memakai CMD, perintah `cp` diganti `copy`.

---

## Quick Start (Cara Termudah & Disarankan)

Cara ini menjalankan backend dan frontend secara langsung di lingkungan lokal menggunakan skrip otomatis yang telah disediakan.

### 1. Masuk ke Folder Project

```bash
cd RPLApp
```

### 2. Setup Basis Data MySQL

1. Pastikan modul MySQL pada XAMPP (`C:\xampp\xampp-control.exe`) atau Laragon sudah aktif (Running di port `3306`).
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
# Windows (klik ganda berkas atau via terminal)
./jalankan_aplikasi.bat
```

Atau buka 2 terminal di VS Code:
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

Buka browser di:

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

Panduan penanganan kendala teknis yang disesuaikan secara presisi dengan struktur direktori dan konfigurasi proyek **RPLApp**:

| Masalah | Kemungkinan Penyebab | Solusi Berdasarkan Folder Project |
| :--- | :--- | :--- |
| `port 5000 is already allocated` | Port backend 5000 sedang terpakai oleh proses Node.js lain | Buka Task Manager lalu matikan proses **Node.js**, atau ubah baris `PORT=5001` di berkas `backend/.env` |
| `port 3000 is already allocated` | Port frontend 3000 sedang dipakai oleh aplikasi React lain | Saat terminal frontend menanyakan `Would you like to run the app on another port instead?`, ketik `Y` (otomatis jalan di port 3001) |
| `[Database Error] connect ECONNREFUSED 127.0.0.1:3306` | Layanan MySQL pada XAMPP atau Laragon belum diaktifkan | Buka **XAMPP Control Panel** (`C:\xampp\xampp-control.exe`) atau Laragon, lalu klik tombol **Start** pada baris **MySQL** hingga berwarna hijau |
| `FATAL: ER_ACCESS_DENIED_ERROR` | Kredensial user atau password MySQL di file konfigurasi tidak cocok | Buka file `backend/.env`, periksa baris `DB_USER=root` dan `DB_PASSWORD=`. Kosongkan `DB_PASSWORD=` jika menggunakan standar default XAMPP |
| `FATAL: ER_BAD_DB_ERROR: Unknown database 'db_kacamata'` | Database `db_kacamata` belum dibuat atau belum diimpor | Buka phpMyAdmin (`http://localhost/phpmyadmin`), lalu impor berkas skema yang ada di `backend/database/schema.sql` |
| `Cannot find module 'express'` / modul backend tidak ditemukan | Folder `backend/node_modules` belum ada atau belum diinstal | Buka terminal, masuk ke folder `backend` (`cd backend`), lalu jalankan perintah `npm install` |
| `Cannot find module 'react'` / modul frontend tidak ditemukan | Folder `frontend/node_modules` belum ada atau belum diinstal | Buka terminal, masuk ke folder `frontend` (`cd frontend`), lalu jalankan perintah `npm install` |
| Halaman blank putih / `Failed to fetch` / `Network Error` | Backend di port 5000 belum aktif saat frontend memanggil API `/api/*` | Pastikan terminal backend sudah menampilkan `Server Layanan Kacamata berjalan aktif di port 5000` sebelum membuka browser |
| `docker : The term 'docker' is not recognized` | Perintah `docker` diketik namun aplikasi Docker Desktop belum terinstal di Windows | Jalankan aplikasi secara langsung menggunakan file `.\jalankan_aplikasi.bat` tanpa Docker, atau instal Docker Desktop dari situs resmi |
| Gagal Login / `Pengguna tidak ditemukan` | Akun demo bawaan belum ter-seed ke dalam tabel `users` | Buka phpMyAdmin, pilih database `db_kacamata`, lalu jalankan query INSERT data awal dari baris 51–131 pada file `backend/database/schema.sql` |
| Perubahan kode atau tampilan tidak muncul di browser | Cache peramban lokal masih menyimpan kompilasi berkas lama | Lakukan Hard Refresh pada peramban web dengan menekan kombinasi tombol `Ctrl + Shift + R` atau `Ctrl + F5` |
| Jendela `jalankan_aplikasi.bat` langsung tertutup tiba-tiba | Path direktori atau Node.js belum dikenali di Environment PATH Windows | Pastikan Node.js sudah terpasang (`node -v`). Buka berkas `jalankan_aplikasi.bat` atau jalankan terpisah via 2 terminal di VS Code |

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
│   ├── .dockerignore                   # Berkas pengabaian build Docker backend
│   ├── .env.example                    # Template konfigurasi environment backend
│   ├── Dockerfile                      # Spesifikasi kontainerisasi backend
│   ├── package.json                    # Dependensi server Express
│   └── server.js                       # Titik masuk utama server Express
├── frontend/                           # SPA React.js
│   ├── public/                         # index.html & aset publik
│   ├── src/
│   │   ├── components/                 # Komponen antarmuka global (Navbar.js)
│   │   ├── pages/                      # Tampilan antarmuka sistem (Views)
│   │   │   ├── admin/                  # Halaman Administrator (AdminDashboard, DaftarLayanan, AdminDetailLayanan)
│   │   │   ├── user/                   # Halaman Pelanggan / User (Dashboard, BuatLayanan, DetailLayanan)
│   │   │   ├── Home.js                 # Beranda landing page publik
│   │   │   ├── Login.js                # Formulir login pengguna & admin
│   │   │   └── Register.js             # Formulir pendaftaran akun pelanggan baru
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
| `/` | Beranda (Landing Page) | Halaman pengenalan layanan optik (`pages/Home.js`) | Publik |
| `/login` | Login | Formulir login pengguna dan admin (`pages/Login.js`) | Publik |
| `/register` | Register | Formulir pendaftaran akun pelanggan baru (`pages/Register.js`) | Publik |
| `/dashboard` | Dashboard Pelanggan | Ringkasan kartu status dan riwayat pesanan (`pages/user/Dashboard.js`) | Pelanggan |
| `/layanan/buat` | Pengajuan Layanan | Formulir pemesanan layanan antar-jemput (`pages/user/BuatLayanan.js`) | Pelanggan |
| `/layanan/:id` | Detail Layanan | Informasi lengkap status pesanan pelanggan (`pages/user/DetailLayanan.js`) | Pelanggan |
| `/admin/dashboard` | Dashboard Admin | Ringkasan statistik dan metrik antrean optik (`pages/admin/AdminDashboard.js`) | Admin |
| `/admin/layanan` | Daftar Layanan | Tabel manajemen seluruh pesanan pelanggan (`pages/admin/DaftarLayanan.js`) | Admin |
| `/admin/layanan/:id` | Detail Layanan Admin | Panel kontrol perubahan status pengerjaan (`pages/admin/AdminDetailLayanan.js`) | Admin |

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

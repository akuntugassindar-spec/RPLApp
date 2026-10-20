# OptikExpress — Sistem Informasi Layanan Antar-Jemput Kacamata

**OptikExpress** adalah aplikasi web layanan perbaikan dan penggantian lensa kacamata terintegrasi berbasis antar-jemput yang dirancang untuk mempermudah masyarakat merawat alat bantu penglihatan tanpa harus datang langsung ke toko optik fisik. Sistem ini menjembatani alur operasional antara pelanggan, teknisi laboratorium optik, dan armada kurir lapangan secara terpusat.

## Tech Stack

- **Backend:** Node.js (Express.js), MySQL 8.0 / MariaDB (`mysql2/promise`)
- **Frontend:** React.js 18 (SPA), Leaflet (OpenStreetMap), Axios HTTP Client
- **Arsitektur:** Decoupled Monorepo, RESTful API, State Machine 6 Tahapan, Anti-IDOR Security
- **Pengujian Otomatis:** Node.js Native Test Runner (`node:test`, `node:assert/strict`) — 48 passing unit tests (100% lulus)

---

## Prerequisites

Sebelum mulai, pastikan hal berikut sudah terpenuhi:

| Kebutuhan | Keterangan |
| :--- | :--- |
| **Docker Desktop** | Windows / macOS / Linux. Untuk Windows disarankan mengaktifkan backend **WSL 2**. |
| **Docker Compose v2** | Sudah termasuk di Docker Desktop. Cek dengan `docker compose version`. |
| **Node.js & npm** | Minimal Node.js 16.x (disarankan LTS 18.x / 20.x). Cek dengan `node -v` dan `npm -v`. |
| **MySQL / MariaDB** | Melalui XAMPP, Laragon, MySQL standalone, atau Docker di port `3306`. |
| **Port bebas** | Port `3000`, `5000`, dan `3306` tidak dipakai aplikasi lain. |
| **Koneksi internet** | Diperlukan saat build pertama (download image + dependency). |

> **Catatan untuk pengguna Windows:** seluruh perintah di panduan ini dijalankan di **PowerShell** atau **Git Bash**. Kalau memakai CMD, perintah `cp` diganti `copy`.

---

## Quick Start (Docker) — Cara Termudah & Disarankan

Cara ini **tidak perlu** mengonfigurasi database MySQL secara manual. Semua service sudah dibungkus di dalam Docker Compose.

### 1. Masuk ke Folder Project

```bash
cd "RPLApp"
```

### 2. Buat File `.env`

File `.env` menyimpan konfigurasi database dan keamanan. Template-nya sudah tersedia di `backend/.env.example`.

```bash
cp backend/.env.example backend/.env
```

Lalu buka `backend/.env` dan isi nilainya:

```dotenv
# Server
PORT=5000

# MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=db_kacamata
DB_PORT=3306

# Keamanan Backend
JWT_SECRET=super_secret_jwt_kacamata_key_2026_universitas_rpl
JWT_EXPIRES_IN=24h
```

**Generate `JWT_SECRET`** (wajib, minimal 32 karakter):

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

Copy hasilnya ke baris `JWT_SECRET=` pada file `backend/.env`.

> **Penting:** jangan pakai `echo "JWT_SECRET=..." > .env`. Tanda `>` akan **menimpa seluruh isi** `.env`. Kalau mau menambah lewat terminal, pakai `>>` (append) atau edit manual dengan text editor.

### 3. Build & Run

```bash
# Build semua image + start containers di background
docker compose up --build -d
```

> **Build pertama memakan waktu 2–5 menit** (download image MySQL & Node, `npm install`). Ini normal. Build berikutnya jauh lebih cepat karena cache.

### 4. Verifikasi Semua Service Jalan

Tunggu ±20 detik setelah build selesai, lalu cek:

```bash
docker compose ps
```

Semua service harus berstatus **`Up`**:

```text
NAME               SERVICE    STATUS
rplapp-mysql-1     mysql      Up             0.0.0.0:3306->3306/tcp
rplapp-backend-1   backend    Up             0.0.0.0:5000->5000/tcp
rplapp-frontend-1  frontend   Up             0.0.0.0:3000->3000/tcp
```

Cek health endpoint backend:

```bash
curl http://localhost:5000/api/health
```

Harus membalas:

```json
{ "status": "UP", "timestamp": "2026-10-20T..." }
```

> Kalau ada service yang **`Exit`** atau **`Restarting`**, cek log-nya: `docker compose logs backend` (atau ganti `backend` dengan nama service lain).

### 5. Akses Aplikasi & Login

Buka browser:

```text
http://localhost:3000
```

Saat pertama kali dijalankan, basis data **otomatis mengimpor skema DDL (auto-migrate)** dan **otomatis mengisi akun demo (auto-seed)** dari berkas `backend/database/schema.sql`. Jadi kamu bisa langsung login tanpa setup database manual.

**Akun demo yang tersedia** — password semuanya `admin123`:

| Username / Email | Role | Password | Hak Akses |
| :--- | :--- | :--- | :--- |
| `admin@optik.com` | `admin` | `admin123` | Akses penuh dashboard admin, kelola antrean pesanan, update status state machine, input biaya, alokasi armada kurir, dan konfirmasi pembayaran. |
| `bahrul@gmail.com` | `pelanggan` | `admin123` | Pengajuan servis antar-jemput, upload foto kerusakan frame & resep dokter, pelacakan live GPS kurir, checkout pembayaran digital, cetak invoice struk lunas. |

> Gunakan akun `admin` untuk akses penuh, dan akun `pelanggan` untuk mencoba pembatasan hak akses (RBAC) per role.

### 6. Stop & Cleanup

```bash
# Stop semua service (data database TETAP tersimpan)
docker compose down

# Stop + hapus volume (data DB dan akun akan di-seed ulang saat start berikutnya)
docker compose down -v
```

---

## Troubleshooting

| Masalah | Penyebab | Solusi |
| :--- | :--- | :--- |
| `port is already allocated` | Port 5000/3000/3306 dipakai proses lain | Matikan aplikasi tersebut di Task Manager, atau ubah port pada `backend/.env` dan `docker-compose.yml`. |
| `FATAL: DB connection refused` | Layanan MySQL belum siap saat backend start | Pastikan MySQL sudah running, atau tunggu 15 detik lalu restart container backend. |
| `FATAL: JWT_SECRET not set in .env` | `JWT_SECRET` masih kosong atau placeholder | Isi dengan hasil `openssl rand -base64 32` pada `backend/.env`. |
| Backend `Restarting` terus | Kredensial MySQL tidak cocok | Cek `DB_*` di `backend/.env`, lalu jalankan `docker compose down -v && docker compose up --build -d`. |
| Halaman blank / `Failed to fetch` | Backend belum selesai booting | Tunggu 30 detik, cek log dengan `docker compose logs -f backend`. |
| Perubahan kode tidak muncul | Browser masih menyimpan cache lama | Lakukan Hard Refresh dengan menekan tombol `Ctrl + Shift + R` atau `Ctrl + F5`. |
| Tidak bisa login | Database belum ter-seed | Impor manual berkas `backend/database/schema.sql` via phpMyAdmin atau CLI MySQL. |

---

## Struktur Project

```text
RPLApp/
├── backend/                            # API Node.js (Express.js + mysql2)
│   ├── config/                         # Koneksi database connection pool (db.js)
│   ├── controllers/                    # Logika bisnis: auth, layanan, detail-layanan
│   ├── database/                       # schema.sql (DDL 6 tabel 3NF + seed akun & transaksi)
│   ├── middleware/                     # Middleware JWT auth & proteksi admin RBAC
│   ├── routes/                         # Definisi rute RESTful API (/api/auth, /api/layanan, ...)
│   ├── tests/                          # 5 test suites unit test backend (48 passing tests)
│   ├── .env.example                    # Template konfigurasi environment
│   └── server.js                       # Titik masuk server Express
├── frontend/                           # SPA React.js
│   ├── public/                         # index.html, favicon, aset publik
│   └── src/
│       ├── components/                 # Komponen global: Navbar.js, LiveMapKurir.js
│       ├── pages/                      # Modul halaman domain bisnis
│       │   ├── kurir/                  # TrackingKurir.js, DaftarKurir.js
│       │   ├── layanan/                # BuatLayanan.js, DaftarLayanan.js, DashboardLayanan.js
│       │   ├── detail_layanan/         # DetailLayanan.js, AdminDetailLayanan.js
│       │   ├── pembayaran/             # PembayaranPage.js, KonfirmasiPembayaran.js
│       │   ├── riwayat_status_layanan/ # RiwayatStatusLayanan.js
│       │   ├── admin/                  # AdminDashboard.js & backward compatibility export
│       │   ├── user/                   # Backward compatibility export
│       │   ├── Home.js                 # Landing page publik
│       │   ├── Login.js                # Formulir login pengguna
│       │   ├── Register.js             # Formulir pendaftaran akun baru
│       │   └── index.js                # Aggregator re-export
│       ├── utils/                      # api.js (Axios interceptor) & PrivateRoute.js (RBAC guard)
│       ├── App.js                      # Root router configuration (React Router v6)
│       └── App.css                     # Sistem gaya antarmuka global
├── docs/                               # Dokumentasi rekayasa perangkat lunak akademik (7 Dokumen)
│   ├── ide_proyek.md                   # Identitas tugas mahasiswa, eksplorasi 3 tema, scope
│   ├── OptikExpress (PRD).md           # Product Requirement Document komprehensif
│   ├── Coding_Style.md                 # Standar arsitektur 3-tier, konvensi kode, ERD 6 tabel 3NF
│   ├── Design_UI.md                    # Panduan sistem desain antarmuka, warna, komponen
│   ├── DevLog.md                       # Log kronologi perkembangan Pertemuan 1 s/d 6 & test log
│   ├── Logging.md                      # Audit trail, log pelacakan kurir GPS, logger notifikasi
│   └── Agent.md                        # Panduan teknis dan batasan bagi AI Coding Agent
├── docker-compose.yml                  # Orkestrasi multi-kontainer MySQL + backend + frontend
├── .env.example                        # Template konfigurasi root
├── .gitignore                          # Pengabaian git
└── README.md                           # Dokumentasi utama proyek
```

---

## Quick Start (Local) — Tanpa Docker

Untuk development lokal yang membutuhkan hot-reload cepat atau debugging langsung. **Lewati bagian ini kalau sudah berhasil memakai Docker.**

### 1. Install Dependencies

**Windows:**

- **Node.js 18+ LTS**: [https://nodejs.org/](https://nodejs.org/)
- **MySQL / MariaDB**: Melalui XAMPP ([https://www.apachefriends.org/](https://www.apachefriends.org/)) atau Laragon

Verifikasi instalasi di terminal:

```bash
node -v      # minimal v16.x (disarankan v18+)
npm -v       # minimal v8.x
mysql --version
```

### 2. Jalankan Layanan Basis Data MySQL

- Buka **XAMPP Control Panel** (`C:\xampp\xampp-control.exe`)
- Klik tombol **Start** pada modul **MySQL** (berjalan di port `3306`)
- Buka phpMyAdmin di browser (`http://localhost/phpmyadmin`)
- Buat database baru bernama `db_kacamata`, lalu impor file `backend/database/schema.sql`

Atau via command line:

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS db_kacamata;"
mysql -u root -p db_kacamata < backend/database/schema.sql
```

### 3. Setup Backend

```bash
cd backend
cp .env.example .env
```

Generate JWT secret:

```bash
openssl rand -base64 32
```

Edit `backend/.env`:

```dotenv
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=db_kacamata
DB_PORT=3306
JWT_SECRET="HASIL_OUTPUT_DARI_OPENSSL"
JWT_EXPIRES_IN=24h
```

Pasang dependensi dan jalankan server backend:

```bash
npm install
npm start
```

-> Backend berjalan aktif di `http://localhost:5000`.

### 4. Setup Frontend

Buka jendela terminal baru:

```bash
cd frontend
npm install
npm start
```

-> Frontend berjalan aktif di `http://localhost:3000`.

### 5. Menghentikan Layanan

Tekan `Ctrl + C` pada masing-masing jendela terminal backend dan frontend.

---

## Security Notes

- `.env` TIDAK di-commit (sudah terdaftar di `.gitignore`)
- `.env.example` hanya berisi template tanpa kredensial rahasia
- JWT secret harus acak dengan panjang minimal 32 byte (`openssl rand -base64 32`)
- Token JWT dikirim via HTTP header `Authorization: Bearer <token>`
- Password dienkripsi menggunakan BCrypt dengan salt rounds 10
- Anti-IDOR: proteksi verifikasi kepemilikan data pengguna pada seluruh endpoint operasional servis kacamata
- **Akun demo di atas hanya untuk keperluan pengujian dan evaluasi tugas.** Untuk lingkungan produksi, seluruh password wajib diubah.

---

## Dokumen Lengkap

### Dokumen Produk & Ide

| File | Deskripsi |
| :--- | :--- |
| [`docs/ide_proyek.md`](docs/ide_proyek.md) | Ide proyek, masalah nyata, profil target pengguna, fitur inti, dan kriteria keberhasilan (Identitas Mahasiswa: **Sindar Felix Sihole \|\| 2510101031**) |
| [`docs/OptikExpress (PRD).md`](<docs/OptikExpress%20(PRD).md>) | Product Requirement Document (PRD) lengkap mencakup 5 User Stories, Acceptance Criteria, dan state machine |

### Dokumen Panduan Pengembangan

| File | Deskripsi |
| :--- | :--- |
| [`docs/Agent.md`](docs/Agent.md) | Panduan perilaku AI coding agent (main rules, alur kerja per task, batasan akademis) |
| [`docs/Coding_Style.md`](docs/Coding_Style.md) | Standar gaya kode Backend (Node.js/Express) & Frontend (React), diagram ERD 6 tabel 3NF, konvensi respons API |
| [`docs/Design_UI.md`](docs/Design_UI.md) | Panduan desain antarmuka, sistem warna resmi (*Navy, Ocean Blue, Mint Green*), komponen UI, dan peta kurir GPS Leaflet |
| [`docs/Logging.md`](docs/Logging.md) | Arsitektur multi-layer logging: audit trail tabel database, log koordinat kurir GPS, logger notifikasi Email SMTP & WhatsApp mock |
| [`docs/DevLog.md`](docs/DevLog.md) | Dev log kronologis Pertemuan 1 s/d 6, riwayat commit bermakna, dan bukti 48 unit tests lulus (100% all passed) |

---

## Masalah yang Diselesaikan

1. **Hambatan Aksesibilitas & Waktu** — jam operasional toko optik konvensional berbenturan dengan rutinitas kantor dan perkuliahan.
2. **Ketergantungan Penglihatan** — penderita kelainan refraksi mata tinggi tidak dapat mengemudi secara aman saat kacamata patah atau lensa terlepas.
3. **Ketidakpastian Biaya & Status Pengerjaan** — ketiadaan estimasi biaya di muka dan sulit melacak apakah kacamata sudah selesai atau masih dalam antrean bengkel optik.
4. **Pencatatan Resep Medis Terfragmentasi** — kartu resep ukuran kacamata fisik dari dokter mata mudah hilang atau rusak.

---

## Target Pengguna (2 Role RBAC)

| Peran | Tanggung Jawab Utama |
| :--- | :--- |
| `admin` | Verifikasi pesanan, penetapan jadwal jemput, update 6 status state machine, input nominal tagihan servis, penugasan armada kurir otomatis/manual, dan konfirmasi pelunasan pembayaran. |
| `pelanggan` | Registrasi akun, pengajuan layanan antar-jemput, unggah foto kerusakan frame & resep dokter optik, pemantauan kurir GPS real-time, simulasi pembayaran digital, dan cetak invoice tanda terima resmi. |

---

## Fitur Inti

Status ditandai jujur: **[Ada]** = sudah terimplementasi di kode dan lolos pengujian otomatis.

1. **[Ada] Autentikasi & RBAC Multi-Role** — sesi login stateless dengan token JWT, otorisasi peran `pelanggan` dan `admin`, proteksi rute halaman via `PrivateRoute`.
2. **[Ada] Formulir Pengajuan Servis Digital** — pemilihan 3 kategori servis (`perbaikan`, `penggantian_lensa`, `perbaikan_dan_lensa`), keluhan kerusakan, alamat penjemputan lengkap, serta penentuan jadwal tanggal dan jam penjemputan.
3. **[Ada] Rincian Spesifikasi Kacamata (Detail Layanan)** — pencatatan model frame, rincian tindakan teknis perbaikan, dan ukuran lensa resep (minus, plus, silinder, progresif) pada tabel relasional `detail_layanan`.
4. **[Ada] Siklus Status Layanan (State Machine 6 Tahapan)** — alur siklus hidup pesanan deterministik: `pengajuan` -> `dijadwalkan` -> `diambil` -> `diproses` -> `diantar` -> `selesai`.
5. **[Ada] Dasbor Interaktif Pelanggan & Administrator** — metrik ringkasan pesanan aktif, pesanan tuntas, status tagihan, dan tabel antrean servis dengan filter status dan pencarian instan.
6. **[Ada] Pembatalan & Penghapusan Pesanan** — pembatalan mandiri oleh pelanggan pada tahap awal serta penghapusan data pesanan oleh admin dengan *cascading delete*.
7. **[Ada] Notifikasi Otomatis Status (Email SMTP & WhatsApp Mock)** — pengiriman email otomatis via `nodemailer` (dukungan SMTP Gmail & testing Ethereal) serta pencatatan log simulasi pesan WhatsApp ke nomor telepon pelanggan setiap kali status diperbarui.
8. **[Ada] Arsitektur Frontend Modular (5 Modul Domain)** — pengelompokan komponen antarmuka ke dalam 5 folder terisolasi (`kurir/`, `layanan/`, `detail_layanan/`, `pembayaran/`, `riwayat_status_layanan/`) dengan *barrel export*.
9. **[Ada] Otomasi Pengujian Unit Backend (Unit Testing Suite)** — 48 unit tests otomatis menggunakan test runner bawaan Node.js (`node:test`, `node:assert/strict`) dengan tingkat kelulusan 100%.
10. **[Ada] Integrasi Gerbang Pembayaran Digital (Payment Gateway Midtrans)** — simulasi checkout pembayaran digital multi-kanal (QRIS dinamis, Virtual Account BCA/BNI/BRI/Mandiri, E-Wallet GoPay/ShopeePay, COD), batas waktu transaksi, serta invoice digital struk lunas dengan fitur cetak.
11. **[Ada] Pelacakan Kurir Langsung (Live GPS Tracking & Auto-Assign Kurir)** — pemantauan posisi kurir real-time di atas peta Leaflet OpenStreetMap, animasi radar bergerak, estimasi waktu kedatangan (ETA), rute arah Google Maps turn-by-turn, dan penugasan kurir otomatis Round-Robin Gojek-style dari pool internal optik.
12. **[Ada] Unggah Berkas Foto Fisik Kacamata & Resep Optik** — penyimpanan file gambar Base64 ke disk server dengan pratinjau instan (*thumbnail preview*) dan modal pembesar (*lightbox zoom*).

---

## Keamanan

- Autentikasi JWT via header `Authorization: Bearer <token>` dengan masa kedaluwarsa 24 jam
- Middleware RBAC terpisah (`auth.js` dan `adminAuth.js`) dengan mitigasi pencegahan manipulasi identitas (*Anti-IDOR*)
- Enkripsi password menggunakan BCrypt dengan *salt rounds* 10
- Parameterized SQL queries (`?`) pada setiap query basis data untuk mencegah *SQL Injection*
- `.env` dikecualikan dari Git melalui `.gitignore`, berkas `.env.example` hanya berisi template variabel publik

---

## Target Keberhasilan

Target berikut adalah sasaran produk dan rekayasa perangkat lunak yang telah terpenuhi pada rilis ini:

- Waktu pengajuan layanan oleh pelanggan: **< 2 menit** — **terpenuhi**
- Integritas alur state machine 6 tahapan status operasional: **100% konsisten tanpa lompatan status ilegal** — **terpenuhi**
- Proteksi Anti-IDOR pada endpoint servis & spesifikasi kacamata: **100% tervalidasi via unit tests** — **terpenuhi**
- Tingkat kelulusan pengujian unit test backend: **100% (48 passing tests, 0 failing tests)** — **terpenuhi**
- Ketersediaan multi-metode pembayaran digital & pelacakan kurir live GPS: **terpasang dan teruji** — **terpenuhi**

---

## Pengembang

* **Nama Mahasiswa:** Sindar Felix Sihole
* **NIM:** 2510101031
* **Mata Kuliah:** Rekayasa Perangkat Lunak (RPL) — Semester 3
* **Repositori GitHub:** [https://github.com/akuntugassindar-spec/RPLApp.git](https://github.com/akuntugassindar-spec/RPLApp.git)

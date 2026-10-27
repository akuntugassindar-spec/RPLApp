# OptikExpress - Sistem Informasi Layanan Antar-Jemput Kacamata

**OptikExpress** adalah aplikasi web layanan perbaikan dan penggantian lensa kacamata terintegrasi berbasis antar-jemput yang dirancang untuk mempermudah masyarakat merawat alat bantu penglihatan tanpa harus datang langsung ke toko optik fisik. Sistem ini menjembatani alur operasional antara pelanggan, teknisi laboratorium optik, dan armada kurir logistik lapangan secara terpusat.

## Tech Stack

- **Backend:** Node.js v24 LTS (Express.js, `mysql2/promise`, BCrypt, JWT), MySQL 8.0 / MariaDB
- **Frontend:** React.js 18 (SPA, React Router v6, Axios, Leaflet OpenStreetMap, HTML Google Maps Embed)
- **Arsitektur:** Decoupled Monorepo, RESTful API, 3-Role RBAC, State Machine 6 Tahapan, Anti-IDOR Security
- **Pengujian Otomatis:** Node.js Native Test Runner (`node:test`, `node:assert/strict`) — 64 passing unit tests (100% lulus)

---

## Video Demonstrasi Aplikasi (demo.mp4)

Video demonstrasi walkthrough end-to-end beresolusi Full HD (1920x1080, 30 FPS) yang mencakup 8 adegan lengkap sesuai panduan `HowToRun.md` telah disertakan di root repositori:

🎬 **Berkas Video:** [`demo.mp4`](demo.mp4) (Resolusi: Full HD 1080p, Durasi: 1 menit 44 detik, Ukuran: 2.89 MB)  
📖 **Panduan Skenario 3 Role & Walkthrough:** [`HowToRun.md`](HowToRun.md)  
📋 **Checklist Rilis MVP Pertemuan 7:** [`checklist_mvp.md`](checklist_mvp.md)

---

## Prerequisites

Sebelum mulai, pastikan hal berikut sudah terpenuhi:

| Kebutuhan | Keterangan |
| :--- | :--- |
| **Docker Desktop** | Windows / macOS / Linux. Untuk Windows disarankan mengaktifkan backend **WSL 2**. |
| **Docker Compose v2** | Sudah termasuk di Docker Desktop. Cek dengan `docker compose version`. |
| **Node.js & npm** | Node.js v24.22.1 LTS atau minimal 18.x. Cek dengan `node -v` dan `npm -v`. |
| **MySQL / MariaDB** | Melalui Docker (port `3306`) atau instalasi lokal (XAMPP / Laragon). |
| **Port bebas** | Port `3000`, `5000`, dan `3306` tidak dipakai aplikasi lain. |
| **Koneksi internet** | Diperlukan saat build pertama (download image + dependency). |

> **Catatan untuk pengguna Windows:** seluruh perintah di panduan ini dijalankan di **PowerShell** atau **Git Bash**. Kalau memakai CMD, perintah `cp` diganti `copy`.

---

## Quick Start (Docker) - Cara Termudah & Disarankan

Cara ini **tidak perlu** mengonfigurasi database MySQL atau Node.js secara manual. Semua service sudah dibungkus di dalam Docker Compose.

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

Semua service harus berstatus **`Up`** (dan `db` harus **`Up (healthy)`**):

```
NAME                SERVICE    STATUS
kacamata-mysql      db         Up (healthy)   0.0.0.0:3306->3306/tcp
kacamata-backend    backend    Up             0.0.0.0:5000->5000/tcp
kacamata-frontend   frontend   Up             0.0.0.0:3000->80/tcp
```

Cek health endpoint backend:

```bash
curl http://localhost:5000/api/health
```

Harus membalas:

```json
{ "status": "UP", "timestamp": "2026-10-25T..." }
```

> Kalau ada service yang **`Exit`** atau **`Restarting`**, cek log-nya: `docker compose logs backend` (atau ganti `backend` dengan nama service lain).

### 5. Menjalankan Unit Test

Unit test dijalankan terpisah dari proses start aplikasi menggunakan Node.js Native Test Runner (`node:test`).

```bash
# Backend - dari dalam container (tidak perlu install Node.js di mesin lokal)
docker compose exec backend npm test

# Backend - alternatif lokal (dengan Node.js terpasang)
cd backend && npm test
```

**Yang diharapkan saat suite lulus:**

Seluruh 12 test suites dan 64 test cases mencetak status centang hijau dan rekap passing:

```
ℹ tests 64
ℹ suites 12
ℹ pass 64
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
```

> Kegagalan pengujian ditandai baris `FAIL` dan exit code bukan nol.

### 6. Akses Aplikasi & Login

Buka browser:

```
http://localhost:3000
```

Saat pertama kali dijalankan, backend **otomatis membuat tabel database relasional 3NF (`schema.sql`)** dan **otomatis mengisi akun demo (auto-seed)**. Jadi kamu bisa langsung login tanpa setup database manual.

**Akun demo yang tersedia** — password semuanya `password123`:

| Email | Role | Password | Deskripsi Akses |
| :--- | :--- | :--- | :--- |
| `admin@optik.com` | `admin` | `password123` | Administrator Optik (Manajemen pesanan, penetapan biaya, & penugasan kurir) |
| `pelanggan@gmail.com` | `pelanggan` | `password123` | Pelanggan Utama (Pemesanan layanan, upload resep, tracking GPS, & bayar) |
| `bahrul@gmail.com` | `pelanggan` | `password123` | Pelanggan Demo (Riwayat servis kacamata frame patah) |
| `kurir@gmail.com` | `kurir` | `password123` | Kurir Logistik Lapangan (Operasional jemput/antar, siar GPS, & kasir di tempat) |

> Gunakan akun `admin@optik.com` untuk akses panel admin, `kurir@gmail.com` untuk akses dashboard kurir, dan `pelanggan@gmail.com` untuk mencoba alur pelanggan.

### 7. Stop & Cleanup

```bash
# Stop semua service (data database TETAP tersimpan di Docker Volume)
docker compose down

# Stop + hapus volume (data DB dan akun akan di-seed ulang saat start berikutnya)
docker compose down -v
```

---

## Troubleshooting

| Masalah | Penyebab | Solusi |
| :--- | :--- | :--- |
| `port is already allocated` | Port 3000/5000/3306 dipakai proses lain (misal Apache/MySQL XAMPP) | Matikan aplikasi lokal tersebut, atau sesuaikan pemetaan port kiri di `docker-compose.yml`. |
| `[Database Error] Gagal terhubung ke MySQL` | Service MySQL belum siap menerima koneksi saat backend menyala | Tunggu 10–15 detik hingga MySQL melewati status health check, atau jalankan `docker compose restart backend`. |
| `JWT_SECRET not set` | File `backend/.env` belum dibuat atau masih kosong | Salin dari `backend/.env.example` dan jalankan script generator `JWT_SECRET`. |
| Container backend `Restarting` terus | Kredensial database di `.env` berbeda dengan konfigurasi container | Samakan `DB_USER=root`, `DB_PASSWORD=root`, dan `DB_HOST=db` pada environment Docker Compose. |
| Halaman blank / `Failed to fetch` | Frontend belum selesai mengunduh dependencies atau proxy backend belum terhubung | Cek log frontend dengan `docker compose logs -f frontend`. |
| Perubahan kode tidak muncul | Cache browser atau container masih memakai image lama | Jalankan `docker compose up --build -d` untuk rebuild container. |
| Tidak bisa login dengan akun demo | Database belum ter-seed secara sempurna | Jalankan `docker compose down -v && docker compose up --build -d`. |

---

## Struktur Project

```
RPLApp/
├── backend/                        # Server RESTful API Node.js & Express.js
│   ├── config/                     # Konfigurasi koneksi MySQL pool (db.js)
│   ├── controllers/                # Logika bisnis (auth, layanan, detail, tracking)
│   ├── database/                   # DDL skema 6 tabel 3NF dan seed data (schema.sql)
│   ├── middleware/                 # Middleware JWT token & otorisasi RBAC 3 role
│   ├── routes/                     # Definisi endpoint API Express
│   ├── tests/                      # 64 unit tests komprehensif (Native Node.js Test Runner)
│   ├── uploads/                    # Media fisik kacamata & foto resep dokter
│   ├── utils/                      # Helper QRIS Bank Indonesia (EMVCo/CRC16) & Geocoding
│   ├── Dockerfile                  # Container backend Node.js
│   ├── package.json
│   └── server.js                   # Entry point Express.js
├── frontend/                       # Client Single Page Application React.js 18
│   ├── public/                     # Template HTML, favicon, & manifest.json
│   ├── src/
│   │   ├── api/                    # Konfigurasi Axios HTTP Client & interceptor token
│   │   ├── components/             # LiveMapKurir, Navbar, SuccessOverlay, LiveMapTracker
│   │   ├── context/                # AuthContext (state sesi login global)
│   │   ├── pages/                  # Halaman aplikasi per modul domain bisnis:
│   │   │   ├── admin/              # Panel Admin, detail verifikasi, & penetapan biaya
│   │   │   ├── detail_layanan/     # Detail teknis lensa & live tracking kurir
│   │   │   ├── kurir/              # Dashboard Kurir, live GPS, kasir COD/QRIS
│   │   │   ├── layanan/            # Form buat permohonan & daftar layanan
│   │   │   ├── pembayaran/         # Payment Gateway (QRIS, VA, e-Wallet, COD)
│   │   │   ├── riwayat_status_layanan/ # Audit trail kronologis status pesanan
│   │   │   └── user/               # Dashboard ringkasan pelanggan
│   │   ├── utils/                  # PrivateRoute untuk proteksi akses halaman per role
│   │   ├── App.css                 # Desain antarmuka responsif tanpa dependensi CSS eksternal
│   │   └── App.js                  # Routing utama React Router v6
│   ├── Dockerfile                  # Multi-stage container React (Nginx Alpine)
│   └── package.json
├── docs/                           # Dokumentasi teknis proyek, PRD, dan pedoman coding
│   ├── Agent.md                    # Aturan coding agent, larangan, & alur kerja
│   ├── Coding_Style.md             # Standar penulisan kode, konvensi, & ERD 6 tabel 3NF
│   ├── Design_UI.md                # Panduan desain antarmuka & tata warna
│   ├── DevLog.md                   # Catatan harian kronologis pengerjaan fitur
│   ├── ide_proyek.md               # Analisis masalah, sasaran, & batasan solusi
│   ├── Logging.md                  # Konvensi pencatatan dev log
│   ├── OptikExpress (PRD).docx     # Product Requirement Document (format DOCX)
│   ├── OptikExpress (PRD).md       # Product Requirement Document (format Markdown)
│   └── OptikExpress (PRD).pdf      # Product Requirement Document (format PDF)
├── checklist_mvp.md                # Checklist seluruh fitur MVP & status pengujian unit test
├── docker-compose.yml              # Orkestrasi 3 service (MySQL + Backend + Frontend)
├── HowToRun.md                     # Panduan operasional menjalankan aplikasi (Docker & Lokal)
└── README.md                       # Dokumentasi utama proyek
```

---

## Quick Start (Local) - Tanpa Docker

Untuk kebutuhan pengembangan lokal (*development*) dengan fitur *Hot-Module Replacement* (HMR). **Lewati bagian ini jika Anda sudah berhasil menjalankan aplikasi dengan Docker.**

### 1. Kebutuhan Perangkat Lunak

- **Node.js:** Versi 18 LTS atau 20+ ([Unduh Node.js](https://nodejs.org/))
- **MySQL / MariaDB:** Melalui XAMPP, Laragon, atau MySQL Server standalone ([Unduh XAMPP](https://www.apachefriends.org/))
- **Git:** Untuk manajemen source code ([Unduh Git](https://git-scm.com/))

Verifikasi instalasi di terminal:

```bash
node -v      # Pastikan minimal v18.x
npm -v       # Pastikan minimal v9.x
mysql --version
```

### 2. Konfigurasi Database MySQL

1. Pastikan layanan MySQL di XAMPP / Laragon telah aktif (status: **Running** di port `3306`).
2. Buka antarmuka manajemen database (phpMyAdmin di `http://localhost/phpmyadmin` atau terminal MySQL).
3. Buat database baru bernama `db_kacamata`:

   ```sql
   CREATE DATABASE db_kacamata CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

4. Impor skema dan seed data resmi dari berkas [`backend/database/schema.sql`](backend/database/schema.sql):

   ```bash
   mysql -u root -p db_kacamata < backend/database/schema.sql
   ```

   *(Jika MySQL Anda tidak memiliki password, cukup tekan tombol Enter saat diminta password).*

### 3. Setup Backend

```bash
cd backend
npm install
```

Salin berkas template environment:

```bash
cp .env.example .env
```

Buka berkas `backend/.env` dan pastikan konfigurasi sesuai dengan lingkungan lokal Anda:

```dotenv
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=db_kacamata
DB_PORT=3306
JWT_SECRET=super_secret_jwt_kacamata_key_2026_universitas_rpl
JWT_EXPIRES_IN=24h
```

Jalankan server backend:

```bash
npm run dev
```

Server backend akan berjalan di `http://localhost:5000`.

### 4. Setup Frontend

Buka jendela terminal baru:

```bash
cd frontend
npm install
npm start
```

Aplikasi frontend akan terbuka secara otomatis di peramban pada alamat `http://localhost:3000`.

### 5. Menghentikan Layanan

Tekan kombinasi tombol `Ctrl + C` pada masing-masing terminal untuk menghentikan server Node.js dan React.

---

## Security Notes

- Berkas `.env` **TIDAK di-commit** ke repositori publik (terlindungi oleh berkas `.gitignore`).
- Berkas `.env.example` hanya berfungsi sebagai template acuan dengan nilai placeholder.
- Kunci rahasia `JWT_SECRET` harus dibuat acak dengan panjang minimal 32 karakter untuk mencegah serangan *brute-force token*.
- Seluruh kata sandi pengguna dienkripsi searah menggunakan pustaka **BCrypt** dengan *salt rounds* minimal 10.
- Proteksi terhadap kerentanan **IDOR (Insecure Direct Object References)** diterapkan secara ketat pada setiap controller layanan, memastikan pelanggan hanya dapat mengakses dan memodifikasi data milik sendiri.
- Proteksi terhadap serangan **SQL Injection** diterapkan melalui *parameterized query binding* pustaka `mysql2/promise`.

---

## Dokumen Lengkap

### Dokumen Produk & Ide

| File | Deskripsi |
| :--- | :--- |
| [`docs/ide_proyek.md`](docs/ide_proyek.md) | Analisis latar belakang masalah, sasaran produk, batasan solusi, dan nilai tambah |
| [`docs/OptikExpress (PRD).md`](<docs/OptikExpress%20(PRD).md>) | Product Requirement Document (PRD) komprehensif dalam format Markdown |
| [`docs/OptikExpress (PRD).pdf`](<docs/OptikExpress%20(PRD).pdf>) | PRD resmi dalam format PDF siap cetak |
| [`docs/OptikExpress (PRD).docx`](<docs/OptikExpress%20(PRD).docx>) | PRD resmi dalam format Microsoft Word |
| [`checklist_mvp.md`](checklist_mvp.md) | Checklist pemenuhan seluruh kriteria MVP beserta bukti hasil unit testing |
| [`HowToRun.md`](HowToRun.md) | Petunjuk komprehensif menjalankan aplikasi di berbagai sistem operasi |

### Dokumen Panduan Pengembangan

| File | Deskripsi |
| :--- | :--- |
| [`docs/Agent.md`](docs/Agent.md) | Panduan perilaku AI coding agent, aturan utama, alur kerja modular, dan larangan khusus |
| [`docs/Coding_Style.md`](docs/Coding_Style.md) | Standar gaya penulisan kode Backend (Express) & Frontend (React), konvensi REST API, dan ERD 6 tabel 3NF |
| [`docs/Design_UI.md`](docs/Design_UI.md) | Panduan tata letak antarmuka, palet warna, tipografi, dan komponen visual UI |
| [`docs/Logging.md`](docs/Logging.md) | Standar pencatatan dev log dan konvensi commit Git |
| [`docs/DevLog.md`](docs/DevLog.md) | Dev log kronologis riwayat pengembangan fitur, perbaikan bug, dan pengujian |

---

## Masalah yang Diselesaikan

1. **Hambatan Akses Fisik ke Toko Optik:** Pelanggan dengan kesibukan tinggi atau keterbatasan mobilitas kerap menunda perbaikan kacamata karena enggan mengantre di gerai fisik.
2. **Ketiadaan Transparansi & Pelacakan Kurir Real-Time:** Penjemputan konvensional minim transparansi lokasi dan kepastian waktu tiba kurir di lokasi penjemputan.
3. **Ketidakpastian Biaya & Estimasi Pengerjaan:** Konsumen kerap khawatir akan potensi lonjakan biaya perbaikan kacamata tanpa konfirmasi harga di awal.
4. **Pencatatan Riwayat Servis yang Tercecer:** Kartu resep optik kertas rawan hilang, menyulitkan konsumen mengetahui ukuran silinder atau minus kacamata terdahulu.

---

## Target Pengguna (3 Role RBAC)

| Peran | Tanggung Jawab Utama | Akses Sistem |
| :--- | :--- | :--- |
| `pelanggan` | Pengajuan servis perbaikan/ganti lensa kacamata, unggah resep optik, pemantauan kurir GPS real-time, dan pelunasan pembayaran. | Dashboard Pelanggan, Form Buat Layanan, Tracking GPS, & Halaman Pembayaran. |
| `admin` | Verifikasi pengajuan, evaluasi kerusakan kacamata di laboratorium, penetapan rincian biaya resmi, penugasan kurir logistik, dan manajemen pesanan. | Panel Admin Optik, Manajemen Data Layanan, Pengaturan Biaya & Status, Penugasan Kurir. |
| `kurir` | Melaksanakan tugas operasional penjemputan dan pengantaran kacamata, menyiarkan posisi GPS terkini, dan melayani pembayaran kasir di tempat (COD/QRIS). | Dashboard Kurir Logistik, Peta Navigasi Kurir, Penyiaran Koordinat GPS, Kasir di Tempat. |

---

## Fitur Inti

Status fitur ditandai secara objektif: **[Ada]** = telah terimplementasi penuh di kode dan teruji di unit test, **[Rencana]** = terdaftar dalam roadmap pengembangan lanjutan.

1. **[Ada] Autentikasi & RBAC Multi-Role** — Otentikasi sesi berbasis JWT token dengan 3 peran otorisasi terisolasi (`pelanggan`, `admin`, `kurir`).
2. **[Ada] Pengajuan Layanan Antar-Jemput Kacamata** — Formulir permohonan dinamis mencakup jenis servis (perbaikan frame, penggantian lensa, kombinasi), model frame, tanggal & jam jemput, serta alamat penjemputan.
3. **[Ada] Unggah Foto Fisik Kacamata & Resep Optik** — Penyimpanan media berbasis disk server (`/uploads/`) dengan validasi tipe file gambar dan batasan ukuran maksimal 5 MB.
4. **[Ada] Siklus Status Layanan 6 Tahapan (State Machine)** — Alur status deterministik dan terkontrol: `pengajuan` → `dijadwalkan` → `diambil` → `diproses` → `diantar` → `selesai`.
5. **[Ada] Pemantauan Kurir Real-Time (Live GPS & Google Maps)** — Integrasi HTML Google Maps Indonesia (Jakarta & Tangerang) serta peta jalan Leaflet OpenStreetMap dengan radius lokal terdekat (< 500 meter).
6. **[Ada] Integrasi Payment Gateway Multi-Metode** — Simulasi Midtrans mendukung 8 metode pembayaran: QRIS Standar Bank Indonesia (EMVCo & CRC16), 4 Virtual Account bank (BCA, BNI, BRI, Mandiri), 2 e-Wallet (GoPay, ShopeePay), dan COD tunai.
7. **[Ada] Dasbor Operasional Kurir & Kasir di Tempat** — Antarmuka khusus kurir untuk memantau tugas harian, memperbarui status penjemputan, menyiarkan koordinat satelit, dan melayani kasir pelunasan COD/QRIS di lokasi pelanggan.
8. **[Ada] Manajemen Armada Kurir** — Master data armada kurir internal optik dengan plat nomor B resmi wilayah Jakarta & Tangerang (`B 4589 AB`, `B 3120 TNG`, `B 6742 BSD`).
9. **[Ada] Audit Trail & Riwayat Status Layanan** — Pencatatan kronologis otomatis pada setiap mutasi status layanan, mencatat stempel waktu, status sebelum/sesudah, nama petugas pencatat, dan catatan keterangan.
10. **[Rencana] Integrasi WhatsApp Gateway Otomatis** — Pengiriman pesan konfirmasi otomatis ke nomor WhatsApp pelanggan secara langsung melalui integrasi API pihak ketiga (Twilio / Fonnte).
11. **[Rencana] Optical Character Recognition (OCR) Resep Kacamata** — Ekstraksi otomatis nilai minus, silinder, dan aksis dari gambar foto resep dokter menggunakan kecerdasan buatan.

---

## Keamanan

- **Autentikasi Aman:** Berbasis JSON Web Token (JWT) yang disimpan di sesi client dan diverifikasi pada setiap request API.
- **Role-Based Access Control (RBAC):** Pembatasan hak akses rute endpoint melalui middleware terpisah (`authMiddleware`, `adminAuthMiddleware`, `staffAuth`).
- **Mitigasi IDOR / BOLA:** Verifikasi kepemilikan data pada setiap operasi pembacaan, pembaruan, dan pelunasan pesanan; pelanggan tidak dapat mengakses pesanan milik pelanggan lain.
- **Enkripsi Kata Sandi:** Menggunakan hashing satu arah **BCrypt** dengan *salt rounds* 10 untuk menjaga keamanan akun pengguna.
- **Integritas Database Relasional:** Struktur 6 tabel ternormalisasi 3NF dengan constraint *Foreign Key* dan relasi `ON DELETE CASCADE`.
- **Sanitasi SQL Injection:** Perlindungan menyeluruh menggunakan prepared statement dan parameter binding pada pustaka `mysql2/promise`.

---

## Target Keberhasilan

Target berikut merupakan sasaran performa produk yang telah divalidasi melalui serangkaian pengujian:

- Waktu respon pencarian data layanan: **< 100 ms** (terpenuhi melalui indexing database 3NF).
- Akurasi pemantauan rute kurir lapangan: **radius < 500 meter** dari lokasi pelanggan di wilayah Jakarta & Tangerang (terpenuhi).
- Kecepatan pemrosesan transaksi pembayaran: **real-time (< 3 detik)** dengan verifikasi token transaksi unik (terpenuhi).
- Kualitas dan keandalan kode sistem: **100% lulus pengujian otomatis** (64 dari 64 unit tests PASSED tanpa kegagalan).
- Standar aksesibilitas dan tampilan antarmuka: **100% responsif mobile & desktop** tanpa ketergantungan framework CSS pihak ketiga.

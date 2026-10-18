# 🏗️ DOKUMEN ARSITEKTUR & SPESIFIKASI SISTEM (PERTEMUAN 3)

**Nama Aplikasi:** **OptikExpress — Sistem Informasi Layanan Antar-Jemput Kacamata**  
**Purpose:**  
Membantu pelanggan memesan perbaikan kacamata (frame rusak, sekrup lepas, nosepad hilang) dan penggantian lensa (minus, silinder, blueray, photochromic) secara praktis melalui layanan penjemputan dan pengantaran kurir langsung ke alamat pelanggan, memantau posisi armada kurir secara real-time pada peta GPS, serta melakukan pembayaran multi-metode (QRIS dinamis, Virtual Account, E-Wallet, COD).

---

## 🛠️ Tech Stack

* **Frontend:** React.js 18.2.0 + React Router DOM v6.22.3 + Axios 1.6.8 + Leaflet (OpenStreetMap) + Vanilla CSS Modern
* **Backend:** Node.js (>= 18.x) + Express.js 4.19.2 + mysql2 (Connection Pooling dengan `Promise`)
* **Database:** MySQL 8.0 / MariaDB 10.4+ (`db_kacamata`)
* **Keamanan:** JWT (`jsonwebtoken` v9.0.2) + Enkripsi Password BCrypt (`bcryptjs` v2.4.3)
* **Notifikasi:** Nodemailer (SMTP Ethereal / Gmail) + Logger Notifikasi WhatsApp
* **API Style:** RESTful API (JSON Payload & Responses)
* **Kontainerisasi:** Docker & Docker Compose (`docker-compose.yml`)
* **Lingkungan (.env):** `.env.example` untuk konfigurasi port, kredensial MySQL, dan JWT Secret

---

## 📐 Code & Design Rules

* **Penamaan File & Komponen:** PascalCase untuk React Components (`Navbar.js`, `LiveMapKurir.js`, `BuatLayanan.js`, `DetailLayanan.js`, dll.).
* **Penamaan Controller & Helper:** camelCase untuk nama fungsi dan variabel (`getAllLayanan`, `createLayanan`, `updateStatusLayanan`, `autoAssignCourier`).
* **Format Data API:** Konsisten format response JSON standar:
  ```json
  {
    "success": true,
    "message": "Deskripsi pesan keberhasilan",
    "data": { ... }
  }
  ```
* **Separation of Concerns:** Pemisahan ketat antara Presentation Layer (React), Business Logic (Express Controllers & Middleware), dan Persistence Layer (MySQL RDBMS).
* **Security First:** Tidak menyimpan password dalam bentuk plaintext, selalu memvalidasi token JWT via middleware `auth.js` dan membatasi aksi admin via `adminAuth.js`.

---

## 🗄️ Main Entities (Entitas Utama Sistem)

1. **User (Pengguna / Akun)**
   * `id` (PK, INT AUTO_INCREMENT)
   * `nama` (VARCHAR 100)
   * `email` (VARCHAR 100, UNIQUE)
   * `password` (VARCHAR 255, Hashed BCrypt)
   * `role` (ENUM: `'admin'`, `'pelanggan'`)
   * `no_telepon` (VARCHAR 20)
   * `created_at` (TIMESTAMP)

2. **Kurir (Armada Penjemput & Pengantar)**
   * `id` (PK, INT AUTO_INCREMENT)
   * `nama` (VARCHAR 100)
   * `no_telepon` (VARCHAR 20)
   * `jenis_kendaraan` (VARCHAR 50)
   * `plat_nomor` (VARCHAR 20)
   * `status_aktif` (ENUM: `'aktif'`, `'istirahat'`, `'nonaktif'`)
   * `current_lat` (DECIMAL 10,7)
   * `current_lng` (DECIMAL 10,7)
   * `created_at` (TIMESTAMP)

3. **Layanan (Pesanan / Permintaan Servis)**
   * `id` (PK, INT AUTO_INCREMENT)
   * `user_id` (FK -> users.id, ON DELETE CASCADE)
   * `jenis_layanan` (ENUM: `'perbaikan'`, `'penggantian_lensa'`, `'perbaikan_dan_lensa'`)
   * `keluhan` (TEXT)
   * `alamat` (TEXT)
   * `tanggal_jemput` (DATE)
   * `jam_jemput` (TIME)
   * `status` (ENUM: `'pengajuan'`, `'dijadwalkan'`, `'diambil'`, `'diproses'`, `'selesai'`, `'diantar'`)
   * `foto_kacamata` (VARCHAR 255)
   * `foto_resep` (VARCHAR 255)
   * `total_biaya` (INT, Default 0)
   * `status_pembayaran` (ENUM: `'belum_bayar'`, `'menunggu_pembayaran'`, `'lunas'`)
   * `metode_pembayaran` (VARCHAR 50)
   * `id_transaksi_pembayaran` (VARCHAR 100)
   * `catatan_admin` (TEXT)
   * `kurir_nama` (VARCHAR 100)
   * `kurir_telepon` (VARCHAR 20)
   * `kurir_lat` (DECIMAL 10,7)
   * `kurir_lng` (DECIMAL 10,7)
   * `tracking_status` (VARCHAR 255)
   * `created_at` (TIMESTAMP)

4. **DetailLayanan (Spesifikasi Teknis Kacamata & Lensa)**
   * `id` (PK, INT AUTO_INCREMENT)
   * `layanan_id` (FK -> layanan.id, ON DELETE CASCADE, UNIQUE)
   * `jenis_kacamata` (VARCHAR 100)
   * `detail_perbaikan` (TEXT)
   * `keterangan` (TEXT)
   * `created_at` (TIMESTAMP)

5. **Pembayaran (Catatan Transaksi Digital)**
   * `id` (PK, INT AUTO_INCREMENT)
   * `layanan_id` (FK -> layanan.id, ON DELETE CASCADE)
   * `id_transaksi` (VARCHAR 100, UNIQUE)
   * `gross_amount` (INT)
   * `metode_pembayaran` (VARCHAR 50)
   * `status_transaksi` (ENUM: `'pending'`, `'settlement'`, `'expire'`, `'cancel'`)
   * `waktu_transaksi` (TIMESTAMP)

6. **RiwayatStatusLayanan (Audit Trail & Tracking History)**
   * `id` (PK, INT AUTO_INCREMENT)
   * `layanan_id` (FK -> layanan.id, ON DELETE CASCADE)
   * `status_lama` (VARCHAR 50)
   * `status_baru` (VARCHAR 50)
   * `keterangan` (TEXT)
   * `diubah_oleh` (VARCHAR 100)
   * `created_at` (TIMESTAMP)

---

## 🛡️ Database & Integrity Rules

* Relasi tabel menggunakan foreign key constraint dengan klausul `ON DELETE CASCADE` untuk menjaga integritas referensial.
* Nomor invoice / ID transaksi pembayaran bersifat unik dengan pola `MIDTRANS-{timestamp}-{random}`.
* Normalisasi basis data memenuhi kaidah bentuk normal ketiga (3NF) tanpa anomali redundansi.
* Skrip basis data dilengkapi mekanisme *Auto-Migration* (`ensureTableColumns` di `backend/config/db.js`) dan *Auto-Seed* akun contoh (`admin@optikexpress.com`, `budi@gmail.com`, `siti@gmail.com`) serta 3 armada kurir contoh.

---

## ⚙️ Backend Features & Modules

1. **Authentication & Authorization (Auth Module)**
   * `POST /api/auth/register`: Mendaftarkan pelanggan baru, validasi regex email, dan enkripsi password.
   * `POST /api/auth/login`: Verifikasi password via BCrypt, menerbitkan JWT token berlaku 24 jam.
   * `GET /api/auth/me`: Mengambil data profil pengguna yang sedang login.

2. **Service Request Management (Layanan Module)**
   * `GET /api/layanan`: Mengambil riwayat layanan (pelanggan melihat datanya sendiri, admin melihat semua).
   * `GET /api/layanan/:id`: Detail layanan lengkap beserta data teknis kacamata.
   * `POST /api/layanan`: Pengajuan layanan baru, simpan gambar kacamata/resep, dan auto-assign armada kurir.
   * `PUT /api/layanan/:id/status`: Khusus admin untuk mengubah status pengerjaan, memasukkan biaya, dan memicu notifikasi Email/WA.
   * `DELETE /api/layanan/:id`: Membatalkan layanan berstatus `pengajuan`.

3. **Courier Tracking & GPS Module**
   * `GET /api/layanan/:id/tracking`: Menghitung koordinat live kurir, persentase perjalanan (10%-100%), ETA, dan status deskripsi.
   * `PUT /api/layanan/:id/tracking`: Admin memperbarui posisi GPS kurir manual atau simulasi.

4. **Payment Gateway Simulator (Midtrans Sandbox Simulation)**
   * `POST /api/layanan/:id/pembayaran`: Inisialisasi transaksi digital (generate QRIS dinamis, Nomor Virtual Account BCA/BNI/BRI/Mandiri, E-Wallet link, atau COD).
   * `POST /api/layanan/:id/pembayaran/konfirmasi`: Konfirmasi pembayaran lunas seketika.

---

## 🖥️ Frontend Pages & Navigation

1. **Beranda (`Home.js`):** Landing page responsif dengan Hero section, kartu 3 layanan utama, alur cara kerja 4 langkah, formulir pemesanan ringkas / CTA, tentang kami, dan footer.
2. **Masuk (`Login.js`):** Formulir login pelanggan/admin dengan penanganan error interaktif.
3. **Pendaftaran (`Register.js`):** Formulir pendaftaran akun baru pelanggan.
4. **Dashboard Pelanggan (`user/Dashboard.js`):** Ringkasan statistik pesanan, daftar transaksi aktif, filter status, dan tombol menuju pelacakan.
5. **Form Pemesanan Lengkap (`user/BuatLayanan.js`):** Pengisian jenis layanan, tipe kacamata, keluhan, alamat penjemputan, jadwal jemput, dan upload foto.
6. **Detail Pelayanan & Tracking (`user/DetailLayanan.js`):** Peta Leaflet interaktif, timeline pengerjaan, tombol direct intent Google Maps, dan modul pembayaran QRIS/VA.
7. **Dashboard Administrator (`admin/AdminDashboard.js`):** Metrik operasional toko optik, total pendapatan, grafik status, dan pesanan terbaru.
8. **Kelola Layanan Admin (`admin/DaftarLayanan.js`):** Tabel master pesanan pelanggan dengan pencarian dan filter status.
9. **Detail & Eksekusi Admin (`admin/AdminDetailLayanan.js`):** Form penetapan biaya, pergantian status, penugasan kurir, dan konfirmasi pelunasan.

---

## 📋 Required API Routes Summary

| Method | Endpoint | Access Role | Deskripsi Fungsi |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Publik | Pendaftaran akun baru pelanggan |
| `POST` | `/api/auth/login` | Publik | Otentikasi & penerbitan token JWT |
| `GET` | `/api/auth/me` | Pelanggan & Admin | Ambil profil sesi aktif |
| `GET` | `/api/layanan` | Pelanggan & Admin | Daftar pengajuan layanan |
| `GET` | `/api/layanan/:id` | Pelanggan & Admin | Rincian detail layanan |
| `POST` | `/api/layanan` | Pelanggan | Buat pengajuan perbaikan / lensa baru |
| `PUT` | `/api/layanan/:id/status` | Khusus Admin | Pembaruan status, biaya, & kurir |
| `POST` | `/api/layanan/:id/pembayaran` | Pelanggan & Admin | Inisialisasi transaksi QRIS/VA/COD |
| `POST` | `/api/layanan/:id/pembayaran/konfirmasi`| Pelanggan & Admin | Konfirmasi lunas pembayaran |
| `GET` | `/api/layanan/:id/tracking` | Pelanggan & Admin | Koordinat GPS kurir, ETA & peta rute |
| `PUT` | `/api/layanan/:id/tracking` | Khusus Admin | Update posisi kurir live |
| `DELETE`| `/api/layanan/:id` | Pelanggan & Admin | Batalkan pengajuan layanan |
| `GET` | `/api/detail-layanan/:layanan_id`| Pelanggan & Admin | Detail teknis frame & lensa |
| `POST` | `/api/detail-layanan` | Pelanggan & Admin | Input teknis kacamata |
| `PUT` | `/api/detail-layanan/:layanan_id`| Pelanggan & Admin | Perbarui teknis kacamata |

---

## 📁 Struktur Direktori Proyek

```text
RPLApp/
├── backend/
│   ├── config/
│   │   └── db.js                 # Pool koneksi MySQL & auto-migration
│   ├── controllers/
│   │   ├── authController.js     # Registrasi, login & profil JWT
│   │   ├── layananController.js  # CRUD layanan, kurir auto-assign, payment mock
│   │   └── detailLayananController.js # Spesifikasi teknis kacamata
│   ├── database/
│   │   └── schema.sql            # DDL 6 tabel ternormalisasi & data seed
│   ├── middleware/
│   │   ├── auth.js               # Verifikasi token JWT Bearer
│   │   └── adminAuth.js          # Proteksi RBAC khusus role admin
│   ├── routes/
│   │   ├── authRoutes.js         # Endpoint autentikasi
│   │   ├── layananRoutes.js      # Endpoint operasional layanan
│   │   └── detailLayananRoutes.js # Endpoint detail teknis kacamata
│   ├── tests/                    # 5 berkas pengujian otomatis (node:test)
│   │   ├── auth.test.js
│   │   ├── middleware.test.js
│   │   ├── layanan.test.js
│   │   ├── detailLayanan.test.js
│   │   └── pembayaran.test.js
│   ├── server.js                 # Entrypoint Express server (Port 5000)
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js         # Navigasi responsif & hamburger menu
│   │   │   └── LiveMapKurir.js   # Peta interaktif Leaflet OpenStreetMap
│   │   ├── pages/
│   │   │   ├── Home.js           # Beranda & Landing Page modern
│   │   │   ├── Login.js          # Halaman masuk
│   │   │   ├── Register.js       # Halaman pendaftaran
│   │   │   ├── user/             # Halaman pelanggan (Dashboard, Buat, Detail)
│   │   │   └── admin/            # Halaman admin (Dashboard, Daftar, Detail)
│   │   ├── utils/
│   │   │   ├── api.js            # Axios client dengan JWT interceptor
│   │   │   └── PrivateRoute.js   # Guard otentikasi & proteksi role
│   │   ├── App.js                # Definisi routing utama
│   │   ├── App.css               # Desain visual modern navy/cyan
│   │   └── index.js
│   └── package.json
├── docs/                         # Seluruh dokumentasi perkuliahan (P1 s/d P6)
├── docker-compose.yml
└── README.md                     # Panduan setup & instalasi utama
```

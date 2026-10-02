SISTEM INFORMASI LAYANAN ANTAR-JEMPUT KACAMATA
Sistem Informasi Layanan Antar-Jemput Kacamata untuk Perbaikan dan Penggantian Lensa Berbasis Web
================================================================================

DESKRIPSI
--------------------------------------------------------------------------------
Sistem Informasi Layanan Antar-Jemput Kacamata merupakan aplikasi berbasis web yang dibuat untuk membantu pelanggan dalam melakukan permintaan layanan perbaikan kacamata atau penggantian lensa tanpa harus datang langsung ke toko optik.

Pelanggan dapat mengajukan permintaan layanan melalui website dengan mengisi informasi kacamata, memilih jenis layanan, serta menentukan jadwal pengambilan kacamata.

Admin dapat mengelola permintaan pelanggan, mengatur jadwal pengambilan, dan memperbarui status layanan sampai kacamata selesai diperbaiki atau lensanya diganti.

--------------------------------------------------------------------------------
TUJUAN
--------------------------------------------------------------------------------
Sistem ini dibuat dengan tujuan:
- Mempermudah pelanggan dalam mengajukan layanan perbaikan atau penggantian lensa.
- Mempermudah proses pengambilan dan pengantaran kacamata.
- Membantu admin mengelola data permintaan pelanggan.
- Menyediakan informasi status layanan kepada pelanggan.
- Membuat proses layanan menjadi lebih terorganisir.

--------------------------------------------------------------------------------
MANFAAT
--------------------------------------------------------------------------------
Bagi Pelanggan:
- Tidak perlu datang langsung ke toko hanya untuk mengajukan layanan.
- Dapat mengajukan perbaikan atau penggantian lensa secara online.
- Dapat menentukan jadwal pengambilan.
- Dapat melihat status layanan.

Bagi Admin:
- Mempermudah pengelolaan permintaan layanan.
- Dapat melihat data pelanggan dan detail kacamata.
- Dapat mengatur jadwal pengambilan.
- Dapat memperbarui status layanan.

--------------------------------------------------------------------------------
PENGGUNA SISTEM
--------------------------------------------------------------------------------
Sistem memiliki 2 jenis pengguna:

1. Pelanggan
Pelanggan dapat:
- Register dan Login.
- Mengajukan layanan.
- Memilih jenis layanan.
- Mengisi alamat pengambilan.
- Memilih jadwal pengambilan.
- Melihat status layanan.

2. Admin
Admin dapat:
- Login.
- Melihat permintaan layanan.
- Melihat detail pelanggan.
- Mengatur jadwal pengambilan.
- Mengubah status layanan.

--------------------------------------------------------------------------------
FITUR UTAMA
--------------------------------------------------------------------------------
1. Login dan Register
Pelanggan dapat membuat akun dan login ke dalam sistem.

2. Pengajuan Layanan
Pelanggan dapat memilih jenis layanan:
- Perbaikan kacamata
- Penggantian lensa

Kemudian mengisi informasi seperti:
- Nama pelanggan
- Nomor telepon
- Alamat pengambilan
- Jenis layanan
- Keluhan atau kebutuhan
- Jadwal pengambilan

3. Penjadwalan Antar-Jemput
Pelanggan dapat menentukan jadwal pengambilan kacamata.
Admin dapat melihat dan mengatur jadwal yang telah diajukan.

4. Status Layanan
Pelanggan dapat melihat perkembangan layanan.

Contoh status:
Pengajuan -> Dijadwalkan -> Kacamata Diambil -> Sedang Diproses -> Selesai -> Diantar

5. Pengelolaan Layanan oleh Admin
Admin dapat:
- Melihat daftar permintaan.
- Melihat detail layanan.
- Mengubah status layanan.
- Mengatur jadwal pengambilan.
- Melihat riwayat layanan.

--------------------------------------------------------------------------------
ALUR SISTEM
--------------------------------------------------------------------------------
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
Mengisi Alamat dan Jadwal
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

--------------------------------------------------------------------------------
DATABASE
--------------------------------------------------------------------------------
Database dibuat sederhana dengan beberapa tabel utama.

Tabel users:
id
nama
email
password
role
no_telepon

Tabel layanan:
id
user_id
jenis_layanan
keluhan
alamat
tanggal_jemput
jam_jemput
status

Tabel detail_layanan:
id
layanan_id
jenis_kacamata
detail_perbaikan
keterangan

Relasi:
users
  │
  │ 1
  │
  │ banyak
  ▼
layanan
  │
  │ 1
  │
  │ banyak
  ▼
detail_layanan

--------------------------------------------------------------------------------
HALAMAN SISTEM
--------------------------------------------------------------------------------
Pelanggan:
- Login
- Register
- Dashboard
- Pengajuan Layanan
- Jadwal Antar-Jemput
- Status Layanan
- Riwayat Layanan

Admin:
- Login
- Dashboard Admin
- Daftar Layanan
- Detail Layanan
- Pengaturan Jadwal
- Update Status Layanan

--------------------------------------------------------------------------------
TEKNOLOGI
--------------------------------------------------------------------------------
Frontend:
- React.js
- HTML
- CSS
- JavaScript

Backend:
- Node.js
- Express.js
- REST API

Database:
- MySQL

Tools:
- Git
- GitHub
- Visual Studio Code
- Postman

--------------------------------------------------------------------------------
METODE PENGEMBANGAN
--------------------------------------------------------------------------------
Project dikembangkan menggunakan konsep Rekayasa Perangkat Lunak (RPL) melalui beberapa tahapan:
1. Analisis kebutuhan
2. Perancangan sistem
3. Perancangan database
4. Perancangan UI
5. Implementasi
6. Pengujian
7. Evaluasi

--------------------------------------------------------------------------------
PENGUJIAN
--------------------------------------------------------------------------------
Pengujian dilakukan untuk memastikan fitur sistem berjalan sesuai kebutuhan.
Fitur yang diuji meliputi:
- Login dan Register
- Pengajuan layanan
- Pemilihan jenis layanan
- Penjadwalan pengambilan
- Perubahan status layanan
- Pengelolaan layanan oleh admin

--------------------------------------------------------------------------------
STATUS PROJECT
--------------------------------------------------------------------------------
Status: Dalam Pengembangan
Project ini dibuat sebagai tugas Mata Kuliah Rekayasa Perangkat Lunak (RPL).

================================================================================
DOKUMEN ARSITEKTUR DAN PANDUAN PENGEMBANGAN LENGKAP
================================================================================

--------------------------------------------------------------------------------
FITUR YANG TIDAK DIKERJAKAN (DI LUAR RUANG LINGKUP 12 PERTEMUAN)
--------------------------------------------------------------------------------
1. Integrasi Gerbang Pembayaran Otomatis (Payment Gateway): Pembayaran tidak diproses secara otomatis via gateway pihak ketiga; transaksi biaya dilakukan langsung secara manual saat pengantaran.
2. Notifikasi Real-time Berbasis Socket / Web Push: Sistem tidak menggunakan WebSocket; pembaruan status dapat dilihat saat memuat atau me-refresh halaman dashboard.
3. Pelacakan Posisi GPS Kurir secara Langsung (Live GPS Tracking): Tidak menyertakan integrasi peta langsung untuk memantau posisi fisik armada penjemput.
4. Sistem Pesan Obrolan Langsung (In-App Chat): Komunikasi klarifikasi antara pelanggan dan staf optik dilakukan via telepon atau WhatsApp.
5. Multi-Cabang Optik (Multi-Tenancy): Sistem dikhususkan untuk operasional satu toko optik (single tenant).
6. Grafik Analitik Tingkat Lanjut (Chart / BI Dashboard): Dasbor fokus pada metrik angka ringkas dan tabel operasional tanpa komponen chart grafik visual.
7. Unggah Foto Kerusakan Frame dan Kartu Resep: Input spesifikasi kacamata dan ukuran resep dicatat dalam bentuk teks terstruktur.
8. Sistem Rating dan Ulasan Layanan: Belum menyertakan modul review dan rating kepuasan pelanggan.

--------------------------------------------------------------------------------
DOKUMEN ARSITEKTUR APLIKASI
--------------------------------------------------------------------------------
Aplikasi dibangun menggunakan arsitektur Client-Server Terpisah (Decoupled SPA + RESTful API) dengan menerapkan pola Model-View-Controller (MVC) pada sisi backend:

KLIEN (FRONTEND) - React.js (Port 3000)
- UI Pages (Views)
- Components (Navbar, Form)
- PrivateRoute (RBAC Guard)
- Axios HTTP Client (Interceptors dan Auth Bearer Header)
       │
       ▼ JSON over HTTP REST
SERVER (BACKEND) - Express.js (Port 5000)
- Global Middleware (CORS, Express.JSON, Logger)
- Routes Layer (/api/auth, /api/layanan, /api/detail-layanan)
- Security Middleware (JWT Auth Verification dan RBAC)
- Controllers Layer (Business Logic dan Validation)
- Data Access Layer (mysql2 Connection Pool)
       │
       ▼ SQL Queries (TCP 3306)
BASIS DATA (DATABASE) - MySQL Server (db_kacamata)
- users (Akun dan Role)
- layanan (Transaksi Servis)
- detail_layanan (Rincian Teknis Kacamata dan Lensa)

Alur Data (Data Flow):
Browser -> React App (View) -> Axios HTTP Request
  -> Express Router (/api/endpoint)
  -> Middleware (JWT Auth dan Role Check)
  -> Controller (Logika Bisnis dan Validasi)
  -> mysql2 Connection Pool -> Eksekusi Query MySQL
  -> Response JSON -> Axios -> Render State di React UI

--------------------------------------------------------------------------------
TECH STACK LENGKAP
--------------------------------------------------------------------------------
Layer           Teknologi         Versi        Peran dalam Sistem
--------------------------------------------------------------------------------
Backend         Node.js           >= 16.x      Lingkungan runtime eksekusi JavaScript sisi server
Framework API   Express.js        4.19.2       Routing HTTP, middleware pipeline, RESTful API
Database Driver mysql2            3.9.7        Komunikasi query MySQL dengan Connection Pooling
Keamanan Auth   jsonwebtoken      9.0.2        Penerbitan dan validasi token sesi stateless (JWT)
Enkripsi Sandi  bcryptjs          2.4.3        Hashing password dengan salt sebelum simpan database
Frontend UI     React.js          18.2.0       Pustaka antarmuka pengguna interaktif (SPA)
Perutean        React Router DOM  6.22.3       Navigasi halaman sisi klien dan proteksi rute privat
HTTP Client     Axios             1.6.8        Pengiriman request asynchronous ke backend
Database        MySQL / MariaDB   8.0 / 10.4+  Sistem Manajemen Basis Data Relasional (RDBMS)

--------------------------------------------------------------------------------
PREREQUISITES (PERSYARATAN SISTEM)
--------------------------------------------------------------------------------
Kebutuhan        Keterangan
--------------------------------------------------------------------------------
Node.js          Versi >= 16.x (disarankan LTS 18.x/20.x). Cek dengan node --version.
npm              Node Package Manager. Cek dengan npm --version.
MySQL / MariaDB  Melalui XAMPP, Laragon, atau MySQL Server standalone.
Port Bebas       Port 3000 (React), 5000 (Express), dan 3306 (MySQL) tidak dipakai aplikasi lain.
Git              Untuk pelacakan source code dan kolaborasi tim.

Catatan untuk pengguna Windows: Seluruh perintah dapat dijalankan di PowerShell, Command Prompt (CMD), atau Git Bash. Jika menggunakan CMD, perintah cp diganti dengan copy.

--------------------------------------------------------------------------------
PANDUAN INSTALASI DAN CARA MENJALANKAN (QUICK START)
--------------------------------------------------------------------------------
1. Masuk ke Folder Project:
   cd RPLApp

2. Siapkan Basis Data MySQL (XAMPP / Laragon):
   - Nyalakan modul MySQL pada XAMPP/Laragon (port 3306).
   - Buka phpMyAdmin (http://localhost/phpmyadmin) atau terminal MySQL.
   - Impor berkas: backend/database/schema.sql
   - Atau via terminal: mysql -u root -p < backend/database/schema.sql

3. Konfigurasi File Environment (.env):
   cd backend
   copy .env.example .env
   cd ..

   Isi file backend/.env:
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=db_kacamata
   DB_PORT=3306
   JWT_SECRET=super_secret_jwt_kacamata_key_2026_universitas
   JWT_EXPIRES_IN=24h

4. Instalasi Dependencies:
   cd backend
   npm install
   cd ../frontend
   npm install
   cd ..

5. Jalankan Aplikasi:
   - Cara Otomatis: Klik ganda berkas jalankan_aplikasi.bat
   - Cara Manual (2 Terminal):
     Terminal 1: cd backend && npm run dev
     Terminal 2: cd frontend && npm start

6. Verifikasi Service Aktif:
   curl http://localhost:5000/api/health
   Respons: { "status": "UP", "timestamp": "2026-10-02T..." }

7. Akses Aplikasi dan Akun Pengujian:
   Buka browser di: http://localhost:3000

   Akun demo siap pakai (password: admin123):
   - Admin: admin@optik.com (password: admin123)
     Hak akses: Dashboard admin, verifikasi jadwal kurir, pembaruan status servis
   - Pelanggan: bahrul@gmail.com (password: admin123)
     Hak akses: Pengajuan servis frame/lensa, penentuan alamat dan jadwal, pelacakan status

8. Menghentikan Aplikasi:
   Tekan Ctrl + C pada jendela terminal yang berjalan, atau tutup jendela terminal jalankan_aplikasi.bat.

--------------------------------------------------------------------------------
TROUBLESHOOTING
--------------------------------------------------------------------------------
1. Masalah: port 5000 is already allocated
   Penyebab: Port 5000 dipakai proses lain
   Solusi: Matikan proses via Task Manager, atau ubah PORT=5001 di backend/.env

2. Masalah: port 3000 is already allocated
   Penyebab: Port 3000 terpakai aplikasi lain
   Solusi: Saat ditanya run on another port, ketik Y (akan berjalan di port 3001)

3. Masalah: FATAL ER_ACCESS_DENIED_ERROR
   Penyebab: Kredensial MySQL salah di .env
   Solusi: Periksa nilai DB_USER dan DB_PASSWORD pada file backend/.env

4. Masalah: FATAL ER_BAD_DB_ERROR
   Penyebab: Database db_kacamata belum diimpor
   Solusi: Buka phpMyAdmin, impor ulang file backend/database/schema.sql

5. Masalah: Cannot find module express
   Penyebab: Folder node_modules backend belum ada
   Solusi: Masuk ke folder backend lalu jalankan perintah npm install

6. Masalah: Cannot find module react
   Penyebab: Folder node_modules frontend belum ada
   Solusi: Masuk ke folder frontend lalu jalankan perintah npm install

7. Masalah: Halaman blank atau Failed to fetch
   Penyebab: Server backend belum aktif
   Solusi: Pastikan terminal backend running di port 5000 sebelum membuka browser

8. Masalah: Perubahan kode tidak muncul
   Penyebab: Cache peramban
   Solusi: Lakukan hard refresh browser dengan menekan tombol Ctrl + Shift + R

9. Masalah: Gagal Login atau User tidak ada
   Penyebab: Seed data belum masuk ke database
   Solusi: Jalankan query baris 51-131 pada file backend/database/schema.sql

--------------------------------------------------------------------------------
STRUKTUR PROJECT LENGKAP
--------------------------------------------------------------------------------
RPLApp/
├── backend/                            Server RESTful API (Node.js & Express)
│   ├── config/                         Konfigurasi koneksi MySQL connection pool
│   ├── controllers/                    Handler registrasi, login, layanan, dan detail kacamata
│   ├── database/                       DDL skema database & seed data akun
│   ├── middleware/                     Middleware verifikasi Bearer Token JWT & RBAC admin
│   ├── routes/                         Rute endpoint otentikasi, layanan, detail kacamata
│   ├── .env.example                    Template konfigurasi variabel lingkungan backend
│   ├── package.json                    Dependensi server Express
│   ├── server.js                       Titik masuk utama aplikasi backend
│   └── README.md                       Dokumentasi teknis backend API
├── frontend/                           Aplikasi Klien SPA (React.js)
│   ├── public/                         Template HTML utama
│   ├── src/
│   │   ├── components/                 Komponen navigasi bar global
│   │   ├── pages/                      Landing page, Login, Register, Dashboard, BuatLayanan
│   │   │   └── admin/                  Dasbor monitoring admin, DaftarLayanan, AdminDetailLayanan
│   │   ├── utils/                      Axios client dengan interceptor & PrivateRoute RBAC
│   │   ├── App.js                      Root component dan konfigurasi perutean
│   │   ├── App.css                     Gaya CSS responsif global
│   │   └── index.js                    Inisialisasi React DOM
│   └── package.json                    Dependensi frontend (proxy ke port 5000)
├── jalankan_aplikasi.bat               Skrip eksekusi satu-klik untuk Windows
├── powershell.bat                      Utilitas peluncur PowerShell
├── .env.example                        Template konfigurasi environment root
├── .gitignore                          Pengabaian git (.env, node_modules, build)
└── README.md                           Dokumentasi arsitektur dan panduan lengkap

--------------------------------------------------------------------------------
SECURITY NOTES (KEAMANAN SISTEM)
--------------------------------------------------------------------------------
- Isolasi Variabel Lingkungan: File .env bersifat rahasia dan tidak pernah di-commit ke Git (terdaftar di .gitignore). Template publik aman disediakan melalui .env.example.
- Kriptografi Password: Kata sandi pengguna tidak disimpan dalam bentuk teks polos, melainkan dienkripsi dengan algoritma BCrypt menggunakan salt rounds terstandar.
- Otentikasi Stateless JWT: Token otentikasi ditandatangani menggunakan JWT_SECRET dengan masa berlaku 24 jam (JWT_EXPIRES_IN=24h).
- Proteksi Akses Ganda (RBAC):
  Pada Backend: Middleware auth.js memvalidasi tanda tangan token, sedangkan adminAuth.js memblokir akses jika role bukan admin.
  Pada Frontend: Komponen PrivateRoute.js mencegat navigasi yang tidak berhak dan mengalihkan pengguna ke halaman login.
- Mitigasi SQL Injection: Seluruh query basis data dieksekusi menggunakan Prepared Statements / Parameterized Queries via pustaka mysql2.

--------------------------------------------------------------------------------
DOKUMEN LENGKAP PROYEK
--------------------------------------------------------------------------------
Dokumen Produk dan Ide:
- LAPORAN_IMPLEMENTASI_P3.docx: Laporan formal implementasi P3 dalam format Microsoft Word
- LAPORAN_IMPLEMENTASI_P3.md: Laporan implementasi tugas P3 (spesifikasi, arsitektur, dan kode sumber)
- backend/database/schema.sql: Skrip lengkap DDL tabel basis data dan seed data awal pengujian
- backend/README.md: Dokumentasi teknis endpoint API, panduan instalasi, dan payload backend

Dokumen Panduan Pengembangan:
- CATATAN_PERBAIKAN_ERROR.md: Log pencatatan error, identifikasi penyebab, dan solusi perbaikan kode
- PERBANDINGAN_KODE_ERROR_DAN_FIX.md: Komparasi kode sebelum dan sesudah perbaikan bug
- jalankan_aplikasi.bat: Skrip otomatisasi sekali-klik untuk menjalankan backend dan frontend serentak

--------------------------------------------------------------------------------
TARGET PENGGUNA DAN TANGGUNG JAWAB (2 ROLE RBAC)
--------------------------------------------------------------------------------
1. Peran: pelanggan
   Profil: Pengguna kacamata minus/silinder/plus yang memerlukan servis atau ganti lensa
   Tanggung Jawab:
   - Registrasi akun dan otentikasi login.
   - Mengajukan permohonan layanan antar-jemput baru.
   - Mengisi alamat lengkap penjemputan dan memilih tanggal serta jam jemput.
   - Menginput spesifikasi frame dan keluhan perbaikan kacamata.
   - Memantau progres pengerjaan servis secara mandiri.
   - Melihat histori seluruh pesanan servis yang pernah diajukan.

2. Peran: admin
   Profil: Staf operasional, manajemen optik, dan teknisi laboratorium
   Tanggung Jawab:
   - Masuk ke sistem menggunakan kredensial admin terverifikasi.
   - Memantau antrean pesanan masuk dan statistik pada Dasbor Admin.
   - Memeriksa keluhan frame dan ukuran resep lensa pelanggan.
   - Mengonfirmasi jadwal penjemputan kurir.
   - Memperbarui status siklus pengerjaan secara bertahap.
   - Mengelola dan membatalkan pesanan jika terdapat kendala operasional.

--------------------------------------------------------------------------------
DAFTAR FITUR INTI (STATUS KEJUJURAN KODE)
--------------------------------------------------------------------------------
Status ditandai secara transparan: [Ada] = selesai diimplementasikan pada kode sumber; [Rencana] = dirancang untuk pengembangan fase berikutnya.

- [Ada] Autentikasi dan RBAC Multi-Role: Registrasi pelanggan baru, login dengan token JWT, proteksi rute halaman via PrivateRoute, pembatasan endpoint API via middleware.
- [Ada] Formulir Pengajuan Servis: Pemilihan jenis layanan (perbaikan atau penggantian lensa), keluhan, alamat penjemputan, tanggal dan jam pengambilan.
- [Ada] Spesifikasi Teknis Kacamata: Input jenis kacamata/frame, detail perbaikan teknis, catatan ukuran lensa minus/silinder.
- [Ada] Siklus Status Layanan (State Machine): Alur status 6 tahap terstruktur:
  pengajuan -> dijadwalkan -> diambil -> diproses -> selesai -> diantar.
- [Ada] Dasbor Mandiri Pelanggan: Panel pemantau status aktif untuk setiap pesanan pelanggan dengan indikator status.
- [Ada] Dasbor Kendali Administrator: Tabel seluruh pesanan dari semua pelanggan dilengkapi kontrol pembaruan status pengerjaan.
- [Ada] Pembatalan dan Hapus Layanan: Penghapusan pesanan dengan cascading delete terintegrasi pada relasi database.
- [Rencana] Notifikasi Otomatis WhatsApp / Email: Pemberitahuan otomatis saat status kacamata berganti tahapan.
- [Rencana] Integrasi Payment Gateway: Pembayaran digital ongkir dan biaya servis via transfer / QRIS secara online.
- [Rencana] Pelacakan Kurir Langsung (Live GPS): Pelacakan posisi kurir antar-jemput pada peta digital real-time.
- [Rencana] Unggah Foto Kacamata dan Resep Optik: Fasilitas upload foto kerusakan frame kacamata dan foto resep dokter.

--------------------------------------------------------------------------------
DAFTAR LENGKAP API ENDPOINT
--------------------------------------------------------------------------------
Seluruh endpoint menerima dan mengembalikan data dalam format JSON. Endpoint bertanda [Auth] mewajibkan header Authorization: Bearer <token_jwt>.

1. Autentikasi (/api/auth)
POST /api/auth/register
- Akses: Publik
- Deskripsi: Mendaftarkan akun pelanggan baru
- Payload Body: { "nama", "email", "password", "no_telepon" }

POST /api/auth/login
- Akses: Publik
- Deskripsi: Otentikasi login dan menerbitkan token JWT
- Payload Body: { "email", "password" }

GET /api/auth/me
- Akses: [Auth]
- Deskripsi: Mengambil data profil pengguna yang sedang login dari token JWT

2. Layanan Antar-Jemput (/api/layanan)
GET /api/layanan
- Akses: [Auth]
- Deskripsi: Mengambil daftar pesanan (Admin: semua pesanan; Pelanggan: milik sendiri)

GET /api/layanan/:id
- Akses: [Auth]
- Deskripsi: Mengambil rincian lengkap satu transaksi layanan beserta detail kacamata

POST /api/layanan
- Akses: [Auth]
- Deskripsi: Membuat permohonan servis antar-jemput baru
- Payload Body: { "jenis_layanan", "keluhan", "alamat", "tanggal_jemput", "jam_jemput", "jenis_kacamata", "detail_perbaikan", "keterangan" }

PUT /api/layanan/:id/status
- Akses: [Auth Admin]
- Deskripsi: Memperbarui tahapan status pengerjaan servis
- Payload Body: { "status": "pengajuan|dijadwalkan|diambil|diproses|selesai|diantar" }

DELETE /api/layanan/:id
- Akses: [Auth]
- Deskripsi: Membatalkan / menghapus rekaman pesanan layanan

3. Detail Kacamata (/api/detail-layanan)
GET /api/detail-layanan/layanan/:layanan_id
- Akses: [Auth]
- Deskripsi: Mengambil data detail kacamata berdasarkan ID induk transaksi layanan

GET /api/detail-layanan/:id
- Akses: [Auth]
- Deskripsi: Mengambil spesifikasi teknis kacamata berdasarkan ID detail

POST /api/detail-layanan
- Akses: [Auth]
- Deskripsi: Menambahkan data detail kacamata baru ke suatu pesanan

PUT /api/detail-layanan/:id
- Akses: [Auth]
- Deskripsi: Memperbarui rincian frame atau catatan perbaikan kacamata

DELETE /api/detail-layanan/:id
- Akses: [Auth]
- Deskripsi: Menghapus data rincian teknis kacamata

4. Health Check
GET /
- Akses: Publik
- Deskripsi: Menampilkan pesan selamat datang, status server, dan daftar endpoint

GET /api/health
- Akses: Publik
- Deskripsi: Monitoring kesiapan server (mengembalikan { "status": "UP" })

--------------------------------------------------------------------------------
SKEMA BASIS DATA TERPERINCI
--------------------------------------------------------------------------------
Tabel users:
- PK id: INT AUTO_INCREMENT
- nama: VARCHAR(100) NOT NULL
- email: VARCHAR(100) UNIQUE
- password: VARCHAR(255) NOT NULL
- role: ENUM('pelanggan', 'admin') DEFAULT 'pelanggan'
- no_telepon: VARCHAR(20)
- created_at: TIMESTAMP

Tabel layanan:
- PK id: INT AUTO_INCREMENT
- FK user_id: INT NOT NULL (referensi ke users.id ON DELETE CASCADE)
- jenis_layanan: ENUM('perbaikan', 'penggantian_lensa') NOT NULL
- keluhan: TEXT NOT NULL
- alamat: TEXT NOT NULL
- tanggal_jemput: DATE NOT NULL
- jam_jemput: TIME NOT NULL
- status: ENUM('pengajuan', 'dijadwalkan', 'diambil', 'diproses', 'selesai', 'diantar') DEFAULT 'pengajuan'
- created_at: TIMESTAMP

Tabel detail_layanan:
- PK id: INT AUTO_INCREMENT
- FK layanan_id: INT NOT NULL (referensi ke layanan.id ON DELETE CASCADE)
- jenis_kacamata: VARCHAR(100) NOT NULL
- detail_perbaikan: TEXT
- keterangan: TEXT

--------------------------------------------------------------------------------
TARGET DAN KRITERIA KEBERHASILAN APLIKASI
--------------------------------------------------------------------------------
Target berikut adalah sasaran produk aplikasi tugas RPL:
- Aplikasi bersifat Runnable: Backend (Port 5000) dan Frontend (Port 3000) berhasil dijalankan tanpa error kompilasi (Terpenuhi)
- UI berhasil muncul: Seluruh halaman antarmuka pengguna dapat dibuka dan ditampilkan di browser (Terpenuhi)
- Autentikasi dan RBAC: Register, login, penerbitan JWT, serta pembatasan peran admin dan pelanggan bekerja (Terpenuhi)
- CRUD Transaksi dan Detail: Data tersimpan dan terbaca secara konsisten dari basis data MySQL (Terpenuhi)
- Alur State Machine Status: Admin dapat memperbarui tahapan status layanan secara berurutan dan terlihat oleh pelanggan (Terpenuhi)
- Desain Responsif: Tata letak antarmuka tetap rapi pada layar monitor desktop maupun perangkat mobile (Terpenuhi)
- Waktu respons API: Target < 300 ms (belum diuji secara formal di bawah beban tinggi)
- Efisiensi waktu pelanggan: Terpangkas >= 80% dibandingkan harus datang fisik ke optik (sasaran produk)

--------------------------------------------------------------------------------
HASIL VERIFIKASI PENGUJIAN SISTEM
--------------------------------------------------------------------------------
1. Modul: Backend API (npm run dev)
   Hasil: Server mendengarkan koneksi di port 5000 (Berhasil)

2. Modul: Frontend React (npm start)
   Hasil: Webpack mengompilasi dan membuka browser di port 3000 (Berhasil)

3. Modul: Koneksi Basis Data MySQL
   Hasil: Driver mysql2 tersambung ke database db_kacamata (Berhasil)

4. Modul: Health Check Endpoint
   Hasil: Endpoint GET /api/health membalas JSON { "status": "UP" } (Berhasil)

5. Modul: Registrasi Akun Pelanggan
   Hasil: Pengguna baru tersimpan di tabel users dengan sandi terenkripsi (Berhasil)

6. Modul: Login dan Penerbitan JWT
   Hasil: Kredensial valid menghasilkan token dan mengarahkan ke dashboard (Berhasil)

7. Modul: Pengajuan Servis Baru
   Hasil: Data tersimpan serentak pada tabel layanan dan detail_layanan (Berhasil)

8. Modul: Proteksi Rute Administratif
   Hasil: Pelanggan biasa diblokir saat mencoba mengakses rute admin (Berhasil)

9. Modul: Perubahan Status Servis
   Hasil: Admin dapat mengubah status pengerjaan dan terlihat oleh pelanggan (Berhasil)

--------------------------------------------------------------------------------
KESIMPULAN DAN STATUS AKHIR
--------------------------------------------------------------------------------
Status: Aplikasi Runnable - UI Berhasil Muncul dan Terverifikasi Penuh

Aplikasi Sistem Informasi Layanan Antar-Jemput Kacamata telah berhasil diimplementasikan secara menyeluruh dengan arsitektur terpisah (Decoupled React + Express + MySQL), dilengkapi skema database berelasi, seed data pengujian, mekanisme keamanan JWT dan RBAC, serta skrip otomatisasi eksekusi untuk presentasi dan pengujian tugas mata kuliah Rekayasa Perangkat Lunak (RPL).

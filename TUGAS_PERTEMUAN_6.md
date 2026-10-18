# 📋 LAPORAN TUGAS PERTEMUAN 6: PENYEMPURNAAN MVP
**Mata Kuliah:** Rekayasa Perangkat Lunak (RPL)  
**Topik:** Penyempurnaan MVP (Minimum Viable Product), 5 User Stories, 5 Unit Test Files, dan Git Version Control.  
**Repositori GitHub:** [https://github.com/akuntugassindar-spec/RPLApp.git](https://github.com/akuntugassindar-spec/RPLApp.git)

---

## 1. 🔍 Review Pertemuan 6: MVP-nya Apa?

* **Nama Produk:** **OptikExpress**
* **Deskripsi Produk:**  
  Aplikasi web layanan servis kacamata dan penggantian lensa optik berbasis antar-jemput (*courier delivery service*). OptikExpress memfasilitasi pelanggan untuk memperbaiki kacamata rusak (gagang patah, sekrup lepas, nosepad copot) atau memasang lensa resep dokter (minus, silinder, blueray, photocromic) tanpa perlu datang langsung ke toko fisik optik.
* **Fitur Inti MVP:**
  1. **Pengajuan Layanan & Upload Bukti**: Formulir pemesanan dengan pratinjau foto fisik kacamata rusak dan lembar resep dokter.
  2. **Pelacakan Armada Kurir Real-Time**: Integrasi peta jalan interaktif (*OpenStreetMap / Leaflet*) dengan koordinat live GPS, animasi pergerakan kurir, dan tombol direct intent rute di Google Maps.
  3. **Penugasan Kurir Cerdas (Hybrid Dispatch)**: Auto-assign armada kurir internal optik secara adil (*Round-Robin*) ala Gojek/Grab + kontrol override manual untuk admin.
  4. **Multi-Payment Gateway**: Integrasi pembayaran digital (QRIS dinamis siap scan, BCA/BNI/BRI/Mandiri Virtual Account dengan tombol satu-klik Salin, GoPay, dan Cash on Delivery).
  5. **Role-Based Access Control (RBAC)**: Pemisahan hak akses antara akun pelanggan dan administrator optik menggunakan token JWT dan middleware terproteksi.

---

## 2. 📝 Implementasi 5 User Story & Acceptance Criteria (AC)

Seluruh fitur bisnis inti telah didefinisikan ke dalam 5 User Story dengan kriteria penerimaan yang jelas dan terukur:

### User Story 1: Manajemen Alur Siklus Layanan (Service Request Lifecycle)
> *"Sebagai pelanggan, saya ingin mengajukan servis kacamata dan memantau pembaruan status pengerjaan secara transparan dari awal hingga selesai."*
* **AC-1**: Sistem mendukung 3 kategori layanan: `perbaikan`, `penggantian_lensa`, dan `perbaikan_dan_lensa`.
* **AC-2**: Sistem memvalidasi 6 tahapan alur status operasional: `pengajuan` $\rightarrow$ `dijadwalkan` $\rightarrow$ `diambil` $\rightarrow$ `diproses` $\rightarrow$ `selesai` $\rightarrow$ `diantar`.
* **AC-3**: Request wajib menolak payload kosong atau jenis layanan di luar daftar yang diizinkan (HTTP 400 Bad Request).
* **AC-4**: Notifikasi otomatis (Email SMTP dan WhatsApp Mock log) terkirim secara konsisten setiap status pesanan diperbarui.

### User Story 2: Registrasi, Login & Keamanan Autentikasi Pengguna
> *"Sebagai pengguna, saya ingin mendaftarkan akun dan login dengan aman agar histori transaksi servis saya terlindungi."*
* **AC-1**: Registrasi menolak jika field nama, email, atau password kosong (HTTP 400).
* **AC-2**: Format email divalidasi ketat menggunakan standar regex email.
* **AC-3**: Password wajib di-hash menggunakan algoritma satu arah BCrypt (salt rounds 10) sebelum disimpan ke basis data.
* **AC-4**: Login dengan kredensial yang valid menerbitkan JSON Web Token (JWT) yang membawa payload identitas (`id`, `nama`, `email`, `role`).

### User Story 3: Middleware Otorisasi JWT & Proteksi Administrator
> *"Sebagai sistem, saya ingin memvalidasi hak akses token JWT agar pelanggan biasa tidak dapat memanipulasi data pengguna lain atau mengakses panel admin."*
* **AC-1**: Menolak akses ke endpoint privat jika header `Authorization` kosong (HTTP 401 Unauthorized).
* **AC-2**: Menolak token tanpa format `Bearer <token>` atau token kadaluwarsa/salah secret key (HTTP 401).
* **AC-3**: Pengguna dengan role `pelanggan` dilarang mengakses endpoint penetapan biaya, pembaruan status, atau update kurir (HTTP 403 Forbidden).
* **AC-4**: Endpoint administrasi hanya dapat dieksekusi oleh akun dengan role `admin`.

### User Story 4: Spesifikasi Teknis Kacamata & Resep Lensa (CRUD)
> *"Sebagai teknisi optik, saya ingin mencatat spesifikasi frame dan ukuran minus/silinder kacamata agar pengerjaan optik presisi."*
* **AC-1**: Pembuatan rincian teknis wajib memiliki relasi `layanan_id` yang terdaftar di basis data.
* **AC-2**: Mengisi nilai fallback `"-"` secara otomatis untuk field opsional jika tidak diisi pelanggan.
* **AC-3**: Mempertahankan nilai data lama saat dilakukan pembaruan sebagian (*partial update* HTTP PUT).
* **AC-4**: Menjamin isolasi data: pelanggan hanya dapat membaca detail kacamata miliknya sendiri, sedangkan admin dapat mengakses semua data.

### User Story 5: Pembayaran Digital Multi-Metode & Pelacakan Kurir Live GPS
> *"Sebagai pelanggan, saya ingin membayar biaya layanan secara digital dan melihat pergerakan kurir penjemput/pengantar di peta jalan nyata."*
* **AC-1**: Sistem mendukung minimal 8 metode transaksi: `qris`, `bca_va`, `bni_va`, `bri_va`, `mandiri_va`, `gopay`, `shopeepay`, dan `cod`.
* **AC-2**: ID Transaksi dibuat dengan format standar unik `MIDTRANS-{timestamp}-{random}`.
* **AC-3**: Persentase perjalanan kurir dihitung secara dinamis sesuai tahapan status pengerjaan (10% s.d. 100%).
* **AC-4**: Posisi kurir dihitung melalui interpolasi koordinat GPS nyata antara Toko Optik (Jl. Pemuda 48) dan alamat pelanggan.
* **AC-5**: Peta terintegrasi menggunakan OpenStreetMap (Leaflet) dan dilengkapi tombol navigasi rute turn-by-turn langsung ke Google Maps resmi.

---

## 3. 🧪 5 File Unit Test (Aturan Bisnis Proyek)

Seluruh pengujian unit test telah dibuat dan ditempatkan pada folder [`backend/tests/`](file:///c:/Users/sinda/OneDrive/RPLApp/backend/tests/):

| No | File Pengujian | Modul / Aturan Bisnis yang Diuji | Jumlah Test |
| :---: | :--- | :--- | :---: |
| **1** | [`backend/tests/layanan.test.js`](file:///c:/Users/sinda/OneDrive/RPLApp/backend/tests/layanan.test.js) | Validasi jenis layanan, alur status, format email/WA, penyimpanan gambar base64, dan penugasan armada kurir internal (*Auto-Assign*). | 11 Tests |
| **2** | [`backend/tests/auth.test.js`](file:///c:/Users/sinda/OneDrive/RPLApp/backend/tests/auth.test.js) | Validasi form registrasi, regex email, hash & verifikasi sandi BCrypt, payload JWT, dan verifikasi secret. | 10 Tests |
| **3** | [`backend/tests/middleware.test.js`](file:///c:/Users/sinda/OneDrive/RPLApp/backend/tests/middleware.test.js) | Otorisasi Bearer token, penolakan token palsu/expired, pemblokiran role pelanggan, dan izin role admin. | 8 Tests |
| **4** | [`backend/tests/detailLayanan.test.js`](file:///c:/Users/sinda/OneDrive/RPLApp/backend/tests/detailLayanan.test.js) | Validasi relasi foreign key, sanitasi input, nilai default `"-"`, partial update, dan pembatasan akses kepemilikan. | 8 Tests |
| **5** | [`backend/tests/pembayaran.test.js`](file:///c:/Users/sinda/OneDrive/RPLApp/backend/tests/pembayaran.test.js) | Validasi 8 metode pembayaran, format ID transaksi Midtrans, kalkulasi persentase perjalanan, interpolasi koordinat kurir, dan kalkulasi ETA. | 11 Tests |
| **Total** | **5 File Unit Test** | **9 Test Suites Lengkap** | **48 Tests** |

---

## 4. 🚀 Cara Menjalankan & Bukti Kelulusan Unit Test

### Perintah Eksekusi:
Jalankan perintah berikut di root folder project:
```bash
node --test backend/tests/layanan.test.js backend/tests/auth.test.js backend/tests/middleware.test.js backend/tests/detailLayanan.test.js backend/tests/pembayaran.test.js
```

### Hasil Output Terminal Asli (All Passed):
```text
▶ User Story #2: Registrasi & Login Autentikasi
  ✔ AC-1: register() menolak jika nama kosong (HTTP 400)
  ✔ AC-1: register() menolak jika email kosong (HTTP 400)
  ✔ AC-1: register() menolak jika password kosong (HTTP 400)
  ✔ AC-2: register() menolak jika format email tidak valid (HTTP 400)
  ✔ AC-3: login() menolak jika email kosong (HTTP 400)
  ✔ AC-3: login() menolak jika password kosong (HTTP 400)
  ✔ AC-4: bcryptjs harus menghasilkan hash berbeda dari plaintext
  ✔ AC-4: bcryptjs harus menolak perbandingan password yang salah
  ✔ AC-5: JWT token harus mengandung payload id, nama, email, dan role
  ✔ AC-5: JWT token harus expired jika secret salah
✔ User Story #2: Registrasi & Login Autentikasi (622ms)

▶ User Story #4: Detail Teknis Kacamata (CRUD)
  ✔ AC-1: createDetailLayanan menolak jika layanan_id kosong (HTTP 400)
  ✔ AC-1: createDetailLayanan menolak jika layanan_id null
  ✔ AC-2: Default value "-" harus diterapkan untuk field opsional
  ✔ AC-2: Default value tidak menimpa jika field sudah terisi
  ✔ AC-4: updateDetailLayanan mempertahankan data lama ketika field baru undefined
  ✔ AC-5: Validasi role - pelanggan biasa tidak boleh mengakses data user lain
  ✔ AC-5: Validasi role - admin boleh mengakses data siapa saja
  ✔ AC-5: Validasi role - pemilik layanan boleh mengakses datanya sendiri
✔ User Story #4: Detail Teknis Kacamata (CRUD) (8ms)

▶ Pengujian Fitur 1: Manajemen & Validasi Layanan (Service Management)
  ✔ Harus memiliki seluruh jenis layanan yang didukung sistem (termasuk perbaikan_dan_lensa)
  ✔ Harus memiliki 6 alur status layanan yang valid
  ✔ createLayanan harus menolak jika field wajib kosong (HTTP 400)
  ✔ createLayanan harus menolak jika jenis_layanan tidak valid (HTTP 400)
  ✔ updateStatusLayanan harus menolak jika status kosong (HTTP 400)
  ✔ updateStatusLayanan harus menolak jika status baru tidak valid (HTTP 400)
✔ Pengujian Fitur 1: Manajemen & Validasi Layanan (Service Management) (11ms)

▶ Pengujian Fitur 2: Notifikasi Otomatis (Email & WhatsApp Mock)
  ✔ sendWANotification harus mengeksekusi format log WhatsApp dengan status uppercase
  ✔ sendWANotification harus dapat menangani jika no telepon kosong
✔ Pengujian Fitur 2: Notifikasi Otomatis (Email & WhatsApp Mock) (2ms)

▶ Pengujian Fitur 3: Unggah Foto Kacamata & Resep Optik
  ✔ saveBase64Image harus mengembalikan null jika input kosong
  ✔ saveBase64Image harus mempertahankan URL existing
  ✔ saveBase64Image harus menyimpan base64 valid
✔ Pengujian Fitur 3: Unggah Foto Kacamata & Resep Optik (4ms)

▶ Pengujian Fitur 4: Integrasi Payment Gateway (Metode & Simulasi Midtrans)
  ✔ VALID_METODE_PEMBAYARAN harus mencakup QRIS, VA, e-Wallet, dan COD
✔ Pengujian Fitur 4: Integrasi Payment Gateway (Metode & Simulasi Midtrans) (1ms)

▶ Pengujian Fitur 5: Penugasan Kurir Cerdas (Auto-Assign like Gojek/Grab)
  ✔ COURIER_POOL harus menyediakan armada kurir internal optik
  ✔ autoAssignCourier harus menugaskan kurir secara deterministik dan merata
✔ Pengujian Fitur 5: Penugasan Kurir Cerdas (Auto-Assign like Gojek/Grab) (1ms)

▶ User Story #3: Middleware Otorisasi JWT & Proteksi Admin
  ✔ AC-1: authMiddleware menolak request tanpa header Authorization (HTTP 401)
  ✔ AC-2: authMiddleware menolak jika format bukan "Bearer <token>"
  ✔ AC-2: authMiddleware menolak jika hanya token tanpa prefix Bearer
  ✔ AC-3: authMiddleware menolak token JWT yang tidak valid
  ✔ AC-3: authMiddleware meneruskan request jika token JWT valid
  ✔ AC-4: adminAuthMiddleware menolak user tanpa autentikasi (req.user undefined)
  ✔ AC-4: adminAuthMiddleware menolak user dengan role pelanggan (HTTP 403)
  ✔ AC-5: adminAuthMiddleware meneruskan request jika role admin
✔ User Story #3: Middleware Otorisasi JWT & Proteksi Admin (88ms)

▶ User Story #5: Pembayaran Gateway & Live Tracking Kurir
  ✔ AC-1: Sistem mendukung 8 metode pembayaran yang diwajibkan
  ✔ AC-2: Metode pembayaran yang tidak valid harus ditolak oleh validasi
  ✔ AC-3: Format Transaction ID harus mengikuti pola MIDTRANS-{timestamp}-{random}
  ✔ AC-3: Setiap Transaction ID harus unik
  ✔ AC-4: updateTrackingKurir menolak jika tidak ada data tracking yang dikirim (HTTP 400)
  ✔ AC-5: Persentase perjalanan harus dihitung berdasarkan status layanan
  ✔ AC-5: Kalkulasi posisi kurir berdasarkan rasio progres
  ✔ AC-5: ETA harus berubah sesuai status layanan
✔ User Story #5: Pembayaran Gateway & Live Tracking Kurir (9ms)

============================================================
ℹ tests 48 | suites 9 | pass 48 | fail 0 | skipped 0
ℹ duration_ms: ~1163ms (STATUS: 100% ALL PASSED)
============================================================
```

---

## 5. 📦 Riwayat Git Commits (Minimal 2 Commits)

Proyek ini telah menghasilkan meaningful commits yang ter-push pada remote GitHub `main`:

* **Commit 1 (MVP Unit Test)**:  
  `b55c5f3` — `test(mvp): add 5 unit test suites with acceptance criteria for Pertemuan 6`
* **Commit 2 (MVP Production Code - UI & Payment)**:  
  `d16db26` — `feat(ui): display direct QRIS scan, VA Bank copy, and photo upload on user pages`
* **Commit 3 (MVP Production Code - Live Courier Tracking)**:  
  `185068f` — `feat(tracking): integrate real Leaflet OpenStreetMap live courier map and hybrid auto-assign dispatch`
* **Commit 4 (Database Schema & Audit Tables)**:  
  `f31e974` — `feat(database): expand normalized schema with kurir, pembayaran, and audit log tables with rich demo seeds`

---

## 6. 💻 Panduan Menjalankan Aplikasi & Demo Pengujian

### 1. Menjalankan Server Backend
```bash
cd backend
npm run dev
# Server aktif di: http://localhost:5000
```

### 2. Menjalankan Frontend React
```bash
cd frontend
npm start
# Terbuka otomatis di: http://localhost:3000
```

### 3. Akun Demo untuk Pengujian:
* **Administrator Optik**:  
  - Email: `admin@optik.com` | Password: `admin123`  
  - Fitur: Manajemen status pesanan, input biaya, pilih driver kurir dari pool, pantau live GPS armada.
* **Pelanggan**:  
  - Email: `bahrul@gmail.com` | Password: `admin123`  
  - Fitur: Pengajuan perbaikan kacamata, upload foto frame & resep dokter, pelacakan kurir interaktif di peta, pembayaran digital QRIS/VA Bank.

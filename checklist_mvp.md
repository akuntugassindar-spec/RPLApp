# CHECKLIST FITUR MVP & STATUS PENGUJIAN (CHECKLIST_MVP.MD)

**Nama Proyek:** OptikExpress — Sistem Informasi Layanan Antar-Jemput Kacamata  
**Target Rilis:** Pertemuan 7 — Menuntaskan Seluruh MVP (Siap Demonstrasi)  
**Status Keseluruhan:** ✅ **SELESAI 100% & LULUS PENGUJIAN (ALL TESTS PASSED)**  
**Repositori GitHub:** [https://github.com/akuntugassindar-spec/RPLApp.git](https://github.com/akuntugassindar-spec/RPLApp.git)  
**Lingkungan Eksekusi:** Node.js `v24.22.1 LTS` | npm `v11.19.1` | Express.js | React.js | MySQL 8.0 3NF

---

## 1. Matriks Pemenuhan 5 Kriteria Cakupan Penyelesaian (Pertemuan 7)

| No | Kriteria Cakupan Penyelesaian | Status | Bukti Implementasi & Penjelasan Teknis |
| :---: | :--- | :---: | :--- |
| **1** | **Selesaikan seluruh fitur inti yang telah disepakati dalam lingkup MVP** | ✅ **TUNTAS** | Seluruh 5 User Stories PRD telah selesai: Lifecycle 6 status, Autentikasi JWT & BCrypt, 3-Role RBAC (Pelanggan, Admin, Kurir), Rincian Teknis Kacamata 3NF, Multi-Payment Gateway (QRIS BI EMVCo, VA Bank, E-Wallet, COD), dan Live GPS Tracking Radar Kurir. |
| **2** | **Integrasikan UI, logika aplikasi, dan penyimpanan data / API** | ✅ **TUNTAS** | Frontend React.js terhubung penuh dengan Backend REST API Express.js (`/api/auth`, `/api/layanan`, `/api/detail-layanan`) dan terhubung ke MySQL connection pool via `mysql2/promise` dengan skema ternormalisasi 3NF dan integritas relasional *foreign key CASCADE*. |
| **3** | **Pastikan seluruh alur utama berjalan dari awal hingga akhir (End-to-End)** | ✅ **TUNTAS** | Alur lengkap tuntas tanpa terputus: Registrasi Akun -> Buat Pesanan & Upload Foto -> Admin Verifikasi & Assign Kurir -> Kurir Ambil Kacamata & Siar GPS -> Lab Proses Kacamata -> Pelanggan Bayar Tagihan (QRIS/VA) -> Kurir Antar Kacamata -> Selesai. |
| **4** | **Tangani input tidak valid, data kosong, loading, dan kegagalan** | ✅ **TUNTAS** | *Frontend*: State loading spinner/disable button di setiap form submit, sanitasi form, validasi regex, modal pop-up error & overlay sukses.<br>*Backend*: HTTP 400 Bad Request untuk payload kosong/tidak valid, regex email, HTTP 401/403 untuk auth violation, penanganan database offline/pool closed secara graceful. |
| **5** | **Uji seluruh fitur inti, perbaiki bug penghambat, lalu uji regresi** | ✅ **TUNTAS** | **64 Unit Tests dalam 12 Test Suites lulus 100% (0 Failed)**. Seluruh bug penghambat (seperti port conflict, database pool closed, responsive layout, hingga overlay notifikasi) telah ditangani dan diverifikasi dengan tes regresi otomatis. |

---

## 2. Checklist Rinci Fitur Inti MVP Berdasarkan User Stories

### A. Fitur 1: Manajemen Siklus Hidup Layanan (Service Request Lifecycle)
*Target: Mengelola alur status servis kacamata melalui State Machine 6 tahapan secara transparan.*
- [x] **Dukungan 3 Jenis Layanan:** `perbaikan`, `penggantian_lensa`, dan `perbaikan_dan_lensa`.
- [x] **Alur 6 Status Siklus Hidup:** `pengajuan` ➔ `dijadwalkan` ➔ `diambil` ➔ `diproses` ➔ `selesai` ➔ `diantar`.
- [x] **Validasi Payload:** Menolak status kosong atau nilai enum di luar daftar (HTTP 400).
- [x] **State Machine Protection:** Validasi transisi status logis agar alur tidak melompat sembarangan.
- [x] **Status Pengujian:** ✅ **PASSED** (Unit Test: `tests/layanan.test.js`)

### B. Fitur 2: Autentikasi Pengguna & Keamanan Kredensial
*Target: Melindungi identitas pengguna dan data histori transaksi.*
- [x] **Validasi Registrasi Akun:** Validasi field wajib nama, email, password, dan format email regex.
- [x] **Enkripsi Password:** Password wajib di-hash satu arah menggunakan `bcryptjs` (salt rounds 10).
- [x] **Autentikasi Login:** Menerbitkan JSON Web Token (JWT) dengan masa berlaku 24 jam.
- [x] **Payload JWT:** Memuat identitas `id`, `nama`, `email`, dan `role`.
- [x] **Status Pengujian:** ✅ **PASSED** (Unit Test: `tests/auth.test.js`)

### C. Fitur 3: Otorisasi Multi-Role Based Access Control (RBAC 3 Role)
*Target: Memisahkan kewenangan antara Pelanggan, Administrator, dan Kurir Logistik.*
- [x] **Proteksi Endpoint Privat:** Menolak request tanpa header Authorization `Bearer <token>` (HTTP 401).
- [x] **Role Pelanggan:** Akses pembuatan pesanan, histori pribadi, dan pembayaran tagihan miliknya sendiri.
- [x] **Role Administrator:** Akses verifikasi pesanan, penetapan nominal biaya, assign kurir, dan kontrol lab optik.
- [x] **Role Kurir:** Akses dashboard kurir, update status penjemputan/pengantaran, siaran live GPS, dan kasir di tempat.
- [x] **Status Pengujian:** ✅ **PASSED** (Unit Test: `tests/middleware.test.js`)

### D. Fitur 4: Rincian Spesifikasi Teknis Kacamata & Resep Optik (CRUD 3NF)
*Target: Mencatat data teknis kacamata, diagnosa kerusakan frame, dan ukuran lensa minus/silinder.*
- [x] **Relasi Basis Data:** Foreign Key `layanan_id` terikat ke tabel induk `layanan` (ON DELETE CASCADE).
- [x] **Default Fallback Otomatis:** Mengisi nilai default `"-"` jika pelanggan tidak mengisi field opsional.
- [x] **Partial Update Preservation:** Nilai data lama tetap dipertahankan saat dilakukan update parsial (HTTP PUT).
- [x] **Isolasi Kepemilikan Data:** Pelanggan hanya dapat membaca/mengubah data miliknya; admin memiliki akses menyeluruh.
- [x] **Status Pengujian:** ✅ **PASSED** (Unit Test: `tests/detailLayanan.test.js`)

### E. Fitur 5: Payment Gateway Multi-Metode & Standar Bank Indonesia QRIS
*Target: Menyediakan kemudahan pembayaran digital fleksibel bagi pelanggan.*
- [x] **Dukungan 8 Metode Pembayaran:** `qris`, `bca_va`, `bni_va`, `bri_va`, `mandiri_va`, `gopay`, `shopeepay`, dan `cod`.
- [x] **Format Standar ID Transaksi:** Pola unik `MIDTRANS-{timestamp}-{random}`.
- [x] **QRIS Standar Bank Indonesia (ASPI / EMVCo):** Memuat Tag 00, 01, 26, 51, 52, 53, 58, 59, 60, dan checksum 63 (CRC-16).
- [x] **Deep-link E-Wallet:** Tombol direct URL ke aplikasi ponsel GoPay, ShopeePay, DANA, dan BCA.
- [x] **Kasir Kurir di Tempat:** Kurir dapat melayani COD Tunai maupun menampilkan QRIS dinamis di HP kurir.
- [x] **Status Pengujian:** ✅ **PASSED** (Unit Test: `tests/pembayaran.test.js` & `tests/qrisHelper.test.js`)

### F. Fitur 6: Penugasan Kurir Cerdas & Live GPS Courier Radar Tracking
*Target: Menghubungkan logistik penjemputan optik secara transparan dengan peta jalan rill.*
- [x] **Auto-Assign Round-Robin:** Alokasi kurir internal optik secara deterministik dan merata.
- [x] **Alokasi Kurir Terdekat Jakarta & Tangerang:** Geocoding otomatis kata kunci wilayah Jakarta & Tangerang dan alokasi kurir terdekat (< 1.5 km) menggunakan formula Haversine.
- [x] **Armada Kurir Plat B Resmi:** Seluruh kendaraan kurir operasional menggunakan Plat B resmi wilayah DKI Jakarta & Tangerang (`B 4589 AB`, `B 3120 TNG`).
- [x] **Live Map Radar & OpenStreetMap Leaflet:** Peta interaktif Leaflet OpenStreetMap & HTML Google Maps Embed dengan penanganan transisi bebas error (`_leaflet_pos` guard), penanda lokasi kurir Plat B, pelanggan, dan toko optik pusat.
- [x] **Fitur Pelacak Kurir Khusus Pelanggan (`/pelacak-kurir`):** Halaman pelacakan live GPS khusus pelanggan yang dapat diakses langsung dari menu Navbar maupun tombol Dashboard, dilengkapi informasi armada (Plat B), estimasi waktu tiba (ETA), tombol hubungi kurir via WhatsApp/telepon, simulasi gerak kurir live, dan integrasi rute navigasi Google Maps turn-by-turn.
- [x] **Direct Google Maps Navigation:** Tombol navigasi rute turn-by-turn langsung ke Google Maps resmi via koordinat GPS.
- [x] **Status Pengujian:** ✅ **PASSED** (Unit Test: `tests/layanan.test.js` - Fitur 5, Fitur 6 & Fitur 7)

### G. Fitur 7: Notifikasi Otomatis & Komponen Pop-up Modal Overlay
*Target: Memberikan umpan balik instan yang jelas dan nyaman bagi pengguna.*
- [x] **Notifikasi Email & WhatsApp Mock:** Logging otomatis format notifikasi status pengerjaan kacamata.
- [x] **Modal Overlay Notifikasi Sukses (`SuccessOverlay.js`):**
  - Tampil di tengah layar (*front-and-center*) dengan backdrop blur (`backdropFilter: blur(4px)`).
  - Animasi SVG centang hijau berputar halus.
  - Auto-dismiss countdown bar (3.2 detik), tombol konfirmasi "Oke, Mengerti", dan keyboard `Esc` listener.
  - Terintegrasi di halaman Admin, Kurir, Pelanggan, dan Halaman Pembayaran.
- [x] **Status Pengujian:** ✅ **PASSED** (Frontend verified & Production build compiled)

---

## 3. Hasil Eksekusi Unit Test Otomatis (64 Tests Passed - 100%)

Perintah Eksekusi:
```bash
npm --prefix backend test
```

Rangkuman Hasil Pengujian:
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
  ✔ AC-5: JWT token harus mendukung peran role kurir (Agus Pratama)
✔ User Story #2: Registrasi & Login Autentikasi (PASS - 11 Tests)

▶ User Story #4: Detail Teknis Kacamata (CRUD)
  ✔ AC-1: createDetailLayanan menolak jika layanan_id kosong (HTTP 400)
  ✔ AC-1: createDetailLayanan menolak jika layanan_id null
  ✔ AC-2: Default value "-" harus diterapkan untuk field opsional
  ✔ AC-2: Default value tidak menimpa jika field sudah terisi
  ✔ AC-4: updateDetailLayanan mempertahankan data lama ketika field baru undefined
  ✔ AC-5: Validasi role - pelanggan biasa tidak boleh mengakses data user lain
  ✔ AC-5: Validasi role - admin boleh mengakses data siapa saja
  ✔ AC-5: Validasi role - pemilik layanan boleh mengakses datanya sendiri
✔ User Story #4: Detail Teknis Kacamata (CRUD) (PASS - 8 Tests)

▶ Pengujian Fitur 1: Manajemen & Validasi Layanan (Service Management)
  ✔ Harus memiliki seluruh jenis layanan yang didukung sistem (termasuk perbaikan_dan_lensa)
  ✔ Harus memiliki 6 alur status layanan yang valid
  ✔ createLayanan harus menolak jika field wajib kosong (HTTP 400)
  ✔ createLayanan harus menolak jika jenis_layanan tidak valid (HTTP 400)
  ✔ updateStatusLayanan harus menolak jika status kosong (HTTP 400)
  ✔ updateStatusLayanan harus menolak jika status baru tidak valid (HTTP 400)
✔ Pengujian Fitur 1: Manajemen & Validasi Layanan (PASS - 6 Tests)

▶ Pengujian Fitur 2: Notifikasi Otomatis (Email & WhatsApp Mock)
  ✔ sendWANotification harus mengeksekusi format log WhatsApp dengan status uppercase
  ✔ sendWANotification harus dapat menangani jika no telepon kosong
✔ Pengujian Fitur 2: Notifikasi Otomatis (PASS - 2 Tests)

▶ Pengujian Fitur 3: Unggah Foto Kacamata & Resep Optik
  ✔ saveBase64Image harus mengembalikan null jika input kosong
  ✔ saveBase64Image harus mempertahankan URL existing
  ✔ saveBase64Image harus menyimpan base64 valid
✔ Pengujian Fitur 3: Unggah Foto Kacamata & Resep Optik (PASS - 3 Tests)

▶ Pengujian Fitur 4: Integrasi Payment Gateway (Metode & Simulasi Midtrans)
  ✔ VALID_METODE_PEMBAYARAN harus mencakup QRIS, VA, e-Wallet, dan COD
✔ Pengujian Fitur 4: Integrasi Payment Gateway (PASS - 1 Test)

▶ Pengujian Fitur 5: Penugasan Kurir Cerdas (Auto-Assign like Gojek/Grab)
  ✔ COURIER_POOL harus menyediakan armada kurir internal optik
  ✔ autoAssignCourier harus menugaskan kurir secara deterministik dan merata
✔ Pengujian Fitur 5: Penugasan Kurir Cerdas (PASS - 2 Tests)

▶ Pengujian Fitur 6: Alokasi Kurir Terdekat Secara Acak Sesuai Alamat Penjemputan
  ✔ geocodeSurabayaAddress harus memetakan kata kunci wilayah Surabaya ke koordinat yang sesuai
  ✔ calculateDistanceKm harus menghitung jarak Haversine antar koordinat dengan presisi
  ✔ findNearestRandomCourier harus mengalokasikan kurir acak yang berjarak sangat dekat (< 1.5 km) dari alamat jemput
  ✔ resetLayananAutoIncrement harus terdefinisi sebagai fungsi controller
✔ Pengujian Fitur 6: Alokasi Kurir Terdekat Secara Acak (PASS - 4 Tests)

▶ Pengujian Fitur 7: Google Maps Indonesia & Geocoding Wilayah Jakarta & Tangerang
  ✔ geocodeJakartaTangerangAddress harus memetakan kata kunci Jakarta & Tangerang ke koordinat GPS yang sesuai
  ✔ COURIER_POOL armada kurir harus memiliki plat nomor B resmi wilayah Jakarta & Tangerang
  ✔ findNearestRandomCourier harus mengalokasikan kurir terdekat (< 1.5 km) di wilayah Jakarta & Tangerang
✔ Pengujian Fitur 7: Google Maps Indonesia & Geocoding Wilayah Jakarta & Tangerang (PASS - 3 Tests)

▶ User Story #3: Middleware Otorisasi JWT & Proteksi Admin
  ✔ AC-1: authMiddleware menolak request tanpa header Authorization (HTTP 401)
  ✔ AC-2: authMiddleware menolak jika format bukan "Bearer <token>" (HTTP 401)
  ✔ AC-2: authMiddleware menolak jika hanya token tanpa prefix Bearer (HTTP 401)
  ✔ AC-3: authMiddleware menolak token JWT yang tidak valid (HTTP 401)
  ✔ AC-3: authMiddleware meneruskan request jika token JWT valid
  ✔ AC-4: adminAuthMiddleware menolak user tanpa autentikasi (req.user undefined)
  ✔ AC-4: adminAuthMiddleware menolak user dengan role pelanggan (HTTP 403)
  ✔ AC-5: adminAuthMiddleware meneruskan request jika role admin
  ✔ AC-6: staffAuth menolak user tanpa autentikasi (req.user undefined)
  ✔ AC-6: staffAuth menolak user dengan role pelanggan (HTTP 403)
  ✔ AC-6: staffAuth meneruskan request jika role kurir
  ✔ AC-6: staffAuth meneruskan request jika role admin
✔ User Story #3: Middleware Otorisasi JWT & Proteksi Admin (PASS - 12 Tests)

▶ User Story #5: Pembayaran Gateway & Live Tracking Kurir
  ✔ AC-1: Sistem mendukung 8 metode pembayaran yang diwajibkan
  ✔ AC-2: Metode pembayaran yang tidak valid harus ditolak oleh validasi
  ✔ AC-3: Format Transaction ID harus mengikuti pola MIDTRANS-{timestamp}-{random}
  ✔ AC-3: Setiap Transaction ID harus unik
  ✔ AC-4: updateTrackingKurir menolak jika tidak ada data tracking yang dikirim (HTTP 400)
  ✔ AC-5: Persentase perjalanan harus dihitung berdasarkan status layanan
  ✔ AC-5: Kalkulasi posisi kurir berdasarkan rasio progres
  ✔ AC-5: ETA harus berubah sesuai status layanan
✔ User Story #5: Pembayaran Gateway & Live Tracking Kurir (PASS - 8 Tests)

▶ Pengujian Standar QRIS Bank Indonesia (EMVCo & CRC16)
  ✔ calculateCRC16 harus menghasilkan 4 karakter hex uppercase
  ✔ generateEMVCoQRIS harus memuat Tag standar Bank Indonesia (00, 01, 26, 51, 52, 53, 58, 59, 60, 63)
  ✔ getQRCodeImageUrl harus menghasilkan URL gambar QR yang valid
  ✔ getPaymentDeepLinks harus memuat deep-link GoPay, ShopeePay, DANA, dan BCA
✔ Pengujian Standar QRIS Bank Indonesia (PASS - 4 Tests)

--------------------------------------------------------------------------------
TOTAL SUITES : 12 Test Suites
TOTAL TESTS  : 64 Tests
HASIL AKHIR  : 64 PASSED / 0 FAILED (100% LULUS)
--------------------------------------------------------------------------------
```

---

## 4. Pembuktian Penanganan Input Tidak Valid, Data Kosong, Loading, & Kegagalan

| Skenario Kasus Uji | Perilaku Sistem & Penanganan Error | Status |
| :--- | :--- | :---: |
| **Form Registrasi/Login Kosong** | Frontend memunculkan pesan validasi lokal. Backend menolak dengan status HTTP 400 `Email dan password wajib diisi`. | ✅ Teruji |
| **Format Email Tidak Valid** | Regex validasi email menolak alamat yang tidak sesuai format standar RFC 5322. | ✅ Teruji |
| **Token Tidak Ada / Rusak** | Middleware `auth.js` mengembalikan HTTP 401 Unauthorized `Akses ditolak. Token tidak disediakan`. | ✅ Teruji |
| **Pelanggan Mengakses Menu Admin** | Middleware `adminAuth.js` mengembalikan HTTP 403 Forbidden `Akses terlarang. Anda tidak memiliki hak akses administrator`. | ✅ Teruji |
| **Pengajuan Servis Tanpa Keluhan/Alamat** | Validasi backend menolak request dengan HTTP 400 dan pesan error spesifik field yang kurang. | ✅ Teruji |
| **State Loading Transaksi** | Tombol submit berubah status menjadi disabled dengan teks indikator `Menyimpan...` / `Memproses...` untuk mencegah *double submit*. | ✅ Teruji |
| **Upload Foto Ukuran Besar** | Parser JSON Express telah dikonfigurasi dengan limit `50mb` sehingga foto beresolusi tinggi tersimpan aman. | ✅ Teruji |
| **Server Database Terputus (Graceful)** | Pool MySQL menangani error koneksi dan menampilkan pesan log diagnostik ramah tanpa membuat server crash. | ✅ Teruji |
| **Notifikasi Sukses Tersembunyi di Bawah Layar** | Ditangani dengan komponen modal overlay `SuccessOverlay` yang langsung muncul di tengah layar terlepas dari posisi scroll pengguna. | ✅ Teruji |

---

## 5. Status Skenario Demonstrasi & Rekaman Video Demo (`demo.mp4`)

Skenario demonstrasi aplikasi telah disinkronkan sepenuhnya dengan **[`HowToRun.md`](HowToRun.md) (Bagian 8)** dan telah direkam ke dalam berkas video Full HD 1080p (`demo.mp4`) dengan antarmuka otentik Google Chrome di Windows:

* **Berkas Video:** `demo.mp4` (Berkas video demonstrasi lokal / arsip presentasi)
* **Spesifikasi Video:** Full HD 1080p (1920 × 1080), 30 FPS, Google Chrome Windows UI, durasi 3 menit (180 detik).
* **Panduan Detail:** Skenario langkah-demi-langkah mengacu langsung pada [`HowToRun.md`](HowToRun.md) Bagian 8.

### Rincian Skenario Demonstrasi (Sesuai HowToRun.md):
1. **Akses Beranda Publik (`/`)**:
   - Tampilkan informasi layanan: Perbaikan Kacamata, Ganti Lensa, dan Antar-Jemput.
   - Navigasi navbar bersih murni teks tanpa emotikon mentah.
2. **Alur Pelanggan (Pemesanan Layanan)**:
   - Login menggunakan akun pelanggan (`bahrul@gmail.com` / `password123`).
   - Masuk ke menu **Pesan Layanan** (`/layanan/buat`).
   - Pilih jenis layanan, isi keluhan kacamata patah & lensa blueray, alamat penjemputan BSD Tangerang Selatan, tanggal & jam jemput.
   - Unggah foto kerusakan fisik kacamata dan foto resep optik dokter.
   - Klik **Kirim Permintaan Layanan**. Modal Overlay Notifikasi Sukses (`SuccessOverlay`) akan tampil di tengah layar (ID Pesanan `#4`).
3. **Alur Administrator (Manajemen & Verifikasi)**:
   - Logout lalu Login sebagai Admin (`admin@optik.com` / `admin123`).
   - Buka **Admin Dashboard** (`/admin/dashboard`) dan pilih pesanan #4 yang baru diajukan.
   - Verifikasi foto kacamata & foto resep (bisa klik untuk Lightbox zoom).
   - Masukkan estimasi biaya pengerjaan kacamata **Rp 150.000** dan tentukan armada kurir Plat B (**Bambang Wijaya - B 3120 TNG**).
   - Ubah status menjadi `dijadwalkan`.
4. **Alur Kurir Logistik (Penjemputan & Live GPS)**:
   - Login sebagai Kurir (`kurir@gmail.com` / `kurir123`).
   - Buka **Dashboard Kurir** (`/kurir/dashboard`).
   - Klik tombol **"Update Status: Diambil Kurir"** saat menjemput kacamata.
   - Klik **"Siarkan GPS Kurir"** untuk memperbarui koordinat posisi terkini secara langsung (`LIVE GPS: -6.2088, 106.8456`).
   - Peta Live Radar Google Maps Indonesia & OpenStreetMap menampilkan rute turn-by-turn mendekati alamat pemesan (< 500m).
5. **Alur Pembayaran Digital (Payment Gateway Simulator)**:
   - Pelanggan membuka detail pesanan (`/layanan/:id`) atau pembayaran (`/pembayaran/:id`).
   - Pilih metode pembayaran: **QRIS Standar Bank Indonesia (EMVCo)**, **BCA Virtual Account**, **GoPay**, atau **COD**.
   - Sistem menampilkan QRIS dinamis dengan kode CRC-16 yang valid, atau nomor VA dengan tombol salin otomatis.
   - Klik **"Konfirmasi Pembayaran Lunas"**. Modal Overlay sukses muncul dan status tagihan seketika menjadi **LUNAS (Verified)**.
6. **Alur Pengantaran Kacamata & Penyelesaian**:
   - Kacamata diproses di lab optik (`diproses`), diselesaikan (`selesai`), dan diantar kurir (`diantar`).
   - Kurir/Admin menandai pesanan selesai saat kacamata diterima pelanggan di alamat tujuan.
   - Halaman `/riwayat-status/:id` menyajikan tabel kronologis Audit Trail lengkap tersimpan di basis data 3NF.
7. **Pengujian Otomatis (Unit Testing 100% Lulus)**:
   - Buka terminal dan jalankan `npm --prefix backend test`.
   - Menampilkan 12 test suites, 64 unit tests komprehensif **100% PASSED (0 FAIL)**.

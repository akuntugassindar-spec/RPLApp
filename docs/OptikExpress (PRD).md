# PRODUCT REQUIREMENT DOCUMENT (PRD): OPTIKEXPRESS

**Nama Produk:** OptikExpress — Sistem Informasi Layanan Antar-Jemput Kacamata  
**Versi Dokumen:** 2.0 (Penyempurnaan MVP)  
**Status:** Approved for Implementation  
**Repositori GitHub:** [https://github.com/akuntugassindar-spec/RPLApp.git](https://github.com/akuntugassindar-spec/RPLApp.git)

---

## 1. Ringkasan Eksekutif Produk

### 1.1 Visi Produk
Menjadi platform digital layanan servis kacamata dan penggantian lensa terintegrasi yang menghadirkan kepraktisan, kecepatan, dan transparansi penuh bagi pengguna kacamata tanpa batasan jarak fisik.

### 1.2 Sasaran Produk
* Memfasilitasi pemesanan perbaikan frame kacamata dan penggantian lensa optik dari rumah.
* Menyediakan pelacakan kurir logistik penjemputan dan pengantaran secara real-time pada peta jalan nyata.
* Menyediakan simulasi multi-payment gateway digital terpercaya (QRIS dinamis, Virtual Account, E-Wallet, dan COD).
* Menjaga integritas data teknis kacamata (resep lensa, diagnosa kerusakan frame, dan riwayat status transaksi).

---

## 2. Alur Pengguna dan State Machine Operasional

Siklus layanan kacamata diatur melalui alur terstruktur 6 status operasional (*State Machine*):

1. **`pengajuan`:** Pelanggan mengirimkan formulir pemesanan, data kerusakan, alamat, jadwal penjemputan, dan upload foto kacamata/resep.
2. **`dijadwalkan`:** Administrator optik memverifikasi data dan menugaskan kurir penjemput (secara otomatis via algoritma Round-Robin atau manual).
3. **`diambil`:** Kurir dalam perjalanan menuju lokasi pelanggan untuk mengambil fisik kacamata ke dalam kotak pelindung khusus.
4. **`diproses`:** Kacamata telah sampai di laboratorium optik untuk dikerjakan oleh teknisi (penyetelan frame, solder, atau pemotongan lensa).
5. **`selesai`:** Kacamata selesai dikerjakan, dibersihkan dengan ultrasonik, dan siap diantarkan kembali.
6. **`diantar`:** Kurir mengantarkan kacamata yang telah prima kembali ke alamat pelanggan hingga transaksi dinyatakan tuntas.

---

## 3. Spesifikasi 5 User Stories dan Acceptance Criteria (AC)

### User Story 1: Manajemen Alur Siklus Layanan (Service Request Lifecycle)
*Sebagai pelanggan, saya ingin mengajukan servis kacamata dan memantau pembaruan status pengerjaan secara transparan dari awal hingga selesai.*
* **AC-1:** Sistem mendukung 3 jenis layanan: `perbaikan`, `penggantian_lensa`, dan `perbaikan_dan_lensa`.
* **AC-2:** Sistem memvalidasi 6 alur status operasional (`pengajuan` -> `dijadwalkan` -> `diambil` -> `diproses` -> `selesai` -> `diantar`).
* **AC-3:** Permintaan pembuatan atau pembaruan dengan payload kosong atau enum status di luar daftar wajib ditolak dengan HTTP 400 Bad Request.
* **AC-4:** Setiap pergantian status memicu log notifikasi otomatis via Email SMTP dan mock WhatsApp ke nomor pelanggan.

### User Story 2: Registrasi, Login dan Keamanan Autentikasi Pengguna
*Sebagai pengguna, saya ingin mendaftarkan akun dan login dengan aman agar histori transaksi servis saya terlindungi.*
* **AC-1:** Registrasi menolak jika field nama, email, atau password kosong (HTTP 400).
* **AC-2:** Format email divalidasi ketat menggunakan standar regex email.
* **AC-3:** Password wajib di-hash menggunakan algoritma satu arah BCrypt (salt rounds 10) sebelum disimpan ke basis data.
* **AC-4:** Login dengan kredensial yang valid menerbitkan JSON Web Token (JWT) yang membawa payload identitas (`id`, `nama`, `email`, `role`).

### User Story 3: Middleware Otorisasi JWT dan Proteksi Multi-Role RBAC (3 Role)
*Sebagai sistem, saya ingin memvalidasi hak akses token JWT agar pengguna hanya dapat mengakses fitur sesuai perannya (Pelanggan, Kurir, Administrator).*
* **AC-1:** Menolak request ke endpoint privat jika header Authorization kosong (HTTP 401 Unauthorized).
* **AC-2:** Menolak token tanpa format Bearer atau token kadaluwarsa/salah secret key (HTTP 401).
* **AC-3:** Pengguna dengan role `pelanggan` dilarang mengakses endpoint penetapan biaya atau panel kontrol staf (HTTP 403 Forbidden).
* **AC-4:** Endpoint administrasi sistem (reset urutan antrean, hapus pesanan permanen) hanya dapat dieksekusi oleh akun dengan role `admin`.
* **AC-5:** Pengguna dengan role `kurir` memiliki hak akses operasional lapangan: memproses status jemput/antar (`diambil`, `diproses`, `diantar`, `selesai`), menyiarkan koordinat live GPS, serta melayani kasir pelunasan di tempat (tunai COD & QRIS ASPI).

### User Story 4: Spesifikasi Teknis Kacamata dan Resep Lensa (CRUD)
*Sebagai teknisi optik, saya ingin mencatat spesifikasi frame dan ukuran minus/silinder kacamata agar pengerjaan optik presisi.*
* **AC-1:** Pembuatan rincian teknis wajib memiliki relasi `layanan_id` yang terdaftar di basis data.
* **AC-2:** Mengisi nilai fallback `"-"` secara otomatis untuk field opsional jika tidak diisi pelanggan.
* **AC-3:** Mempertahankan nilai data lama saat dilakukan pembaruan sebagian (partial update HTTP PUT).
* **AC-4:** Menjamin isolasi data: pelanggan hanya dapat membaca detail kacamata miliknya sendiri, sedangkan admin dapat mengakses semua data.

### User Story 5: Pembayaran Digital Multi-Metode dan Pelacakan Kurir Live GPS
*Sebagai pelanggan, saya ingin membayar biaya layanan secara digital dan melihat pergerakan kurir penjemput/pengantar di peta jalan nyata.*
* **AC-1:** Sistem mendukung minimal 8 metode transaksi: `qris`, `bca_va`, `bni_va`, `bri_va`, `mandiri_va`, `gopay`, `shopeepay`, dan `cod`.
* **AC-2:** ID Transaksi dibuat dengan format standar unik `MIDTRANS-{timestamp}-{random}`.
* **AC-3:** Persentase perjalanan kurir dihitung secara dinamis sesuai tahapan status pengerjaan (10% s.d. 100%).
* **AC-4:** Posisi kurir dihitung melalui interpolasi koordinat GPS nyata antara Toko Optik (Jl. Pemuda 48) dan alamat pelanggan.
* **AC-5:** Peta terintegrasi menggunakan OpenStreetMap (Leaflet) dan dilengkapi tombol navigasi rute turn-by-turn langsung ke Google Maps resmi.

---

## 4. Persyaratan Non-Fungsional (Non-Functional Requirements)

* **Keamanan:** Kredensial password disimpan menggunakan BCrypt. Token JWT kedaluwarsa dalam 24 jam. Sanitasi parameter query SQL menggunakan *parameterized queries* (mencegah SQL Injection).
* **Keandalan:** Skema database dirancang ternormalisasi 3NF dengan *foreign key constraint ON DELETE CASCADE*.
* **Performa:** Waktu respons REST API rata-rata di bawah 300 milidetik pada beban transaksi wajar.
* **Kompatibilitas:** Antarmuka web responsif di layar Desktop (1200px+), Tablet (768px - 1024px), dan Mobile (< 768px).

---

## 5. Strategi Pengujian (Verification and Test Strategy)

* Seluruh aturan bisnis pada kelima User Story diuji secara otomatis menggunakan test runner bawaan Node.js (`node:test` dan `node:assert/strict`).
* Target kelulusan: 100% All Passed (48 tests dalam 9 suites pengujian).

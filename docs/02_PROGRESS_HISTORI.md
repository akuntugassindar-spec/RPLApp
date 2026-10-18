# ⏳ Kronologi Progres Pengembangan (Dari Awal s.d. Hari Ini)

Dokumen ini mencatat seluruh rekam jejak evolusi pengembangan perangkat lunak **OptikExpress** dari fase inisiasi hingga rilis terkini:

---

## 📅 Ringkasan Garis Waktu Pengembangan

| Fase / Periode | Fokus Pengembangan | Hasil Utama & Deliverable |
| :--- | :--- | :--- |
| **Fase 1 (Pertemuan 1–3)** | **Inisiasi & Fondasi Arsitektur** | Setup folder monorepo, REST API Express, React SPA, skema awal MySQL, autentikasi JWT & BCrypt, CRUD pengajuan layanan. |
| **Fase 2 (Pertemuan 4–5)** | **MVP Version 1: Iterative AI Engineering** | 2 Fitur Inti MVP (Alur 6 status layanan & Notifikasi Email/WA Mock), metode *Brief $\rightarrow$ Plan $\rightarrow$ Build $\rightarrow$ Verify $\rightarrow$ Commit*, unit testing awal. |
| **Fase 3 (Pertemuan 6)** | **Penyempurnaan MVP & 5 User Stories** | 5 User Stories dengan Acceptance Criteria, 5 file unit test di `backend/tests/`, 46 unit test *All Passed*, minimal 2 meaningful commits. |
| **Fase 4 (Hari Ini)** | **Real-World Enhancements & Peta Interaktif** | Integrasi peta jalan OpenStreetMap Leaflet, tombol navigasi Google Maps, auto-assign kurir Gojek-style, QRIS/VA dinamis, database 3NF (6 tabel). |

---

## 🔍 Rincian Perubahan Tiap Fase

### 1. Fase 1: Inisiasi & Fondasi Arsitektur (Pertemuan 1 s.d. 3)
* **Arsitektur Awal**: Pembuatan monorepo dengan pemisahan direktori `backend/` dan `frontend/`.
* **Sistem Autentikasi**:
  - `POST /api/auth/register` dengan validasi password dan enkripsi satu arah BCrypt.
  - `POST /api/auth/login` yang menghasilkan JSON Web Token (JWT) stateless.
  - Proteksi rute frontend menggunakan komponen `PrivateRoute.js` yang memeriksa keberadaan token dan role pengguna.
* **Fitur Layanan Dasar**:
  - Pelanggan dapat mengisi form pemesanan antar-jemput kacamata (`BuatLayanan.js`).
  - Data tersimpan ke tabel MySQL `layanan` dan `detail_layanan`.
  - Pelanggan dapat melihat daftar riwayat pesanan miliknya di `Dashboard.js`.

---

### 2. Fase 2: MVP Version 1 & AI Engineering (Pertemuan 4 s.d. 5)
Mengikuti pedoman tugas: memilih **2 Fitur Inti MVP** dan mengerjakannya secara berurutan menggunakan prinsip rekayasa perangkat lunak:

#### Fitur Inti 1: Manajemen Alur Siklus Layanan
* Menambahkan dukungan jenis layanan baru: `perbaikan_dan_lensa`.
* Memperketat alur status operasional menjadi 6 tahapan: `pengajuan` $\rightarrow$ `dijadwalkan` $\rightarrow$ `diambil` $\rightarrow$ `diproses` $\rightarrow$ `selesai` $\rightarrow$ `diantar`.
* Penambahan endpoint `DELETE /api/layanan/:id` agar pelanggan dapat membatalkan pesanan yang masih berstatus `pengajuan`.

#### Fitur Inti 2: Notifikasi Otomatis Multi-Saluran
* Integrasi pustaka `nodemailer` untuk pengiriman email otomatis ke pelanggan setiap status layanan diubah oleh admin.
* Dukungan SMTP Gmail resmi dan preview otomatis akun tes Ethereal Mail.
* Modul WhatsApp Mock Logger untuk simulasi pengiriman pesan instan ke nomor ponsel pelanggan.
* Penerapan alur engineering: **Brief $\rightarrow$ Plan $\rightarrow$ Build $\rightarrow$ Verify $\rightarrow$ Commit**.

---

### 3. Fase 3: Penyempurnaan MVP (Pertemuan 6)
Penyempurnaan arsitektur berbasis standar pengujian perangkat lunak:
* **5 User Stories**: Disusun rapi lengkap dengan Acceptance Criteria (US-1 s.d. US-5).
* **5 File Unit Test**: Dibuat di `backend/tests/` (`layanan.test.js`, `auth.test.js`, `middleware.test.js`, `detailLayanan.test.js`, `pembayaran.test.js`).
* **Verifikasi Otomatis**: Menguji 46 aturan bisnis tanpa ketergantungan jaringan eksternal, seluruhnya lulus 100%.
* **Git Version Control**: Meaningful commits (`b55c5f3`, `d16db26`) ter-push ke GitHub remote `origin/main`.

---

### 4. Fase 4: Fitur Lanjutan & Pembaruan Terkini (Hari Ini)

#### A. Integrasi Peta Jalan Asli (OpenStreetMap / Leaflet + Google Maps)
* Mengganti visualizer SVG statis dengan peta interaktif nyata berbasis **Leaflet** dan tile jalanan **OpenStreetMap**.
* Menempatkan 3 marker interaktif:
  - 🏪 Toko Optik: Jl. Pemuda No. 48, Surabaya.
  - 🛵 Kurir Bergerak: Dilengkapi animasi cincin radar berputar (*pulsing ring*) yang koordinatnya mengikuti pergerakan GPS riil.
  - 🏠 Alamat Pelanggan: Lokasi penjemputan/pengantaran kacamata.
* Garis rute jalan (*polyline*) biru cerah yang menghubungkan toko optik, kurir, dan pelanggan.
* Tombol **`🗺️ Buka Rute di Google Maps ↗`** yang langsung membuka navigasi *turn-by-turn driving* di Google Maps resmi.
* Tombol dual-view switcher (`🗺️ Peta Jalan Asli` vs `📡 Radar Vektor`).

#### B. Sistem Penugasan Kurir Cerdas (Auto-Assign ala Gojek/Grab)
* Menyediakan armada kurir internal toko (*Courier Pool*): Agus Pratama (Vario 160), Bambang Wijaya (NMAX), dan Rian Kurniawan (Beat Street).
* Sistem secara otomatis menugaskan driver secara bergiliran (*Round-Robin*) saat pesanan dijadwalkan, sehingga pelanggan tidak perlu pusing memilih kurir manual.
* Admin tetap memiliki menu dropdown untuk mengubah driver secara manual jika kurir berhalangan.

#### C. Pembayaran Digital & Upload Foto Kacamata/Resep
* Preview foto kerusakan kacamata dan foto resep dokter dengan modal lightbox perbesar.
* Tampilan pembayaran QRIS dinamis siap scan langsung.
* Nomor Virtual Account Bank (BCA, BNI, BRI, Mandiri) dengan tombol satu-klik **Salin Nomor VA**.
* Pilihan pembayaran GoPay, ShopeePay, dan Cash on Delivery (COD).

#### D. Penyempurnaan Skema Database 3NF
* Penambahan 3 tabel relasional baru: `kurir`, `pembayaran`, dan `riwayat_status_layanan`.
* Penambahan 11 kolom baru pada tabel `layanan`.
* Seed data lengkap mencakup 3 user, 3 kurir, dan 3 transaksi pesanan nyata.
* Auto-migration pada `backend/config/db.js` agar tabel baru otomatis terbentuk di MySQL saat server dinyalakan.
* Jumlah unit test meningkat menjadi **48 tests (9 suites)**, seluruhnya **100% Lulus**.

# 🧪 PERTEMUAN 6: PENYEMPURNAAN MVP (5 USER STORIES & 48 UNIT TESTS)

**Mata Kuliah:** Rekayasa Perangkat Lunak (RPL)  
**Aplikasi:** **OptikExpress — Sistem Informasi Layanan Antar-Jemput Kacamata**  
**Repositori GitHub:** [https://github.com/akuntugassindar-spec/RPLApp.git](https://github.com/akuntugassindar-spec/RPLApp.git)

---

## 1. Review Pertemuan 6: MVP-nya Apa?

* **Nama Produk:** **OptikExpress**
* **Definisi Produk:**  
  Aplikasi web layanan servis kacamata dan penggantian lensa optik berbasis penjemputan dan pengantaran kurir (*on-demand courier service*). Pelanggan dapat memperbaiki frame patah, mengganti baut/nosepad, atau memasang lensa minus/silinder/blueray tanpa perlu keluar rumah.
* **5 Fitur Inti MVP:**
  1. **Pengajuan Layanan & Unggah Bukti**: Form pemesanan dengan pratinjau foto fisik kerusakan frame dan lembar resep dokter.
  2. **Pelacakan Live GPS Kurir**: Integrasi peta jalan nyata Leaflet OpenStreetMap dengan koordinat live kurir, animasi radar pergerakan, dan tombol direct intent navigasi Google Maps.
  3. **Penugasan Kurir Cerdas (Auto-Assign Gojek/Grab-Style)**: Algoritma penugasan armada kurir optik secara otomatis (*Round-Robin*) dengan opsi kontrol manual admin.
  4. **Multi-Payment Gateway Simulator**: Transaksi pembayaran digital Midtrans Sandbox mencakup QRIS dinamis siap scan, BCA/BNI/BRI/Mandiri Virtual Account (fitur satu-klik Salin), GoPay, dan COD.
  5. **Role-Based Access Control (RBAC)**: Pemisahan hak akses antara akun pelanggan dan administrator optik menggunakan token JWT dan middleware terproteksi.

---

## 2. Implementasi 5 User Story & Acceptance Criteria (AC)

### User Story 1: Manajemen Alur Siklus Layanan (Service Request Lifecycle)
> *"Sebagai pelanggan, saya ingin mengajukan servis kacamata dan memantau pembaruan status pengerjaan secara transparan dari awal hingga selesai."*
* **AC-1:** Sistem mendukung 3 kategori layanan: `perbaikan`, `penggantian_lensa`, dan `perbaikan_dan_lensa`.
* **AC-2:** Sistem memvalidasi 6 tahapan alur status operasional: `pengajuan` $\rightarrow$ `dijadwalkan` $\rightarrow$ `diambil` $\rightarrow$ `diproses` $\rightarrow$ `selesai` $\rightarrow$ `diantar`.
* **AC-3:** Request wajib menolak payload kosong atau jenis layanan di luar daftar yang diizinkan (HTTP 400 Bad Request).
* **AC-4:** Notifikasi otomatis (Email SMTP dan WhatsApp Mock log) terkirim secara konsisten setiap status pesanan diperbarui.

### User Story 2: Registrasi, Login & Keamanan Autentikasi Pengguna
> *"Sebagai pengguna, saya ingin mendaftarkan akun dan login dengan aman agar histori transaksi servis saya terlindungi."*
* **AC-1:** Registrasi menolak jika field nama, email, atau password kosong (HTTP 400).
* **AC-2:** Format email divalidasi ketat menggunakan standar regex email.
* **AC-3:** Password wajib di-hash menggunakan algoritma satu arah BCrypt (salt rounds 10) sebelum disimpan ke basis data.
* **AC-4:** Login dengan kredensial yang valid menerbitkan JSON Web Token (JWT) yang membawa payload identitas (`id`, `nama`, `email`, `role`).

### User Story 3: Middleware Otorisasi JWT & Proteksi Administrator
> *"Sebagai sistem, saya ingin memvalidasi hak akses token JWT agar pelanggan biasa tidak dapat memanipulasi data pengguna lain atau mengakses panel admin."*
* **AC-1:** Menolak akses ke endpoint privat jika header `Authorization` kosong (HTTP 401 Unauthorized).
* **AC-2:** Menolak token tanpa format `Bearer <token>` atau token kadaluwarsa/salah secret key (HTTP 401).
* **AC-3:** Pengguna dengan role `pelanggan` dilarang mengakses endpoint penetapan biaya, pembaruan status, atau update kurir (HTTP 403 Forbidden).
* **AC-4:** Endpoint administrasi hanya dapat dieksekusi oleh akun dengan role `admin`.

### User Story 4: Spesifikasi Teknis Kacamata & Resep Lensa (CRUD)
> *"Sebagai teknisi optik, saya ingin mencatat spesifikasi frame dan ukuran minus/silinder kacamata agar pengerjaan optik presisi."*
* **AC-1:** Pembuatan rincian teknis wajib memiliki relasi `layanan_id` yang terdaftar di basis data.
* **AC-2:** Mengisi nilai fallback `"-"` secara otomatis untuk field opsional jika tidak diisi pelanggan.
* **AC-3:** Mempertahankan nilai data lama saat dilakukan pembaruan sebagian (*partial update* HTTP PUT).
* **AC-4:** Menjamin isolasi data: pelanggan hanya dapat membaca detail kacamata miliknya sendiri, sedangkan admin dapat mengakses semua data.

### User Story 5: Pembayaran Digital Multi-Metode & Pelacakan Kurir Live GPS
> *"Sebagai pelanggan, saya ingin membayar biaya layanan secara digital dan melihat pergerakan kurir penjemput/pengantar di peta jalan nyata."*
* **AC-1:** Sistem mendukung minimal 8 metode transaksi: `qris`, `bca_va`, `bni_va`, `bri_va`, `mandiri_va`, `gopay`, `shopeepay`, dan `cod`.
* **AC-2:** ID Transaksi dibuat dengan format standar unik `MIDTRANS-{timestamp}-{random}`.
* **AC-3:** Persentase perjalanan kurir dihitung secara dinamis sesuai tahapan status pengerjaan (10% s.d. 100%).
* **AC-4:** Posisi kurir dihitung melalui interpolasi koordinat GPS nyata antara Toko Optik (Jl. Pemuda 48) dan alamat pelanggan.
* **AC-5:** Peta terintegrasi menggunakan OpenStreetMap (Leaflet) dan dilengkapi tombol navigasi rute turn-by-turn langsung ke Google Maps resmi.

---

## 3. Daftar 5 Berkas Unit Test & Pemetaan Fitur

Pengujian diimplementasikan menggunakan test runner bawaan Node.js (`node:test` dan `node:assert/strict`):

| Berkas Unit Test | Modul Target | Jumlah Test Case |
| :--- | :--- | :---: |
| **`backend/tests/layanan.test.js`** | Service Management, Notifikasi, Foto Base64, Courier Auto-assign | **13 Tests** |
| **`backend/tests/auth.test.js`** | Validasi Register, Format Email, BCrypt Hashing, JWT Payload | **10 Tests** |
| **`backend/tests/middleware.test.js`**| Header Auth, Format Bearer, Token Verification, RBAC Admin Guard | **8 Tests** |
| **`backend/tests/detailLayanan.test.js`**| CRUD Spesifikasi Kacamata, Default Values, Isolasi Akses Role | **8 Tests** |
| **`backend/tests/pembayaran.test.js`** | 8 Metode Bayar, Uniqueness Transaction ID, Kalkulasi GPS & ETA | **9 Tests** |
| **TOTAL KESELURUHAN** | **9 Test Suites** | **48 Tests Passed (100%)** |

---

## 4. Bukti Hasil Eksekusi Terminal (All Passed)

Perintah eksekusi:
```bash
node --test backend/tests/layanan.test.js backend/tests/auth.test.js backend/tests/middleware.test.js backend/tests/detailLayanan.test.js backend/tests/pembayaran.test.js
```

Hasil Output Terminal:
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
✔ User Story #2: Registrasi & Login Autentikasi (PASS)

▶ User Story #4: Detail Teknis Kacamata (CRUD)
  ✔ AC-1: createDetailLayanan menolak jika layanan_id kosong (HTTP 400)
  ✔ AC-1: createDetailLayanan menolak jika layanan_id null
  ✔ AC-2: Default value "-" harus diterapkan untuk field opsional
  ✔ AC-2: Default value tidak menimpa jika field sudah terisi
  ✔ AC-4: updateDetailLayanan mempertahankan data lama ketika field baru undefined
  ✔ AC-5: Validasi role - pelanggan biasa tidak boleh mengakses data user lain
  ✔ AC-5: Validasi role - admin boleh mengakses data siapa saja
  ✔ AC-5: Validasi role - pemilik layanan boleh mengakses datanya sendiri
✔ User Story #4: Detail Teknis Kacamata (CRUD) (PASS)

▶ Pengujian Fitur 1: Manajemen & Validasi Layanan
  ✔ Harus memiliki seluruh jenis layanan yang didukung sistem
  ✔ Harus memiliki 6 alur status layanan yang valid
  ✔ createLayanan harus menolak jika field wajib kosong (HTTP 400)
  ✔ createLayanan harus menolak jika jenis_layanan tidak valid (HTTP 400)
  ✔ updateStatusLayanan harus menolak jika status kosong (HTTP 400)
  ✔ updateStatusLayanan harus menolak jika status baru tidak valid (HTTP 400)
✔ Pengujian Fitur 1: Manajemen & Validasi Layanan (PASS)

▶ Pengujian Fitur 2: Notifikasi Otomatis (Email & WhatsApp Mock)
  ✔ sendWANotification harus mengeksekusi format log WhatsApp dengan status uppercase
  ✔ sendWANotification harus dapat menangani jika no telepon kosong
✔ Pengujian Fitur 2: Notifikasi Otomatis (Email & WhatsApp Mock) (PASS)

▶ Pengujian Fitur 3: Unggah Foto Kacamata & Resep Optik
  ✔ saveBase64Image harus mengembalikan null jika input kosong
  ✔ saveBase64Image harus mempertahankan URL existing
  ✔ saveBase64Image harus menyimpan base64 valid
✔ Pengujian Fitur 3: Unggah Foto Kacamata & Resep Optik (PASS)

▶ Pengujian Fitur 4: Integrasi Payment Gateway
  ✔ VALID_METODE_PEMBAYARAN harus mencakup QRIS, VA, e-Wallet, dan COD
✔ Pengujian Fitur 4: Integrasi Payment Gateway (PASS)

▶ Pengujian Fitur 5: Penugasan Kurir Cerdas (Auto-Assign like Gojek/Grab)
  ✔ COURIER_POOL harus menyediakan armada kurir internal optik
  ✔ autoAssignCourier harus menugaskan kurir secara deterministik dan merata
✔ Pengujian Fitur 5: Penugasan Kurir Cerdas (Auto-Assign) (PASS)

▶ User Story #3: Middleware Otorisasi JWT & Proteksi Admin
  ✔ AC-1: authMiddleware menolak request tanpa header Authorization (HTTP 401)
  ✔ AC-2: authMiddleware menolak jika format bukan "Bearer <token>" (HTTP 401)
  ✔ AC-2: authMiddleware menolak jika hanya token tanpa prefix Bearer (HTTP 401)
  ✔ AC-3: authMiddleware menolak token JWT yang tidak valid (HTTP 401)
  ✔ AC-3: authMiddleware meneruskan request jika token JWT valid
  ✔ AC-4: adminAuthMiddleware menolak user tanpa autentikasi
  ✔ AC-4: adminAuthMiddleware menolak user dengan role pelanggan (HTTP 403)
  ✔ AC-5: adminAuthMiddleware meneruskan request jika role admin
✔ User Story #3: Middleware Otorisasi JWT & Proteksi Admin (PASS)

▶ User Story #5: Pembayaran Gateway & Live Tracking Kurir
  ✔ AC-1: Sistem mendukung 8 metode pembayaran yang diwajibkan
  ✔ AC-2: Metode pembayaran yang tidak valid harus ditolak oleh validasi
  ✔ AC-3: Format Transaction ID harus mengikuti pola MIDTRANS-{timestamp}-{random}
  ✔ AC-3: Setiap Transaction ID harus unik
  ✔ AC-4: updateTrackingKurir menolak jika tidak ada data tracking yang dikirim
  ✔ AC-5: Persentase perjalanan harus dihitung berdasarkan status layanan
  ✔ AC-5: Kalkulasi posisi kurir berdasarkan rasio progres
  ✔ AC-5: ETA harus berubah sesuai status layanan
✔ User Story #5: Pembayaran Gateway & Live Tracking Kurir (PASS)

ℹ tests 48
ℹ suites 9
ℹ pass 48
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
```

---

## 5. Bukti Riwayat Commit Bermakna (*Meaningful Git Commits*)

Repositori Git mencatat tahapan commit yang terstruktur dan bermakna:
1. `feat(layanan): implement core order lifecycle with status state machine and auto courier dispatch`
2. `feat(auth): implement secure jwt authentication, password hashing, and role-based access control`
3. `test(unit): add comprehensive test suites for user stories 2, 3, 4, 5 achieving 100% pass rate`
4. `feat(tracking): integrate interactive leaflet openstreetmap with live courier radar and direct google maps routing`
5. `feat(database): expand normalized schema with kurir, pembayaran, and audit log tables with rich demo seeds`

# 🎯 Dokumentasi Tugas Pertemuan 6: Penyempurnaan MVP (5 User Stories & 5 Unit Tests)

## 1. Spesifikasi Tugas Pertemuan 6
* **Tujuan**: Penyempurnaan MVP, implementasi 5 user stories dengan acceptance criteria, pembuatan minimal 5 file unit test berbasis aturan bisnis, eksekusi test hingga 100% All Passed, dan menghasilkan minimal 2 git commits.
* **Status Pencapaian**: **Lengkap & Terpenuhi Penuh (100%)**.

---

## 2. 5 User Stories & Acceptance Criteria (AC)

### US-1: Manajemen Alur Siklus Layanan
* **Pernyataan**: Sebagai pelanggan, saya ingin mengajukan servis kacamata dan memantau status secara berurutan.
* **AC-1**: Mendukung 3 jenis layanan (`perbaikan`, `penggantian_lensa`, `perbaikan_dan_lensa`).
* **AC-2**: Memiliki 6 alur status siklus pengerjaan (`pengajuan` s.d. `diantar`).
* **AC-3**: Validasi request menolak field wajib kosong (HTTP 400).
* **AC-4**: Notifikasi otomatis (Email SMTP & WhatsApp mock) terpicu setiap status berubah.

### US-2: Registrasi, Login & Keamanan Autentikasi Pengguna
* **Pernyataan**: Sebagai pengguna, saya ingin membuat akun dan login dengan aman.
* **AC-1**: Registrasi menolak jika nama, email, atau password kosong (HTTP 400).
* **AC-2**: Validasi format email mematuhi standar regex email.
* **AC-3**: Password di-hash menggunakan BCrypt (salt rounds 10) sebelum disimpan ke basis data.
* **AC-4**: Login menghasilkan JWT token yang membawa payload identitas dan role pengguna.

### US-3: Middleware Otorisasi JWT & Proteksi Admin
* **Pernyataan**: Sebagai sistem, saya ingin memvalidasi hak akses token JWT untuk mengamankan data dan endpoint.
* **AC-1**: Menolak request tanpa header `Authorization: Bearer <token>` (HTTP 401).
* **AC-2**: Menolak token yang rusak, kadaluwarsa, atau salah secret key (HTTP 401).
* **AC-3**: Pengguna role `pelanggan` dilarang mengakses endpoint penetapan biaya/status admin (HTTP 403).
* **AC-4**: Role `admin` memiliki akses penuh mengelola layanan siapapun.

### US-4: Spesifikasi Teknis Kacamata & Lensa (CRUD)
* **Pernyataan**: Sebagai teknisi optik, saya ingin mencatat rincian frame dan ukuran minus/silinder kacamata.
* **AC-1**: Pembuatan detail teknis wajib terhubung dengan `layanan_id` yang valid.
* **AC-2**: Menerapkan nilai default `"-"` secara otomatis untuk field opsional yang kosong.
* **AC-3**: Mempertahankan nilai data lama saat dilakukan pembaruan sebagian (HTTP PUT).
* **AC-4**: Menjamin isolasi data antar pelanggan: user tidak bisa membaca data milik orang lain.

### US-5: Pembayaran Digital Multi-Metode & Pelacakan Kurir GPS
* **Pernyataan**: Sebagai pelanggan, saya ingin membayar biaya servis secara digital dan melacak kurir di peta.
* **AC-1**: Mendukung 8 metode pembayaran (`qris`, `bca_va`, `bni_va`, `bri_va`, `mandiri_va`, `gopay`, `shopeepay`, `cod`).
* **AC-2**: ID Transaksi unik berformat `MIDTRANS-{timestamp}-{random}`.
* **AC-3**: Persentase perjalanan kurir dihitung secara proporsional sesuai status layanan.
* **AC-4**: Posisi kurir dihitung melalui interpolasi koordinat GPS nyata.
* **AC-5**: Peta jalan interaktif OpenStreetMap (Leaflet) + direct route intent ke Google Maps.

---

## 3. 5 File Unit Test di `backend/tests/`

1. **[`backend/tests/layanan.test.js`](../backend/tests/layanan.test.js)** (US-1: Siklus layanan, notifikasi, upload foto, auto-assign kurir).
2. **[`backend/tests/auth.test.js`](../backend/tests/auth.test.js)** (US-2: Form registrasi, regex email, hash BCrypt, payload JWT).
3. **[`backend/tests/middleware.test.js`](../backend/tests/middleware.test.js)** (US-3: Bearer token JWT, penolakan token palsu/expired, proteksi RBAC admin).
4. **[`backend/tests/detailLayanan.test.js`](../backend/tests/detailLayanan.test.js)** (US-4: CRUD teknis kacamata, fallback input, otorisasi data).
5. **[`backend/tests/pembayaran.test.js`](../backend/tests/pembayaran.test.js)** (US-5: Payment gateway multi-metode, ID transaksi, koordinat live GPS, kalkulasi ETA).

---

## 4. Eksekusi Unit Test (100% All Passed)

Perintah menjalankan seluruh pengujian:
```bash
node --test backend/tests/layanan.test.js backend/tests/auth.test.js backend/tests/middleware.test.js backend/tests/detailLayanan.test.js backend/tests/pembayaran.test.js
```

Hasil:
```text
ℹ tests 48
ℹ suites 9
ℹ pass 48
ℹ fail 0
ℹ duration_ms 1163ms (ALL PASSED)
```

---

## 5. Bukti Riwayat Git Commits

Telah memenuhi kriteria minimal 2 commit (commit unit test & commit production code):
* `b55c5f3` — `test(mvp): add 5 unit test suites with acceptance criteria for Pertemuan 6` *(MVP Unit Test)*
* `d16db26` — `feat(ui): display direct QRIS scan, VA Bank copy, and photo upload on user pages` *(MVP Production Code)*
* `185068f` — `feat(tracking): integrate real Leaflet OpenStreetMap live courier map and hybrid auto-assign dispatch`
* `f31e974` — `feat(database): expand normalized schema with kurir, pembayaran, and audit log tables with rich demo seeds`

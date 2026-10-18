# 🚀 Detail Fitur Baru yang Dikerjakan Hari Ini

Dokumen ini merangkum seluruh fitur baru dan penyempurnaan mutakhir yang telah dibangun dan diintegrasikan ke dalam sistem **OptikExpress** pada hari ini:

---

## 1. 🗺️ Peta Jalan Nyata Interaktif (OpenStreetMap via Leaflet)

Sebelumnya pelacakan posisi kurir hanya menggunakan visualisasi kurva SVG sederhana. Hari ini fitur tersebut ditingkatkan menjadi peta jalan nyata:

* **Pustaka & Tile**: Menggunakan pustaka **Leaflet** dan tile jalanan **OpenStreetMap** (bebas lisensi tanpa memerlukan Google Maps API key atau kartu kredit berbayar).
* **Komponen Baru**: Dibuat komponen terdedikasi [`frontend/src/components/LiveMapKurir.js`](../frontend/src/components/LiveMapKurir.js) yang terpasang di halaman Pelanggan ([`DetailLayanan.js`](../frontend/src/pages/user/DetailLayanan.js)) dan Admin ([`AdminDetailLayanan.js`](../frontend/src/pages/admin/AdminDetailLayanan.js)).
* **3 Marker Interaktif**:
  1. 🏪 **Toko Optik** (Jl. Pemuda No. 48, Surabaya) — Marker biru dengan icon toko optik.
  2. 🛵 **Kurir Motor** — Marker tosca dengan icon motor dan animasi cincin radar berputar (*pulsing ring*). Posisi koordinat bergerak dinamis sesuai pergerakan armada kurir atau saat simulasi live dijalankan.
  3. 🏠 **Alamat Pelanggan** — Marker hijau penanda titik jemput/antar kacamata.
* **Garis Rute Jalan (*Polyline*)**: Garis vektor biru putus-putus yang menghubungkan toko optik, posisi terkini kurir, dan lokasi rumah pelanggan.
* **Tombol Navigasi Langsung Google Maps**:
  Tersedia tombol **`🗺️ Buka Rute di Google Maps ↗`**. Saat diklik oleh pelanggan atau admin, browser langsung membuka aplikasi Google Maps resmi dengan rute navigasi *driving turn-by-turn* dari toko optik ke lokasi kurir.
* **Dual-View Switcher**: Tombol tab untuk beralih antara tampilan **`🗺️ Peta Jalan Asli (OSM)`** dan **`📡 Radar Vektor`**.

---

## 2. 🛵 Sistem Penugasan Kurir Cerdas (Auto-Assign ala Gojek/Grab)

Menjawab kebutuhan operasional bisnis optik dan kenyamanan pengguna:

* **Prinsip Desain (Hybrid Dispatch)**:
  - **Sisi Pelanggan**: Otomatis (*Auto-Assign*). Pelanggan tidak perlu pusing memilih kurir manual karena alurnya otomatis seperti Gojek/Grab saat memesan.
  - **Sisi Admin**: Fleksibel (*Admin Override*). Admin dapat membiarkan penugasan otomatis berjalan, ATAU mengganti driver kurir melalui menu dropdown armada jika kurir yang bersangkutan berhalangan.
* **Pool Armada Kurir Internal Optik**:
  Tersedia daftar driver toko kacamata:
  - `Agus Pratama` (081234567890) — Honda Vario 160 (Plat L 4589 AB)
  - `Bambang Wijaya` (081398765432) — Yamaha NMAX (Plat L 3120 XY)
  - `Rian Kurniawan` (085712348765) — Honda Beat Street (Plat L 6742 OP)
* **Logika Backend**:
  Fungsi `autoAssignCourier(seedId)` di [`backend/controllers/layananController.js`](../backend/controllers/layananController.js) membagikan tugas ke armada secara adil (*Round-Robin*) begitu status pesanan diubah ke `dijadwalkan`, `diambil`, atau `diantar`.

---

## 3. 💳 Pembayaran Digital Interaktif (Payment Gateway Simulation)

Penyempurnaan halaman detail pesanan agar pelanggan dapat langsung membayar tanpa kebingungan:

* **QRIS Dinamis**: Kode QRIS pembayaran otomatis ter-generate sesuai invoice dan tampil langsung di layar siap scan menggunakan mobile banking atau e-wallet (GoPay, OVO, Dana, ShopeePay).
* **Virtual Account Bank dengan Tombol Salin**:
  Menyediakan nomor VA Bank (BCA, BNI, BRI, Mandiri) dengan tombol satu-klik **Salin Nomor VA** yang otomatis menyalin angka ke clipboard.
* **Pilihan E-Wallet & COD**: Mendukung pembayaran via e-Wallet dan opsi bayar tunai di tempat (COD) ke kurir saat kacamata diantar.
* **Simulasi Pelunasan Instan**: Tombol simulasi bayar lunas untuk memudahkan pengujian sistem saat demo/evaluasi.

---

## 4. 🗄️ Penyempurnaan Basis Data Relasional 3NF

Pengembangan struktur database pada [`schema.sql`](../backend/database/schema.sql) dan auto-migration pada [`db.js`](../backend/config/db.js):

* **3 Tabel Baru**:
  1. `kurir`: Data master armada driver optik.
  2. `pembayaran`: Log audit transaksi invoice gateway.
  3. `riwayat_status_layanan`: Log histori alur perubahan status dan koordinat GPS.
* **11 Kolom Baru di Tabel `layanan`**:
  `foto_kacamata`, `foto_resep`, `total_biaya`, `status_pembayaran`, `metode_pembayaran`, `id_transaksi_pembayaran`, `catatan_admin`, `kurir_nama`, `kurir_telepon`, `kurir_lat`, `kurir_lng`, `tracking_status`.
* **Seed Demo Data Siap Pakai**:
  - 3 Akun Pengguna: Admin (`admin@optik.com`), Pelanggan 1 (`bahrul@gmail.com`), Pelanggan 2 (`siti.rahma@gmail.com`).
  - 3 Driver Kurir Lengkap dengan plat nomor dan kontak WA.
  - 3 Transaksi Riil dengan status `dijadwalkan`, `diproses`, dan `diantar`.
* **Auto-Migration di `db.js`**:
  Fungsi `ensureTableColumns` di backend otomatis mengecek dan menambahkan tabel/kolom yang belum ada di MySQL lokal saat server dinyalakan.

---

## 5. 🧪 Penambahan Unit Testing

* Menambahkan unit test suite baru untuk pengujian pool armada kurir dan fungsi penugasan otomatis (*Auto-Assign Round-Robin*) pada [`backend/tests/layanan.test.js`](../backend/tests/layanan.test.js).
* Total unit test meningkat menjadi **48 unit tests dalam 9 test suites**, dengan hasil **100% Lulus (0 fail)**.

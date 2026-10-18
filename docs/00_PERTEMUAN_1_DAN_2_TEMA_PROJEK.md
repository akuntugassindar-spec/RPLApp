# 📋 DOKUMENTASI PERTEMUAN 1 & 2: INISIASI & PENENTUAN TEMA PROYEK

**Mata Kuliah:** Rekayasa Perangkat Lunak (RPL)  
**Nama Proyek Terpilih:** **OptikExpress — Sistem Informasi Layanan Antar-Jemput Kacamata**  
**Repositori GitHub:** [https://github.com/akuntugassindar-spec/RPLApp.git](https://github.com/akuntugassindar-spec/RPLApp.git)

---

## 📌 PERTEMUAN 1: Eksplorasi 3 Alternatif Tema Aplikasi

Pada tahap awal inisiasi proyek RPL, tim mengidentifikasi tiga alternatif ide perangkat lunak berbasis kebutuhan nyata masyarakat:

### 1. Alternatif Tema 1: OptikExpress (Layanan Antar-Jemput Kacamata & Penggantian Lensa) — *[TEMA TERPILIH]*
* **Domain:** Layanan Kesehatan Mata / E-Commerce Jasa Servis Optik.
* **Konsep:** Platform web yang memfasilitasi pengguna kacamata untuk memperbaiki frame rusak, mengganti lensa minus/silinder, atau perawatan kacamata dengan sistem penjemputan dan pengantaran kurir langsung ke rumah.
* **Alasan Pemilihan:** 
  * Masalah nyata dan dialami jutaan pengguna kacamata sehari-hari (kesulitan datang ke optik fisik saat sibuk).
  * Alur bisnis sangat jelas dan memiliki nilai rekayasa perangkat lunak yang kaya (*state machine* status order, pelacakan kurir live GPS, unggah bukti resep dokter, dan simulasi payment gateway).
  * Ruang lingkup realistis untuk diselesaikan dalam 12–14 pertemuan perkuliahan.

### 2. Alternatif Tema 2: AsistensiLab (Monitoring Presensi Asisten Laboratorium Berbasis QR Dinamis & Geofencing)
* **Domain:** Sistem Informasi Akademik Kampus.
* **Konsep:** Sistem pencatatan kehadiran dan beban jam kerja asisten laboratorium komputer menggunakan QR code berganti tiap 30 detik serta validasi radius GPS kampus.
* **Alasan Tidak Dipilih:** Lingkup ketergantungan hardware/lokasi fisik laboratorium yang terbatas dan alur bisnis transaksionalnya kurang bervariasi dibandingkan sistem layanan antar-jemput.

### 3. Alternatif Tema 3: KampusMarket (Marketplace Buku & Peralatan Kuliah Bekas Antar-Mahasiswa)
* **Domain:** E-Commerce Peer-to-Peer Kampus.
* **Konsep:** Marketplace khusus civitas akademika untuk jual-beli buku teks, jas lab, kalkulator saintifik, dan papan gambar arsitektur.
* **Alasan Tidak Dipilih:** Kompleksitas moderasi konten, sistem rating seller-buyer, dan potensi redundansi tinggi dengan platform marketplace umum (Shopee/Tokopedia).

---

## 🎯 PERTEMUAN 2: Perumusan Tema Mengerucut & Ruang Lingkup Sistem

Setelah memilih **OptikExpress**, dilakukan pendalaman analisis masalah dan penentuan batasan sistem (*scope definition*) agar dapat diselesaikan secara terukur dalam 12 pertemuan.

### 1. Deskripsi Masalah Nyata
Kacamata merupakan alat bantu penglihatan krusial yang digunakan terus-menerus. Ketika kacamata mengalami kerusakan (baut copot, gagang patah, bantalan hidung hilang) atau lensa sudah tidak nyaman (buram / minus bertambah), pengguna menghadapi masalah:
1. **Keterbatasan Waktu:** Banyak pekerja kantoran, profesional, dan mahasiswa yang tidak sempat meluangkan waktu pergi ke toko optik fisik karena jam kerja optik berbenturan dengan rutinitas harian.
2. **Ketergantungan Penglihatan:** Pengguna kacamata minus tinggi tidak dapat mengemudi atau bepergian dengan aman saat kacamata utamanya rusak.
3. **Ketidakpastian Biaya & Status:** Di bengkel optik konvensional, pelanggan sering tidak tahu berapa estimasi biaya dan kapan kacamata mereka selesai diperbaiki.

### 2. Profil Target Pengguna (User Persona)
* **Pengguna Utama 1 (Pekerja Kantoran & Profesional):** Usia 22–45 tahun, memiliki mobilitas tinggi, terbiasa menggunakan aplikasi digital (Gojek/Grab), membutuhkan layanan cepat tanpa harus meninggalkan kantor.
* **Pengguna Utama 2 (Mahasiswa & Pelajar):** Usia 17–24 tahun, membutuhkan perbaikan kacamata atau penggantian lensa blueray/anti-radiasi dengan biaya transparan dan opsi pembayaran digital (QRIS/E-Wallet).
* **Pengguna Utama 3 (Lansia & Orang Tua di Rumah):** Usia > 50 tahun yang kesulitan bepergian jauh, dibantu oleh keluarga untuk memesan layanan antar-jemput kacamata baca.
* **Pengguna Administrator & Teknisi Optik:** Pengelola toko optik yang memvalidasi pesanan masuk, mencatat diagnosa teknis, mengatur penugasan kurir, dan memperbarui status pengerjaan.

### 3. Manfaat Aplikasi
* **Bagi Pelanggan:** Menghemat waktu dan tenaga, kepastian transparansi harga, pemantauan status kacamata secara real-time, kemudahan pembayaran digital, serta kenyamanan pengantaran tepat waktu.
* **Bagi Toko Optik:** Memperluas jangkauan pasar tanpa terbatas lokasi fisik gerai, digitalisasi pencatatan rekam servis pelanggan, serta efisiensi manajemen kurir dan operasional lab optik.

### 4. Daftar Fitur Inti (Core Features In-Scope)
1. **Autentikasi Pengguna & Keamanan:** Registrasi akun, login dengan enkripsi BCrypt, dan otorisasi sesi berbasis JWT.
2. **Pengajuan Layanan (Form Pemesanan):** Pemilihan jenis layanan (`perbaikan`, `penggantian_lensa`, `perbaikan_dan_lensa`), alamat penjemputan, tanggal/jam jemput, keluhan, dan upload foto frame/resep dokter.
3. **State Machine Alur Operasional:** 6 tahapan status terstruktur (`pengajuan` → `dijadwalkan` → `diambil` → `diproses` → `selesai` → `diantar`).
4. **Pelacakan Live GPS Kurir (Leaflet OpenStreetMap):** Peta jalan nyata dengan marker posisi armada kurir optik, rute jalan, dan tombol navigasi langsung ke Google Maps.
5. **Penugasan Kurir Cerdas (Auto-Assign):** Penugasan armada kurir otomatis berbasis *Round-Robin* dan fasilitas *manual override* untuk admin.
6. **Simulasi Payment Gateway Multi-Metode:** Transaksi QRIS dinamis siap scan, BCA/BNI/BRI/Mandiri Virtual Account, GoPay, dan COD.
7. **Notifikasi Otomatis:** Pengiriman log notifikasi pembaruan status via Email SMTP dan mock WhatsApp.
8. **Dashboard Admin & Pelanggan:** Panel pemantauan riwayat servis, rincian biaya, catatan teknisi, dan manajemen data.

### 5. Fitur yang Tidak Dikerjakan (Out of Scope)
Untuk memastikan proyek dapat tuntas dalam 12 pertemuan, beberapa fitur diputuskan berada di luar cakupan (*not implemented*):
* Pabrikasi fisik lensa dari bahan mentah (*manufacturing line*).
* Pemeriksaan refraksi mata otomatis via kamera AI tanpa resep optometris/dokter.
* Pembayaran menggunakan mata uang kripto (*cryptocurrency*).
* Integrasi multi-vendor optik (sistem saat ini berfokus pada gerai *single-vendor* OptikExpress).
* Pengiriman antar-pulau logistik kargo berat (fokus pada kurir penjemput lokal perkotaan).

### 6. Kriteria Keberhasilan Aplikasi (Success Criteria)
* **Kriteria Fungsional:** 
  * Pelanggan dapat berhasil melakukan registrasi, login, dan membuat pesanan layanan dari formulir web.
  * Status pengerjaan kacamata dapat diperbarui oleh admin dan langsung terlihat pada visualisasi status pelanggan.
  * Peta pelacakan kurir dapat menampilkan rute dan terhubung ke Google Maps dengan sukses.
* **Kriteria Kualitas Rekayasa (Engineering):**
  * Seluruh pengujian otomatis (*unit tests*) mencapai tingkat kelulusan 100% (*All Passed*).
  * Respons endpoint API rata-rata di bawah 300ms pada pengujian lokal.
  * Arsitektur kode bersih, modular, memisahkan concern MVC/Layered Architecture, dan bebas dari kerentanan injeksi dasar.

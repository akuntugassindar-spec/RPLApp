# IDE PROYEK: OPTIKEXPRESS

**Mata Kuliah:** Rekayasa Perangkat Lunak (RPL)  
**Nama Proyek:** OptikExpress — Sistem Informasi Layanan Antar-Jemput Kacamata  
**Repositori GitHub:** [https://github.com/akuntugassindar-spec/RPLApp.git](https://github.com/akuntugassindar-spec/RPLApp.git)

---

## 1. Masalah Nyata yang Dihadapi Pengguna

Kacamata merupakan alat bantu penglihatan primer yang esensial untuk aktivitas sehari-hari. Ketika kacamata mengalami kerusakan fisik (gagang patah, sekrup engsel lepas, bantalan hidung copot) atau lensa minus/silinder sudah tidak nyaman digunakan, masyarakat menghadapi hambatan nyata:

* **Keterbatasan Waktu:** Jam buka toko optik konvensional umumnya berbenturan dengan jam operasional kantor atau perkuliahan, sehingga pekerja dan mahasiswa kesulitan meluangkan waktu datang ke gerai fisik.
* **Ketergantungan Penglihatan:** Pengguna kacamata dengan kelainan refraksi tinggi tidak dapat mengemudi atau bepergian secara aman tanpa kacamata utama mereka.
* **Ketidakpastian Biaya dan Status:** Di bengkel optik fisik tradisional, pelanggan kerap tidak memperoleh transparansi mengenai estimasi biaya dan kepastian jadwal selesainya pengerjaan kacamata.

---

## 2. Eksplorasi Tiga Alternatif Tema

Pada tahap inisiasi (Pertemuan 1), tim mengidentifikasi tiga alternatif topik perangkat lunak:

### Alternatif 1: OptikExpress (Layanan Antar-Jemput Kacamata dan Lensa) - TEMA TERPILIH
* **Domain:** Layanan Kesehatan Mata dan Jasa Logistik Servis Optik.
* **Konsep:** Aplikasi web yang memungkinkan pelanggan mengajukan perbaikan frame kacamata atau penggantian lensa resep dokter secara online dengan penjemputan dan pengantaran kurir langsung ke alamat pelanggan.
* **Alasan Pemilihan:** Masalah nyata yang dialami jutaan pengguna kacamata, alur proses bisnis yang kaya (state machine status pengerjaan, live GPS courier tracking, multi-payment gateway), serta ruang lingkup yang terukur untuk diselesaikan dalam satu semester perkuliahan.

### Alternatif 2: AsistensiLab (Monitoring Presensi Asisten Laboratorium Komputer)
* **Domain:** Sistem Informasi Akademik Kampus.
* **Konsep:** Pencatatan kehadiran dan beban jam kerja asisten lab komputer menggunakan QR Code dinamis dan validasi radius geofencing lokasi laboratorium.
* **Alasan Tidak Dipilih:** Ketergantungan hardware/lokasi fisik lab yang sempit dan minim variasi alur bisnis transaksional.

### Alternatif 3: KampusMarket (Marketplace Buku dan Alat Kuliah Bekas)
* **Domain:** E-Commerce Peer-to-Peer Kampus.
* **Konsep:** Platform jual-beli perlengkapan kuliah bekas antar-mahasiswa dengan sistem serah-terima di area kampus.
* **Alasan Tidak Dipilih:** Memerlukan sistem moderasi konten yang kompleks dan rentan terduplikasi oleh marketplace umum.

---

## 3. Profil Target Pengguna (User Persona)

* **Pekerja Kantoran dan Profesional (Usia 22-45 Tahun):** Memiliki mobilitas tinggi, terbiasa dengan layanan on-demand, dan membutuhkan perbaikan kacamata tanpa harus meninggalkan jam kerja kantor.
* **Mahasiswa dan Pelajar (Usia 17-24 Tahun):** Pengguna aktif gawai yang memerlukan penggantian lensa anti-radiasi blueray atau perbaikan frame dengan biaya transparan dan opsi pembayaran digital.
* **Lansia dan Orang Tua di Rumah (Usia > 50 Tahun):** Pengguna kacamata baca/bifokal yang kesulitan bepergian jauh, dibantu oleh keluarga untuk memesan layanan antar-jemput.
* **Administrator dan Teknisi Lab Optik:** Pengelola gerai yang memverifikasi pesanan masuk, mencatat diagnosa teknis frame, menugaskan armada kurir, dan memperbarui status pengerjaan.

---

## 4. Manfaat Utama Aplikasi

* **Bagi Pelanggan:** Menghemat waktu dan biaya transportasi, memperoleh transparansi biaya, dapat memantau pergerakan kurir secara real-time via peta jalan GPS, dan kemudahan pembayaran multi-metode.
* **Bagi Toko Optik:** Memperluas jangkauan layanan pelanggan tanpa terbatas lokasi fisik, mendigitalkan rekam medis resep kacamata, serta mengoptimalkan pembagian rute kurir penjemput.

---

## 5. Ruang Lingkup Fitur Inti (In-Scope)

1. Autentikasi Pengguna dan Keamanan (Register, Login dengan BCrypt dan JWT).
2. Formulir Pengajuan Layanan (Pilihan jenis perbaikan/lensa, alamat penjemputan, jadwal jemput, dan unggah foto).
3. State Machine 6 Tahapan Status Operasional (`pengajuan` -> `dijadwalkan` -> `diambil` -> `diproses` -> `selesai` -> `diantar`).
4. Live GPS Courier Tracking (Peta interaktif Leaflet OpenStreetMap dengan koordinat live kurir dan tombol direct Google Maps).
5. Penugasan Kurir Cerdas (Algoritma Round-Robin auto-assign kurir internal optik plus override manual admin).
6. Multi-Payment Gateway Simulator (QRIS dinamis siap scan, BCA/BNI/BRI/Mandiri Virtual Account, GoPay, dan COD).
7. Notifikasi Otomatis Status (Email SMTP dan WhatsApp logger).
8. Dashboard Pelanggan dan Panel Manajemen Administrator.

---

## 6. Fitur di Luar Cakupan (Out of Scope)

* Proses manufaktur atau pencetakan fisik bahan mentah lensa dari pabrik.
* Tes refraksi mata otomatis via webcam (pengguna mengunggah resep resmi dari optometris/dokter mata).
* Pembayaran menggunakan cryptocurrency.
* Sistem marketplace multi-toko (berfokus pada toko tunggal OptikExpress).
* Pengiriman logistik kargo antar-pulau.

---

## 7. Kriteria Keberhasilan Proyek

* **Kriteria Fungsional:** Seluruh siklus layanan mulai dari pengajuan pelanggan hingga pengantaran kacamata selesai dapat disimulasikan melalui antarmuka web tanpa hambatan.
* **Kriteria Kualitas Rekayasa:** Seluruh pengujian unit test backend mencapai tingkat kelulusan 100% (All Passed).
* **Kriteria Kecepatan Respons:** Endpoint REST API merespons di bawah 300 milidetik pada pengujian lokal.

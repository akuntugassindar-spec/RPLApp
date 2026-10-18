# 🎯 PERTEMUAN 2: PERUMUSAN TEMA MENGERUCUT & RUANG LINGKUP SISTEM

**Mata Kuliah:** Rekayasa Perangkat Lunak (RPL)  
**Tema Terpilih:** **OptikExpress — Sistem Informasi Layanan Antar-Jemput Kacamata**  
**Repositori GitHub:** [https://github.com/akuntugassindar-spec/RPLApp.git](https://github.com/akuntugassindar-spec/RPLApp.git)

---

## 1. Deskripsi Masalah Nyata

Kacamata merupakan alat bantu penglihatan krusial bagi jutaan masyarakat. Ketika kacamata mengalami kerusakan fisik (gagang patah, baut engsel copot, bantalan hidung hilang) atau lensa minus/silinder sudah tidak nyaman, pengguna menghadapi beberapa hambatan nyata:
1. **Keterbatasan Waktu & Mobilitas:** Jam operasional toko optik fisik umumnya berbenturan dengan jam kerja kantor atau jadwal kuliah. Banyak pekerja dan mahasiswa yang tidak sempat datang langsung ke toko fisik.
2. **Ketergantungan Penglihatan:** Pengguna kacamata minus tinggi merasa cemas saat kacamata utama rusak karena kesulitan mengemudi atau bepergian tanpa bantuan visual.
3. **Ketidakpastian Biaya & Durasi:** Pada bengkel optik konvensional, pelanggan sering tidak mendapatkan transparansi mengenai estimasi biaya perbaikan dan kapan kacamata mereka akan selesai dikerjakan.

---

## 2. Profil Target Pengguna (User Persona)

* **Persona 1: Pekerja Kantoran & Profesional (Usia 22–45 Tahun)**
  * *Karakteristik:* Jadwal kerja padat dari pagi hingga sore, mobilitas tinggi, terbiasa menggunakan aplikasi on-demand (Gojek/Grab), mengutamakan kepraktisan dan kecepatan.
* **Persona 2: Mahasiswa & Pelajar (Usia 17–24 Tahun)**
  * *Karakteristik:* Pengguna aktif gawai (laptop/smartphone), membutuhkan penggantian lensa anti-radiasi (blueray) atau perbaikan frame dengan harga terjangkau dan opsi pembayaran digital (QRIS/E-Wallet).
* **Persona 3: Lansia & Orang Tua di Rumah (Usia > 50 Tahun)**
  * *Karakteristik:* Kesulitan bepergian jauh ke optik mall/pusat kota, membutuhkan perbaikan kacamata baca/bifokal yang dibantu pemesanannya oleh anggota keluarga.
* **Persona 4: Administrator Toko Optik & Teknisi Lab**
  * *Karakteristik:* Pengelola optik yang menerima pesanan masuk, mencatat diagnosa teknis, mengatur penugasan kurir, memperbarui status pengerjaan, dan menetapkan rincian biaya.

---

## 3. Manfaat Aplikasi

* **Bagi Pelanggan:**
  * Menghemat waktu dan ongkos transportasi karena penjemputan dan pengantaran dilakukan langsung di alamat rumah/kantor.
  * Transparansi penuh terhadap tahapan pengerjaan kacamata melalui pelacakan status dan peta rute kurir real-time.
  * Kemudahan bertransaksi secara digital (QRIS dinamis, Virtual Account, E-Wallet) maupun tunai (COD).
* **Bagi Toko Optik:**
  * Memperluas jangkauan layanan melampaui batas geografis toko fisik.
  * Digitalisasi pencatatan riwayat servis pelanggan, spesifikasi lensa, dan arsip resep dokter.
  * Optimalisasi alur kerja teknisi dan penugasan kurir secara terstruktur.

---

## 4. Daftar Fitur Inti (In-Scope)

1. **Autentikasi & Keamanan Pengguna:** Registrasi akun baru, login dengan enkripsi password BCrypt, dan otentikasi stateless menggunakan JSON Web Token (JWT).
2. **Pengajuan Layanan (Order Form):** Formulir pemesanan dengan pemilihan jenis layanan (`perbaikan`, `penggantian_lensa`, `perbaikan_dan_lensa`), alamat penjemputan, jadwal jemput, keluhan, serta upload foto frame dan resep dokter.
3. **Alur Status Operasional (State Machine):** Siklus pengerjaan 6 status: `pengajuan` → `dijadwalkan` → `diambil` → `diproses` → `selesai` → `diantar`.
4. **Live Courier Tracking (Peta GPS):** Peta jalan nyata Leaflet OpenStreetMap dengan koordinat live kurir, estimasi waktu tiba (ETA), rute jalan, dan tombol direct intent rute di Google Maps.
5. **Penugasan Kurir Cerdas (Auto-Assign):** Algoritma penugasan kurir otomatis (*Round-Robin*) dari armada internal optik plus fasilitas override manual untuk admin.
6. **Multi-Payment Gateway Simulator:** Simulasi pembayaran digital Midtrans Sandbox mencakup QRIS dinamis siap scan, BCA/BNI/BRI/Mandiri Virtual Account dengan tombol satu-klik Salin, GoPay, dan COD.
7. **Notifikasi Otomatis:** Trigger pengiriman notifikasi pembaruan status pengerjaan via Email SMTP dan mock logger WhatsApp.
8. **Dashboard Admin & Pelanggan:** Panel visual untuk memantau ringkasan pesanan, riwayat servis, dan catatan teknisi.

---

## 5. Fitur yang Tidak Dikerjakan (Out of Scope)

Untuk memastikan proyek diselesaikan tepat waktu dalam 12 pertemuan perkuliahan, batasan berikut ditetapkan:
* Tidak mencakup proses manufaktur/pabrikasi bahan mentah lensa optik.
* Tidak mencakup tes refraksi mata otomatis via webcam (pelanggan menggunakan resep dokter yang sudah ada).
* Tidak menyediakan pembayaran berbasis mata uang kripto (*cryptocurrency*).
* Tidak menyediakan marketplace multi-toko (sistem berfokus pada toko tunggal OptikExpress).
* Tidak mencakup pengiriman kargo antar-pulau (fokus pada kurir logistik lokal perkotaan).

---

## 6. Kriteria Keberhasilan Aplikasi (Success Criteria)

* **Kriteria Fungsional:** Seluruh siklus layanan (pengajuan $\rightarrow$ konfirmasi $\rightarrow$ jemput $\rightarrow$ pengerjaan $\rightarrow$ antar $\rightarrow$ pembayaran lunas) dapat disimulasikan dari antarmuka web tanpa error.
* **Kriteria Kehandalan (Quality):** Seluruh unit test otomatis mencapai **100% lulus (All Passed)** tanpa ada test yang gagal atau di-skip.
* **Kriteria Performa:** Waktu respons endpoint REST API backend rata-rata di bawah 300 ms pada pengujian lokal.

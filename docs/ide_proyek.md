## TUGAS MATKUL RPL - Semester 3 - Sindar Felix Sihole || 2510101031

## TEMA 1: OptikExpress: Sistem Informasi Layanan Antar-Jemput Perbaikan Kacamata dan Penggantian Lensa Terintegrasi

### 1. Masalah Nyata yang Akan Diselesaikan

Kacamata merupakan instrumen refraksi primer yang esensial bagi produktivitas dan keselamatan penggunanya. Namun, layanan purnajual dan perbaikan kacamata optik konvensional saat ini masih menghadapi berbagai kendala nyata di masyarakat:

* **Hambatan Aksesibilitas dan Waktu:** Jam operasional gerai optik fisik umumnya beririsan langsung dengan jam kerja kantor dan perkuliahan. Masyarakat yang memiliki kesibukan padat kerap menunda perbaikan kacamata hingga berminggu-minggu karena tidak sempat mengunjungi toko fisik.
* **Ketergantungan Penglihatan dan Bahaya Transportasi:** Pasien penderita kelainan refraksi tinggi (misalnya miopia di atas -4.00D atau silinder berat) sangat bergantung pada kacamata mereka. Saat frame kacamata patah atau lensa terlepas, mereka tidak dapat mengemudikan kendaraan secara mandiri dan aman untuk sekadar membawa kacamata tersebut ke optik.
* **Ketiadaan Transparansi Biaya dan Kepastian Waktu Pengerjaan:** Pada sistem manual tradisional, pelanggan kerap tidak memperoleh kepastian estimasi biaya servis di muka sebelum barang diserahkan, serta kesulitan melacak apakah pengerjaan kacamata sudah selesai atau masih dalam antrean bengkel optik.
* **Pencatatan Resep Medis yang Terfragmentasi:** Resep ukuran lensa optik dari dokter mata kerap hilang atau rusak dalam bentuk kertas fisik, sehingga riwayat perubahan visus mata pasien tidak terdokumentasi secara terpusat.

### 2. Profil Target Pengguna

* **Pekerja Profesional dan Karyawan Kantor (Usia 22-45 Tahun):** Memiliki mobilitas dan rutinitas kerja tinggi, membutuhkan layanan jemput-antar kacamata di lokasi kantor atau rumah tanpa mengorbankan jam kerja.
* **Mahasiswa dan Pelajar (Usia 17-24 Tahun):** Pengguna gawai aktif yang memerlukan penggantian lensa antiradiasi/blueray atau perbaikan baut engsel frame kacamata secara cepat dengan biaya terjangkau dan pembayaran dompet digital (e-wallet/QRIS).
* **Lansia dan Pasien Kacamata Progresif (Usia > 50 Tahun):** Pasien yang memiliki keterbatasan fisik untuk bepergian jauh, dibantu oleh keluarga memesan layanan servis lensa bifokal/progresif dari rumah.
* **Teknisi Laboratorium dan Koder Optik:** Petugas optik yang melakukan diagnosa kerusakan frame, memotong lensa (*edging*), merakit kacamata, dan memperbarui catatan teknis servis kacamata.
* **Armada Kurir Penjemput dan Pengantar:** Petugas lapangan internal optik yang menerima penugasan penjemputan fisik kacamata dari alamat pelanggan dan mengantarkan kembali kacamata yang telah tuntas diperbaiki.
* **Administrator Optik:** Mengelola antrean pesanan masuk, memverifikasi foto bukti kerusakan dan resep dokter, menetapkan nominal tagihan servis, mengalokasikan armada kurir, serta memantau status operasional secara terpusat.

### 3. Manfaat Aplikasi

* Memberikan kemudahan total bagi masyarakat dalam merawat alat bantu penglihatan mereka melalui konsep *on-demand pickup and delivery service*.
* Memangkas waktu tunggu dan risiko perjalanan bagi penderita kelainan mata berat melalui sistem penjemputan langsung ke depan pintu rumah atau kantor.
* Menyediakan transparansi penuh atas tahapan servis kacamata melalui visualisasi alur pengerjaan (*state machine*) dan pemantauan armada kurir GPS interaktif.
* Menjamin transparansi transaksi finansial melalui integrasi simulasi multi-metode pembayaran digital (QRIS dinamis, Virtual Account bank, dan COD).
* Mendigitalkan rekam historis resep kacamata dan kerusakan frame pelanggan dalam basis data relasional yang terstruktur.

### 4. Daftar Fitur Inti

1. **Autentikasi dan Otorisasi Pengguna Berbasis Peran (RBAC):** Pendaftaran akun, login terenkripsi BCrypt, penerbitan token JWT, serta pemisahan hak akses antara Pelanggan dan Administrator.
2. **Formulir Pengajuan Layanan Antar-Jemput Digital:** Pemilihan kategori layanan (perbaikan frame, penggantian lensa kustom, atau kombinasi keduanya), keluhan kerusakan, alamat penjemputan lengkap, penentuan jadwal tanggal dan jam penjemputan, serta fitur unggah foto kerusakan frame dan resep dokter.
3. **Pencatatan Spesifikasi Teknis Kacamata (Detail Layanan):** Input jenis kacamata (minus, plus, silinder, progresif, antiradiasi), rincian kerusakan engsel/pad/frame, dan catatan instruksi teknisi optik.
4. **Sistem State Machine Status Pengerjaan (6 Tahapan Operasional):** Alur siklus hidup pesanan yang deterministik:
   $$\text{pengajuan} \longrightarrow \text{dijadwalkan} \longrightarrow \text{diambil} \longrightarrow \text{diproses} \longrightarrow \text{diantar} \longrightarrow \text{selesai}$$
5. **Pemantauan Posisi Kurir GPS Real-time:** Visualisasi posisi kurir penjemput dan pengantar menggunakan peta interaktif Leaflet OpenStreetMap, indikator ETA (Estimated Time of Arrival), dan direct navigasi Google Maps rute jalan.
6. **Integrasi Gateway Pembayaran Multi-Channel:** Simulasi transaksi Midtrans yang mendukung QRIS dinamis, Virtual Account (BCA, BNI, BRI, Mandiri), dompet digital (GoPay, ShopeePay), dan pembayaran tunai langsung di tempat (COD).
7. **Audit Trail dan Notifikasi Status:** Pencatatan otomatis waktu setiap perubahan status, log kurir/teknisi, serta simulasi notifikasi otomatis via Email SMTP dan pesan WhatsApp.

### 5. Batasan / Out of Scope (Fitur yang Tidak Dikerjakan)

* Tidak mencakup pemeriksaan refraksi visus mata secara mandiri melalui aplikasi (pemeriksaan mata wajib melampirkan resep fisik dokter spesialis mata atau hasil uji refraktometer).
* Tidak menyediakan penjualan frame kacamata baru atau etalase e-commerce retail umum.
* Integrasi payment gateway dan notifikasi WhatsApp beroperasi pada tingkat simulasi terverifikasi (sandbox mode) tanpa memotong saldo perbankan riil pengguna.
* Area cakupan penjemputan kurir dibatasi pada wilayah operasional logistik optik perkotaan.

### 6. Kriteria Keberhasilan Aplikasi

* Waktu pengajuan layanan oleh pelanggan dari awal pengisian formulir hingga tiket pesanan terbit dapat diselesaikan dalam waktu kurang dari 2 menit.
* Alur status pengerjaan kacamata berjalan secara konsisten mengikuti 6 siklus operasional tanpa terjadi lompatan status ilegal.
* Seluruh endpoint API terproteksi dari ancaman manipulasi identitas (*Anti-IDOR*) dan data pengguna lain tidak dapat diakses tanpa hak otorisasi yang sah.
* Seluruh suite pengujian otomatis unit testing backend mencapai tingkat kelulusan 100% (48 passing tests, 0 failing tests).

---

## TEMA 2: AsistensiLab: Sistem Monitoring Presensi dan Beban Kerja Asisten Laboratorium Komputer Terintegrasi

### 1. Masalah Nyata yang Dihadapi

Pada institusi perguruan tinggi, pengelolaan asisten laboratorium komputer untuk puluhan kelas praktikum masih dilakukan melalui lembar presensi fisik atau spreadsheet terpisah. Asisten lab kerap kesulitan mencatat jam masuk dan keluar secara akurat, sementara koordinator lab kesulitan memverifikasi apakah asisten benar-benar hadir mendampingi praktikan di ruangan laboratorium.

### 2. Profil Target Pengguna

* Asisten Laboratorium Praktikum (Mahasiswa tingkat atas).
* Dosen Pengampu Mata Kuliah Praktikum.
* Koordinator Laboratorium dan Kepala Bagian Akademik.

### 3. Alasan Tidak Dipilih Sebagai Proyek Akhir

* Ruang lingkup bisnis relatif sempit dan sangat bergantung pada infrastruktur geofencing lokasi fisik ruangan kampus.
* Kompleksitas transaksi data finansial dan logistik sangat minim dibandingkan alur operasional perbaikan barang dan tracking lapangan.

---

## TEMA 3: KampusMarket: Platform Marketplace Perlengkapan dan Buku Kuliah Bekas Antar-Mahasiswa

### 1. Masalah Nyata yang Dihadapi

Mahasiswa baru membutuhkan buku teks perkuliahan, kalkulator ilmiah, jas lab, dan perlengkapan studi yang mahal jika dibeli baru. Di sisi lain, mahasiswa tingkat akhir memiliki buku dan perlengkapan yang sudah tidak terpakai namun kesulitan menemukan pembeli yang relevan di lingkungan kampus yang sama.

### 2. Profil Target Pengguna

* Mahasiswa Baru dan Mahasiswa Aktif Pencari Buku Murah.
* Mahasiswa Tingkat Akhir / Alumni Penjual Barang Bekas.
* Pengurus Himpunan Mahasiswa Jurusan (Fasilitator Komunitas).

### 3. Alasan Tidak Dipilih Sebagai Proyek Akhir

* Memerlukan sistem moderasi konten dan pencegahan penipuan barang bekas yang membutuhkan waktu verifikasi manual berkepanjangan.
* Fungsionalitas inti serupa dengan aplikasi marketplace umum yang sudah ada di pasaran (*e-commerce listing standard*), sehingga kurang menonjolkan keunikan alur rekayasa perangkat lunak spesifik (*state machine*, verifikasi teknis medis, dan logistik antar-jemput).

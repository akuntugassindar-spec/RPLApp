# 📋 PERTEMUAN 1: EKSPLORASI & PEMILIHAN TEMA APLIKASI

**Mata Kuliah:** Rekayasa Perangkat Lunak (RPL)  
**Proyek:** Sistem Informasi Layanan Antar-Jemput Kacamata  
**Output Wajib:** Minimal 3 alternatif tema aplikasi.

---

## 1. Latar Belakang Eksplorasi Tema

Pada tahap inisiasi proyek Rekayasa Perangkat Lunak (RPL), tim melakukan *brainstorming* untuk merumuskan ide perangkat lunak yang berangkat dari masalah nyata di kehidupan sehari-hari, memiliki dampak langsung bagi pengguna, dan ruang lingkup rekayasa perangkat lunak yang terukur untuk diselesaikan dalam 12–14 pertemuan perkuliahan.

---

## 2. Tiga Alternatif Tema Aplikasi

### Alternatif 1: OptikExpress — Layanan Antar-Jemput Kacamata & Lensa (TEMA TERPILIH)
* **Domain Masalah:** Layanan Kesehatan Mata & E-Commerce Jasa Servis Optik.
* **Deskripsi Singkat:**  
  Platform web terintegrasi yang memfasilitasi pengguna kacamata untuk mengajukan servis perbaikan frame rusak (patah, sekrup lepas, nosepad copot) atau penggantian lensa (minus, silinder, anti-radiasi) secara praktis dengan sistem penjemputan dan pengantaran kurir langsung ke alamat pengguna.
* **Alasan Pemilihan (Mengapa Dipilih):**
  1. **Kebutuhan Nyata & Mendesak:** Kacamata adalah kebutuhan esensial sehari-hari. Jutaan orang terhambat beraktivitas saat kacamata mereka rusak dan tidak punya waktu mendatangi toko optik fisik.
  2. **Alur Rekayasa Lengkap:** Memiliki alur bisnis yang kaya (*state machine* status operasional, pelacakan armada kurir live GPS, unggah bukti fisik frame/resep dokter, simulasi multi-payment gateway, dan manajemen admin).
  3. **Kelayakan Waktu:** Ruang lingkup realistis dan modular untuk diselesaikan dalam 12 pertemuan.

---

### Alternatif 2: AsistensiLab — Monitoring Presensi Asisten Laboratorium Komputer
* **Domain Masalah:** Sistem Informasi Akademik Kampus.
* **Deskripsi Singkat:**  
  Aplikasi pencatatan kehadiran, jadwal shift jaga, dan log beban kerja asisten laboratorium komputer menggunakan teknologi QR Code dinamis yang berganti tiap 30 detik serta validasi geofencing GPS radius ruangan lab.
* **Alasan Tidak Dipilih:**
  * Ruang lingkup penggunaan terlalu sempit dan sangat bergantung pada lokasi fisik laboratorium kampus.
  * Alur transaksional dan variasi entitas bisnisnya kurang beragam jika dibandingkan dengan siklus logistik antar-jemput.

---

### Alternatif 3: KampusMarket — Marketplace Peer-to-Peer Perlengkapan Kuliah Bekas
* **Domain Masalah:** E-Commerce Komunitas Kampus.
* **Deskripsi Singkat:**  
  Platform jual-beli khusus mahasiswa untuk memfasilitasi transaksi barang bekas perkuliahan (buku teks, kalkulator saintifik, papan gambar arsitektur, dan jas lab) dengan sistem serah-terima COD di area kampus.
* **Alasan Tidak Dipilih:**
  * Memerlukan sistem moderasi konten dan verifikasi penjual-pembeli yang rumit untuk menghindari penipuan.
  * Tingkat redundansi yang tinggi dengan platform marketplace umum (Shopee/Tokopedia/OLX).

---

## 3. Kesimpulan & Keputusan Akhir

Berdasarkan diskusi kelompok dan penilaian kriteria rekayasa perangkat lunak, tim secara bulat memilih **Alternatif 1: OptikExpress (Sistem Informasi Layanan Antar-Jemput Kacamata)** sebagai fokus utama proyek yang akan dikembangkan secara iteratif pada pertemuan-pertemuan berikutnya.

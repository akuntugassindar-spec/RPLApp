# DESAIN ANTARMUKA DAN SISTEM PENGALAMAN PENGGUNA (DESIGN_UI.MD)

**Proyek:** OptikExpress — Sistem Informasi Layanan Antar-Jemput Kacamata  
**Target:** Standardisasi visual, palet warna, tipografi, dan anatomi komponen UI/UX.

---

## 1. Filosofi Desain UI/UX

Desain antarmuka OptikExpress mengusung konsep **Modern, Clean, Minimalis, dan Profesional**. Sistem ini dirancang untuk memberikan kemudahan bagi pengguna dari berbagai kalangan usia (mahasiswa, pekerja, hingga lansia) dalam memesan layanan servis kacamata tanpa kebingungan alur.

### Prinsip Utama:
1. **Kejelasan Visual (Clarity):** Informasi biaya, status kacamata, dan jadwal kurir disajikan secara transparan tanpa teks berlebihan.
2. **Hierarki Konten (Visual Hierarchy):** Aksi utama (Call-to-Action) seperti tombol "Pesan Layanan" dan "Lacak Kurir" diberi penekanan kontras yang jelas.
3. **Responsif Multi-Perangkat:** Tata letak menyesuaikan secara mulus pada layar smartphone, tablet, dan desktop tanpa ada elemen yang terpotong.
4. **Konsistensi Visual:** Menggunakan sistem kartu dengan sudut membulat lembut (*rounded corners*) dan bayangan halus (*soft elevation shadows*).

---

## 2. Palet Warna Resmi (Design Tokens)

* **Navy Blue Utama (`#0f172a` / `#1e293b`):** Digunakan untuk teks judul utama, panel informasi pemesanan, dan background footer resmi. Memberikan kesan kokoh dan terpercaya.
* **Ocean Blue Primer (`#0284c7` / `#0369a1`):** Warna identitas utama sistem. Digunakan untuk tombol primer, tautan navigasi aktif, marker kurir, dan aksen brand.
* **Light Blue Lembut (`#e0f2fe` / `#f0f9ff`):** Digunakan untuk latar belakang elemen aktif, kartu pelacakan GPS, dan badge kemudahan layanan.
* **Teal dan Mint Aksen (`#0d9488` / `#10b981`):** Digunakan secara proporsional untuk indikator status sukses, lensa anti-radiasi, dan badge kelulusan transaksi.
* **Latar Belakang Netral (`#f8fafc` / `#ffffff`):** Latar belakang halaman bersih yang mengurangi kelelahan mata pengguna saat membaca rincian pesanan.
* **Status Alert:**
  * Merah Bahaya (`#ef4444` / `#fef2f2`): Notifikasi error validasi dan pesanan dibatalkan.
  * Kuning Menunggu (`#f59e0b` / `#fffbeb`): Status belum bayar dan konfirmasi jadwal.
  * Hijau Sukses (`#10b981` / `#ecfdf5`): Status lunas dan layanan selesai.

---

## 3. Tipografi dan Spasi

* **Font Utama:** `Plus Jakarta Sans`, sans-serif modern dengan keterbacaan tinggi pada berbagai resolusi layar.
* **Skala Tipografi:**
  * Hero Title: 48px (3.0rem), Weight 800, Line Height 1.15.
  * Section Title: 36px (2.25rem), Weight 800, Letter Spacing -0.02em.
  * Card Heading: 20px (1.25rem), Weight 700.
  * Body Text: 16px (1.0rem), Weight 400-500, Line Height 1.65.
  * Microcopy / Badge: 12px - 14px (0.75rem - 0.875rem), Weight 600.
* **Sistem Spasi:** Kelipatan 8px (8px, 16px, 24px, 32px, 48px, 64px) untuk konsistensi jarak margin dan padding antarelemen.

---

## 4. Anatomi Komponen Antarmuka Utama

### A. Navigasi Global (Navbar)
* Berisi logo OptikExpress dengan ikon kacamata terpadu, tautan navigasi Beranda, Layanan, Cara Kerja, Tentang Kami, dan tombol aksi "Pesan Sekarang".
* Dilengkapi menu hamburger interaktif pada layar mobile untuk membuka navigasi drawer secara vertikal.

### B. Hero Section
* Headline resmi: *"Perbaikan Kacamata Kini Lebih Mudah."*
* Sub-headline yang menjelaskan kepraktisan layanan antar-jemput.
* Tombol CTA ganda: "Pesan Layanan" dan "Lihat Layanan".
* Strip keunggulan: Layanan Jemput & Antar, Cepat & Presisi, serta Live GPS Tracking.
* Kartu ilustrasi grafis kacamata modern dengan badge rating 4.9.

### C. Kartu Daftar Layanan
Menampilkan 3 kartu spesialisasi:
1. **Perbaikan Kacamata:** Penyetelan frame, ganti sekrup, pasang nosepad, dan cuci ultrasonik.
2. **Penggantian Lensa:** Lensa anti-radiasi blueray, photochromic, dan lensa tipis indeks tinggi.
3. **Antar-Jemput Kacamata:** Layanan kurir dengan kotak pelindung kacamata anti-benturan.
Setiap kartu dilengkapi harga awal, poin keunggulan, dan tombol pemilihan yang otomatis menggulirkan halaman ke formulir pemesanan.

### D. Alur Cara Kerja (4 Langkah Bernomor)
Menyajikan alur visual terhubung:
1. Pilih Layanan yang Dibutuhkan.
2. Isi Formulir Pemesanan.
3. Tunggu Konfirmasi Pesanan.
4. Kacamata Dijemput dan Dikirim Kembali.

### E. Formulir Pemesanan Terintegrasi
Menyediakan input terstruktur: Nama pelanggan, nomor telepon/WhatsApp, jenis layanan, alamat lengkap penjemputan, tanggal dan jam jemput, serta catatan kerusakan. Dilengkapi validasi input instan dan penanganan status loading saat mengirimkan request ke backend.

### F. Pelacakan Kurir Live GPS (Komponen LiveMapKurir)
* Peta interaktif berbasis Leaflet OpenStreetMap.
* Marker toko optik, marker alamat tujuan pelanggan, dan marker kurir dengan animasi gelombang radar (*radar pulse ring*).
* Polyline rute perjalanan warna biru.
* Tombol aksi: *"Buka Rute Langsung di Google Maps"* yang memicu direct URL ke aplikasi Google Maps resmi dengan koordinat asal dan tujuan nyata.

---

## 5. Panduan Responsif Multi-Layar (Breakpoints)

* **Desktop Layar Lebar (> 992px):** Grid 2 sampai 4 kolom, tata letak berdampingan untuk formulir dan info panel.
* **Tablet (768px - 992px):** Grid 2 kolom, timeline bertumpuk, kartu layanan merapat secara seimbang.
* **Smartphone (< 768px):** Tata letak kolom tunggal (1 kolom), navbar berubah menjadi menu hamburger, tombol berukuran penuh (full-width) yang ramah sentuhan jari.

# NASKAH & SKENARIO VIDEO DEMO APLIKASI (SKENARIO_VIDEO.MD)

**Proyek:** OptikExpress — Sistem Informasi Layanan Antar-Jemput Kacamata  
**Berkas Video Acuan:** [`demo.mp4`](demo.mp4)  
**Spesifikasi Video:** Full HD (1920 × 1080), 30 FPS, Durasi 104 Detik, Format MP4 H.264  
**Antarmuka Browser:** Google Chrome di Windows (Windows Control Buttons: Minimize, Maximize, Close, Omnibox)  
**Target Rilis:** Pertemuan 7 (Presentasi & Demonstrasi MVP Tuntas)  
**Repositori GitHub:** [https://github.com/akuntugassindar-spec/RPLApp.git](https://github.com/akuntugassindar-spec/RPLApp.git)

---

## 1. Kredensial & Data Uji Demonstrasi (3 Role RBAC)

| Peran (Role) | Nama Akun | Email Login | Password | Tanggung Jawab dalam Skenario |
| :--- | :--- | :--- | :--- | :--- |
| **Pelanggan** | Bahrul Ulum | `bahrul@gmail.com` | `password123` | Mengajukan servis kacamata, upload foto/resep, bayar via QRIS, cek riwayat |
| **Administrator** | Administrator Optik | `admin@optik.com` | `admin123` | Verifikasi order #4, tetapkan biaya Rp 150.000, assign kurir armada Plat B |
| **Kurir Logistik** | Bambang Wijaya | `kurir@gmail.com` | `kurir123` | Armada Plat B (`Yamaha NMAX - B 3120 TNG`), jemput kacamata, siarkan GPS live |

* **Data Pesanan Demo:**
  * **ID Pesanan:** `#4`
  * **Jenis Layanan:** Perbaikan Frame & Penggantian Lensa
  * **Keluhan:** Frame kacamata titanium bengkok pada engsel kanan, penggantian lensa minus 2.50 silinder 0.50 anti-blueray.
  * **Alamat Jemput:** Jl. BSD Boulevard No. 12, BSD City, Tangerang Selatan (Area Cakupan Tangerang & DKI Jakarta).
  * **Total Biaya Layanan:** Rp 150.000 (Layanan Perbaikan + Lensa + Antar-Jemput).
  * **Metode Pembayaran:** QRIS Standar Bank Indonesia (EMVCo & CRC-16 Checksum) / VA BCA `8077708123456789`.

---

## 2. Matriks Skenario Perekaman 8 Adegan (`demo.mp4`)

| No | Waktu (Durasi) | Adegan / Modul | Halaman / Rute | Aktor | Tindakan Utama di Layar | Indikator Keberhasilan |
| :-: | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | `00:00 – 00:08` (8s) | **Judul & Arsitektur** | Layar Pembuka Intro | Sistem | Tampilan brand OptikExpress, arsitektur 3-tier, 3 role RBAC, fitur GPS & QRIS | Judul dan arsitektur terbaca jelas |
| **2** | `00:08 – 00:18` (10s) | **Beranda Publik** | `localhost:3000/` | Tamu / Publik | Chrome di Windows, navbar murni teks tanpa emote, hero banner, 4 kartu keunggulan | Kursor meluncur ke tombol "Daftar & Pesan" |
| **3** | `00:18 – 00:32` (14s) | **Alur Pelanggan** | `localhost:3000/layanan/buat` | Pelanggan (`bahrul`) | Isi form servis kacamata, alamat Tangerang, upload foto kacamata & resep, klik submit | Modal pop-up `SuccessOverlay` muncul di tengah layar |
| **4** | `00:32 – 00:46` (14s) | **Alur Administrator** | `localhost:3000/admin/dashboard` | Admin (`admin@optik.com`) | Buka 4 stat card Icons8, buka pesanan #4, tetapkan biaya Rp 150.000, assign kurir Plat B | Toast notifikasi sukses, status jadi `dijadwalkan` |
| **5** | `00:46 – 01:00` (14s) | **Alur Kurir Logistik** | `localhost:3000/kurir/dashboard` | Kurir (`Bambang Wijaya`) | Klik "Mulai Jemput" (`diambil`), klik "Siarkan GPS Saya", peta radar Leaflet/Google Maps | Marker kurir Plat B bergerak mendekati lokasi pemesan |
| **6** | `01:00 – 01:14` (14s) | **Alur Pembayaran** | `localhost:3000/pembayaran/4` | Pelanggan (`bahrul`) | Buka rincian tagihan Rp 150.000, tab QRIS EMVCo BI + VA BCA, klik "Konfirmasi Lunas" | Modal sukses muncul, status tagihan seketika **LUNAS** |
| **7** | `01:14 – 01:26` (12s) | **Lab & Audit Trail** | `localhost:3000/riwayat-status/4` | Sistem / Lab | Status stepper pengerjaan lab (`diproses`), `diantar`, `selesai`, dan tabel 6 audit log | Seluruh log kronologis tercatat di database 3NF |
| **8** | `01:26 – 01:44` (18s) | **Unit Test & Penutup** | Jendela Terminal PowerShell | Developer | Eksekusi `npm --prefix backend test`, 12 test suites, 64 tests PASSED 100% | Slide penutup MVP Ready & tautan GitHub |

---

## 3. Naskah Narasi Lengkap Presenter (Voiceover Script Per Scene)

### Scene 1: Judul & Pengantar Sistem (Menit 00:00 – 00:08)
* **Tampilan Visual:** Layar intro modern warna biru gelap (*Dark Slate*), logo OptikExpress bersinar, badge "Pertemuan 7 - MVP Selesai", 3 kartu arsitektur sistem.
* **Tindakan di Layar:** Efek transisi pembuka dengan animasi radial glow.
* **Naskah Suara (Voiceover):**
  > *"Halo semuanya! Selamat datang dalam demonstrasi aplikasi **OptikExpress**, Sistem Informasi Layanan Antar-Jemput Kacamata berbasis web. Proyek ini dibangun dengan arsitektur Fullstack 3-Tier: Frontend React.js, Backend Express.js RESTful API, dan basis data relasional MySQL 8.0 berstandar 3 Normal Form. Sistem ini mengintegrasikan 3 peran pengguna: Pelanggan, Administrator, dan Kurir Armada Lapangan dengan fitur unggulan Live Courier Tracking GPS serta Simulator Pembayaran Digital QRIS standar Bank Indonesia."*

---

### Scene 2: Beranda Publik & Keunggulan Layanan (Menit 00:08 – 00:18)
* **Tampilan Visual:** Halaman Landing Page publik di `http://localhost:3000` dengan Google Chrome di Windows. Navbar teks bersih (*tanpa emotikon mentah*), hero banner "Layanan Antar-Jemput Kacamata Praktis & Cepat", dan 4 kartu layanan utama.
* **Tindakan di Layar:** Kursor mouse bergerak mulus dari hero section ke arah tombol "Daftar & Pesan Sekarang".
* **Naskah Suara (Voiceover):**
  > *"Pada halaman Beranda Publik, pengunjung disajikan informasi mengenai solusi servis kacamata tanpa perlu keluar rumah. Terdapat empat layanan unggulan: Antar-Jemput Tepat Waktu, Teknisi Optik Profesional, Pilihan Lensa Lengkap dari blueray hingga progresif, serta pemantauan status transparan. Antarmuka telah disempurnakan dengan tipografi bersih dan desain modern."*

---

### Scene 3: Alur Pelanggan — Pemesanan & Upload Berkas (Menit 00:18 – 00:32)
* **Tampilan Visual:** Halaman formulir pemesanan `/layanan/buat` dengan akun login pelanggan `Bahrul Ulum`. Form berisi input jenis layanan, keluhan kacamata patah, alamat jemput BSD Tangerang, slot waktu, serta preview foto kacamata dan foto resep optik dokter.
* **Tindakan di Layar:** Kursor mouse mengisi formulir, memeriksa berkas unggahan, lalu menekan tombol **"Kirim Permintaan Layanan"**. Seketika jendela modal **`SuccessOverlay`** berwarna hijau pop-up di tengah layar.
* **Naskah Suara (Voiceover):**
  > *"Kini kita masuk ke Alur Pelanggan. Bahrul Ulum mengajukan perbaikan frame kacamata titanium yang patah dan permintaan lensa anti-blueray dengan alamat penjemputan di BSD City, Tangerang Selatan. Pelanggan mengunggah foto kondisi fisik kacamata dan foto resep optik dokter. Saat tombol submit diklik, modal overlay sukses langsung muncul di tengah layar mengonfirmasikan pesanan ID #4 telah berhasil tercatat."*

---

### Scene 4: Alur Administrator — Verifikasi, Biaya & Assign Kurir Plat B (Menit 00:32 – 00:46)
* **Tampilan Visual:** Admin Dashboard `/admin/dashboard` dengan akun `Administrator Optik`. 4 kartu statistik ringkas, tabel order dengan entri Bahrul Ulum, panel verifikasi biaya dan dropdown armada kurir.
* **Tindakan di Layar:** Admin membuka detail order #4, menginspeksi foto kacamata via zoom, memasukkan biaya **Rp 150.000**, memilih kurir armada Plat B **Bambang Wijaya (Yamaha NMAX - B 3120 TNG)**, dan klik **"Simpan & Jadwalkan"**. Toast notifikasi hijau muncul.
* **Naskah Suara (Voiceover):**
  > *"Selanjutnya pada Alur Administrator, admin masuk ke Admin Dashboard untuk memeriksa pesanan #4 yang baru masuk. Admin memvalidasi foto kacamata dan resep dokter, menetapkan total estimasi biaya pengerjaan sebesar Rp 150.000, serta menugaskan armada kurir Plat B, yaitu Bambang Wijaya dengan kendaraan B 3120 TNG untuk wilayah Tangerang dan Jakarta. Status pesanan seketika berubah menjadi Dijadwalkan."*

---

### Scene 5: Alur Kurir Logistik — Penjemputan & Live Courier Tracking GPS (Menit 00:46 – 01:00)
* **Tampilan Visual:** Dashboard Kurir `/kurir/dashboard` dengan akun `Bambang Wijaya`. Banner kurir aktif dengan nomor armada Plat B. Panel Live Courier Tracking menampilkan peta rute Google Maps Indonesia & OpenStreetMap Tangerang-Jakarta dengan marker animasi radar bergerak.
* **Tindakan di Layar:** Kurir mengklik tombol **"Mulai Jemput Kacamata"** (status menjadi `diambil`) lalu mengklik **"Siarkan GPS Saya"** (`LIVE GPS: -6.2088, 106.8456`). Progress rute bergerak naik dari 10% ke 85% mendekati alamat pelanggan.
* **Naskah Suara (Voiceover):**
  > *"Beralih ke Alur Kurir Logistik. Bambang Wijaya membuka dashboard tugas, memulai penjemputan kacamata, dan mengaktifkan siaran GPS kurir secara langsung. Sistem secara otomatis menghitung estimasi jarak ke alamat penjemputan di BSD yang kini berjarak kurang dari 500 meter, lengkap dengan tombol langsung ke WhatsApp pelanggan dan pembukaan rute di Google Maps Indonesia."*

---

### Scene 6: Alur Pembayaran Digital — Simulator QRIS EMVCo & VA BCA (Menit 01:00 – 01:14)
* **Tampilan Visual:** Halaman pembayaran pelanggan `/pembayaran/4` dengan total tagihan Rp 150.000. Tampilan tab QRIS resmi Bank Indonesia lengkap dengan QR code dinamis, tag EMVCo, checksum CRC-16, dan opsi Virtual Account BCA `8077708123456789`.
* **Tindakan di Layar:** Kursor mouse memilih tab QRIS, lalu menekan tombol **"Konfirmasi Tagihan Lunas"**. Modal pop-up sukses hijau muncul, dan badge tagihan berubah seketika menjadi **LUNAS (Verified)**.
* **Naskah Suara (Voiceover):**
  > *"Pada Alur Pembayaran, pelanggan membuka tagihan layanan ID #4 sebesar Rp 150.000. Sistem menyediakan simulator gateway multi-metode: QRIS berstandar Bank Indonesia dengan validasi spesifikasi EMVCo dan kalkulasi CRC-16, BCA Virtual Account, e-wallet GoPay, dan COD. Begitu tombol pelunasan ditekan, sistem langsung memverifikasi transaksi dan mengubah status tagihan menjadi LUNAS."*

---

### Scene 7: Alur Lab Optik, Pengantaran & Riwayat Status Audit Trail (Menit 01:14 – 01:26)
* **Tampilan Visual:** Halaman `/riwayat-status/4` menampilkan status stepper 6 tahapan pengerjaan kacamata yang telah berwarna hijau lengkap, beserta tabel log kronologis audit trail.
* **Tindakan di Layar:** Scroll memperlihatkan 6 catatan riwayat status dari `menunggu_konfirmasi`, `dijadwalkan`, `diambil`, `diproses` di lab optik, `diantar` oleh armada kurir, hingga `selesai` diterima pelanggan.
* **Naskah Suara (Voiceover):**
  > *"Setelah kacamata diambil, teknisi optik mengerjakan penyolderan frame dan pemasangan lensa baru di laboratorium dengan status 'diproses'. Kacamata yang selesai kemudian 'diantar' kembali oleh kurir dan ditandai 'selesai' setelah diterima pelanggan. Seluruh tahapan tercatat rapi secara transparan dalam tabel Audit Trail basis data yang mencatat waktu presisi dan aktor yang bertanggung jawab."*

---

### Scene 8: Verifikasi Otomatis (64/64 Unit Tests 100% Lulus) & Penutup (Menit 01:26 – 01:44)
* **Tampilan Visual:** Jendela terminal PowerShell mengeksekusi perintah `npm --prefix backend test`. Output menampilkan 12 test suites dengan tanda checklist hijau untuk seluruh 64 tests (0 fail). Layar berpindah ke outro slide rilis MVP.
* **Tindakan di Layar:** Teks summary hijau `HASIL AKHIR : 64 PASSED / 0 FAILED (100% LULUS)` terpampang di layar terminal. Slide penutup memuat tautan repositori GitHub.
* **Naskah Suara (Voiceover):**
  > *"Sebagai penjamin mutu perangkat lunak, kami menguji keandalan sistem backend dengan 64 Unit Tests komprehensif dalam 12 test suites, mencakup modul autentikasi JWT, CRUD layanan, upload file, algoritma EMVCo QRIS, hingga tracking GPS. Hasil pengujian menunjukkan seratus persen kelulusan tanpa kegagalan. Seluruh kode sumber dan video demo ini dapat diakses pada repositori GitHub resmi kami. Sekian demonstrasi OptikExpress, terima kasih!"*

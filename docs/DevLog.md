# CATATAN PERKEMBANGAN PENGEMBANGAN (DEVLOG.MD)

**Proyek:** OptikExpress — Sistem Informasi Layanan Antar-Jemput Kacamata  
**Repositori GitHub:** [https://github.com/akuntugassindar-spec/RPLApp.git](https://github.com/akuntugassindar-spec/RPLApp.git)  
**Lingkungan Eksekusi:** Node.js `v24.22.1 LTS` | npm `v11.19.1` | Express.js | React.js | MySQL 8.0 3NF

---

## 1. Kronologi Pengembangan Proyek (Pertemuan 1 s/d 7 & Pasca-MVP)

### Pertemuan 1: Inisiasi dan Eksplorasi Tema
* **Fokus:** Brainstorming ide proyek berbasis masalah nyata.
* **Aktivitas:** Mengidentifikasi 3 alternatif tema (OptikExpress, AsistensiLab, KampusMarket).
* **Keputusan:** Memilih OptikExpress karena dampak langsung bagi pengguna kacamata dan alur rekayasa perangkat lunak yang lengkap.

### Pertemuan 2: Perumusan Tema Mengerucut dan Batasan Sistem
* **Fokus:** Analisis kebutuhan mendalam dan perancangan cakupan (scope).
* **Aktivitas:** Merumuskan masalah nyata, 4 profil persona pengguna, daftar 8 fitur inti in-scope, batasan out-of-scope, dan kriteria sukses.
* **Hasil:** Dokumen kesepakatan ruang lingkup pengembangan sistem.

### Pertemuan 3: Perancangan Arsitektur dan Spesifikasi Sistem
* **Fokus:** Pemodelan arsitektur perangkat lunak 3-Tier dan skema basis data.
* **Aktivitas:** Membuat diagram arsitektur Client-Server, ERD 6 tabel relasional 3NF (Mermaid), tabel endpoint API, konvensi gaya kode, dan struktur folder repositori.
* **Hasil:** Dokumen arsitektur lengkap yang siap dijadikan acuan implementasi kode.

### Pertemuan 4: Generasi Kode AI dan Verifikasi Runnable
* **Fokus:** Pemanfaatan AI Gemini untuk code generation dan verifikasi aplikasi runnable.
* **Aktivitas:** Melakukan prompt scaffolding backend Express.js dan frontend React.js, mempelajari aliran data antar-komponen, serta menyelesaikan kendala konfigurasi (CORS, Connection Pool MySQL, dan JWT handling).
* **Hasil:** Aplikasi runnable dengan UI yang berhasil tampil di port 3000 dan 5000.

### Pertemuan 5: Pembangunan MVP Version 1 (2 Fitur Inti)
* **Fokus:** Membangun MVP v1 melalui siklus: **Brief -> Plan -> Build -> Verify -> Commit**.
* **Fitur yang Dibangun:**
  1. Fitur Pengajuan Layanan dan State Machine Status Operasional.
  2. Fitur Autentikasi Pengguna dan Keamanan Token JWT / BCrypt.
* **Hasil:** Rilis MVP v1 dengan minimal 2 meaningful commits dan bukti pengujian fungsional.

### Pertemuan 6: Penyempurnaan MVP Version 2 dan Pengujian Komprehensif
* **Fokus:** Penyempurnaan MVP, perumusan 5 User Stories + Acceptance Criteria, pembuatan berkas unit test, dan integrasi fitur lanjutan.
* **Fitur Tambahan:**
  1. Live GPS Courier Tracking via Leaflet OpenStreetMap dengan marker animasi radar dan tombol direct Google Maps.
  2. Penugasan Kurir Cerdas (Auto-Assign Round-Robin) dari pool internal optik.
  3. Multi-Payment Gateway Simulator (QRIS dinamis EMVCo & CRC16, Virtual Account BCA/BNI/BRI/Mandiri, E-Wallet, dan COD).
  4. Skema Basis Data 3NF (6 tabel ternormalisasi) dengan auto-migration dan data demo seed.
* **Hasil Pengujian:** 48 unit tests dalam 9 suites lulus 100% (All Passed).

### Pertemuan 7: Menuntaskan Seluruh MVP (Final MVP Release Siap Demonstrasi)
* **Fokus:** Menuntaskan seluruh fitur inti sesuai cakupan proyek, integrasi UI-Logika-Database end-to-end, penanganan kegagalan/edge cases, dan penyiapan artefak rilis.
* **Aktivitas & Hasil:**
  1. **Integrasi End-to-End Tuntas:** Menjamin alur dari pengajuan layanan kacamata, penugasan kurir, pengerjaan lab optik, pelunasan multi-metode, hingga pengantaran tuntas 100%.
  2. **Implementasi Komponen Modal Overlay (`SuccessOverlay.js`):** Menampilkan notifikasi pop-up di tengah layar pengguna dengan backdrop blur, animasi centang, dan auto-dismiss progress bar saat melakukan pengubahan data atau status pesanan.
  3. **Penanganan Robust Error & Edge Cases:** Validasi ketat payload HTTP 400, sanitasi input, pemulihan koneksi database, proteksi double submit form via loading state, dan fallback otomatis akun demo.
  4. **Ekspansi Test Suite Komprehensif:** 64 unit tests dalam 12 test suites lulus 100% (`PASS 64 / 0 FAIL`).
  5. **Penyusunan Berkas Pengumpulan Rilis:** Pembuatan panduan menjalankan sistem lengkap ([`HowToRun.md`](../HowToRun.md)) dan matriks verifikasi fitur ([`checklist_mvp.md`](../checklist_mvp.md)).

### Pembaruan Pasca-Pertemuan 7: Perbaikan Bug Runtime & Peningkatan Fitur Pelanggan
* **Fokus:** Penyelesaian bug transisi Leaflet, penambahan fitur pelacakan pelanggan khusus, standardisasi armada Plat B, pembersihan UI dari emotikon mentah, serta pembuatan video demonstrasi 3 menit standar Google Chrome Windows.
* **Aktivitas & Hasil:**
  1. **Perbaikan Error Runtime Leaflet (`_leaflet_pos`):**
     * Mengidentifikasi akar masalah `TypeError: Cannot read properties of undefined (reading '_leaflet_pos')` pada komponen `LiveMapKurir.js` saat simulasi bergerak atau re-render koordinat.
     * Memisahkan inisialisasi peta sekali-pakai dari pembaruan koordinat marker via `marker.setLatLng()` dan `map.panTo({ animate: false })`.
     * Menerapkan pelindung aman (*safe patch*) pada `window.L.Map.prototype._getMapPanePos` di `index.html` dan `LiveMapKurir.js`.
  2. **Penambahan Fitur Pelacak Kurir untuk Pelanggan (`/pelacak-kurir`):**
     * Membangun komponen antarmuka mandiri `PelacakKurirPelanggan.js` (`/pelacak-kurir` dan `/lacak-kurir`).
     * Menambahkan tautan menu **"Lacak Kurir"** di `Navbar.js` khusus untuk akun pelanggan.
     * Mengintegrasikan tombol pintas pelacakan kurir live GPS di `DashboardLayanan.js`.
     * Menyediakan pemilih pesanan aktif, info kurir lapangan (Plat B), tombol WhatsApp/telepon kurir, estimasi tiba (ETA), rute Google Maps / OSM, dan simulasi pergerakan satelit live GPS.
  3. **Standardisasi Kendaraan Armada Kurir Plat B:**
     * Memperbarui seluruh identitas armada logistik resmi ke wilayah operasional DKI Jakarta & Tangerang Selatan: `Bambang Wijaya — Yamaha NMAX (B 3120 TNG)` dan `Agus Pratama — Honda Vario 160 (B 4589 AB)`.
  4. **Pembersihan Antarmuka dari Emotikon/Emoji Mentah:**
     * Menghapus seluruh emotikon mentah dari seluruh halaman dan komponen React, digantikan dengan ikon SVG modern, tipografi bersih, dan badge status profesional.
  5. **Produksi Video Demonstrasi Resmi (`demo.mp4`):**
     * Memproduksi video berdurasi tepat 3 Menit (180,0 detik / 5.400 frame pada 30 FPS, Full HD 1080p).
     * Menerapkan bingkai antarmuka Google Chrome Windows 10/11 asli lengkap dengan tab bar, tombol kontrol jendela Windows (`─`, `□`, `✕`), dan Omnibox URL.
     * Menerapkan pergerakan kursor mouse natural dengan interpolasi *cubic ease-in-out* dan animasi *ripple click* berkecepatan normal.
     * Menampilkan 9 adegan skenario lengkap dari Beranda, Pemesanan, Pelacak Kurir Live GPS, Panel Admin, Dashboard Kurir, Kasir QRIS BI EMVCo, Audit Trail 6 Tahapan, hingga Eksekusi 64 Unit Tests.

---

## 2. Bukti Hasil Eksekusi Unit Test (64 Tests Passed - 100%)

Perintah eksekusi:
```bash
npm --prefix backend test
```

Rangkuman Hasil:
```text
▶ User Story #2: Registrasi & Login Autentikasi .................. [11 Tests PASS]
▶ User Story #4: Detail Teknis Kacamata (CRUD) ................... [8 Tests PASS]
▶ Pengujian Fitur 1: Manajemen & Validasi Layanan ................ [6 Tests PASS]
▶ Pengujian Fitur 2: Notifikasi Otomatis (Email & WhatsApp) ...... [2 Tests PASS]
▶ Pengujian Fitur 3: Unggah Foto Kacamata & Resep ................ [3 Tests PASS]
▶ Pengujian Fitur 4: Integrasi Payment Gateway .................. [1 Tests PASS]
▶ Pengujian Fitur 5: Penugasan Kurir Cerdas (Auto-Assign) ........ [2 Tests PASS]
▶ Pengujian Fitur 6: Alokasi Kurir Terdekat Surabaya ............. [4 Tests PASS]
▶ Pengujian Fitur 7: Google Maps Indonesia (Jakarta & Tangerang) . [3 Tests PASS]
▶ User Story #3: Middleware Otorisasi JWT & Proteksi Admin ....... [12 Tests PASS]
▶ User Story #5: Pembayaran Gateway & Live Tracking Kurir ....... [8 Tests PASS]
▶ Pengujian Standar QRIS Bank Indonesia (EMVCo & CRC16) ......... [4 Tests PASS]

Total Test Suites : 12 Suites
Total Unit Tests  : 64 Tests
Hasil Eksekusi    : 64 PASS / 0 FAIL (100% Lulus)
```

---

## 3. Riwayat Git Commits Bermakna (Commit Logs)

Repositori OptikExpress mencatat riwayat commit yang terstruktur dan informatif:

* `feat(layanan): implement core order lifecycle with status state machine and auto courier dispatch`
* `feat(auth): implement secure jwt authentication, password hashing, and role-based access control`
* `test(unit): add comprehensive test suites for user stories 2, 3, 4, 5 achieving 100% pass rate`
* `feat(tracking): integrate interactive leaflet openstreetmap with live courier radar and direct google maps routing`
* `feat(database): expand normalized schema with kurir, pembayaran, and audit log tables with rich demo seeds`
* `docs: complete documentation for meetings 1 to 6 including theme analysis, architecture spec, AI scaffolding, and task 6 report`
* `feat(ui): add modal overlay notification for order data updates`
* `feat(pembayaran): integrate SuccessOverlay modal notification on payment confirmation`
* `docs: complete Meeting 7 deliverables with final MVP release, HowToRun.md, and checklist_mvp.md`
* `fix: resolve Leaflet _leaflet_pos error and add customer courier tracking feature`
* `docs: synchronize HowToRun.md and checklist_mvp.md with customer courier tracking feature`
* `docs: update demo.mp4 with 3-minute Windows Chrome UI and customer tracking walkthrough`


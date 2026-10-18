# 🎯 Dokumentasi Tugas Pertemuan 5: Pembangunan MVP Version 1

## 1. Pemilihan 2 Fitur Inti MVP

Sesuai instruksi Tugas Pertemuan 5, dipilih 2 fitur inti yang paling esensial bagi operasional bisnis OptikExpress:

1. **Fitur Inti 1: Manajemen Alur Siklus Layanan (Service Request Lifecycle & State Machine)**  
   Pengelolaan pesanan servis kacamata, pembatalan pesanan yang masih berstatus pengajuan, dukungan kombinasi perbaikan frame dan penggantian lensa (`perbaikan_dan_lensa`), serta kontrol pembaruan tahapan status oleh admin optik.
2. **Fitur Inti 2: Notifikasi Otomatis Multi-Saluran (Email & WhatsApp Mock)**  
   Pengiriman pemberitahuan real-time otomatis kepada pelanggan setiap kali status pengerjaan kacamata mereka diubah oleh teknisi/admin optik.

---

## 2. Proses Rekayasa: Brief ➔ Plan ➔ Build ➔ Verify ➔ Commit

### A. Fitur Inti 1: Manajemen Alur Layanan
* **Brief**: Pelanggan memerlukan kejelasan tahapan pengerjaan kacamata dan opsi membatalkan jika terjadi kekeliruan, serta pilihan paket lengkap (frame + lensa).
* **Plan**:
  - Menambahkan nilai `perbaikan_dan_lensa` pada ENUM jenis layanan basis data.
  - Menetapkan 6 tahapan status operasional (`pengajuan`, `dijadwalkan`, `diambil`, `diproses`, `selesai`, `diantar`).
  - Menambahkan endpoint `DELETE /api/layanan/:id` dengan aturan bisnis: hanya pesanan berstatus `pengajuan` yang dapat dibatalkan oleh pelanggan.
* **Build**:
  - Mengubah controller `backend/controllers/layananController.js`.
  - Menambahkan endpoint router `backend/routes/layananRoutes.js`.
  - Memperbarui antarmuka pengguna pada halaman `Dashboard.js` dan `DetailLayanan.js`.
* **Verify**:
  - Unit test `Harus memiliki seluruh jenis layanan yang didukung sistem (termasuk perbaikan_dan_lensa)` $\rightarrow$ **PASS**.
  - Unit test `Harus memiliki 6 alur status layanan yang valid` $\rightarrow$ **PASS**.
  - Unit test `createLayanan harus menolak jika field wajib kosong (HTTP 400)` $\rightarrow$ **PASS**.
* **Commit**:
  - `066d94c` — `feat(service-mgmt): implement service deletion, perbaikan_dan_lensa enum support, and UI controls`

---

### B. Fitur Inti 2: Notifikasi Otomatis (Email & WhatsApp)
* **Brief**: Pelanggan tidak perlu membuka web berulang kali hanya untuk mengetahui apakah kacamata sudah dijemput, selesai diperbaiki, atau sedang diantar.
* **Plan**:
  - Mengintegrasikan pustaka `nodemailer` dengan konfigurasi fleksibel: Ethereal Mail (development) dan Gmail SMTP (production).
  - Merancang template email HTML bernuansa optik profesional.
  - Membuat fungsi WhatsApp Mock yang mencetak format pesan standar ke terminal log.
* **Build**:
  - Mengimplementasikan helper `sendEmailNotification` dan `sendWANotification` di `layananController.js`.
  - Memanggil fungsi notifikasi secara asinkron di dalam method `updateStatusLayanan`.
* **Verify**:
  - Unit test `sendWANotification harus mengeksekusi format log WhatsApp dengan status uppercase` $\rightarrow$ **PASS**.
  - Unit test `sendWANotification harus dapat menangani jika no telepon kosong` $\rightarrow$ **PASS**.
* **Commit**:
  - `c2cf0c3` — `feat(notifications-tests): integrate Gmail SMTP notifications, WhatsApp mock, and unit test suite`

---

## 3. Pertanyaan Wajib Mahasiswa & Penjelasannya

### Q1: Apa yang dikerjakan oleh AI Agent?
* Menulis kode implementasi backend (controller, route, model helper) untuk fungsi `deleteLayanan` dan konfigurasi `nodemailer`.
* Menghasilkan kerangka unit test awal berbasis Node.js native test runner (`node:test`).
* Merapikan komponen React UI agar terhubung dengan endpoint baru secara dinamis.

### Q2: Apa yang direview dan diubah oleh mahasiswa?
* Memeriksa skema ENUM MySQL pada `schema.sql` untuk memastikan tidak ada konflik tipe data antara frontend dan backend.
* Mengoreksi penanganan error `EADDRINUSE` pada server Express jika port 5000 sedang terpakai proses lain.
* Menyesuaikan template pesan notifikasi agar menggunakan bahasa Indonesia yang sopan dan ramah pelanggan.

### Q3: Bagaimana fitur diverifikasi?
* **Verifikasi Otomatis**: Menjalankan unit test `node --test backend/tests/layanan.test.js` dan memastikan seluruh *assertion* lolos.
* **Verifikasi Manual**: Login sebagai pelanggan, membuat pengajuan servis kacamata, login sebagai admin, lalu mengubah statusnya menjadi `diproses` dan memastikan log WhatsApp serta preview email terkirim.

### Q4: Mengapa perubahan tersebut diperlukan?
* Bisnis optik kacamata sangat bergantung pada kepercayaan pelanggan. Tanpa adanya kejelasan alur status (6 siklus) dan notifikasi instan, pelanggan akan merasa cemas mengenai kondisi kacamata berharga mereka yang sedang diservis.

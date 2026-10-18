# 🚀 PERTEMUAN 5: PEMBANGUNAN MVP VERSION 1 SECARA ITERATIF

**Mata Kuliah:** Rekayasa Perangkat Lunak (RPL)  
**Aplikasi:** OptikExpress — Sistem Informasi Layanan Antar-Jemput Kacamata  
**Target:** Membangun MVP v1 secara terarah melalui siklus: **Brief $\rightarrow$ Plan $\rightarrow$ Build $\rightarrow$ Verify $\rightarrow$ Commit**.

---

## 1. Dua Fitur Inti MVP yang Dipilih

Untuk rilis MVP Versi 1, tim memfokuskan pengerjaan pada 2 pilar fungsional paling penting dalam sistem:

1. **Fitur Inti 1: Pengajuan Layanan Servis Kacamata & Siklus Status Pengerjaan (Service Lifecycle Engine)**
   * Memungkinkan pelanggan memilih jenis layanan (`perbaikan`, `penggantian_lensa`, `perbaikan_dan_lensa`), menentukan alamat & jadwal jemput, serta memantau 6 tahapan status operasional (`pengajuan` $\rightarrow$ `dijadwalkan` $\rightarrow$ `diambil` $\rightarrow$ `diproses` $\rightarrow$ `selesai` $\rightarrow$ `diantar`).
2. **Fitur Inti 2: Autentikasi Pengguna & Keamanan Berbasis Token JWT / BCrypt (Secure Authentication)**
   * Memfasilitasi pendaftaran akun baru, enkripsi password dengan algoritma BCrypt, otentikasi login, serta penerbitan token JWT stateless untuk membedakan hak akses antara pelanggan biasa dan administrator optik.

---

## 2. Alur Rekayasa: Brief $\rightarrow$ Plan $\rightarrow$ Build $\rightarrow$ Verify $\rightarrow$ Commit

### A. Fitur 1: Manajemen Pengajuan Layanan & State Machine
* **Brief:** Menyediakan endpoint dan antarmuka untuk pelanggan mengajukan servis kacamata dan admin memperbarui status.
* **Plan:** Rancang skema database tabel `layanan`, definisikan 6 array status valid, buat controller `createLayanan` dan `updateStatusLayanan`, serta buat formulir React di `BuatLayanan.js`.
* **Build:** Implementasikan endpoint `POST /api/layanan` dan `PUT /api/layanan/:id/status` dengan penanganan transaksi MySQL rollback jika terjadi kegagalan.
* **Verify:** Uji coba pembuatan pesanan via formulir web dan verifikasi bahwa baris data tersimpan di MySQL dengan status awal `pengajuan`.
* **Commit:** `feat(layanan): implement core order lifecycle with status state machine and auto courier dispatch`

### B. Fitur 2: Sistem Autentikasi & Keamanan JWT
* **Brief:** Melindungi data pengguna dan memisahkan hak akses antara pelanggan dan admin toko optik.
* **Plan:** Siapkan skema tabel `users`, gunakan pustaka `bcryptjs` untuk hashing password dan `jsonwebtoken` untuk menandatangani token sesi.
* **Build:** Buat modul `authController.js` (`register`, `login`, `getProfile`) dan middleware `auth.js` serta `adminAuth.js`.
* **Verify:** Uji coba login dengan password salah (harus ditolak HTTP 401), login dengan password benar (berhasil mendapat token JWT), dan uji coba akses route admin dengan token user biasa (harus ditolak HTTP 403 Forbidden).
* **Commit:** `feat(auth): implement secure jwt authentication, password hashing, and role-based access control`

---

## 3. Evaluasi & Pemahaman Mahasiswa (Q&A Rubrik Perkuliahan)

| Pertanyaan Evaluasi Dosen | Penjelasan Mahasiswa |
| :--- | :--- |
| **Apa yang dikerjakan oleh AI Agent?** | AI Agent membantu membuat draft skema database awal, menghasilkan fungsi boilerplate Express router, serta menyusun komponen antarmuka React dasar untuk formulir dan dashboard. |
| **Apa yang direview dan diubah oleh mahasiswa?** | Mahasiswa menambahkan validasi ketat enum status (`VALID_STATUSES`), menambahkan mekanisme transaksi database (`connection.beginTransaction()`), memperbaiki penanganan error pada Axios interceptor, serta memastikan password tidak pernah terekspos dalam respons JSON. |
| **Bagaimana fitur diverifikasi?** | Melalui pengujian unit test otomatis menggunakan `node:test` (memvalidasi penolakan payload kosong, hashing bcrypt, validasi token JWT) serta simulasi langsung pada antarmuka web. |
| **Mengapa perubahan tersebut diperlukan?** | Untuk memastikan integritas data (agar tidak ada status acak di luar alur bisnis) dan keamanan sistem (mencegah kebocoran kredensial serta eskalasi hak akses oleh pengguna non-admin). |

---

## 4. Hasil Capaian Deliverable Pertemuan 5

* ✅ **MVP Version 1 Selesai & Runnable:** Fitur pemesanan dan login/register berjalan lancar.
* ✅ **Minimal 2 Meaningful Commits:** Riwayat commit terstruktur rapi pada repositori Git.
* ✅ **Bukti Testing:** Fitur memenuhi seluruh Acceptance Criteria yang ditetapkan.

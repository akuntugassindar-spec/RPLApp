# 📋 Laporan Pertemuan 10: Issue Tracking & Bug Remediation Pasca-Deploy

**Mata Kuliah:** Rekayasa Perangkat Lunak (RPL)  
**Aplikasi:** OptikExpress — Sistem Informasi Layanan Antar-Jemput Kacamata  
**Repositori GitHub:** [https://github.com/akuntugassindar-spec/RPLApp](https://github.com/akuntugassindar-spec/RPLApp)  
**Tautan GitHub Issues:** [https://github.com/akuntugassindar-spec/RPLApp/issues?q=is%3Aissue](https://github.com/akuntugassindar-spec/RPLApp/issues?q=is%3Aissue)  
**Tautan Produksi:** [https://optikexpress.vercel.app](https://optikexpress.vercel.app)

---

## 🎯 Ringkasan Eksekutif Pertemuan 10

Berdasarkan penugasan Pertemuan 10:
1. Dilakukan pengujian komprehensif pasca-deploy (*post-deployment testing*) pada lingkungan produksi Vercel + TiDB Cloud.
2. Ditemukan **10 permasalahan/bugs teknis nyata** yang terjadi akibat transisi dari lingkungan *local development* ke lingkungan *cloud serverless*.
3. Seluruh **10 issues** telah didaftarkan ke **GitHub Issues** repositori resmi: `#1` s.d. `#10`.
4. Seluruh **10 issues telah ditangani dan diperbaiki (100% SOLVED)** dengan verifikasi unit test 65/65 PASS.

---

## 📊 Matriks Status 10 Issues Pasca-Deploy

| No. Issue | Judul Bug / Permasalahan | Severity | Modul Terdampak | Status |
|---|---|---|---|:---:|
| **[#1](https://github.com/akuntugassindar-spec/RPLApp/issues/1)** | TiDB Cloud Connection Timeout saat Serverless Idle (`ETIMEDOUT`) | High | Database / Gateway | **SOLVED** ✅ |
| **[#2](https://github.com/akuntugassindar-spec/RPLApp/issues/2)** | `ER_DATA_TOO_LONG` Upload Foto Base64 (`VARCHAR(255)`) | High | Database / Storage | **SOLVED** ✅ |
| **[#3](https://github.com/akuntugassindar-spec/RPLApp/issues/3)** | Mixed Content & Tile Layer Fallback pada Leaflet OpenStreetMap | Medium | Frontend / Map | **SOLVED** ✅ |
| **[#4](https://github.com/akuntugassindar-spec/RPLApp/issues/4)** | Timezone Mismatch UTC vs WIB (GMT+7) Jadwal Jemput | Medium | Backend / Layanan | **SOLVED** ✅ |
| **[#5](https://github.com/akuntugassindar-spec/RPLApp/issues/5)** | CORS Origin Dinamis untuk Domain Produksi & Preview Vercel | Medium | Backend / Server | **SOLVED** ✅ |
| **[#6](https://github.com/akuntugassindar-spec/RPLApp/issues/6)** | Unhandled Error Transporter Email Notifikasi Menghambat Order | Medium | Backend / Notifikasi | **SOLVED** ✅ |
| **[#7](https://github.com/akuntugassindar-spec/RPLApp/issues/7)** | Sanitasi Nomor Telepon pada Deep-link WhatsApp Kurir | Medium | Backend / Kurir | **SOLVED** ✅ |
| **[#8](https://github.com/akuntugassindar-spec/RPLApp/issues/8)** | Redirect User ke Halaman Login saat Token JWT Kedaluwarsa (401) | Medium | Frontend / Auth | **SOLVED** ✅ |
| **[#9](https://github.com/akuntugassindar-spec/RPLApp/issues/9)** | Kerentanan Stored XSS pada Kolom Keluhan, Alamat, dan Catatan | High | Keamanan / Input | **SOLVED** ✅ |
| **[#10](https://github.com/akuntugassindar-spec/RPLApp/issues/10)** | Fallback Status Pengecekan Pembayaran QRIS saat Network Drop | Medium | Payment Gateway | **SOLVED** ✅ |

---

## 🛠️ Rincian Penanganan Tiap Issue

### Issue #1: TiDB Cloud Connection Timeout saat Serverless Idle
* **Gejala:** Koneksi database pool terputus otomatis setelah backend idle > 5 menit (`PROTOCOL_CONNECTION_LOST` / `ETIMEDOUT`).
* **Solusi Penanganan:** Ditambahkan parameter `enableKeepAlive: true` dan `keepAliveInitialDelay: 10000` pada `mysql2` pool di `backend/config/db.js`, serta mekanisme penanganan error connection-loss agar tidak meruntuhkan worker thread.

### Issue #2: ER_DATA_TOO_LONG pada Upload Foto Base64
* **Gejala:** Penyimpanan foto kacamata dan resep optik gagal dengan error MySQL saat file gambar base64 melebihi 255 karakter.
* **Solusi Penanganan:** Kolom `foto_kacamata` dan `foto_resep` dimigrasikan dari `VARCHAR(255)` menjadi `MEDIUMTEXT` (kapasitas hingga 16 MB) pada skema `backend/database/schema.sql` dan auto-migration pada `backend/config/db.js`.

### Issue #3: Mixed Content & Tile Layer Fallback pada Leaflet OpenStreetMap
* **Gejala:** Tile layer peta Leaflet terkadang gagal termuat pada HTTPS produksi akibat pemblokiran koneksi tidak aman atau rate limit tile OSM.
* **Solusi Penanganan:** Diperbarui URL tile layer di `frontend/src/components/LiveMapKurir.js` menjadi protokol HTTPS resmi dengan subdomain rotasi `['a', 'b', 'c']`, atribut `crossOrigin: true`, dan attribution standar.

### Issue #4: Timezone Mismatch UTC vs WIB (GMT+7)
* **Gejala:** Vercel berjalan pada zona waktu UTC, menyebabkan pesanan penjemputan yang dibuat malam hari (> 17:00 WIB) tersimpan dengan tanggal mundur H-1.
* **Solusi Penanganan:** Diimplementasikan fungsi `getWIBDate` di `backend/controllers/layananController.js` untuk menormalisasi seluruh kalkulasi tanggal operasional ke zona waktu `Asia/Jakarta` (WIB).

### Issue #5: CORS Origin Dinamis untuk Domain Produksi Vercel
* **Gejala:** Browser dengan strict security policy menolak preflight OPTIONS request saat mengakses API dari preview domains Vercel.
* **Solusi Penanganan:** Diperbarui middleware `cors` pada `backend/server.js` dengan fungsi origin dinamis yang memvalidasi whitelist domain `https://optikexpress.vercel.app`, `*.vercel.app`, serta environment lokal.

### Issue #6: Unhandled Error Transporter Email Notifikasi
* **Gejala:** Ketika port SMTP email cloud mengalami delay/blokir, respons HTTP pengajuan layanan menjadi lambat hingga > 10 detik.
* **Solusi Penanganan:** Pemanggilan pengiriman email pada `sendEmailNotification` dibungkus dengan mekanisme asynchronous *non-blocking* dengan batas timeout fail-safe 3 detik via `Promise.race`.

### Issue #7: Sanitasi Nomor Telepon pada Deep-Link WhatsApp Kurir
* **Gejala:** Nomor telepon yang diinput berformat tanda strip (`0812-3456-7890`) membuat tautan WhatsApp kurir menjadi rusak (*invalid number*).
* **Solusi Penanganan:** Diimplementasikan fungsi `sanitizePhoneNumber` yang membersihkan karakter non-numerik dan mengonversi format awalan lokal (`08...`) menjadi format internasional resmi (`628...`).

### Issue #8: Redirect User ke Login saat JWT Kedaluwarsa (401)
* **Gejala:** Setelah masa aktif token 24 jam habis, pengguna tetap berada di dashboard dengan data kosong tanpa diarahkan login kembali.
* **Solusi Penanganan:** Interceptor response Axios di `frontend/src/utils/api.js` ditambahkan penanganan otomatis yang mengarahkan navigasi browser ke `/login?expired=1` dan membersihkan `localStorage`.

### Issue #9: Kerentanan Stored XSS pada Formulir Layanan
* **Gejala:** Input teks pada field `keluhan`, `alamat`, dan `catatan_admin` belum melalui sanitasi tag HTML.
* **Solusi Penanganan:** Dibuat fungsi `escapeHtml` yang mengonversi karakter khusus (`<`, `>`, `&`, `"`, `'`) menjadi HTML entities aman sebelum query disimpan ke basis data.

### Issue #10: Resilient Payment Status Polling QRIS
* **Gejala:** Gangguan koneksi sementara menghentikan polling status pembayaran QRIS secara permanen.
* **Solusi Penanganan:** Ditambahkan fungsi resilient verification `checkPaymentStatusResilient` di `backend/utils/qrisHelper.js` serta penanganan network retry fail-safe.

---

## 🧪 Bukti Verifikasi Uji (Unit Tests 65/65 PASS)

```
> backend-layanan-kacamata@1.0.0 test
> node --test tests/*.test.js

ℹ tests 65
ℹ suites 12
ℹ pass 65
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1261.4237
```

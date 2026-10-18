# 📚 Dokumentasi Proyek: OptikExpress
**Mata Kuliah:** Rekayasa Perangkat Lunak (RPL)  
**Aplikasi:** Sistem Informasi Layanan Antar-Jemput Perbaikan Kacamata & Penggantian Lensa  
**Repositori GitHub:** [https://github.com/akuntugassindar-spec/RPLApp.git](https://github.com/akuntugassindar-spec/RPLApp.git)

---

## 📌 Daftar Dokumen Proyek

Folder ini memuat dokumentasi komprehensif perjalanan rekayasa perangkat lunak dari awal proyek hingga implementasi terkini:

| File | Topik / Isi Dokumen |
| :--- | :--- |
| **[`01_ARSITEKTUR_SISTEM.md`](./01_ARSITEKTUR_SISTEM.md)** | Arsitektur perangkat lunak, diagram relasi database (ERD 6 tabel), tech stack, dan alur operasional. |
| **[`02_PROGRESS_HISTORI.md`](./02_PROGRESS_HISTORI.md)** | Kronologi progres lengkap dari awal mula proyek (Pertemuan 1–3, 4–5, 6, hingga pembaruan hari ini). |
| **[`03_PERTEMUAN_5_MVP1.md`](./03_PERTEMUAN_5_MVP1.md)** | Dokumentasi pengerjaan Tugas Pertemuan 5 (2 Fitur Inti MVP, alur Brief $\rightarrow$ Plan $\rightarrow$ Build $\rightarrow$ Verify $\rightarrow$ Commit). |
| **[`04_PERTEMUAN_6_MVP2.md`](./04_PERTEMUAN_6_MVP2.md)** | Dokumentasi pengerjaan Tugas Pertemuan 6 (Penyempurnaan MVP, 5 User Stories, 5 File Unit Test, dan bukti 48 test *All Passed*). |
| **[`05_FITUR_HARI_INI.md`](./05_FITUR_HARI_INI.md)** | Rincian fitur yang dikerjakan hari ini (Peta jalan OpenStreetMap Leaflet, Google Maps direct route, auto-assign kurir Gojek-style, QRIS/VA, dan database 3NF). |

---

## 🚀 Ringkasan Singkat Aplikasi
* **Backend:** Node.js, Express.js, MySQL (mysql2/promise), JWT Auth, BCrypt.js.
* **Frontend:** React.js, React Router DOM v6, Leaflet (OpenStreetMap), Axios.
* **Pengujian:** Node.js Native Test Runner (`node:test`, `node:assert/strict`) — 48 passing unit tests.
* **Database:** `db_kacamata` (6 tabel relasional: `users`, `kurir`, `layanan`, `detail_layanan`, `pembayaran`, `riwayat_status_layanan`).

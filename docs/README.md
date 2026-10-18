# Dokumentasi Proyek: OptikExpress

**Mata Kuliah:** Rekayasa Perangkat Lunak (RPL)  
**Aplikasi:** Sistem Informasi Layanan Antar-Jemput Perbaikan Kacamata dan Penggantian Lensa  
**Repositori GitHub:** [https://github.com/akuntugassindar-spec/RPLApp.git](https://github.com/akuntugassindar-spec/RPLApp.git)

---

## Indeks Dokumentasi Perkuliahan (Pertemuan 1 s/d 6)

Folder ini memuat dokumentasi terstruktur dari seluruh rangkaian pengerjaan proyek rekayasa perangkat lunak dari awal mula ide hingga penyempurnaan MVP:

| Berkas Dokumen | Pertemuan | Topik dan Cakupan Dokumen |
| :--- | :---: | :--- |
| **[`PERTEMUAN_1.md`](./PERTEMUAN_1.md)** | **Pertemuan 1** | **Eksplorasi Tema:** Tiga alternatif tema aplikasi, analisis perbandingan, dan alasan pemilihan OptikExpress. |
| **[`PERTEMUAN_2.md`](./PERTEMUAN_2.md)** | **Pertemuan 2** | **Perumusan Tema Mengerucut:** Masalah nyata, 4 profil persona pengguna, manfaat aplikasi, daftar fitur inti, batasan out-of-scope, dan kriteria sukses. |
| **[`PERTEMUAN_3.md`](./PERTEMUAN_3.md)** | **Pertemuan 3** | **Arsitektur Sistem dan Spesifikasi:** Arsitektur 3-tier, tech stack, code rules, ERD 6 tabel relasional 3NF (Mermaid), fitur backend, halaman frontend, dan daftar rute API. |
| **[`PERTEMUAN_4.md`](./PERTEMUAN_4.md)** | **Pertemuan 4** | **AI Code Generation dan Runnable UI:** Scaffolding awal menggunakan Gemini, pemetaan aliran data antar-komponen, troubleshooting mandiri (CORS, Pool MySQL, JWT), dan verifikasi aplikasi runnable. |
| **[`PERTEMUAN_5.md`](./PERTEMUAN_5.md)** | **Pertemuan 5** | **Pembangunan MVP Version 1:** Dua Fitur Inti MVP, metodologi Brief $\rightarrow$ Plan $\rightarrow$ Build $\rightarrow$ Verify $\rightarrow$ Commit, bukti acceptance criteria, dan Q&A evaluasi mahasiswa. |
| **[`PERTEMUAN_6.md`](./PERTEMUAN_6.md)** | **Pertemuan 6** | **Penyempurnaan MVP Version 2:** Review MVP, 5 User Stories dan AC, 5 berkas unit test, bukti eksekusi 48 unit tests (100% all passed), implementasi live map GPS Leaflet OSM, pembayaran digital, dan riwayat commit. |

---

## Ringkasan Singkat Arsitektur dan Teknologi

* **Backend:** Node.js, Express.js REST API, MySQL (`mysql2/promise`), JWT Auth, BCrypt.js.
* **Frontend:** React.js 18.2.0, React Router DOM v6, Leaflet (OpenStreetMap), Axios.
* **Pengujian Otomatis:** Node.js Test Runner (`node:test`, `node:assert/strict`) — 48 passing unit tests (100% lulus, 0 fail).
* **Basis Data:** `db_kacamata` (6 tabel relasional 3NF: `users`, `kurir`, `layanan`, `detail_layanan`, `pembayaran`, `riwayat_status_layanan`).

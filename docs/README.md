# 📚 Dokumentasi Proyek: OptikExpress
**Mata Kuliah:** Rekayasa Perangkat Lunak (RPL)  
**Aplikasi:** Sistem Informasi Layanan Antar-Jemput Perbaikan Kacamata & Penggantian Lensa  
**Repositori GitHub:** [https://github.com/akuntugassindar-spec/RPLApp.git](https://github.com/akuntugassindar-spec/RPLApp.git)

---

## 📌 Indeks Dokumentasi Perkuliahan (Pertemuan 1 s/d 6)

Folder ini memuat dokumentasi komprehensif perjalanan rekayasa perangkat lunak dari awal mula ide, perancangan arsitektur, pembuatan kode dengan AI, hingga pengujian dan penyempurnaan MVP:

| Berkas Dokumen | Pertemuan / Topik | Rangkuman Isi Dokumen |
| :--- | :--- | :--- |
| **[`00_README_UTAMA_PROYEK.md`](./00_README_UTAMA_PROYEK.md)** | Panduan Proyek Utama | Salinan resmi dokumentasi utama, panduan setup, Quick Start, dan environment variables. |
| **[`00_PERTEMUAN_1_DAN_2_TEMA_PROJEK.md`](./00_PERTEMUAN_1_DAN_2_TEMA_PROJEK.md)** | **Pertemuan 1 & 2** | Eksplorasi 3 alternatif tema, penentuan tema mengerucut OptikExpress, profil target pengguna, manfaat, in/out of scope, dan kriteria sukses. |
| **[`01_SPESIFIKASI_ARSITEKTUR_P3.md`](./01_SPESIFIKASI_ARSITEKTUR_P3.md)** | **Pertemuan 3** | Dokumen arsitektur lengkap: Tech stack, Code rules, 6 Entitas utama, Database rules, Fitur backend/frontend, API endpoints, dan struktur direktori. |
| **[`01_ARSITEKTUR_SISTEM.md`](./01_ARSITEKTUR_SISTEM.md)** | Arsitektur & ERD | Diagram arsitektur 3-tier, Entity-Relationship Diagram (ERD 6 tabel Mermaid), state machine 6 status, dan keamanan. |
| **[`02_PERTEMUAN_4_SCAFFOLD_RUNNABLE.md`](./02_PERTEMUAN_4_SCAFFOLD_RUNNABLE.md)** | **Pertemuan 4** | Pemanfaatan AI Gemini untuk code generation, pemahaman alur data antar-komponen, troubleshooting (CORS, Pool MySQL, JWT), dan verifikasi aplikasi runnable. |
| **[`02_PROGRESS_HISTORI.md`](./02_PROGRESS_HISTORI.md)** | Histori Evolusi | Kronologi progres lengkap dari awal mula proyek hingga implementasi mutakhir hari ini. |
| **[`03_PERTEMUAN_5_MVP1.md`](./03_PERTEMUAN_5_MVP1.md)** | **Pertemuan 5** | Laporan MVP Version 1: 2 Fitur Inti MVP, metodologi Brief $\rightarrow$ Plan $\rightarrow$ Build $\rightarrow$ Verify $\rightarrow$ Commit, dan evaluasi mahasiswa. |
| **[`04_PERTEMUAN_6_MVP2.md`](./04_PERTEMUAN_6_MVP2.md)** | **Pertemuan 6** | Penyempurnaan MVP: 5 User Stories + AC, 5 berkas unit test, dan status eksekusi 48/48 all passed (100%). |
| **[`05_FITUR_HARI_INI.md`](./05_FITUR_HARI_INI.md)** | Fitur Terkini | Implementasi peta interaktif Leaflet OSM, direct Google Maps turn-by-turn, auto-assign kurir Gojek-style, simulasi Midtrans QRIS/VA, dan database 3NF. |

---

## 🚀 Ringkasan Singkat Aplikasi
* **Backend:** Node.js, Express.js, MySQL (mysql2/promise), JWT Auth, BCrypt.js.
* **Frontend:** React.js, React Router DOM v6, Leaflet (OpenStreetMap), Axios.
* **Pengujian Otomatis:** Node.js Native Test Runner (`node:test`, `node:assert/strict`) — 48 passing unit tests (100% lulus).
* **Database:** `db_kacamata` (6 tabel relasional 3NF: `users`, `kurir`, `layanan`, `detail_layanan`, `pembayaran`, `riwayat_status_layanan`).

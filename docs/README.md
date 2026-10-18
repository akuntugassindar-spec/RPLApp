# DOKUMENTASI PROYEK OPTIKEXPRESS

**Mata Kuliah:** Rekayasa Perangkat Lunak (RPL)  
**Aplikasi:** Sistem Informasi Layanan Antar-Jemput Perbaikan Kacamata dan Penggantian Lensa  
**Repositori GitHub:** [https://github.com/akuntugassindar-spec/RPLApp.git](https://github.com/akuntugassindar-spec/RPLApp.git)

---

## Indeks Dokumentasi Proyek

Folder ini memuat seluruh dokumentasi rekayasa perangkat lunak yang disusun secara modular, terstruktur, dan formal:

| Berkas Dokumen | Deskripsi dan Cakupan Dokumen |
| :--- | :--- |
| **[`ide_proyek.md`](./ide_proyek.md)** | Eksplorasi 3 alternatif tema, latar belakang masalah nyata, perumusan tema OptikExpress, persona pengguna, manfaat, dan kriteria sukses. |
| **[`OptikExpress (PRD).md`](./OptikExpress%20(PRD).md)** | Product Requirement Document (PRD) mencakup visi produk, alur State Machine operasional, 5 User Stories dan Acceptance Criteria (AC), serta persyaratan non-fungsional. |
| **[`Coding_Style.md`](./Coding_Style.md)** | Standar arsitektur 3-Tier, tech stack, konvensi gaya kode, format respons API standar, ERD 6 tabel relasional 3NF (Mermaid), dan prinsip keamanan Anti-IDOR. |
| **[`Design_UI.md`](./Design_UI.md)** | Filosofi desain UI/UX, sistem warna resmi (Navy/Ocean Blue/Mint), tipografi, anatomi komponen antarmuka, pelacakan live GPS kurir, dan panduan responsif multi-layar. |
| **[`DevLog.md`](./DevLog.md)** | Catatan riwayat perkembangan pengerjaan dari Pertemuan 1 hingga 6, bukti eksekusi 48 unit tests (100% all passed), dan catatan riwayat commit bermakna. |
| **[`Logging.md`](./Logging.md)** | Arsitektur audit trail status layanan, pencatatan koordinat pelacakan kurir GPS, logging notifikasi Email SMTP dan WhatsApp mock, serta error handling. |
| **[`Agent.md`](./Agent.md)** | Panduan dan aturan main bagi AI Coding Agent, batasan implementasi, serta pembagian peran kolaborasi antara AI dan mahasiswa. |

---

## Ringkasan Singkat Arsitektur Sistem

* **Frontend:** React.js 18.2.0, React Router DOM v6, Leaflet (OpenStreetMap), Axios.
* **Backend:** Node.js, Express.js REST API, MySQL (`mysql2/promise`), JWT Auth, BCrypt.js.
* **Pengujian Otomatis:** Node.js Test Runner (`node:test`, `node:assert/strict`) — 48 passing unit tests (100% lulus, 0 fail).
* **Basis Data:** `db_kacamata` (6 tabel relasional 3NF: `users`, `kurir`, `layanan`, `detail_layanan`, `pembayaran`, `riwayat_status_layanan`).

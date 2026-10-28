# PANDUAN AI AGENT UNTUK PROYEK OPTIKEXPRESS (AGENT.MD)

Dokumen ini dibaca oleh **AI Coding Agent apa pun** (Google Gemini, Antigravity, Claude Code, Cursor, GitHub Copilot, Codex, Windsurf, dll.) sebelum mengerjakan tugas di repositori ini. Tujuannya adalah memastikan hasil pengerjaan konsisten, mematuhi standar rekayasa perangkat lunak, dan menghormati batasan akademis proyek.

> **Urutan baca wajib sebelum coding:** `Agent.md` (dokumen ini) -> `Coding_Style.md` -> `Design_UI.md` -> `Logging.md`.

---

## 1. Konteks Proyek (Ringkasan)

* **Nama Proyek:** OptikExpress — Sistem Informasi Layanan Antar-Jemput Kacamata.
* **Tujuan:** Layanan servis dan penggantian lensa kacamata berbasis penjemputan dan pengantaran kurir terintegrasi.
* **Tech Stack:** Node.js (Express.js) + React.js 18 + MySQL 8.0 (mysql2/promise) + Leaflet (OpenStreetMap) + JWT + BCrypt.
* **Arsitektur:** 3-Tier terpisah (Frontend SPA di port 3000, Backend REST API di port 5000, Database MySQL di port 3306).
* **Domain Sensitif:** Data pengguna, alamat fisik penjemputan, resep optik dokter, transaksi pembayaran, dan posisi kurir.

---

## 2. Aturan Utama Bagi AI Coding Agent

1. **Baca Sebelum Menulis:** Selalu periksa dan baca file yang sudah ada sebelum membuat perubahan. Jangan berasumsi atau menimpa seluruh file jika hanya sebagian baris yang perlu diperbaiki.
2. **Pertahankan Seluruh Fitur yang Ada:** Jangan menghapus fitur yang sudah berjalan (Live tracking Leaflet, Google Maps intent, Courier Round-Robin, Midtrans QRIS/VA, authn/authz JWT).
3. **Patuhi `Coding_Style.md` Secara Ketat:** Gunakan PascalCase untuk komponen React, camelCase untuk controller JavaScript, dan snake_case untuk kolom database.
4. **Keamanan Tanpa Kompromi:** Dilarang menyimpan password dalam plaintext. Selalu gunakan BCrypt. Jangan pernah mematikan middleware otentikasi JWT (`auth.js`) atau proteksi admin (`adminAuth.js`) hanya demi mempermudah testing.
5. **Dilarang Hardcode Kredensial:** Semua kredensial database dan kunci rahasia JWT wajib dibaca melalui file lingkungan `.env` / `process.env`.
6. **Integritas Relasi Basis Data:** Selalu gunakan parameterized queries (`?`) untuk mencegah SQL Injection. Pertahankan foreign key constraint dengan `ON DELETE CASCADE`.
7. **Jaga Seluruh Unit Test Tetap Lulus (100% Passing):** Setiap perubahan kode tidak boleh merusak 64 unit tests yang sudah ada di `backend/tests/` (12 test suites lulus 100%).
8. **Dilarang Menggunakan Emotikon/Emoji pada File Dokumentasi:** Seluruh berkas dokumentasi di dalam folder `docs/` wajib bersih dari karakter emotikon/emoji dan ditulis dalam bahasa formal.
9. **Konfirmasi Sebelum Melakukan Commit/Push:** Jangan melakukan git commit atau push ke repositori jarak jauh (GitHub) tanpa persetujuan eksplisit dari pengguna.
10. **Jujur Terhadap Hambatan Teknis:** Jika ada fitur yang belum selesai atau terjadi error saat pengujian, jelaskan akar penyebabnya secara transparan dan berikan solusi yang tepat.

---

## 3. Pembagian Peran: AI Agent vs Mahasiswa

Prinsip dasar pengerjaan tugas Rekayasa Perangkat Lunak ini adalah **kolaborasi berimbang**:

* **Peran AI Agent:**
  * Membantu penyusunan kerangka kode awal (*scaffolding*).
  * Memberikan saran arsitektur dan draft diagram ERD.
  * Membantu pembuatan kerangka unit test otomatis berdasarkan Acceptance Criteria.
  * Merefaktor komponen visual agar modern dan responsif.
* **Peran dan Tanggung Jawab Mahasiswa:**
  * Menentukan ide proyek yang berangkat dari masalah nyata masyarakat.
  * Mempelajari dan memahami setiap baris kode yang dihasilkan AI.
  * Mengidentifikasi bug, menyelesaikan kendala konfigurasi (CORS, Connection Pooling, JWT expired).
  * Menjalankan pengujian manual maupun otomatis untuk memastikan kriteria keterimaan terpenuhi.
  * Mampu menjelaskan secara lisan alur bisnis, aliran data, dan keputusan desain arsitektur pada saat evaluasi perkuliahan.

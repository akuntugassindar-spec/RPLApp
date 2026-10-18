# CATATAN PERKEMBANGAN PENGEMBANGAN (DEVLOG.MD)

**Proyek:** OptikExpress — Sistem Informasi Layanan Antar-Jemput Kacamata  
**Repositori GitHub:** [https://github.com/akuntugassindar-spec/RPLApp.git](https://github.com/akuntugassindar-spec/RPLApp.git)

---

## 1. Kronologi Pengembangan Proyek (Pertemuan 1 s/d 6)

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
* **Fokus:** Penyempurnaan MVP, perumusan 5 User Stories + Acceptance Criteria, pembuatan 5 berkas unit test, dan integrasi fitur lanjutan.
* **Fitur Tambahan:**
  1. Live GPS Courier Tracking via Leaflet OpenStreetMap dengan marker animasi radar dan tombol direct Google Maps.
  2. Penugasan Kurir Cerdas (Auto-Assign Round-Robin) dari pool internal optik.
  3. Multi-Payment Gateway Simulator (QRIS dinamis, Virtual Account BCA/BNI/BRI/Mandiri, E-Wallet, dan COD).
  4. Skema Basis Data 3NF (6 tabel ternormalisasi) dengan auto-migration dan data demo seed.
* **Hasil Pengujian:** 48 unit tests dalam 9 suites lulus 100% (All Passed).

---

## 2. Bukti Hasil Eksekusi Unit Test (48 Tests Passed)

Perintah eksekusi:
```bash
node --test backend/tests/layanan.test.js backend/tests/auth.test.js backend/tests/middleware.test.js backend/tests/detailLayanan.test.js backend/tests/pembayaran.test.js
```

Rangkuman Hasil:
```text
> User Story #2: Registrasi & Login Autentikasi ................. [10 Tests PASS]
> User Story #4: Detail Teknis Kacamata (CRUD) ................... [8 Tests PASS]
> Pengujian Fitur 1: Manajemen & Validasi Layanan ................ [6 Tests PASS]
> Pengujian Fitur 2: Notifikasi Otomatis (Email & WhatsApp) ...... [2 Tests PASS]
> Pengujian Fitur 3: Unggah Foto Kacamata & Resep ................ [3 Tests PASS]
> Pengujian Fitur 4: Integrasi Payment Gateway .................. [1 Tests PASS]
> Pengujian Fitur 5: Penugasan Kurir Cerdas (Auto-Assign) ........ [2 Tests PASS]
> User Story #3: Middleware Otorisasi JWT & Proteksi Admin ....... [8 Tests PASS]
> User Story #5: Pembayaran Gateway & Live Tracking Kurir ....... [8 Tests PASS]

Total Test Suites : 9 Suites
Total Unit Tests  : 48 Tests
Hasil Eksekusi    : 48 PASS / 0 FAIL (100% Lulus)
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

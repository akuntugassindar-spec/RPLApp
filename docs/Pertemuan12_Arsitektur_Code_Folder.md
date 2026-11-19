# 📐 Pertemuan 12 — Arsitektur Code Folder OptikExpress

> **Mata Kuliah:** Rekayasa Perangkat Lunak (RPL)  
> **Proyek:** OptikExpress — Sistem Informasi Layanan Antar-Jemput Kacamata  
> **Tanggal:** November 2026

---

## 📌 Ringkasan

Dokumen ini menjelaskan arsitektur folder kode sumber proyek **OptikExpress**, alasan pemilihan struktur tersebut, serta bagaimana setiap folder saling terhubung dalam mendukung fungsionalitas aplikasi.

---

## 🏗️ Pola Arsitektur: Decoupled Monorepo

Proyek OptikExpress menggunakan pola **Decoupled Monorepo**, yaitu satu repository GitHub yang memisahkan dua aplikasi independen (`backend/` dan `frontend/`) secara tegas dalam folder terpisah.

### Mengapa Decoupled Monorepo?

| Alasan | Penjelasan |
|--------|------------|
| **Satu Repo, Mudah Dikelola** | Semua kode dalam satu repo mempermudah versioning, CI/CD, dan kolaborasi mahasiswa. |
| **Pemisahan yang Jelas** | Backend (API) dan Frontend (UI) dipisah secara fisik, mencegah coupling yang tidak perlu. |
| **Deploy Independen** | Backend di-deploy ke Vercel Serverless, Frontend ke Vercel Static — keduanya bisa di-deploy terpisah tanpa mengganggu satu sama lain. |
| **Skala Proyek Mahasiswa** | Untuk proyek skala kampus, monorepo lebih praktis dibanding multi-repo yang menambah kompleksitas. |

---

## 🗂️ Diagram Pohon Folder

```
RPLApp/                                    ← Root Monorepo
│
├── .github/                               ← Konfigurasi GitHub
│   └── workflows/                         ← CI/CD Pipeline Definitions
│       ├── project-ci.yml                 ←   Pipeline utama (Backend Test + Frontend Build)
│       └── site.yml                       ←   Pipeline deploy GitHub Pages
│
├── backend/                               ← 🔧 Aplikasi Backend (Node.js + Express.js)
│   ├── config/                            ←   Konfigurasi (koneksi database)
│   │   └── db.js                          ←     Modul koneksi MySQL2
│   ├── controllers/                       ←   Business Logic Layer (Controller)
│   │   ├── authController.js              ←     Logika autentikasi (register, login, JWT)
│   │   ├── layananController.js           ←     Logika CRUD layanan + state machine
│   │   └── detailLayananController.js     ←     Logika detail teknis layanan kacamata
│   ├── middleware/                         ←   Middleware Layer (Proteksi & Validasi)
│   │   ├── auth.js                        ←     Middleware JWT Authentication
│   │   ├── adminAuth.js                   ←     Middleware otorisasi khusus Admin
│   │   └── staffAuth.js                   ←     Middleware otorisasi khusus Staff/Kurir
│   ├── routes/                            ←   Routing Layer (Definisi Endpoint API)
│   │   ├── authRoutes.js                  ←     Rute: /api/auth/*
│   │   ├── layananRoutes.js               ←     Rute: /api/layanan/*
│   │   └── detailLayananRoutes.js         ←     Rute: /api/detail-layanan/*
│   ├── database/                          ←   Skema Database
│   │   └── schema.sql                     ←     DDL MySQL (tabel, relasi, indeks)
│   ├── utils/                             ←   Utilitas Pendukung
│   │   └── qrisHelper.js                 ←     Helper pembayaran QRIS
│   ├── uploads/                           ←   Direktori upload file (foto kacamata/resep)
│   ├── tests/                             ←   200 Unit Test (Node.js Test Runner)
│   │   ├── auth.test.js                   ←     Test autentikasi & otorisasi
│   │   ├── layanan.test.js                ←     Test CRUD layanan
│   │   ├── detailLayanan.test.js          ←     Test detail layanan
│   │   ├── middleware.test.js             ←     Test middleware JWT & role
│   │   ├── pembayaran.test.js             ←     Test modul pembayaran
│   │   ├── state_machine.test.js          ←     Test 6 tahapan state machine
│   │   ├── security_validation.test.js    ←     Test keamanan & validasi input
│   │   ├── optical_specs.test.js          ←     Test spesifikasi optik kacamata
│   │   ├── courier_dispatch.test.js       ←     Test dispatch & jadwal kurir
│   │   ├── qrisHelper.test.js             ←     Test helper QRIS
│   │   └── p11_remediation_regression.test.js ← Test regresi perbaikan P11
│   ├── server.js                          ←   Entry Point Backend (Express App)
│   ├── package.json                       ←   Dependensi & script backend
│   └── Dockerfile                         ←   Containerisasi backend
│
├── frontend/                              ← 🎨 Aplikasi Frontend (React.js 18 SPA)
│   ├── public/                            ←   Aset statis (index.html, favicon, manifest)
│   ├── src/                               ←   Kode Sumber React
│   │   ├── components/                    ←   Komponen Global (Reusable)
│   │   │   ├── Navbar.js                  ←     Navigasi bar responsif
│   │   │   ├── LiveMapKurir.js            ←     Peta live tracking kurir (Leaflet)
│   │   │   └── SuccessOverlay.js          ←     Overlay notifikasi sukses
│   │   ├── pages/                         ←   Halaman Aplikasi (Per Modul Domain)
│   │   │   ├── Home.js                    ←     Landing page publik
│   │   │   ├── Login.js                   ←     Halaman login
│   │   │   ├── Register.js                ←     Halaman registrasi
│   │   │   ├── admin/                     ←     📂 Modul Admin
│   │   │   │   ├── AdminDashboard.js      ←       Dashboard administrator
│   │   │   │   ├── AdminDetailLayanan.js  ←       Detail layanan (view admin)
│   │   │   │   ├── DaftarLayanan.js       ←       Daftar semua layanan
│   │   │   │   └── index.js              ←       Barrel export
│   │   │   ├── layanan/                   ←     📂 Modul Layanan
│   │   │   │   ├── BuatLayanan.js         ←       Form pembuatan layanan baru
│   │   │   │   ├── DaftarLayanan.js       ←       Daftar layanan pelanggan
│   │   │   │   ├── DashboardLayanan.js    ←       Dashboard layanan
│   │   │   │   └── index.js              ←       Barrel export
│   │   │   ├── detail_layanan/            ←     📂 Modul Detail Layanan
│   │   │   │   ├── DetailLayanan.js       ←       Detail lengkap satu layanan
│   │   │   │   ├── AdminDetailLayanan.js  ←       Detail view khusus admin
│   │   │   │   ├── PelacakKurirPelanggan.js ←     Pelacak posisi kurir
│   │   │   │   └── index.js              ←       Barrel export
│   │   │   ├── kurir/                     ←     📂 Modul Kurir
│   │   │   │   ├── KurirDashboard.js      ←       Dashboard kurir
│   │   │   │   ├── TrackingKurir.js       ←       Tracking GPS kurir
│   │   │   │   ├── DaftarKurir.js         ←       Daftar kurir tersedia
│   │   │   │   └── index.js              ←       Barrel export
│   │   │   ├── pembayaran/                ←     📂 Modul Pembayaran
│   │   │   │   ├── PembayaranPage.js      ←       Halaman pembayaran
│   │   │   │   ├── KonfirmasiPembayaran.js ←      Konfirmasi & bukti bayar
│   │   │   │   └── index.js              ←       Barrel export
│   │   │   ├── riwayat_status_layanan/    ←     📂 Modul Riwayat
│   │   │   │   ├── RiwayatStatusLayanan.js ←      Timeline riwayat status
│   │   │   │   └── index.js              ←       Barrel export
│   │   │   ├── user/                      ←     📂 Modul Pelanggan
│   │   │   │   ├── BuatLayanan.js         ←       Form layanan (sisi user)
│   │   │   │   ├── Dashboard.js           ←       Dashboard pelanggan
│   │   │   │   ├── DetailLayanan.js       ←       Detail layanan (sisi user)
│   │   │   │   ├── PelacakKurirPelanggan.js ←     Pelacak kurir (sisi user)
│   │   │   │   └── index.js              ←       Barrel export
│   │   │   └── index.js                  ←     Barrel export halaman publik
│   │   ├── utils/                         ←   Utilitas Frontend
│   │   │   ├── api.js                     ←     Axios instance + interceptor
│   │   │   └── PrivateRoute.js            ←     Komponen proteksi rute (RBAC)
│   │   ├── App.js                         ←   Root Component (Router Definition)
│   │   ├── App.css                        ←   Global Stylesheet
│   │   └── index.js                       ←   Entry Point React (ReactDOM.render)
│   ├── package.json                       ←   Dependensi & script frontend
│   ├── Dockerfile                         ←   Containerisasi frontend
│   └── nginx.conf                         ←   Konfigurasi Nginx (produksi Docker)
│
├── cicd-demo/                             ← 🧪 Demo CI/CD Pipeline (Pertemuan 11)
│   ├── index.html                         ←   Landing page GitHub Pages
│   ├── app.test.mjs                       ←   Unit test CI/CD demo
│   ├── build.mjs                          ←   Build script CI/CD demo
│   └── package.json                       ←   Dependensi CI/CD demo
│
├── docs/                                  ← 📚 Dokumentasi Proyek
│   ├── OptikExpress (PRD).md              ←   Product Requirements Document
│   ├── OptikExpress (PRD).docx            ←   PRD format Word
│   ├── OptikExpress (PRD).pdf             ←   PRD format PDF
│   ├── Design_UI.md                       ←   Panduan desain UI/UX
│   ├── Coding_Style.md                    ←   Konvensi kode & coding style
│   ├── Deployment.md                      ←   Panduan deployment
│   ├── Logging.md                         ←   Panduan logging
│   ├── Agent.md                           ←   Panduan agent/bot
│   ├── DevLog.md                          ←   Log pengembangan
│   ├── ide_proyek.md                      ←   Ide & konsep proyek
│   ├── Pertemuan10_Issue_Tracking.md      ←   Dokumentasi issue tracking P10
│   ├── Pertemuan11_CI_CD_Panduan.md       ←   Dokumentasi CI/CD P11
│   ├── Pertemuan11_Perbaikan_dan_Verifikasi_Proyek.md ← Dokumentasi perbaikan P11
│   ├── Pertemuan12_Arsitektur_Code_Folder.md ← 📐 (Dokumen ini)
│   ├── screenshots/                       ←   Tangkapan layar dokumentasi
│   └── README.md                          ←   Indeks dokumentasi
│
├── link web/                              ← 🔗 Tautan Resmi Proyek
│   ├── README.md                          ←   Penjelasan tautan
│   └── tautan_resmi.md                    ←   URL produksi & GitHub Pages
│
├── .github/                               ← GitHub Config (sudah dijelaskan di atas)
├── .env                                   ← Variabel lingkungan (tidak di-commit)
├── .env.example                           ← Template variabel lingkungan
├── .gitignore                             ← Daftar file yang diabaikan Git
├── .gitattributes                         ← Konfigurasi atribut Git
├── .vercelignore                          ← File yang diabaikan Vercel
├── vercel.json                            ← Konfigurasi deployment Vercel
├── docker-compose.yml                     ← Orkestrasi Docker (backend + frontend + MySQL)
├── HowToRun.md                            ← Panduan menjalankan proyek
├── checklist_mvp.md                       ← Checklist fitur MVP
├── README.md                              ← 📋 Dokumentasi utama proyek
├── jalankan_backend.bat                   ← Script Windows untuk backend
├── powershell.bat                         ← Script helper PowerShell
└── update_nodejs.bat                      ← Script update Node.js
```

---

## 🧩 Penjelasan Arsitektur Per Layer

### 1. Backend — Arsitektur MVC (Model-View-Controller)

Backend menggunakan pola **MVC** yang dimodifikasi (tanpa View karena view ditangani React):

```
backend/
├── config/        → [Configuration] Koneksi database
├── controllers/   → [Controller]    Business logic & data processing
├── middleware/     → [Middleware]    Auth, validasi, otorisasi
├── routes/        → [Router]        Mapping URL → Controller
├── database/      → [Model/Schema]  Struktur tabel SQL
├── utils/         → [Helper]        Fungsi pendukung
├── tests/         → [Testing]       Unit test
└── server.js      → [Entry Point]   Inisialisasi Express
```

**Alasan memilih MVC:**
- **Separation of Concerns**: Setiap layer punya tanggung jawab tunggal — routes hanya memetakan URL, controllers hanya memproses logika, middleware hanya memvalidasi.
- **Mudah Di-test**: Controller bisa diuji secara independen karena terisolasi dari routing.
- **Standar Industri**: MVC adalah pola paling umum untuk REST API Express.js, sehingga mahasiswa langsung terbiasa dengan pola yang dipakai di dunia kerja.

**Alur Request Backend:**

```
Client Request
    ↓
routes/ (mapping endpoint)
    ↓
middleware/ (JWT auth + role check)
    ↓
controllers/ (business logic)
    ↓
config/db.js (query database MySQL)
    ↓
Response JSON
```

### 2. Frontend — Arsitektur Component-Based + Domain-Driven Pages

Frontend menggunakan pola **Component-Based Architecture** khas React, diperkuat dengan **pengelompokan halaman berdasarkan domain bisnis**:

```
frontend/src/
├── components/    → Komponen global (dipakai ulang di banyak halaman)
├── pages/         → Halaman dikelompokkan per domain bisnis:
│   ├── admin/           → Fitur khusus administrator
│   ├── kurir/           → Fitur tracking & manajemen kurir
│   ├── layanan/         → Fitur CRUD layanan kacamata
│   ├── detail_layanan/  → Fitur detail spesifik layanan
│   ├── pembayaran/      → Fitur pembayaran & konfirmasi
│   ├── riwayat_status_layanan/ → Fitur timeline status
│   └── user/            → Fitur sisi pelanggan
├── utils/         → Utilitas (API client, route guard)
├── App.js         → Root router & layout
└── index.js       → Entry point ReactDOM
```

**Alasan memilih Domain-Driven Pages:**
- **Navigasi Cepat**: Developer langsung tahu di mana mencari file berdasarkan fitur bisnis. Misal: bug di pembayaran → langsung buka `pages/pembayaran/`.
- **Scalable**: Menambah modul baru (misal: `pages/promo/`) tidak mengganggu modul lain.
- **Barrel Export** (`index.js`): Setiap subfolder punya `index.js` untuk re-export, sehingga import di `App.js` menjadi bersih: `import { BuatLayanan } from './pages/layanan'`.
- **Role-Based Organization**: Halaman admin, kurir, dan user dipisah, sesuai dengan sistem RBAC 3 peran.

### 3. CI/CD & DevOps

```
.github/workflows/
├── project-ci.yml  → Pipeline utama: Backend test (200 unit test) + Frontend build
└── site.yml        → Pipeline deploy ke GitHub Pages

docker-compose.yml  → Orkestrasi 3 service: backend, frontend, MySQL
vercel.json         → Konfigurasi Vercel serverless deployment
```

**Alasan:**
- **Dua workflow terpisah**: Memisahkan test/build (critical path) dari deploy (non-critical), sehingga jika deploy gagal, CI status tetap hijau.
- **Windows Runner**: Karena pengembangan dilakukan di lingkungan Windows, CI juga menggunakan `windows-latest` agar konsisten.

### 4. Dokumentasi

```
docs/
├── OptikExpress (PRD).*    → Product Requirements Document (3 format)
├── Coding_Style.md         → Konvensi koding
├── Deployment.md           → Panduan deploy
├── Pertemuan10_*.md        → Dokumentasi per pertemuan
├── Pertemuan11_*.md        → Dokumentasi per pertemuan
└── Pertemuan12_*.md        → Dokumentasi per pertemuan (dokumen ini)
```

**Alasan:**
- **Traceability**: Setiap pertemuan punya dokumentasi sendiri, memudahkan dosen melacak progress.
- **Multi-format PRD**: Disediakan `.md` (GitHub-readable), `.docx` (editable), dan `.pdf` (printable).

---

## 🔄 Diagram Arsitektur Sistem

```
┌─────────────────────────────────────────────────────┐
│                    GitHub Repository                 │
│                   (Decoupled Monorepo)               │
├──────────────────┬──────────────────────────────────┤
│                  │                                   │
│   ┌──────────────▼──────────────┐  ┌────────────────▼────────────┐
│   │      backend/ (API)         │  │     frontend/ (SPA)          │
│   │                             │  │                              │
│   │  Express.js + MySQL2        │  │  React 18 + React Router v6  │
│   │                             │  │                              │
│   │  ┌─────────┐ ┌───────────┐ │  │  ┌────────────┐ ┌─────────┐ │
│   │  │ Routes  │→│Controllers│ │  │  │ components/│ │ pages/  │ │
│   │  └─────────┘ └───────────┘ │  │  └────────────┘ └─────────┘ │
│   │       ↕            ↕       │  │       ↕              ↕       │
│   │  ┌─────────┐ ┌───────────┐ │  │  ┌────────────┐ ┌─────────┐ │
│   │  │Middleware│ │  config/  │ │  │  │  utils/    │ │  App.js │ │
│   │  └─────────┘ └───────────┘ │  │  └────────────┘ └─────────┘ │
│   │                             │  │                              │
│   │  Deploy: Vercel Serverless  │  │  Deploy: Vercel Static       │
│   └─────────────────────────────┘  └──────────────────────────────┘
│                  │                                   │
│                  └──────────┬────────────────────────┘
│                             │
│              ┌──────────────▼──────────────┐
│              │       CI/CD Pipeline        │
│              │   (.github/workflows/)      │
│              │                             │
│              │  ✅ 200 Unit Tests          │
│              │  ✅ Frontend Build          │
│              │  ✅ GitHub Pages Deploy     │
│              └─────────────────────────────┘
│
├── docs/           → 📚 Dokumentasi lengkap
├── cicd-demo/      → 🧪 Demo CI/CD pipeline
└── link web/       → 🔗 Tautan deployment
```

---

## ✅ Prinsip Arsitektur yang Diterapkan

| Prinsip | Implementasi |
|---------|-------------|
| **Separation of Concerns** | Backend dan Frontend dipisah secara fisik. Dalam backend, routes/controllers/middleware dipisah. |
| **Single Responsibility** | Setiap file memiliki satu tanggung jawab (misal: `authController.js` hanya menangani autentikasi). |
| **DRY (Don't Repeat Yourself)** | Komponen `Navbar`, `PrivateRoute`, dan `api.js` digunakan ulang di seluruh halaman. |
| **Modularitas** | Setiap domain bisnis (layanan, kurir, pembayaran) adalah modul independen dengan barrel export. |
| **Testability** | 200 unit test terorganisir dalam `backend/tests/` dengan penamaan konsisten `*.test.js`. |
| **Environment-Aware** | `.env` + `.env.example` memastikan konfigurasi sensitif tidak ter-commit. |
| **CI/CD Ready** | Workflow GitHub Actions otomatis menjalankan test dan build setiap push. |

---

## 📊 Statistik Proyek

| Metrik | Nilai |
|--------|-------|
| Total folder (non-node_modules) | ~35 folder |
| Total file backend (.js) | ~15 file |
| Total file frontend (.js) | ~25 file |
| Unit test | 200 test (11 file test) |
| Workflow CI/CD | 2 pipeline |
| Format dokumentasi | Markdown + DOCX + PDF |
| Teknologi backend | Node.js, Express.js, MySQL2, JWT, BCrypt |
| Teknologi frontend | React 18, React Router v6, Axios, Leaflet |
| Deployment | Vercel (Serverless + Static) |
| Containerisasi | Docker + Docker Compose |

---

*Dokumen ini dibuat sebagai tugas Pertemuan 12 mata kuliah Rekayasa Perangkat Lunak.*

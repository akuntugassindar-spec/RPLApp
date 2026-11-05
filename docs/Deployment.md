# 🚀 Panduan Deployment - OptikExpress

## Pertemuan 9: Deployment

**Sistem Informasi Layanan Antar-Jemput Kacamata**

---

## Arsitektur Deployment

```
┌────────────────────────────────────────────────────────┐
│                   Vercel (Hobby Free)                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  https://optikexpress.vercel.app                 │  │
│  │  ┌────────────────────┐  ┌────────────────────┐  │  │
│  │  │ React Frontend     │  │ Express.js API     │  │  │
│  │  │ (SPA Static Build) │  │ Serverless /api/*  │  │  │
│  │  └────────────────────┘  └─────────┬──────────┘  │  │
│  └────────────────────────────────────┼─────────────┘  │
└───────────────────────────────────────┼────────────────┘
                                        │ SSL/TLS (Port 4000)
                             ┌──────────▼──────────┐
                             │  TiDB Cloud         │
                             │  Serverless (Free)  │
                             │  MySQL-Compatible   │
                             └─────────────────────┘
```

**Target URL Aplikasi:** `https://optikexpress.vercel.app` (atau nama unik sesuai akun Vercel)

---

## Platform yang Digunakan

| Komponen | Platform | Biaya | Status Kartu |
|----------|----------|-------|--------------|
| Frontend & API Serverless | [Vercel](https://vercel.com) | Gratis (Hobby Tier) | ✅ **100% Tanpa Kartu Kredit** |
| Database MySQL Serverless | [TiDB Cloud](https://tidbcloud.com) | Gratis Permanen (5 GB) | ✅ **100% Tanpa Kartu Kredit** |

---

## Langkah-langkah Deployment

### 1. Database (TiDB Cloud Serverless)
*(Sudah selesai dibuat di langkah sebelumnya)*
- **Host**: `gateway01.ap-southeast-1.prod.aws.tidbcloud.com`
- **Port**: `4000`
- **Username**: `3DhRAfukqFBRegp.root`
- **Password**: `Vokfbakw3PtkoH9I`
- **Database**: `db_kacamata`
- **SSL**: `true`

---

### 2. Setup & Deploy di Vercel

1. Buka **https://vercel.com** di browser.
2. Klik **Sign Up** atau **Log In** → pilih **Continue with GitHub** (masuk dengan akun GitHub kamu).
3. Di Dashboard Vercel, klik tombol **`Add New...`** di pojok kanan atas → pilih **`Project`**.
4. Cari repository GitHub: **`akuntugassindar-spec/RPLApp`** (atau `RPLApp`), lalu klik **`Import`**.
5. Pada halaman **Configure Project**:
   - **Project Name**: `optikexpress` (atau biarkan default)
   - **Framework Preset**: biarkan **Other** (otomatis dibaca dari `vercel.json`)
   - **Root Directory**: `./` (biarkan default)
   - **Build and Output Settings**: Biarkan default (sudah dikonfigurasi lewat `vercel.json` dan `package.json`)
6. Buka menu **Environment Variables** (klik tanda panah untuk expand), lalu tambahkan key-value berikut:

| Key | Value |
|---|---|
| `DB_HOST` | `gateway01.ap-southeast-1.prod.aws.tidbcloud.com` |
| `DB_PORT` | `4000` |
| `DB_USER` | `3DhRAfukqFBRegp.root` |
| `DB_PASSWORD` | `Vokfbakw3PtkoH9I` |
| `DB_NAME` | `db_kacamata` |
| `DB_SSL` | `true` |
| `JWT_SECRET` | `super_secret_jwt_kacamata_key_2026_universitas` |
| `EMAIL_USER` | `akuntugassindar@gmail.com` |
| `EMAIL_PASS` | `jatgibxucpcgmkdx` |

7. Klik tombol biru **`Deploy`**!
8. Tunggu proses build dan deploy selama ~1-2 menit hingga muncul confetti perayaan kelulusan deploy.
9. Aplikasi kamu langsung aktif dan online di URL yang diberikan Vercel (misal: `https://optikexpress.vercel.app`).

---

## Akun Demo untuk Pengujian Reviewer

| Role | Email | Password |
|------|-------|----------|
| Administrator | `admin@optik.com` | `admin123` |
| Pelanggan | `bahrul@gmail.com` | `password123` |
| Pelanggan 2 | `siti.rahma@gmail.com` | `password123` |
| Kurir Armada | `kurir@gmail.com` | `kurir123` |

---

## Hasil Uji & Validasi Sistem (65/65 PASS ✅)

```
Test Suites: 12 passed, 12 total
Tests:       65 passed, 65 total
Snapshots:   0 total
Time:        ~2.0s
```

### Fitur yang Tervalidasi Lengkap:
- ✅ **Autentikasi & Otorisasi**: JWT Token dengan 3 Role RBAC (Admin, Pelanggan, Kurir).
- ✅ **Layanan Antar-Jemput**: Pengajuan perbaikan kacamata, ganti lensa, atau kombinasi keduanya.
- ✅ **Foto Kerusakan & Resep (Opsional)**: Validasi file gambar maksimal 5 MB.
- ✅ **Simulasi Pembayaran QRIS & VA**: Format standar Bank Indonesia EMVCo CRC16 & multi-channel.
- ✅ **Live GPS Tracking**: Penugasan armada kurir otomatis berbasis koordinat GPS Jakarta & Tangerang.
- ✅ **Histori Status & Notifikasi**: Jejak audit status pengerjaan kacamata secara real-time.

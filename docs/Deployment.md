# 🚀 Panduan Deployment - OptikExpress

## Pertemuan 9: Deployment

**Sistem Informasi Layanan Antar-Jemput Kacamata**

---

## Arsitektur Deployment

```
┌──────────────────────────────────────────────┐
│           Render (Free Tier)                 │
│  ┌────────────────────────────────────────┐  │
│  │  Web Service: optikexpress             │  │
│  │  ┌──────────┐    ┌─────────────────┐   │  │
│  │  │ React    │    │  Express.js     │   │  │
│  │  │ Frontend │◄──►│  Backend API    │   │  │
│  │  │ (build/) │    │  (server.js)    │   │  │
│  │  └──────────┘    └────────┬────────┘   │  │
│  └───────────────────────────┼────────────┘  │
└──────────────────────────────┼───────────────┘
                               │ SSL/TLS
                    ┌──────────▼──────────┐
                    │  TiDB Cloud         │
                    │  Serverless (Free)  │
                    │  MySQL-Compatible   │
                    └─────────────────────┘
```

**URL Aplikasi:** https://optikexpress.onrender.com

---

## Platform yang Digunakan

| Komponen | Platform | Plan | Biaya |
|----------|----------|------|-------|
| Backend + Frontend | [Render](https://render.com) | Free | Gratis |
| Database MySQL | [TiDB Cloud](https://tidbcloud.com) | Serverless Free | Gratis |

---

## Langkah-langkah Deployment

### 1. Setup Database (TiDB Cloud)

1. Buka https://tidbcloud.com dan daftar akun (gratis, tanpa kartu kredit)
2. Klik **Create Cluster** → pilih **Serverless** (Free Tier)
3. Pilih region: **Singapore** (terdekat dari Indonesia)
4. Tunggu cluster siap (~30 detik)
5. Klik **Connect** → pilih **General** → catat:
   - `Host` (contoh: `gateway01.ap-southeast-1.prod.aws.tidbcloud.com`)
   - `Port` (contoh: `4000`)
   - `User` (contoh: `xxxxx.root`)
   - `Password` (yang dibuat saat setup)
6. Buka **SQL Editor** di TiDB Cloud
7. Copy-paste isi file `backend/database/schema.sql` ke SQL Editor
8. **Hapus 2 baris pertama** (`CREATE DATABASE` dan `USE`) karena database sudah tersedia
9. Jalankan query → tabel dan data seed akan dibuat

### 2. Setup Web Service (Render)

1. Buka https://render.com dan daftar akun (gratis, bisa pakai akun GitHub)
2. Klik **New** → **Web Service**
3. Hubungkan repository GitHub: `https://github.com/akuntugassindar-spec/RPLApp.git`
4. Konfigurasi:
   - **Name:** `optikexpress`
   - **Region:** Singapore
   - **Branch:** `main`
   - **Runtime:** Node
   - **Build Command:** `cd frontend && npm install && npm run build && cd ../backend && npm install --production`
   - **Start Command:** `cd backend && node server.js`
   - **Plan:** Free
5. Tambahkan **Environment Variables:**

   | Key | Value |
   |-----|-------|
   | `NODE_VERSION` | `20` |
   | `NODE_ENV` | `production` |
   | `DB_HOST` | *(dari TiDB Cloud)* |
   | `DB_PORT` | *(dari TiDB Cloud, biasanya 4000)* |
   | `DB_USER` | *(dari TiDB Cloud)* |
   | `DB_PASSWORD` | *(dari TiDB Cloud)* |
   | `DB_NAME` | *(nama database di TiDB Cloud)* |
   | `DB_SSL` | `true` |
   | `JWT_SECRET` | *(buat string random panjang)* |
   | `EMAIL_USER` | *(email Gmail untuk notifikasi)* |
   | `EMAIL_PASS` | *(App Password Gmail)* |

6. Klik **Create Web Service**
7. Tunggu build selesai (~3-5 menit)
8. Akses di: **https://optikexpress.onrender.com**

---

## Akun Demo untuk Testing

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@optik.com | admin123 |
| Pelanggan | bahrul@gmail.com | password123 |
| Kurir | kurir@gmail.com | kurir123 |

---

## Hasil Build & Test

### Unit Test (65/65 Pass ✅)
```
Test Suites: 12 passed, 12 total
Tests:       65 passed, 65 total
Snapshots:   0 total
Time:        ~5s
```

### Fitur yang Tervalidasi
- ✅ Autentikasi JWT (login, register, profil)
- ✅ RBAC 3 role (admin, pelanggan, kurir)
- ✅ CRUD pesanan layanan kacamata
- ✅ Upload foto opsional (kacamata & resep, maks 5MB)
- ✅ Simulasi pembayaran QRIS
- ✅ Live GPS tracking kurir
- ✅ Riwayat status pesanan
- ✅ Notifikasi email (Nodemailer)

---

## Catatan Penting

1. **Cold Start:** Karena menggunakan Render Free Tier, server akan *sleep* setelah 15 menit tidak ada aktivitas. Akses pertama setelah *sleep* memerlukan waktu ~30-60 detik untuk *wake up*.

2. **File Upload:** Foto yang diupload disimpan di filesystem Render yang bersifat *ephemeral*. File akan hilang saat service di-redeploy. Data demo seed tetap tersedia di database.

3. **Database:** TiDB Cloud Serverless kompatibel dengan MySQL. Foreign key constraints di-parse tetapi tidak di-enforce secara default di TiDB.

---

## Teknologi Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | React.js 18, React Router 6, Axios |
| Backend | Node.js, Express.js 4, JWT |
| Database | MySQL (TiDB Cloud Serverless) |
| Hosting | Render (Free Tier) |
| Version Control | Git + GitHub |

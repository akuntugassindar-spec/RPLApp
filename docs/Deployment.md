# 🚀 Laporan & Panduan Deployment - OptikExpress

## Pertemuan 9: Deployment Aplikasi Online

**Sistem Informasi Layanan Antar-Jemput Kacamata**

---

## 🌐 Tautan Aplikasi Online (Live Production)

* **URL Utama Aplikasi:** [https://optikexpress.vercel.app](https://optikexpress.vercel.app)
* **Status Deployment:** `Ready` (Aktif & Live)
* **Hosting Platform:** Vercel (Hobby Tier - Gratis)
* **Database Platform:** TiDB Cloud Serverless (MySQL Compatible - Gratis)

---

## 🏛️ Arsitektur Sistem

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
                             │  Region: Singapore  │
                             └─────────────────────┘
```

---

## 🔑 Akun Uji Coba Reviewer / Dosen

Berikut adalah akun seed demo untuk menguji semua hak akses (Role-Based Access Control):

| Peran (Role) | Email Pengguna | Kata Sandi (Password) | Hak Akses Utama |
|---|---|---|---|
| **Administrator** | `admin@optik.com` | `admin123` | Dashboard admin, kelola pesanan, assign kurir, tracking GPS, konfirmasi pembayaran |
| **Pelanggan 1** | `bahrul@gmail.com` | `password123` | Buat pesanan, upload foto kacamata/resep, simulasi bayar QRIS/VA, lacak kurir |
| **Pelanggan 2** | `siti.rahma@gmail.com` | `password123` | Pesanan multi-layanan (lensa + perbaikan frame) |
| **Kurir Armada** | `kurir@gmail.com` | `kurir123` | Update status antar-jemput, simulasi pergerakan lokasi GPS |

---

## 🧪 Hasil Pengujian Sistem (Automated Tests)

Semua rangkaian pengujian unit test dan validasi fitur telah dijalankan dan lulus 100%:

```
Test Suites: 12 passed, 12 total
Tests:       65 passed, 65 total
Snapshots:   0 total
Time:        ~1.3s
```

### Rangkuman Fitur yang Tervalidasi:
1. **User Story #2: Autentikasi Pengguna & Keamanan JWT**
   * Validasi registrasi & login akun (Email & Password hashing bcryptjs)
   * Token JWT dengan masa aktif 24 jam & proteksi middleware
2. **User Story #3: Proteksi Otorisasi 3-Role (Admin, Pelanggan, Kurir)**
   * Middleware `auth`, `adminAuth`, dan `staffAuth`
3. **User Story #4: Rincian Teknis Kacamata (CRUD Detail Layanan)**
   * Frame logam, jenis lensa optik, resep dokter, dan riwayat perbaikan
4. **Fitur Unggah Foto Kacamata & Resep Optik (Opsional)**
   * Validasi tipe berkas gambar (JPG, PNG, WebP) dan batasan ukuran 5 MB
   * Penanganan gracefully saat pengguna memilih untuk tidak melampirkan foto
5. **User Story #5: Payment Gateway Multi-Channel & QRIS Bank Indonesia**
   * Format EMVCo CRC16 validasi standar QRIS Bank Indonesia
   * Dukungan simulasi BCA VA, GoPay, OVO, ShopeePay, DANA, dan COD
6. **Live Tracking Kurir & Algoritma Penugasan Cerdas**
   * Auto-assign armada kurir Jakarta & Tangerang terdekat (< 1.5 km)
   * Estimasi waktu tiba (ETA) dan pergerakan koordinat GPS real-time

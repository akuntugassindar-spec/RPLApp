# Backend API - Sistem Informasi Layanan Antar-Jemput Kacamata

Backend RESTful API berbasis **Node.js**, **Express.js**, dan **MySQL** untuk aplikasi pelayanan servis dan penggantian lensa kacamata antar-jemput.

---

## 🛠️ Persyaratan Sistem
- **Node.js** (versi >= 16.x)
- **MySQL** / **MariaDB** (melalui XAMPP, Laragon, atau MySQL Server standalone)
- **npm** (Node Package Manager)

---

## 🚀 Panduan Instalasi & Menjalankan Server

### 1. Masuk ke Direktori Backend
```bash
cd backend
```

### 2. Pasang Dependencies
```bash
npm install
```

### 3. Konfigurasi Basis Data (MySQL)
1. Buka phpMyAdmin atau MySQL CLI.
2. Impor berkas SQL dari direktori:
   ```text
   backend/database/schema.sql
   ```
   *Skrip ini akan otomatis membuat basis data `db_kacamata`, tabel `users`, `layanan`, `detail_layanan`, serta akun default admin.*

### 4. Konfigurasi File Environment (.env)
Pastikan berkas `.env` sudah sesuai dengan pengaturan server MySQL lokal Anda:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=db_kacamata
DB_PORT=3306
JWT_SECRET=super_secret_jwt_kacamata_key_2026_universitas
JWT_EXPIRES_IN=24h
```

### 5. Jalankan Server
- **Mode Development (Hot-Reload dengan Nodemon):**
  ```bash
  npm run dev
  ```
- **Mode Produksi:**
  ```bash
  npm start
  ```

Server akan aktif di: `http://localhost:5000`

---

## 🔑 Akun Default untuk Pengujian

| Peran | Email / Nama | Password / No. WA | Keterangan |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@optik.com` | `admin123` | Hak akses penuh, kelola biaya & status kurir |
| **Pelanggan 1** | `bahrul@gmail.com` | `admin123` | Pelanggan terdaftar dengan riwayat pesanan |
| **Pelanggan 2** | `siti.rahma@gmail.com` | `admin123` | Pelanggan dengan pesanan aktif sedang diantar |
| **Kurir 1** | `Agus Pratama` | `081234567890` | Armada Honda Vario 160 (L 4589 AB) |
| **Kurir 2** | `Bambang Wijaya` | `081398765432` | Armada Yamaha NMAX (L 3120 XY) |
| **Kurir 3** | `Rian Kurniawan` | `085712348765` | Armada Honda Beat Street (L 6742 OP) |

---

## 🗄️ Struktur Basis Data Relasional (`db_kacamata`)

1. `users` — Data akun pengguna & role (`admin`, `pelanggan`).
2. `kurir` — Master armada driver optik internal (nama, no. telepon, plat nomor, kendaraan, status aktif, koordinat GPS).
3. `layanan` — Transaksi layanan servis, status operasional, foto kacamata/resep, total biaya, status pembayaran, dan data penugasan kurir.
4. `detail_layanan` — Rincian teknis kacamata (jenis frame, detail ukuran minus/silinder, catatan pelanggan).
5. `pembayaran` — Pencatatan log transaksi payment gateway (QRIS dinamis, Virtual Account Bank, GoPay/ShopeePay, COD).
6. `riwayat_status_layanan` — Audit trail log histori setiap perubahan status dan koordinat kurir.

---

## 📡 Daftar Endpoint API

### 1. Autentikasi (`/api/auth`)
- `POST /api/auth/register` - Mendaftarkan pelanggan baru
  - Body: `{ "nama", "email", "password", "no_telepon" }`
- `POST /api/auth/login` - Masuk dan mendapatkan JWT Token
  - Body: `{ "email", "password" }`
- `GET /api/auth/me` - Mendapatkan data akun yang sedang login *(Header: `Authorization: Bearer <token>`)*

### 2. Layanan Antar-Jemput (`/api/layanan`) *(Perlu Auth)*
- `GET /api/layanan` - Menampilkan daftar layanan (Admin melihat semua, Pelanggan melihat miliknya)
- `GET /api/layanan/:id` - Detail spesifik pengajuan layanan
- `POST /api/layanan` - Mengajukan pesanan antar-jemput baru
  - Body: `{ "jenis_layanan", "keluhan", "alamat", "tanggal_jemput", "jam_jemput", "jenis_kacamata", "detail_perbaikan", "keterangan", "foto_kacamata", "foto_resep" }`
- `PUT /api/layanan/:id/status` - Memperbarui status pengerjaan, biaya, & kurir *(Khusus Admin)*
  - Pilihan status: `'pengajuan'`, `'dijadwalkan'`, `'diambil'`, `'diproses'`, `'selesai'`, `'diantar'`
- `POST /api/layanan/:id/pembayaran` - Inisialisasi payment gateway (QRIS, VA Bank, GoPay, COD)
- `POST /api/layanan/:id/pembayaran/konfirmasi` - Konfirmasi transaksi lunas
- `GET /api/layanan/:id/tracking` - Pelacakan langsung kurir live GPS radar & estimasi tiba
- `PUT /api/layanan/:id/tracking` - Update koordinat & status perjalanan kurir *(Khusus Admin)*
- `DELETE /api/layanan/:id` - Membatalkan / menghapus layanan

### 3. Detail Layanan (`/api/detail-layanan`) *(Perlu Auth)*
- `GET /api/detail-layanan/layanan/:layanan_id` - Menampilkan detail kacamata pada layanan
- `GET /api/detail-layanan/:id` - Mengambil detail kacamata berdasarkan ID
- `POST /api/detail-layanan` - Menambahkan detail baru ke layanan
- `PUT /api/detail-layanan/:id` - Memperbarui rincian detail kacamata
- `DELETE /api/detail-layanan/:id` - Menghapus detail kacamata


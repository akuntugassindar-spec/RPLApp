# 🏗️ Arsitektur Sistem & Spesifikasi Basis Data

## 1. Arsitektur Perangkat Lunak (3-Tier Architecture)

OptikExpress dibangun menggunakan pendekatan arsitektur **3-Tier Client-Server**:

```
+--------------------------------------------------------------+
|                    PRESENTATION LAYER                        |
|   React.js 18 (Single Page Application)                      |
|   - Routing: React Router DOM v6 (Private Routes & Guards)   |
|   - State Management: React Hooks (useState, useEffect)      |
|   - Maps: Leaflet OpenStreetMap + Custom DivIcons & Polyline |
|   - HTTP Client: Axios dengan Interceptor JWT Token          |
+--------------------------------------------------------------+
                               |
                               | REST API (JSON via HTTP)
                               v
+--------------------------------------------------------------+
|                     APPLICATION LAYER                        |
|   Node.js & Express.js RESTful API                           |
|   - Middleware: JWT Authentication (Bearer Token)            |
|   - Authorization: Role-Based Access Control (Admin / User)  |
|   - Service Dispatcher: Auto-Assign Courier Engine           |
|   - Payment Mock Engine: Midtrans Sandbox Simulation         |
|   - Notifications: Nodemailer (SMTP) & WhatsApp Logger       |
+--------------------------------------------------------------+
                               |
                               | SQL Queries (mysql2/promise)
                               v
+--------------------------------------------------------------+
|                       DATA LAYER                             |
|   MySQL / MariaDB RDBMS (Database: db_kacamata)              |
|   - InnoDB Engine dengan Foreign Key Constraints             |
|   - 6 Normalized Tables (3NF)                                |
|   - Auto-Migration on Boot (ensureTableColumns)              |
+--------------------------------------------------------------+
```

---

## 2. Diagram Hubungan Entitas (ERD 6 Tabel Relasional)

```mermaid
erDiagram
    users ||--o{ layanan : "membuat"
    layanan ||--o| detail_layanan : "memiliki rincian"
    layanan ||--o{ pembayaran : "memiliki transaksi"
    layanan ||--o{ riwayat_status_layanan : "mencatat jejak"
    kurir ||--o{ layanan : "ditugaskan mengantar"

    users {
        int id PK
        string nama
        string email UK
        string password
        enum role "admin, pelanggan"
        string no_telepon
        timestamp created_at
    }

    kurir {
        int id PK
        string nama
        string no_telepon
        string jenis_kendaraan
        string plat_nomor
        enum status_aktif "aktif, istirahat, nonaktif"
        decimal current_lat
        decimal current_lng
        timestamp created_at
    }

    layanan {
        int id PK
        int user_id FK
        enum jenis_layanan "perbaikan, penggantian_lensa, perbaikan_dan_lensa"
        text keluhan
        text alamat
        date tanggal_jemput
        time jam_jemput
        enum status "pengajuan, dijadwalkan, diambil, diproses, selesai, diantar"
        string foto_kacamata
        string foto_resep
        int total_biaya
        enum status_pembayaran "belum_bayar, menunggu_pembayaran, lunas"
        string metode_pembayaran
        string id_transaksi_pembayaran
        text catatan_admin
        string kurir_nama
        string kurir_telepon
        decimal kurir_lat
        decimal kurir_lng
        string tracking_status
        timestamp created_at
    }

    detail_layanan {
        int id PK
        int layanan_id FK
        string jenis_kacamata
        text detail_perbaikan
        text keterangan
    }

    pembayaran {
        int id PK
        int layanan_id FK
        string id_transaksi UK
        string metode_pembayaran
        int nominal
        enum status_pembayaran "menunggu_pembayaran, lunas, kedaluwarsa, batal"
        string qr_code_url
        string va_number
        timestamp waktu_pembayaran
        timestamp created_at
    }

    riwayat_status_layanan {
        int id PK
        int layanan_id FK
        string status_sebelumnya
        string status_baru
        text catatan
        decimal kurir_lat
        decimal kurir_lng
        string diperbarui_oleh
        timestamp created_at
    }
```

---

## 3. Siklus Operasional Layanan (Finite State Machine)

Setiap pesanan perbaikan kacamata bergerak secara sekuensial mengikuti aturan alur kerja bisnis:

```
[ pengajuan ] ──> Pelanggan membuat pesanan servis & upload foto kacamata/resep
      │
      ▼
[ dijadwalkan ] ─> Admin verifikasi & sistem auto-assign kurir dari armada optik
      │
      ▼
[   diambil   ] ─> Kurir meluncur ke rumah pelanggan untuk menjemput frame kacamata
      │
      ▼
[  diproses   ] ─> Kacamata tiba di lab optik, teknisi memperbaiki & ganti lensa
      │
      ▼
[   diantar   ] ─> Pengerjaan tuntas, kurir mengantar kembali (Live GPS tracking aktif)
      │
      ▼
[   selesai   ] ─> Kacamata diterima pelanggan, transaksi selesai (LUNAS)
```

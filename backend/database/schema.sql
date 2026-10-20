-- ====================================================================
-- SKEMA BASIS DATA: SISTEM INFORMASI LAYANAN ANTAR-JEMPUT KACAMATA
-- Database Management System: MySQL / MariaDB (InnoDB Engine)
-- Deskripsi: Mengelola siklus operasional antar-jemput kacamata,
--            autentikasi pengguna, rincian teknis kacamata/lensa optik,
--            armada kurir & pelacakan live GPS, log histori status,
--            serta transaksi payment gateway multi-metode.
-- ====================================================================

-- 1. PEMBUATAN & PENGGUNAAN DATABASE
CREATE DATABASE IF NOT EXISTS db_kacamata;
USE db_kacamata;

-- ====================================================================
-- 2. TABEL PENGGUNA (USERS)
-- Menyimpan informasi akun pengguna (Pelanggan dan Administrator Optik)
-- ====================================================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('pelanggan', 'admin', 'kurir') DEFAULT 'pelanggan',
    no_telepon VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 3. TABEL ARMADA KURIR (KURIR)
-- Menyimpan daftar kurir optik internal (in-house rider) untuk auto-assign
-- ====================================================================
CREATE TABLE IF NOT EXISTS kurir (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    no_telepon VARCHAR(20) NOT NULL,
    jenis_kendaraan VARCHAR(100) DEFAULT 'Sepeda Motor',
    plat_nomor VARCHAR(20) DEFAULT NULL,
    status_aktif ENUM('aktif', 'istirahat', 'nonaktif') DEFAULT 'aktif',
    current_lat DECIMAL(10,8) DEFAULT -7.26250000,
    current_lng DECIMAL(11,8) DEFAULT 112.74850000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 4. TABEL TRANSAKSI LAYANAN (LAYANAN)
-- Menyimpan permintaan servis kacamata, jadwal, biaya, kurir, & GPS
-- ====================================================================
CREATE TABLE IF NOT EXISTS layanan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    jenis_layanan ENUM('perbaikan', 'penggantian_lensa', 'perbaikan_dan_lensa') NOT NULL,
    keluhan TEXT NOT NULL,
    alamat TEXT NOT NULL,
    tanggal_jemput DATE NOT NULL,
    jam_jemput TIME NOT NULL,
    status ENUM('pengajuan', 'dijadwalkan', 'diambil', 'diproses', 'selesai', 'diantar') DEFAULT 'pengajuan',
    foto_kacamata VARCHAR(255) DEFAULT NULL,
    foto_resep VARCHAR(255) DEFAULT NULL,
    total_biaya INT DEFAULT 0,
    status_pembayaran ENUM('belum_bayar', 'menunggu_pembayaran', 'lunas') DEFAULT 'belum_bayar',
    metode_pembayaran VARCHAR(50) DEFAULT NULL,
    id_transaksi_pembayaran VARCHAR(100) DEFAULT NULL,
    catatan_admin TEXT DEFAULT NULL,
    kurir_nama VARCHAR(100) DEFAULT NULL,
    kurir_telepon VARCHAR(20) DEFAULT NULL,
    kurir_lat DECIMAL(10,8) DEFAULT NULL,
    kurir_lng DECIMAL(11,8) DEFAULT NULL,
    tracking_status VARCHAR(100) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_layanan_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 5. TABEL DETAIL TEKNIS KACAMATA (DETAIL_LAYANAN)
-- Menyimpan rincian spesifikasi kacamata yang diperbaiki/diganti lensanya
-- ====================================================================
CREATE TABLE IF NOT EXISTS detail_layanan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    layanan_id INT NOT NULL,
    jenis_kacamata VARCHAR(100) NOT NULL,
    detail_perbaikan TEXT,
    keterangan TEXT,
    CONSTRAINT fk_detail_layanan FOREIGN KEY (layanan_id) REFERENCES layanan(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 6. TABEL RIWAYAT TRANSAKSI PEMBAYARAN (PEMBAYARAN)
-- Pencatatan log transaksi payment gateway (QRIS, VA Bank, e-Wallet, COD)
-- ====================================================================
CREATE TABLE IF NOT EXISTS pembayaran (
    id INT AUTO_INCREMENT PRIMARY KEY,
    layanan_id INT NOT NULL,
    id_transaksi VARCHAR(100) NOT NULL UNIQUE,
    metode_pembayaran VARCHAR(50) NOT NULL,
    nominal INT NOT NULL,
    status_pembayaran ENUM('menunggu_pembayaran', 'lunas', 'kedaluwarsa', 'batal') DEFAULT 'menunggu_pembayaran',
    qr_code_url VARCHAR(255) DEFAULT NULL,
    va_number VARCHAR(50) DEFAULT NULL,
    waktu_pembayaran TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pembayaran_layanan FOREIGN KEY (layanan_id) REFERENCES layanan(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 7. TABEL AUDIT LOG STATUS & TRACKING (RIWAYAT_STATUS_LAYANAN)
-- Mencatat jejak riwayat perubahan status pengerjaan pesanan kacamata
-- ====================================================================
CREATE TABLE IF NOT EXISTS riwayat_status_layanan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    layanan_id INT NOT NULL,
    status_sebelumnya VARCHAR(50) DEFAULT NULL,
    status_baru VARCHAR(50) NOT NULL,
    catatan TEXT,
    kurir_lat DECIMAL(10,8) DEFAULT NULL,
    kurir_lng DECIMAL(11,8) DEFAULT NULL,
    diperbarui_oleh VARCHAR(100) DEFAULT 'Sistem',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_riwayat_layanan FOREIGN KEY (layanan_id) REFERENCES layanan(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ====================================================================
-- DATA AWAL LENGKAP (SEED DATA DEMO)
-- ====================================================================

-- 1. Akun Pengguna Default (Demo: admin123, password123, kurir123)
INSERT INTO users (id, nama, email, password, role, no_telepon)
VALUES 
    (1, 'Administrator Optik', 'admin@optik.com', '$2a$10$dn.qn0EsFGpGqtAxHT4PeuwQwxAZRw2G7gLKAif3KzNNxau6aEi9W', 'admin', '081234567890'),
    (2, 'Bahrul Ulum', 'bahrul@gmail.com', '$2a$10$Nq9vPYR.P0lGv7UytE7WLeY.kS4OmtNRn/0Bsx9Ti0S2xn.amr.SG', 'pelanggan', '089876543210'),
    (3, 'Siti Rahmawati', 'siti.rahma@gmail.com', '$2a$10$Nq9vPYR.P0lGv7UytE7WLeY.kS4OmtNRn/0Bsx9Ti0S2xn.amr.SG', 'pelanggan', '085612345678'),
    (4, 'Agus Pratama (Kurir Optik)', 'kurir@gmail.com', '$2a$10$o8623Y1hEdu7HWhSJIVFhOOaKax//3XT0SSauvqm8XTIXxM4kRy6.', 'kurir', '081234567890')
ON DUPLICATE KEY UPDATE 
    nama = VALUES(nama),
    role = VALUES(role),
    password = VALUES(password);

-- 2. Master Armada Kurir Internal Optik
INSERT INTO kurir (id, nama, no_telepon, jenis_kendaraan, plat_nomor, status_aktif, current_lat, current_lng)
VALUES 
    (1, 'Agus Pratama', '081234567890', 'Honda Vario 160', 'L 4589 AB', 'aktif', -7.26250000, 112.74850000),
    (2, 'Bambang Wijaya', '081398765432', 'Yamaha NMAX', 'L 3120 XY', 'aktif', -7.26800000, 112.75500000),
    (3, 'Rian Kurniawan', '085712348765', 'Honda Beat Street', 'L 6742 OP', 'aktif', -7.27500000, 112.77000000)
ON DUPLICATE KEY UPDATE 
    nama = VALUES(nama),
    no_telepon = VALUES(no_telepon),
    jenis_kendaraan = VALUES(jenis_kendaraan),
    plat_nomor = VALUES(plat_nomor);

-- 3. Transaksi Layanan 1 (Status: Dijadwalkan, Menunggu Pembayaran QRIS)
INSERT INTO layanan (
    id, user_id, jenis_layanan, keluhan, alamat, tanggal_jemput, jam_jemput,
    status, total_biaya, status_pembayaran, metode_pembayaran, id_transaksi_pembayaran,
    kurir_nama, kurir_telepon, kurir_lat, kurir_lng, tracking_status
)
VALUES (
    1,
    2,
    'perbaikan',
    'Gagang kacamata sebelah kiri patah pada bagian engsel sambungan.',
    'Jl. Sukolilo Indah No. 45, Kota Surabaya',
    CURDATE() + INTERVAL 1 DAY,
    '10:00:00',
    'dijadwalkan',
    150000,
    'menunggu_pembayaran',
    'qris',
    'MIDTRANS-DEMO-001',
    'Agus Pratama',
    '081234567890',
    -7.26600000,
    112.75500000,
    'Kurir telah ditugaskan dan bersiap meluncur ke alamat Anda.'
) ON DUPLICATE KEY UPDATE id = id;

INSERT INTO detail_layanan (id, layanan_id, jenis_kacamata, detail_perbaikan, keterangan)
VALUES (
    1,
    1,
    'Frame Logam Titanium Half-Rim',
    'Penggantian dan pematrian engsel gagang sebelah kiri dengan suku cadang original.',
    'Mohon kurir membawa kotak pengaman kacamata saat penjemputan.'
) ON DUPLICATE KEY UPDATE id = id;

-- 4. Transaksi Layanan 2 (Status: Diproses di Lab Optik, Pembayaran Lunas BCA VA)
INSERT INTO layanan (
    id, user_id, jenis_layanan, keluhan, alamat, tanggal_jemput, jam_jemput,
    status, total_biaya, status_pembayaran, metode_pembayaran, id_transaksi_pembayaran,
    kurir_nama, kurir_telepon, kurir_lat, kurir_lng, tracking_status
)
VALUES (
    2,
    2,
    'penggantian_lensa',
    'Lensa minus buram dan tergores parah, ingin ganti lensa anti radiasi blueray.',
    'Jl. Sukolilo Indah No. 45, Kota Surabaya',
    CURDATE() - INTERVAL 1 DAY,
    '14:30:00',
    'diproses',
    280000,
    'lunas',
    'bca_va',
    'MIDTRANS-DEMO-002',
    'Bambang Wijaya',
    '081398765432',
    -7.26250000,
    112.74850000,
    'Kacamata telah sampai di lab optik dan sedang dipasang lensa baru oleh teknisi.'
) ON DUPLICATE KEY UPDATE id = id;

INSERT INTO detail_layanan (id, layanan_id, jenis_kacamata, detail_perbaikan, keterangan)
VALUES (
    2,
    2,
    'Frame Asetat Rayban Wayfarer Hitam',
    'Pasang Lensa Single Vision Blueray Anti Radiasi (R: -2.00 Cyl -0.50, L: -1.75 Cyl -0.75)',
    'Resep pemeriksaan optik terbaru sudah dikonfirmasi valid.'
) ON DUPLICATE KEY UPDATE id = id;

-- 5. Transaksi Layanan 3 (Status: Sedang Diantar ke Pelanggan, Live GPS Aktif)
INSERT INTO layanan (
    id, user_id, jenis_layanan, keluhan, alamat, tanggal_jemput, jam_jemput,
    status, total_biaya, status_pembayaran, metode_pembayaran, id_transaksi_pembayaran,
    kurir_nama, kurir_telepon, kurir_lat, kurir_lng, tracking_status
)
VALUES (
    3,
    3,
    'perbaikan_dan_lensa',
    'Nosepad kacamata copot dan ingin ganti lensa Photocromic Grey.',
    'Jl. Rungkut Madya No. 88, Kota Surabaya',
    CURDATE() - INTERVAL 2 DAY,
    '09:00:00',
    'diantar',
    220000,
    'lunas',
    'gopay',
    'MIDTRANS-DEMO-003',
    'Rian Kurniawan',
    '085712348765',
    -7.27500000,
    112.77000000,
    'Kacamata selesai diperbaiki dan kurir sedang menuju ke alamat Anda.'
) ON DUPLICATE KEY UPDATE id = id;

INSERT INTO detail_layanan (id, layanan_id, jenis_kacamata, detail_perbaikan, keterangan)
VALUES (
    3,
    3,
    'Frame Bulat Vintage Gold',
    'Penggantian sepasang nosepad silikon premium + pasang lensa Photocromic Grey.',
    'Kacamata sudah di-sterilisasi sinar UV sebelum dikemas.'
) ON DUPLICATE KEY UPDATE id = id;

-- 6. Log Riwayat Pembayaran (Tabel Pembayaran)
INSERT INTO pembayaran (id, layanan_id, id_transaksi, metode_pembayaran, nominal, status_pembayaran, qr_code_url, waktu_pembayaran)
VALUES 
    (1, 1, 'MIDTRANS-DEMO-001', 'qris', 150000, 'menunggu_pembayaran', 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=OPTIKEXPRESS-PAYMENT-MIDTRANS-DEMO-001', NULL),
    (2, 2, 'MIDTRANS-DEMO-002', 'bca_va', 280000, 'lunas', NULL, NOW() - INTERVAL 1 DAY),
    (3, 3, 'MIDTRANS-DEMO-003', 'gopay', 220000, 'lunas', NULL, NOW() - INTERVAL 2 DAY)
ON DUPLICATE KEY UPDATE id_transaksi = id_transaksi;

-- 7. Audit Log Perubahan Status (Tabel Riwayat Status)
INSERT INTO riwayat_status_layanan (id, layanan_id, status_sebelumnya, status_baru, catatan, kurir_lat, kurir_lng, diperbarui_oleh)
VALUES 
    (1, 1, 'pengajuan', 'dijadwalkan', 'Pesanan diverifikasi admin, kurir Agus ditugaskan', -7.26250000, 112.74850000, 'Administrator Optik'),
    (2, 2, 'diambil', 'diproses', 'Kacamata masuk antrean laboratorium teknisi optik', -7.26250000, 112.74850000, 'Teknisi Optik'),
    (3, 3, 'diproses', 'diantar', 'Pengerjaan selesai, kurir Rian membawa pesanan ke pelanggan', -7.27500000, 112.77000000, 'Administrator Optik')
ON DUPLICATE KEY UPDATE id = id;

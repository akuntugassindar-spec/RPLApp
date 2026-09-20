-- ====================================================================
-- SKEMA BASIS DATA: SISTEM INFORMASI LAYANAN ANTAR-JEMPUT KACAMATA
-- Database: MySQL / MariaDB
-- Deskripsi: Mengelola data pengguna, pengajuan layanan antar-jemput,
--            serta detail teknis perbaikan kacamata dan penggantian lensa.
-- ====================================================================

-- 1. PEMBUATAN DATABASE
CREATE DATABASE IF NOT EXISTS db_kacamata;
USE db_kacamata;

-- 2. STRUKTUR TABEL: USERS
-- Menyimpan informasi akun pengguna baik pelanggan maupun administrator
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('pelanggan', 'admin') DEFAULT 'pelanggan',
    no_telepon VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. STRUKTUR TABEL: LAYANAN
-- Menyimpan transaksi pengajuan servis kacamata (antar-jemput)
CREATE TABLE IF NOT EXISTS layanan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    jenis_layanan ENUM('perbaikan', 'penggantian_lensa') NOT NULL,
    keluhan TEXT NOT NULL,
    alamat TEXT NOT NULL,
    tanggal_jemput DATE NOT NULL,
    jam_jemput TIME NOT NULL,
    status ENUM('pengajuan', 'dijadwalkan', 'diambil', 'diproses', 'selesai', 'diantar') DEFAULT 'pengajuan',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_layanan_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. STRUKTUR TABEL: DETAIL_LAYANAN
-- Menyimpan rincian spesifikasi kacamata yang diperbaiki atau diganti lensanya
CREATE TABLE IF NOT EXISTS detail_layanan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    layanan_id INT NOT NULL,
    jenis_kacamata VARCHAR(100) NOT NULL,
    detail_perbaikan TEXT,
    keterangan TEXT,
    CONSTRAINT fk_detail_layanan FOREIGN KEY (layanan_id) REFERENCES layanan(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- DATA AWAL (SEED DATA)
-- ====================================================================

-- Akun Administrator Optik Default
-- Email: admin@optik.com
-- Password: admin123 (Terenkripsi BCrypt)
-- Hash: $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
INSERT INTO users (id, nama, email, password, role, no_telepon)
VALUES (
    1,
    'Administrator Optik',
    'admin@optik.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'admin',
    '081234567890'
) ON DUPLICATE KEY UPDATE 
    nama = VALUES(nama),
    role = VALUES(role),
    password = VALUES(password);

-- Akun Contoh Pelanggan untuk Pengujian Sistem
-- Email: bahrul@gmail.com
-- Password: admin123
INSERT INTO users (id, nama, email, password, role, no_telepon)
VALUES (
    2,
    'Bahrul Ulum',
    'bahrul@gmail.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'pelanggan',
    '089876543210'
) ON DUPLICATE KEY UPDATE 
    nama = VALUES(nama),
    role = VALUES(role);

-- Contoh Transaksi Layanan 1 (Perbaikan Gagang Patah)
INSERT INTO layanan (id, user_id, jenis_layanan, keluhan, alamat, tanggal_jemput, jam_jemput, status)
VALUES (
    1,
    2,
    'perbaikan',
    'Gagang kacamata sebelah kiri patah pada bagian engsel sambungan.',
    'Jl. Sukolilo Indah No. 45, Kota Surabaya',
    CURDATE() + INTERVAL 1 DAY,
    '10:00:00',
    'pengajuan'
) ON DUPLICATE KEY UPDATE id = id;

-- Contoh Detail Layanan 1
INSERT INTO detail_layanan (id, layanan_id, jenis_kacamata, detail_perbaikan, keterangan)
VALUES (
    1,
    1,
    'Frame Logam Titanium Half-Rim',
    'Penggantian dan pematrian engsel gagang sebelah kiri dengan suku cadang original.',
    'Mohon kurir membawa kotak pengaman saat penjemputan.'
) ON DUPLICATE KEY UPDATE id = id;

-- Contoh Transaksi Layanan 2 (Penggantian Lensa Silinder)
INSERT INTO layanan (id, user_id, jenis_layanan, keluhan, alamat, tanggal_jemput, jam_jemput, status)
VALUES (
    2,
    2,
    'penggantian_lensa',
    'Lensa minus buram dan tergores parah, ingin ganti lensa anti radiasi blueray.',
    'Jl. Sukolilo Indah No. 45, Kota Surabaya',
    CURDATE() + INTERVAL 2 DAY,
    '14:30:00',
    'diproses'
) ON DUPLICATE KEY UPDATE id = id;

-- Contoh Detail Layanan 2
INSERT INTO detail_layanan (id, layanan_id, jenis_kacamata, detail_perbaikan, keterangan)
VALUES (
    2,
    2,
    'Frame Asetat Rayban Wayfarer Hitam',
    'Pasang Lensa Single Vision Blueray Anti Radiasi (R: -2.00 Cyl -0.50, L: -1.75 Cyl -0.75)',
    'Resep optik terbaru telah dilampirkan.'
) ON DUPLICATE KEY UPDATE id = id;

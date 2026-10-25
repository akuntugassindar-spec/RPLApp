/**
 * Konfigurasi Koneksi Database MySQL
 * Menggunakan mysql2/promise untuk mendukung async/await secara native
 */

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Muat variabel lingkungan dari file .env
const path = require('path');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Buat pool koneksi database MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'db_kacamata',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Fungsi untuk memastikan kolom-kolom fitur baru telah tersedia pada tabel
const ensureTableColumns = async (connection) => {
  const columnsToAdd = [
    { name: 'foto_kacamata', type: 'VARCHAR(255) DEFAULT NULL' },
    { name: 'foto_resep', type: 'VARCHAR(255) DEFAULT NULL' },
    { name: 'total_biaya', type: 'INT DEFAULT 0' },
    { name: 'status_pembayaran', type: "ENUM('belum_bayar', 'menunggu_pembayaran', 'lunas') DEFAULT 'belum_bayar'" },
    { name: 'metode_pembayaran', type: 'VARCHAR(50) DEFAULT NULL' },
    { name: 'id_transaksi_pembayaran', type: 'VARCHAR(100) DEFAULT NULL' },
    { name: 'catatan_admin', type: 'TEXT DEFAULT NULL' },
    { name: 'kurir_nama', type: 'VARCHAR(100) DEFAULT NULL' },
    { name: 'kurir_telepon', type: 'VARCHAR(20) DEFAULT NULL' },
    { name: 'kurir_lat', type: 'DECIMAL(10,8) DEFAULT NULL' },
    { name: 'kurir_lng', type: 'DECIMAL(11,8) DEFAULT NULL' },
    { name: 'tracking_status', type: 'VARCHAR(100) DEFAULT NULL' },
  ];

  for (const col of columnsToAdd) {
    try {
      await connection.query(`ALTER TABLE layanan ADD COLUMN ${col.name} ${col.type}`);
    } catch (err) {
      // Error code 1060 / ER_DUP_FIELDNAME diabaikan karena kolom sudah ada
      if (err.errno !== 1060 && err.code !== 'ER_DUP_FIELDNAME') {
        // Kolom belum ada atau error lainnya
      }
    }
  }

  // Pastikan tabel pendukung (kurir, pembayaran, riwayat_status_layanan) telah tersedia
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS kurir (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama VARCHAR(100) NOT NULL,
        no_telepon VARCHAR(20) NOT NULL,
        jenis_kendaraan VARCHAR(100) DEFAULT 'Sepeda Motor',
        plat_nomor VARCHAR(20) DEFAULT NULL,
        status_aktif ENUM('aktif', 'istirahat', 'nonaktif') DEFAULT 'aktif',
        current_lat DECIMAL(10,8) DEFAULT -6.20880000,
        current_lng DECIMAL(11,8) DEFAULT 106.84560000,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
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
    `);

    await connection.query(`
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
    `);
  } catch (tableErr) {
    // Abaikan jika tabel sudah ada atau ada constraint issue
  }

  // Pastikan role enum pada tabel users mendukung 'kurir'
  try {
    await connection.query("ALTER TABLE users MODIFY COLUMN role ENUM('pelanggan', 'admin', 'kurir') DEFAULT 'pelanggan'");
  } catch (err) {}

  // Pastikan akun seed demo kurir (kurir123) selalu tersedia dan ter-update
  try {
    const kurirHash = '$2a$10$o8623Y1hEdu7HWhSJIVFhOOaKax//3XT0SSauvqm8XTIXxM4kRy6.'; // bcrypt hash for 'kurir123'
    const adminHash = '$2a$10$dn.qn0EsFGpGqtAxHT4PeuwQwxAZRw2G7gLKAif3KzNNxau6aEi9W'; // bcrypt hash for 'admin123'
    const userHash  = '$2a$10$Nq9vPYR.P0lGv7UytE7WLeY.kS4OmtNRn/0Bsx9Ti0S2xn.amr.SG'; // bcrypt hash for 'password123'

    const [kurirRows] = await connection.query("SELECT id FROM users WHERE email = 'kurir@gmail.com'");
    if (kurirRows.length === 0) {
      await connection.query(`
        INSERT INTO users (nama, email, password, role, no_telepon)
        VALUES ('Agus Pratama (Kurir Optik)', 'kurir@gmail.com', ?, 'kurir', '081234567890')
      `, [kurirHash]);
    } else {
      await connection.query("UPDATE users SET password = ?, role = 'kurir' WHERE email = 'kurir@gmail.com'", [kurirHash]);
    }

    // Pastikan admin@optik.com dan pelanggan dapat login dengan password demo dokumentasi
    await connection.query("UPDATE users SET password = ? WHERE email = 'admin@optik.com'", [adminHash]);
    await connection.query("UPDATE users SET password = ? WHERE email IN ('pelanggan@gmail.com', 'bahrul@gmail.com')", [userHash]);

    // Sinkronisasi otomatis armada kurir ke Plat B resmi Jakarta & Tangerang
    await connection.query("UPDATE kurir SET plat_nomor = 'B 4589 AB', current_lat = -6.22050000, current_lng = 106.82700000 WHERE id = 1 OR nama LIKE '%Agus%'");
    await connection.query("UPDATE kurir SET plat_nomor = 'B 3120 TNG', current_lat = -6.17830000, current_lng = 106.63190000 WHERE id = 2 OR nama LIKE '%Bambang%'");
    await connection.query("UPDATE kurir SET plat_nomor = 'B 6742 BSD', current_lat = -6.30160000, current_lng = 106.65340000 WHERE id = 3 OR nama LIKE '%Rian%'");
    await connection.query("UPDATE kurir SET plat_nomor = REPLACE(plat_nomor, 'L ', 'B ') WHERE plat_nomor LIKE 'L %'");
    await connection.query("UPDATE layanan SET tracking_status = REPLACE(tracking_status, 'Surabaya', 'Jakarta & Tangerang') WHERE tracking_status LIKE '%Surabaya%'");
    await connection.query("UPDATE kurir SET plat_nomor = REPLACE(plat_nomor, 'XY', 'TNG') WHERE plat_nomor LIKE '%XY%'");
    await connection.query("UPDATE layanan SET kurir_lat = -6.22050000, kurir_lng = 106.82700000 WHERE kurir_lat < -7.0");
  } catch (err) {}
};


// Fungsi untuk menguji koneksi ke database saat server dijalankan
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log(`[Database] Berhasil terhubung ke database MySQL: ${process.env.DB_NAME || 'db_kacamata'}`);
    await ensureTableColumns(connection);
    connection.release();
  } catch (error) {
    console.error('[Database Error] Gagal terhubung ke database MySQL:', error.message);
    console.error('Pastikan layanan MySQL (XAMPP/Laragon) aktif dan database telah diimpor.');
  }
};

// Jalankan pengujian koneksi
testConnection();

module.exports = pool;

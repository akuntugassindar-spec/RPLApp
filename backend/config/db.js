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

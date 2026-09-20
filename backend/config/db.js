/**
 * Konfigurasi Koneksi Database MySQL
 * Menggunakan mysql2/promise untuk mendukung async/await secara native
 */

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Muat variabel lingkungan dari file .env
dotenv.config();

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

// Fungsi untuk menguji koneksi ke database saat server dijalankan
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log(`[Database] Berhasil terhubung ke database MySQL: ${process.env.DB_NAME || 'db_kacamata'}`);
    connection.release();
  } catch (error) {
    console.error('[Database Error] Gagal terhubung ke database MySQL:', error.message);
    console.error('Pastikan layanan MySQL (XAMPP/Laragon) aktif dan database telah diimpor.');
  }
};

// Jalankan pengujian koneksi
testConnection();

module.exports = pool;

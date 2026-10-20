/**
 * Server Utama - Sistem Informasi Layanan Antar-Jemput Kacamata
 * Framework: Express.js
 * Database: MySQL2
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Muat variabel lingkungan
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

// Inisialisasi koneksi database
require('./config/db');

// Import rute-rute aplikasi
const authRoutes = require('./routes/authRoutes');
const layananRoutes = require('./routes/layananRoutes');
const detailLayananRoutes = require('./routes/detailLayananRoutes');

// Buat instance aplikasi Express
const app = express();

// Konfigurasi Middleware Global
app.use(cors({
  origin: '*', // Izinkan akses dari frontend manapun (React / Vite / Vue / Postman)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' })); // Parser payload JSON (limit dinaikkan untuk upload foto Base64)
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // Parser form-data / x-www-form-urlencoded

// Sajikan folder uploads foto kacamata & resep secara statis
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rute Pengecekan Status Server (Health Check)
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Selamat Datang di API Sistem Informasi Layanan Antar-Jemput Kacamata',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      layanan: '/api/layanan',
      detail_layanan: '/api/detail-layanan'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString()
  });
});

// Pendaftaran Endpoint Rute API
app.use('/api/auth', authRoutes);
app.use('/api/layanan', layananRoutes);
app.use('/api/detail-layanan', detailLayananRoutes);

// Handler untuk Rute 404 (Tidak Ditemukan)
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Rute '${req.method} ${req.originalUrl}' tidak ditemukan pada server ini.`
  });
});

// Handler Penanganan Error Global (Internal Server Error)
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]:', err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan internal pada server.',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Jalankan Server pada Port yang Ditentukan
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';
const server = app.listen(PORT, HOST, () => {
  console.log('====================================================');
  console.log(` Server Layanan Kacamata berjalan aktif`);
  console.log(` URL: http://localhost:${PORT}`);
  console.log(` Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log('====================================================');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n[Server Error]: Port ${PORT} sedang digunakan oleh proses lain (EADDRINUSE).`);
    console.error(`Tips: Pastikan tidak ada terminal atau proses Node.js lain yang sedang berjalan di port ${PORT}.\n`);
    process.exit(1);
  } else {
    console.error('[Server Error]:', err);
    process.exit(1);
  }
});

module.exports = app;

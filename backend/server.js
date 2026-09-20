/**
 * Server Utama - Sistem Informasi Layanan Antar-Jemput Kacamata
 * Framework: Express.js
 * Database: MySQL2
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Muat variabel lingkungan
dotenv.config();

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

app.use(express.json()); // Parser payload JSON
app.use(express.urlencoded({ extended: true })); // Parser form-data / x-www-form-urlencoded

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
app.listen(PORT, () => {
  console.log('====================================================');
  console.log(` Server Layanan Kacamata berjalan aktif`);
  console.log(` URL: http://localhost:${PORT}`);
  console.log(` Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log('====================================================');
});

module.exports = app;

/**
 * Rute Autentikasi Pengguna
 * Menangani pendaftaran, login, dan pengecekan sesi pengguna
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Rute Registrasi Pelanggan Baru
router.post('/register', authController.register);

// Rute Login (Pelanggan maupun Admin)
router.post('/login', authController.login);

// Rute Mendapatkan Informasi Akun yang Sedang Login
router.get('/me', authMiddleware, authController.getProfile);

module.exports = router;

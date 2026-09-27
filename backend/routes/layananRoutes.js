/**
 * Rute Layanan Antar-Jemput Kacamata
 * Mengatur alur CRUD untuk pengajuan layanan servis kacamata dan pembaruan status
 */

const express = require('express');
const router = express.Router();
const layananController = require('../controllers/layananController');
const authMiddleware = require('../middleware/auth');
const adminAuthMiddleware = require('../middleware/adminAuth');

// Seluruh rute layanan memerlukan autentikasi login (authMiddleware)
router.use(authMiddleware);

// GET /api/layanan - Ambil daftar layanan (semua untuk admin, milik sendiri untuk pelanggan)
router.get('/', layananController.getAllLayanan);

// GET /api/layanan/saya - Alias ambil daftar layanan milik pengguna saat ini
router.get('/saya', layananController.getAllLayanan);

// POST /api/layanan - Buat pengajuan layanan antar-jemput baru
router.post('/', layananController.createLayanan);

// GET /api/layanan/:id - Ambil detail lengkap satu layanan berdasarkan ID
router.get('/:id', layananController.getLayananById);

// PUT /api/layanan/:id - Pembaruan data pengajuan layanan
router.put('/:id', layananController.updateLayanan);

// PUT /api/layanan/:id/status - Pembaruan status layanan khusus oleh Administrator
router.put('/:id/status', adminAuthMiddleware, layananController.updateStatusLayanan);

// DELETE /api/layanan/:id - Pembatalan/penghapusan pengajuan layanan
router.delete('/:id', layananController.deleteLayanan);

module.exports = router;

/**
 * Rute Detail Layanan Kacamata
 * Mengatur rute untuk pengelolaan data teknis kacamata pada setiap pengajuan layanan
 */

const express = require('express');
const router = express.Router();
const detailLayananController = require('../controllers/detailLayananController');
const authMiddleware = require('../middleware/auth');

// Seluruh rute memerlukan autentikasi login
router.use(authMiddleware);

// GET /api/detail-layanan/layanan/:layanan_id - Ambil detail kacamata untuk layanan tertentu
router.get('/layanan/:layanan_id', detailLayananController.getDetailByLayananId);

// GET /api/detail-layanan/:id - Ambil satu baris detail kacamata berdasarkan ID detail
router.get('/:id', detailLayananController.getDetailById);

// POST /api/detail-layanan - Tambah detail kacamata baru untuk pengajuan layanan
router.post('/', detailLayananController.createDetailLayanan);

// PUT /api/detail-layanan/:id - Perbarui data detail kacamata
router.put('/:id', detailLayananController.updateDetailLayanan);

// DELETE /api/detail-layanan/:id - Hapus data detail kacamata
router.delete('/:id', detailLayananController.deleteDetailLayanan);

module.exports = router;

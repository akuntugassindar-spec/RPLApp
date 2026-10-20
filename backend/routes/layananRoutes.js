const express = require('express');
const router = express.Router();
const layananController = require('../controllers/layananController');
const authMiddleware = require('../middleware/auth');
const adminAuthMiddleware = require('../middleware/adminAuth');

router.use(authMiddleware);

router.get('/', layananController.getAllLayanan);
router.post('/', layananController.createLayanan);
router.post('/reset-urutan', adminAuthMiddleware, layananController.resetLayananAutoIncrement);
router.get('/:id', layananController.getLayananById);
router.put('/:id/status', adminAuthMiddleware, layananController.updateStatusLayanan);
router.post('/:id/pembayaran', layananController.prosesPembayaran);
router.post('/:id/pembayaran/konfirmasi', layananController.konfirmasiPembayaran);
router.get('/:id/tracking', layananController.getTrackingKurir);
router.put('/:id/tracking', adminAuthMiddleware, layananController.updateTrackingKurir);
router.delete('/:id', layananController.deleteLayanan);

module.exports = router;

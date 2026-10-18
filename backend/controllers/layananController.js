/**
 * Controller Layanan Antar-Jemput Kacamata
 * Mengelola pembuatan pengajuan layanan, pembaruan status pengerjaan,
 * penyimpanan foto bukti kacamata & resep dokter,
 * simulasi integrasi payment gateway (Midtrans Snap),
 * serta pelacakan langsung kurir GPS (Live Courier Tracking).
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const db = require('../config/db');
let nodemailer;
try {
  nodemailer = require('nodemailer');
} catch (err) {
  nodemailer = null;
}

// Daftar status siklus operasional yang valid (State Machine)
const VALID_STATUSES = [
  'pengajuan',
  'dijadwalkan',
  'diambil',
  'diproses',
  'selesai',
  'diantar'
];

// Daftar jenis layanan yang didukung sistem
const VALID_JENIS_LAYANAN = [
  'perbaikan',
  'penggantian_lensa',
  'perbaikan_dan_lensa'
];

// Daftar metode pembayaran yang didukung (Midtrans Snap Sandbox simulation & COD)
const VALID_METODE_PEMBAYARAN = [
  'qris',
  'bca_va',
  'bni_va',
  'bri_va',
  'mandiri_va',
  'gopay',
  'shopeepay',
  'cod'
];

/**
 * Helper untuk menyimpan gambar Base64 ke disk server (/uploads/)
 */
const saveBase64Image = (base64Str, prefix = 'media') => {
  if (!base64Str || typeof base64Str !== 'string') return null;
  if (base64Str.startsWith('/uploads/') || base64Str.startsWith('http://') || base64Str.startsWith('https://')) {
    return base64Str;
  }
  try {
    const matches = base64Str.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) return null;
    const mimeType = matches[1];
    const dataBuffer = Buffer.from(matches[2], 'base64');
    let ext = 'jpg';
    if (mimeType.includes('png')) ext = 'png';
    else if (mimeType.includes('webp')) ext = 'webp';
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    const filename = `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
    fs.writeFileSync(path.join(uploadsDir, filename), dataBuffer);
    return `/uploads/${filename}`;
  } catch (err) {
    console.error('[Error saveBase64Image]:', err);
    return null;
  }
};

// Helper function untuk kirim email notifikasi
const sendEmailNotification = async (emailTo, nama, status) => {
  if (!nodemailer) {
    console.log('[Email] Info: Pustaka "nodemailer" belum terpasang.');
    return;
  }
  try {
    let transporter;
    if (!process.env.EMAIL_USER) {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass }
      });
    } else {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
      });
    }
    const statusMsg = {
      pengajuan: 'Pengajuan layanan Anda telah kami terima.',
      dijadwalkan: 'Penjemputan kacamata telah dijadwalkan.',
      diambil: 'Kurir sedang menjemput kacamata Anda.',
      diproses: 'Kacamata sedang dikerjakan oleh teknisi optik.',
      selesai: 'Pengerjaan kacamata telah selesai!',
      diantar: 'Kacamata sedang diantar kembali ke alamat Anda.'
    };
    const info = await transporter.sendMail({
      from: '"OptikExpress" <no-reply@optikexpress.local>',
      to: emailTo,
      subject: `[OptikExpress] Update Status Layanan: ${status.toUpperCase()}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e2e8f0;border-radius:8px;"><h2 style="color:#0284c7;">OptikExpress</h2><p>Halo <strong>${nama}</strong>,</p><p>${statusMsg[status] || 'Status layanan Anda telah diperbarui.'}</p><p>Status saat ini: <strong style="color:#0d9488;text-transform:uppercase;">${status}</strong></p><hr style="border:none;border-top:1px solid #e2e8f0;"/><p style="font-size:12px;color:#94a3b8;">Email ini dikirim otomatis oleh sistem OptikExpress.</p></div>`
    });
    if (!process.env.EMAIL_USER) {
      console.log('[Email] Preview URL (Ethereal):', nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error('[Error sendEmailNotification]:', error.message);
  }
};

// Helper function untuk kirim notifikasi WhatsApp mock
const sendWANotification = async (noTelepon, nama, status) => {
  const nomor = noTelepon || '-';
  const statusUpper = (status || '').toUpperCase();
  console.log('----------------------------------------------------');
  console.log('[WhatsApp Mock] MENGIRIM PESAN WA KE PELANGGAN');
  console.log(`Kepada  : ${nomor} (${nama})`);
  console.log(`Pesan   : Halo ${nama}, status servis kacamata Anda di OptikExpress telah diperbarui menjadi: *${statusUpper}*. Terima kasih telah mempercayakan perbaikan kacamata kepada kami!`);
  console.log('Status  : TERKIRIM (Mock)');
  console.log('----------------------------------------------------');
};

/**
 * @route   GET /api/layanan
 */
const getAllLayanan = async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    const { status, jenis_layanan } = req.query;
    let query = `
      SELECT 
        l.id, l.user_id, u.nama AS nama_pelanggan, u.email AS email_pelanggan,
        u.no_telepon AS no_telepon_pelanggan, l.jenis_layanan, l.keluhan, l.alamat,
        DATE_FORMAT(l.tanggal_jemput, '%Y-%m-%d') AS tanggal_jemput,
        TIME_FORMAT(l.jam_jemput, '%H:%i') AS jam_jemput, l.status,
        l.foto_kacamata, l.foto_resep, l.total_biaya, l.status_pembayaran,
        l.metode_pembayaran, l.id_transaksi_pembayaran, l.catatan_admin,
        l.kurir_nama, l.kurir_telepon, l.kurir_lat, l.kurir_lng, l.tracking_status,
        l.created_at, d.id AS detail_id, d.jenis_kacamata, d.detail_perbaikan,
        d.keterangan AS detail_keterangan
      FROM layanan l
      JOIN users u ON l.user_id = u.id
      LEFT JOIN detail_layanan d ON d.layanan_id = l.id
    `;
    const conditions = [];
    const params = [];
    if (role !== 'admin') { conditions.push('l.user_id = ?'); params.push(userId); }
    if (status && VALID_STATUSES.includes(status)) { conditions.push('l.status = ?'); params.push(status); }
    if (jenis_layanan && VALID_JENIS_LAYANAN.includes(jenis_layanan)) { conditions.push('l.jenis_layanan = ?'); params.push(jenis_layanan); }
    if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY l.created_at DESC';
    const [rows] = await db.query(query, params);
    return res.status(200).json({ success: true, total: rows.length, data: rows });
  } catch (error) {
    console.error('[Error getAllLayanan]:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat mengambil daftar layanan.', error: error.message });
  }
};

/**
 * @route   GET /api/layanan/:id
 */
const getLayananById = async (req, res) => {
  try {
    const layananId = req.params.id;
    const { role, id: userId } = req.user;
    const [layananRows] = await db.query(
      `SELECT 
        l.id, l.user_id, u.nama AS nama_pelanggan, u.email AS email_pelanggan,
        u.no_telepon AS no_telepon_pelanggan, l.jenis_layanan, l.keluhan, l.alamat,
        DATE_FORMAT(l.tanggal_jemput, '%Y-%m-%d') AS tanggal_jemput,
        TIME_FORMAT(l.jam_jemput, '%H:%i') AS jam_jemput, l.status,
        l.foto_kacamata, l.foto_resep, l.total_biaya, l.status_pembayaran,
        l.metode_pembayaran, l.id_transaksi_pembayaran, l.catatan_admin,
        l.kurir_nama, l.kurir_telepon, l.kurir_lat, l.kurir_lng, l.tracking_status,
        l.created_at, d.id AS detail_id, d.jenis_kacamata, d.detail_perbaikan,
        d.keterangan AS detail_keterangan
      FROM layanan l
      JOIN users u ON l.user_id = u.id
      LEFT JOIN detail_layanan d ON d.layanan_id = l.id
      WHERE l.id = ?`,
      [layananId]
    );
    if (layananRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Layanan tidak ditemukan.' });
    }
    const item = layananRows[0];
    if (role !== 'admin' && item.user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Akses ditolak.' });
    }
    const responseData = {
      id: item.id, user_id: item.user_id, nama_pelanggan: item.nama_pelanggan,
      email_pelanggan: item.email_pelanggan, no_telepon_pelanggan: item.no_telepon_pelanggan,
      jenis_layanan: item.jenis_layanan, keluhan: item.keluhan, alamat: item.alamat,
      tanggal_jemput: item.tanggal_jemput, jam_jemput: item.jam_jemput, status: item.status,
      foto_kacamata: item.foto_kacamata, foto_resep: item.foto_resep,
      total_biaya: item.total_biaya || 0, status_pembayaran: item.status_pembayaran || 'belum_bayar',
      metode_pembayaran: item.metode_pembayaran, id_transaksi_pembayaran: item.id_transaksi_pembayaran,
      catatan_admin: item.catatan_admin, kurir_nama: item.kurir_nama, kurir_telepon: item.kurir_telepon,
      kurir_lat: item.kurir_lat !== null ? Number(item.kurir_lat) : null,
      kurir_lng: item.kurir_lng !== null ? Number(item.kurir_lng) : null,
      tracking_status: item.tracking_status, created_at: item.created_at,
      jenis_kacamata: item.jenis_kacamata || '-',
      detail_perbaikan: item.detail_perbaikan || '-',
      keterangan: item.detail_keterangan || '',
      detail: item.detail_id ? { id: item.detail_id, layanan_id: item.id, jenis_kacamata: item.jenis_kacamata, detail_perbaikan: item.detail_perbaikan, keterangan: item.detail_keterangan } : null
    };
    return res.status(200).json({ success: true, data: responseData });
  } catch (error) {
    console.error('[Error getLayananById]:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat mengambil detail layanan.', error: error.message });
  }
};

/**
 * @route   POST /api/layanan
 */
const createLayanan = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { jenis_layanan, keluhan, alamat, tanggal_jemput, jam_jemput, jenis_kacamata, detail_perbaikan, keterangan, foto_kacamata, foto_resep } = req.body;
    if (!jenis_layanan || !keluhan || !alamat || !tanggal_jemput || !jam_jemput) {
      return res.status(400).json({ success: false, message: 'Semua field wajib diisi: jenis_layanan, keluhan, alamat, tanggal_jemput, dan jam_jemput.' });
    }
    if (!VALID_JENIS_LAYANAN.includes(jenis_layanan)) {
      return res.status(400).json({ success: false, message: `Jenis layanan tidak valid. Pilihan yang tersedia: ${VALID_JENIS_LAYANAN.join(', ')}` });
    }
    const savedFotoKacamata = saveBase64Image(foto_kacamata, 'kacamata');
    const savedFotoResep = saveBase64Image(foto_resep, 'resep');
    const connection = await db.getConnection();
    try {
    await connection.beginTransaction();
    const statusAwal = 'pengajuan';
    const [layananResult] = await connection.query(
      `INSERT INTO layanan (user_id, jenis_layanan, keluhan, alamat, tanggal_jemput, jam_jemput, status, foto_kacamata, foto_resep) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, jenis_layanan, keluhan, alamat, tanggal_jemput, jam_jemput, statusAwal, savedFotoKacamata, savedFotoResep]
    );
    const layananId = layananResult.insertId;
    let detailId = null;
    if (jenis_kacamata || detail_perbaikan || keterangan) {
      const [detailResult] = await connection.query(
        `INSERT INTO detail_layanan (layanan_id, jenis_kacamata, detail_perbaikan, keterangan) VALUES (?, ?, ?, ?)`,
        [layananId, jenis_kacamata || '-', detail_perbaikan || '-', keterangan || '-']
      );
      detailId = detailResult.insertId;
    }
    await connection.commit();
    return res.status(201).json({
      success: true, message: 'Pengajuan layanan antar-jemput kacamata berhasil dibuat.',
      data: { id: layananId, user_id: userId, jenis_layanan, keluhan, alamat, tanggal_jemput, jam_jemput, status: statusAwal, foto_kacamata: savedFotoKacamata, foto_resep: savedFotoResep, total_biaya: 0, status_pembayaran: 'belum_bayar', detail_layanan: detailId ? { id: detailId, layanan_id: layananId, jenis_kacamata: jenis_kacamata || '-', detail_perbaikan: detail_perbaikan || '-', keterangan: keterangan || '-' } : null }
    });
    } catch (dbError) {
      await connection.rollback();
      throw dbError;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('[Error createLayanan]:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat membuat pengajuan layanan.', error: error.message });
  }
};

/**
 * @route   PUT /api/layanan/:id/status
 */
const updateStatusLayanan = async (req, res) => {
  try {
    const layananId = req.params.id;
    const { status, total_biaya, status_pembayaran, metode_pembayaran, catatan_admin, kurir_nama, kurir_telepon, tracking_status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status baru wajib disertakan.' });
    }
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: `Status tidak valid. Pilihan status yang tersedia: ${VALID_STATUSES.join(', ')}` });
    }
    const [checkRows] = await db.query(
      `SELECT l.id, l.status, l.total_biaya, l.status_pembayaran, u.email, u.nama, u.no_telepon FROM layanan l JOIN users u ON l.user_id = u.id WHERE l.id = ?`, [layananId]
    );
    if (checkRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Layanan tidak ditemukan.' });
    }
    const dataLama = checkRows[0];
    const updateFields = ['status = ?'];
    const updateParams = [status];
    if (total_biaya !== undefined && total_biaya !== null) { updateFields.push('total_biaya = ?'); updateParams.push(parseInt(total_biaya, 10) || 0); }
    if (status_pembayaran) { updateFields.push('status_pembayaran = ?'); updateParams.push(status_pembayaran); }
    if (metode_pembayaran) { updateFields.push('metode_pembayaran = ?'); updateParams.push(metode_pembayaran); }
    if (catatan_admin !== undefined) { updateFields.push('catatan_admin = ?'); updateParams.push(catatan_admin); }
    if (kurir_nama) { updateFields.push('kurir_nama = ?'); updateParams.push(kurir_nama); }
    if (kurir_telepon) { updateFields.push('kurir_telepon = ?'); updateParams.push(kurir_telepon); }
    if (tracking_status) { updateFields.push('tracking_status = ?'); updateParams.push(tracking_status); }
    updateParams.push(layananId);
    await db.query(`UPDATE layanan SET ${updateFields.join(', ')} WHERE id = ?`, updateParams);
    sendEmailNotification(dataLama.email, dataLama.nama, status);
    sendWANotification(dataLama.no_telepon, dataLama.nama, status);
    return res.status(200).json({
      success: true, message: `Status layanan berhasil diperbarui menjadi '${status}'.`,
      data: { id: parseInt(layananId, 10), status_sebelumnya: dataLama.status, status_baru: status }
    });
  } catch (error) {
    console.error('[Error updateStatusLayanan]:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat memperbarui status layanan.', error: error.message });
  }
};

/**
 * @route   POST /api/layanan/:id/pembayaran
 */
const prosesPembayaran = async (req, res) => {
  try {
    const layananId = req.params.id;
    const { metode_pembayaran } = req.body;
    const { role, id: userId } = req.user;
    const [rows] = await db.query(`SELECT l.*, u.nama, u.email FROM layanan l JOIN users u ON l.user_id = u.id WHERE l.id = ?`, [layananId]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan.' });
    const pesanan = rows[0];
    if (role !== 'admin' && pesanan.user_id !== userId) return res.status(403).json({ success: false, message: 'Akses ditolak.' });
    const metode = metode_pembayaran || 'qris';
    if (!VALID_METODE_PEMBAYARAN.includes(metode)) {
      return res.status(400).json({ success: false, message: `Metode pembayaran tidak valid. Pilihan: ${VALID_METODE_PEMBAYARAN.join(', ')}` });
    }
    const biaya = pesanan.total_biaya && pesanan.total_biaya > 0 ? pesanan.total_biaya : 150000;
    const transactionId = `MIDTRANS-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    let paymentDetail = {};
    if (metode === 'qris') {
      paymentDetail = { tipe: 'qris', qr_image: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=OPTIKEXPRESS-PAYMENT-${transactionId}`, merchant: 'OptikExpress Payment Gateway' };
    } else if (metode.includes('va')) {
      const bankCode = metode.replace('_va', '').toUpperCase();
      paymentDetail = { tipe: 'virtual_account', bank: bankCode, va_number: `8808${String(layananId).padStart(4, '0')}${Math.floor(1000 + Math.random() * 9000)}` };
    } else if (metode === 'cod') {
      paymentDetail = { tipe: 'cod', keterangan: 'Pembayaran tunai langsung kepada kurir saat kacamata diantar.' };
    } else {
      paymentDetail = { tipe: 'ewallet', ewallet: metode.toUpperCase(), link: `https://sandbox.midtrans.com/pay/${transactionId}` };
    }
    await db.query(`UPDATE layanan SET total_biaya = ?, metode_pembayaran = ?, id_transaksi_pembayaran = ?, status_pembayaran = 'menunggu_pembayaran' WHERE id = ?`, [biaya, metode, transactionId, layananId]);
    return res.status(200).json({
      success: true, message: 'Transaksi Payment Gateway berhasil diinisialisasi.',
      data: { layanan_id: parseInt(layananId, 10), transaction_id: transactionId, gross_amount: biaya, metode_pembayaran: metode, status_pembayaran: 'menunggu_pembayaran', expired_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), payment_detail: paymentDetail }
    });
  } catch (error) {
    console.error('[Error prosesPembayaran]:', error);
    return res.status(500).json({ success: false, message: 'Gagal memproses transaksi pembayaran.', error: error.message });
  }
};

/**
 * @route   POST /api/layanan/:id/pembayaran/konfirmasi
 */
const konfirmasiPembayaran = async (req, res) => {
  try {
    const layananId = req.params.id;
    const { role, id: userId } = req.user;
    const [rows] = await db.query(`SELECT l.*, u.nama FROM layanan l JOIN users u ON l.user_id = u.id WHERE l.id = ?`, [layananId]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan.' });
    if (role !== 'admin' && rows[0].user_id !== userId) return res.status(403).json({ success: false, message: 'Akses ditolak.' });
    await db.query(`UPDATE layanan SET status_pembayaran = 'lunas' WHERE id = ?`, [layananId]);
    return res.status(200).json({ success: true, message: 'Pembayaran berhasil dikonfirmasi LUNAS.', data: { layanan_id: parseInt(layananId, 10), status_pembayaran: 'lunas', id_transaksi_pembayaran: rows[0].id_transaksi_pembayaran } });
  } catch (error) {
    console.error('[Error konfirmasiPembayaran]:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengonfirmasi pembayaran.', error: error.message });
  }
};

/**
 * @route   GET /api/layanan/:id/tracking
 */
const getTrackingKurir = async (req, res) => {
  try {
    const layananId = req.params.id;
    const { role, id: userId } = req.user;
    const [rows] = await db.query(`SELECT l.*, u.nama AS nama_pelanggan, u.no_telepon AS no_telepon_pelanggan FROM layanan l JOIN users u ON l.user_id = u.id WHERE l.id = ?`, [layananId]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Layanan tidak ditemukan.' });
    const item = rows[0];
    if (role !== 'admin' && item.user_id !== userId) return res.status(403).json({ success: false, message: 'Akses ditolak.' });
    const optikLocation = { nama: 'OptikExpress Store & Lab', alamat: 'Jl. Pemuda No. 48, Surabaya', lat: -7.2625, lng: 112.7485 };
    const tujuanLocation = { nama: item.nama_pelanggan, alamat: item.alamat || 'Alamat Pelanggan', lat: -7.2890, lng: 112.7950 };
    let progress = 10, eta = '30-45 Menit', statusKet = 'Menunggu konfirmasi jadwal kurir.';
    switch (item.status) {
      case 'pengajuan': progress = 10; statusKet = 'Permintaan diterima, sedang verifikasi.'; eta = '1-2 Jam'; break;
      case 'dijadwalkan': progress = 25; statusKet = 'Kurir ditugaskan, bersiap menuju lokasi.'; eta = '20-30 Menit'; break;
      case 'diambil': progress = 50; statusKet = 'Kurir dalam perjalanan menjemput kacamata.'; eta = '10-15 Menit'; break;
      case 'diproses': progress = 75; statusKet = 'Kacamata di laboratorium optik.'; eta = 'Dalam pengerjaan'; break;
      case 'diantar': progress = 90; statusKet = 'Kurir mengantar kacamata ke alamat Anda.'; eta = '15-25 Menit'; break;
      case 'selesai': progress = 100; statusKet = 'Layanan selesai!'; eta = 'Tiba di lokasi'; break;
      default: progress = 10;
    }
    const ratio = progress / 100;
    const kurirLat = item.kurir_lat !== null ? Number(item.kurir_lat) : optikLocation.lat + (tujuanLocation.lat - optikLocation.lat) * ratio;
    const kurirLng = item.kurir_lng !== null ? Number(item.kurir_lng) : optikLocation.lng + (tujuanLocation.lng - optikLocation.lng) * ratio;
    return res.status(200).json({
      success: true,
      data: {
        layanan_id: parseInt(layananId, 10), status_layanan: item.status, persentase_perjalanan: progress, estimasi_tiba: eta, status_deskripsi: item.tracking_status || statusKet,
        kurir: { nama: item.kurir_nama || 'Agus Pratama', telepon: item.kurir_telepon || '081234567890', kendaraan: 'Honda Vario 160 (L 4589 AB)', posisi_saat_ini: { lat: kurirLat, lng: kurirLng } },
        lokasi_optik: optikLocation, lokasi_tujuan: tujuanLocation
      }
    });
  } catch (error) {
    console.error('[Error getTrackingKurir]:', error);
    return res.status(500).json({ success: false, message: 'Gagal memuat tracking kurir.', error: error.message });
  }
};

/**
 * @route   PUT /api/layanan/:id/tracking
 */
const updateTrackingKurir = async (req, res) => {
  try {
    const layananId = req.params.id;
    const { kurir_nama, kurir_telepon, kurir_lat, kurir_lng, tracking_status } = req.body;
    const fields = [], params = [];
    if (kurir_nama !== undefined) { fields.push('kurir_nama = ?'); params.push(kurir_nama); }
    if (kurir_telepon !== undefined) { fields.push('kurir_telepon = ?'); params.push(kurir_telepon); }
    if (kurir_lat !== undefined) { fields.push('kurir_lat = ?'); params.push(kurir_lat); }
    if (kurir_lng !== undefined) { fields.push('kurir_lng = ?'); params.push(kurir_lng); }
    if (tracking_status !== undefined) { fields.push('tracking_status = ?'); params.push(tracking_status); }
    if (fields.length === 0) return res.status(400).json({ success: false, message: 'Tidak ada data tracking yang diperbarui.' });
    params.push(layananId);
    await db.query(`UPDATE layanan SET ${fields.join(', ')} WHERE id = ?`, params);
    return res.status(200).json({ success: true, message: 'Data pelacakan kurir berhasil diperbarui.', data: { layanan_id: parseInt(layananId, 10), kurir_nama, kurir_telepon, tracking_status } });
  } catch (error) {
    console.error('[Error updateTrackingKurir]:', error);
    return res.status(500).json({ success: false, message: 'Gagal memperbarui tracking kurir.', error: error.message });
  }
};

/**
 * @route   DELETE /api/layanan/:id
 */
const deleteLayanan = async (req, res) => {
  try {
    const layananId = req.params.id;
    const { role, id: userId } = req.user;
    const [layananRows] = await db.query('SELECT id, user_id, status FROM layanan WHERE id = ?', [layananId]);
    if (layananRows.length === 0) return res.status(404).json({ success: false, message: 'Layanan tidak ditemukan.' });
    const layanan = layananRows[0];
    if (role !== 'admin' && layanan.user_id !== userId) return res.status(403).json({ success: false, message: 'Akses ditolak.' });
    if (role !== 'admin' && layanan.status !== 'pengajuan') return res.status(400).json({ success: false, message: `Pengajuan layanan tidak dapat dibatalkan karena sudah berstatus '${layanan.status}'.` });
    await db.query('DELETE FROM detail_layanan WHERE layanan_id = ?', [layananId]);
    await db.query('DELETE FROM layanan WHERE id = ?', [layananId]);
    return res.status(200).json({ success: true, message: 'Pengajuan layanan berhasil dibatalkan/dihapus.' });
  } catch (error) {
    console.error('[Error deleteLayanan]:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat menghapus data layanan.', error: error.message });
  }
};

module.exports = {
  VALID_STATUSES, VALID_JENIS_LAYANAN, VALID_METODE_PEMBAYARAN, saveBase64Image,
  sendEmailNotification, sendWANotification,
  getAllLayanan, getLayananById, createLayanan, updateStatusLayanan,
  prosesPembayaran, konfirmasiPembayaran, getTrackingKurir, updateTrackingKurir, deleteLayanan
};

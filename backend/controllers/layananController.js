/**
 * Controller Layanan Antar-Jemput Kacamata
 * Menangani pembuatan pengajuan, pembacaan data, pembaruan status oleh admin, dan penghapusan
 */

const db = require('../config/db');

// Daftar status yang valid sesuai spesifikasi sistem
const VALID_STATUSES = [
  'pengajuan',
  'dijadwalkan',
  'diambil',
  'diproses',
  'selesai',
  'diantar'
];

// Daftar jenis layanan yang valid
const VALID_JENIS_LAYANAN = [
  'perbaikan',
  'penggantian_lensa'
];

/**
 * @route   GET /api/layanan
 * @desc    Mengambil daftar layanan:
 *          - Jika Admin: menampilkan seluruh pengajuan layanan pelanggan
 *          - Jika Pelanggan: hanya menampilkan pengajuan milik diri sendiri
 * @access  Privat (Pelanggan / Admin)
 */
const getAllLayanan = async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    const { status, jenis_layanan } = req.query;

    let query = `
      SELECT 
        l.id,
        l.user_id,
        u.nama AS nama_pelanggan,
        u.email AS email_pelanggan,
        u.no_telepon AS no_telepon_pelanggan,
        l.jenis_layanan,
        l.keluhan,
        l.alamat,
        DATE_FORMAT(l.tanggal_jemput, '%Y-%m-%d') AS tanggal_jemput,
        TIME_FORMAT(l.jam_jemput, '%H:%i') AS jam_jemput,
        l.status,
        l.created_at,
        d.id AS detail_id,
        d.jenis_kacamata,
        d.detail_perbaikan,
        d.keterangan AS detail_keterangan
      FROM layanan l
      JOIN users u ON l.user_id = u.id
      LEFT JOIN detail_layanan d ON d.layanan_id = l.id
    `;

    const conditions = [];
    const params = [];

    // Jika bukan admin, hanya ambil layanan milik user yang bersangkutan
    if (role !== 'admin') {
      conditions.push('l.user_id = ?');
      params.push(userId);
    }

    // Filter opsional berdasarkan status
    if (status && VALID_STATUSES.includes(status)) {
      conditions.push('l.status = ?');
      params.push(status);
    }

    // Filter opsional berdasarkan jenis layanan
    if (jenis_layanan && VALID_JENIS_LAYANAN.includes(jenis_layanan)) {
      conditions.push('l.jenis_layanan = ?');
      params.push(jenis_layanan);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY l.created_at DESC';

    const [rows] = await db.query(query, params);

    return res.status(200).json({
      success: true,
      total: rows.length,
      data: rows
    });
  } catch (error) {
    console.error('[Error getAllLayanan]:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil daftar layanan.',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/layanan/:id
 * @desc    Mengambil detail satu layanan berdasarkan ID beserta detail_layanan
 * @access  Privat (Pemilik Layanan / Admin)
 */
const getLayananById = async (req, res) => {
  try {
    const layananId = req.params.id;
    const { role, id: userId } = req.user;

    const [layananRows] = await db.query(
      `SELECT 
        l.id,
        l.user_id,
        u.nama AS nama_pelanggan,
        u.email AS email_pelanggan,
        u.no_telepon AS no_telepon_pelanggan,
        l.jenis_layanan,
        l.keluhan,
        l.alamat,
        DATE_FORMAT(l.tanggal_jemput, '%Y-%m-%d') AS tanggal_jemput,
        TIME_FORMAT(l.jam_jemput, '%H:%i') AS jam_jemput,
        l.status,
        l.created_at
      FROM layanan l
      JOIN users u ON l.user_id = u.id
      WHERE l.id = ?`,
      [layananId]
    );

    if (layananRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data layanan tidak ditemukan.'
      });
    }

    const layanan = layananRows[0];

    // Cek izin akses: Hanya admin atau pemilik layanan yang boleh melihat
    if (role !== 'admin' && layanan.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Anda tidak memiliki izin untuk melihat layanan ini.'
      });
    }

    // Ambil data dari tabel detail_layanan
    const [detailRows] = await db.query(
      'SELECT id, layanan_id, jenis_kacamata, detail_perbaikan, keterangan FROM detail_layanan WHERE layanan_id = ?',
      [layananId]
    );

    return res.status(200).json({
      success: true,
      data: {
        ...layanan,
        detail_layanan: detailRows[0] || null
      }
    });
  } catch (error) {
    console.error('[Error getLayananById]:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memuat data layanan.',
      error: error.message
    });
  }
};

/**
 * @route   POST /api/layanan
 * @desc    Membuat pengajuan layanan antar-jemput kacamata baru
 * @access  Privat (Pelanggan / Admin)
 */
const createLayanan = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const userId = req.user.id;
    const {
      jenis_layanan,
      keluhan,
      alamat,
      tanggal_jemput,
      jam_jemput,
      // Field opsional untuk langsung mengisi detail_layanan
      jenis_kacamata,
      detail_perbaikan,
      keterangan
    } = req.body;

    // Validasi input kelengkapan data
    if (!jenis_layanan || !keluhan || !alamat || !tanggal_jemput || !jam_jemput) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Field jenis_layanan, keluhan, alamat, tanggal_jemput, dan jam_jemput wajib diisi.'
      });
    }

    // Validasi enum jenis_layanan
    if (!VALID_JENIS_LAYANAN.includes(jenis_layanan)) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `Jenis layanan tidak valid. Pilihan yang tersedia: ${VALID_JENIS_LAYANAN.join(', ')}`
      });
    }

    // Status awal selalu 'pengajuan'
    const statusAwal = 'pengajuan';

    // Insert ke tabel layanan
    const [layananResult] = await connection.query(
      `INSERT INTO layanan 
        (user_id, jenis_layanan, keluhan, alamat, tanggal_jemput, jam_jemput, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, jenis_layanan, keluhan, alamat, tanggal_jemput, jam_jemput, statusAwal]
    );

    const layananId = layananResult.insertId;

    // Jika informasi kacamata disertakan, simpan langsung ke detail_layanan
    let detailId = null;
    if (jenis_kacamata || detail_perbaikan || keterangan) {
      const [detailResult] = await connection.query(
        `INSERT INTO detail_layanan 
          (layanan_id, jenis_kacamata, detail_perbaikan, keterangan) 
         VALUES (?, ?, ?, ?)`,
        [layananId, jenis_kacamata || '-', detail_perbaikan || '-', keterangan || '-']
      );
      detailId = detailResult.insertId;
    }

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: 'Pengajuan layanan antar-jemput kacamata berhasil dibuat.',
      data: {
        id: layananId,
        user_id: userId,
        jenis_layanan,
        keluhan,
        alamat,
        tanggal_jemput,
        jam_jemput,
        status: statusAwal,
        detail_layanan: detailId ? {
          id: detailId,
          layanan_id: layananId,
          jenis_kacamata: jenis_kacamata || '-',
          detail_perbaikan: detail_perbaikan || '-',
          keterangan: keterangan || '-'
        } : null
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('[Error createLayanan]:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat membuat pengajuan layanan.',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

/**
 * @route   PUT /api/layanan/:id/status
 * @desc    Memperbarui status progres layanan antar-jemput
 * @access  Privat (Khusus Admin)
 */
const updateStatusLayanan = async (req, res) => {
  try {
    const layananId = req.params.id;
    const { status } = req.body;

    // Validasi keberadaan status pada body
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status baru wajib disertakan.'
      });
    }

    // Validasi apakah status termasuk dalam enum yang valid
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status tidak valid. Pilihan status yang tersedia: ${VALID_STATUSES.join(', ')}`
      });
    }

    // Periksa apakah data layanan yang ingin diubah statusnya ada
    const [checkRows] = await db.query(
      'SELECT id, status FROM layanan WHERE id = ?',
      [layananId]
    );

    if (checkRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Layanan tidak ditemukan.'
      });
    }

    const statusSebelumnya = checkRows[0].status;

    // Perbarui status di database
    await db.query(
      'UPDATE layanan SET status = ? WHERE id = ?',
      [status, layananId]
    );

    return res.status(200).json({
      success: true,
      message: `Status layanan berhasil diperbarui dari '${statusSebelumnya}' menjadi '${status}'.`,
      data: {
        id: parseInt(layananId, 10),
        status_sebelumnya: statusSebelumnya,
        status_terbaru: status
      }
    });
  } catch (error) {
    console.error('[Error updateStatusLayanan]:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memperbarui status layanan.',
      error: error.message
    });
  }
};

/**
 * @route   DELETE /api/layanan/:id
 * @desc    Menghapus pengajuan layanan (hanya jika status masih 'pengajuan' atau dilakukan oleh admin)
 * @access  Privat (Pemilik Layanan / Admin)
 */
const deleteLayanan = async (req, res) => {
  try {
    const layananId = req.params.id;
    const { role, id: userId } = req.user;

    const [layananRows] = await db.query(
      'SELECT id, user_id, status FROM layanan WHERE id = ?',
      [layananId]
    );

    if (layananRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Layanan tidak ditemukan.'
      });
    }

    const layanan = layananRows[0];

    // Cek izin akses
    if (role !== 'admin' && layanan.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Anda tidak berhak menghapus layanan ini.'
      });
    }

    // Pelanggan hanya boleh membatalkan jika status masih 'pengajuan'
    if (role !== 'admin' && layanan.status !== 'pengajuan') {
      return res.status(400).json({
        success: false,
        message: `Pengajuan layanan tidak dapat dibatalkan karena sudah berstatus '${layanan.status}'.`
      });
    }

    // Hapus detail_layanan terlebih dahulu jika ada, lalu hapus layanan
    await db.query('DELETE FROM detail_layanan WHERE layanan_id = ?', [layananId]);
    await db.query('DELETE FROM layanan WHERE id = ?', [layananId]);

    return res.status(200).json({
      success: true,
      message: 'Pengajuan layanan berhasil dibatalkan/dihapus.'
    });
  } catch (error) {
    console.error('[Error deleteLayanan]:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menghapus data layanan.',
      error: error.message
    });
  }
};

module.exports = {
  getAllLayanan,
  getLayananById,
  createLayanan,
  updateStatusLayanan,
  deleteLayanan
};

/**
 * Controller Detail Layanan Kacamata
 * Mengelola informasi detail kacamata (jenis frame/lensa, rincian kerusakan, dan catatan teknis)
 */

const db = require('../config/db');

/**
 * @route   GET /api/detail-layanan/layanan/:layanan_id
 * @desc    Mengambil detail kacamata berdasarkan ID layanan
 * @access  Privat (Pemilik Layanan / Admin)
 */
const getDetailByLayananId = async (req, res) => {
  try {
    const { layanan_id } = req.params;
    const { role, id: userId } = req.user;

    // Periksa apakah layanan induk ada
    const [layananRows] = await db.query(
      'SELECT id, user_id FROM layanan WHERE id = ?',
      [layanan_id]
    );

    if (layananRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Layanan tidak ditemukan.'
      });
    }

    // Periksa hak akses
    if (role !== 'admin' && layananRows[0].user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Anda tidak memiliki izin mengakses data ini.'
      });
    }

    // Ambil detail kacamata
    const [detailRows] = await db.query(
      'SELECT * FROM detail_layanan WHERE layanan_id = ?',
      [layanan_id]
    );

    return res.status(200).json({
      success: true,
      data: detailRows
    });
  } catch (error) {
    console.error('[Error getDetailByLayananId]:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memuat detail layanan.',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/detail-layanan/:id
 * @desc    Mengambil detail layanan berdasarkan ID record detail
 * @access  Privat (Pemilik Layanan / Admin)
 */
const getDetailById = async (req, res) => {
  try {
    const detailId = req.params.id;
    const { role, id: userId } = req.user;

    const [rows] = await db.query(
      `SELECT d.*, l.user_id 
       FROM detail_layanan d
       JOIN layanan l ON d.layanan_id = l.id
       WHERE d.id = ?`,
      [detailId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Detail layanan tidak ditemukan.'
      });
    }

    const detail = rows[0];

    // Cek izin akses
    if (role !== 'admin' && detail.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Anda tidak memiliki izin melihat data ini.'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: detail.id,
        layanan_id: detail.layanan_id,
        jenis_kacamata: detail.jenis_kacamata,
        detail_perbaikan: detail.detail_perbaikan,
        keterangan: detail.keterangan
      }
    });
  } catch (error) {
    console.error('[Error getDetailById]:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memuat data detail layanan.',
      error: error.message
    });
  }
};

/**
 * @route   POST /api/detail-layanan
 * @desc    Menambahkan data detail kacamata untuk suatu layanan
 * @access  Privat (Pemilik Layanan / Admin)
 */
const createDetailLayanan = async (req, res) => {
  try {
    const { layanan_id, jenis_kacamata, detail_perbaikan, keterangan } = req.body;
    const { role, id: userId } = req.user;

    // Validasi field utama
    if (!layanan_id) {
      return res.status(400).json({
        success: false,
        message: 'ID Layanan (layanan_id) wajib disertakan.'
      });
    }

    // Pastikan layanan induk ada
    const [layananRows] = await db.query(
      'SELECT id, user_id FROM layanan WHERE id = ?',
      [layanan_id]
    );

    if (layananRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Layanan induk tidak ditemukan.'
      });
    }

    // Cek izin
    if (role !== 'admin' && layananRows[0].user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Anda tidak berhak menambahkan detail pada layanan ini.'
      });
    }

    // Insert ke tabel detail_layanan
    const [result] = await db.query(
      `INSERT INTO detail_layanan 
        (layanan_id, jenis_kacamata, detail_perbaikan, keterangan) 
       VALUES (?, ?, ?, ?)`,
      [layanan_id, jenis_kacamata || '-', detail_perbaikan || '-', keterangan || '-']
    );

    return res.status(201).json({
      success: true,
      message: 'Detail layanan berhasil ditambahkan.',
      data: {
        id: result.insertId,
        layanan_id,
        jenis_kacamata: jenis_kacamata || '-',
        detail_perbaikan: detail_perbaikan || '-',
        keterangan: keterangan || '-'
      }
    });
  } catch (error) {
    console.error('[Error createDetailLayanan]:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menambahkan detail layanan.',
      error: error.message
    });
  }
};

/**
 * @route   PUT /api/detail-layanan/:id
 * @desc    Memperbarui informasi detail kacamata
 * @access  Privat (Pemilik Layanan / Admin)
 */
const updateDetailLayanan = async (req, res) => {
  try {
    const detailId = req.params.id;
    const { role, id: userId } = req.user;
    const { jenis_kacamata, detail_perbaikan, keterangan } = req.body;

    // Periksa apakah detail_layanan ada dan ambil user_id layanan terkait
    const [rows] = await db.query(
      `SELECT d.*, l.user_id 
       FROM detail_layanan d
       JOIN layanan l ON d.layanan_id = l.id
       WHERE d.id = ?`,
      [detailId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data detail layanan tidak ditemukan.'
      });
    }

    const currentDetail = rows[0];

    // Cek izin akses
    if (role !== 'admin' && currentDetail.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Anda tidak memiliki izin untuk mengubah data ini.'
      });
    }

    // Gunakan data baru jika ada, atau gunakan data yang lama
    const updatedJenisKacamata = jenis_kacamata !== undefined ? jenis_kacamata : currentDetail.jenis_kacamata;
    const updatedDetailPerbaikan = detail_perbaikan !== undefined ? detail_perbaikan : currentDetail.detail_perbaikan;
    const updatedKeterangan = keterangan !== undefined ? keterangan : currentDetail.keterangan;

    await db.query(
      `UPDATE detail_layanan 
       SET jenis_kacamata = ?, detail_perbaikan = ?, keterangan = ? 
       WHERE id = ?`,
      [updatedJenisKacamata, updatedDetailPerbaikan, updatedKeterangan, detailId]
    );

    return res.status(200).json({
      success: true,
      message: 'Detail layanan berhasil diperbarui.',
      data: {
        id: parseInt(detailId, 10),
        layanan_id: currentDetail.layanan_id,
        jenis_kacamata: updatedJenisKacamata,
        detail_perbaikan: updatedDetailPerbaikan,
        keterangan: updatedKeterangan
      }
    });
  } catch (error) {
    console.error('[Error updateDetailLayanan]:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memperbarui detail layanan.',
      error: error.message
    });
  }
};

/**
 * @route   DELETE /api/detail-layanan/:id
 * @desc    Menghapus data detail kacamata
 * @access  Privat (Pemilik Layanan / Admin)
 */
const deleteDetailLayanan = async (req, res) => {
  try {
    const detailId = req.params.id;
    const { role, id: userId } = req.user;

    const [rows] = await db.query(
      `SELECT d.*, l.user_id 
       FROM detail_layanan d
       JOIN layanan l ON d.layanan_id = l.id
       WHERE d.id = ?`,
      [detailId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data detail layanan tidak ditemukan.'
      });
    }

    const currentDetail = rows[0];

    // Cek izin akses
    if (role !== 'admin' && currentDetail.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Anda tidak memiliki izin untuk menghapus data ini.'
      });
    }

    await db.query('DELETE FROM detail_layanan WHERE id = ?', [detailId]);

    return res.status(200).json({
      success: true,
      message: 'Detail layanan berhasil dihapus.'
    });
  } catch (error) {
    console.error('[Error deleteDetailLayanan]:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menghapus data detail layanan.',
      error: error.message
    });
  }
};

module.exports = {
  getDetailByLayananId,
  getDetailById,
  createDetailLayanan,
  updateDetailLayanan,
  deleteDetailLayanan
};

/**
 * Controller Autentikasi Pengguna
 * Menangani fungsi registrasi, login, dan profil user
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const dotenv = require('dotenv');

dotenv.config();

/**
 * @route   POST /api/auth/register
 * @desc    Mendaftarkan pengguna baru (pelanggan)
 * @access  Publik
 */
const register = async (req, res) => {
  try {
    const { nama, email, password, no_telepon } = req.body;

    // Validasi input wajib
    if (!nama || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nama, email, dan password wajib diisi.'
      });
    }

    // Validasi format email sederhana
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Format email tidak valid.'
      });
    }

    // Periksa apakah email sudah terdaftar
    const [existingUsers] = await db.query(
      'SELECT id, email FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email sudah terdaftar. Silakan gunakan email lain atau login.'
      });
    }

    // Enkripsi password menggunakan bcryptjs
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Tetapkan role default sebagai 'pelanggan'
    const role = 'pelanggan';

    // Simpan data user baru ke database
    const [result] = await db.query(
      'INSERT INTO users (nama, email, password, role, no_telepon) VALUES (?, ?, ?, ?, ?)',
      [nama, email, hashedPassword, role, no_telepon || null]
    );

    return res.status(201).json({
      success: true,
      message: 'Registrasi akun berhasil. Silakan login dengan akun Anda.',
      data: {
        id: result.insertId,
        nama,
        email,
        role,
        no_telepon: no_telepon || null
      }
    });
  } catch (error) {
    console.error('[Error Register]:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat melakukan registrasi.',
      error: error.message
    });
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Autentikasi user & menghasilkan JWT Token
 * @access  Publik
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validasi kelengkapan data
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password wajib diisi.'
      });
    }

    // Cari user berdasarkan email
    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password yang Anda masukkan salah.'
      });
    }

    const user = users[0];

    // Bandingkan password plaintext dengan hash yang tersimpan di database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password yang Anda masukkan salah.'
      });
    }

    // Buat payload token JWT
    const payload = {
      id: user.id,
      nama: user.nama,
      email: user.email,
      role: user.role
    };

    const secretKey = process.env.JWT_SECRET || 'super_secret_jwt_kacamata_key_2026_universitas';
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

    // Tandatangani token JWT
    const token = jwt.sign(payload, secretKey, { expiresIn });

    return res.status(200).json({
      success: true,
      message: 'Login berhasil.',
      token,
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role,
        no_telepon: user.no_telepon
      }
    });
  } catch (error) {
    console.error('[Error Login]:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat melakukan login.',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Mendapatkan profil pengguna yang sedang login
 * @access  Privat (Perlu Token)
 */
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [users] = await db.query(
      'SELECT id, nama, email, role, no_telepon, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pengguna tidak ditemukan.'
      });
    }

    return res.status(200).json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    console.error('[Error GetProfile]:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memuat data profil.',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getProfile
};

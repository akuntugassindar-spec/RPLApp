/**
 * Middleware Autentikasi JWT
 * Memverifikasi JSON Web Token dari header Authorization
 * Menyematkan data user yang didekodekan ke objek request (req.user)
 */

const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const authMiddleware = (req, res, next) => {
  try {
    // Ambil header Authorization
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Akses ditolak. Token otentikasi tidak disediakan dalam header Authorization.'
      });
    }

    // Format yang diharapkan: "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        message: 'Format token salah. Format yang diharapkan adalah: Bearer <token>'
      });
    }

    const token = parts[1];
    const secretKey = process.env.JWT_SECRET || 'super_secret_jwt_kacamata_key_2026_universitas';

    // Verifikasi validitas token JWT
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({
            success: false,
            message: 'Sesi login telah kedaluwarsa. Silakan login kembali.'
          });
        }
        return res.status(401).json({
          success: false,
          message: 'Token otentikasi tidak valid.'
        });
      }

      // Simpan payload user ke req.user agar dapat diakses di handler rute
      req.user = decoded;
      next();
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada middleware autentikasi.',
      error: error.message
    });
  }
};

module.exports = authMiddleware;

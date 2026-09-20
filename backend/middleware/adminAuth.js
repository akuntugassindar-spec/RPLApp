/**
 * Middleware Autorisasi Khusus Administrator
 * Memastikan user yang sedang login memiliki peran (role) 'admin'
 * Dijalankan setelah middleware auth (authMiddleware)
 */

const adminAuthMiddleware = (req, res, next) => {
  // Pastikan data user sudah terverifikasi dari middleware auth
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak. Pengguna belum diautentikasi.'
    });
  }

  // Periksa apakah role user adalah 'admin'
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak. Tindakan ini hanya diperbolehkan untuk Administrator optik.'
    });
  }

  // Jika admin, lanjutkan ke controller berikutnya
  next();
};

module.exports = adminAuthMiddleware;

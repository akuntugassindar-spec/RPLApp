/**
 * Middleware Autorisasi Staf Operasional (Admin & Kurir)
 * Memastikan user yang sedang login memiliki peran 'admin' atau 'kurir'
 * Digunakan untuk pembaruan status logistik penjemputan/pengantaran
 * serta pembaruan koordinat pelacakan kurir GPS.
 */

const staffAuth = (req, res, next) => {
  // Pastikan data user sudah terverifikasi dari middleware auth
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak. Pengguna belum diautentikasi.'
    });
  }

  // Periksa apakah role user adalah 'admin' atau 'kurir'
  if (req.user.role !== 'admin' && req.user.role !== 'kurir') {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak. Tindakan ini hanya diperbolehkan untuk Kurir atau Administrator optik.'
    });
  }

  // Jika admin atau kurir, lanjutkan ke controller berikutnya
  next();
};

module.exports = staffAuth;

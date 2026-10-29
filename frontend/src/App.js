import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Komponen Navigasi & Proteksi Rute
import Navbar from './components/Navbar';
import PrivateRoute from './utils/PrivateRoute';

// Halaman Publik
import { Home, Login, Register } from './pages';

// Modul Halaman Layanan
import { BuatLayanan, DaftarLayanan, DashboardLayanan } from './pages/layanan';

// Modul Halaman Detail Layanan
import { DetailLayanan, AdminDetailLayanan } from './pages/detail_layanan';

// Modul Halaman Kurir
import { TrackingKurir, DaftarKurir, KurirDashboard } from './pages/kurir';

// Modul Halaman Pembayaran
import { PembayaranPage, KonfirmasiPembayaran } from './pages/pembayaran';

// Modul Halaman Riwayat Status Layanan
import { RiwayatStatusLayanan } from './pages/riwayat_status_layanan';

// Halaman Khusus Administrator
import { AdminDashboard } from './pages/admin';

// Modul Pelacak Kurir Pelanggan
import { PelacakKurirPelanggan } from './pages/user';

/**
 * Komponen Utama Aplikasi React
 * Mengatur seluruh perutean aplikasi dengan React Router v6 dan PrivateRoute
 * yang terorganisir rapi berdasarkan modul domain bisnis.
 */
function App() {
  return (
    <div className="app-container">
      {/* Navigasi Bar Global */}
      <Navbar />

      {/* Konten Utama Aplikasi */}
      <main className="main-content">
        <Routes>
          {/* Rute Publik */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rute Dashboard Pelanggan */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardLayanan />
              </PrivateRoute>
            }
          />

          {/* Modul 1: Layanan */}
          <Route
            path="/layanan"
            element={
              <PrivateRoute>
                <DaftarLayanan />
              </PrivateRoute>
            }
          />
          <Route
            path="/layanan/buat"
            element={
              <PrivateRoute>
                <BuatLayanan />
              </PrivateRoute>
            }
          />

          {/* Modul 2: Detail Layanan */}
          <Route
            path="/layanan/:id"
            element={
              <PrivateRoute>
                <DetailLayanan />
              </PrivateRoute>
            }
          />
          <Route
            path="/detail-layanan/:id"
            element={
              <PrivateRoute>
                <DetailLayanan />
              </PrivateRoute>
            }
          />

          {/* Modul 3: Kurir & Tracking GPS */}
          <Route
            path="/kurir/dashboard"
            element={
              <PrivateRoute role="kurir">
                <KurirDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/kurir"
            element={
              <PrivateRoute role={['kurir', 'admin']}>
                <DaftarKurir />
              </PrivateRoute>
            }
          />
          <Route
            path="/kurir/tracking/:id"
            element={
              <PrivateRoute>
                <TrackingKurir />
              </PrivateRoute>
            }
          />
          <Route
            path="/layanan/:id/tracking"
            element={
              <PrivateRoute>
                <TrackingKurir />
              </PrivateRoute>
            }
          />
          <Route
            path="/pelacak-kurir"
            element={
              <PrivateRoute>
                <PelacakKurirPelanggan />
              </PrivateRoute>
            }
          />
          <Route
            path="/lacak-kurir"
            element={
              <PrivateRoute>
                <PelacakKurirPelanggan />
              </PrivateRoute>
            }
          />

          {/* Modul 4: Pembayaran */}
          <Route
            path="/pembayaran/:id"
            element={
              <PrivateRoute>
                <PembayaranPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/layanan/:id/pembayaran"
            element={
              <PrivateRoute>
                <PembayaranPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/pembayaran/:id/konfirmasi"
            element={
              <PrivateRoute>
                <KonfirmasiPembayaran />
              </PrivateRoute>
            }
          />

          {/* Modul 5: Riwayat Status Layanan */}
          <Route
            path="/riwayat-status/:id"
            element={
              <PrivateRoute>
                <RiwayatStatusLayanan />
              </PrivateRoute>
            }
          />
          <Route
            path="/layanan/:id/riwayat"
            element={
              <PrivateRoute>
                <RiwayatStatusLayanan />
              </PrivateRoute>
            }
          />

          {/* Rute Khusus Administrator */}
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute role="admin">
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/layanan"
            element={
              <PrivateRoute role="admin">
                <DaftarLayanan />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/layanan/:id"
            element={
              <PrivateRoute role="admin">
                <AdminDetailLayanan />
              </PrivateRoute>
            }
          />

          {/* Pengalihan Rute Tak Dikenal */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer Aplikasi */}
      <footer className="footer">
        <div className="container">
          <p>
            &copy; {new Date().getFullYear()} <strong>OptikExpress</strong> — Sistem Informasi Layanan Antar-Jemput Kacamata. Hak Cipta Dilindungi.
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Ikon vektor web disediakan oleh <a href="https://www.flaticon.com/free-icons/web" title="web icons" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Flaticon</a>.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;

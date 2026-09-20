import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Komponen Navigasi & Proteksi Rute
import Navbar from './components/Navbar';
import PrivateRoute from './utils/PrivateRoute';

// Halaman Publik
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// Halaman Pelanggan (Terproteksi)
import Dashboard from './pages/Dashboard';
import BuatLayanan from './pages/BuatLayanan';
import DetailLayanan from './pages/DetailLayanan';

// Halaman Administrator (Terproteksi Khusus Admin)
import AdminDashboard from './pages/admin/AdminDashboard';
import DaftarLayanan from './pages/admin/DaftarLayanan';
import AdminDetailLayanan from './pages/admin/AdminDetailLayanan';

/**
 * Komponen Utama Aplikasi React
 * Mengatur seluruh perutean aplikasi dengan React Router v6 dan PrivateRoute.
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

          {/* Rute Pelanggan (Wajib Login) */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
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
          <Route
            path="/layanan/:id"
            element={
              <PrivateRoute>
                <DetailLayanan />
              </PrivateRoute>
            }
          />

          {/* Rute Khusus Administrator (Wajib Login & Peran Admin) */}
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
        </div>
      </footer>
    </div>
  );
}

export default App;

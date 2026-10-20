import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

/**
 * Komponen Navbar navigasi utama aplikasi.
 * Menampilkan menu sesuai status autentikasi dan peran 3 Role RBAC:
 * Pelanggan, Administrator Optik, dan Kurir Logistik Lapangan.
 */
const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');
  let user = null;

  try {
    user = userJson ? JSON.parse(userJson) : null;
  } catch (e) {
    user = null;
  }

  const handleLogout = () => {
    // Bersihkan sesi di localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const getBrandDestination = () => {
    if (!token) return '/';
    if (user?.role === 'admin') return '/admin/dashboard';
    if (user?.role === 'kurir') return '/kurir/dashboard';
    return '/dashboard';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand / Logo */}
        <Link to={getBrandDestination()} className="navbar-brand">
          <svg
            className="logo-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Ikon Kacamata */}
            <circle cx="6" cy="12" r="4" />
            <circle cx="18" cy="12" r="4" />
            <line x1="10" y1="12" x2="14" y2="12" />
            <path d="M2 12V9a2 2 0 0 1 2-2h1" />
            <path d="M22 12V9a2 2 0 0 0-2-2h-1" />
          </svg>
          <span>OptikExpress</span>
        </Link>

        {/* Navigation Items */}
        <ul className="navbar-menu">
          {!token ? (
            <>
              <li>
                <Link to="/" className={`nav-link ${isActive('/')}`}>
                  Beranda
                </Link>
              </li>
              <li>
                <Link to="/login" className={`nav-link ${isActive('/login')}`}>
                  Masuk
                </Link>
              </li>
              <li>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Daftar
                </Link>
              </li>
            </>
          ) : user?.role === 'admin' ? (
            // Menu Khusus Admin
            <>
              <li>
                <Link to="/admin/dashboard" className={`nav-link ${isActive('/admin/dashboard')}`}>
                  Dashboard Admin
                </Link>
              </li>
              <li>
                <Link to="/admin/layanan" className={`nav-link ${isActive('/admin/layanan')}`}>
                  Kelola Layanan
                </Link>
              </li>
              <li>
                <span className="user-badge">
                  <span>{user.nama || 'Administrator'}</span>
                  <span className="role-tag">Admin</span>
                </span>
              </li>
              <li>
                <button onClick={handleLogout} className="btn btn-danger btn-sm">
                  Keluar
                </button>
              </li>
            </>
          ) : user?.role === 'kurir' ? (
            // Menu Khusus Kurir
            <>
              <li>
                <Link to="/kurir/dashboard" className={`nav-link ${isActive('/kurir/dashboard')}`}>
                  Dashboard Kurir
                </Link>
              </li>
              <li>
                <Link to="/kurir" className={`nav-link ${isActive('/kurir')}`}>
                  Armada Kurir
                </Link>
              </li>
              <li>
                <span className="user-badge">
                  <span>{user.nama || 'Agus Pratama'}</span>
                  <span
                    className="role-tag"
                    style={{ backgroundColor: '#0284c7', color: '#fff', fontWeight: 700 }}
                  >
                    Kurir
                  </span>
                </span>
              </li>
              <li>
                <button onClick={handleLogout} className="btn btn-outline btn-sm">
                  Keluar
                </button>
              </li>
            </>
          ) : (
            // Menu Pelanggan
            <>
              <li>
                <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/layanan/buat" className="btn btn-primary btn-sm">
                  + Buat Pesanan
                </Link>
              </li>
              <li>
                <span className="user-badge">
                  <span>{user?.nama || 'Pelanggan'}</span>
                  <span className="role-tag">Pelanggan</span>
                </span>
              </li>
              <li>
                <button onClick={handleLogout} className="btn btn-outline btn-sm">
                  Keluar
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;


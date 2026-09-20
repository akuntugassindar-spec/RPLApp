import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Komponen PrivateRoute untuk melindungi rute yang membutuhkan login.
 * Jika pengguna belum memiliki token di localStorage, otomatis dialihkan ke halaman /login.
 * Jika prop `role` ditentukan (misal 'admin'), dilakukan validasi hak akses peran pengguna.
 */
const PrivateRoute = ({ children, role }) => {
  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');
  let user = null;

  try {
    user = userJson ? JSON.parse(userJson) : null;
  } catch (e) {
    user = null;
  }

  // Jika belum login, redirect ke halaman login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Jika rute membutuhkan role tertentu (misal admin)
  if (role && (!user || user.role !== role)) {
    // Pengguna biasa yang mencoba akses admin dialihkan ke dashboard pelanggan
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PrivateRoute;

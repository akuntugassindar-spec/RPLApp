import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Komponen PrivateRoute untuk melindungi rute yang membutuhkan login.
 * Jika pengguna belum memiliki token di localStorage, otomatis dialihkan ke halaman /login.
 * Jika prop `role` ditentukan (misal 'admin', 'kurir', atau array ['kurir', 'admin']),
 * dilakukan validasi hak akses peran pengguna sesuai Role-Based Access Control (RBAC).
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

  // Jika rute membutuhkan role tertentu
  if (role) {
    const isAllowed = Array.isArray(role)
      ? role.includes(user?.role)
      : user?.role === role;

    if (!isAllowed) {
      // Pengguna dialihkan ke dashboard sesuai perannya masing-masing
      if (user?.role === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
      }
      if (user?.role === 'kurir') {
        return <Navigate to="/kurir/dashboard" replace />;
      }
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default PrivateRoute;


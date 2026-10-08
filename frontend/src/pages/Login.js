import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

/**
 * Halaman Login Pengguna (Pelanggan & Admin)
 * Mengirimkan kredensial email & password ke POST /api/auth/login,
 * menyimpan JWT token dan objek pengguna ke localStorage,
 * lalu mengarahkan ke dashboard yang sesuai berdasarkan perannya.
 */
const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', formData);

      // Mendukung respons langsung { token, user } atau { data: { token, user } }
      const resData = response.data?.data || response.data;
      const token = resData?.token;
      const user = resData?.user;

      if (!token) {
        throw new Error('Token autentikasi tidak ditemukan dalam respon server.');
      }

      // Simpan kredensial ke localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Redirect berdasarkan role
      if (user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Gagal masuk. Periksa kembali email dan kata sandi Anda.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Masuk ke Akun</h2>
          <p>Silakan masukkan email dan kata sandi Anda</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Alamat Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              placeholder="nama@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Kata Sandi
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Memproses Masuk...' : 'Masuk Sekarang'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Belum memiliki akun?{' '}
          <Link to="/register" style={{ fontWeight: 600 }}>
            Daftar di sini
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

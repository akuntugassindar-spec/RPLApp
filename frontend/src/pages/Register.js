import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

/**
 * Halaman Registrasi Pengguna Baru (Pelanggan)
 * Mengisi nama, email, password, dan nomor telepon,
 * kemudian mengirimkan data ke POST /api/auth/register.
 * Setelah pendaftaran berhasil, pengguna dialihkan ke halaman /login.
 */
const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    password: '',
    no_telepon: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    setSuccess('');

    // Validasi dasar
    if (formData.password.length < 6) {
      setError('Kata sandi minimal harus 6 karakter.');
      setLoading(false);
      return;
    }

    try {
      await api.post('/auth/register', formData);
      setSuccess('Pendaftaran berhasil! Mengalihkan ke halaman masuk...');

      // Berikan jeda sejenak agar pengguna dapat membaca notifikasi berhasil
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      console.error('Registration error:', err);
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Pendaftaran gagal. Pastikan email belum terdaftar atau coba lagi nanti.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Daftar Akun Baru</h2>
          <p>Lengkapi data diri untuk memesan layanan antar-jemput kacamata</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="nama">
              Nama Lengkap
            </label>
            <input
              type="text"
              id="nama"
              name="nama"
              className="form-control"
              placeholder="Contoh: Ahmad Rizki"
              value={formData.nama}
              onChange={handleChange}
              required
            />
          </div>

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
            <label className="form-label" htmlFor="no_telepon">
              Nomor Telepon / WhatsApp
            </label>
            <input
              type="tel"
              id="no_telepon"
              name="no_telepon"
              className="form-control"
              placeholder="081234567890"
              value={formData.no_telepon}
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
              placeholder="Minimal 6 karakter"
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
            {loading ? 'Mendaftarkan Akun...' : 'Daftar Sekarang'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Sudah memiliki akun?{' '}
          <Link to="/login" style={{ fontWeight: 600 }}>
            Masuk di sini
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

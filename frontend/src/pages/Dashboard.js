import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

/**
 * Halaman Dashboard Pelanggan
 * Menampilkan ucapan selamat datang, ringkasan status pesanan aktif,
 * daftar riwayat/layanan terbaru pelanggan, serta tombol cepat untuk membuat permintaan baru.
 */
const Dashboard = () => {
  const [layananList, setLayananList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const userJson = localStorage.getItem('user');
  let user = null;
  try {
    user = userJson ? JSON.parse(userJson) : null;
  } catch (e) {
    user = null;
  }

  // Mengambil data daftar layanan milik pelanggan
  useEffect(() => {
    fetchLayanan();
  }, []);

  const fetchLayanan = async () => {
    setLoading(true);
    setError('');
    try {
      // Backend umumnya menyediakan GET /layanan atau GET /layanan/saya
      let response;
      try {
        response = await api.get('/layanan/saya');
      } catch (err) {
        // Fallback jika rutenya adalah /layanan
        response = await api.get('/layanan');
      }

      const data = response.data?.data || response.data || [];
      setLayananList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Gagal mengambil data layanan:', err);
      setError('Tidak dapat memuat daftar layanan. Pastikan server backend sedang aktif.');
    } finally {
      setLoading(false);
    }
  };

  // Fungsi pembantu untuk memformat teks status dan badge CSS
  const renderStatusBadge = (status) => {
    const s = (status || '').toLowerCase();

    if (s.includes('selesai')) {
      return <span className="badge badge-selesai">✓ Selesai</span>;
    }
    if (s.includes('batal') || s.includes('tolak')) {
      return <span className="badge badge-batal">✕ Dibatalkan</span>;
    }
    if (s.includes('antar')) {
      return <span className="badge badge-antar">🚚 Sedang Diantar</span>;
    }
    if (s.includes('jemput')) {
      return <span className="badge badge-jemput">🛵 Penjemputan</span>;
    }
    if (s.includes('proses') || s.includes('periksa') || s.includes('pengerjaan')) {
      return <span className="badge badge-proses">⚙️ Sedang Dikerjakan</span>;
    }
    if (s.includes('siap')) {
      return <span className="badge badge-siap">📦 Siap Diantar</span>;
    }
    return <span className="badge badge-pending">⏳ Menunggu Konfirmasi</span>;
  };

  // Hitung ringkasan statistik sederhana
  const totalLayanan = layananList.length;
  const aktifLayanan = layananList.filter(
    (l) => !l.status?.toLowerCase().includes('selesai') && !l.status?.toLowerCase().includes('batal')
  ).length;
  const selesaiLayanan = layananList.filter((l) => l.status?.toLowerCase().includes('selesai')).length;

  return (
    <div className="dashboard-page">
      {/* Banner Sambutan */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
          color: '#ffffff',
          padding: '2rem',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            Halo, {user?.nama || 'Pelanggan Setia'}! 👋
          </h1>
          <p style={{ marginTop: '0.35rem', opacity: 0.9 }}>
            Pantau perbaikan kacamata dan jadwalkan penjemputan baru langsung dari sini.
          </p>
        </div>
        <Link to="/layanan/buat" className="btn btn-secondary btn-lg" style={{ backgroundColor: '#ffffff', color: 'var(--primary-dark)', fontWeight: 700 }}>
          + Buat Permintaan Layanan
        </Link>
      </div>

      {/* Ringkasan Metrik Pengguna */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">👓</div>
          <div className="stat-info">
            <h3>{totalLayanan}</h3>
            <p>Total Permintaan</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow">⏳</div>
          <div className="stat-info">
            <h3>{aktifLayanan}</h3>
            <p>Sedang Diproses</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">✅</div>
          <div className="stat-info">
            <h3>{selesaiLayanan}</h3>
            <p>Layanan Selesai</p>
          </div>
        </div>
      </div>

      {/* Daftar Layanan Terkini */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Daftar Permintaan Layanan Saya</h2>
          <button onClick={fetchLayanan} className="btn btn-outline btn-sm">
            🔄 Segarkan Data
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <p>Sedang memuat riwayat layanan Anda...</p>
          </div>
        ) : layananList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Belum Ada Permintaan Layanan</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Kacamata Anda butuh perbaikan atau ganti lensa baru? Pesan penjemputan sekarang.
            </p>
            <Link to="/layanan/buat" className="btn btn-primary">
              Mulai Pesan Layanan Sekarang
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>No / ID</th>
                  <th>Jenis Layanan</th>
                  <th>Kacamata / Keluhan</th>
                  <th>Jadwal Jemput</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {layananList.map((item, idx) => (
                  <tr key={item.id || item._id || idx}>
                    <td style={{ fontWeight: 600 }}>#{item.id || item._id || idx + 1}</td>
                    <td>
                      <strong style={{ textTransform: 'capitalize' }}>
                        {item.jenis_layanan ? item.jenis_layanan.replace('_', ' ') : 'Perbaikan'}
                      </strong>
                    </td>
                    <td>
                      <div>
                        <strong>{item.jenis_kacamata || 'Kacamata'}</strong>
                      </div>
                      <small style={{ color: 'var(--text-muted)' }}>
                        {item.keluhan
                          ? item.keluhan.length > 40
                            ? item.keluhan.substring(0, 40) + '...'
                            : item.keluhan
                          : '-'}
                      </small>
                    </td>
                    <td>
                      <div>{item.tanggal_jemput || '-'}</div>
                      <small style={{ color: 'var(--text-muted)' }}>{item.jam_jemput || ''}</small>
                    </td>
                    <td>{renderStatusBadge(item.status)}</td>
                    <td>
                      <Link
                        to={`/layanan/${item.id || item._id}`}
                        className="btn btn-primary btn-sm"
                      >
                        Detail & Lacak
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

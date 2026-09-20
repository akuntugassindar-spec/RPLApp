import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

/**
 * Halaman Dashboard Administrator
 * Menampilkan metrik statistik layanan optik:
 * Total layanan, Menunggu konfirmasi (pending), Sedang diproses/dikerjakan, dan Selesai.
 * Menampilkan pula tabel daftar pesanan terbaru yang masuk untuk penanganan cepat.
 */
const AdminDashboard = () => {
  const [layananList, setLayananList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAllLayanan = async () => {
    setLoading(true);
    setError('');
    try {
      // Coba endpoint /admin/layanan atau fallback ke /layanan
      let response;
      try {
        response = await api.get('/admin/layanan');
      } catch (err) {
        response = await api.get('/layanan');
      }

      const data = response.data?.data || response.data || [];
      setLayananList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Gagal mengambil data dashboard admin:', err);
      setError('Gagal memuat data statistik admin. Pastikan backend aktif.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllLayanan();
  }, []);

  // Perhitungan statistik
  const totalLayanan = layananList.length;
  const pendingLayanan = layananList.filter((item) => {
    const s = (item.status || '').toLowerCase();
    return s.includes('menunggu') || s.includes('pending') || s === '' || s === 'pengajuan';
  }).length;

  const inProgressLayanan = layananList.filter((item) => {
    const s = (item.status || '').toLowerCase();
    return s.includes('jemput') || s.includes('jadwal') || s === 'diambil' ||
      s.includes('proses') || s.includes('antar') || s.includes('periksa');
  }).length;

  const completedLayanan = layananList.filter((item) => {
    const s = (item.status || '').toLowerCase();
    return s.includes('selesai');
  }).length;

  const renderBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('selesai')) return <span className="badge badge-selesai">✓ Selesai</span>;
    if (s.includes('batal') || s.includes('tolak')) return <span className="badge badge-batal">✕ Batal</span>;
    if (s.includes('antar')) return <span className="badge badge-antar">🚚 Sedang Diantar</span>;
    if (s.includes('jemput')) return <span className="badge badge-jemput">🛵 Penjemputan</span>;
    if (s.includes('proses')) return <span className="badge badge-proses">⚙️ Dikerjakan</span>;
    return <span className="badge badge-pending">⏳ Menunggu Konfirmasi</span>;
  };

  // Ambil 5 pesanan terbaru
  const recentLayanan = [...layananList].slice(0, 5);

  return (
    <div className="admin-dashboard-page">
      {/* Header Dashboard */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--dark)' }}>
            Panel Admin Optik
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Pantau dan kelola seluruh permintaan penjemputan & perbaikan kacamata pelanggan.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={fetchAllLayanan} className="btn btn-outline btn-sm">
            🔄 Refresh Data
          </button>
          <Link to="/admin/layanan" className="btn btn-primary btn-sm">
            Lihat Semua Layanan →
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Grid Metrik Statistik */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">📋</div>
          <div className="stat-info">
            <h3>{totalLayanan}</h3>
            <p>Total Permintaan</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon yellow">⏳</div>
          <div className="stat-info">
            <h3>{pendingLayanan}</h3>
            <p>Menunggu Konfirmasi</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon teal">🔧</div>
          <div className="stat-info">
            <h3>{inProgressLayanan}</h3>
            <p>Sedang Diproses</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">✅</div>
          <div className="stat-info">
            <h3>{completedLayanan}</h3>
            <p>Selesai Dikerjakan</p>
          </div>
        </div>
      </div>

      {/* Tabel Pesanan Terbaru */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Permintaan Layanan Terbaru</h2>
          <Link to="/admin/layanan" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
            Lihat Semua ({totalLayanan})
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <p>Sedang memuat data dashboard...</p>
          </div>
        ) : recentLayanan.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
            Belum ada permintaan layanan yang masuk.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Pelanggan</th>
                  <th>Jenis Layanan</th>
                  <th>Jadwal Jemput</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {recentLayanan.map((item, idx) => (
                  <tr key={item.id || item._id || idx}>
                    <td style={{ fontWeight: 700 }}>#{item.id || item._id || idx + 1}</td>
                    <td>
                      <div>
                        <strong>{item.pelanggan?.nama || item.nama_pelanggan || item.user?.nama || 'Pelanggan'}</strong>
                      </div>
                      <small style={{ color: 'var(--text-muted)' }}>
                        {item.pelanggan?.no_telepon || item.no_telepon || '-'}
                      </small>
                    </td>
                    <td>
                      <span style={{ textTransform: 'capitalize' }}>
                        {item.jenis_layanan ? item.jenis_layanan.replace('_', ' ') : '-'}
                      </span>
                    </td>
                    <td>
                      <div>{item.tanggal_jemput || '-'}</div>
                      <small style={{ color: 'var(--text-muted)' }}>{item.jam_jemput || ''}</small>
                    </td>
                    <td>{renderBadge(item.status)}</td>
                    <td>
                      <Link
                        to={`/admin/layanan/${item.id || item._id}`}
                        className="btn btn-primary btn-sm"
                      >
                        Kelola
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

export default AdminDashboard;

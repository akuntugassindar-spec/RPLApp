import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

/**
 * Halaman Daftar Seluruh Layanan (Administrator)
 * Menampilkan tabel semua permintaan layanan pelanggan dengan fitur filter status
 * dan pencarian berdasarkan nama pelanggan atau keluhan kacamata.
 */
const DaftarLayanan = () => {
  const [layananList, setLayananList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('semua');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLayanan = async () => {
    setLoading(true);
    setError('');
    try {
      let response;
      try {
        response = await api.get('/admin/layanan');
      } catch (err) {
        response = await api.get('/layanan');
      }

      const data = response.data?.data || response.data || [];
      setLayananList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Gagal mengambil daftar layanan admin:', err);
      setError('Gagal memuat data layanan. Pastikan server backend sedang aktif.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLayanan();
  }, []);

  const renderBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('selesai')) return <span className="badge badge-selesai">✓ Selesai</span>;
    if (s.includes('batal') || s.includes('tolak')) return <span className="badge badge-batal">✕ Batal</span>;
    if (s.includes('antar')) return <span className="badge badge-antar">🚚 Sedang Diantar</span>;
    if (s.includes('jemput')) return <span className="badge badge-jemput">🛵 Penjemputan</span>;
    if (s.includes('proses') || s.includes('periksa')) return <span className="badge badge-proses">⚙️ Dikerjakan</span>;
    return <span className="badge badge-pending">⏳ Menunggu</span>;
  };

  // Logika Filter & Pencarian
  const filteredLayanan = useMemo(() => {
    return layananList.filter((item) => {
      // 1. Filter Status
      let matchStatus = true;
      const s = (item.status || '').toLowerCase();

      if (statusFilter === 'pending') {
        matchStatus = s.includes('menunggu') || s.includes('pending') || s === '' || s === 'pengajuan';
      } else if (statusFilter === 'penjemputan') {
        matchStatus = s.includes('jemput') || s.includes('jadwal') || s === 'diambil';
      } else if (statusFilter === 'pengerjaan') {
        matchStatus = s.includes('proses') || s.includes('periksa') || s === 'diproses';
      } else if (statusFilter === 'diantar') {
        matchStatus = s.includes('antar') || s.includes('siap');
      } else if (statusFilter === 'selesai') {
        matchStatus = s.includes('selesai');
      } else if (statusFilter === 'batal') {
        matchStatus = s.includes('batal') || s.includes('tolak');
      }

      // 2. Filter Search Query
      const custName = (
        item.pelanggan?.nama ||
        item.nama_pelanggan ||
        item.user?.nama ||
        ''
      ).toLowerCase();
      const kacamata = (item.jenis_kacamata || '').toLowerCase();
      const keluhan = (item.keluhan || '').toLowerCase();
      const idStr = String(item.id || item._id || '').toLowerCase();
      const q = searchQuery.toLowerCase();

      const matchSearch =
        custName.includes(q) ||
        kacamata.includes(q) ||
        keluhan.includes(q) ||
        idStr.includes(q);

      return matchStatus && matchSearch;
    });
  }, [layananList, statusFilter, searchQuery]);

  return (
    <div className="daftar-layanan-admin">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--dark)' }}>
            Kelola Layanan Kacamata
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Daftar lengkap seluruh transaksi dan pesanan antar-jemput pelanggan
          </p>
        </div>
        <button onClick={fetchLayanan} className="btn btn-outline btn-sm">
          🔄 Segarkan Data
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Filter & Search Bar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Pencarian */}
          <div style={{ flex: '1 1 280px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Cari berdasarkan nama pelanggan, ID, jenis kacamata..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Tombol Filter Status */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {[
              { key: 'semua', label: 'Semua' },
              { key: 'pending', label: 'Menunggu' },
              { key: 'penjemputan', label: 'Penjemputan' },
              { key: 'pengerjaan', label: 'Pengerjaan' },
              { key: 'diantar', label: 'Diantar' },
              { key: 'selesai', label: 'Selesai' },
            ].map((btn) => (
              <button
                key={btn.key}
                type="button"
                className={`btn btn-sm ${statusFilter === btn.key ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setStatusFilter(btn.key)}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabel Data */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            Daftar Pesanan ({filteredLayanan.length} data ditemukan)
          </h2>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <p>Memuat daftar layanan...</p>
          </div>
        ) : filteredLayanan.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Tidak ada pesanan layanan yang cocok dengan kriteria pencarian / filter.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nama Pelanggan</th>
                  <th>Jenis Layanan</th>
                  <th>Detail Kacamata</th>
                  <th>Tanggal Jemput</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredLayanan.map((item, idx) => (
                  <tr key={item.id || item._id || idx}>
                    <td style={{ fontWeight: 700 }}>#{item.id || item._id || idx + 1}</td>
                    <td>
                      <div>
                        <strong>
                          {item.pelanggan?.nama || item.nama_pelanggan || item.user?.nama || 'Pelanggan'}
                        </strong>
                      </div>
                      <small style={{ color: 'var(--text-muted)' }}>
                        📞 {item.pelanggan?.no_telepon || item.no_telepon || '-'}
                      </small>
                    </td>
                    <td>
                      <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>
                        {item.jenis_layanan ? item.jenis_layanan.replace('_', ' ') : '-'}
                      </span>
                    </td>
                    <td>
                      <div>{item.jenis_kacamata || '-'}</div>
                      <small style={{ color: 'var(--text-muted)' }}>
                        {item.keluhan
                          ? item.keluhan.length > 35
                            ? item.keluhan.substring(0, 35) + '...'
                            : item.keluhan
                          : '-'}
                      </small>
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
                        Detail & Update
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

export default DaftarLayanan;

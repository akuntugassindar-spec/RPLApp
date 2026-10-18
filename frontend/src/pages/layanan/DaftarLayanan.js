import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

/**
 * Halaman Daftar Layanan (Daftar Layanan)
 * Menampilkan seluruh daftar permintaan servis kacamata dengan fitur:
 * 1. Filter status (semua, pengajuan, dijadwalkan, diambil, diproses, diantar, selesai)
 * 2. Filter jenis layanan (perbaikan, penggantian_lensa, perbaikan_dan_lensa)
 * 3. Pencarian instan (nama pelanggan, model kacamata, keluhan)
 * 4. Tautan aksi cepat (Detail, Lacak Kurir, Pembayaran)
 */
const DaftarLayanan = () => {
  const [layananList, setLayananList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('semua');
  const [jenisFilter, setJenisFilter] = useState('semua');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLayanan = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/layanan');
      const data = response.data?.data || response.data || [];
      setLayananList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Gagal mengambil daftar layanan:', err);
      setError('Gagal memuat data layanan. Pastikan server aktif.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (window.confirm(`Batalkan pengajuan layanan #${itemId}?`)) {
      try {
        await api.delete(`/layanan/${itemId}`);
        alert(`Pengajuan #${itemId} berhasil dibatalkan.`);
        setLayananList((prev) => prev.filter((item) => item.id !== itemId));
      } catch (err) {
        alert('Gagal membatalkan: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  useEffect(() => {
    fetchLayanan();
  }, []);

  const filteredLayanan = useMemo(() => {
    return layananList.filter((item) => {
      const matchStatus = statusFilter === 'semua' || (item.status || '').toLowerCase() === statusFilter.toLowerCase();
      const matchJenis = jenisFilter === 'semua' || (item.jenis_layanan || '').toLowerCase() === jenisFilter.toLowerCase();
      const q = searchQuery.toLowerCase();
      const matchQuery =
        !searchQuery ||
        (item.nama_pelanggan && item.nama_pelanggan.toLowerCase().includes(q)) ||
        (item.pelanggan?.nama && item.pelanggan.nama.toLowerCase().includes(q)) ||
        (item.keluhan && item.keluhan.toLowerCase().includes(q)) ||
        (item.jenis_kacamata && item.jenis_kacamata.toLowerCase().includes(q)) ||
        String(item.id).includes(q);

      return matchStatus && matchJenis && matchQuery;
    });
  }, [layananList, statusFilter, jenisFilter, searchQuery]);

  const renderBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('selesai')) return <span className="badge badge-selesai">Selesai</span>;
    if (s.includes('batal') || s.includes('tolak')) return <span className="badge badge-batal">Dibatalkan</span>;
    if (s.includes('antar')) return <span className="badge badge-antar">Sedang Diantar</span>;
    if (s.includes('jemput') || s === 'diambil' || s === 'dijadwalkan') return <span className="badge badge-jemput">Penjemputan</span>;
    if (s.includes('proses')) return <span className="badge badge-proses">Dikerjakan di Lab</span>;
    return <span className="badge badge-pending">Menunggu Konfirmasi</span>;
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--dark)' }}>
            Daftar Layanan Antar-Jemput
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Pantau dan kelola seluruh antrean pengerjaan servis kacamata OptikExpress
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={fetchLayanan} className="btn btn-outline btn-sm">
            Refresh
          </button>
          <Link to="/layanan/buat" className="btn btn-primary btn-sm">
            + Ajukan Layanan Baru
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Filter & Pencarian */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.85rem' }}>Pencarian Kata Kunci</label>
            <input
              type="text"
              className="form-control"
              placeholder="Cari nama, keluhan, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.85rem' }}>Filter Status</label>
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="semua">Semua Status</option>
              <option value="pengajuan">Menunggu Konfirmasi</option>
              <option value="dijadwalkan">Dijadwalkan</option>
              <option value="diambil">Dijemput Kurir</option>
              <option value="diproses">Dikerjakan Teknisi</option>
              <option value="diantar">Sedang Diantar</option>
              <option value="selesai">Selesai</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.85rem' }}>Filter Jenis Layanan</label>
            <select
              className="form-control"
              value={jenisFilter}
              onChange={(e) => setJenisFilter(e.target.value)}
            >
              <option value="semua">Semua Jenis Layanan</option>
              <option value="perbaikan">Perbaikan Frame</option>
              <option value="penggantian_lensa">Penggantian Lensa</option>
              <option value="perbaikan_dan_lensa">Perbaikan + Lensa</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabel Layanan */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Memuat data layanan...
          </div>
        ) : filteredLayanan.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Tidak ada data layanan yang sesuai.</p>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Coba ubah filter pencarian atau buat pengajuan baru.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', marginBottom: 0 }}>
              <thead>
                <tr>
                  <th style={{ width: '70px' }}>ID</th>
                  <th>Pelanggan</th>
                  <th>Layanan & Model</th>
                  <th>Jadwal Jemput</th>
                  <th>Biaya</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center', width: '220px' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredLayanan.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>#{item.id}</strong>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--dark)' }}>
                        {item.nama_pelanggan || item.pelanggan?.nama || 'Pelanggan'}
                      </div>
                      <small style={{ color: 'var(--text-muted)' }}>
                        {item.no_telepon_pelanggan || item.no_telepon || '-'}
                      </small>
                    </td>
                    <td>
                      <div style={{ textTransform: 'capitalize', fontWeight: 600, color: '#0369a1' }}>
                        {item.jenis_layanan ? item.jenis_layanan.replace('_', ' ') : '-'}
                      </div>
                      <small style={{ color: '#475569' }}>
                        {item.jenis_kacamata || item.keluhan || '-'}
                      </small>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.tanggal_jemput || '-'}</div>
                      <small style={{ color: 'var(--text-muted)' }}>{item.jam_jemput || '-'} WIB</small>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f766e' }}>
                        Rp {Number(item.total_biaya || 0).toLocaleString('id-ID')}
                      </div>
                      <small style={{ color: item.status_pembayaran === 'lunas' ? '#16a34a' : '#d97706', fontWeight: 600, textTransform: 'uppercase' }}>
                        {item.status_pembayaran || 'Belum Bayar'}
                      </small>
                    </td>
                    <td>{renderBadge(item.status)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to={`/layanan/${item.id}`} className="btn btn-outline btn-sm" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
                          Detail
                        </Link>
                        <Link to={`/kurir/tracking/${item.id}`} className="btn btn-sm" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', backgroundColor: '#0284c7', color: '#fff', border: 'none' }}>
                          Lacak
                        </Link>
                        {item.status === 'pengajuan' && (
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="btn btn-sm"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', backgroundColor: '#ef4444', color: '#fff', border: 'none' }}
                          >
                            Batal
                          </button>
                        )}
                      </div>
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


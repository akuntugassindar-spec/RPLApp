import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

/**
 * Halaman Dashboard Layanan (Pelanggan)
 * Menampilkan ringkasan pesanan aktif, statistik layanan kacamata,
 * dan daftar pengajuan terbaru dengan navigasi ke detail, pelacakan kurir, dan pembayaran.
 */
const DashboardLayanan = () => {
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

  const fetchLayanan = async () => {
    setLoading(true);
    setError('');
    try {
      let response;
      try {
        response = await api.get('/layanan/saya');
      } catch (err) {
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

  useEffect(() => {
    fetchLayanan();
  }, []);

  const renderStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('selesai')) return <span className="badge badge-selesai">Selesai</span>;
    if (s.includes('batal') || s.includes('tolak')) return <span className="badge badge-batal">Dibatalkan</span>;
    if (s.includes('antar')) return <span className="badge badge-antar">Sedang Diantar</span>;
    if (s.includes('jemput') || s === 'diambil' || s === 'dijadwalkan') return <span className="badge badge-jemput">Penjemputan</span>;
    if (s.includes('proses')) return <span className="badge badge-proses">Dikerjakan di Lab</span>;
    return <span className="badge badge-pending">Menunggu Konfirmasi</span>;
  };

  const totalPesanan = layananList.length;
  const pesananAktif = layananList.filter((item) => {
    const s = (item.status || '').toLowerCase();
    return !s.includes('selesai') && !s.includes('batal') && !s.includes('tolak');
  }).length;
  const pesananSelesai = layananList.filter((item) => (item.status || '').toLowerCase().includes('selesai')).length;
  const belumBayar = layananList.filter((item) => item.status_pembayaran !== 'lunas').length;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Header Dashboard */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--dark)' }}>
            Selamat Datang, {user?.nama || 'Pelanggan'}!
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Pantau progres servis kacamata, status kurir, dan pembayaran Anda di sini.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/layanan/buat" className="btn btn-primary">
            + Buat Pengajuan Baru
          </Link>
          <Link to="/kurir" className="btn btn-outline">
            Armada Kurir
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Kartu Ringkasan Metrik */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="card" style={{ borderLeft: '4px solid #0284c7' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL PENGAJUAN</span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0284c7', marginTop: '0.25rem' }}>
            {totalPesanan}
          </h2>
          <small style={{ color: 'var(--text-muted)' }}>Seluruh riwayat servis</small>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>SEDANG BERJALAN</span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.25rem' }}>
            {pesananAktif}
          </h2>
          <small style={{ color: 'var(--text-muted)' }}>Dalam proses penjemputan/lab</small>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #10b981' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>SELESAI TUNTAS</span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981', marginTop: '0.25rem' }}>
            {pesananSelesai}
          </h2>
          <small style={{ color: 'var(--text-muted)' }}>Kacamata berhasil diterima</small>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #ef4444' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>TAGIHAN BELUM LUNAS</span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#ef4444', marginTop: '0.25rem' }}>
            {belumBayar}
          </h2>
          <small style={{ color: 'var(--text-muted)' }}>Menunggu pelunasan</small>
        </div>
      </div>

      {/* Tabel Permintaan Layanan Terkini */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
            Daftar Pesanan Layanan Saya
          </h2>
          <button onClick={fetchLayanan} className="btn btn-outline btn-sm">
            Refresh Data
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Memuat daftar layanan...
          </div>
        ) : layananList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--dark)' }}>
              Belum ada riwayat permintaan layanan.
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Ajukan perbaikan frame atau ganti lensa sekarang dengan penjemputan langsung ke rumah Anda.
            </p>
            <Link to="/layanan/buat" className="btn btn-primary">
              Ajukan Servis Kacamata Pertama Anda
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', marginBottom: 0 }}>
              <thead>
                <tr>
                  <th style={{ width: '70px' }}>ID</th>
                  <th>Layanan</th>
                  <th>Keluhan</th>
                  <th>Jadwal Jemput</th>
                  <th>Status Layanan</th>
                  <th>Biaya</th>
                  <th style={{ textAlign: 'center', width: '220px' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {layananList.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>#{item.id}</strong>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, textTransform: 'capitalize', color: '#0369a1' }}>
                        {item.jenis_layanan ? item.jenis_layanan.replace('_', ' ') : '-'}
                      </div>
                      <small style={{ color: 'var(--text-muted)' }}>{item.jenis_kacamata || '-'}</small>
                    </td>
                    <td style={{ maxWidth: '200px' }}>
                      <span style={{ fontSize: '0.9rem' }}>{item.keluhan || '-'}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.tanggal_jemput || '-'}</div>
                      <small style={{ color: 'var(--text-muted)' }}>{item.jam_jemput || '-'} WIB</small>
                    </td>
                    <td>{renderStatusBadge(item.status)}</td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f766e' }}>
                        Rp {Number(item.total_biaya || 0).toLocaleString('id-ID')}
                      </div>
                      <small style={{ color: item.status_pembayaran === 'lunas' ? '#16a34a' : '#d97706', fontWeight: 600, textTransform: 'uppercase' }}>
                        {item.status_pembayaran || 'Belum Bayar'}
                      </small>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to={`/layanan/${item.id}`} className="btn btn-outline btn-sm">
                          Detail
                        </Link>
                        <Link to={`/kurir/tracking/${item.id}`} className="btn btn-sm" style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none' }}>
                          Lacak
                        </Link>
                        {item.status_pembayaran !== 'lunas' && item.total_biaya > 0 && (
                          <Link to={`/pembayaran/${item.id}`} className="btn btn-sm" style={{ backgroundColor: '#10b981', color: '#fff', border: 'none' }}>
                            Bayar
                          </Link>
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

export default DashboardLayanan;

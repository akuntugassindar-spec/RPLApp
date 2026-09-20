import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';

/**
 * Halaman Detail Permintaan Layanan (Pelanggan)
 * Menampilkan rincian lengkap pesanan perbaikan/lensa kacamata
 * disertai visualisasi alur timeline status pengerjaan secara real-time.
 */
const DetailLayanan = () => {
  const { id } = useParams();

  const [layanan, setLayanan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/layanan/${id}`);
      const data = response.data?.data || response.data;
      setLayanan(data);
    } catch (err) {
      console.error('Gagal mengambil detail layanan:', err);
      setError('Gagal memuat detail layanan. Pastikan ID pesanan valid dan Anda memiliki akses.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  // Tahapan urutan timeline status
  const steps = [
    { key: 'pengajuan', label: '1. Diajukan', desc: 'Menunggu konfirmasi optik' },
    { key: 'diambil', label: '2. Penjemputan', desc: 'Kurir menjemput kacamata' },
    { key: 'diproses', label: '3. Pengerjaan', desc: 'Diperbaiki oleh teknisi optik' },
    { key: 'diantar', label: '4. Pengantaran', desc: 'Kacamata diantar kembali' },
    { key: 'selesai', label: '5. Selesai', desc: 'Layanan telah selesai' },
  ];

  // Menentukan index tahapan saat ini untuk pewarnaan timeline
  const getCurrentStepIndex = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('selesai')) return 4;
    if (s.includes('antar') || s.includes('siap')) return 3;
    if (s.includes('proses') || s.includes('periksa') || s.includes('pengerjaan')) return 2;
    if (s.includes('jemput') || s === 'diambil' || s === 'dijadwalkan') return 1;
    return 0; // default menunggu konfirmasi
  };

  const currentStep = layanan ? getCurrentStepIndex(layanan.status) : 0;
  const isCancelled = layanan?.status?.toLowerCase().includes('batal') || layanan?.status?.toLowerCase().includes('tolak');

  const renderBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('selesai')) return <span className="badge badge-selesai">✓ Selesai</span>;
    if (s.includes('batal') || s.includes('tolak')) return <span className="badge badge-batal">✕ Dibatalkan</span>;
    if (s.includes('antar')) return <span className="badge badge-antar">🚚 Sedang Diantar</span>;
    if (s.includes('jemput')) return <span className="badge badge-jemput">🛵 Penjemputan</span>;
    if (s.includes('proses')) return <span className="badge badge-proses">⚙️ Sedang Dikerjakan</span>;
    return <span className="badge badge-pending">⏳ Menunggu Konfirmasi</span>;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
        <p>Memuat rincian pesanan layanan #{id}...</p>
      </div>
    );
  }

  if (error || !layanan) {
    return (
      <div style={{ maxWidth: '800px', margin: '2rem auto' }}>
        <div className="alert alert-danger">{error || 'Data layanan tidak ditemukan.'}</div>
        <Link to="/dashboard" className="btn btn-outline">
          ← Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Tombol Kembali & Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/dashboard" className="btn btn-outline btn-sm">
            ← Kembali ke Dashboard
          </Link>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--dark)' }}>
            Pesanan #{layanan.id || id}
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {renderBadge(layanan.status)}
          <button onClick={fetchDetail} className="btn btn-outline btn-sm">
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Visualisasi Timeline Status */}
      <div className="card">
        <h2 className="card-title" style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
          Status & Progres Layanan
        </h2>

        {isCancelled ? (
          <div className="alert alert-danger" style={{ marginTop: '1rem' }}>
            Permintaan layanan ini telah dibatalkan atau ditolak. Silakan hubungi admin optik kami untuk info lebih lanjut.
          </div>
        ) : (
          <div className="timeline-container">
            <div className="timeline">
              {steps.map((step, idx) => {
                let statusClass = '';
                if (idx < currentStep) statusClass = 'completed';
                else if (idx === currentStep) statusClass = 'active';

                return (
                  <div key={step.key} className={`timeline-step ${statusClass}`}>
                    <div className="timeline-icon">
                      {idx < currentStep ? '✓' : idx + 1}
                    </div>
                    <div className="timeline-title">{step.label}</div>
                    <div className="timeline-desc">{step.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Rincian Permintaan Layanan */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Informasi Kacamata & Kerusakan */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ fontSize: '1.1rem' }}>
              👓 Informasi Kacamata
            </h3>
          </div>
          <table style={{ width: '100%', fontSize: '0.95rem' }}>
            <tbody>
              <tr>
                <td style={{ padding: '0.5rem 0', color: 'var(--text-muted)', width: '40%' }}>Jenis Layanan:</td>
                <td style={{ padding: '0.5rem 0', fontWeight: 600, textTransform: 'capitalize' }}>
                  {layanan.jenis_layanan ? layanan.jenis_layanan.replace('_', ' ') : '-'}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '0.5rem 0', color: 'var(--text-muted)' }}>Tipe Kacamata:</td>
                <td style={{ padding: '0.5rem 0', fontWeight: 600 }}>
                  {layanan.jenis_kacamata || '-'}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '0.5rem 0', color: 'var(--text-muted)', verticalAlign: 'top' }}>Keluhan:</td>
                <td style={{ padding: '0.5rem 0', fontWeight: 500 }}>
                  {layanan.keluhan || '-'}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '0.5rem 0', color: 'var(--text-muted)', verticalAlign: 'top' }}>Detail / Resep:</td>
                <td style={{ padding: '0.5rem 0', fontWeight: 500 }}>
                  {layanan.detail_perbaikan || '-'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Informasi Penjemputan & Pengantaran */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ fontSize: '1.1rem' }}>
              📍 Informasi Penjemputan
            </h3>
          </div>
          <table style={{ width: '100%', fontSize: '0.95rem' }}>
            <tbody>
              <tr>
                <td style={{ padding: '0.5rem 0', color: 'var(--text-muted)', width: '40%' }}>Tanggal Jemput:</td>
                <td style={{ padding: '0.5rem 0', fontWeight: 600 }}>
                  {layanan.tanggal_jemput || '-'}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '0.5rem 0', color: 'var(--text-muted)' }}>Waktu Jemput:</td>
                <td style={{ padding: '0.5rem 0', fontWeight: 600 }}>
                  {layanan.jam_jemput || '-'}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '0.5rem 0', color: 'var(--text-muted)', verticalAlign: 'top' }}>Alamat Jemput:</td>
                <td style={{ padding: '0.5rem 0', fontWeight: 500 }}>
                  {layanan.alamat || '-'}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '0.5rem 0', color: 'var(--text-muted)', verticalAlign: 'top' }}>Catatan Khusus:</td>
                <td style={{ padding: '0.5rem 0', fontWeight: 500 }}>
                  {layanan.keterangan || '-'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Ringkasan Biaya (Jika ada) */}
      <div className="card" style={{ backgroundColor: '#f8fafc', borderLeft: '4px solid var(--primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h4 style={{ fontWeight: 700, color: 'var(--dark)' }}>Perkiraan Biaya Layanan</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Biaya total mencakup ongkos antar-jemput dan pengerjaan optik sesuai kondisi kacamata.
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-dark)' }}>
              {layanan.total_biaya || layanan.biaya
                ? `Rp ${Number(layanan.total_biaya || layanan.biaya).toLocaleString('id-ID')}`
                : 'Estimasi saat pemeriksaan'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailLayanan;

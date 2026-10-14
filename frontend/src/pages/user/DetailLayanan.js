import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';

/**
 * Halaman Detail Permintaan Layanan (Pelanggan)
 * Menampilkan rincian lengkap pesanan perbaikan/lensa kacamata,
 * foto kondisi fisik & resep dokter, pelacakan live GPS armada kurir,
 * serta simulasi pembayaran online melalui Midtrans Snap sandbox.
 */
const DetailLayanan = () => {
  const { id } = useParams();

  const [layanan, setLayanan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Tracking kurir
  const [trackingData, setTrackingData] = useState(null);

  // Midtrans Payment Modal
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedMetode, setSelectedMetode] = useState('qris');
  const [paymentTransaction, setPaymentTransaction] = useState(null);
  const [processingPay, setProcessingPay] = useState(false);

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

  const fetchTracking = useCallback(async () => {
    try {
      const response = await api.get(`/layanan/${id}/tracking`);
      setTrackingData(response.data?.data || null);
    } catch (err) {
      // Tracking belum tersedia / tidak ada
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
    fetchTracking();
  }, [fetchDetail, fetchTracking]);

  // Handle Mulai Pembayaran (Midtrans Sandbox)
  const handleStartPayment = async () => {
    setProcessingPay(true);
    setError('');
    try {
      const res = await api.post(`/layanan/${id}/pembayaran`, {
        metode_pembayaran: selectedMetode
      });
      setPaymentTransaction(res.data?.data || null);
    } catch (err) {
      alert('Gagal memproses metode pembayaran: ' + (err.response?.data?.message || err.message));
    } finally {
      setProcessingPay(false);
    }
  };

  // Handle Konfirmasi Pembayaran Berhasil (Simulasi Midtrans Notification / Webhook)
  const handleConfirmPayment = async () => {
    setProcessingPay(true);
    try {
      await api.post(`/layanan/${id}/pembayaran/konfirmasi`);
      setSuccess('Pembayaran berhasil dikonfirmasi! Terima kasih atas pembayaran Anda.');
      setShowPayModal(false);
      setPaymentTransaction(null);
      fetchDetail();
    } catch (err) {
      alert('Gagal mengonfirmasi pembayaran: ' + (err.response?.data?.message || err.message));
    } finally {
      setProcessingPay(false);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const base = process.env.REACT_APP_API_URL
      ? process.env.REACT_APP_API_URL.replace(/\/api$/, '')
      : '';
    return `${base}${path}`;
  };

  // Tahapan alur status
  const steps = [
    { key: 'pengajuan', label: '1. Diajukan', desc: 'Menunggu verifikasi optik' },
    { key: 'diambil', label: '2. Penjemputan', desc: 'Kurir menjemput kacamata' },
    { key: 'diproses', label: '3. Pengerjaan', desc: 'Diperbaiki oleh teknisi optik' },
    { key: 'diantar', label: '4. Pengantaran', desc: 'Kacamata diantar kembali' },
    { key: 'selesai', label: '5. Selesai', desc: 'Layanan telah selesai' },
  ];

  const getCurrentStepIndex = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('selesai')) return 4;
    if (s.includes('antar') || s.includes('siap')) return 3;
    if (s.includes('proses') || s.includes('periksa') || s.includes('pengerjaan')) return 2;
    if (s.includes('jemput') || s === 'diambil' || s === 'dijadwalkan') return 1;
    return 0;
  };

  const currentStep = layanan ? getCurrentStepIndex(layanan.status) : 0;
  const isCancelled = layanan?.status?.toLowerCase().includes('batal') || layanan?.status?.toLowerCase().includes('tolak');

  const renderBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('selesai')) return <span className="badge badge-selesai">✓ Selesai</span>;
    if (s.includes('batal') || s.includes('tolak')) return <span className="badge badge-batal">✕ Dibatalkan</span>;
    if (s.includes('antar')) return <span className="badge badge-antar">🚚 Kacamata Diantar</span>;
    if (s.includes('jemput') || s === 'diambil') return <span className="badge badge-jemput">🛵 Kurir Menjemput</span>;
    if (s.includes('proses')) return <span className="badge badge-proses">⚙️ Sedang Dikerjakan</span>;
    return <span className="badge badge-pending">⏳ Menunggu Konfirmasi</span>;
  };

  const isLunas = layanan?.status_pembayaran === 'lunas';
  const totalBiaya = layanan?.total_biaya || layanan?.biaya || 150000;

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
        <p>Memuat detail layanan #{id}...</p>
      </div>
    );
  }

  if (error && !layanan) {
    return (
      <div style={{ maxWidth: '800px', margin: '2rem auto' }}>
        <div className="alert alert-danger">{error}</div>
        <Link to="/dashboard" className="btn btn-outline">
          ← Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto' }}>
      {/* Header Halaman */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/dashboard" className="btn btn-outline btn-sm">
            ← Kembali
          </Link>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--dark)' }}>
            Detail Pesanan #{layanan?.id || id}
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {renderBadge(layanan?.status)}
          <button onClick={() => { fetchDetail(); fetchTracking(); }} className="btn btn-outline btn-sm">
            🔄 Refresh
          </button>
        </div>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Visualisasi Timeline Status */}
      <div className="card">
        <h2 className="card-title" style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>
          Status Pengerjaan Kacamata
        </h2>
        {isCancelled ? (
          <div className="alert alert-danger" style={{ marginTop: '1rem' }}>
            Permintaan layanan ini telah dibatalkan atau ditolak. Silakan hubungi optik jika ada pertanyaan.
          </div>
        ) : (
          <div className="timeline-container">
            <div className="timeline">
              {steps.map((step, idx) => {
                let stepClass = '';
                if (idx < currentStep) stepClass = 'completed';
                else if (idx === currentStep) stepClass = 'active';

                return (
                  <div key={step.key} className={`timeline-step ${stepClass}`}>
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

      {/* Live Courier GPS Tracking */}
      {trackingData && (
        <div className="card" style={{ border: '2px solid #bae6fd', backgroundColor: '#f0f9ff' }}>
          <div className="card-header" style={{ borderColor: '#bae6fd' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.4rem' }}>🛵</span>
              <div>
                <h3 className="card-title" style={{ fontSize: '1.15rem', color: '#0369a1' }}>
                  Pelacakan Langsung Armada Kurir (Live GPS)
                </h3>
                <small style={{ color: '#0284c7' }}>Posisi real-time penjemputan / pengantaran kacamata Anda</small>
              </div>
            </div>
            <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.3rem 0.75rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 700 }}>
              ⏱️ Estimasi Tiba: {trackingData.estimasi_tiba}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginTop: '0.5rem' }}>
            {/* Info Driver Kurir */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', background: '#fff', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #e0f2fe' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                  🏍️
                </div>
                <div>
                  <h4 style={{ fontWeight: 700, margin: 0 }}>{trackingData.kurir?.nama || 'Agus Pratama'}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '2px 0' }}>{trackingData.kurir?.kendaraan || 'Honda Vario 160'}</p>
                  <p style={{ fontSize: '0.85rem', color: '#0369a1', fontWeight: 600, margin: 0 }}>📞 {trackingData.kurir?.telepon || '0812-3456-7890'}</p>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: '#0369a1' }}>
                  <span>Progres Perjalanan</span>
                  <span>{trackingData.persentase_perjalanan}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: `${trackingData.persentase_perjalanan}%`, height: '100%', background: 'linear-gradient(90deg, #0284c7, #0d9488)', borderRadius: '999px', transition: 'width 0.5s ease' }} />
                </div>
                <p style={{ fontSize: '0.85rem', color: '#334155', marginTop: '0.5rem', fontStyle: 'italic' }}>
                  📍 {trackingData.status_deskripsi}
                </p>
              </div>
            </div>

            {/* Peta Interaktif Rute */}
            <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', padding: '1rem', border: '1px solid #e0f2fe', minHeight: '190px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>PETA RUTE LIVE</span>
                <span style={{ fontSize: '0.75rem', background: '#dcfce7', color: '#15803d', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>● RADAR AKTIF</span>
              </div>
              <svg viewBox="0 0 320 140" style={{ width: '100%', height: '130px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <path d="M 30 70 Q 110 20, 160 70 T 290 70" fill="none" stroke="#cbd5e1" strokeWidth="8" strokeLinecap="round" />
                <path d="M 30 70 Q 110 20, 160 70 T 290 70" fill="none" stroke="#0284c7" strokeWidth="4" strokeDasharray="6,4" strokeLinecap="round" />
                <circle cx="30" cy="70" r="12" fill="#0369a1" />
                <text x="30" y="74" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">🏪</text>
                <text x="30" y="98" textAnchor="middle" fill="#0f172a" fontSize="9" fontWeight="bold">Lab Optik</text>
                {(() => {
                  const p = (trackingData.persentase_perjalanan || 50) / 100;
                  const cx = 30 + 260 * p;
                  const cy = 70 + Math.sin(p * Math.PI) * -35;
                  return (
                    <g transform={`translate(${cx},${cy})`}>
                      <circle cx="0" cy="0" r="16" fill="#0284c7" fillOpacity="0.2">
                        <animate attributeName="r" values="12;20;12" dur="2s" repeatCount="indefinite" />
                      </circle>
                      <circle cx="0" cy="0" r="11" fill="#0d9488" stroke="#fff" strokeWidth="2" />
                      <text x="0" y="4" textAnchor="middle" fill="#fff" fontSize="10">🛵</text>
                    </g>
                  );
                })()}
                <circle cx="290" cy="70" r="12" fill="#10b981" />
                <text x="290" y="74" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">🏠</text>
                <text x="290" y="98" textAnchor="middle" fill="#0f172a" fontSize="9" fontWeight="bold">Lokasi Anda</text>
              </svg>
              <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
                <span>🏪 {trackingData.lokasi_optik?.nama}</span>
                <span>🏠 {layanan?.alamat ? layanan.alamat.slice(0, 22) + '...' : 'Alamat Anda'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rincian Pesanan & Penjemputan */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Detail Kerusakan */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ fontSize: '1.1rem' }}>
              👓 Informasi Kacamata & Keluhan
            </h3>
          </div>
          <table style={{ width: '100%', fontSize: '0.95rem' }}>
            <tbody>
              <tr>
                <td style={{ padding: '0.5rem 0', color: 'var(--text-muted)', width: '40%' }}>Jenis Layanan:</td>
                <td style={{ padding: '0.5rem 0', fontWeight: 600, textTransform: 'capitalize' }}>
                  {layanan?.jenis_layanan ? layanan.jenis_layanan.replace(/_/g, ' ') : '-'}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '0.5rem 0', color: 'var(--text-muted)' }}>Model Kacamata:</td>
                <td style={{ padding: '0.5rem 0', fontWeight: 600 }}>
                  {layanan?.jenis_kacamata || '-'}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '0.5rem 0', color: 'var(--text-muted)', verticalAlign: 'top' }}>Keluhan:</td>
                <td style={{ padding: '0.5rem 0', fontWeight: 500 }}>
                  {layanan?.keluhan || '-'}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '0.5rem 0', color: 'var(--text-muted)', verticalAlign: 'top' }}>Ukuran / Detail:</td>
                <td style={{ padding: '0.5rem 0', fontWeight: 500 }}>
                  {layanan?.detail_perbaikan || '-'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Informasi Penjemputan */}
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
                  {layanan?.tanggal_jemput || '-'}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '0.5rem 0', color: 'var(--text-muted)' }}>Waktu Jemput:</td>
                <td style={{ padding: '0.5rem 0', fontWeight: 600 }}>
                  {layanan?.jam_jemput || '-'}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '0.5rem 0', color: 'var(--text-muted)', verticalAlign: 'top' }}>Alamat Jemput:</td>
                <td style={{ padding: '0.5rem 0', fontWeight: 500 }}>
                  {layanan?.alamat || '-'}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '0.5rem 0', color: 'var(--text-muted)', verticalAlign: 'top' }}>Catatan Khusus:</td>
                <td style={{ padding: '0.5rem 0', fontWeight: 500 }}>
                  {layanan?.keterangan || '-'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Foto Kacamata & Resep Dokter */}
      {(layanan?.foto_kacamata || layanan?.foto_resep) && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <h3 className="card-title" style={{ fontSize: '1.1rem' }}>
              📷 Foto Dokumen & Kondisi Fisik
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Klik foto untuk memperbesar</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {layanan.foto_kacamata && (
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', textAlign: 'center' }}>
                <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>👓 Foto Kondisi Kacamata</p>
                <img
                  src={getImageUrl(layanan.foto_kacamata)}
                  alt="Foto Kacamata"
                  onClick={() => setSelectedPhoto(getImageUrl(layanan.foto_kacamata))}
                  style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', border: '1px solid #cbd5e1' }}
                />
                <button
                  type="button"
                  onClick={() => setSelectedPhoto(getImageUrl(layanan.foto_kacamata))}
                  className="btn btn-outline btn-sm"
                  style={{ marginTop: '0.5rem', width: '100%' }}
                >
                  🔍 Perbesar Foto
                </button>
              </div>
            )}
            {layanan.foto_resep && (
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', textAlign: 'center' }}>
                <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>📋 Foto Resep Dokter / Optik</p>
                <img
                  src={getImageUrl(layanan.foto_resep)}
                  alt="Foto Resep"
                  onClick={() => setSelectedPhoto(getImageUrl(layanan.foto_resep))}
                  style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', border: '1px solid #cbd5e1' }}
                />
                <button
                  type="button"
                  onClick={() => setSelectedPhoto(getImageUrl(layanan.foto_resep))}
                  className="btn btn-outline btn-sm"
                  style={{ marginTop: '0.5rem', width: '100%' }}
                >
                  🔍 Perbesar Foto
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ringkasan Biaya & Integrasi Payment Gateway Midtrans */}
      <div className="card" style={{ backgroundColor: isLunas ? '#f0fdf4' : '#fffbeb', borderLeft: `5px solid ${isLunas ? 'var(--success)' : 'var(--warning)'}`, marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h4 style={{ fontWeight: 700, color: 'var(--dark)', margin: 0, fontSize: '1.15rem' }}>
                💳 Pembayaran & Tagihan Layanan
              </h4>
              <span className={`badge ${isLunas ? 'badge-selesai' : 'badge-pending'}`}>
                {isLunas ? '✓ LUNAS' : '⏳ BELUM LUNAS'}
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.4rem', marginBottom: 0 }}>
              {isLunas
                ? `Pembayaran telah berhasil diverifikasi via ${layanan?.metode_pembayaran ? layanan.metode_pembayaran.toUpperCase() : 'Online'}.`
                : 'Mendukung QRIS, Virtual Account (BCA, BNI, Mandiri, BRI), GoPay, ShopeePay, atau COD.'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Total Biaya</span>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: isLunas ? '#166534' : 'var(--primary-dark)' }}>
                Rp {Number(totalBiaya).toLocaleString('id-ID')}
              </span>
            </div>

            {!isLunas && (
              <button
                type="button"
                onClick={() => { setShowPayModal(true); handleStartPayment(); }}
                className="btn btn-primary"
                style={{ background: 'linear-gradient(135deg, #0284c7, #0369a1)', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)', padding: '0.65rem 1.4rem' }}
              >
                ⚡ Bayar Sekarang (Midtrans)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal Simulasi Midtrans Snap Sandbox */}
      {showPayModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '520px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
            {/* Modal Header */}
            <div style={{ background: '#0284c7', color: '#fff', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.3rem' }}>🔒</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>Midtrans Snap Simulator</h3>
                  <small style={{ color: '#bae6fd' }}>Sandbox Gateway Pembayaran Aman</small>
                </div>
              </div>
              <button
                onClick={() => { setShowPayModal(false); setPaymentTransaction(null); }}
                style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Nomor Pesanan</span>
                  <p style={{ margin: 0, fontWeight: 700 }}>#{layanan?.id}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Tagihan</span>
                  <p style={{ margin: 0, fontWeight: 800, color: '#0284c7', fontSize: '1.2rem' }}>
                    Rp {Number(totalBiaya).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

              {/* Pilihan Metode */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ fontWeight: 600 }}>Pilih Metode Pembayaran</label>
                <select
                  className="form-control"
                  value={selectedMetode}
                  onChange={(e) => setSelectedMetode(e.target.value)}
                >
                  <option value="qris">📱 QRIS (GoPay, OVO, ShopeePay, Dana, LinkAja, BCA Mobile)</option>
                  <option value="bca_va">🏦 BCA Virtual Account</option>
                  <option value="bni_va">🏦 BNI Virtual Account</option>
                  <option value="bri_va">🏦 BRI Virtual Account</option>
                  <option value="mandiri_va">🏦 Mandiri Virtual Account</option>
                  <option value="gopay">🟢 GoPay Direct</option>
                  <option value="shopeepay">🟠 ShopeePay Direct</option>
                  <option value="cod">💵 COD (Bayar Tunai ke Kurir)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleStartPayment}
                disabled={processingPay}
                className="btn btn-outline btn-sm"
                style={{ width: '100%', marginBottom: '1.25rem' }}
              >
                {processingPay ? 'Memproses...' : '🔄 Perbarui Detail Pembayaran'}
              </button>

              {/* Konten Sesuai Metode */}
              {paymentTransaction?.payment_detail && (
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center', marginBottom: '1.25rem' }}>
                  {paymentTransaction.payment_detail.tipe === 'qris' && (
                    <div>
                      <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0369a1', marginBottom: '0.5rem' }}>
                        Scan QRIS berikut memakai aplikasi e-Wallet atau Mobile Banking:
                      </p>
                      <img
                        src={paymentTransaction.payment_detail.qr_image}
                        alt="QR Code QRIS"
                        style={{ width: '160px', height: '160px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                      />
                      <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
                        ID: <code>{paymentTransaction.transaction_id}</code>
                      </p>
                    </div>
                  )}

                  {paymentTransaction.payment_detail.tipe === 'virtual_account' && (
                    <div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                        Nomor Virtual Account {paymentTransaction.payment_detail.bank}:
                      </p>
                      <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', letterSpacing: '1px' }}>
                        {paymentTransaction.payment_detail.va_number}
                      </span>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>
                        Batas Waktu Bayar: 24 Jam
                      </p>
                    </div>
                  )}

                  {paymentTransaction.payment_detail.tipe === 'cod' && (
                    <div>
                      <span style={{ fontSize: '2rem' }}>💵</span>
                      <p style={{ fontWeight: 600, fontSize: '0.95rem', margin: '0.5rem 0' }}>
                        Pembayaran Tunai di Tempat (COD)
                      </p>
                      <p style={{ fontSize: '0.85rem', color: '#475569' }}>
                        {paymentTransaction.payment_detail.keterangan}
                      </p>
                    </div>
                  )}

                  {paymentTransaction.payment_detail.tipe === 'ewallet' && (
                    <div>
                      <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0369a1' }}>
                        Pembayaran via {paymentTransaction.payment_detail.ewallet}
                      </p>
                      <a
                        href={paymentTransaction.payment_detail.link}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline btn-sm"
                        style={{ marginTop: '0.5rem' }}
                      >
                        Buka Aplikasi {paymentTransaction.payment_detail.ewallet}
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Tombol Simulasi Berhasil */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  disabled={processingPay}
                  className="btn btn-primary"
                  style={{ flex: 2, backgroundColor: 'var(--success)', borderColor: 'var(--success)' }}
                >
                  {processingPay ? 'Memproses...' : '✓ Simulasi Pembayaran Sukses'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Foto */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '2rem' }}
        >
          <img
            src={selectedPhoto}
            alt="Perbesar"
            style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: '8px', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}
          />
        </div>
      )}
    </div>
  );
};

export default DetailLayanan;

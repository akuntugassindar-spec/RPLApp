import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';

/**
 * Halaman Detail Permintaan Layanan (Pelanggan)
 * Menampilkan:
 * 1. Timeline Status Pengerjaan Real-time
 * 2. Pelacakan Langsung Armada Kurir (Live GPS & Peta Rute)
 * 3. Informasi Lengkap Kacamata & Alamat Penjemputan
 * 4. Foto Fisik Kerusakan Frame & Resep Dokter (dengan Lightbox Zoom)
 * 5. Fitur Pembayaran Interaktif Multi-Metode (QRIS langsung muncul, Virtual Account Bank, GoPay/ShopeePay, COD)
 */
const DetailLayanan = () => {
  const { id } = useParams();

  const [layanan, setLayanan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [copiedText, setCopiedText] = useState(false);

  // Tracking kurir GPS
  const [trackingData, setTrackingData] = useState(null);

  // Status & Pilihan Pembayaran Langsung di Halaman
  const [activeMetode, setActiveMetode] = useState('qris');
  const [selectedVaBank, setSelectedVaBank] = useState('bca_va');
  const [processingPay, setProcessingPay] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [transactionId, setTransactionId] = useState('');

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/layanan/${id}`);
      const data = response.data?.data || response.data;
      setLayanan(data);

      if (data) {
        const trx = data.id_transaksi_pembayaran || `MIDTRANS-${Date.now()}-${data.id || id}`;
        setTransactionId(trx);
        setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=OPTIKEXPRESS-PAYMENT-${trx}`);
        if (data.metode_pembayaran) {
          if (data.metode_pembayaran.includes('va')) {
            setActiveMetode('va');
            setSelectedVaBank(data.metode_pembayaran);
          } else {
            setActiveMetode(data.metode_pembayaran);
          }
        }
      }
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
      // Data tracking belum aktif / belum ada kurir ditugaskan
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
    fetchTracking();
  }, [fetchDetail, fetchTracking]);

  // Handle Pilih Metode & Generate Detail
  const handlePilihMetode = async (metodeBaru) => {
    setActiveMetode(metodeBaru);
    const targetMetode = metodeBaru === 'va' ? selectedVaBank : metodeBaru;
    try {
      const res = await api.post(`/layanan/${id}/pembayaran`, {
        metode_pembayaran: targetMetode
      });
      const data = res.data?.data;
      if (data?.transaction_id) {
        setTransactionId(data.transaction_id);
        if (data.payment_detail?.qr_image) {
          setQrCodeUrl(data.payment_detail.qr_image);
        }
      }
    } catch (err) {
      console.error('Info payment init:', err);
    }
  };

  const handlePilihVaBank = async (bankKode) => {
    setSelectedVaBank(bankKode);
    try {
      const res = await api.post(`/layanan/${id}/pembayaran`, {
        metode_pembayaran: bankKode
      });
      if (res.data?.data?.transaction_id) {
        setTransactionId(res.data.data.transaction_id);
      }
    } catch (err) {
      console.error('Info VA init:', err);
    }
  };

  // Handle Konfirmasi Pembayaran Selesai (Simulasi Berhasil)
  const handleKonfirmasiBayar = async () => {
    setProcessingPay(true);
    setError('');
    try {
      await api.post(`/layanan/${id}/pembayaran/konfirmasi`);
      setSuccess('Selamat! Pembayaran berhasil diverifikasi. Status pesanan Anda kini LUNAS.');
      fetchDetail();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengonfirmasi pembayaran.');
    } finally {
      setProcessingPay(false);
    }
  };

  // Salin Nomor VA
  const handleCopyVa = (vaNumber) => {
    navigator.clipboard.writeText(vaNumber);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
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
    { key: 'diproses', label: '3. Pengerjaan', desc: 'Teknisi optik mengerjakan' },
    { key: 'diantar', label: '4. Pengantaran', desc: 'Kurir mengantar kembali' },
    { key: 'selesai', label: '5. Selesai', desc: 'Kacamata diterima tuntas' },
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
    if (s.includes('antar')) return <span className="badge badge-antar">🚚 Kacamata Sedang Diantar</span>;
    if (s.includes('jemput') || s === 'diambil') return <span className="badge badge-jemput">🛵 Kurir Menjemput</span>;
    if (s.includes('proses')) return <span className="badge badge-proses">⚙️ Sedang Dikerjakan</span>;
    return <span className="badge badge-pending">⏳ Menunggu Verifikasi</span>;
  };

  const isLunas = layanan?.status_pembayaran === 'lunas';
  const totalBiaya = layanan?.total_biaya && layanan.total_biaya > 0 ? layanan.total_biaya : 150000;
  const vaNumber = `8808${String(id).padStart(4, '0')}${String(layanan?.user_id || '101').padStart(4, '0')}`;

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
        <p>Memuat rincian layanan #{id}...</p>
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
    <div style={{ maxWidth: '980px', margin: '0 auto', paddingBottom: '3rem' }}>
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

      {success && <div className="alert alert-success" style={{ fontSize: '1rem', fontWeight: 600 }}>{success}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Visualisasi Timeline Status */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 className="card-title" style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>
          Alur Pengerjaan Layanan
        </h2>
        {isCancelled ? (
          <div className="alert alert-danger" style={{ marginTop: '1rem' }}>
            Permintaan layanan ini telah dibatalkan atau ditolak.
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

      {/* ==================================================================== */}
      {/* SEKSI UTAMA: FITUR PEMBAYARAN JELAS & TIDAK MEMBINGUNGKAN             */}
      {/* ==================================================================== */}
      <div className="card" style={{ border: isLunas ? '2px solid #22c55e' : '2px solid #0284c7', backgroundColor: isLunas ? '#f0fdf4' : '#ffffff', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', marginBottom: '1.5rem' }}>
        {/* Header Tagihan */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.4rem' }}>💳</span>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--dark)' }}>
                Pembayaran & Tagihan Layanan
              </h3>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {isLunas
                ? 'Pembayaran telah sukses diverifikasi oleh sistem OptikExpress.'
                : 'Pilih salah satu metode pembayaran di bawah ini untuk menyelesaikan tagihan.'}
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Total Tagihan</span>
            <span style={{ fontSize: '1.8rem', fontWeight: 900, color: isLunas ? '#166534' : '#0284c7' }}>
              Rp {Number(totalBiaya).toLocaleString('id-ID')}
            </span>
            <span className={`badge ${isLunas ? 'badge-selesai' : 'badge-pending'}`} style={{ display: 'inline-block', marginTop: '0.25rem' }}>
              {isLunas ? '✓ LUNAS' : '⏳ MENUNGGU PEMBAYARAN'}
            </span>
          </div>
        </div>

        {/* JIKA SUDAH LUNAS: Tampilkan Bukti Pembayaran */}
        {isLunas ? (
          <div style={{ padding: '1.5rem 0 0.5rem 0', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', fontSize: '2rem', marginBottom: '0.75rem' }}>
              ✓
            </div>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#15803d', margin: 0 }}>
              Tagihan Berhasil Dibayar Lunas
            </h4>
            <p style={{ color: '#475569', fontSize: '0.9rem', marginTop: '0.4rem' }}>
              Metode: <strong style={{ textTransform: 'uppercase' }}>{layanan?.metode_pembayaran || 'QRIS / Digital'}</strong> &bull; ID Transaksi: <code>{layanan?.id_transaksi_pembayaran || transactionId}</code>
            </p>
            <div style={{ display: 'inline-block', background: '#fff', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.6rem 1.25rem', marginTop: '0.5rem', fontSize: '0.85rem', color: '#166534' }}>
              OptikExpress sedang memproses pengerjaan dan pengantaran kacamata Anda ke alamat tujuan.
            </div>
          </div>
        ) : (
          /* JIKA BELUM LUNAS: Tampilkan Pilihan Metode & Tampilan Langsung */
          <div style={{ paddingTop: '1.25rem' }}>
            {/* Pilihan Tab / Tombol Metode Pembayaran */}
            <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '0.75rem' }}>
              Pilih Metode Pembayaran:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {/* Tab 1: QRIS */}
              <button
                type="button"
                onClick={() => handlePilihMetode('qris')}
                style={{
                  padding: '0.85rem 0.5rem',
                  borderRadius: '10px',
                  border: activeMetode === 'qris' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                  background: activeMetode === 'qris' ? '#f0f9ff' : '#fff',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                  boxShadow: activeMetode === 'qris' ? '0 2px 8px rgba(2, 132, 199, 0.15)' : 'none'
                }}
              >
                <div style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>📱</div>
                <strong style={{ fontSize: '0.9rem', color: activeMetode === 'qris' ? '#0369a1' : 'var(--dark)', display: 'block' }}>QRIS (Instan)</strong>
                <small style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>GoPay, OVO, Dana, BCA, dll</small>
              </button>

              {/* Tab 2: Virtual Account */}
              <button
                type="button"
                onClick={() => handlePilihMetode('va')}
                style={{
                  padding: '0.85rem 0.5rem',
                  borderRadius: '10px',
                  border: activeMetode === 'va' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                  background: activeMetode === 'va' ? '#f0f9ff' : '#fff',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                  boxShadow: activeMetode === 'va' ? '0 2px 8px rgba(2, 132, 199, 0.15)' : 'none'
                }}
              >
                <div style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>🏦</div>
                <strong style={{ fontSize: '0.9rem', color: activeMetode === 'va' ? '#0369a1' : 'var(--dark)', display: 'block' }}>Virtual Account</strong>
                <small style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>BCA, BNI, BRI, Mandiri</small>
              </button>

              {/* Tab 3: e-Wallet Direct */}
              <button
                type="button"
                onClick={() => handlePilihMetode('gopay')}
                style={{
                  padding: '0.85rem 0.5rem',
                  borderRadius: '10px',
                  border: activeMetode === 'gopay' || activeMetode === 'shopeepay' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                  background: activeMetode === 'gopay' || activeMetode === 'shopeepay' ? '#f0f9ff' : '#fff',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                  boxShadow: activeMetode === 'gopay' ? '0 2px 8px rgba(2, 132, 199, 0.15)' : 'none'
                }}
              >
                <div style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>🟢</div>
                <strong style={{ fontSize: '0.9rem', color: activeMetode === 'gopay' ? '#0369a1' : 'var(--dark)', display: 'block' }}>e-Wallet Direct</strong>
                <small style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>GoPay / ShopeePay</small>
              </button>

              {/* Tab 4: COD */}
              <button
                type="button"
                onClick={() => handlePilihMetode('cod')}
                style={{
                  padding: '0.85rem 0.5rem',
                  borderRadius: '10px',
                  border: activeMetode === 'cod' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                  background: activeMetode === 'cod' ? '#f0f9ff' : '#fff',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                  boxShadow: activeMetode === 'cod' ? '0 2px 8px rgba(2, 132, 199, 0.15)' : 'none'
                }}
              >
                <div style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>💵</div>
                <strong style={{ fontSize: '0.9rem', color: activeMetode === 'cod' ? '#0369a1' : 'var(--dark)', display: 'block' }}>COD (Tunai)</strong>
                <small style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Bayar langsung ke kurir</small>
              </button>
            </div>

            {/* KONTEN METODE: 1. TAMPILAN QRIS */}
            {activeMetode === 'qris' && (
              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
                  {/* Kode QR */}
                  <div style={{ textAlign: 'center', background: '#fff', padding: '1rem', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#dc2626', background: '#fee2e2', padding: '2px 8px', borderRadius: '4px', letterSpacing: '1px' }}>
                      QRIS STANDAR NASIONAL
                    </span>
                    <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'center' }}>
                      <img
                        src={qrCodeUrl}
                        alt="QR Code QRIS"
                        style={{ width: '220px', height: '220px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}
                      />
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: 0 }}>
                      Merchant: <strong>OptikExpress Payment Gateway</strong>
                    </p>
                    <small style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      ID Transaksi: <code>{transactionId}</code>
                    </small>
                  </div>

                  {/* Panduan & Tombol Konfirmasi */}
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0369a1', marginBottom: '0.5rem' }}>
                      Cara Bayar Pakai QRIS:
                    </h4>
                    <ol style={{ fontSize: '0.85rem', color: '#334155', paddingLeft: '1.2rem', lineHeight: '1.6', margin: '0 0 1rem 0' }}>
                      <li>Buka aplikasi e-Wallet Anda (<strong>GoPay, OVO, Dana, ShopeePay, LinkAja</strong>) atau Mobile Banking (<strong>BCA, Livin Mandiri, BRImo, BNI</strong>).</li>
                      <li>Pilih menu <strong>Scan / Bayar QR</strong>.</li>
                      <li>Arahkan kamera ke kode QR di samping.</li>
                      <li>Periksa nominal tagihan (<strong>Rp {Number(totalBiaya).toLocaleString('id-ID')}</strong>) lalu masukkan PIN Anda.</li>
                    </ol>

                    <div style={{ background: '#e0f2fe', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', borderLeft: '4px solid #0284c7' }}>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#0369a1' }}>
                        💡 <strong>Simulasi Midtrans Sandbox:</strong> Setelah melakukan scan atau ingin langsung menandai lunas, klik tombol konfirmasi di bawah.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleKonfirmasiBayar}
                      disabled={processingPay}
                      className="btn btn-primary"
                      style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem', background: 'linear-gradient(135deg, #16a34a, #15803d)', borderColor: '#16a34a', fontWeight: 700 }}
                    >
                      {processingPay ? 'Memverifikasi...' : '✓ Simulasi: Saya Sudah Bayar via QRIS'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* KONTEN METODE: 2. TAMPILAN VIRTUAL ACCOUNT */}
            {activeMetode === 'va' && (
              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>Pilih Bank:</p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  {['bca_va', 'bni_va', 'bri_va', 'mandiri_va'].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => handlePilihVaBank(b)}
                      style={{
                        padding: '0.4rem 0.85rem',
                        borderRadius: '6px',
                        border: selectedVaBank === b ? '2px solid #0284c7' : '1px solid #cbd5e1',
                        background: selectedVaBank === b ? '#0284c7' : '#fff',
                        color: selectedVaBank === b ? '#fff' : 'var(--dark)',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      {b.replace('_va', '').toUpperCase()} VA
                    </button>
                  ))}
                </div>

                <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #cbd5e1', textAlign: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Nomor Virtual Account {selectedVaBank.replace('_va', '').toUpperCase()}:</span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', margin: '0.5rem 0' }}>
                    <span style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '2px', color: '#0f172a' }}>
                      {vaNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyVa(vaNumber)}
                      className="btn btn-outline btn-sm"
                      style={{ padding: '0.35rem 0.75rem' }}
                    >
                      {copiedText ? '✓ Tersalin!' : '📋 Salin'}
                    </button>
                  </div>
                  <small style={{ color: '#64748b' }}>Atas Nama: <strong>OptikExpress - Layanan #{id}</strong></small>
                </div>

                <button
                  type="button"
                  onClick={handleKonfirmasiBayar}
                  disabled={processingPay}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem', background: 'linear-gradient(135deg, #16a34a, #15803d)', borderColor: '#16a34a', fontWeight: 700 }}
                >
                  {processingPay ? 'Memverifikasi...' : '✓ Simulasi: Saya Sudah Transfer ke Virtual Account'}
                </button>
              </div>
            )}

            {/* KONTEN METODE: 3. TAMPILAN E-WALLET DIRECT */}
            {(activeMetode === 'gopay' || activeMetode === 'shopeepay') && (
              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <span style={{ fontSize: '2.5rem' }}>🟢</span>
                <h4 style={{ fontWeight: 800, margin: '0.5rem 0' }}>Pembayaran via GoPay / ShopeePay</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 1rem auto' }}>
                  Anda dapat membuka aplikasi e-wallet Anda secara langsung atau melakukan simulasi pembayaran instan di bawah ini.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleKonfirmasiBayar}
                    disabled={processingPay}
                    className="btn btn-primary"
                    style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', borderColor: '#16a34a', fontWeight: 700 }}
                  >
                    {processingPay ? 'Memverifikasi...' : '✓ Simulasi: Sukses Bayar di GoPay/ShopeePay'}
                  </button>
                </div>
              </div>
            )}

            {/* KONTEN METODE: 4. TAMPILAN COD */}
            {activeMetode === 'cod' && (
              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <span style={{ fontSize: '2.5rem' }}>💵</span>
                <h4 style={{ fontWeight: 800, margin: '0.5rem 0', color: '#166534' }}>Cash on Delivery (Bayar Tunai ke Kurir)</h4>
                <p style={{ fontSize: '0.85rem', color: '#334155', maxWidth: '450px', margin: '0 auto 1rem auto', lineHeight: '1.5' }}>
                  Siapkan uang tunai sebesar <strong>Rp {Number(totalBiaya).toLocaleString('id-ID')}</strong> saat kurir OptikExpress mengantarkan kacamata yang sudah diperbaiki ke alamat Anda.
                </p>
                <button
                  type="button"
                  onClick={handleKonfirmasiBayar}
                  disabled={processingPay}
                  className="btn btn-primary"
                  style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', borderColor: '#16a34a', fontWeight: 700 }}
                >
                  {processingPay ? 'Memproses...' : '✓ Simulasi: Kurir Menerima Uang Tunai (LUNAS)'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* SEKSI LIVE GPS TRACKING ARMADA KURIR                                 */}
      {/* ==================================================================== */}
      {trackingData && (
        <div className="card" style={{ border: '2px solid #bae6fd', backgroundColor: '#f0f9ff', marginBottom: '1.5rem' }}>
          <div className="card-header" style={{ borderColor: '#bae6fd' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.4rem' }}>🛵</span>
              <div>
                <h3 className="card-title" style={{ fontSize: '1.15rem', color: '#0369a1' }}>
                  Pelacakan Langsung Armada Kurir (Live GPS)
                </h3>
                <small style={{ color: '#0284c7' }}>Posisi real-time armada antar-jemput kacamata Anda</small>
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
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '2px 0' }}>{trackingData.kurir?.kendaraan || 'Honda Vario 160 (L 4589 AB)'}</p>
                  <p style={{ fontSize: '0.85rem', color: '#0369a1', fontWeight: 600, margin: 0 }}>📞 {trackingData.kurir?.telepon || '0812-3456-7890'}</p>
                </div>
              </div>

              {/* Progress Bar Perjalanan */}
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

      {/* Rincian Kacamata & Informasi Penjemputan */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Rincian Kacamata */}
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
                <td style={{ padding: '0.5rem 0', color: 'var(--text-muted)', verticalAlign: 'top' }}>Catatan Kurir:</td>
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

      {/* Lightbox Modal Foto */}
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

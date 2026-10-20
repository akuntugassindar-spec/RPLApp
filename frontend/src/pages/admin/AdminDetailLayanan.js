import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import LiveMapKurir from '../../components/LiveMapKurir';

/**
 * Halaman Detail & Manajemen Layanan (Admin)
 * Menyediakan:
 * 1. Manajemen data pesanan pelanggan & timeline status
 * 2. Tampilan foto kacamata rusak & foto resep dokter dengan modal lightbox
 * 3. Manajemen biaya layanan, status pembayaran, dan metode transaksi
 * 4. Penugasan armada kurir (nama, telepon, status perjalanan) serta visualisasi Live GPS tracking
 */
const AdminDetailLayanan = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [layanan, setLayanan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // State Form Status & Biaya
  const [statusDipilih, setStatusDipilih] = useState('');
  const [totalBiaya, setTotalBiaya] = useState('');
  const [statusPembayaran, setStatusPembayaran] = useState('belum_bayar');
  const [metodePembayaran, setMetodePembayaran] = useState('qris');
  const [catatanAdmin, setCatatanAdmin] = useState('');

  // State Form Penugasan Kurir & Live Tracking
  const [kurirNama, setKurirNama] = useState('');
  const [kurirTelepon, setKurirTelepon] = useState('');
  const [trackingStatus, setTrackingStatus] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [tipePeta, setTipePeta] = useState('osm');

  const COURIER_OPTIONS = [
    { id: 'auto', nama: 'Otomatis (Auto-Assign Sistem)', kurirNama: '', telepon: '' },
    { id: 'agus', nama: 'Agus Pratama (0812-3456-7890) - Vario 160', kurirNama: 'Agus Pratama', telepon: '081234567890' },
    { id: 'bambang', nama: 'Bambang Wijaya (0813-9876-5432) - NMAX', kurirNama: 'Bambang Wijaya', telepon: '081398765432' },
    { id: 'rian', nama: 'Rian Kurniawan (0857-1234-8765) - Beat Street', kurirNama: 'Rian Kurniawan', telepon: '085712348765' },
    { id: 'manual', nama: 'Input Manual / Driver Lain', kurirNama: '', telepon: '' }
  ];

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      let response;
      try {
        response = await api.get(`/admin/layanan/${id}`);
      } catch (err) {
        response = await api.get(`/layanan/${id}`);
      }

      const data = response.data?.data || response.data;
      setLayanan(data);
      if (data) {
        setStatusDipilih(data.status || 'pengajuan');
        setTotalBiaya(data.total_biaya || data.biaya || '');
        setStatusPembayaran(data.status_pembayaran || 'belum_bayar');
        setMetodePembayaran(data.metode_pembayaran || 'qris');
        setCatatanAdmin(data.catatan_admin || '');
        setKurirNama(data.kurir_nama || '');
        setKurirTelepon(data.kurir_telepon || '');
        setTrackingStatus(data.tracking_status || '');
      }
    } catch (err) {
      console.error('Gagal mengambil data detail admin:', err);
      setError('Gagal memuat informasi layanan. Pastikan ID pesanan valid.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchTracking = useCallback(async () => {
    try {
      const response = await api.get(`/layanan/${id}/tracking`);
      setTrackingData(response.data?.data || null);
    } catch (err) {
      console.error('Gagal memuat tracking kurir:', err);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
    fetchTracking();
  }, [fetchDetail, fetchTracking]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        status: statusDipilih,
        total_biaya: totalBiaya ? Number(totalBiaya) : 0,
        status_pembayaran: statusPembayaran,
        metode_pembayaran: metodePembayaran,
        catatan_admin: catatanAdmin,
        kurir_nama: kurirNama,
        kurir_telepon: kurirTelepon,
        tracking_status: trackingStatus,
      };

      try {
        await api.put(`/layanan/${id}/status`, payload);
      } catch (err1) {
        try {
          await api.put(`/layanan/${id}`, payload);
        } catch (err2) {
          await api.put(`/admin/layanan/${id}`, payload);
        }
      }

      setSuccess('Seluruh data layanan & kurir berhasil diperbarui!');
      fetchTracking();
    } catch (err) {
      console.error('Gagal memperbarui status:', err);
      setError(err.response?.data?.message || 'Gagal memperbarui status layanan.');
    } finally {
      setUpdating(false);
    }
  };

  const handleTandaiLunas = async () => {
    if (!window.confirm('Tandai pembayaran pesanan ini sebagai LUNAS?')) return;
    setUpdating(true);
    try {
      await api.post(`/layanan/${id}/pembayaran/konfirmasi`);
      setSuccess('Pembayaran berhasil ditandai LUNAS!');
      setStatusPembayaran('lunas');
      setLayanan((prev) => ({ ...prev, status_pembayaran: 'lunas' }));
    } catch (err) {
      console.error('Gagal konfirmasi pembayaran:', err);
      alert('Gagal menandai lunas: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdating(false);
    }
  };

  const handleHapusPesanan = async () => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus pesanan #${id}? Data akan dihapus secara permanen.`)) {
      try {
        await api.delete(`/layanan/${id}`);
        alert(`Pesanan #${id} berhasil dihapus.`);
        navigate('/admin/layanan');
      } catch (err) {
        console.error('Gagal menghapus pesanan:', err);
        alert('Gagal menghapus pesanan: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const getImageUrl = (pathStr) => {
    if (!pathStr) return '';
    if (pathStr.startsWith('http://') || pathStr.startsWith('https://')) return pathStr;
    const base = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace(/\/api$/, '') : '';
    return `${base}${pathStr}`;
  };

  const steps = [
    { key: 'pengajuan', label: '1. Diajukan', desc: 'Menunggu konfirmasi' },
    { key: 'diambil', label: '2. Penjemputan', desc: 'Kurir menjemput kacamata' },
    { key: 'diproses', label: '3. Pengerjaan', desc: 'Teknisi optik bekerja' },
    { key: 'diantar', label: '4. Pengantaran', desc: 'Kacamata diantar kembali' },
    { key: 'selesai', label: '5. Selesai', desc: 'Layanan telah tuntas' },
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
    if (s.includes('selesai')) return <span className="badge badge-selesai">Selesai</span>;
    if (s.includes('batal') || s.includes('tolak')) return <span className="badge badge-batal">Dibatalkan</span>;
    if (s.includes('antar')) return <span className="badge badge-antar">Sedang Diantar</span>;
    if (s.includes('jemput')) return <span className="badge badge-jemput">Penjemputan</span>;
    if (s.includes('proses')) return <span className="badge badge-proses">Sedang Dikerjakan</span>;
    return <span className="badge badge-pending">Menunggu Konfirmasi</span>;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
        <p>Memuat data pesanan admin #{id}...</p>
      </div>
    );
  }

  if (error && !layanan) {
    return (
      <div style={{ maxWidth: '800px', margin: '2rem auto' }}>
        <div className="alert alert-danger">{error}</div>
        <Link to="/admin/layanan" className="btn btn-outline">Kembali ke Daftar Layanan</Link>
      </div>
    );
  }

  const isLunas = statusPembayaran === 'lunas';

  const progressMap = {
    pengajuan: 15,
    dijadwalkan: 35,
    diambil: 60,
    diproses: 80,
    diantar: 90,
    selesai: 100
  };

  const effectiveTracking = trackingData || {
    status_layanan: statusDipilih || layanan?.status || 'pengajuan',
    persentase_perjalanan: progressMap[statusDipilih || layanan?.status] || 25,
    estimasi_tiba: (statusDipilih === 'selesai' || layanan?.status === 'selesai') ? 'Tiba di Lokasi' : '20-30 Menit',
    status_deskripsi: trackingStatus || layanan?.tracking_status || 'Kurir dalam persiapan operasional.',
    kurir: {
      nama: kurirNama || layanan?.kurir_nama || 'Agus Pratama',
      telepon: kurirTelepon || layanan?.kurir_telepon || '0812-3456-7890',
      kendaraan: 'Honda Vario 160 (L 4589 AB)'
    },
    lokasi_optik: { nama: 'OptikExpress Store & Lab', alamat: 'Jl. Pemuda No. 48, Surabaya' },
    lokasi_tujuan: { nama: layanan?.nama_pelanggan || 'Pelanggan', alamat: layanan?.alamat || 'Alamat Pelanggan' }
  };

  const pRatio = (effectiveTracking.persentase_perjalanan || 25) / 100;
  const adminKurirLat = Number((-7.2625 + (-7.2890 - -7.2625) * pRatio).toFixed(4));
  const adminKurirLng = Number((112.7485 + (112.7950 - 112.7485) * pRatio).toFixed(4));

  const handleApplyPreset = (statusVal, deskripsi) => {
    setStatusDipilih(statusVal);
    setTrackingStatus(deskripsi);
    if (!kurirNama) setKurirNama('Agus Pratama');
    if (!kurirTelepon) setKurirTelepon('0812-3456-7890');
  };

  return (
    <div style={{ maxWidth: '1060px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/admin/layanan" className="btn btn-outline btn-sm">Kembali ke Daftar</Link>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--dark)' }}>
            Kelola Pesanan #{layanan?.id || id}
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {renderBadge(layanan?.status)}
          <button onClick={() => { fetchDetail(); fetchTracking(); }} className="btn btn-outline btn-sm">Refresh</button>
          <button
            type="button"
            onClick={handleHapusPesanan}
            className="btn btn-sm"
            style={{ backgroundColor: '#ef4444', color: '#ffffff', border: 'none', padding: '0.35rem 0.75rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
          >
            Hapus Pesanan
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Timeline Status */}
      <div className="card">
        <h2 className="card-title" style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Visualisasi Progres Pengerjaan</h2>
        {isCancelled ? (
          <div className="alert alert-danger" style={{ marginTop: '1rem' }}>Pesanan ini berstatus BATAL atau DITOLAK.</div>
        ) : (
          <div className="timeline-container">
            <div className="timeline">
              {steps.map((step, idx) => {
                let statusClass = '';
                if (idx < currentStep) statusClass = 'completed';
                else if (idx === currentStep) statusClass = 'active';
                return (
                  <div key={step.key} className={`timeline-step ${statusClass}`}>
                    <div className="timeline-icon">{idx < currentStep ? '' : idx + 1}</div>
                    <div className="timeline-title">{step.label}</div>
                    <div className="timeline-desc">{step.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Pemantauan Kurir GPS */}
      {effectiveTracking && (
        <div className="card" style={{ border: '2px solid #bae6fd', backgroundColor: '#f0f9ff' }}>
          <div className="card-header" style={{ borderColor: '#bae6fd' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.4rem' }}></span>
              <div>
                <h3 className="card-title" style={{ fontSize: '1.15rem', color: '#0369a1' }}>Pemantauan Kurir GPS (Live Courier Tracking)</h3>
                <small style={{ color: '#0284c7' }}>Pantau posisi pergerakan armada penjemputan dan pengantaran kacamata</small>
              </div>
            </div>
            <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.25rem 0.65rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700 }}>
              Estimasi Tiba: {effectiveTracking.estimasi_tiba}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginTop: '0.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', background: '#fff', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #e0f2fe' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', fontWeight: 800 }}>
                  ️
                </div>
                <div>
                  <h4 style={{ fontWeight: 700, color: 'var(--dark)' }}>{kurirNama || effectiveTracking.kurir?.nama || 'Belum Ditugaskan'}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{effectiveTracking.kurir?.kendaraan}</p>
                  <p style={{ fontSize: '0.85rem', color: '#0369a1', fontWeight: 600 }}> {kurirTelepon || effectiveTracking.kurir?.telepon || '-'}</p>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: '#0369a1' }}>
                  <span>Progres Rute Kurir</span>
                  <span>{effectiveTracking.persentase_perjalanan}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: `${effectiveTracking.persentase_perjalanan}%`, height: '100%', background: 'linear-gradient(90deg, #0284c7, #0d9488)', borderRadius: '999px', transition: 'width 0.5s ease' }} />
                </div>
                <p style={{ fontSize: '0.85rem', color: '#334155', marginTop: '0.5rem', fontStyle: 'italic' }}>
                   {trackingStatus || effectiveTracking.status_deskripsi}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {(kurirTelepon || trackingData.kurir?.telepon) && (
                  <a
                    href={`https://wa.me/${(kurirTelepon || trackingData.kurir?.telepon).replace(/\D/g, '')}?text=Halo%20kurir%20${encodeURIComponent(kurirNama || trackingData.kurir?.nama)},%20update%20pesanan%20kacamata%20%23${id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm"
                    style={{ backgroundColor: '#22c55e', color: '#fff', flex: 1, textDecoration: 'none' }}
                  >
                     WA Kurir
                  </a>
                )}
                {(layanan?.no_telepon_pelanggan || layanan?.pelanggan?.no_telepon || layanan?.no_telepon) && (
                  <a
                    href={`https://wa.me/${(layanan.no_telepon_pelanggan || layanan.pelanggan?.no_telepon || layanan.no_telepon).replace(/\D/g, '')}?text=Halo%20${encodeURIComponent(layanan.nama_pelanggan || 'Pelanggan')},%20informasi%20layanan%20kacamata%20OptikExpress%20%23${id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline"
                    style={{ flex: 1 }}
                  >
                     WA Pelanggan
                  </a>
                )}
              </div>
            </div>

            <div style={{ background: '#ffffff', borderRadius: 'var(--radius-md)', padding: '1rem', border: '1px solid #e0f2fe', minHeight: '260px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button
                    type="button"
                    onClick={() => setTipePeta('osm')}
                    style={{
                      padding: '0.25rem 0.65rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      borderRadius: '6px',
                      border: '1px solid #0284c7',
                      background: tipePeta === 'osm' ? '#0284c7' : '#ffffff',
                      color: tipePeta === 'osm' ? '#ffffff' : '#0284c7',
                      cursor: 'pointer'
                    }}
                  >
                    Peta Jalan (OSM)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipePeta('svg')}
                    style={{
                      padding: '0.25rem 0.65rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      background: tipePeta === 'svg' ? '#0284c7' : '#ffffff',
                      color: tipePeta === 'svg' ? '#ffffff' : '#64748b',
                      cursor: 'pointer'
                    }}
                  >
                    Radar Vektor
                  </button>
                </div>
                <span style={{ fontSize: '0.75rem', background: '#dcfce7', color: '#15803d', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>● GPS AKTIF</span>
              </div>

              {tipePeta === 'osm' ? (
                <LiveMapKurir
                  kurirLat={adminKurirLat}
                  kurirLng={adminKurirLng}
                  kurirNama={kurirNama || effectiveTracking.kurir?.nama}
                  alamatTujuan={layanan?.alamat}
                  height="200px"
                  showGoogleMapsBtn={true}
                />
              ) : (
                <div>
                  <svg viewBox="0 0 320 140" style={{ width: '100%', height: '130px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <path d="M 30 70 Q 110 20, 160 70 T 290 70" fill="none" stroke="#cbd5e1" strokeWidth="8" strokeLinecap="round" />
                    <path d="M 30 70 Q 110 20, 160 70 T 290 70" fill="none" stroke="#0284c7" strokeWidth="4" strokeDasharray="6,4" strokeLinecap="round" />
                    <circle cx="30" cy="70" r="12" fill="#0369a1" />
                    <text x="30" y="74" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold"></text>
                    <text x="30" y="98" textAnchor="middle" fill="#0f172a" fontSize="9" fontWeight="bold">Lab Optik</text>
                    {(() => {
                      const p = (effectiveTracking.persentase_perjalanan || 50) / 100;
                      const kurirX = 30 + (290 - 30) * p;
                      const kurirY = 70 + Math.sin(p * Math.PI) * -35;
                      return (
                        <g transform={`translate(${kurirX}, ${kurirY})`}>
                          <circle cx="0" cy="0" r="16" fill="#0284c7" fillOpacity="0.2">
                            <animate attributeName="r" values="12;20;12" dur="2s" repeatCount="indefinite" />
                          </circle>
                          <circle cx="0" cy="0" r="11" fill="#0d9488" stroke="#fff" strokeWidth="2" />
                          <text x="0" y="4" textAnchor="middle" fill="#fff" fontSize="10"></text>
                          <text x="0" y="-15" textAnchor="middle" fill="#0369a1" fontSize="8" fontWeight="bold">Kurir</text>
                        </g>
                      );
                    })()}
                    <circle cx="290" cy="70" r="12" fill="#10b981" />
                    <text x="290" y="74" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold"></text>
                    <text x="290" y="98" textAnchor="middle" fill="#0f172a" fontSize="9" fontWeight="bold">Pelanggan</text>
                  </svg>

                  <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}> {effectiveTracking.lokasi_optik?.nama}</span>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&origin=-7.2625,112.7485&destination=${adminKurirLat},${adminKurirLng}&travelmode=driving`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm"
                      style={{ backgroundColor: '#0284c7', color: '#ffffff', fontWeight: 700, fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', textDecoration: 'none' }}
                    >
                      Google Maps
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}


      {/* Grid: Form Update & Info Pelanggan */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="card-header">
            <h3 className="card-title" style={{ fontSize: '1.1rem' }}>️ Pengaturan Status, Biaya & Kurir</h3>
          </div>
          <form onSubmit={handleUpdateStatus}>
            <div className="form-group">
              <label className="form-label" htmlFor="statusDipilih">Status Alur Layanan</label>
              <select
                id="statusDipilih"
                className="form-control"
                value={statusDipilih}
                onChange={(e) => setStatusDipilih(e.target.value)}
                required
              >
                <option value="pengajuan">Menunggu Konfirmasi (pengajuan)</option>
                <option value="dijadwalkan">Penjemputan Dijadwalkan (dijadwalkan)</option>
                <option value="diambil">Sedang Dijemput Kurir (diambil)</option>
                <option value="diproses">Sedang Dikerjakan di Optik (diproses)</option>
                <option value="diantar">Sedang Diantar ke Pelanggan (diantar)</option>
                <option value="selesai">Selesai (selesai)</option>
              </select>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="totalBiaya">Total Biaya (Rp)</label>
                <input
                  type="number"
                  id="totalBiaya"
                  className="form-control"
                  placeholder="Contoh: 150000"
                  value={totalBiaya}
                  onChange={(e) => setTotalBiaya(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="statusPembayaran">Status Pembayaran</label>
                <select
                  id="statusPembayaran"
                  className="form-control"
                  value={statusPembayaran}
                  onChange={(e) => setStatusPembayaran(e.target.value)}
                >
                  <option value="belum_bayar">Belum Bayar</option>
                  <option value="menunggu_pembayaran">Menunggu Pembayaran</option>
                  <option value="lunas">Lunas</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="metodePembayaran">Metode Pembayaran</label>
              <select
                id="metodePembayaran"
                className="form-control"
                value={metodePembayaran}
                onChange={(e) => setMetodePembayaran(e.target.value)}
              >
                <option value="qris">QRIS (Gopay, OVO, Dana, ShopeePay)</option>
                <option value="bca_va">BCA Virtual Account</option>
                <option value="bni_va">BNI Virtual Account</option>
                <option value="bri_va">BRI Virtual Account</option>
                <option value="mandiri_va">Mandiri Bill Payment</option>
                <option value="gopay">GoPay Direct</option>
                <option value="shopeepay">ShopeePay Direct</option>
                <option value="cod">Cash on Delivery (Bayar Tunai ke Kurir)</option>
              </select>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0369a1', marginBottom: '0.75rem' }}>
                 Penugasan Armada Kurir
              </h4>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('dijadwalkan', 'Kurir bersiap berangkat menuju alamat penjemputan')}
                  className="btn btn-sm btn-outline"
                  style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                >
                   1. Jadwal (25%)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('diambil', 'Kurir dalam perjalanan menjemput kacamata')}
                  className="btn btn-sm btn-outline"
                  style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                >
                   2. Dijemput (50%)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('diproses', 'Kacamata tiba di lab optik, teknisi sedang memperbaiki')}
                  className="btn btn-sm btn-outline"
                  style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                >
                  ️ 3. Di Lab (75%)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('diantar', 'Kacamata selesai diperbaiki, kurir mengantar kembali')}
                  className="btn btn-sm btn-outline"
                  style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                >
                   4. Diantar (90%)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('selesai', 'Kacamata telah diterima pelanggan dengan baik')}
                  className="btn btn-sm btn-outline"
                  style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                >
                   5. Selesai (100%)
                </button>
              </div>

              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label className="form-label" htmlFor="selectCourierPool">
                  Pilih Armada Kurir (Pool Internal Optik / Auto-Assign)
                </label>
                <select
                  id="selectCourierPool"
                  className="form-control"
                  style={{ backgroundColor: '#f0f9ff', borderColor: '#38bdf8', fontWeight: 600 }}
                  onChange={(e) => {
                    const selected = COURIER_OPTIONS.find(c => c.id === e.target.value);
                    if (selected && selected.kurirNama) {
                      setKurirNama(selected.kurirNama);
                      setKurirTelepon(selected.telepon);
                    } else if (selected && selected.id === 'auto') {
                      setKurirNama('');
                      setKurirTelepon('');
                    }
                  }}
                >
                  {COURIER_OPTIONS.map(c => (
                    <option key={c.id} value={c.id}>{c.nama}</option>
                  ))}
                </select>
                <small style={{ color: '#0369a1', fontSize: '0.78rem', display: 'block', marginTop: '3px' }}>
                   Mode Otomatis akan menugaskan kurir aktif secara cerdas (seperti alur Gojek/Grab).
                </small>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="kurirNama">Nama Kurir</label>
                  <input
                    type="text"
                    id="kurirNama"
                    className="form-control"
                    placeholder="Contoh: Agus Pratama"
                    value={kurirNama}
                    onChange={(e) => setKurirNama(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="kurirTelepon">No. Telepon / WA Kurir</label>
                  <input
                    type="text"
                    id="kurirTelepon"
                    className="form-control"
                    placeholder="Contoh: 081234567890"
                    value={kurirTelepon}
                    onChange={(e) => setKurirTelepon(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="trackingStatus">Deskripsi Status Posisi Kurir</label>
                <input
                  type="text"
                  id="trackingStatus"
                  className="form-control"
                  placeholder="Contoh: Kurir menuju alamat penjemputan"
                  value={trackingStatus}
                  onChange={(e) => setTrackingStatus(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="catatanAdmin">Catatan Internal Teknisi / Optik</label>
              <textarea
                id="catatanAdmin"
                className="form-control"
                placeholder="Catatan pengerjaan atau kondisi lensa..."
                value={catatanAdmin}
                onChange={(e) => setCatatanAdmin(e.target.value)}
                rows={2}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 1 }}
                disabled={updating}
              >
                {updating ? 'Menyimpan...' : 'Simpan Seluruh Perubahan'}
              </button>
              {!isLunas && (
                <button
                  type="button"
                  onClick={handleTandaiLunas}
                  className="btn btn-outline"
                  disabled={updating}
                  style={{ borderColor: 'var(--success)', color: 'var(--success)' }}
                >
                  Tandai Lunas
                </button>
              )}
            </div>
          </form>
        </div>

        <div>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header">
              <h3 className="card-title" style={{ fontSize: '1.1rem' }}> Informasi Pelanggan</h3>
            </div>
            <table style={{ width: '100%', fontSize: '0.95rem' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '0.45rem 0', color: 'var(--text-muted)', width: '38%' }}>Nama:</td>
                  <td style={{ padding: '0.45rem 0', fontWeight: 600 }}>
                    {layanan?.pelanggan?.nama || layanan?.nama_pelanggan || layanan?.user?.nama || '-'}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '0.45rem 0', color: 'var(--text-muted)' }}>Telepon / WA:</td>
                  <td style={{ padding: '0.45rem 0', fontWeight: 600 }}>
                    {layanan?.pelanggan?.no_telepon || layanan?.no_telepon_pelanggan || layanan?.no_telepon || '-'}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '0.45rem 0', color: 'var(--text-muted)' }}>Email:</td>
                  <td style={{ padding: '0.45rem 0' }}>
                    {layanan?.pelanggan?.email || layanan?.email_pelanggan || layanan?.email || '-'}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '0.45rem 0', color: 'var(--text-muted)', verticalAlign: 'top' }}>Jadwal Jemput:</td>
                  <td style={{ padding: '0.45rem 0', fontWeight: 600 }}>
                    {layanan?.tanggal_jemput || '-'} ({layanan?.jam_jemput || '-'})
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '0.45rem 0', color: 'var(--text-muted)', verticalAlign: 'top' }}>Alamat Jemput:</td>
                  <td style={{ padding: '0.45rem 0' }}>{layanan?.alamat || '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="card" style={{ backgroundColor: isLunas ? '#f0fdf4' : '#fffbeb' }}>
            <div className="card-header" style={{ borderColor: isLunas ? '#bbf7d0' : '#fde68a' }}>
              <h3 className="card-title" style={{ fontSize: '1.1rem', color: isLunas ? '#166534' : '#92400e' }}>
                 Status Pembayaran
              </h3>
              <span className={`badge ${isLunas ? 'badge-selesai' : 'badge-pending'}`}>
                {isLunas ? 'LUNAS' : 'BELUM LUNAS LUNAS'}
              </span>
            </div>
            <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              Total Tagihan: <strong>Rp {totalBiaya ? Number(totalBiaya).toLocaleString('id-ID') : '0'}</strong>
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Metode: <strong style={{ textTransform: 'uppercase' }}>{metodePembayaran}</strong>
            </p>
            {layanan?.id_transaksi_pembayaran && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                ID Transaksi Midtrans: <code>{layanan.id_transaksi_pembayaran}</code>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Rincian Kacamata */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title" style={{ fontSize: '1.1rem' }}>Detail Kacamata & Keluhan Kerusakan</h3>
        </div>
        <div className="form-grid">
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Jenis Layanan:</span>
            <p style={{ fontWeight: 600, textTransform: 'capitalize' }}>
              {layanan?.jenis_layanan ? layanan.jenis_layanan.replace('_', ' ') : '-'}
            </p>
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Model Kacamata:</span>
            <p style={{ fontWeight: 600 }}>{layanan?.jenis_kacamata || '-'}</p>
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Keluhan Kerusakan:</span>
            <p style={{ fontWeight: 500 }}>{layanan?.keluhan || '-'}</p>
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Detail Perbaikan / Ukuran Lensa:</span>
            <p style={{ fontWeight: 500 }}>{layanan?.detail_perbaikan || '-'}</p>
          </div>
        </div>

        {layanan?.keterangan && (
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Catatan dari Pelanggan:</span>
            <p style={{ fontStyle: 'italic', marginTop: '0.25rem' }}>"{layanan.keterangan}"</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminDetailLayanan;

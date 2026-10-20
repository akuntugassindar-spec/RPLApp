import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import LiveMapKurir from '../../components/LiveMapKurir';

/**
 * Halaman Pelacakan Kurir GPS (Tracking Kurir) & Kasir Pembayaran Jasa
 * Fitur:
 * 1. Peta interaktif Leaflet OpenStreetMap dengan marker animasi kurir bergerak.
 * 2. Informasi armada kurir (nama, telepon, kendaraan, plat nomor).
 * 3. Estimasi waktu kedatangan (ETA) dan persentase perjalanan logistik.
 * 4. Tautan langsung navigasi Google Maps turn-by-turn.
 * 5. Kasir Pembayaran Kurir di Tempat (COD Tunai & Pop-up QRIS Bank Indonesia)
 *    sehingga kurir dan pelanggan dapat langsung menyelesaikan transaksi di tempat.
 */
const TrackingKurir = () => {
  const { id } = useParams();

  const [layanan, setLayanan] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tipePeta, setTipePeta] = useState('osm'); // 'osm' | 'svg'

  // State simulasi perjalanan kurir live radar
  const [simulasiBerjalan, setSimulasiBerjalan] = useState(false);
  const [simulasiPersen, setSimulasiPersen] = useState(null);
  const [simulasiKeterangan, setSimulasiKeterangan] = useState('');
  const timerSimulasiRef = useRef(null);

  // State Kasir Pembayaran di Tempat
  const [statusPembayaran, setStatusPembayaran] = useState('belum_bayar');
  const [processingBayar, setProcessingBayar] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState('');
  const [showQrisModal, setShowQrisModal] = useState(false);
  const [qrisImageUrl, setQrisImageUrl] = useState('');
  const [qrisNmid, setQrisNmid] = useState('ID1020304050607');

  const fetchTracking = useCallback(async () => {
    try {
      const res = await api.get(`/layanan/${id}/tracking`);
      if (res.data?.data) {
        setTrackingData(res.data.data);
        if (res.data.data.pembayaran?.status_pembayaran) {
          setStatusPembayaran(res.data.data.pembayaran.status_pembayaran);
        }
      }
    } catch (err) {
      console.error('Gagal memuat tracking kurir:', err);
    }
  }, [id]);

  const fetchLayanan = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/layanan/${id}`);
      const data = res.data?.data || res.data;
      setLayanan(data);
      if (data?.status_pembayaran) {
        setStatusPembayaran(data.status_pembayaran);
      }
    } catch (err) {
      setError('Gagal memuat informasi layanan. Pastikan ID pesanan valid.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLayanan();
    fetchTracking();

    const interval = setInterval(() => {
      fetchTracking();
    }, 6000);

    return () => clearInterval(interval);
  }, [fetchLayanan, fetchTracking]);

  const handleMulaiSimulasi = () => {
    if (simulasiBerjalan) {
      clearInterval(timerSimulasiRef.current);
      setSimulasiBerjalan(false);
      setSimulasiPersen(null);
      setSimulasiKeterangan('');
      return;
    }

    setSimulasiBerjalan(true);
    let p = 15;
    setSimulasiPersen(p);
    setSimulasiKeterangan('Kurir menyalakan motor dan bersiap berangkat dari gerai OptikExpress...');

    timerSimulasiRef.current = setInterval(() => {
      p += 15;
      if (p >= 100) {
        p = 100;
        setSimulasiPersen(100);
        setSimulasiKeterangan('Kurir telah tiba di alamat tujuan!');
        clearInterval(timerSimulasiRef.current);
        setTimeout(() => setSimulasiBerjalan(false), 8000);
      } else if (p === 30) {
        setSimulasiPersen(p);
        setSimulasiKeterangan('Kurir melintasi Jl. Pemuda (Kecepatan: 35 km/jam)');
      } else if (p === 45) {
        setSimulasiPersen(p);
        setSimulasiKeterangan('Kurir berada di rute utama menuju wilayah Anda...');
      } else if (p === 60) {
        setSimulasiPersen(p);
        setSimulasiKeterangan('Kurir mendekati alamat penjemputan/pengantaran...');
      } else if (p === 75) {
        setSimulasiPersen(p);
        setSimulasiKeterangan('Kurir berjarak 200 meter dari lokasi Anda...');
      } else {
        setSimulasiPersen(p);
      }
    }, 1800);
  };

  // Kurir menerima pembayaran tunai (COD) langsung di tempat
  const handleKurirTerimaTunai = async () => {
    if (!window.confirm(`Konfirmasi penerimaan pembayaran tunai sebesar Rp ${Number(layanan?.total_biaya || 150000).toLocaleString('id-ID')} dari pelanggan?`)) {
      return;
    }
    setProcessingBayar(true);
    setPaymentSuccess('');
    try {
      await api.post(`/layanan/${id}/pembayaran/konfirmasi`, {
        metode_pembayaran: 'cod'
      });
      setStatusPembayaran('lunas');
      setPaymentSuccess('Pembayaran Tunai (COD) Berhasil Diterima oleh Kurir! Tagihan telah LUNAS.');
      fetchTracking();
    } catch (err) {
      alert('Gagal mengonfirmasi pembayaran: ' + (err.response?.data?.message || err.message));
    } finally {
      setProcessingBayar(false);
    }
  };

  // Kurir memunculkan QRIS di layar HP untuk discan oleh pelanggan di tempat
  const handleBukaQrisKurir = async () => {
    setProcessingBayar(true);
    try {
      const res = await api.post(`/layanan/${id}/pembayaran`, {
        metode_pembayaran: 'qris'
      });
      const data = res.data?.data;
      if (data?.payment_detail?.qr_image) {
        setQrisImageUrl(data.payment_detail.qr_image);
      } else {
        setQrisImageUrl(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=00020101021253033605802ID5912OPTIKEXPRESS6008SURABAYA6304`);
      }
      setQrisNmid(data?.payment_detail?.nmid || 'ID1020304050607');
      setShowQrisModal(true);
    } catch (err) {
      alert('Gagal memuat QRIS kurir: ' + (err.response?.data?.message || err.message));
    } finally {
      setProcessingBayar(false);
    }
  };

  const handleKonfirmasiQrisSelesai = async () => {
    setProcessingBayar(true);
    try {
      await api.post(`/layanan/${id}/pembayaran/konfirmasi`, {
        metode_pembayaran: 'qris'
      });
      setStatusPembayaran('lunas');
      setShowQrisModal(false);
      setPaymentSuccess('Pembayaran QRIS Berhasil Diverifikasi LUNAS!');
      fetchTracking();
    } catch (err) {
      alert('Gagal mengonfirmasi: ' + (err.response?.data?.message || err.message));
    } finally {
      setProcessingBayar(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('selesai')) return <span className="badge badge-selesai">Selesai</span>;
    if (s.includes('antar')) return <span className="badge badge-antar">Sedang Diantar</span>;
    if (s.includes('jemput') || s === 'diambil' || s === 'dijadwalkan') return <span className="badge badge-jemput">Penjemputan</span>;
    if (s.includes('proses')) return <span className="badge badge-proses">Dikerjakan di Lab</span>;
    return <span className="badge badge-pending">Menunggu Konfirmasi</span>;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
        <p>Memuat sistem pelacakan kurir #${id}...</p>
      </div>
    );
  }

  if (error || !layanan) {
    return (
      <div style={{ maxWidth: '800px', margin: '2rem auto' }}>
        <div className="alert alert-danger">{error || 'Pesanan tidak ditemukan.'}</div>
        <Link to="/dashboard" className="btn btn-outline">Kembali ke Dashboard</Link>
      </div>
    );
  }

  const kurirInfo = trackingData?.kurir || {
    nama: layanan?.kurir_nama || 'Agus Pratama',
    telepon: layanan?.kurir_telepon || '081234567890',
    kendaraan: 'Honda Vario 160 (L 4589 AB)'
  };

  const persentase = simulasiPersen !== null ? simulasiPersen : (trackingData?.persentase_perjalanan || 25);
  const estimasi = trackingData?.estimasi_tiba || '20-30 Menit';
  const deskripsi = simulasiKeterangan || trackingData?.status_deskripsi || 'Kurir bersiap menuju alamat pelanggan.';

  // Koordinat lokasi
  const optikLat = -7.2625;
  const optikLng = 112.7485;
  const destLat = Number(trackingData?.lokasi_tujuan?.lat) || -7.2890;
  const destLng = Number(trackingData?.lokasi_tujuan?.lng) || 112.7950;
  const defaultKurirLat = destLat + 0.003;
  const defaultKurirLng = destLng + 0.003;
  const actualKurirLat = Number(trackingData?.kurir?.posisi_saat_ini?.lat) || (layanan?.kurir_lat ? Number(layanan.kurir_lat) : defaultKurirLat);
  const actualKurirLng = Number(trackingData?.kurir?.posisi_saat_ini?.lng) || (layanan?.kurir_lng ? Number(layanan.kurir_lng) : defaultKurirLng);

  // Jika simulasi aktif, kurir bergerak di sepanjang rute
  const ratio = persentase / 100;
  const kurirLat = simulasiBerjalan ? (optikLat + (destLat - optikLat) * ratio) : actualKurirLat;
  const kurirLng = simulasiBerjalan ? (optikLng + (destLng - optikLng) * ratio) : actualKurirLng;

  const totalBiaya = Number(layanan.total_biaya || trackingData?.pembayaran?.total_biaya || 150000);
  const isLunas = statusPembayaran === 'lunas' || layanan.status_pembayaran === 'lunas';

  return (
    <div style={{ maxWidth: '1060px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Header Halaman */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <Link to={`/layanan/${id}`} className="btn btn-outline btn-sm">← Kembali ke Detail</Link>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--dark)' }}>
              Pelacakan Kurir & Kasir Pesanan #${id}
            </h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Sistem Pemantauan Armada Logistik Real-Time & Pembayaran Jasa Antar-Jemput
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {getStatusBadge(layanan.status)}
          <button
            type="button"
            onClick={() => { fetchTracking(); fetchLayanan(); }}
            className="btn btn-outline btn-sm"
          >
            🔄 Refresh Status
          </button>
        </div>
      </div>

      {paymentSuccess && <div className="alert alert-success">{paymentSuccess}</div>}

      {/* ==================================================================== */}
      {/* KARTU KASIR & PEMBAYARAN JASA UNTUK KURIR & PELANGGAN               */}
      {/* ==================================================================== */}
      <div
        className="card"
        style={{
          border: isLunas ? '2px solid #22c55e' : '2px solid #0284c7',
          backgroundColor: isLunas ? '#f0fdf4' : '#f8fafc',
          marginBottom: '1.5rem',
          boxShadow: '0 4px 14px rgba(0,0,0,0.06)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: isLunas ? '#16a34a' : '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
              💳
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: isLunas ? '#166534' : '#0369a1' }}>
                Kasir & Pembayaran Jasa (Kurir & Pelanggan)
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Metode: <strong style={{ textTransform: 'uppercase' }}>{layanan.metode_pembayaran || 'QRIS / COD'}</strong> &bull; Biaya: <strong>Rp {totalBiaya.toLocaleString('id-ID')}</strong>
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Status Tagihan:</span>
            <span
              className="badge"
              style={{
                backgroundColor: isLunas ? '#dcfce7' : '#fef3c7',
                color: isLunas ? '#15803d' : '#b45309',
                fontSize: '0.95rem',
                fontWeight: 800,
                padding: '0.35rem 0.8rem'
              }}
            >
              {isLunas ? '✓ LUNAS' : '⏳ BELUM BAYAR / MENUNGGU'}
            </span>
          </div>
        </div>

        {isLunas ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <p style={{ color: '#15803d', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
              ✓ Tagihan servis & jasa kurir sebesar Rp {totalBiaya.toLocaleString('id-ID')} telah dibayar LUNAS.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to={`/pembayaran/${id}/konfirmasi`} className="btn btn-outline btn-sm">
                📄 Lihat Bukti Pembayaran
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '1rem' }}>
              Kurir dapat menerima pembayaran tunai dari pelanggan di tempat, atau memperlihatkan QRIS di layar ponsel untuk discan oleh pelanggan menggunakan aplikasi GoPay/BCA/DANA.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Tombol Terima Tunai COD */}
              <button
                type="button"
                onClick={handleKurirTerimaTunai}
                disabled={processingBayar}
                className="btn btn-primary"
                style={{ background: '#10b981', borderColor: '#10b981', fontWeight: 700 }}
              >
                {processingBayar ? 'Memproses...' : '💵 Kurir: Terima Pembayaran Tunai COD (Tandai Lunas)'}
              </button>

              {/* Tombol Tampilkan QRIS Kurir */}
              <button
                type="button"
                onClick={handleBukaQrisKurir}
                disabled={processingBayar}
                className="btn btn-outline"
                style={{ borderColor: '#0284c7', color: '#0284c7', fontWeight: 700 }}
              >
                📱 Kurir: Tampilkan Kode QRIS ke Pelanggan
              </button>

              {/* Tautan Pembayaran Lengkap */}
              <Link to={`/pembayaran/${id}`} className="btn btn-outline" style={{ fontSize: '0.85rem' }}>
                💳 Buka Layar Kasir Lengkap
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* MODAL QRIS DI LAYAR PONSEL KURIR */}
      {showQrisModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '380px', width: '100%', padding: '1.5rem', textAlign: 'center', boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#dc2626', background: '#fee2e2', padding: '3px 10px', borderRadius: '4px', letterSpacing: '1px' }}>
              QRIS PEMBAYARAN KURIR
            </span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '0.75rem', marginBottom: '0.25rem', color: '#0f172a' }}>
              OptikExpress Store & Lab
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>
              Perlihatkan kode ini ke pelanggan untuk dipindai via GoPay, BCA, OVO, atau DANA.
            </p>

            <div style={{ display: 'inline-block', padding: '0.75rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #cbd5e1', marginBottom: '1rem' }}>
              <img
                src={qrisImageUrl}
                alt="QRIS Kurir"
                style={{ width: '220px', height: '220px', display: 'block', margin: '0 auto' }}
              />
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0369a1', marginTop: '0.5rem' }}>
                NMID: {qrisNmid}
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#0f172a' }}>
                Rp {totalBiaya.toLocaleString('id-ID')}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={handleKonfirmasiQrisSelesai}
                className="btn btn-primary"
                style={{ background: '#16a34a', borderColor: '#16a34a', fontWeight: 700 }}
              >
                ✓ Pelanggan Sudah Scan & Bayar (Lunas)
              </button>
              <button
                type="button"
                onClick={() => setShowQrisModal(false)}
                className="btn btn-outline"
                style={{ fontSize: '0.85rem' }}
              >
                Tutup QRIS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kartu Status & Info Armada Kurir */}
      <div className="card" style={{ border: '2px solid #bae6fd', backgroundColor: '#f0f9ff', marginBottom: '1.5rem' }}>
        <div className="card-header" style={{ borderColor: '#bae6fd' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.4rem' }}>🛵</span>
            <div>
              <h3 className="card-title" style={{ fontSize: '1.15rem', color: '#0369a1' }}>
                Posisi Kurir Antar-Jemput (Live GPS)
              </h3>
              <small style={{ color: '#0284c7' }}>
                Sistem pemantauan posisi armada logistik berbasis koordinat satelit
              </small>
            </div>
          </div>
          <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.25rem 0.65rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700 }}>
            ⏱️ ETA: {estimasi}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginTop: '0.75rem' }}>
          {/* Identitas Driver */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', background: '#fff', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #e0f2fe' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                🏍️
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontWeight: 800, margin: 0, color: 'var(--dark)' }}>{kurirInfo.nama}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '2px 0' }}>{kurirInfo.kendaraan}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.3rem' }}>
                  <a
                    href={`https://wa.me/62${kurirInfo.telepon.replace(/[^0-9]/g, '').replace(/^0/, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 700, textDecoration: 'none', background: '#dcfce7', padding: '2px 8px', borderRadius: '4px' }}
                  >
                    WA: {kurirInfo.telepon}
                  </a>
                  <a
                    href={`tel:${kurirInfo.telepon}`}
                    style={{ fontSize: '0.8rem', color: '#0284c7', fontWeight: 700, textDecoration: 'none', background: '#e0f2fe', padding: '2px 8px', borderRadius: '4px' }}
                  >
                    Telepon
                  </a>
                </div>
              </div>
            </div>

            {/* Progres Perjalanan */}
            <div style={{ background: '#fff', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #e0f2fe', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: '#0369a1' }}>
                <span>Progres Perjalanan Armada</span>
                <span>{persentase}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${persentase}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #0284c7, #0d9488)',
                    borderRadius: '999px',
                    transition: 'width 0.5s ease'
                  }}
                />
              </div>
              <p style={{ fontSize: '0.85rem', color: '#334155', marginTop: '0.65rem', marginBottom: '0.25rem', fontStyle: 'italic' }}>
                📍 {deskripsi}
              </p>
              <small style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>
                Koordinat Kurir: Lat {kurirLat.toFixed(4)}, Lng {kurirLng.toFixed(4)}
              </small>
            </div>

            {/* Tombol Simulasi Gerak Kurir */}
            <div style={{ background: '#fff', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #e0f2fe' }}>
              <button
                type="button"
                onClick={handleMulaiSimulasi}
                className="btn btn-outline btn-sm"
                style={{ width: '100%', fontSize: '0.85rem' }}
              >
                {simulasiBerjalan ? '⏸️ Hentikan Simulasi Gerak' : '▶️ Mulai Simulasi Gerak Kurir'}
              </button>
            </div>
          </div>

          {/* Peta Interaktif */}
          <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', padding: '1rem', border: '1px solid #e0f2fe' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0369a1' }}>PETA RUTE PENGIRIMAN</span>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button
                  type="button"
                  onClick={() => setTipePeta('osm')}
                  className="btn btn-sm"
                  style={{
                    padding: '0.2rem 0.6rem',
                    fontSize: '0.75rem',
                    backgroundColor: tipePeta === 'osm' ? '#0284c7' : '#f1f5f9',
                    color: tipePeta === 'osm' ? '#fff' : '#64748b',
                    border: 'none',
                    fontWeight: 700
                  }}
                >
                  Peta OpenStreetMap
                </button>
                <button
                  type="button"
                  onClick={() => setTipePeta('svg')}
                  className="btn btn-sm"
                  style={{
                    padding: '0.2rem 0.6rem',
                    fontSize: '0.75rem',
                    backgroundColor: tipePeta === 'svg' ? '#0284c7' : '#f1f5f9',
                    color: tipePeta === 'svg' ? '#fff' : '#64748b',
                    border: 'none',
                    fontWeight: 700
                  }}
                >
                  Radar Vektor
                </button>
              </div>
            </div>

            {tipePeta === 'osm' ? (
              <LiveMapKurir
                kurirLat={kurirLat}
                kurirLng={kurirLng}
                optikLat={optikLat}
                optikLng={optikLng}
                destLat={destLat}
                destLng={destLng}
                kurirNama={kurirInfo.nama}
                kurirKendaraan={kurirInfo.kendaraan}
                alamatTujuan={layanan.alamat || 'Alamat Pelanggan'}
                statusDeskripsi={deskripsi}
                persen={persentase}
              />
            ) : (
              <div style={{ padding: '0.5rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <svg viewBox="0 0 320 140" style={{ width: '100%', height: '220px', background: '#f8fafc', borderRadius: '8px' }}>
                  <path d="M 30 70 Q 110 20, 160 70 T 290 70" fill="none" stroke="#cbd5e1" strokeWidth="8" strokeLinecap="round" />
                  <path d="M 30 70 Q 110 20, 160 70 T 290 70" fill="none" stroke="#0284c7" strokeWidth="4" strokeDasharray="6,4" strokeLinecap="round" />
                  <circle cx="30" cy="70" r="14" fill="#0284c7" />
                  <text x="30" y="74" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">🏪</text>
                  <text x="30" y="98" textAnchor="middle" fill="#0f172a" fontSize="9" fontWeight="bold">{kurirInfo.nama}</text>

                  {(() => {
                    const cx = 30 + 260 * ratio;
                    const cy = 70 + Math.sin(ratio * Math.PI) * -35;
                    return (
                      <g transform={`translate(${cx},${cy})`}>
                        <circle cx="0" cy="0" r="18" fill="#0284c7" fillOpacity="0.25">
                          <animate attributeName="r" values="14;24;14" dur="2s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="0" cy="0" r="12" fill="#0d9488" stroke="#fff" strokeWidth="2" />
                        <text x="0" y="4" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">🛵</text>
                      </g>
                    );
                  })()}

                  <circle cx="290" cy="70" r="14" fill="#10b981" />
                  <text x="290" y="74" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">🏠</text>
                  <text x="290" y="98" textAnchor="middle" fill="#0f172a" fontSize="9" fontWeight="bold">Alamat Jemput</text>
                </svg>
              </div>
            )}

            {/* Direct Google Maps Navigation */}
            <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
              <a
                href={`https://www.google.com/maps/dir/?api=1&origin=${kurirLat},${kurirLng}&destination=${destLat},${destLng}&travelmode=driving`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline btn-sm"
                style={{ width: '100%', display: 'inline-block' }}
              >
                🗺️ Buka Navigasi Rute di Google Maps
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Alamat Penjemputan / Pengantaran */}
      <div className="card">
        <h3 className="card-title" style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>
          Detail Alamat & Waktu Penjemputan
        </h3>
        <table style={{ width: '100%', fontSize: '0.95rem' }}>
          <tbody>
            <tr>
              <td style={{ padding: '0.45rem 0', color: 'var(--text-muted)', width: '30%' }}>Pelanggan:</td>
              <td style={{ padding: '0.45rem 0', fontWeight: 700 }}>{layanan.nama_pelanggan || layanan.pelanggan?.nama || '-'}</td>
            </tr>
            <tr>
              <td style={{ padding: '0.45rem 0', color: 'var(--text-muted)' }}>Nomor Telepon:</td>
              <td style={{ padding: '0.45rem 0', fontWeight: 600 }}>{layanan.no_telepon_pelanggan || layanan.no_telepon || '-'}</td>
            </tr>
            <tr>
              <td style={{ padding: '0.45rem 0', color: 'var(--text-muted)' }}>Jadwal Penjemputan:</td>
              <td style={{ padding: '0.45rem 0', fontWeight: 600 }}>{layanan.tanggal_jemput || '-'} ({layanan.jam_jemput || '-'} WIB)</td>
            </tr>
            <tr>
              <td style={{ padding: '0.45rem 0', color: 'var(--text-muted)', verticalAlign: 'top' }}>Alamat Penjemputan:</td>
              <td style={{ padding: '0.45rem 0' }}>{layanan.alamat || '-'}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TrackingKurir;

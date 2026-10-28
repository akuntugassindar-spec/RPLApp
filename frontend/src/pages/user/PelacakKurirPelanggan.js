import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import LiveMapKurir from '../../components/LiveMapKurir';

/**
 * Halaman Pelacak Kurir Khusus Pelanggan (Customer Courier Tracking)
 * Memungkinkan pelanggan memantau posisi armada kurir secara real-time,
 * melihat estimasi waktu tiba (ETA), rute perjalanan di Google Maps & OpenStreetMap,
 * serta menghubungi kurir yang bertugas via WhatsApp atau Telepon.
 */
const PelacakKurirPelanggan = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryId = searchParams.get('id');

  const [daftarPesanan, setDaftarPesanan] = useState([]);
  const [selectedLayananId, setSelectedLayananId] = useState(queryId || null);
  const [layanan, setLayanan] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingTracking, setLoadingTracking] = useState(false);
  const [error, setError] = useState('');

  // Mode peta interaktif: 'osm' atau 'radar'
  const [tipePeta, setTipePeta] = useState('osm');

  // State simulasi pergerakan kurir GPS
  const [simulasiBerjalan, setSimulasiBerjalan] = useState(false);
  const [simulasiPersen, setSimulasiPersen] = useState(null);
  const [simulasiKeterangan, setSimulasiKeterangan] = useState('');
  const timerSimulasiRef = useRef(null);

  // Ambil seluruh daftar pesanan milik pelanggan
  const fetchDaftarPesanan = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/layanan');
      const items = res.data?.data || res.data || [];
      setDaftarPesanan(items);

      if (items.length > 0) {
        // Cari pesanan aktif terlebih dahulu, atau ambil pesanan pertama
        if (queryId && items.some((it) => String(it.id) === String(queryId))) {
          setSelectedLayananId(queryId);
        } else {
          const pesananAktif = items.find(
            (it) => it.status !== 'selesai' && it.status !== 'dibatalkan'
          );
          setSelectedLayananId(pesananAktif ? String(pesananAktif.id) : String(items[0].id));
        }
      }
    } catch (err) {
      setError('Gagal memuat daftar pesanan Anda.');
    } finally {
      setLoading(false);
    }
  }, [queryId]);

  // Ambil detail dan tracking untuk pesanan yang dipilih
  const fetchDetailDanTracking = useCallback(async (idPesanan) => {
    if (!idPesanan) return;
    setLoadingTracking(true);
    try {
      const [resLayanan, resTracking] = await Promise.allSettled([
        api.get(`/layanan/${idPesanan}`),
        api.get(`/layanan/${idPesanan}/tracking`)
      ]);

      if (resLayanan.status === 'fulfilled') {
        setLayanan(resLayanan.value.data?.data || resLayanan.value.data);
      }
      if (resTracking.status === 'fulfilled') {
        setTrackingData(resTracking.value.data?.data || null);
      }
    } catch (err) {
      console.error('Gagal memuat tracking kurir:', err);
    } finally {
      setLoadingTracking(false);
    }
  }, []);

  useEffect(() => {
    fetchDaftarPesanan();
  }, [fetchDaftarPesanan]);

  useEffect(() => {
    if (selectedLayananId) {
      fetchDetailDanTracking(selectedLayananId);
      setSearchParams({ id: selectedLayananId }, { replace: true });

      // Hentikan simulasi sebelumnya bila berpindah pesanan
      if (timerSimulasiRef.current) {
        clearInterval(timerSimulasiRef.current);
        setSimulasiBerjalan(false);
        setSimulasiPersen(null);
        setSimulasiKeterangan('');
      }

      // Auto-polling posisi kurir setiap 7 detik
      const interval = setInterval(() => {
        fetchDetailDanTracking(selectedLayananId);
      }, 7000);

      return () => clearInterval(interval);
    }
  }, [selectedLayananId, fetchDetailDanTracking, setSearchParams]);

  // Simulasi perjalanan kurir live GPS
  const handleToggleSimulasi = () => {
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
    setSimulasiKeterangan('Kurir menyalakan kendaraan dan bersiap dari gerai optik menuju alamat Anda...');

    timerSimulasiRef.current = setInterval(() => {
      p += 15;
      if (p >= 100) {
        p = 100;
        setSimulasiPersen(100);
        setSimulasiKeterangan('Kurir telah tiba di alamat penjemputan/pengantaran!');
        clearInterval(timerSimulasiRef.current);
        setTimeout(() => setSimulasiBerjalan(false), 7000);
      } else if (p === 30) {
        setSimulasiPersen(p);
        setSimulasiKeterangan('Kurir melintasi jalur arteri kota (Kecepatan rata-rata 35 km/jam)...');
      } else if (p === 45) {
        setSimulasiPersen(p);
        setSimulasiKeterangan('Kurir sedang bergerak menuju area perumahan Anda...');
      } else if (p === 60) {
        setSimulasiPersen(p);
        setSimulasiKeterangan('Kurir mendekati lokasi penjemputan kacamata Anda...');
      } else if (p === 75) {
        setSimulasiPersen(p);
        setSimulasiKeterangan('Kurir berjarak sekitar 250 meter dari titik temu...');
      } else {
        setSimulasiPersen(p);
      }
    }, 1800);
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('selesai')) return <span className="badge badge-selesai">Selesai</span>;
    if (s.includes('antar')) return <span className="badge badge-antar">Sedang Diantar</span>;
    if (s.includes('jemput') || s === 'diambil' || s === 'dijadwalkan') return <span className="badge badge-jemput">Penjemputan</span>;
    if (s.includes('proses')) return <span className="badge badge-proses">Diproses di Lab</span>;
    return <span className="badge badge-pending">Menunggu Kurir</span>;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
        <p>Memuat sistem pelacakan kurir...</p>
      </div>
    );
  }

  if (daftarPesanan.length === 0) {
    return (
      <div style={{ maxWidth: '720px', margin: '3rem auto', textAlign: 'center', padding: '2.5rem 1.5rem', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
          Belum Ada Pesanan yang Aktif
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
          Anda belum memiliki pesanan layanan antar-jemput kacamata. Buat pesanan baru untuk mulai menggunakan layanan kurir kami.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/layanan/buat" className="btn btn-primary" style={{ padding: '0.6rem 1.25rem', fontWeight: 700 }}>
            + Buat Pesanan Sekarang
          </Link>
          <Link to="/dashboard" className="btn btn-outline" style={{ padding: '0.6rem 1.25rem' }}>
            Ke Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Data kurir & lokasi
  const kurirInfo = trackingData?.kurir || {
    nama: layanan?.kurir_nama || 'Agus Pratama',
    telepon: layanan?.kurir_telepon || '081234567890',
    kendaraan: 'Honda Vario 160 (B 4589 AB)'
  };

  const persentase = simulasiPersen !== null ? simulasiPersen : (trackingData?.persentase_perjalanan || 30);
  const estimasi = trackingData?.estimasi_tiba || '20-30 Menit';
  const deskripsi = simulasiKeterangan || trackingData?.status_deskripsi || 'Kurir bersiap menuju alamat Anda.';

  const optikLat = -6.2088;
  const optikLng = 106.8456;
  const destLat = Number(trackingData?.lokasi_tujuan?.lat) || -6.2205;
  const destLng = Number(trackingData?.lokasi_tujuan?.lng) || 106.8270;
  const defaultKurirLat = destLat + 0.003;
  const defaultKurirLng = destLng + 0.003;
  const actualKurirLat = Number(trackingData?.kurir?.posisi_saat_ini?.lat) || (layanan?.kurir_lat ? Number(layanan.kurir_lat) : defaultKurirLat);
  const actualKurirLng = Number(trackingData?.kurir?.posisi_saat_ini?.lng) || (layanan?.kurir_lng ? Number(layanan.kurir_lng) : defaultKurirLng);

  const ratio = persentase / 100;
  const kurirLat = simulasiBerjalan ? (optikLat + (destLat - optikLat) * ratio) : actualKurirLat;
  const kurirLng = simulasiBerjalan ? (optikLng + (destLng - optikLng) * ratio) : actualKurirLng;

  const totalBiaya = Number(layanan?.total_biaya || trackingData?.pembayaran?.total_biaya || 0);
  const isLunas = (layanan?.status_pembayaran || trackingData?.pembayaran?.status_pembayaran) === 'lunas';

  return (
    <div style={{ maxWidth: '1060px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Header Halaman */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <Link to="/dashboard" className="btn btn-outline btn-sm">
              ← Kembali ke Dashboard
            </Link>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--dark)', margin: 0 }}>
              Pelacak Kurir Pelanggan (Live GPS)
            </h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', margin: '4px 0 0 0' }}>
            Pantau posisi kurir penjemputan dan pengantaran kacamata Anda secara akurat dan real-time
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button
            type="button"
            onClick={() => fetchDetailDanTracking(selectedLayananId)}
            className="btn btn-outline btn-sm"
          >
            {loadingTracking ? 'Memperbarui...' : 'Refresh Posisi'}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Selector Pemilihan Pesanan Pelanggan */}
      {daftarPesanan.length > 1 && (
        <div style={{ marginBottom: '1.25rem', background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
            Pilih Pesanan Anda:
          </span>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {daftarPesanan.map((it) => (
              <button
                key={it.id}
                type="button"
                onClick={() => setSelectedLayananId(String(it.id))}
                style={{
                  padding: '0.35rem 0.8rem',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  borderRadius: '8px',
                  border: String(it.id) === String(selectedLayananId) ? '2px solid #0284c7' : '1px solid #cbd5e1',
                  background: String(it.id) === String(selectedLayananId) ? '#e0f2fe' : '#ffffff',
                  color: String(it.id) === String(selectedLayananId) ? '#0369a1' : '#475569',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <span>Pesanan #{it.id}</span>
                <span style={{ fontSize: '0.72rem', textTransform: 'capitalize', color: '#64748b' }}>
                  ({it.jenis_layanan ? it.jenis_layanan.replace('_', ' ') : '-'})
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Ringkasan Status & Tagihan untuk Pelanggan */}
      {layanan && (
        <div
          className="card"
          style={{
            marginBottom: '1.5rem',
            border: '1.5px solid #cbd5e1',
            boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                  Pesanan #{layanan.id} &bull; {layanan.jenis_layanan ? layanan.jenis_layanan.replace('_', ' ').toUpperCase() : 'LAYANAN KACAMATA'}
                </span>
                {getStatusBadge(layanan.status)}
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                Jenis Kacamata: <strong>{layanan.jenis_kacamata || '-'}</strong> &bull; Jadwal Jemput: <strong>{layanan.tanggal_jemput || '-'} ({layanan.jam_jemput || '-'} WIB)</strong>
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block' }}>Status Pembayaran:</span>
                <span
                  className="badge"
                  style={{
                    backgroundColor: isLunas ? '#dcfce7' : '#fef3c7',
                    color: isLunas ? '#15803d' : '#b45309',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    padding: '0.25rem 0.65rem'
                  }}
                >
                  {isLunas ? 'LUNAS' : `BELUM BAYAR (Rp ${totalBiaya.toLocaleString('id-ID')})`}
                </span>
              </div>

              {!isLunas && totalBiaya > 0 && (
                <Link
                  to={`/pembayaran/${layanan.id}`}
                  className="btn btn-primary btn-sm"
                  style={{ fontWeight: 700, padding: '0.4rem 0.9rem' }}
                >
                  Bayar Tagihan
                </Link>
              )}

              <Link
                to={`/layanan/${layanan.id}`}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.82rem' }}
              >
                Detail Lengkap
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Kartu Utama: Info Kurir, Radar Progress, dan Peta Navigasi */}
      <div className="card" style={{ border: '2px solid #bae6fd', backgroundColor: '#f0f9ff', marginBottom: '1.5rem' }}>
        <div className="card-header" style={{ borderColor: '#bae6fd', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 className="card-title" style={{ fontSize: '1.2rem', color: '#0369a1', margin: 0 }}>
              Armada Kurir OptikExpress (Live Tracking)
            </h3>
            <small style={{ color: '#0284c7' }}>
              Kurir resmi gerai optik yang bertugas menjemput dan mengantar kacamata Anda
            </small>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.35rem 0.85rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 800 }}>
              Estimasi Tiba: {estimasi}
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginTop: '0.75rem' }}>
          {/* Kolom Kiri: Profil Driver & Progress Perjalanan */}
          <div>
            {/* Profil Kurir */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', background: '#fff', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #e0f2fe', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ width: '52px', height: '52px', minWidth: '52px', borderRadius: '50%', background: '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontWeight: 800, margin: 0, color: 'var(--dark)', fontSize: '1.05rem' }}>
                  {kurirInfo.nama}
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '2px 0 6px 0' }}>
                  {kurirInfo.kendaraan}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <a
                    href={`https://wa.me/62${kurirInfo.telepon.replace(/[^0-9]/g, '').replace(/^0/, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 700, textDecoration: 'none', background: '#dcfce7', padding: '3px 8px', borderRadius: '5px' }}
                  >
                    WhatsApp Kurir
                  </a>
                  <a
                    href={`tel:${kurirInfo.telepon}`}
                    style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: 700, textDecoration: 'none', background: '#e0f2fe', padding: '3px 8px', borderRadius: '5px' }}
                  >
                    Hubungi Telepon
                  </a>
                </div>
              </div>
            </div>

            {/* Progress Bar & Status Deskripsi */}
            <div style={{ background: '#fff', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #e0f2fe', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', color: '#0369a1' }}>
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
              <p style={{ fontSize: '0.85rem', color: '#334155', marginTop: '0.65rem', marginBottom: '0.25rem', fontWeight: 600 }}>
                {deskripsi}
              </p>
              <small style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>
                Koordinat Satelit Kurir: Lat {kurirLat.toFixed(4)}, Lng {kurirLng.toFixed(4)}
              </small>
            </div>

            {/* Tombol Simulasi Pergerakan Kurir untuk Pelanggan */}
            <div style={{ background: '#fff', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid #e0f2fe' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0369a1' }}>Simulasi Gerak GPS Kurir</span>
                <span style={{ fontSize: '0.75rem', color: simulasiBerjalan ? '#16a34a' : '#64748b', fontWeight: 600 }}>
                  {simulasiBerjalan ? 'Sedang Berjalan' : 'Non-aktif'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleToggleSimulasi}
                className="btn btn-outline btn-sm"
                style={{ width: '100%', fontSize: '0.85rem', fontWeight: 700 }}
              >
                {simulasiBerjalan ? 'Hentikan Simulasi Gerak' : 'Mulai Simulasi Gerak Kurir'}
              </button>
            </div>
          </div>

          {/* Kolom Kanan: Peta Rute OpenStreetMap / Google Maps Embed */}
          <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', padding: '1rem', border: '1px solid #e0f2fe' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0369a1' }}>
                PETA RUTE LOGISTIK
              </span>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button
                  type="button"
                  onClick={() => setTipePeta('osm')}
                  className="btn btn-sm"
                  style={{
                    padding: '0.25rem 0.65rem',
                    fontSize: '0.75rem',
                    backgroundColor: tipePeta === 'osm' ? '#0284c7' : '#f1f5f9',
                    color: tipePeta === 'osm' ? '#fff' : '#64748b',
                    border: 'none',
                    fontWeight: 700
                  }}
                >
                  Peta Navigasi (OSM/Google)
                </button>
                <button
                  type="button"
                  onClick={() => setTipePeta('radar')}
                  className="btn btn-sm"
                  style={{
                    padding: '0.25rem 0.65rem',
                    fontSize: '0.75rem',
                    backgroundColor: tipePeta === 'radar' ? '#0284c7' : '#f1f5f9',
                    color: tipePeta === 'radar' ? '#fff' : '#64748b',
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
                alamatTujuan={layanan?.alamat || 'Alamat Anda'}
                statusDeskripsi={deskripsi}
                persen={persentase}
              />
            ) : (
              <div style={{ padding: '0.5rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <svg viewBox="0 0 320 140" style={{ width: '100%', height: '220px', background: '#f8fafc', borderRadius: '8px' }}>
                  <path d="M 30 70 Q 110 20, 160 70 T 290 70" fill="none" stroke="#cbd5e1" strokeWidth="8" strokeLinecap="round" />
                  <path d="M 30 70 Q 110 20, 160 70 T 290 70" fill="none" stroke="#0284c7" strokeWidth="4" strokeDasharray="6,4" strokeLinecap="round" />
                  <circle cx="30" cy="70" r="14" fill="#0284c7" />
                  <text x="30" y="74" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">O</text>
                  <text x="30" y="98" textAnchor="middle" fill="#0f172a" fontSize="9" fontWeight="bold">Optik</text>

                  {(() => {
                    const cx = 30 + 260 * ratio;
                    const cy = 70 + Math.sin(ratio * Math.PI) * -35;
                    return (
                      <g transform={`translate(${cx},${cy})`}>
                        <circle cx="0" cy="0" r="18" fill="#0284c7" fillOpacity="0.25">
                          <animate attributeName="r" values="14;24;14" dur="2s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="0" cy="0" r="12" fill="#0d9488" stroke="#fff" strokeWidth="2" />
                        <text x="0" y="4" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">K</text>
                      </g>
                    );
                  })()}

                  <circle cx="290" cy="70" r="14" fill="#10b981" />
                  <text x="290" y="74" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">P</text>
                  <text x="290" y="98" textAnchor="middle" fill="#0f172a" fontSize="9" fontWeight="bold">Rumah Anda</text>
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
                Buka Navigasi Rute di Google Maps
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Alamat Penjemputan / Pengantaran Kacamata */}
      {layanan && (
        <div className="card">
          <h3 className="card-title" style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>
            Titik Lokasi Penjemputan / Pengantaran Kacamata
          </h3>
          <table style={{ width: '100%', fontSize: '0.92rem' }}>
            <tbody>
              <tr>
                <td style={{ padding: '0.45rem 0', color: 'var(--text-muted)', width: '30%' }}>Penerima:</td>
                <td style={{ padding: '0.45rem 0', fontWeight: 700 }}>{layanan.nama_pelanggan || layanan.pelanggan?.nama || '-'}</td>
              </tr>
              <tr>
                <td style={{ padding: '0.45rem 0', color: 'var(--text-muted)' }}>Nomor Telepon:</td>
                <td style={{ padding: '0.45rem 0', fontWeight: 600 }}>{layanan.no_telepon_pelanggan || layanan.no_telepon || '-'}</td>
              </tr>
              <tr>
                <td style={{ padding: '0.45rem 0', color: 'var(--text-muted)' }}>Jadwal Layanan:</td>
                <td style={{ padding: '0.45rem 0', fontWeight: 600 }}>{layanan.tanggal_jemput || '-'} ({layanan.jam_jemput || '-'} WIB)</td>
              </tr>
              <tr>
                <td style={{ padding: '0.45rem 0', color: 'var(--text-muted)', verticalAlign: 'top' }}>Alamat Tujuan:</td>
                <td style={{ padding: '0.45rem 0', fontWeight: 500 }}>{layanan.alamat || '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PelacakKurirPelanggan;

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import LiveMapKurir from '../../components/LiveMapKurir';

/**
 * Halaman Pelacakan Kurir GPS (Tracking Kurir)
 * Menampilkan:
 * 1. Peta interaktif Leaflet OpenStreetMap dengan marker animasi kurir bergerak.
 * 2. Informasi identitas kurir (nama, telepon, kendaraan, plat nomor).
 * 3. Estimasi waktu kedatangan (ETA) dan persentase perjalanan logistik.
 * 4. Tautan langsung navigasi Google Maps turn-by-turn.
 * 5. Fitur auto-polling status posisi kurir secara real-time.
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

  const fetchTracking = useCallback(async () => {
    try {
      const res = await api.get(`/layanan/${id}/tracking`);
      if (res.data?.data) {
        setTrackingData(res.data.data);
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
        <p>Memuat sistem pelacakan kurir #{id}...</p>
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
  const destLat = -7.2890;
  const destLng = 112.7950;
  const ratio = persentase / 100;
  const kurirLat = trackingData?.kurir?.posisi_saat_ini?.lat || (optikLat + (destLat - optikLat) * ratio);
  const kurirLng = trackingData?.kurir?.posisi_saat_ini?.lng || (optikLng + (destLng - optikLng) * ratio);

  return (
    <div style={{ maxWidth: '1060px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
            <Link to={`/layanan/${id}`} className="btn btn-outline btn-sm">Kembali ke Pesanan</Link>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--dark)' }}>
              Pelacakan Kurir Langsung (GPS)
            </h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Pesanan #{id} &bull; {layanan.jenis_layanan ? layanan.jenis_layanan.replace('_', ' ').toUpperCase() : 'LAYANAN KACAMATA'}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {getStatusBadge(layanan.status)}
          <button onClick={() => { fetchLayanan(); fetchTracking(); }} className="btn btn-outline btn-sm">
            Refresh Posisi
          </button>
        </div>
      </div>

      {/* Card Utama Pelacakan */}
      <div className="card" style={{ border: '2px solid #bae6fd', backgroundColor: '#f0f9ff', marginBottom: '1.5rem' }}>
        <div className="card-header" style={{ borderColor: '#bae6fd', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 className="card-title" style={{ fontSize: '1.2rem', color: '#0369a1' }}>
              Armada Kurir OptikExpress
            </h3>
            <small style={{ color: '#0284c7' }}>Pembaruan koordinat GPS real-time</small>
          </div>
          <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.35rem 0.85rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 700 }}>
            Estimasi Tiba (ETA): {estimasi}
          </span>
        </div>

        {/* Info Kurir & Progress Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginTop: '1rem' }}>
          <div style={{ background: '#fff', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #e0f2fe' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800 }}>
                K
              </div>
              <div>
                <h4 style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--dark)' }}>{kurirInfo.nama}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{kurirInfo.kendaraan}</p>
                <p style={{ fontSize: '0.85rem', color: '#0369a1', fontWeight: 700 }}>Telepon: {kurirInfo.telepon}</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <a
                href={`tel:${kurirInfo.telepon}`}
                className="btn btn-outline btn-sm"
                style={{ flex: 1, textAlign: 'center' }}
              >
                Hubungi Kurir
              </a>
              <a
                href={`https://wa.me/62${kurirInfo.telepon.replace(/^0/, '')}?text=Halo%20Kurir%20OptikExpress%20pesanan%20nomor%20${id}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-sm"
                style={{ flex: 1, textAlign: 'center', backgroundColor: '#10b981', color: '#fff', fontWeight: 600, border: 'none' }}
              >
                Chat WhatsApp
              </a>
            </div>

            {/* Progress Bar */}
            <div style={{ marginTop: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem', color: '#0369a1' }}>
                <span>Progres Perjalanan</span>
                <span>{persentase}%</span>
              </div>
              <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: `${persentase}%`, height: '100%', background: 'linear-gradient(90deg, #0284c7, #0d9488)', borderRadius: '999px', transition: 'width 0.5s ease' }} />
              </div>
              <p style={{ fontSize: '0.85rem', color: '#334155', marginTop: '0.6rem', fontStyle: 'italic', background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                Status: {deskripsi}
              </p>
            </div>

            {/* Tombol Simulasi Radar */}
            <div style={{ marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
              <button
                type="button"
                onClick={handleMulaiSimulasi}
                className="btn btn-outline btn-sm"
                style={{ width: '100%', fontSize: '0.85rem' }}
              >
                {simulasiBerjalan ? 'Hentikan Simulasi Gerak' : 'Mulai Simulasi Gerak Kurir'}
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
                  <circle cx="30" cy="70" r="14" fill="#0369a1" />
                  <text x="30" y="74" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">OPTIK</text>
                  <text x="30" y="98" textAnchor="middle" fill="#0f172a" fontSize="9" fontWeight="bold">Lab Optik</text>

                  {(() => {
                    const cx = 30 + 260 * ratio;
                    const cy = 70 + Math.sin(ratio * Math.PI) * -35;
                    return (
                      <g transform={`translate(${cx},${cy})`}>
                        <circle cx="0" cy="0" r="18" fill="#0284c7" fillOpacity="0.25">
                          <animate attributeName="r" values="14;24;14" dur="2s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="0" cy="0" r="12" fill="#0d9488" stroke="#fff" strokeWidth="2" />
                        <text x="0" y="4" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">KURIR</text>
                      </g>
                    );
                  })()}

                  <circle cx="290" cy="70" r="14" fill="#10b981" />
                  <text x="290" y="74" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">TUJUAN</text>
                  <text x="290" y="98" textAnchor="middle" fill="#0f172a" fontSize="9" fontWeight="bold">Pelanggan</text>
                </svg>
              </div>
            )}

            {/* Direct Google Maps Navigation */}
            <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
              <a
                href={`https://www.google.com/maps/dir/?api=1&origin=${optikLat},${optikLng}&destination=${encodeURIComponent(layanan.alamat || 'Surabaya')}&travelmode=driving`}
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


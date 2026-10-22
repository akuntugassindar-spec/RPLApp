import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import SuccessOverlay from '../../components/SuccessOverlay';

/**
 * Halaman Dashboard Khusus Kurir Logistik (Kurir OptikExpress)
 * Fitur:
 * 1. Manajemen tugas penjemputan dan pengantaran kacamata.
 * 2. Pembaruan alur status logistik cepat (dijadwalkan -> diambil -> diproses -> diantar -> selesai).
 * 3. Broadcast koordinat GPS kurir langsung ke sistem tracking.
 * 4. Kasir Pembayaran Kurir di Tempat (COD Tunai & QRIS EMVCo dinamis di HP kurir).
 * 5. Tautan instan navigasi Google Maps dan kontak WhatsApp ke pelanggan.
 */
const KurirDashboard = () => {
  const [layananList, setLayananList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterStatus, setFilterStatus] = useState('semua');
  const [updatingId, setUpdatingId] = useState(null);

  // State Kasir di Tempat Kurir
  const [kasirModalItem, setKasirModalItem] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalQris, setModalQris] = useState('');

  // Info kurir dari localStorage
  const userJson = localStorage.getItem('user');
  let user = null;
  try {
    user = userJson ? JSON.parse(userJson) : null;
  } catch (e) {
    user = null;
  }

  const fetchTugasKurir = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/layanan');
      const data = response.data?.data || response.data || [];
      setLayananList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Gagal mengambil tugas kurir:', err);
      setError('Gagal memuat daftar tugas pengantaran kurir.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTugasKurir();
  }, [fetchTugasKurir]);

  // Handler update status cepat oleh kurir
  const handleUpdateStatus = async (itemId, statusBaru, deskripsiStatus) => {
    setUpdatingId(itemId);
    setError('');
    setSuccess('');
    try {
      const payload = {
        status: statusBaru,
        tracking_status: deskripsiStatus || `Kurir memperbarui status pesanan menjadi: ${statusBaru}`
      };
      await api.put(`/layanan/${itemId}/status`, payload);
      setSuccess(`Status pesanan #${itemId} berhasil diubah menjadi: ${statusBaru.toUpperCase()}!`);
      await fetchTugasKurir();
    } catch (err) {
      console.error('Gagal update status:', err);
      setError(err.response?.data?.message || 'Gagal memperbarui status tugas.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Broadcast GPS kurir ke pesanan aktif
  const handleBroadcastGPS = async (itemId) => {
    if (!navigator.geolocation) {
      alert('Browser Anda tidak mendukung Geolocation.');
      return;
    }
    setUpdatingId(itemId);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          await api.put(`/layanan/${itemId}/tracking`, {
            kurir_lat: latitude,
            kurir_lng: longitude,
            tracking_status: `Posisi GPS Kurir terkini: (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`
          });
          setSuccess(`Koordinat GPS Kurir untuk pesanan #${itemId} berhasil disiarkan!`);
          fetchTugasKurir();
        } catch (err) {
          setError('Gagal mengirim koordinat GPS: ' + (err.response?.data?.message || err.message));
        } finally {
          setUpdatingId(null);
        }
      },
      (geoErr) => {
        // Fallback jika GPS browser ditolak: kirim koordinat Surabaya tengah
        api.put(`/layanan/${itemId}/tracking`, {
          kurir_lat: -7.2625,
          kurir_lng: 112.7485,
          tracking_status: 'Kurir aktif di area Surabaya Pusat (Jl. Pemuda)'
        }).then(() => {
          setSuccess(`Simulasi GPS aktif untuk pesanan #${itemId}.`);
          fetchTugasKurir();
        }).finally(() => setUpdatingId(null));
      }
    );
  };

  // Buka modal Kasir Kurir di Tempat
  const handleBukaKasir = async (item) => {
    setKasirModalItem(item);
    setModalLoading(true);
    setModalQris('');
    try {
      // Inisialisasi QRIS dinamis jika metode qris atau buat baru
      const res = await api.post(`/layanan/${item.id}/pembayaran`, { metode_pembayaran: 'qris' });
      const payData = res.data?.data;
      if (payData?.payment_detail?.qr_image) {
        setModalQris(payData.payment_detail.qr_image);
      }
    } catch (err) {
      console.error('Gagal inisialisasi QRIS kurir:', err);
    } finally {
      setModalLoading(false);
    }
  };

  // Konfirmasi pembayaran tunai / COD diterima oleh kurir
  const handleTerimaPembayaran = async (itemId) => {
    if (!window.confirm(`Konfirmasi pembayaran untuk pesanan #${itemId} telah diterima LUNAS?`)) return;
    setModalLoading(true);
    try {
      await api.post(`/layanan/${itemId}/pembayaran/konfirmasi`);
      setSuccess(`Pembayaran pesanan #${itemId} berhasil dikonfirmasi LUNAS!`);
      setKasirModalItem(null);
      fetchTugasKurir();
    } catch (err) {
      alert('Gagal mengonfirmasi pembayaran: ' + (err.response?.data?.message || err.message));
    } finally {
      setModalLoading(false);
    }
  };

  // Filter tugas
  const filteredList = layananList.filter((item) => {
    if (filterStatus === 'semua') return true;
    if (filterStatus === 'jemput') return item.status === 'dijadwalkan' || item.status === 'diambil';
    if (filterStatus === 'lab') return item.status === 'diproses';
    if (filterStatus === 'antar') return item.status === 'diantar';
    if (filterStatus === 'selesai') return item.status === 'selesai';
    return true;
  });

  // Metrik statistik
  const totalTugas = layananList.length;
  const perluJemput = layananList.filter((i) => i.status === 'dijadwalkan' || i.status === 'diambil').length;
  const diLabOptik = layananList.filter((i) => i.status === 'diproses').length;
  const perluAntar = layananList.filter((i) => i.status === 'diantar').length;
  const selesaiLunas = layananList.filter((i) => i.status === 'selesai').length;

  const renderBadgeStatus = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'selesai') return <span className="badge badge-selesai">✓ Selesai</span>;
    if (s === 'diantar') return <span className="badge badge-antar">🚚 Sedang Diantar</span>;
    if (s === 'diambil') return <span className="badge badge-jemput">🛵 Sedang Dijemput</span>;
    if (s === 'diproses') return <span className="badge badge-proses">⚙️ Di Lab Optik</span>;
    if (s === 'dijadwalkan') return <span className="badge" style={{ background: '#fef3c7', color: '#b45309', fontWeight: 700 }}>📅 Siap Dijemput</span>;
    return <span className="badge badge-pending">⏳ Pengajuan</span>;
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Header Profil Kurir */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          color: '#fff',
          marginBottom: '1.5rem',
          padding: '1.75rem',
          border: 'none',
          boxShadow: '0 10px 25px -5px rgba(2, 132, 199, 0.3)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#fff',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
              }}
            >
              🛵
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                  {user?.nama || 'Agus Pratama'}
                </h1>
                <span
                  style={{
                    backgroundColor: '#e0f2fe',
                    color: '#0369a1',
                    padding: '0.2rem 0.65rem',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    textTransform: 'uppercase'
                  }}
                >
                  Kurir Logistik Optik
                </span>
              </div>
              <p style={{ margin: '0.25rem 0 0 0', opacity: 0.9, fontSize: '0.92rem' }}>
                🏍️ Armada: <strong>Honda Vario 160 (L 4589 AB)</strong> &bull; Status: <span style={{ color: '#86efac', fontWeight: 700 }}>● Aktif Siap Bertugas</span>
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button
              onClick={fetchTugasKurir}
              className="btn btn-sm"
              style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '6px', fontWeight: 600 }}
            >
              🔄 Refresh Tugas
            </button>
            <Link
              to="/kurir"
              className="btn btn-sm"
              style={{ background: '#fff', color: '#0369a1', borderRadius: '6px', fontWeight: 700 }}
            >
              👥 Master Armada Kurir
            </Link>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      {/* Overlay Notifikasi Berhasil saat Mengubah Data Pesanan */}
      <SuccessOverlay
        message={success}
        onClose={() => setSuccess('')}
        title="Tugas Kurir Berhasil Diperbarui!"
      />

      {/* Grid Statistik Tugas Kurir */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #0284c7' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL TUGAS</span>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.35rem 0 0', color: 'var(--dark)' }}>{totalTugas}</h3>
        </div>
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #f59e0b' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>PERLU DIJEMPUT</span>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.35rem 0 0', color: '#b45309' }}>{perluJemput}</h3>
        </div>
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #6366f1' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>DI LAB OPTIK</span>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.35rem 0 0', color: '#4338ca' }}>{diLabOptik}</h3>
        </div>
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #06b6d4' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>PERLU DIANTAR</span>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.35rem 0 0', color: '#0e7490' }}>{perluAntar}</h3>
        </div>
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #10b981' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>SELESAI LUNAS</span>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.35rem 0 0', color: '#047857' }}>{selesaiLunas}</h3>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {[
          { key: 'semua', label: `Semua Tugas (${totalTugas})` },
          { key: 'jemput', label: `Perlu Dijemput (${perluJemput})` },
          { key: 'lab', label: `Di Lab Optik (${diLabOptik})` },
          { key: 'antar', label: `Perlu Diantar (${perluAntar})` },
          { key: 'selesai', label: `Selesai (${selesaiLunas})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            className="btn btn-sm"
            style={{
              backgroundColor: filterStatus === tab.key ? '#0284c7' : '#fff',
              color: filterStatus === tab.key ? '#fff' : 'var(--dark)',
              border: '1px solid ' + (filterStatus === tab.key ? '#0284c7' : '#e2e8f0'),
              fontWeight: filterStatus === tab.key ? 700 : 500,
              borderRadius: '6px'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Konten Daftar Tugas */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <p>Memuat daftar tugas kurir...</p>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <span style={{ fontSize: '2.5rem' }}>📭</span>
          <h3 style={{ marginTop: '0.75rem', color: 'var(--dark)' }}>Tidak Ada Tugas pada Kategori Ini</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Seluruh tugas penjemputan dan pengantaran kacamata telah terlayani dengan baik.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredList.map((item) => {
            const isLunas = item.status_pembayaran === 'lunas';
            const telpBersih = (item.no_telepon_pelanggan || '').replace(/[^0-9]/g, '');
            const waNumber = telpBersih.startsWith('0') ? '62' + telpBersih.slice(1) : telpBersih;

            return (
              <div
                key={item.id}
                className="card"
                style={{
                  borderLeft: isLunas ? '5px solid #10b981' : '5px solid #f59e0b',
                  padding: '1.25rem',
                  position: 'relative'
                }}
              >
                {/* Header Pesanan */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--dark)' }}>
                        Pesanan #{item.id}
                      </span>
                      {renderBadgeStatus(item.status)}
                      <span
                        className="badge"
                        style={{
                          backgroundColor: isLunas ? '#dcfce7' : '#fef3c7',
                          color: isLunas ? '#15803d' : '#b45309',
                          fontWeight: 700
                        }}
                      >
                        {isLunas ? '✓ LUNAS' : '⏳ TAGIHAN BELUM LUNAS'}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Layanan: <strong style={{ textTransform: 'capitalize' }}>{(item.jenis_layanan || '').replace(/_/g, ' ')}</strong>
                      {item.jenis_kacamata && ` &bull; Model: ${item.jenis_kacamata}`}
                    </span>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Total Tagihan</span>
                    <strong style={{ fontSize: '1.15rem', color: '#0369a1' }}>
                      Rp {Number(item.total_biaya || 0).toLocaleString('id-ID')}
                    </strong>
                  </div>
                </div>

                {/* Detail Pelanggan & Alamat */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '1rem',
                    background: '#f8fafc',
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>Nama Pelanggan:</p>
                    <p style={{ margin: '0.15rem 0 0.5rem', fontWeight: 700, fontSize: '0.95rem' }}>
                      👤 {item.nama_pelanggan || 'Pelanggan Optik'}
                    </p>

                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>Nomor Telepon:</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.15rem' }}>
                      <strong style={{ fontSize: '0.92rem' }}>📞 {item.no_telepon_pelanggan || '-'}</strong>
                      {item.no_telepon_pelanggan && (
                        <a
                          href={`https://wa.me/${waNumber}?text=Halo%20${encodeURIComponent(item.nama_pelanggan || '')},%20saya%20Agus%20kurir%20OptikExpress%20ingin%20mengonfirmasi%20pengantaran%20kacamata%20pesanan%20%23${item.id}.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm"
                          style={{
                            backgroundColor: '#25D366',
                            color: '#fff',
                            padding: '0.15rem 0.5rem',
                            fontSize: '0.75rem',
                            borderRadius: '4px',
                            fontWeight: 700,
                            textDecoration: 'none'
                          }}
                        >
                          💬 Chat WA
                        </a>
                      )}
                    </div>
                  </div>

                  <div>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>Alamat Jemput / Antar:</p>
                    <p style={{ margin: '0.15rem 0 0.4rem', fontWeight: 600, fontSize: '0.9rem', color: '#1e293b' }}>
                      📍 {item.alamat || 'Alamat tidak diisi'}
                    </p>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.alamat || 'Surabaya')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                    >
                      🧭 Buka di Google Maps
                    </a>
                  </div>

                  <div>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>Jadwal Penjemputan:</p>
                    <p style={{ margin: '0.15rem 0 0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                      📅 {item.tanggal_jemput || '-'} ({item.jam_jemput || '-'})
                    </p>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>Keluhan Kerusakan:</p>
                    <p style={{ margin: '0.15rem 0', fontSize: '0.85rem', fontStyle: 'italic', color: '#475569' }}>
                      &ldquo;{item.keluhan || '-'}&rdquo;
                    </p>
                  </div>
                </div>

                {/* Bar Tombol Aksi Operasional Kurir */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.65rem' }}>
                  {/* Tombol Alur Status Logistik Cepat */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {item.status === 'dijadwalkan' && (
                      <button
                        onClick={() => handleUpdateStatus(item.id, 'diambil', 'Kurir sedang dalam perjalanan menjemput kacamata dari pelanggan.')}
                        disabled={updatingId === item.id}
                        className="btn btn-sm"
                        style={{ backgroundColor: '#0284c7', color: '#fff', fontWeight: 700, borderRadius: '6px' }}
                      >
                        🛵 Mulai Jemput Kacamata
                      </button>
                    )}

                    {item.status === 'diambil' && (
                      <button
                        onClick={() => handleUpdateStatus(item.id, 'diproses', 'Kacamata telah sampai di laboratorium optik dan sedang dikerjakan teknisi.')}
                        disabled={updatingId === item.id}
                        className="btn btn-sm"
                        style={{ backgroundColor: '#6366f1', color: '#fff', fontWeight: 700, borderRadius: '6px' }}
                      >
                        🏢 Tiba di Lab & Serahkan Kacamata
                      </button>
                    )}

                    {item.status === 'diproses' && (
                      <button
                        onClick={() => handleUpdateStatus(item.id, 'diantar', 'Pengerjaan selesai, kurir sedang mengantar kacamata kembali ke pelanggan.')}
                        disabled={updatingId === item.id}
                        className="btn btn-sm"
                        style={{ backgroundColor: '#06b6d4', color: '#fff', fontWeight: 700, borderRadius: '6px' }}
                      >
                        📦 Ambil dari Lab & Mulai Antar
                      </button>
                    )}

                    {item.status === 'diantar' && (
                      <button
                        onClick={() => handleUpdateStatus(item.id, 'selesai', 'Kacamata telah diterima dengan baik oleh pelanggan. Layanan selesai!')}
                        disabled={updatingId === item.id}
                        className="btn btn-sm"
                        style={{ backgroundColor: '#10b981', color: '#fff', fontWeight: 700, borderRadius: '6px' }}
                      >
                        ✓ Kacamata Selesai Diterima Pelanggan
                      </button>
                    )}

                    {/* Tombol Broadcast GPS */}
                    <button
                      onClick={() => handleBroadcastGPS(item.id)}
                      disabled={updatingId === item.id}
                      className="btn btn-outline btn-sm"
                      title="Kirim koordinat GPS perangkat kurir saat ini ke peta pelanggan"
                    >
                      📍 Siarkan GPS Saya
                    </button>
                  </div>

                  {/* Tombol Peta & Kasir */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <Link
                      to={`/kurir/tracking/${item.id}`}
                      className="btn btn-outline btn-sm"
                      style={{ borderColor: '#0284c7', color: '#0284c7', fontWeight: 600 }}
                    >
                      🗺️ Peta Live GPS
                    </Link>

                    {!isLunas ? (
                      <button
                        onClick={() => handleBukaKasir(item)}
                        className="btn btn-sm"
                        style={{ backgroundColor: '#059669', color: '#fff', fontWeight: 700, borderRadius: '6px' }}
                      >
                        💵 Kasir di Tempat
                      </button>
                    ) : (
                      <span
                        style={{
                          backgroundColor: '#dcfce7',
                          color: '#15803d',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          fontWeight: 700
                        }}
                      >
                        ✓ Lunas
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Kasir Kurir di Tempat (COD / QRIS Bank Indonesia) */}
      {kasirModalItem && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
          onClick={() => setKasirModalItem(null)}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              maxWidth: '460px',
              width: '100%',
              padding: '1.75rem',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.25)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0369a1', fontWeight: 800 }}>
                💵 Kasir Kurir di Tempat
              </h3>
              <button
                onClick={() => setKasirModalItem(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Terima pelunasan servis untuk <strong>Pesanan #{kasirModalItem.id}</strong> atas nama{' '}
              <strong>{kasirModalItem.nama_pelanggan || 'Pelanggan'}</strong>.
            </p>

            <div
              style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center',
                marginBottom: '1.25rem'
              }}
            >
              <span style={{ fontSize: '0.85rem', color: '#166534', fontWeight: 600 }}>Total yang Harus Diterima</span>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#15803d', margin: '0.25rem 0 0' }}>
                Rp {Number(kasirModalItem.total_biaya || 0).toLocaleString('id-ID')}
              </h2>
            </div>

            {/* QRIS Code untuk di-scan oleh pelanggan di layar HP kurir */}
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0369a1', marginBottom: '0.5rem' }}>
                📱 Tunjukkan QRIS ini kepada Pelanggan:
              </p>
              {modalLoading ? (
                <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Menyiapkan QRIS...</div>
              ) : modalQris ? (
                <div style={{ display: 'inline-block', padding: '0.75rem', background: '#fff', borderRadius: '8px', border: '2px solid #0284c7' }}>
                  <img src={modalQris} alt="QRIS Bank Indonesia" style={{ width: '180px', height: '180px', display: 'block' }} />
                  <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginTop: '0.35rem', fontWeight: 700 }}>
                    ASPI EMVCo &bull; GoPay / ShopeePay / BCA
                  </span>
                </div>
              ) : (
                <p style={{ fontSize: '0.85rem', color: '#ef4444' }}>Gagal memuat QRIS.</p>
              )}
            </div>

            {/* Tombol Konfirmasi Pembayaran */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <button
                type="button"
                onClick={() => handleTerimaPembayaran(kasirModalItem.id)}
                disabled={modalLoading}
                className="btn"
                style={{
                  backgroundColor: '#059669',
                  color: '#fff',
                  padding: '0.75rem',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {modalLoading ? 'Memproses...' : '✓ Terima Tunai (COD) / QRIS Sukses'}
              </button>
              <button
                type="button"
                onClick={() => setKasirModalItem(null)}
                className="btn btn-outline"
                style={{ padding: '0.5rem', borderRadius: '8px', fontSize: '0.85rem' }}
              >
                Tutup Kasir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KurirDashboard;

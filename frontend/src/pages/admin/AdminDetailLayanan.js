import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';

/**
 * Halaman Detail & Manajemen Layanan (Admin)
 * Menyediakan tampilan komprehensif data pesanan pelanggan,
 * visualisasi alur timeline pengerjaan, serta formulir pembaruan status
 * dan penyesuaian biaya layanan.
 */
const AdminDetailLayanan = () => {
  const { id } = useParams();

  const [layanan, setLayanan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // State untuk form update status
  const [statusDipilih, setStatusDipilih] = useState('');
  const [totalBiaya, setTotalBiaya] = useState('');
  const [catatanAdmin, setCatatanAdmin] = useState('');

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
        setCatatanAdmin(data.catatan_admin || '');
      }
    } catch (err) {
      console.error('Gagal mengambil data detail admin:', err);
      setError('Gagal memuat informasi layanan. Pastikan ID pesanan valid.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        status: statusDipilih,
        total_biaya: totalBiaya ? Number(totalBiaya) : undefined,
        catatan_admin: catatanAdmin,
      };

      // Coba endpoint update status khusus atau update umum
      let res;
      try {
        res = await api.put(`/layanan/${id}/status`, payload);
      } catch (err1) {
        try {
          res = await api.put(`/layanan/${id}`, payload);
        } catch (err2) {
          res = await api.put(`/admin/layanan/${id}`, payload);
        }
      }

      setSuccess('Status layanan berhasil diperbarui!');
      // Update state lokal
      const updated = res.data?.data || res.data;
      if (updated && typeof updated === 'object') {
        setLayanan((prev) => ({ ...prev, ...updated, status: statusDipilih }));
      } else {
        setLayanan((prev) => ({
          ...prev,
          status: statusDipilih,
          total_biaya: totalBiaya,
          catatan_admin: catatanAdmin,
        }));
      }
    } catch (err) {
      console.error('Gagal memperbarui status:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Gagal memperbarui status layanan. Periksa koneksi backend.';
      setError(msg);
    } finally {
      setUpdating(false);
    }
  };

  // Tahapan urutan timeline status
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
  const isCancelled =
    layanan?.status?.toLowerCase().includes('batal') ||
    layanan?.status?.toLowerCase().includes('tolak');

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
        <p>Memuat data pesanan admin #{id}...</p>
      </div>
    );
  }

  if (error && !layanan) {
    return (
      <div style={{ maxWidth: '800px', margin: '2rem auto' }}>
        <div className="alert alert-danger">{error}</div>
        <Link to="/admin/layanan" className="btn btn-outline">
          ← Kembali ke Daftar Layanan
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header & Aksi Atas */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/admin/layanan" className="btn btn-outline btn-sm">
            ← Kembali ke Daftar
          </Link>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--dark)' }}>
            Kelola Pesanan #{layanan?.id || id}
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {renderBadge(layanan?.status)}
          <button onClick={fetchDetail} className="btn btn-outline btn-sm">
            🔄 Refresh
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Visualisasi Timeline Status */}
      <div className="card">
        <h2 className="card-title" style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
          Visualisasi Progres Pengerjaan
        </h2>
        {isCancelled ? (
          <div className="alert alert-danger" style={{ marginTop: '1rem' }}>
            Pesanan ini berstatus BATAL atau DITOLAK.
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

      {/* Grid Informasi Layanan & Pembaruan Status */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Panel Form Update Status (Khusus Admin) */}
        <div className="card" style={{ borderLeft: '4px solid var(--secondary)' }}>
          <div className="card-header">
            <h3 className="card-title" style={{ fontSize: '1.1rem' }}>
              ⚙️ Pembaruan Status & Biaya
            </h3>
          </div>
          <form onSubmit={handleUpdateStatus}>
            <div className="form-group">
              <label className="form-label" htmlFor="statusDipilih">
                Ubah Status Pesanan
              </label>
              <select
                id="statusDipilih"
                className="form-control"
                value={statusDipilih}
                onChange={(e) => setStatusDipilih(e.target.value)}
                required
              >
                <option value="pengajuan">Menunggu Konfirmasi</option>
                <option value="dijadwalkan">Penjemputan Dijadwalkan</option>
                <option value="diambil">Sedang Dijemput Kurir</option>
                <option value="diproses">Sedang Dikerjakan di Optik</option>
                <option value="diantar">Sedang Diantar ke Pelanggan</option>
                <option value="selesai">Selesai</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="totalBiaya">
                Total Biaya Layanan (Rp)
              </label>
              <input
                type="number"
                id="totalBiaya"
                className="form-control"
                placeholder="Contoh: 150000"
                value={totalBiaya}
                onChange={(e) => setTotalBiaya(e.target.value)}
              />
              <small style={{ color: 'var(--text-muted)' }}>
                Termasuk biaya lensa, perbaikan frame, dan transport
              </small>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="catatanAdmin">
                Catatan Internal Teknisi / Optik
              </label>
              <textarea
                id="catatanAdmin"
                className="form-control"
                placeholder="Catatan pengerjaan atau kondisi lensa..."
                value={catatanAdmin}
                onChange={(e) => setCatatanAdmin(e.target.value)}
                rows={2}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={updating}
            >
              {updating ? 'Menyimpan Perubahan...' : 'Simpan Pembaruan'}
            </button>
          </form>
        </div>

        {/* Informasi Pelanggan & Alamat */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ fontSize: '1.1rem' }}>
              👤 Informasi Pelanggan
            </h3>
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
                  {layanan?.pelanggan?.no_telepon || layanan?.no_telepon || '-'}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '0.45rem 0', color: 'var(--text-muted)' }}>Email:</td>
                <td style={{ padding: '0.45rem 0' }}>
                  {layanan?.pelanggan?.email || layanan?.email || '-'}
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
      </div>

      {/* Rincian Kacamata & Keluhan */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title" style={{ fontSize: '1.1rem' }}>
            👓 Detail Kacamata & Kerusakan
          </h3>
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

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

/**
 * Halaman Buat Permintaan Layanan Antar-Jemput Kacamata
 * Menyediakan form pengisian data perbaikan atau pergantian lensa:
 * jenis_layanan, jenis_kacamata, keluhan, detail_perbaikan, alamat, tanggal_jemput, jam_jemput, keterangan.
 * Data dikirim via POST /api/layanan.
 */
const BuatLayanan = () => {
  const navigate = useNavigate();

  // Dapatkan tanggal default besok (YYYY-MM-DD)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    jenis_layanan: 'perbaikan', // default: perbaikan atau penggantian_lensa
    jenis_kacamata: '',
    keluhan: '',
    detail_perbaikan: '',
    alamat: '',
    tanggal_jemput: defaultDate,
    jam_jemput: '10:00',
    keterangan: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/layanan', formData);
      setSuccess('Permintaan layanan berhasil dibuat! Kurir kami akan mengonfirmasi penjemputan.');

      const newId = response.data?.data?.id || response.data?.id;

      // Beri sedikit waktu untuk membaca pesan berhasil, lalu arahkan pengguna
      setTimeout(() => {
        if (newId) {
          navigate(`/layanan/${newId}`);
        } else {
          navigate('/dashboard');
        }
      }, 1500);
    } catch (err) {
      console.error('Gagal membuat layanan:', err);
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Gagal mengirim permintaan layanan. Pastikan data terisi dengan benar.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link to="/dashboard" className="btn btn-outline btn-sm">
          ← Kembali ke Dashboard
        </Link>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--dark)' }}>
          Pesan Layanan Antar-Jemput
        </h1>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Formulir Permintaan Layanan</h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            * Wajib diisi dengan lengkap
          </span>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          {/* Baris 1: Jenis Layanan & Model Kacamata */}
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="jenis_layanan">
                Jenis Layanan *
              </label>
              <select
                id="jenis_layanan"
                name="jenis_layanan"
                className="form-control"
                value={formData.jenis_layanan}
                onChange={handleChange}
                required
              >
                <option value="perbaikan">Perbaikan Frame / Kerusakan Fisik</option>
                <option value="penggantian_lensa">Penggantian Lensa Optik</option>
                <option value="perbaikan_dan_lensa">Perbaikan Frame & Penggantian Lensa</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="jenis_kacamata">
                Jenis / Tipe Kacamata *
              </label>
              <input
                type="text"
                id="jenis_kacamata"
                name="jenis_kacamata"
                className="form-control"
                placeholder="Contoh: Kacamata Baca Frame Titanium / Kacamata Minus Gaya Retro"
                value={formData.jenis_kacamata}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Baris 2: Keluhan Utama */}
          <div className="form-group">
            <label className="form-label" htmlFor="keluhan">
              Keluhan Kerusakan / Kebutuhan *
            </label>
            <textarea
              id="keluhan"
              name="keluhan"
              className="form-control"
              placeholder="Jelaskan kondisi kacamata Anda, misal: Engsel patah sebelah kanan, nosepad hilang, lensa minus buram..."
              value={formData.keluhan}
              onChange={handleChange}
              rows={3}
              required
            />
          </div>

          {/* Baris 3: Detail Perbaikan / Spesifikasi Lensa */}
          <div className="form-group">
            <label className="form-label" htmlFor="detail_perbaikan">
              Detail Perbaikan / Ukuran Lensa (Opsional)
            </label>
            <textarea
              id="detail_perbaikan"
              name="detail_perbaikan"
              className="form-control"
              placeholder="Contoh: R -2.00 Cyl -0.50 Axis 90 | L -2.25 (atau sebutkan jika memiliki resep dokter)"
              value={formData.detail_perbaikan}
              onChange={handleChange}
              rows={2}
            />
          </div>

          {/* Baris 4: Alamat Penjemputan */}
          <div className="form-group">
            <label className="form-label" htmlFor="alamat">
              Alamat Lengkap Penjemputan *
            </label>
            <textarea
              id="alamat"
              name="alamat"
              className="form-control"
              placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan, patokan lokasi..."
              value={formData.alamat}
              onChange={handleChange}
              rows={3}
              required
            />
          </div>

          {/* Baris 5: Tanggal & Waktu Penjemputan */}
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="tanggal_jemput">
                Tanggal Penjemputan *
              </label>
              <input
                type="date"
                id="tanggal_jemput"
                name="tanggal_jemput"
                className="form-control"
                value={formData.tanggal_jemput}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="jam_jemput">
                Waktu / Jam Penjemputan *
              </label>
              <input
                type="time"
                id="jam_jemput"
                name="jam_jemput"
                className="form-control"
                value={formData.jam_jemput}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Baris 6: Keterangan Tambahan */}
          <div className="form-group">
            <label className="form-label" htmlFor="keterangan">
              Catatan / Keterangan Tambahan Untuk Kurir
            </label>
            <textarea
              id="keterangan"
              name="keterangan"
              className="form-control"
              placeholder="Contoh: Titipkan di pos satpam jika tidak ada orang di rumah..."
              value={formData.keterangan}
              onChange={handleChange}
              rows={2}
            />
          </div>

          {/* Tombol Aksi */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
            <Link to="/dashboard" className="btn btn-outline">
              Batal
            </Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Mengirimkan Permintaan...' : 'Ajukan Permintaan Antar-Jemput'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BuatLayanan;

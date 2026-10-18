import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';

/**
 * Halaman Buat Permintaan Layanan Antar-Jemput Kacamata
 * Menyediakan form pengisian data perbaikan atau pergantian lensa:
 * jenis_layanan, jenis_kacamata, keluhan, detail_perbaikan, alamat,
 * tanggal_jemput, jam_jemput, keterangan, serta unggah foto kacamata & resep dokter.
 * Data dikirim via POST /api/layanan.
 */
const BuatLayanan = () => {
  const navigate = useNavigate();

  // Dapatkan tanggal default besok (YYYY-MM-DD)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    jenis_layanan: 'perbaikan',
    jenis_kacamata: '',
    keluhan: '',
    detail_perbaikan: '',
    alamat: '',
    tanggal_jemput: defaultDate,
    jam_jemput: '10:00',
    keterangan: '',
    foto_kacamata: '',
    foto_resep: '',
  });

  const [previewKacamata, setPreviewKacamata] = useState('');
  const [previewResep, setPreviewResep] = useState('');

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

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran foto maksimal 5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      setFormData((prev) => ({ ...prev, [field]: base64 }));
      if (field === 'foto_kacamata') setPreviewKacamata(base64);
      if (field === 'foto_resep') setPreviewResep(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/layanan', formData);
      const newLayanan = response.data?.data;
      setSuccess('Pengajuan layanan kacamata berhasil dibuat!');

      setTimeout(() => {
        if (newLayanan?.id) {
          navigate(`/layanan/${newLayanan.id}`);
        } else {
          navigate('/dashboard');
        }
      }, 1200);
    } catch (err) {
      console.error('Gagal membuat layanan:', err);
      const msg = err.response?.data?.message || 'Terjadi kesalahan saat menyimpan data.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '3rem' }}>
      <div className="card">
        <div className="card-header">
          <h1 className="card-title" style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            Pengajuan Servis Antar-Jemput Kacamata
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Isi formulir berikut. Tim kurir OptikExpress akan menjemput kacamata langsung ke alamat Anda.
          </p>
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
                <option value="perbaikan">Perbaikan Frame (Patah/Engsel/Nosepad)</option>
                <option value="penggantian_lensa">Penggantian Lensa (Minus/Silinder/Progresif)</option>
                <option value="perbaikan_dan_lensa">Perbaikan Frame + Penggantian Lensa</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="jenis_kacamata">
                Model / Tipe Kacamata *
              </label>
              <input
                type="text"
                id="jenis_kacamata"
                name="jenis_kacamata"
                className="form-control"
                placeholder="Contoh: Frame Titanium Bulat / Kacamata Baca"
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

          {/* Baris 3: Detail Perbaikan / Resep Lensa */}
          <div className="form-group">
            <label className="form-label" htmlFor="detail_perbaikan">
              Detail Ukuran Lensa / Resep Dokter (Opsional)
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

          {/* Unggah Foto Kerusakan & Foto Resep */}
          <div className="form-grid" style={{ marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Foto Kerusakan Kacamata (Opsional)</label>
              <input
                type="file"
                accept="image/*"
                className="form-control"
                onChange={(e) => handleFileChange(e, 'foto_kacamata')}
              />
              {previewKacamata && (
                <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
                  <img
                    src={previewKacamata}
                    alt="Preview Kacamata"
                    style={{ maxHeight: '120px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Foto Resep Dokter Optik (Opsional)</label>
              <input
                type="file"
                accept="image/*"
                className="form-control"
                onChange={(e) => handleFileChange(e, 'foto_resep')}
              />
              {previewResep && (
                <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
                  <img
                    src={previewResep}
                    alt="Preview Resep"
                    style={{ maxHeight: '120px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              )}
            </div>
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

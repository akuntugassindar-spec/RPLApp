import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';

/**
 * Halaman Buat Permintaan Layanan Antar-Jemput Kacamata
 * Menyediakan form pengisian data perbaikan atau pergantian lensa:
 * jenis_layanan, jenis_kacamata, keluhan, detail_perbaikan, alamat,
 * tanggal_jemput, jam_jemput, keterangan, serta unggah foto kacamata & resep dokter (opsional).
 * Fitur Unggah Foto Fisik Kacamata & Resep Optik:
 * - Penyimpanan media berbasis disk server (/uploads/)
 * - Validasi tipe file gambar (JPG, PNG, WEBP)
 * - Batasan ukuran maksimal 5 MB
 * - Bersifat OPSIONAL: pelanggan dapat memilih untuk mengunggah atau tidak mengunggah foto.
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

  const [previewKacamata, setPreviewKacamata] = useState(null);
  const [previewResep, setPreviewResep] = useState(null);
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
    if (file) {
      // Validasi tipe berkas (hanya gambar)
      if (!file.type.startsWith('image/')) {
        setError('Hanya berkas gambar (JPG, PNG, WEBP) yang diizinkan untuk diunggah.');
        e.target.value = '';
        return;
      }
      // Validasi ukuran berkas (maksimal 5 MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Ukuran berkas foto melebihi batas maksimal 5 MB.');
        e.target.value = '';
        return;
      }
      setError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result;
        setFormData((prev) => ({
          ...prev,
          [field]: base64Data,
        }));
        if (field === 'foto_kacamata') setPreviewKacamata(base64Data);
        if (field === 'foto_resep') setPreviewResep(base64Data);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: '',
    }));
    if (field === 'foto_kacamata') setPreviewKacamata(null);
    if (field === 'foto_resep') setPreviewResep(null);
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
      const msg = err.response?.data?.message || err.response?.data?.error || (err.message === 'Network Error' ? 'Koneksi ke backend gagal. Pastikan server backend berjalan di port 5000.' : err.message || 'Terjadi kesalahan saat menyimpan data.');
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

          {/* Baris 4: Unggah Foto Fisik Kacamata & Resep Optik (Fitur Opsional) */}
          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0369a1', margin: 0 }}>
                Unggah Foto Fisik Kacamata & Resep Optik (Opsional)
              </h3>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', background: '#e0f2fe', padding: '0.15rem 0.55rem', borderRadius: '999px' }}>
                Bersifat Opsional (Boleh Dikosongkan)
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 1rem 0' }}>
              Anda dapat melampirkan foto fisik kacamata rusak atau foto resep dokter mata (jika ada). Fitur ini bersifat opsional, Anda tetap dapat mengajukan layanan tanpa mengunggah foto.
            </p>

            <div className="form-grid">
              {/* Foto Fisik Kacamata */}
              <div className="form-group" style={{ margin: 0, background: '#fff', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--dark)' }}>
                  Foto Fisik Kacamata / Kerusakan (Opsional)
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={(e) => handleFileChange(e, 'foto_kacamata')}
                  style={{ display: 'block', fontSize: '0.8rem', width: '100%', marginTop: '0.35rem' }}
                />
                <small style={{ color: 'var(--text-muted)', fontSize: '0.72rem', display: 'block', marginTop: '0.25rem' }}>
                  Format: JPG, PNG, WEBP (Maksimal 5 MB)
                </small>
                {previewKacamata && (
                  <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', background: '#f0fdf4', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                    <img
                      src={previewKacamata}
                      alt="Preview Kacamata"
                      style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                    <div>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#166534', display: 'block' }}>Foto kacamata dipilih</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto('foto_kacamata')}
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', marginTop: '0.25rem', color: '#ef4444', borderColor: '#ef4444' }}
                      >
                        Hapus Foto
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Foto Resep Optik */}
              <div className="form-group" style={{ margin: 0, background: '#fff', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--dark)' }}>
                  Foto Resep Dokter / Ukuran Optik (Opsional)
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={(e) => handleFileChange(e, 'foto_resep')}
                  style={{ display: 'block', fontSize: '0.8rem', width: '100%', marginTop: '0.35rem' }}
                />
                <small style={{ color: 'var(--text-muted)', fontSize: '0.72rem', display: 'block', marginTop: '0.25rem' }}>
                  Format: JPG, PNG, WEBP (Maksimal 5 MB)
                </small>
                {previewResep && (
                  <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', background: '#f0fdf4', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                    <img
                      src={previewResep}
                      alt="Preview Resep Dokter"
                      style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                    <div>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#166534', display: 'block' }}>Foto resep dipilih</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto('foto_resep')}
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', marginTop: '0.25rem', color: '#ef4444', borderColor: '#ef4444' }}
                      >
                        Hapus Foto
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Baris 5: Alamat Penjemputan */}
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

          {/* Baris 6: Tanggal & Waktu Penjemputan */}
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

          {/* Baris 7: Keterangan Tambahan */}
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

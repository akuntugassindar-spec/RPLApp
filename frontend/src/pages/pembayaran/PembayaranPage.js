import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

/**
 * Halaman Pembayaran Digital Multi-Metode (Payment Gateway)
 * Mendukung simulasi Midtrans Snap Sandbox:
 * 1. QRIS (Kode QR dinamis)
 * 2. Virtual Account (BCA, BNI, BRI, Mandiri) dengan tombol salin nomor VA
 * 3. E-Wallet (GoPay, ShopeePay)
 * 4. Cash on Delivery (COD / Bayar tunai ke kurir)
 * Dilengkapi konfirmasi pelunasan instan dan tombol cetak bukti transaksi.
 */
const PembayaranPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [layanan, setLayanan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState(false);

  // Pilihan metode pembayaran
  const [metode, setMetode] = useState('qris');
  const [vaBank, setVaBank] = useState('bca_va');
  const [transactionId, setTransactionId] = useState('');
  const [qrUrl, setQrUrl] = useState('');

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/layanan/${id}`);
      const data = res.data?.data || res.data;
      setLayanan(data);

      if (data) {
        const trx = data.id_transaksi_pembayaran || `MIDTRANS-${Date.now()}-${data.id || id}`;
        setTransactionId(trx);
        setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=OPTIKEXPRESS-PAYMENT-${trx}`);

        if (data.metode_pembayaran) {
          if (data.metode_pembayaran.includes('va')) {
            setMetode('va');
            setVaBank(data.metode_pembayaran);
          } else {
            setMetode(data.metode_pembayaran);
          }
        }
      }
    } catch (err) {
      setError('Gagal memuat informasi tagihan pembayaran.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handlePilihMetode = async (targetMetode) => {
    setMetode(targetMetode);
    const metodeApi = targetMetode === 'va' ? vaBank : targetMetode;
    try {
      const res = await api.post(`/layanan/${id}/pembayaran`, {
        metode_pembayaran: metodeApi
      });
      const data = res.data?.data;
      if (data?.transaction_id) {
        setTransactionId(data.transaction_id);
        if (data.payment_detail?.qr_image) {
          setQrUrl(data.payment_detail.qr_image);
        }
      }
    } catch (err) {
      console.error('Inisialisasi pembayaran:', err);
    }
  };

  const handleKonfirmasiLunas = async () => {
    setProcessing(true);
    setError('');
    setSuccess('');
    try {
      await api.post(`/layanan/${id}/pembayaran/konfirmasi`);
      setSuccess('Pembayaran Berhasil! Tagihan telah berstatus LUNAS.');
      setLayanan((prev) => ({ ...prev, status_pembayaran: 'lunas' }));
      setTimeout(() => {
        navigate(`/pembayaran/${id}/konfirmasi`);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memproses konfirmasi pelunasan.');
    } finally {
      setProcessing(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
        <p>Memuat rincian pembayaran #{id}...</p>
      </div>
    );
  }

  if (error && !layanan) {
    return (
      <div style={{ maxWidth: '800px', margin: '2rem auto' }}>
        <div className="alert alert-danger">{error}</div>
        <Link to="/dashboard" className="btn btn-outline">Kembali ke Dashboard</Link>
      </div>
    );
  }

  const totalBayar = Number(layanan?.total_biaya || 150000);
  const isLunas = layanan?.status_pembayaran === 'lunas';
  const vaNumber = `8808${String(id).padStart(4, '0')}765432`;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
            <Link to={`/layanan/${id}`} className="btn btn-outline btn-sm">Kembali ke Pesanan</Link>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--dark)' }}>
              Pembayaran Layanan #{id}
            </h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Sistem Pembayaran Digital Terintegrasi Midtrans Sandbox & COD
          </p>
        </div>
        <span
          className="badge"
          style={{
            backgroundColor: isLunas ? '#dcfce7' : '#fef3c7',
            color: isLunas ? '#15803d' : '#b45309',
            fontSize: '0.9rem',
            padding: '0.4rem 0.8rem',
            fontWeight: 800
          }}
        >
          {isLunas ? 'STATUS: SUDAH LUNAS' : 'STATUS: MENUNGGU PEMBAYARAN'}
        </span>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Ringkasan Tagihan */}
      <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid #0f766e' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL TAGIHAN SERVIS</span>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f766e', marginTop: '0.25rem' }}>
              Rp {totalBayar.toLocaleString('id-ID')}
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.2rem' }}>
              Pelanggan: <strong>{layanan?.nama_pelanggan || layanan?.pelanggan?.nama || 'Pelanggan'}</strong> &bull; Jenis: {layanan?.jenis_layanan ? layanan.jenis_layanan.replace('_', ' ').toUpperCase() : '-'}
            </p>
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>ID Transaksi:</span>
            <code style={{ fontSize: '0.9rem', background: '#f1f5f9', padding: '0.3rem 0.6rem', borderRadius: '4px' }}>
              {transactionId}
            </code>
          </div>
        </div>
      </div>

      {isLunas ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem', backgroundColor: '#f0fdf4', border: '2px solid #bbf7d0' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#166534', marginBottom: '0.5rem' }}>
            Pembayaran Telah Dikonfirmasi Lunas
          </h2>
          <p style={{ color: '#15803d', maxWidth: '500px', margin: '0 auto 1.5rem auto' }}>
            Terima kasih! Pembayaran untuk pesanan kacamata #{id} telah berhasil diverifikasi oleh sistem. Kacamata Anda akan segera diproses oleh teknisi optik.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to={`/pembayaran/${id}/konfirmasi`} className="btn btn-primary">
              Lihat Struk / Bukti Pembayaran
            </Link>
            <Link to={`/kurir/tracking/${id}`} className="btn btn-outline">
              Pantau Posisi Kurir
            </Link>
          </div>
        </div>
      ) : (
        <div className="card">
          <h3 className="card-title" style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>
            Pilih Metode Pembayaran
          </h3>

          {/* Tab Metode Pembayaran */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {[
              { id: 'qris', label: 'QRIS', desc: 'Scan Semua E-Wallet' },
              { id: 'va', label: 'Virtual Account', desc: 'Transfer Antar Bank' },
              { id: 'gopay', label: 'GoPay', desc: 'Aplikasi Gojek' },
              { id: 'shopeepay', label: 'ShopeePay', desc: 'Aplikasi Shopee' },
              { id: 'cod', label: 'COD (Tunai)', desc: 'Bayar Langsung ke Kurir' }
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => handlePilihMetode(m.id)}
                style={{
                  padding: '0.85rem 0.5rem',
                  borderRadius: 'var(--radius-md)',
                  border: metode === m.id ? '2px solid #0284c7' : '1px solid #cbd5e1',
                  background: metode === m.id ? '#f0f9ff' : '#fff',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: metode === m.id ? '#0369a1' : 'var(--dark)' }}>
                  {m.label}
                </div>
                <small style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.desc}</small>
              </button>
            ))}
          </div>

          {/* Konten Pilihan Metode */}
          <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
            {metode === 'qris' && (
              <div style={{ textAlign: 'center' }}>
                <h4 style={{ fontWeight: 800, color: 'var(--dark)', marginBottom: '0.5rem' }}>
                  Pindai Kode QRIS Melalui Aplikasi Pembayaran
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Buka aplikasi BCA Mobile, Livin Mandiri, GoPay, OVO, Dana, atau ShopeePay dan scan QR di bawah ini:
                </p>
                <div style={{ display: 'inline-block', padding: '1rem', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                  <img
                    src={qrUrl}
                    alt="QRIS Payment"
                    style={{ width: '220px', height: '220px', display: 'block' }}
                  />
                  <div style={{ marginTop: '0.5rem', fontWeight: 700, fontSize: '0.8rem', color: '#0369a1' }}>
                    NMID: ID1020304050607
                  </div>
                </div>
              </div>
            )}

            {metode === 'va' && (
              <div>
                <h4 style={{ fontWeight: 800, color: 'var(--dark)', marginBottom: '0.75rem' }}>
                  Nomor Virtual Account Bank
                </h4>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  {['bca_va', 'bni_va', 'bri_va', 'mandiri_va'].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => { setVaBank(b); handlePilihMetode('va'); }}
                      className="btn btn-sm"
                      style={{
                        backgroundColor: vaBank === b ? '#0284c7' : '#fff',
                        color: vaBank === b ? '#fff' : '#334155',
                        border: '1px solid #cbd5e1',
                        fontWeight: 700
                      }}
                    >
                      {b.replace('_va', '').toUpperCase()}
                    </button>
                  ))}
                </div>
                <div style={{ background: '#fff', padding: '1rem', borderRadius: '8px', border: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <small style={{ color: 'var(--text-muted)', display: 'block' }}>Nomor Rekening Virtual Account:</small>
                    <span style={{ fontSize: '1.3rem', fontWeight: 900, letterSpacing: '1px', color: 'var(--dark)' }}>
                      {vaNumber}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(vaNumber)}
                    className="btn btn-outline btn-sm"
                  >
                    {copied ? 'Tersalin!' : 'Salin Nomor'}
                  </button>
                </div>
              </div>
            )}

            {(metode === 'gopay' || metode === 'shopeepay') && (
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <h4 style={{ fontWeight: 800, color: 'var(--dark)', marginBottom: '0.5rem' }}>
                  Pembayaran Instan via {metode === 'gopay' ? 'GoPay' : 'ShopeePay'}
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                  Anda akan dialihkan ke aplikasi dompet digital untuk mengonfirmasi pembayaran sebesar <strong>Rp {totalBayar.toLocaleString('id-ID')}</strong>.
                </p>
                <button
                  type="button"
                  onClick={handleKonfirmasiLunas}
                  className="btn btn-primary"
                  disabled={processing}
                >
                  {processing ? 'Memproses...' : `Buka Aplikasi ${metode === 'gopay' ? 'GoPay' : 'ShopeePay'}`}
                </button>
              </div>
            )}

            {metode === 'cod' && (
              <div>
                <h4 style={{ fontWeight: 800, color: 'var(--dark)', marginBottom: '0.5rem' }}>
                  Cash On Delivery (Bayar Tunai ke Kurir)
                </h4>
                <p style={{ fontSize: '0.9rem', color: '#475569' }}>
                  Anda dapat menyerahkan uang tunai pas sebesar <strong>Rp {totalBayar.toLocaleString('id-ID')}</strong> langsung kepada kurir kami pada saat kacamata diantar kembali ke alamat Anda.
                </p>
              </div>
            )}
          </div>

          {/* Tombol Konfirmasi Pembayaran */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <Link to={`/layanan/${id}`} className="btn btn-outline">
              Batal & Kembali
            </Link>
            <button
              type="button"
              onClick={handleKonfirmasiLunas}
              className="btn btn-primary"
              disabled={processing}
              style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
            >
              {processing ? 'Memproses Pembayaran...' : 'Simulasi Pembayaran Berhasil (Konfirmasi Lunas)'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PembayaranPage;

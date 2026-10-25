import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import SuccessOverlay from '../../components/SuccessOverlay';

/**
 * Halaman Pembayaran Digital Multi-Metode (Payment Gateway)
 * Mendukung simulasi Midtrans Snap & Standar Bank Indonesia QRIS:
 * 1. QRIS Standar Bank Indonesia (EMVCo & CRC16) + Opsi Unggah QRIS Toko Asli (BCA/GoBiz/DANA)
 * 2. Virtual Account (BCA, BNI, BRI, Mandiri) dengan tombol salin nomor VA
 * 3. E-Wallet Direct (GoPay & ShopeePay dengan deep-link aplikasi ponsel)
 * 4. Cash on Delivery (COD / Bayar Tunai ke Kurir saat penjemputan/pengantaran)
 * Dilengkapi tombol konfirmasi pelunasan instan untuk pelanggan dan kurir.
 */
const PembayaranPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [layanan, setLayanan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState('');

  // Pilihan metode pembayaran
  const [metode, setMetode] = useState('qris');
  const [vaBank, setVaBank] = useState('bca_va');
  const [transactionId, setTransactionId] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [paymentDetail, setPaymentDetail] = useState(null);

  // Fitur upload QRIS Toko Asli (opsional jika pengguna ingin scan QRIS sungguhan dengan saldo GoPay riil)
  const [showCustomQris, setShowCustomQris] = useState(false);
  const [customQrisInput, setCustomQrisInput] = useState('');
  const [isCustomQrisActive, setIsCustomQrisActive] = useState(false);

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

        let initialMetode = 'qris';
        if (data.metode_pembayaran) {
          if (data.metode_pembayaran.includes('va')) {
            initialMetode = 'va';
            setVaBank(data.metode_pembayaran);
          } else {
            initialMetode = data.metode_pembayaran;
          }
        }
        setMetode(initialMetode);

        // Inisialisasi pembayaran di backend untuk mendapatkan payload EMVCo QRIS resmi
        try {
          const payRes = await api.post(`/layanan/${id}/pembayaran`, {
            metode_pembayaran: initialMetode === 'va' ? (data.metode_pembayaran || 'bca_va') : initialMetode
          });
          const payData = payRes.data?.data;
          if (payData) {
            setTransactionId(payData.transaction_id || trx);
            setPaymentDetail(payData.payment_detail || null);
            if (payData.payment_detail?.qr_image) {
              setQrUrl(payData.payment_detail.qr_image);
            }
          }
        } catch (eInit) {
          setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=00020101021253033605802ID5912OPTIKEXPRESS6008SURABAYA6304`);
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
        metode_pembayaran: metodeApi,
        custom_qris_image: isCustomQrisActive ? customQrisInput : null
      });
      const data = res.data?.data;
      if (data) {
        if (data.transaction_id) setTransactionId(data.transaction_id);
        if (data.payment_detail) {
          setPaymentDetail(data.payment_detail);
          if (data.payment_detail.qr_image) {
            setQrUrl(data.payment_detail.qr_image);
          }
        }
      }
    } catch (err) {
      console.error('Inisialisasi pembayaran:', err);
    }
  };

  const handleTerapkanCustomQris = async (e) => {
    e.preventDefault();
    if (!customQrisInput) {
      alert('Masukkan tautan gambar atau pilih foto QRIS Anda terlebih dahulu.');
      return;
    }
    setIsCustomQrisActive(true);
    setQrUrl(customQrisInput);
    try {
      await api.post(`/layanan/${id}/pembayaran`, {
        metode_pembayaran: 'qris',
        custom_qris_image: customQrisInput
      });
      alert('QRIS Toko Pribadi berhasil dipasang! Pengguna/pelanggan kini dapat memindai langsung menggunakan aplikasi GoPay/BCA dengan saldo nyata.');
    } catch (err) {
      console.error('Gagal simpan custom QRIS:', err);
    }
  };

  const handleResetQrisStandar = () => {
    setIsCustomQrisActive(false);
    setCustomQrisInput('');
    handlePilihMetode('qris');
  };

  const handleCustomQrisFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomQrisInput(reader.result);
      };
      reader.readAsDataURL(file);
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

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2500);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
        <p>Memuat rincian pembayaran #${id}...</p>
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
  const vaNumber = paymentDetail?.va_number || `8808${String(id).padStart(4, '0')}765432`;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
            <Link to={`/layanan/${id}`} className="btn btn-outline btn-sm">← Kembali ke Pesanan</Link>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--dark)' }}>
              Pembayaran Layanan #${id}
            </h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Sistem Pembayaran Terpadu: QRIS Bank Indonesia, Virtual Account, GoPay, & COD
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
          {isLunas ? '✓ STATUS: SUDAH LUNAS' : '⏳ STATUS: MENUNGGU PEMBAYARAN'}
        </span>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      {/* Overlay Notifikasi Berhasil saat Mengubah Data Pesanan */}
      <SuccessOverlay
        message={success}
        onClose={() => setSuccess('')}
        title="Pembayaran Berhasil Dikonfirmasi!"
      />

      {/* Ringkasan Tagihan */}
      <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid #0f766e' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL TAGIHAN SERVIS & ONGKIR</span>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f766e', marginTop: '0.25rem' }}>
              Rp {totalBayar.toLocaleString('id-ID')}
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.2rem' }}>
              Pelanggan: <strong>{layanan?.nama_pelanggan || layanan?.pelanggan?.nama || 'Pelanggan'}</strong> &bull; Jenis: {layanan?.jenis_layanan ? layanan.jenis_layanan.replace('_', ' ').toUpperCase() : '-'}
            </p>
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>ID Transaksi Pembayaran:</span>
            <code style={{ fontSize: '0.9rem', background: '#f1f5f9', padding: '0.3rem 0.6rem', borderRadius: '4px' }}>
              {transactionId}
            </code>
          </div>
        </div>
      </div>

      {isLunas ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem', backgroundColor: '#f0fdf4', border: '2px solid #bbf7d0' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✅</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#166534', marginBottom: '0.5rem' }}>
            Pembayaran Telah Dikonfirmasi LUNAS
          </h2>
          <p style={{ color: '#15803d', maxWidth: '500px', margin: '0 auto 1.5rem auto' }}>
            Terima kasih! Pembayaran untuk pesanan kacamata #${id} sebesar <strong>Rp {totalBayar.toLocaleString('id-ID')}</strong> telah berhasil diverifikasi oleh sistem. Kacamata Anda akan segera diproses/diantar oleh kurir.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to={`/pembayaran/${id}/konfirmasi`} className="btn btn-primary">
              📄 Cetak Struk / Bukti Lunas
            </Link>
            <Link to={`/kurir/tracking/${id}`} className="btn btn-outline">
              🛵 Pantau Posisi Kurir
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
              { id: 'qris', label: 'QRIS', desc: 'GoPay, BCA, DANA, OVO' },
              { id: 'va', label: 'Virtual Account', desc: 'BCA, BNI, BRI, Mandiri' },
              { id: 'gopay', label: 'GoPay Direct', desc: 'Aplikasi Gojek' },
              { id: 'shopeepay', label: 'ShopeePay', desc: 'Aplikasi Shopee' },
              { id: 'cod', label: 'COD (Tunai)', desc: 'Bayar Tunai ke Kurir' }
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
              <div>
                <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#dc2626', background: '#fee2e2', padding: '3px 10px', borderRadius: '4px', letterSpacing: '1px' }}>
                    {isCustomQrisActive ? 'QRIS MERCHANT PRIBADI' : 'QRIS RESMI BANK INDONESIA (ASPI)'}
                  </span>
                  <h4 style={{ fontWeight: 800, color: 'var(--dark)', marginTop: '0.5rem', marginBottom: '0.35rem' }}>
                    Pindai Kode QRIS Melalui Aplikasi E-Wallet / M-Banking
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '580px', margin: '0 auto' }}>
                    Dapat dipindai dari aplikasi <strong>GoPay, BCA Mobile, Livin by Mandiri, OVO, DANA, ShopeePay</strong>, atau aplikasi perbankan apa pun di Indonesia.
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <div style={{ padding: '1.25rem', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', border: '1px solid #cbd5e1', textAlign: 'center', maxWidth: '320px' }}>
                    <img
                      src={qrUrl}
                      alt="QRIS Payment"
                      style={{ width: '240px', height: '240px', display: 'block', margin: '0 auto', objectFit: 'contain' }}
                    />
                    <div style={{ marginTop: '0.75rem', fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
                      OPTIKEXPRESS STORE & LAB
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#0369a1', fontWeight: 700 }}>
                      NMID: {paymentDetail?.nmid || 'ID1020304050607'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                      Nominal: <strong>Rp {totalBayar.toLocaleString('id-ID')}</strong>
                    </div>
                  </div>
                </div>

                {/* Tombol Salin String EMVCo & Buka Aplikasi */}
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                  {paymentDetail?.qris_payload && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(paymentDetail.qris_payload, 'payload')}
                      className="btn btn-outline btn-sm"
                    >
                      {copied === 'payload' ? '✓ String QRIS Tersalin!' : '📋 Salin Kode EMVCo QRIS'}
                    </button>
                  )}
                  <a
                    href="gojek://gopay/pay"
                    className="btn btn-outline btn-sm"
                    style={{ borderColor: '#00aa13', color: '#00aa13', fontWeight: 700 }}
                  >
                    📱 Buka Aplikasi GoPay
                  </a>
                  <a
                    href="shopeeid://shopeepay"
                    className="btn btn-outline btn-sm"
                    style={{ borderColor: '#ee4d2d', color: '#ee4d2d', fontWeight: 700 }}
                  >
                    📱 Buka ShopeePay
                  </a>
                </div>

                {/* Kotak Petunjuk Deteksi GoPay & Opsi Custom QRIS */}
                <div style={{ background: '#f0f9ff', padding: '1rem', borderRadius: '8px', border: '1px solid #bae6fd', fontSize: '0.85rem', color: '#0369a1', lineHeight: '1.5' }}>
                  <p style={{ fontWeight: 700, margin: '0 0 0.35rem 0' }}>
                    💡 Catatan Penting Mengenai Scan Aplikasi GoPay Asli di HP:
                  </p>
                  <p style={{ margin: '0 0 0.5rem 0' }}>
                    Aplikasi GoPay riil pada smartphone mewajibkan toko terdaftar resmi di switch ASPI (Bank Indonesia). Jika Anda ingin menguji menggunakan <strong>saldo uang sungguhan</strong>, Anda dapat memasang gambar QRIS toko/rekening Anda sendiri di bawah ini. Atau Anda dapat langsung menekan tombol <strong>"Simulasi Pembayaran Berhasil"</strong> untuk menyelesaikan alur pesanan secara instan.
                  </p>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setShowCustomQris(!showCustomQris)}
                      className="btn btn-sm"
                      style={{ background: '#0284c7', color: '#fff', border: 'none', fontWeight: 700 }}
                    >
                      {showCustomQris ? 'Sembunyikan Form QRIS Toko' : '🖼️ Pasang Gambar QRIS Toko Sendiri (Opsional)'}
                    </button>
                    {isCustomQrisActive && (
                      <button
                        type="button"
                        onClick={handleResetQrisStandar}
                        className="btn btn-sm btn-outline"
                        style={{ fontSize: '0.75rem' }}
                      >
                        Kembalikan ke QRIS Standar Sistem
                      </button>
                    )}
                  </div>

                  {showCustomQris && (
                    <form onSubmit={handleTerapkanCustomQris} style={{ marginTop: '1rem', background: '#fff', padding: '1rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.4rem', color: '#1e293b' }}>
                        Unggah / Tempel Gambar QRIS Merchant Anda:
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCustomQrisFileUpload}
                        style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem' }}
                      />
                      <input
                        type="text"
                        placeholder="Atau masukkan URL gambar QRIS Anda (https://...)"
                        value={customQrisInput}
                        onChange={(e) => setCustomQrisInput(e.target.value)}
                        className="form-control"
                        style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}
                      />
                      <button type="submit" className="btn btn-primary btn-sm">
                        Pasang & Tampilkan QRIS Ini
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}

            {metode === 'va' && (
              <div>
                <h4 style={{ fontWeight: 800, color: 'var(--dark)', marginBottom: '0.75rem' }}>
                  Nomor Rekening Virtual Account Bank
                </h4>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
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
                <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <small style={{ color: 'var(--text-muted)', display: 'block' }}>Nomor Rekening Virtual Account ({vaBank.replace('_va', '').toUpperCase()}):</small>
                    <span style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '1px', color: '#0369a1' }}>
                      {vaNumber}
                    </span>
                    <small style={{ display: 'block', color: '#64748b', marginTop: '0.25rem' }}>
                      Atas Nama: <strong>OPTIKEXPRESS - {layanan?.nama_pelanggan || 'PELANGGAN'}</strong>
                    </small>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(vaNumber, 'va')}
                    className="btn btn-outline btn-sm"
                  >
                    {copied === 'va' ? '✓ Nomor Tersalin!' : '📋 Salin Nomor VA'}
                  </button>
                </div>
              </div>
            )}

            {(metode === 'gopay' || metode === 'shopeepay') && (
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                  {metode === 'gopay' ? '🟢' : '🟠'}
                </div>
                <h4 style={{ fontWeight: 800, color: 'var(--dark)', marginBottom: '0.5rem' }}>
                  Pembayaran Instan via {metode === 'gopay' ? 'GoPay' : 'ShopeePay'}
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem', maxWidth: '480px', margin: '0 auto 1.25rem auto' }}>
                  Buka aplikasi {metode === 'gopay' ? 'Gojek / GoPay' : 'Shopee'} pada ponsel Anda untuk menyelesaikan otorisasi pembayaran sebesar <strong>Rp {totalBayar.toLocaleString('id-ID')}</strong>.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <a
                    href={metode === 'gopay' ? 'gojek://gopay/pay' : 'shopeeid://shopeepay'}
                    className="btn btn-primary"
                    style={{ background: metode === 'gopay' ? '#00aa13' : '#ee4d2d', borderColor: metode === 'gopay' ? '#00aa13' : '#ee4d2d' }}
                  >
                    📱 Buka Aplikasi {metode === 'gopay' ? 'GoPay' : 'ShopeePay'}
                  </a>
                  <button
                    type="button"
                    onClick={handleKonfirmasiLunas}
                    className="btn btn-outline"
                    disabled={processing}
                  >
                    {processing ? 'Memverifikasi...' : '✓ Konfirmasi Pembayaran Berhasil'}
                  </button>
                </div>
              </div>
            )}

            {metode === 'cod' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '2rem' }}>💵</span>
                  <div>
                    <h4 style={{ fontWeight: 800, color: 'var(--dark)', margin: 0 }}>
                      Cash On Delivery (Bayar Tunai ke Kurir)
                    </h4>
                    <small style={{ color: 'var(--text-muted)' }}>Pembayaran langsung saat kacamata dijemput atau diantar</small>
                  </div>
                </div>
                <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.6' }}>
                  Anda dapat menyerahkan uang tunai pas sebesar <strong>Rp {totalBayar.toLocaleString('id-ID')}</strong> langsung kepada kurir kami (<strong>{layanan?.kurir_nama || 'Kurir OptikExpress'}</strong>). Setelah kurir menerima pembayaran, status pesanan akan langsung ditandai LUNAS di aplikasi.
                </p>
                <div style={{ background: '#fef3c7', padding: '0.75rem 1rem', borderRadius: '8px', borderLeft: '4px solid #f59e0b', fontSize: '0.85rem', color: '#92400e' }}>
                  Kurir kami juga membawa QRIS di ponselnya jika Anda sewaktu-waktu ingin membayar secara non-tunai di tempat.
                </div>
              </div>
            )}
          </div>

          {/* Tombol Konfirmasi Pembayaran */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
            <Link to={`/layanan/${id}`} className="btn btn-outline">
              ← Kembali ke Detail Pesanan
            </Link>
            <button
              type="button"
              onClick={handleKonfirmasiLunas}
              className="btn btn-primary"
              disabled={processing}
              style={{ backgroundColor: '#10b981', borderColor: '#10b981', fontWeight: 800, padding: '0.65rem 1.25rem' }}
            >
              {processing ? 'Memproses Pelunasan...' : '✓ Simulasi: Konfirmasi Tagihan LUNAS'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PembayaranPage;

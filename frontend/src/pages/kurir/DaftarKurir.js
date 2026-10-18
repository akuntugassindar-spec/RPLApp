import React, { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * Halaman Pemantauan Armada Kurir (Daftar Kurir)
 * Menampilkan daftar seluruh armada kurir internal OptikExpress beserta
 * status operasional, kendaraan, nomor telepon, dan statistik pengantaran.
 */
const DaftarKurir = () => {
  const [kurirList] = useState([
    {
      id: 1,
      nama: 'Agus Pratama',
      telepon: '081234567890',
      kendaraan: 'Honda Vario 160 (L 4589 AB)',
      status: 'bertugas',
      pesananAktif: 2,
      wilayah: 'Surabaya Pusat & Timur',
      totalSelesai: 48
    },
    {
      id: 2,
      nama: 'Bambang Wijaya',
      telepon: '081398765432',
      kendaraan: 'Yamaha NMAX 155 (L 5214 CD)',
      status: 'tersedia',
      pesananAktif: 0,
      wilayah: 'Surabaya Barat & Selatan',
      totalSelesai: 62
    },
    {
      id: 3,
      nama: 'Rian Kurniawan',
      telepon: '085712348765',
      kendaraan: 'Honda Beat Street (L 3108 EF)',
      status: 'bertugas',
      pesananAktif: 1,
      wilayah: 'Surabaya Utara & Sekitarnya',
      totalSelesai: 39
    }
  ]);

  return (
    <div style={{ maxWidth: '1060px', margin: '0 auto', paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--dark)' }}>
            Manajemen Armada Kurir
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Daftar armada kurir internal penjemputan dan pengantaran kacamata OptikExpress
          </p>
        </div>
        <Link to="/dashboard" className="btn btn-outline btn-sm">
          Kembali ke Dashboard
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {kurirList.map((kurir) => (
          <div key={kurir.id} className="card" style={{ borderTop: '4px solid #0284c7' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--dark)', marginBottom: '0.25rem' }}>
                  {kurir.nama}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{kurir.kendaraan}</p>
              </div>
              <span
                className="badge"
                style={{
                  backgroundColor: kurir.status === 'tersedia' ? '#dcfce7' : '#fef3c7',
                  color: kurir.status === 'tersedia' ? '#15803d' : '#b45309',
                  fontWeight: 700
                }}
              >
                {kurir.status === 'tersedia' ? 'Siap Antar' : 'Sedang Bertugas'}
              </span>
            </div>

            <table style={{ width: '100%', fontSize: '0.9rem', marginBottom: '1rem' }}>
              <tbody>
                <tr>
                  <td style={{ color: 'var(--text-muted)', padding: '0.35rem 0', width: '40%' }}>Wilayah Operasi:</td>
                  <td style={{ fontWeight: 600 }}>{kurir.wilayah}</td>
                </tr>
                <tr>
                  <td style={{ color: 'var(--text-muted)', padding: '0.35rem 0' }}>Tugas Berjalan:</td>
                  <td style={{ fontWeight: 700, color: '#0369a1' }}>{kurir.pesananAktif} Pesanan</td>
                </tr>
                <tr>
                  <td style={{ color: 'var(--text-muted)', padding: '0.35rem 0' }}>Total Selesai:</td>
                  <td style={{ fontWeight: 600 }}>{kurir.totalSelesai} Pengantaran</td>
                </tr>
                <tr>
                  <td style={{ color: 'var(--text-muted)', padding: '0.35rem 0' }}>Kontak:</td>
                  <td style={{ fontWeight: 600 }}>{kurir.telepon}</td>
                </tr>
              </tbody>
            </table>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <a
                href={`tel:${kurir.telepon}`}
                className="btn btn-outline btn-sm"
                style={{ flex: 1, textAlign: 'center' }}
              >
                Telepon
              </a>
              <a
                href={`https://wa.me/62${kurir.telepon.replace(/^0/, '')}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-sm"
                style={{ flex: 1, textAlign: 'center', backgroundColor: '#10b981', color: '#fff', border: 'none', fontWeight: 600 }}
              >
                WhatsApp
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DaftarKurir;

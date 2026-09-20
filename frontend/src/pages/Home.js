import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Halaman Landing Page (Beranda)
 * Menyediakan informasi umum tentang layanan antar-jemput perbaikan kacamata,
 * fitur-fitur utama, alur kerja, dan tombol aksi (CTA).
 */
const Home = () => {
  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');
  let user = null;

  try {
    user = userJson ? JSON.parse(userJson) : null;
  } catch (e) {
    user = null;
  }

  // Tentukan rute tujuan CTA jika pengguna sudah login
  const destination = token
    ? user?.role === 'admin'
      ? '/admin/dashboard'
      : '/dashboard'
    : '/register';

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <h1>Layanan Antar-Jemput Kacamata Praktis & Cepat</h1>
        <p>
          Solusi terpercaya untuk perbaikan frame rusak, baut lepas, hingga penggantian lensa optik
          tanpa perlu keluar rumah. Kurir kami siap menjemput dan mengantarkan kembali kacamata Anda.
        </p>
        <div className="hero-buttons">
          <Link to={destination} className="btn btn-secondary btn-lg">
            {token ? 'Buka Dashboard Saya' : 'Daftar & Pesan Sekarang'}
          </Link>
          {!token && (
            <Link to="/login" className="btn btn-outline btn-lg" style={{ color: '#ffffff', borderColor: '#ffffff' }}>
              Masuk ke Akun
            </Link>
          )}
        </div>
      </section>

      {/* Keunggulan Layanan / Fitur */}
      <section style={{ marginBottom: '3.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--dark)' }}>
            Kenapa Memilih Layanan Kami?
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Kemudahan perawatan penglihatan Anda dengan standar kualitas optik terbaik
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🚗</div>
            <h3 style={{ marginBottom: '0.5rem', fontWeight: 700 }}>Antar-Jemput Tepat Waktu</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Pilih waktu dan alamat penjemputan sesuai kenyamanan Anda. Kurir kami datang tepat waktu.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔧</div>
            <h3 style={{ marginBottom: '0.5rem', fontWeight: 700 }}>Teknisi Optik Profesional</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Penyetelan frame bengkok, pergantian nosepad, solder frame patah, dikerjakan dengan presisi tinggi.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">👓</div>
            <h3 style={{ marginBottom: '0.5rem', fontWeight: 700 }}>Pilihan Lensa Lengkap</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Lensa anti-radiasi, blueray, photochromic, hingga progresif dengan resep optik yang akurat.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3 style={{ marginBottom: '0.5rem', fontWeight: 700 }}>Pantau Status Transparan</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Lacak setiap tahapan pengerjaan kacamata Anda secara langsung dari dashboard sistem.
            </p>
          </div>
        </div>
      </section>

      {/* Alur Pelayanan 4 Langkah Mudah */}
      <section className="card" style={{ padding: '2.5rem', backgroundColor: '#ffffff' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontWeight: 800 }}>
          4 Langkah Mudah Menggunakan Layanan
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', textAlign: 'center' }}>
          <div>
            <div style={{ width: '40px', height: '40px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontWeight: 800 }}>1</div>
            <h4 style={{ fontWeight: 700 }}>Isi Formulir Layanan</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Tentukan jenis perbaikan atau pergantian lensa serta jadwal jemput.</p>
          </div>
          <div>
            <div style={{ width: '40px', height: '40px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontWeight: 800 }}>2</div>
            <h4 style={{ fontWeight: 700 }}>Penjemputan Kurir</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Kurir kami mengambil kacamata Anda di lokasi yang dituju.</p>
          </div>
          <div>
            <div style={{ width: '40px', height: '40px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontWeight: 800 }}>3</div>
            <h4 style={{ fontWeight: 700 }}>Pengerjaan di Optik</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Kacamata diperbaiki dan dibersihkan secara menyeluruh.</p>
          </div>
          <div>
            <div style={{ width: '40px', height: '40px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontWeight: 800 }}>4</div>
            <h4 style={{ fontWeight: 700 }}>Pengantaran Kembali</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Kacamata yang telah prima diantar kembali langsung ke tangan Anda.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

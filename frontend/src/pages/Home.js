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
      : user?.role === 'kurir'
      ? '/kurir/dashboard'
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
            <div className="feature-icon" aria-label="Antar-Jemput Tepat Waktu">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0284c7" style={{ display: 'block' }} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
            </div>
            <h3 style={{ marginBottom: '0.5rem', fontWeight: 700 }}>Antar-Jemput Tepat Waktu</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Pilih waktu dan alamat penjemputan sesuai kenyamanan Anda. Kurir kami datang tepat waktu.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon" aria-label="Teknisi Optik Profesional">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0284c7" style={{ display: 'block' }} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
              </svg>
            </div>
            <h3 style={{ marginBottom: '0.5rem', fontWeight: 700 }}>Teknisi Optik Profesional</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Penyetelan frame bengkok, pergantian nosepad, solder frame patah, dikerjakan dengan presisi tinggi.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon" aria-label="Pilihan Lensa Lengkap">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0284c7" style={{ display: 'block' }} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="6" cy="14" r="4"></circle>
                <circle cx="18" cy="14" r="4"></circle>
                <path d="M10 14a2 2 0 0 1 4 0"></path>
                <path d="M2 13h1.5"></path>
                <path d="M20.5 13H22"></path>
                <path d="M5 12a2 2 0 0 1 2-2"></path>
                <path d="M17 12a2 2 0 0 1 2-2"></path>
              </svg>
            </div>
            <h3 style={{ marginBottom: '0.5rem', fontWeight: 700 }}>Pilihan Lensa Lengkap</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Lensa anti-radiasi, blueray, photochromic, hingga progresif dengan resep optik yang akurat.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon" aria-label="Pantau Status Transparan">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0284c7" style={{ display: 'block' }} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
            </div>
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

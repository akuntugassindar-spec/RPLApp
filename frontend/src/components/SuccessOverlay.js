import React, { useEffect } from 'react';

/**
 * Komponen SuccessOverlay
 * Menampilkan notifikasi pop-up modal overlay di tengah layar pengguna (front-and-center)
 * saat perubahan status, biaya, atau data pesanan berhasil disimpan.
 * Otomatis menutup sendiri setelah jeda waktu atau dapat ditutup manual.
 */
const SuccessOverlay = ({
  message,
  onClose,
  title = 'Perubahan Berhasil Disimpan!',
  autoCloseMs = 3200
}) => {
  useEffect(() => {
    if (!message) return;

    // Timer auto-close
    const timer = setTimeout(() => {
      onClose();
    }, autoCloseMs);

    // Event listener tombol ESC
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [message, onClose, autoCloseMs]);

  if (!message) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        animation: 'overlayFadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '18px',
          padding: '2.25rem 2rem 1.75rem',
          maxWidth: '460px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(226, 232, 240, 0.8)',
          position: 'relative',
          animation: 'overlayPopIn 0.28s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tombol Tutup Silang di Kanan Atas */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup notifikasi"
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'transparent',
            border: 'none',
            fontSize: '1.35rem',
            lineHeight: 1,
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '0.35rem',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#334155')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
        >
          &times;
        </button>

        {/* Lingkaran Ikon Centang Beranimasi */}
        <div
          style={{
            width: '72px',
            height: '72px',
            backgroundColor: '#dcfce7',
            color: '#16a34a',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            fontSize: '2.4rem',
            fontWeight: 800,
            boxShadow: '0 0 0 10px #f0fdf4'
          }}
        ><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>

        {/* Judul Notifikasi */}
        <h3
          style={{
            fontSize: '1.35rem',
            fontWeight: 800,
            color: '#0f172a',
            margin: '0 0 0.5rem 0'
          }}
        >
          {title}
        </h3>

        {/* Isi Pesan Sukses */}
        <p
          style={{
            fontSize: '0.98rem',
            color: '#475569',
            lineHeight: 1.55,
            margin: '0 0 1.5rem 0'
          }}
        >
          {message}
        </p>

        {/* Tombol Konfirmasi Cepat */}
        <button
          type="button"
          onClick={onClose}
          className="btn btn-primary"
          style={{
            width: '100%',
            padding: '0.75rem 1.5rem',
            fontWeight: 700,
            fontSize: '0.95rem',
            borderRadius: '10px',
            background: '#0284c7',
            borderColor: '#0284c7',
            cursor: 'pointer'
          }}
        >
          Oke, Mengerti
        </button>

        {/* Garis Progress Bar Countdown Otomatis */}
        <div
          style={{
            height: '3px',
            backgroundColor: '#e2e8f0',
            borderRadius: '999px',
            overflow: 'hidden',
            marginTop: '1.25rem'
          }}
        >
          <div
            style={{
              height: '100%',
              backgroundColor: '#10b981',
              width: '100%',
              animation: `overlayProgress ${autoCloseMs}ms linear forwards`
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SuccessOverlay;

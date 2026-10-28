import React, { useState, useEffect, useRef } from 'react';

/**
 * Komponen Google Maps Kurir Real-Time (Google Maps Indonesia - Daerah Jakarta & Tangerang)
 * Berdasarkan standar embed HTML:
 * https://stackoverflow.com/questions/54264689/how-do-i-embed-google-maps-url-to-website-using-html
 *
 * Menggunakan elemen HTML <iframe> embed Google Maps Indonesia (hl=id)
 * untuk menampilkan posisi kurir lapangan di wilayah Jakarta dan Tangerang,
 * rute navigasi perjalanan kurir ke alamat pelanggan, serta lokasi Toko Optik Pusat.
 */
const LiveMapKurir = ({
  kurirLat = -6.2180,
  kurirLng = 106.8250,
  kurirNama = 'Agus Pratama',
  kurirKendaraan = 'Honda Vario 160 (B 4589 AB)',
  destLat = -6.2205,
  destLng = 106.8270,
  optikLat = -6.2088,
  optikLng = 106.8456,
  alamatTujuan = 'Jakarta Selatan / Tangerang',
  height = '300px',
  showGoogleMapsBtn = true
}) => {
  // Mode tampilan Google Maps: 'kurir' (posisi kurir), 'rute' (rute kurir ke pelanggan), 'optik' (gerai optik)
  const [mapMode, setMapMode] = useState('rute');
  const [enginePeta, setEnginePeta] = useState('google'); // 'google' (Google Maps HTML Embed) | 'osm' (Leaflet)

  // Nilai koordinat valid dengan default wilayah Jakarta & Tangerang
  const validOptikLat = Number(optikLat) || -6.2088; // Jakarta Pusat (Jl. Sudirman)
  const validOptikLng = Number(optikLng) || 106.8456;
  const validDestLat = Number(destLat) || -6.2205;   // Jakarta Selatan / Alamat Pelanggan
  const validDestLng = Number(destLng) || 106.8270;
  // Kurir terdekat (~250 - 500 meter di sekitar tujuan pelanggan)
  const validKurirLat = Number(kurirLat) || (validDestLat + 0.0025);
  const validKurirLng = Number(kurirLng) || (validDestLng + 0.0025);

  // Kalkulasi jarak Haversine (km & meter)
  const calcDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const distKurirToDest = calcDistance(validKurirLat, validKurirLng, validDestLat, validDestLng);
  const distKurirMeter = Math.round(distKurirToDest * 1000);

  // URL HTML Embed Google Maps Indonesia (hl=id) sesuai StackOverflow
  // https://stackoverflow.com/questions/54264689/how-do-i-embed-google-maps-url-to-website-using-html
  const getGoogleMapsEmbedSrc = () => {
    if (mapMode === 'rute') {
      // Rute dari Kurir ke Alamat Pelanggan di Google Maps
      return `https://maps.google.com/maps?saddr=${validKurirLat},${validKurirLng}&daddr=${validDestLat},${validDestLng}&hl=id&output=embed`;
    } else if (mapMode === 'optik') {
      // Pin Toko Optik Pusat Jakarta & Hub Tangerang
      return `https://maps.google.com/maps?q=${validOptikLat},${validOptikLng}&hl=id&z=15&output=embed`;
    }
    // Default: Pin Posisi Kurir Terkini di Jakarta & Tangerang
    return `https://maps.google.com/maps?q=${validKurirLat},${validKurirLng}&hl=id&z=16&output=embed`;
  };

  // URL Direct Navigasi Google Maps Asli (Turn-by-turn)
  const googleMapsDirectUrl = `https://www.google.com/maps/dir/?api=1&origin=${validKurirLat},${validKurirLng}&destination=${validDestLat},${validDestLng}&travelmode=driving`;

  // Ref dan state untuk Leaflet (OSM secondary fallback)
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const kurirMarkerRef = useRef(null);
  const destMarkerRef = useRef(null);
  const polylineRef = useRef(null);

  // Inisialisasi Peta Leaflet (Hanya sekali saat engine OSM aktif)
  useEffect(() => {
    if (enginePeta !== 'osm' || typeof window === 'undefined' || !window.L || !containerRef.current) {
      return;
    }

    // Hindari re-inisialisasi jika instance peta sudah ada
    if (mapRef.current) {
      return;
    }

    try {
      // Patch pengaman Leaflet internal: cegah error _leaflet_pos saat transisi zoom/pan
      if (window.L.Map && !window.L.Map.prototype._safeLeafletPosPatch) {
        window.L.Map.prototype._safeLeafletPosPatch = true;
        const origGetMapPanePos = window.L.Map.prototype._getMapPanePos;
        if (typeof origGetMapPanePos === 'function') {
          window.L.Map.prototype._getMapPanePos = function () {
            if (!this._mapPane) return new window.L.Point(0, 0);
            try {
              return origGetMapPanePos.call(this);
            } catch (err) {
              return new window.L.Point(0, 0);
            }
          };
        }
      }

      const map = window.L.map(containerRef.current, {
        center: [validKurirLat, validKurirLng],
        zoom: 15,
        zoomControl: true,
        attributionControl: false
      });

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(map);

      // Marker Tujuan
      const destIcon = window.L.divIcon({
        className: 'leaflet-dest-marker',
        html: `
          <div style="background:#10b981;color:#fff;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.35);border:2px solid #fff;margin:0 auto;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></div>
          <div style="background:#065f46;color:#fff;font-size:9px;font-weight:700;padding:2px 6px;border-radius:3px;white-space:nowrap;margin-top:2px;text-align:center;">Tujuan</div>
        `,
        iconSize: [60, 48],
        iconAnchor: [30, 22]
      });

      // Marker Kurir
      const kurirIcon = window.L.divIcon({
        className: 'leaflet-kurir-marker',
        html: `
          <div style="background:#0284c7;border-radius:50%;width:28px;height:28px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;color:#fff;margin:0 auto;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="7" r="4"></circle><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path></svg></div>
          <div style="background:#0284c7;color:#fff;font-size:9px;font-weight:700;padding:2px 6px;border-radius:3px;white-space:nowrap;margin-top:2px;text-align:center;">${kurirNama}</div>
        `,
        iconSize: [70, 50],
        iconAnchor: [35, 23]
      });

      const destMarker = window.L.marker([validDestLat, validDestLng], { icon: destIcon }).addTo(map);
      const kurirMarker = window.L.marker([validKurirLat, validKurirLng], { icon: kurirIcon }).addTo(map);

      const polyline = window.L.polyline([
        [validKurirLat, validKurirLng],
        [validDestLat, validDestLng]
      ], { color: '#0284c7', weight: 4, dashArray: '6, 6' }).addTo(map);

      map.fitBounds([
        [validKurirLat, validKurirLng],
        [validDestLat, validDestLng]
      ], { padding: [35, 35], maxZoom: 16, animate: false });

      mapRef.current = map;
      destMarkerRef.current = destMarker;
      kurirMarkerRef.current = kurirMarker;
      polylineRef.current = polyline;
    } catch (e) {
      console.error('[LiveMapKurir] Gagal init leaflet:', e);
    }

    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.stop();
          mapRef.current.remove();
        } catch (err) {}
        mapRef.current = null;
        destMarkerRef.current = null;
        kurirMarkerRef.current = null;
        polylineRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enginePeta, kurirNama]);

  // Pembaruan Posisi Marker dan Polyline tanpa Re-create Peta
  useEffect(() => {
    if (!mapRef.current) return;
    try {
      if (kurirMarkerRef.current) {
        kurirMarkerRef.current.setLatLng([validKurirLat, validKurirLng]);
      }
      if (destMarkerRef.current) {
        destMarkerRef.current.setLatLng([validDestLat, validDestLng]);
      }
      if (polylineRef.current) {
        polylineRef.current.setLatLngs([
          [validKurirLat, validKurirLng],
          [validDestLat, validDestLng]
        ]);
      }
      if (mapRef.current && typeof mapRef.current.panTo === 'function') {
        mapRef.current.panTo([validKurirLat, validKurirLng], { animate: false });
      }
    } catch (err) {
      console.warn('[LiveMapKurir] Gagal memperbarui koordinat marker:', err);
    }
  }, [validKurirLat, validKurirLng, validDestLat, validDestLng]);

  return (
    <div style={{ width: '100%', fontFamily: 'inherit' }}>
      {/* Header Kontrol Peta Google Maps */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginBottom: '0.5rem'
      }}>
        {/* Tombol Tab Mode Tampilan Google Maps */}
        <div style={{ display: 'inline-flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <button
            type="button"
            onClick={() => { setMapMode('rute'); setEnginePeta('google'); }}
            style={{
              padding: '0.35rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              borderRadius: '6px',
              border: 'none',
              background: enginePeta === 'google' && mapMode === 'rute' ? '#0284c7' : 'transparent',
              color: enginePeta === 'google' && mapMode === 'rute' ? '#ffffff' : '#475569',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Rute Kurir (Google Maps)
          </button>
          <button
            type="button"
            onClick={() => { setMapMode('kurir'); setEnginePeta('google'); }}
            style={{
              padding: '0.35rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              borderRadius: '6px',
              border: 'none',
              background: enginePeta === 'google' && mapMode === 'kurir' ? '#0284c7' : 'transparent',
              color: enginePeta === 'google' && mapMode === 'kurir' ? '#ffffff' : '#475569',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Posisi Kurir (Jakarta/Tangerang)
          </button>
          <button
            type="button"
            onClick={() => { setMapMode('optik'); setEnginePeta('google'); }}
            style={{
              padding: '0.35rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              borderRadius: '6px',
              border: 'none',
              background: enginePeta === 'google' && mapMode === 'optik' ? '#0284c7' : 'transparent',
              color: enginePeta === 'google' && mapMode === 'optik' ? '#ffffff' : '#475569',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Toko Optik Pusat
          </button>
        </div>

        {/* Badge Area Operasional */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{
            fontSize: '0.72rem',
            background: '#e0f2fe',
            color: '#0369a1',
            padding: '0.2rem 0.55rem',
            borderRadius: '999px',
            fontWeight: 700,
            border: '1px solid #bae6fd'
          }}>
            Google Maps Indonesia (Jakarta & Tangerang)
          </span>
          <button
            type="button"
            onClick={() => setEnginePeta(enginePeta === 'google' ? 'osm' : 'google')}
            title="Ganti ke Peta OSM atau Google Maps"
            style={{
              fontSize: '0.72rem',
              padding: '0.2rem 0.5rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#64748b',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            {enginePeta === 'google' ? 'Tampilan OSM' : 'Kembali ke Google Maps'}
          </button>
        </div>
      </div>

      {/* Frame Tampilan Peta Utama */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: height || '300px',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1.5px solid #cbd5e1',
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
        backgroundColor: '#f8fafc'
      }}>
        {enginePeta === 'google' ? (
          /* ===================================================================
             HTML EMBED GOOGLE MAPS (SESUAI LINK STACKOVERFLOW):
             https://stackoverflow.com/questions/54264689/how-do-i-embed-google-maps-url-to-website-using-html
             =================================================================== */
          <iframe
            key={`${mapMode}-${validKurirLat}-${validKurirLng}`}
            title={`Google Maps Kurir ${kurirNama} - Jakarta & Tangerang`}
            src={getGoogleMapsEmbedSrc()}
            width="100%"
            height="100%"
            style={{ border: 0, display: 'block' }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
        )}

        {/* Overlay Badge Posisi Kurir di Pojok Peta */}
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: 'rgba(15, 23, 42, 0.85)',
          color: '#ffffff',
          padding: '0.35rem 0.7rem',
          borderRadius: '8px',
          fontSize: '0.75rem',
          fontWeight: 700,
          backdropFilter: 'blur(4px)',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          zIndex: 2,
          pointerEvents: 'none'
        }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', animation: 'pulse 1.5s infinite' }}></span>
          <span>LIVE GPS: {validKurirLat.toFixed(4)}, {validKurirLng.toFixed(4)}</span>
        </div>
      </div>

      {/* Info Bar & Tombol Akses Google Maps Langsung */}
      {showGoogleMapsBtn && (
        <div style={{
          marginTop: '0.75rem',
          padding: '0.75rem 1rem',
          background: '#f8fafc',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 700, marginBottom: '0.15rem' }}>
              Kurir Lapangan: <strong>{kurirNama}</strong>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500, marginLeft: '0.5rem' }}>
                ({kurirKendaraan})
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#475569' }}>
              Jarak ke Pelanggan: <strong style={{ color: '#0284c7' }}>~{distKurirMeter < 1000 ? `${distKurirMeter} meter` : `${(distKurirMeter/1000).toFixed(2)} km`}</strong>
              {' '}&bull; Alamat: {alamatTujuan}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <a
              href={googleMapsDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm"
              style={{
                backgroundColor: '#0284c7',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.82rem',
                padding: '0.5rem 0.9rem',
                borderRadius: '8px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <span>Buka Rute di Google Maps</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveMapKurir;

import React, { useEffect, useRef, useState } from 'react';

/**
 * Komponen Peta Jalan Asli Interaktif (OpenStreetMap via Leaflet)
 * Menampilkan:
 * 1. Marker Toko Optik (Jl. Pemuda 48, Surabaya)
 * 2. Marker Kurir Real-Time (bergerak dengan efek pulsing radar)
 * 3. Marker Alamat Pelanggan
 * 4. Polyline rute jalan raya
 * 5. Tombol direct intent Google Maps untuk turn-by-turn navigation
 */
const LiveMapKurir = ({
  kurirLat = -7.2750,
  kurirLng = 112.7700,
  kurirNama = 'Agus Pratama',
  alamatTujuan = 'Alamat Pelanggan',
  height = '230px',
  showGoogleMapsBtn = true
}) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const polylineRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  const optikLat = -7.2625;
  const optikLng = 112.7485;
  const destLat = -7.2890;
  const destLng = 112.7950;

  const validKurirLat = Number(kurirLat) || optikLat;
  const validKurirLng = Number(kurirLng) || optikLng;

  useEffect(() => {
    // Tunggu sampai Leaflet terload dari script tag
    if (typeof window === 'undefined' || !window.L || !containerRef.current) {
      return;
    }

    if (!mapRef.current) {
      try {
        if (containerRef.current._leaflet_id) {
          containerRef.current._leaflet_id = null;
        }

        const map = window.L.map(containerRef.current, {
          center: [validKurirLat, validKurirLng],
          zoom: 13,
          zoomControl: true,
          attributionControl: false
        });

        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19
        }).addTo(map);

        // Marker Toko Optik
        const optikIcon = window.L.divIcon({
          className: 'leaflet-optik-marker',
          html: `
            <div style="background:#0284c7;color:#fff;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 2px 6px rgba(0,0,0,0.3);border:2px solid #fff;">🏪</div>
            <div style="background:#0f172a;color:#fff;font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px;white-space:nowrap;margin-top:2px;box-shadow:0 1px 3px rgba(0,0,0,0.2);text-align:center;">OptikExpress</div>
          `,
          iconSize: [32, 50],
          iconAnchor: [16, 25]
        });

        // Marker Tujuan Pelanggan
        const destIcon = window.L.divIcon({
          className: 'leaflet-dest-marker',
          html: `
            <div style="background:#10b981;color:#fff;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 2px 6px rgba(0,0,0,0.3);border:2px solid #fff;">🏠</div>
            <div style="background:#065f46;color:#fff;font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px;white-space:nowrap;margin-top:2px;box-shadow:0 1px 3px rgba(0,0,0,0.2);text-align:center;">Pelanggan</div>
          `,
          iconSize: [32, 50],
          iconAnchor: [16, 25]
        });

        // Marker Kurir Motor
        const kurirIcon = window.L.divIcon({
          className: 'leaflet-kurir-marker',
          html: `
            <div style="position:relative;display:flex;align-items:center;justify-content:center;">
              <div class="pulse-ring"></div>
              <div class="map-badge-icon" style="background:#0d9488;">🛵</div>
            </div>
            <div style="background:#0d9488;color:#fff;font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px;white-space:nowrap;margin-top:2px;box-shadow:0 1px 3px rgba(0,0,0,0.2);text-align:center;">${kurirNama || 'Kurir'}</div>
          `,
          iconSize: [36, 54],
          iconAnchor: [18, 27]
        });

        const optikMarker = window.L.marker([optikLat, optikLng], { icon: optikIcon })
          .addTo(map)
          .bindPopup('<b>🏪 OptikExpress Store & Lab</b><br>Jl. Pemuda No. 48, Surabaya');

        const destMarker = window.L.marker([destLat, destLng], { icon: destIcon })
          .addTo(map)
          .bindPopup(`<b>🏠 Tujuan Pelanggan</b><br>${alamatTujuan || 'Alamat Penerima'}`);

        const kurirMarker = window.L.marker([validKurirLat, validKurirLng], { icon: kurirIcon })
          .addTo(map)
          .bindPopup(`<b>🛵 Kurir: ${kurirNama}</b><br>Posisi Live: ${validKurirLat.toFixed(4)}, ${validKurirLng.toFixed(4)}`);

        // Polyline Rute Jalan
        const polyline = window.L.polyline([
          [optikLat, optikLng],
          [validKurirLat, validKurirLng],
          [destLat, destLng]
        ], {
          color: '#0284c7',
          weight: 4,
          opacity: 0.8,
          dashArray: '6, 6'
        }).addTo(map);

        mapRef.current = map;
        markersRef.current = {
          optik: optikMarker,
          dest: destMarker,
          kurir: kurirMarker
        };
        polylineRef.current = polyline;

        map.fitBounds([
          [optikLat, optikLng],
          [destLat, destLng]
        ], { padding: [35, 35] });

        setMapReady(true);
      } catch (err) {
        console.error('[LiveMapKurir] Gagal menginisialisasi peta:', err);
      }
    } else {
      // Update posisi kurir marker yang sudah ada
      const kurirMarker = markersRef.current?.kurir;
      if (kurirMarker) {
        kurirMarker.setLatLng([validKurirLat, validKurirLng]);
        kurirMarker.setPopupContent(`<b>🛵 Kurir: ${kurirNama}</b><br>Posisi Live: ${validKurirLat.toFixed(4)}, ${validKurirLng.toFixed(4)}`);
      }
      if (polylineRef.current) {
        polylineRef.current.setLatLngs([
          [optikLat, optikLng],
          [validKurirLat, validKurirLng],
          [destLat, destLng]
        ]);
      }
    }
  }, [validKurirLat, validKurirLng, kurirNama, alamatTujuan]);

  // Teardown map saat unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {}
        mapRef.current = null;
      }
    };
  }, []);

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${optikLat},${optikLng}&destination=${validKurirLat},${validKurirLng}&travelmode=driving`;

  return (
    <div style={{ width: '100%' }}>
      {/* Container Leaflet */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: height,
          borderRadius: '8px',
          border: '1px solid #cbd5e1',
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: '#f1f5f9',
          zIndex: 1
        }}
      >
        {!mapReady && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', fontSize: '0.9rem' }}>
            🔄 Memuat peta jalan OpenStreetMap...
          </div>
        )}
      </div>

      {/* Info Bar & Tombol Buka di Google Maps */}
      {showGoogleMapsBtn && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.65rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            <span>🏪 <strong>Optik:</strong> Jl. Pemuda 48</span> &bull; <span>📍 <strong>Live GPS:</strong> {validKurirLat.toFixed(4)}, {validKurirLng.toFixed(4)}</span>
          </div>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm"
            style={{
              backgroundColor: '#0284c7',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.78rem',
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              boxShadow: '0 2px 4px rgba(2, 132, 199, 0.25)'
            }}
          >
            🗺️ Buka Rute di Google Maps ↗
          </a>
        </div>
      )}
    </div>
  );
};

export default LiveMapKurir;

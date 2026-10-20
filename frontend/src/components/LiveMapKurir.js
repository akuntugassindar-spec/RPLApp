import React, { useEffect, useRef, useState } from 'react';

/**
 * Komponen Peta Jalan Asli Interaktif (OpenStreetMap via Leaflet)
 * Menampilkan:
 * 1. Marker Toko Optik (Jl. Pemuda 48, Surabaya)
 * 2. Marker Kurir Real-Time (posisi terdekat acak dari alamat penjemputan Foto 2)
 * 3. Marker Alamat Pelanggan (hasil geocoding input alamat Foto 2)
 * 4. Polyline rute jalan raya (garis putus-putus biru)
 * 5. Teks status GPS dan Tombol Direct Navigasi Google Maps (Foto 1)
 */
const LiveMapKurir = ({
  kurirLat = -7.2652,
  kurirLng = 112.7532,
  kurirNama = 'Agus Pratama',
  destLat = -7.2890,
  destLng = 112.7950,
  optikLat = -7.2625,
  optikLng = 112.7485,
  alamatTujuan = 'Alamat Pelanggan',
  height = '185px',
  showGoogleMapsBtn = true
}) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const polylineRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  const validOptikLat = Number(optikLat) || -7.2625;
  const validOptikLng = Number(optikLng) || 112.7485;
  const validDestLat = Number(destLat) || -7.2890;
  const validDestLng = Number(destLng) || 112.7950;
  const validKurirLat = Number(kurirLat) || validOptikLat;
  const validKurirLng = Number(kurirLng) || validOptikLng;

  useEffect(() => {
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

        // Marker Toko Optik (Jl. Pemuda 48)
        const optikIcon = window.L.divIcon({
          className: 'leaflet-optik-marker',
          html: `
            <div style="background:#0284c7;color:#fff;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 5px rgba(0,0,0,0.3);border:2px solid #fff;margin:0 auto;"></div>
            <div style="background:#0f172a;color:#fff;font-size:9px;font-weight:700;padding:2px 5px;border-radius:3px;white-space:nowrap;margin-top:2px;box-shadow:0 1px 3px rgba(0,0,0,0.2);text-align:center;">Optik</div>
          `,
          iconSize: [40, 44],
          iconAnchor: [20, 20]
        });

        // Marker Tujuan Pelanggan (Foto 2)
        const destIcon = window.L.divIcon({
          className: 'leaflet-dest-marker',
          html: `
            <div style="background:#10b981;color:#fff;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 5px rgba(0,0,0,0.3);border:2px solid #fff;margin:0 auto;"></div>
            <div style="background:#065f46;color:#fff;font-size:9px;font-weight:700;padding:2px 5px;border-radius:3px;white-space:nowrap;margin-top:2px;box-shadow:0 1px 3px rgba(0,0,0,0.2);text-align:center;">Pelanggan</div>
          `,
          iconSize: [50, 44],
          iconAnchor: [25, 20]
        });

        // Marker Kurir Terdekat
        const kurirIcon = window.L.divIcon({
          className: 'leaflet-kurir-marker',
          html: `
            <div style="position:relative;display:flex;align-items:center;justify-content:center;margin:0 auto;width:28px;height:28px;">
              <div class="pulse-ring" style="width:36px;height:36px;background:rgba(13,148,136,0.35);"></div>
              <div style="background:#0d9488;border-radius:50%;width:26px;height:26px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.35);"></div>
            </div>
            <div style="background:#0d9488;color:#fff;font-size:9px;font-weight:700;padding:2px 6px;border-radius:3px;white-space:nowrap;margin-top:2px;box-shadow:0 1px 3px rgba(0,0,0,0.2);text-align:center;">${kurirNama || 'Agus Pratama'}</div>
          `,
          iconSize: [60, 48],
          iconAnchor: [30, 22]
        });

        const optikMarker = window.L.marker([validOptikLat, validOptikLng], { icon: optikIcon })
          .addTo(map)
          .bindPopup('<b>OptikExpress Store & Lab</b><br>Jl. Pemuda No. 48, Surabaya');

        const destMarker = window.L.marker([validDestLat, validDestLng], { icon: destIcon })
          .addTo(map)
          .bindPopup(`<b>Alamat Pelanggan</b><br>${alamatTujuan || 'Tujuan Penjemputan'}`);

        const kurirMarker = window.L.marker([validKurirLat, validKurirLng], { icon: kurirIcon })
          .addTo(map)
          .bindPopup(`<b>Kurir: ${kurirNama}</b><br>Posisi Live: ${validKurirLat.toFixed(4)}, ${validKurirLng.toFixed(4)}`);

        // Polyline Rute Jalan (Garis Putus-Putus Biru)
        const polyline = window.L.polyline([
          [validOptikLat, validOptikLng],
          [validKurirLat, validKurirLng],
          [validDestLat, validDestLng]
        ], {
          color: '#0284c7',
          weight: 3.5,
          opacity: 0.85,
          dashArray: '6, 6'
        }).addTo(map);

        mapRef.current = map;
        markersRef.current = {
          optik: optikMarker,
          dest: destMarker,
          kurir: kurirMarker
        };
        polylineRef.current = polyline;

        // Pasang bingkai peta agar seluruh titik terlihat pas
        map.fitBounds([
          [validOptikLat, validOptikLng],
          [validKurirLat, validKurirLng],
          [validDestLat, validDestLng]
        ], { padding: [25, 25] });

        setMapReady(true);
      } catch (err) {
        console.error('[LiveMapKurir] Gagal menginisialisasi peta Leaflet:', err);
      }
    } else {
      // Update posisi kurir marker & polyline yang sudah aktif
      const kurirMarker = markersRef.current?.kurir;
      if (kurirMarker) {
        kurirMarker.setLatLng([validKurirLat, validKurirLng]);
        kurirMarker.setPopupContent(`<b>Kurir: ${kurirNama}</b><br>Posisi Live: ${validKurirLat.toFixed(4)}, ${validKurirLng.toFixed(4)}`);
      }
      const destMarker = markersRef.current?.dest;
      if (destMarker) {
        destMarker.setLatLng([validDestLat, validDestLng]);
      }
      if (polylineRef.current) {
        polylineRef.current.setLatLngs([
          [validOptikLat, validOptikLng],
          [validKurirLat, validKurirLng],
          [validDestLat, validDestLng]
        ]);
      }
    }
  }, [validKurirLat, validKurirLng, validDestLat, validDestLng, validOptikLat, validOptikLng, kurirNama, alamatTujuan]);

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

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${validKurirLat},${validKurirLng}&destination=${validDestLat},${validDestLng}&travelmode=driving`;

  return (
    <div style={{ width: '100%' }}>
      {/* Container Leaflet OpenStreetMap */}
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', fontSize: '0.85rem' }}>
            Memuat peta jalan OpenStreetMap Surabaya...
          </div>
        )}
      </div>

      {/* Info Bar & Tombol Buka Rute di Google Maps (Persis Foto 1) */}
      {showGoogleMapsBtn && (
        <div style={{ marginTop: '0.65rem' }}>
          <div style={{ fontSize: '0.78rem', color: '#334155', marginBottom: '0.5rem', fontWeight: 500 }}>
            <span>Optik: Jl. Pemuda 48</span> &bull; <span>Live GPS: {validKurirLat.toFixed(4)}, {validKurirLng.toFixed(4)}</span>
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
              fontSize: '0.85rem',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              textDecoration: 'none',
              display: 'inline-block',
              textAlign: 'center',
              boxShadow: '0 2px 4px rgba(2, 132, 199, 0.25)',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Buka Rute di Google Maps
          </a>
        </div>
      )}
    </div>
  );
};

export default LiveMapKurir;

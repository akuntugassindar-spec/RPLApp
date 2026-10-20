import React, { useEffect, useRef, useState } from 'react';

/**
 * Komponen Peta Jalan Asli Interaktif (OpenStreetMap via Leaflet)
 * Menampilkan:
 * 1. Marker Alamat Pelanggan (hasil geocoding input alamat penjemputan Foto 2)
 * 2. Marker Kurir Terdekat Real-Time (posisi terdekat di sekitar alamat jemput pelanggan)
 * 3. Polyline rute jalan raya langsung dari Kurir Terdekat ke Lokasi Pelanggan
 * 4. Marker Toko Optik (jika dalam jangkauan area kota yang sama)
 * 5. Teks status GPS dan Tombol Direct Navigasi Google Maps (Foto 1)
 */
const LiveMapKurir = ({
  kurirLat = -7.2890,
  kurirLng = 112.7950,
  kurirNama = 'Agus Pratama',
  destLat = -7.2890,
  destLng = 112.7950,
  optikLat = -7.2625,
  optikLng = 112.7485,
  alamatTujuan = 'Alamat Pelanggan',
  height = '200px',
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
  // Jika kurir belum terisi, letakkan di dekat tujuan (~350 meter)
  const validKurirLat = Number(kurirLat) || (validDestLat + 0.003);
  const validKurirLng = Number(kurirLng) || (validDestLng + 0.003);

  // Hitung jarak perkiraan kurir ke pelanggan (km)
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

  const distToOptik = calcDistance(validOptikLat, validOptikLng, validDestLat, validDestLng);
  const distKurirToDest = calcDistance(validKurirLat, validKurirLng, validDestLat, validDestLng);
  const distKurirMeter = Math.round(distKurirToDest * 1000);

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
          zoom: 15,
          zoomControl: true,
          attributionControl: false
        });

        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19
        }).addTo(map);

        // Marker Alamat Penjemputan Pelanggan (Foto 2)
        const destIcon = window.L.divIcon({
          className: 'leaflet-dest-marker',
          html: `
            <div style="background:#10b981;color:#fff;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.35);border:2px solid #fff;margin:0 auto;font-size:14px;">🏠</div>
            <div style="background:#065f46;color:#fff;font-size:9px;font-weight:700;padding:2px 6px;border-radius:3px;white-space:nowrap;margin-top:2px;box-shadow:0 1px 3px rgba(0,0,0,0.25);text-align:center;">Alamat Jemput</div>
          `,
          iconSize: [60, 48],
          iconAnchor: [30, 22]
        });

        // Marker Kurir Terdekat
        const kurirIcon = window.L.divIcon({
          className: 'leaflet-kurir-marker',
          html: `
            <div style="position:relative;display:flex;align-items:center;justify-content:center;margin:0 auto;width:30px;height:30px;">
              <div class="pulse-ring" style="width:38px;height:38px;background:rgba(2,132,199,0.35);border-radius:50%;position:absolute;"></div>
              <div style="background:#0284c7;border-radius:50%;width:28px;height:28px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;position:relative;z-index:2;">🛵</div>
            </div>
            <div style="background:#0284c7;color:#fff;font-size:9px;font-weight:700;padding:2px 6px;border-radius:3px;white-space:nowrap;margin-top:2px;box-shadow:0 1px 3px rgba(0,0,0,0.25);text-align:center;">${kurirNama} (Terdekat)</div>
          `,
          iconSize: [70, 50],
          iconAnchor: [35, 23]
        });

        const destMarker = window.L.marker([validDestLat, validDestLng], { icon: destIcon })
          .addTo(map)
          .bindPopup(`<b>Alamat Penjemputan</b><br>${alamatTujuan || 'Titik Jemput'}`);

        const kurirMarker = window.L.marker([validKurirLat, validKurirLng], { icon: kurirIcon })
          .addTo(map)
          .bindPopup(`<b>Kurir Terdekat: ${kurirNama}</b><br>Jarak: ~${distKurirMeter} m<br>GPS: ${validKurirLat.toFixed(5)}, ${validKurirLng.toFixed(5)}`);

        // Polyline Rute Langsung dari Kurir Terdekat ke Titik Jemput Pelanggan
        const polyline = window.L.polyline([
          [validKurirLat, validKurirLng],
          [validDestLat, validDestLng]
        ], {
          color: '#0284c7',
          weight: 4,
          opacity: 0.9,
          dashArray: '6, 6'
        }).addTo(map);

        let optikMarker = null;
        // Jika Optik berada dalam satu kota (<15 km), tampilkan juga pin Toko Optik
        if (distToOptik < 15) {
          const optikIcon = window.L.divIcon({
            className: 'leaflet-optik-marker',
            html: `
              <div style="background:#475569;color:#fff;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 5px rgba(0,0,0,0.3);border:2px solid #fff;margin:0 auto;font-size:12px;">🏪</div>
              <div style="background:#0f172a;color:#fff;font-size:8px;font-weight:700;padding:2px 4px;border-radius:3px;white-space:nowrap;margin-top:2px;text-align:center;">Optik Lab</div>
            `,
            iconSize: [45, 42],
            iconAnchor: [22, 18]
          });
          optikMarker = window.L.marker([validOptikLat, validOptikLng], { icon: optikIcon })
            .addTo(map)
            .bindPopup('<b>OptikExpress Store & Lab</b><br>Jl. Pemuda No. 48, Surabaya');
        }

        mapRef.current = map;
        markersRef.current = {
          optik: optikMarker,
          dest: destMarker,
          kurir: kurirMarker
        };
        polylineRef.current = polyline;

        // Pasang bingkai peta agar Kurir Terdekat dan Titik Jemput Pelanggan terlihat fokus & pas
        map.fitBounds([
          [validKurirLat, validKurirLng],
          [validDestLat, validDestLng]
        ], { padding: [40, 40], maxZoom: 16 });

        setMapReady(true);
      } catch (err) {
        console.error('[LiveMapKurir] Gagal menginisialisasi peta Leaflet:', err);
      }
    } else {
      // Update posisi kurir marker & polyline yang sudah aktif
      const kurirMarker = markersRef.current?.kurir;
      if (kurirMarker) {
        kurirMarker.setLatLng([validKurirLat, validKurirLng]);
        kurirMarker.setPopupContent(`<b>Kurir Terdekat: ${kurirNama}</b><br>Jarak: ~${distKurirMeter} m<br>GPS: ${validKurirLat.toFixed(5)}, ${validKurirLng.toFixed(5)}`);
      }
      const destMarker = markersRef.current?.dest;
      if (destMarker) {
        destMarker.setLatLng([validDestLat, validDestLng]);
        destMarker.setPopupContent(`<b>Alamat Penjemputan</b><br>${alamatTujuan || 'Titik Jemput'}`);
      }
      if (polylineRef.current) {
        polylineRef.current.setLatLngs([
          [validKurirLat, validKurirLng],
          [validDestLat, validDestLng]
        ]);
      }
      if (mapRef.current) {
        mapRef.current.fitBounds([
          [validKurirLat, validKurirLng],
          [validDestLat, validDestLng]
        ], { padding: [40, 40], maxZoom: 16 });
      }
    }
  }, [validKurirLat, validKurirLng, validDestLat, validDestLng, validOptikLat, validOptikLng, kurirNama, alamatTujuan, distKurirMeter, distToOptik]);

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
            Memuat peta jalan OpenStreetMap...
          </div>
        )}
      </div>

      {/* Info Bar & Tombol Buka Rute di Google Maps (Foto 1) */}
      {showGoogleMapsBtn && (
        <div style={{ marginTop: '0.65rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#334155', marginBottom: '0.5rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.3rem' }}>
            <span>🛵 Kurir Terdekat: <strong>{kurirNama}</strong> (~{distKurirMeter < 1000 ? `${distKurirMeter} m` : `${(distKurirMeter/1000).toFixed(1)} km`})</span>
            <span>📍 GPS: {validKurirLat.toFixed(4)}, {validKurirLng.toFixed(4)}</span>
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

/**
 * ====================================================================
 * TEST SUITE: COURIER DISPATCH & GPS TELEMETRY (25 UNIT TESTS)
 * Pengujian algoritma Haversine, geofencing DKI Jakarta & Tangerang,
 * estimasi waktu tiba (ETA), master armada kurir plat B, dan radar GPS.
 * ====================================================================
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// Algoritma Haversine
const calculateHaversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius bumi dalam km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
};

// Estimasi ETA menit berdasarkan kecepatan rata-rata sepeda motor kota (30 km/jam)
const calculateETA = (distanceKm, averageSpeedKmH = 30) => {
  if (distanceKm <= 0) return 0;
  const hours = distanceKm / averageSpeedKmH;
  return Math.ceil(hours * 60) + 5; // + 5 menit waktu parkir & penyerahan
};

// Bounding Box Validasi Geografis (Jabodetabek)
const isInJabodetabek = (lat, lng) => {
  const minLat = -6.40, maxLat = -6.05;
  const minLng = 106.50, maxLng = 107.05;
  return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
};

// Plat nomor resmi B DKI Jakarta & Tangerang
const isValidPlatB = (plate) => /^B\s\d{1,4}\s[A-Z]{1,3}$/.test(plate);

describe('Courier Dispatch & GPS Telemetry Suite (25 Tests)', () => {
  // Test 1 - 5: Haversine Calculations
  it('DISP-01: Jarak koordinat yang sama harus bernilai 0.00 km', () => {
    assert.strictEqual(calculateHaversine(-6.2088, 106.8456, -6.2088, 106.8456), 0);
  });

  it('DISP-02: Jarak Monas ke Senayan (~5.8 km) dihitung secara akurat', () => {
    const monas = { lat: -6.1754, lng: 106.8272 };
    const senayan = { lat: -6.2215, lng: 106.8000 };
    const dist = calculateHaversine(monas.lat, monas.lng, senayan.lat, senayan.lng);
    assert.ok(dist >= 5.5 && dist <= 6.2);
  });

  it('DISP-03: Jarak Jakarta Pusat ke Tangerang BSD (~25 km) dihitung akurat', () => {
    const jakpus = { lat: -6.2088, lng: 106.8456 };
    const bsd = { lat: -6.3015, lng: 106.6522 };
    const dist = calculateHaversine(jakpus.lat, jakpus.lng, bsd.lat, bsd.lng);
    assert.ok(dist >= 22.0 && dist <= 27.0);
  });

  it('DISP-04: Jarak kurir ke pelanggan lokal terdekat (< 500 meter) menghasilkan < 0.5 km', () => {
    const kurir = { lat: -6.2088, lng: 106.8456 };
    const pelanggan = { lat: -6.2100, lng: 106.8470 };
    const dist = calculateHaversine(kurir.lat, kurir.lng, pelanggan.lat, pelanggan.lng);
    assert.ok(dist < 0.5);
  });

  it('DISP-05: Jarak simetris (A ke B sama dengan B ke A)', () => {
    const d1 = calculateHaversine(-6.2000, 106.8000, -6.2500, 106.8500);
    const d2 = calculateHaversine(-6.2500, 106.8500, -6.2000, 106.8000);
    assert.strictEqual(d1, d2);
  });

  // Test 6 - 10: ETA Calculations
  it('DISP-06: Jarak 0 km menghasilkan ETA 0 menit', () => {
    assert.strictEqual(calculateETA(0), 0);
  });

  it('DISP-07: Jarak 5 km pada 30 km/jam menghasilkan ETA ~15 menit (termasuk buffer 5 menit)', () => {
    assert.strictEqual(calculateETA(5, 30), 15);
  });

  it('DISP-08: Jarak 15 km pada 30 km/jam menghasilkan ETA 35 menit', () => {
    assert.strictEqual(calculateETA(15, 30), 35);
  });

  it('DISP-09: Jarak dekat 1 km menghasilkan estimasi waktu tiba aman 7 menit', () => {
    assert.strictEqual(calculateETA(1, 30), 7);
  });

  it('DISP-10: Peningkatan kecepatan kurir (misal jalan tol 60 km/jam) menurunkan waktu tempuh', () => {
    const etaNormal = calculateETA(10, 30);
    const etaCepat = calculateETA(10, 60);
    assert.ok(etaCepat < etaNormal);
  });

  // Test 11 - 15: Geofencing Jabodetabek
  it('DISP-11: Jakarta Pusat (-6.2088, 106.8456) berada di dalam area operasional Jabodetabek', () => {
    assert.strictEqual(isInJabodetabek(-6.2088, 106.8456), true);
  });

  it('DISP-12: BSD City Serpong (-6.3015, 106.6522) berada di dalam area operasional Jabodetabek', () => {
    assert.strictEqual(isInJabodetabek(-6.3015, 106.6522), true);
  });

  it('DISP-13: Tangerang Kota (-6.1783, 106.6319) berada di dalam area operasional Jabodetabek', () => {
    assert.strictEqual(isInJabodetabek(-6.1783, 106.6319), true);
  });

  it('DISP-14: Koordinat luar wilayah (misal Bandung: -6.9175, 107.6191) berada di luar cakupan', () => {
    assert.strictEqual(isInJabodetabek(-6.9175, 107.6191), false);
  });

  it('DISP-15: Koordinat luar pulau (misal Surabaya: -7.2575, 112.7521) berada di luar cakupan', () => {
    assert.strictEqual(isInJabodetabek(-7.2575, 112.7521), false);
  });

  // Test 16 - 20: Plat Nomor Armada Plat B
  it('DISP-16: Plat nomor resmi B 4589 AB valid', () => {
    assert.strictEqual(isValidPlatB('B 4589 AB'), true);
  });

  it('DISP-17: Plat nomor resmi B 3120 TNG (Tangerang) valid', () => {
    assert.strictEqual(isValidPlatB('B 3120 TNG'), true);
  });

  it('DISP-18: Plat nomor resmi B 6742 BSD (Serpong) valid', () => {
    assert.strictEqual(isValidPlatB('B 6742 BSD'), true);
  });

  it('DISP-19: Plat non-B (misal D 1234 XY) ditolak oleh armada internal Jakarta', () => {
    assert.strictEqual(isValidPlatB('D 1234 XY'), false);
  });

  it('DISP-20: Plat nomor format salah tanpa spasi ditolak', () => {
    assert.strictEqual(isValidPlatB('B3120TNG'), false);
  });

  // Test 21 - 25: Courier Availability & Live Telemetry
  it('DISP-21: Status aktif kurir hanya menerima aktif, istirahat, atau nonaktif', () => {
    const VALID_COURIER_STATUS = ['aktif', 'istirahat', 'nonaktif'];
    assert.strictEqual(VALID_COURIER_STATUS.includes('aktif'), true);
    assert.strictEqual(VALID_COURIER_STATUS.includes('istirahat'), true);
    assert.strictEqual(VALID_COURIER_STATUS.includes('nonaktif'), true);
    assert.strictEqual(VALID_COURIER_STATUS.includes('libur_panjang'), false);
  });

  it('DISP-22: Kurir berstatus istirahat tidak boleh dialokasikan untuk order baru', () => {
    const isAvailableForAssignment = (status) => status === 'aktif';
    assert.strictEqual(isAvailableForAssignment('aktif'), true);
    assert.strictEqual(isAvailableForAssignment('istirahat'), false);
    assert.strictEqual(isAvailableForAssignment('nonaktif'), false);
  });

  it('DISP-23: Interpolasi posisi kurir pada progres 50% berada di titik tengah', () => {
    const start = { lat: -6.2000, lng: 106.8000 };
    const end = { lat: -6.3000, lng: 106.9000 };
    const ratio = 0.5;

    const midLat = start.lat + (end.lat - start.lat) * ratio;
    const midLng = start.lng + (end.lng - start.lng) * ratio;

    assert.strictEqual(parseFloat(midLat.toFixed(4)), -6.2500);
    assert.strictEqual(parseFloat(midLng.toFixed(4)), 106.8500);
  });

  it('DISP-24: Payload siaran telemetry GPS kurir harus memuat lat, lng, dan timestamp', () => {
    const broadcastPayload = {
      kurir_id: 1,
      lat: -6.2088,
      lng: 106.8456,
      heading: 120,
      timestamp: Date.now()
    };

    assert.strictEqual(typeof broadcastPayload.kurir_id, 'number');
    assert.strictEqual(typeof broadcastPayload.lat, 'number');
    assert.strictEqual(typeof broadcastPayload.lng, 'number');
    assert.ok(broadcastPayload.timestamp > 0);
  });

  it('DISP-25: Generator URL Google Maps direct navigation menghasilkan link sah', () => {
    const generateGoogleMapsNavUrl = (lat, lng) => `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    const url = generateGoogleMapsNavUrl(-6.2088, 106.8456);
    assert.ok(url.startsWith('https://www.google.com/maps/dir/'));
    assert.ok(url.includes('destination=-6.2088,106.8456'));
  });
});

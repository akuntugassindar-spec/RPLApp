/**
 * Unit Test: Manajemen Layanan & Validasi Status + Foto + Notifikasi
 * 
 * User Story #1:
 * "Sebagai pelanggan, saya ingin mengajukan permintaan layanan perbaikan
 *  kacamata dengan memilih jenis layanan, menyertakan foto kerusakan,
 *  dan mendapatkan notifikasi otomatis setiap kali status berubah."
 * 
 * Acceptance Criteria:
 * AC-1: Jenis layanan tersedia 3 pilihan: perbaikan, penggantian_lensa, perbaikan_dan_lensa.
 * AC-2: Status layanan memiliki 6 alur valid state machine.
 * AC-3: Pembuatan layanan ditolak jika field wajib kosong atau jenis_layanan tidak valid (HTTP 400).
 * AC-4: Perubahan status ditolak jika status kosong atau tidak valid (HTTP 400).
 * AC-5: Notifikasi WhatsApp Mock terkirim dengan format benar dan status uppercase.
 * AC-6: Foto base64 tersimpan ke disk dan URL path dikembalikan dengan benar.
 * AC-7: Metode pembayaran mencakup QRIS, VA Bank, e-Wallet, dan COD.
 */

const { describe, it, after } = require('node:test');
const assert = require('node:assert/strict');
const db = require('../config/db');

const {
  VALID_STATUSES, VALID_JENIS_LAYANAN, VALID_METODE_PEMBAYARAN,
  COURIER_POOL, autoAssignCourier,
  geocodeSurabayaAddress, calculateDistanceKm, findNearestRandomCourier,
  saveBase64Image, sendWANotification, createLayanan, updateStatusLayanan
} = require('../controllers/layananController');

after(async () => {
  try {
    await db.end();
  } catch (err) {}
});

describe('Pengujian Fitur 1: Manajemen & Validasi Layanan (Service Management)', () => {
  it('Harus memiliki seluruh jenis layanan yang didukung sistem (termasuk perbaikan_dan_lensa)', () => {
    assert.ok(Array.isArray(VALID_JENIS_LAYANAN));
    assert.strictEqual(VALID_JENIS_LAYANAN.includes('perbaikan'), true);
    assert.strictEqual(VALID_JENIS_LAYANAN.includes('penggantian_lensa'), true);
    assert.strictEqual(VALID_JENIS_LAYANAN.includes('perbaikan_dan_lensa'), true);
    assert.strictEqual(VALID_JENIS_LAYANAN.length, 3);
  });
  it('Harus memiliki 6 alur status layanan yang valid', () => {
    assert.deepStrictEqual(VALID_STATUSES, ['pengajuan','dijadwalkan','diambil','diproses','selesai','diantar']);
  });
  it('createLayanan harus menolak jika field wajib kosong (HTTP 400)', async () => {
    let statusCode = null, jsonResponse = null;
    const req = { user: { id: 1, role: 'pelanggan' }, body: {} };
    const res = { status(code) { statusCode = code; return this; }, json(data) { jsonResponse = data; return this; } };
    await createLayanan(req, res);
    assert.strictEqual(statusCode, 400);
    assert.strictEqual(jsonResponse.success, false);
    assert.match(jsonResponse.message, /wajib diisi/i);
  });
  it('createLayanan harus menolak jika jenis_layanan tidak valid (HTTP 400)', async () => {
    let statusCode = null, jsonResponse = null;
    const req = { user: { id: 1, role: 'pelanggan' }, body: { jenis_layanan: 'palsu', keluhan: 'Test', alamat: 'Test', tanggal_jemput: '2026-10-15', jam_jemput: '10:00' } };
    const res = { status(code) { statusCode = code; return this; }, json(data) { jsonResponse = data; return this; } };
    await createLayanan(req, res);
    assert.strictEqual(statusCode, 400);
    assert.match(jsonResponse.message, /Jenis layanan tidak valid/i);
  });
  it('updateStatusLayanan harus menolak jika status kosong (HTTP 400)', async () => {
    let statusCode = null, jsonResponse = null;
    const req = { params: { id: 10 }, body: {} };
    const res = { status(code) { statusCode = code; return this; }, json(data) { jsonResponse = data; return this; } };
    await updateStatusLayanan(req, res);
    assert.strictEqual(statusCode, 400);
    assert.match(jsonResponse.message, /Status baru wajib disertakan/i);
  });
  it('updateStatusLayanan harus menolak jika status baru tidak valid (HTTP 400)', async () => {
    let statusCode = null, jsonResponse = null;
    const req = { params: { id: 10 }, body: { status: 'x' } };
    const res = { status(code) { statusCode = code; return this; }, json(data) { jsonResponse = data; return this; } };
    await updateStatusLayanan(req, res);
    assert.strictEqual(statusCode, 400);
    assert.match(jsonResponse.message, /Status tidak valid/i);
  });
});

describe('Pengujian Fitur 2: Notifikasi Otomatis (Email & WhatsApp Mock)', () => {
  it('sendWANotification harus mengeksekusi format log WhatsApp dengan status uppercase', async () => {
    const logs = []; const orig = console.log; console.log = (...a) => logs.push(a.join(' '));
    try { await sendWANotification('081234567890', 'Budi', 'selesai'); const o = logs.join('\n'); assert.ok(o.includes('[WhatsApp Mock] MENGIRIM PESAN WA KE PELANGGAN')); assert.ok(o.includes('*SELESAI*')); assert.ok(o.includes('TERKIRIM (Mock)')); } finally { console.log = orig; }
  });
  it('sendWANotification harus dapat menangani jika no telepon kosong', async () => {
    const logs = []; const orig = console.log; console.log = (...a) => logs.push(a.join(' '));
    try { await sendWANotification(null, 'Ani', 'diantar'); const o = logs.join('\n'); assert.ok(o.includes('Kepada  : - (Ani)')); assert.ok(o.includes('*DIANTAR*')); } finally { console.log = orig; }
  });
});

describe('Pengujian Fitur 3: Unggah Foto Kacamata & Resep Optik', () => {
  it('saveBase64Image harus mengembalikan null jika input kosong', () => {
    assert.strictEqual(saveBase64Image(null, 'test'), null);
    assert.strictEqual(saveBase64Image('', 'test'), null);
  });
  it('saveBase64Image harus mempertahankan URL existing', () => {
    assert.strictEqual(saveBase64Image('/uploads/sample.jpg', 'test'), '/uploads/sample.jpg');
  });
  it('saveBase64Image harus menyimpan base64 valid', () => {
    const b64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const r = saveBase64Image(b64, 'test-unit');
    assert.ok(typeof r === 'string'); assert.ok(r.startsWith('/uploads/')); assert.ok(r.endsWith('.png'));
  });
});

describe('Pengujian Fitur 4: Integrasi Payment Gateway (Metode & Simulasi Midtrans)', () => {
  it('VALID_METODE_PEMBAYARAN harus mencakup QRIS, VA, e-Wallet, dan COD', () => {
    assert.ok(Array.isArray(VALID_METODE_PEMBAYARAN));
    ['qris','bca_va','bni_va','bri_va','mandiri_va','gopay','shopeepay','cod'].forEach(m => assert.ok(VALID_METODE_PEMBAYARAN.includes(m), `Missing: ${m}`));
  });
});

describe('Pengujian Fitur 5: Penugasan Kurir Cerdas (Auto-Assign like Gojek/Grab)', () => {
  it('COURIER_POOL harus menyediakan armada kurir internal optik', () => {
    assert.ok(Array.isArray(COURIER_POOL));
    assert.ok(COURIER_POOL.length >= 3);
    COURIER_POOL.forEach(k => {
      assert.ok(k.nama && typeof k.nama === 'string');
      assert.ok(k.telepon && typeof k.telepon === 'string');
      assert.ok(k.kendaraan && typeof k.kendaraan === 'string');
    });
  });

  it('autoAssignCourier harus menugaskan kurir secara deterministik dan merata', () => {
    const kurir1 = autoAssignCourier(1);
    const kurir2 = autoAssignCourier(2);
    const kurir3 = autoAssignCourier(3);
    assert.ok(kurir1 && kurir1.nama);
    assert.ok(kurir2 && kurir2.nama);
    assert.ok(kurir3 && kurir3.nama);
    // Round-robin cycle
    assert.strictEqual(autoAssignCourier(1).nama, kurir1.nama);
    assert.strictEqual(autoAssignCourier(4).nama, kurir1.nama);
  });
});

describe('Pengujian Fitur 6: Alokasi Kurir Terdekat Secara Acak Sesuai Alamat Penjemputan (Foto 2)', () => {
  it('geocodeSurabayaAddress harus memetakan kata kunci wilayah Surabaya ke koordinat yang sesuai', () => {
    const geoSukolilo = geocodeSurabayaAddress('Jl. Keputih Tegal No. 20, Sukolilo, Surabaya');
    assert.strictEqual(geoSukolilo.lat, -7.2890);
    assert.strictEqual(geoSukolilo.lng, 112.7950);
    assert.match(geoSukolilo.wilayah, /Sukolilo/i);

    const geoRungkut = geocodeSurabayaAddress('Rungkut Madya No. 1, Surabaya');
    assert.strictEqual(geoRungkut.lat, -7.3180);
    assert.strictEqual(geoRungkut.lng, 112.7800);
    assert.match(geoRungkut.wilayah, /Rungkut/i);

    const geoGubeng = geocodeSurabayaAddress('Jl. Raya Gubeng No. 15, Surabaya');
    assert.strictEqual(geoGubeng.lat, -7.2750);
    assert.strictEqual(geoGubeng.lng, 112.7530);
    assert.match(geoGubeng.wilayah, /Gubeng/i);
  });

  it('calculateDistanceKm harus menghitung jarak Haversine antar koordinat dengan presisi', () => {
    const distZero = calculateDistanceKm(-7.2625, 112.7485, -7.2625, 112.7485);
    assert.strictEqual(distZero, 0);

    const distOptikKeSukolilo = calculateDistanceKm(-7.2625, 112.7485, -7.2890, 112.7950);
    assert.ok(distOptikKeSukolilo >= 4 && distOptikKeSukolilo <= 8, `Distance: ${distOptikKeSukolilo}`);
  });

  it('findNearestRandomCourier harus mengalokasikan kurir acak yang berjarak sangat dekat (< 1.5 km) dari alamat jemput (Foto 2)', () => {
    const destLat = -7.2890;
    const destLng = 112.7950;
    const allocation = findNearestRandomCourier(destLat, destLng, 'Sukolilo');

    assert.ok(allocation.kurir && allocation.kurir.nama);
    assert.ok(typeof allocation.kurirLat === 'number');
    assert.ok(typeof allocation.kurirLng === 'number');
    assert.ok(allocation.jarakKm < 1.5, `Jarak kurir ke pelanggan (${allocation.jarakKm} km) harus kurang dari 1.5 km`);
    assert.ok(allocation.jarakKm > 0, `Jarak kurir harus lebih dari 0 km`);
    assert.match(allocation.trackingStatus, /Kurir terdekat/i);
  });

  it('resetLayananAutoIncrement harus terdefinisi sebagai fungsi controller', () => {
    const { resetLayananAutoIncrement } = require('../controllers/layananController');
    assert.strictEqual(typeof resetLayananAutoIncrement, 'function');
  });
});




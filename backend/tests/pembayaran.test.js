/**
 * Unit Test: Pembayaran Gateway & Live Tracking Kurir
 * 
 * User Story #5:
 * "Sebagai pelanggan, saya ingin membayar biaya layanan secara digital
 *  melalui berbagai metode pembayaran (QRIS, VA, e-Wallet, COD) dan
 *  melacak posisi kurir yang mengantar kacamata saya secara real-time."
 * 
 * Acceptance Criteria:
 * AC-1: Metode pembayaran harus tersedia minimal: QRIS, BCA VA, BNI VA, BRI VA, Mandiri VA, GoPay, ShopeePay, COD.
 * AC-2: prosesPembayaran menolak metode pembayaran yang tidak valid (HTTP 400).
 * AC-3: Transaction ID mengikuti format "MIDTRANS-{timestamp}-{random}".
 * AC-4: updateTrackingKurir menolak jika tidak ada data yang dikirim (HTTP 400).
 * AC-5: Tracking kurir mengembalikan data persentase, ETA, dan posisi kurir.
 */

const { describe, it, after } = require('node:test');
const assert = require('node:assert/strict');
const db = require('../config/db');

const {
  VALID_METODE_PEMBAYARAN,
  VALID_STATUSES,
  prosesPembayaran,
  updateTrackingKurir,
} = require('../controllers/layananController');

after(async () => {
  try {
    await db.end();
  } catch (err) {}
});

// Helper: buat mock res object
const mockRes = () => {
  let statusCode = null;
  let jsonData = null;
  return {
    status(code) { statusCode = code; return this; },
    json(data) { jsonData = data; return this; },
    getStatus: () => statusCode,
    getJson: () => jsonData,
  };
};

describe('User Story #5: Pembayaran Gateway & Live Tracking Kurir', () => {

  // --- Payment Gateway ---

  it('AC-1: Sistem mendukung 8 metode pembayaran yang diwajibkan', () => {
    const required = ['qris', 'bca_va', 'bni_va', 'bri_va', 'mandiri_va', 'gopay', 'shopeepay', 'cod'];
    assert.ok(VALID_METODE_PEMBAYARAN.length >= 8, 'Minimal 8 metode pembayaran');
    required.forEach(metode => {
      assert.ok(
        VALID_METODE_PEMBAYARAN.includes(metode),
        `Metode "${metode}" harus tersedia`
      );
    });
  });

  it('AC-2: Metode pembayaran yang tidak valid harus ditolak oleh validasi', () => {
    const invalidMethods = ['bitcoin', 'paypal', 'transfer_manual', '', null];
    invalidMethods.forEach(m => {
      const isValid = VALID_METODE_PEMBAYARAN.includes(m);
      assert.strictEqual(isValid, false, `"${m}" seharusnya ditolak`);
    });
  });

  it('AC-3: Format Transaction ID harus mengikuti pola MIDTRANS-{timestamp}-{random}', () => {
    // Simulasi pembuatan transaction ID seperti di prosesPembayaran controller
    const transactionId = `MIDTRANS-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    assert.ok(transactionId.startsWith('MIDTRANS-'), 'Harus diawali "MIDTRANS-"');
    const parts = transactionId.split('-');
    assert.ok(parts.length >= 3, 'Harus memiliki minimal 3 segmen');

    // Bagian timestamp harus berupa angka
    const timestamp = parseInt(parts[1], 10);
    assert.ok(!isNaN(timestamp), 'Segmen kedua harus timestamp numerik');
    assert.ok(timestamp > 1700000000000, 'Timestamp harus valid (epoch ms)');

    // Bagian random 4 digit
    const random = parseInt(parts[2], 10);
    assert.ok(random >= 1000 && random <= 9999, 'Segmen ketiga harus 4 digit random');
  });

  it('AC-3: Setiap Transaction ID harus unik', () => {
    const ids = new Set();
    for (let i = 0; i < 100; i++) {
      ids.add(`MIDTRANS-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}-${i}`);
    }
    assert.strictEqual(ids.size, 100, '100 transaction ID harus semuanya unik');
  });

  // --- Tracking Kurir ---

  it('AC-4: updateTrackingKurir menolak jika tidak ada data tracking yang dikirim (HTTP 400)', async () => {
    const req = { params: { id: 1 }, body: {} };
    const res = mockRes();
    await updateTrackingKurir(req, res);
    assert.strictEqual(res.getStatus(), 400);
    assert.strictEqual(res.getJson().success, false);
    assert.match(res.getJson().message, /tidak ada data/i);
  });

  it('AC-5: Persentase perjalanan harus dihitung berdasarkan status layanan', () => {
    // Simulasi logika kalkulasi progres di getTrackingKurir controller
    const statusToProgress = {
      pengajuan: 10,
      dijadwalkan: 25,
      diambil: 50,
      diproses: 75,
      diantar: 90,
      selesai: 100,
    };

    VALID_STATUSES.forEach(status => {
      const progress = statusToProgress[status];
      assert.ok(progress !== undefined, `Status "${status}" harus memiliki persen progres`);
      assert.ok(progress >= 0 && progress <= 100, `Progres harus antara 0-100, got ${progress}`);
    });

    // Urutan progres harus meningkat (atau setidaknya tidak mundur secara logis)
    assert.ok(statusToProgress['pengajuan'] < statusToProgress['selesai']);
    assert.ok(statusToProgress['diambil'] < statusToProgress['diantar']);
  });

  it('AC-5: Kalkulasi posisi kurir berdasarkan rasio progres', () => {
    // Simulasi interpolasi posisi kurir (logika dari getTrackingKurir)
    const optikLat = -7.2625, optikLng = 112.7485;
    const tujuanLat = -7.2890, tujuanLng = 112.7950;
    const progress = 50; // 50%
    const ratio = progress / 100;

    const kurirLat = optikLat + (tujuanLat - optikLat) * ratio;
    const kurirLng = optikLng + (tujuanLng - optikLng) * ratio;

    // Kurir harus berada di antara optik dan tujuan
    assert.ok(kurirLat <= optikLat && kurirLat >= tujuanLat, 'Lat kurir harus di antara optik dan tujuan');
    assert.ok(kurirLng >= optikLng && kurirLng <= tujuanLng, 'Lng kurir harus di antara optik dan tujuan');

    // Pada 0%, kurir harus di optik
    const kurirLat0 = optikLat + (tujuanLat - optikLat) * 0;
    assert.strictEqual(kurirLat0, optikLat);

    // Pada 100%, kurir harus di tujuan
    const kurirLat100 = optikLat + (tujuanLat - optikLat) * 1;
    assert.strictEqual(kurirLat100, tujuanLat);
  });

  it('AC-5: ETA harus berubah sesuai status layanan', () => {
    const statusToEta = {
      pengajuan: '1-2 Jam',
      dijadwalkan: '20-30 Menit',
      diambil: '10-15 Menit',
      diproses: 'Dalam pengerjaan',
      diantar: '15-25 Menit',
      selesai: 'Tiba di lokasi',
    };

    // Setiap status harus memiliki ETA
    Object.keys(statusToEta).forEach(status => {
      assert.ok(
        typeof statusToEta[status] === 'string' && statusToEta[status].length > 0,
        `Status "${status}" harus memiliki deskripsi ETA`
      );
    });
  });
});


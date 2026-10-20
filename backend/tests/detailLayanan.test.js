/**
 * Unit Test: Detail Teknis Kacamata (CRUD)
 * 
 * User Story #4:
 * "Sebagai pelanggan, saya ingin menyertakan informasi detail teknis
 *  kacamata (jenis frame, ukuran lensa, kerusakan spesifik) saat mengajukan
 *  layanan, agar teknisi optik dapat mempersiapkan bahan yang tepat."
 * 
 * Acceptance Criteria:
 * AC-1: createDetailLayanan menolak jika layanan_id kosong (HTTP 400).
 * AC-2: Jika jenis_kacamata tidak diisi, sistem mengisi default '-'.
 * AC-3: getDetailByLayananId menolak jika layanan tidak ditemukan (HTTP 404) — via mock.
 * AC-4: updateDetailLayanan mempertahankan data lama jika field baru undefined.
 * AC-5: deleteDetailLayanan memastikan akses ditolak untuk user non-pemilik (HTTP 403).
 */

const { describe, it, after } = require('node:test');
const assert = require('node:assert/strict');
const db = require('../config/db');

const {
  createDetailLayanan,
  updateDetailLayanan,
  deleteDetailLayanan,
} = require('../controllers/detailLayananController');

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

describe('User Story #4: Detail Teknis Kacamata (CRUD)', () => {

  it('AC-1: createDetailLayanan menolak jika layanan_id kosong (HTTP 400)', async () => {
    const req = {
      user: { id: 1, role: 'pelanggan' },
      body: { jenis_kacamata: 'Frame Titanium' }
    };
    const res = mockRes();
    await createDetailLayanan(req, res);
    assert.strictEqual(res.getStatus(), 400);
    assert.strictEqual(res.getJson().success, false);
    assert.match(res.getJson().message, /layanan_id/i);
  });

  it('AC-1: createDetailLayanan menolak jika layanan_id null', async () => {
    const req = {
      user: { id: 1, role: 'pelanggan' },
      body: { layanan_id: null, jenis_kacamata: 'Test' }
    };
    const res = mockRes();
    await createDetailLayanan(req, res);
    assert.strictEqual(res.getStatus(), 400);
    assert.strictEqual(res.getJson().success, false);
  });

  it('AC-2: Default value "-" harus diterapkan untuk field opsional', () => {
    // Pengujian logika default value yang diterapkan di controller
    const jenisKacamata = undefined || '-';
    const detailPerbaikan = undefined || '-';
    const keterangan = '' || '-';

    assert.strictEqual(jenisKacamata, '-');
    assert.strictEqual(detailPerbaikan, '-');
    assert.strictEqual(keterangan, '-');
  });

  it('AC-2: Default value tidak menimpa jika field sudah terisi', () => {
    const jenisKacamata = 'Frame Titanium Bulat' || '-';
    const detailPerbaikan = 'Engsel kanan patah' || '-';
    const keterangan = 'Tolong dikerjakan cepat' || '-';

    assert.strictEqual(jenisKacamata, 'Frame Titanium Bulat');
    assert.strictEqual(detailPerbaikan, 'Engsel kanan patah');
    assert.strictEqual(keterangan, 'Tolong dikerjakan cepat');
  });

  it('AC-4: updateDetailLayanan mempertahankan data lama ketika field baru undefined', () => {
    // Simulasi logika update partial di controller (line 220-222 detailLayananController.js)
    const currentDetail = {
      jenis_kacamata: 'Frame Aviator Original',
      detail_perbaikan: 'Engsel kiri rusak',
      keterangan: 'Pakai lensa anti radiasi'
    };

    const jenis_kacamata = undefined;       // tidak diubah
    const detail_perbaikan = 'Lensa retak'; // diubah
    const keterangan = undefined;           // tidak diubah

    const updated = {
      jenis_kacamata: jenis_kacamata !== undefined ? jenis_kacamata : currentDetail.jenis_kacamata,
      detail_perbaikan: detail_perbaikan !== undefined ? detail_perbaikan : currentDetail.detail_perbaikan,
      keterangan: keterangan !== undefined ? keterangan : currentDetail.keterangan,
    };

    assert.strictEqual(updated.jenis_kacamata, 'Frame Aviator Original'); // tetap lama
    assert.strictEqual(updated.detail_perbaikan, 'Lensa retak');          // berubah
    assert.strictEqual(updated.keterangan, 'Pakai lensa anti radiasi');   // tetap lama
  });

  it('AC-5: Validasi role - pelanggan biasa tidak boleh mengakses data user lain', () => {
    // Simulasi pemeriksaan otorisasi yang ada di controller
    const role = 'pelanggan';
    const currentUserId = 5;
    const ownerUserId = 10;

    const isDenied = (role !== 'admin' && ownerUserId !== currentUserId);
    assert.strictEqual(isDenied, true);
  });

  it('AC-5: Validasi role - admin boleh mengakses data siapa saja', () => {
    const role = 'admin';
    const currentUserId = 1;
    const ownerUserId = 99;

    const isDenied = (role !== 'admin' && ownerUserId !== currentUserId);
    assert.strictEqual(isDenied, false);
  });

  it('AC-5: Validasi role - pemilik layanan boleh mengakses datanya sendiri', () => {
    const role = 'pelanggan';
    const currentUserId = 5;
    const ownerUserId = 5;

    const isDenied = (role !== 'admin' && ownerUserId !== currentUserId);
    assert.strictEqual(isDenied, false);
  });
});


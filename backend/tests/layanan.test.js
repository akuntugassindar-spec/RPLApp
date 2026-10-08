/**
 * Unit Testing - Fitur Layanan & Notifikasi
 * Menggunakan Node.js Native Test Runner (node:test & node:assert)
 * 
 * Cakupan Pengujian:
 * 1. Validasi enum jenis layanan (perbaikan, penggantian_lensa, perbaikan_dan_lensa)
 * 2. Validasi status alur layanan (pengajuan -> dijadwalkan -> diambil -> diproses -> selesai -> diantar)
 * 3. Logika validasi input pengajuan layanan baru (mandatory field checking)
 * 4. Logika validasi jenis layanan saat pembuatan pengajuan baru
 * 5. Logika validasi pembaruan status layanan
 * 6. Logika pemformatan notifikasi WhatsApp Mock
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
  VALID_STATUSES,
  VALID_JENIS_LAYANAN,
  sendWANotification,
  createLayanan,
  updateStatusLayanan
} = require('../controllers/layananController');

describe('Pengujian Fitur 1: Manajemen & Validasi Layanan (Service Management)', () => {

  it('Harus memiliki seluruh jenis layanan yang didukung sistem (termasuk perbaikan_dan_lensa)', () => {
    assert.ok(Array.isArray(VALID_JENIS_LAYANAN));
    assert.strictEqual(VALID_JENIS_LAYANAN.includes('perbaikan'), true);
    assert.strictEqual(VALID_JENIS_LAYANAN.includes('penggantian_lensa'), true);
    assert.strictEqual(VALID_JENIS_LAYANAN.includes('perbaikan_dan_lensa'), true);
    assert.strictEqual(VALID_JENIS_LAYANAN.length, 3);
  });

  it('Harus memiliki 6 alur status layanan yang valid', () => {
    const expectedStatuses = [
      'pengajuan',
      'dijadwalkan',
      'diambil',
      'diproses',
      'selesai',
      'diantar'
    ];
    assert.deepStrictEqual(VALID_STATUSES, expectedStatuses);
  });

  it('createLayanan harus menolak jika field wajib kosong (HTTP 400)', async () => {
    let statusCode = null;
    let jsonResponse = null;

    const req = {
      user: { id: 8, nama: 'User Test', role: 'pelanggan' },
      body: {
        // jenis_layanan dikosongkan
        keluhan: 'Gagang patah'
      }
    };
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        jsonResponse = data;
        return this;
      }
    };

    await createLayanan(req, res);
    assert.strictEqual(statusCode, 400);
    assert.strictEqual(jsonResponse.success, false);
    assert.match(jsonResponse.message, /wajib diisi/i);
  });

  it('createLayanan harus menolak jika jenis_layanan tidak valid (HTTP 400)', async () => {
    let statusCode = null;
    let jsonResponse = null;

    const req = {
      user: { id: 8, nama: 'User Test', role: 'pelanggan' },
      body: {
        jenis_layanan: 'beli_baru_gratis', // Tidak terdaftar
        keluhan: 'Ingin kacamata baru',
        alamat: 'Jl. Merdeka No 1',
        tanggal_jemput: '2026-10-10',
        jam_jemput: '10:00'
      }
    };
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        jsonResponse = data;
        return this;
      }
    };

    await createLayanan(req, res);
    assert.strictEqual(statusCode, 400);
    assert.strictEqual(jsonResponse.success, false);
    assert.match(jsonResponse.message, /Jenis layanan tidak valid/i);
  });

  it('updateStatusLayanan harus menolak jika status kosong (HTTP 400)', async () => {
    let statusCode = null;
    let jsonResponse = null;

    const req = {
      params: { id: 10 },
      body: {}
    };
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        jsonResponse = data;
        return this;
      }
    };

    await updateStatusLayanan(req, res);
    assert.strictEqual(statusCode, 400);
    assert.strictEqual(jsonResponse.success, false);
    assert.match(jsonResponse.message, /Status baru wajib disertakan/i);
  });

  it('updateStatusLayanan harus menolak jika status baru tidak ada dalam daftar valid (HTTP 400)', async () => {
    let statusCode = null;
    let jsonResponse = null;

    const req = {
      params: { id: 10 },
      body: {
        status: 'status_tidak_dikenal'
      }
    };
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        jsonResponse = data;
        return this;
      }
    };

    await updateStatusLayanan(req, res);
    assert.strictEqual(statusCode, 400);
    assert.strictEqual(jsonResponse.success, false);
    assert.match(jsonResponse.message, /Status tidak valid/i);
  });
});

describe('Pengujian Fitur 2: Notifikasi Otomatis (Email & WhatsApp Mock)', () => {

  it('sendWANotification harus mengeksekusi format log WhatsApp dengan status uppercase', async () => {
    const logs = [];
    const originalLog = console.log;
    console.log = (...args) => logs.push(args.join(' '));

    try {
      await sendWANotification('081234567890', 'Budi', 'selesai');
      
      const allOutput = logs.join('\n');
      assert.ok(allOutput.includes('[WhatsApp Mock] MENGIRIM PESAN WA KE PELANGGAN'));
      assert.ok(allOutput.includes('081234567890'));
      assert.ok(allOutput.includes('*SELESAI*'));
      assert.ok(allOutput.includes('TERKIRIM (Mock)'));
    } finally {
      console.log = originalLog;
    }
  });

  it('sendWANotification harus dapat menangani jika no telepon pelanggan kosong', async () => {
    const logs = [];
    const originalLog = console.log;
    console.log = (...args) => logs.push(args.join(' '));

    try {
      await sendWANotification(null, 'Ani', 'diantar');
      const allOutput = logs.join('\n');
      assert.ok(allOutput.includes('Kepada  : - (Ani)'));
      assert.ok(allOutput.includes('*DIANTAR*'));
    } finally {
      console.log = originalLog;
    }
  });
});

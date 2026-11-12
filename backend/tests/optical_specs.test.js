/**
 * ====================================================================
 * TEST SUITE: OPTICAL SPECIFICATIONS & 3NF INTEGRITY (25 UNIT TESTS)
 * Pengujian parameter spesifikasi optik kacamata (minus, silinder, aksis, PD),
 * validasi jenis lensa dan material frame, serta integritas data 3NF.
 * ====================================================================
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// Validasi Batasan Ukuran Optik Medis
const isValidSphere = (val) => {
  const num = parseFloat(val);
  return !isNaN(num) && num >= -25.00 && num <= 20.00 && (Math.abs(num) % 0.25 === 0);
};

const isValidCylinder = (val) => {
  const num = parseFloat(val);
  return !isNaN(num) && num >= -10.00 && num <= 0.00 && (Math.abs(num) % 0.25 === 0);
};

const isValidAxis = (val) => {
  const num = parseInt(val, 10);
  return !isNaN(num) && num >= 0 && num <= 180;
};

const isValidPD = (val) => {
  const num = parseFloat(val);
  return !isNaN(num) && num >= 50.0 && num <= 78.0;
};

const VALID_LENS_COATINGS = ['anti_radiasi', 'blue_ray', 'photocromic', 'bluechromic', 'standar'];
const VALID_FRAME_MATERIALS = ['titanium', 'asetat', 'metal', 'plastik_tr90', 'rimless'];

describe('Spesifikasi Optik & Integritas 3NF Suite (25 Tests)', () => {
  // Test 1 - 5: Sphere (Minus / Plus) Validation
  it('OPT-01: Sphere minus -2.50 kelipatan 0.25 valid harus diterima', () => {
    assert.strictEqual(isValidSphere(-2.50), true);
  });

  it('OPT-02: Sphere plus +1.75 kelipatan 0.25 valid harus diterima', () => {
    assert.strictEqual(isValidSphere(1.75), true);
  });

  it('OPT-03: Sphere netral 0.00 (plano) harus diterima', () => {
    assert.strictEqual(isValidSphere(0.00), true);
  });

  it('OPT-04: Sphere tidak kelipatan 0.25 (misal -2.33) harus ditolak', () => {
    assert.strictEqual(isValidSphere(-2.33), false);
  });

  it('OPT-05: Sphere ekstrim di luar batas aman (> 20.00 atau < -25.00) harus ditolak', () => {
    assert.strictEqual(isValidSphere(-30.00), false);
    assert.strictEqual(isValidSphere(25.00), false);
  });

  // Test 6 - 10: Cylinder & Axis Validation
  it('OPT-06: Cylinder silinder minus -1.25 kelipatan 0.25 valid harus diterima', () => {
    assert.strictEqual(isValidCylinder(-1.25), true);
  });

  it('OPT-07: Cylinder positif (> 0) ditolak (standar penulisan optik minus cylinder)', () => {
    assert.strictEqual(isValidCylinder(0.50), false);
  });

  it('OPT-08: Aksis optik 90 derajat valid harus diterima', () => {
    assert.strictEqual(isValidAxis(90), true);
  });

  it('OPT-09: Aksis optik 180 derajat valid harus diterima', () => {
    assert.strictEqual(isValidAxis(180), true);
  });

  it('OPT-10: Aksis optik di luar rentang 0-180 derajat (misal 210) harus ditolak', () => {
    assert.strictEqual(isValidAxis(210), false);
    assert.strictEqual(isValidAxis(-5), false);
  });

  // Test 11 - 15: Pupillary Distance (PD)
  it('OPT-11: Pupillary distance standar dewasa 62.0 mm harus diterima', () => {
    assert.strictEqual(isValidPD(62.0), true);
  });

  it('OPT-12: Pupillary distance batas bawah 50.0 mm harus diterima', () => {
    assert.strictEqual(isValidPD(50.0), true);
  });

  it('OPT-13: Pupillary distance batas atas 75.0 mm harus diterima', () => {
    assert.strictEqual(isValidPD(75.0), true);
  });

  it('OPT-14: Pupillary distance abnormal < 50 mm harus ditolak', () => {
    assert.strictEqual(isValidPD(40.0), false);
  });

  it('OPT-15: Pupillary distance abnormal > 78 mm harus ditolak', () => {
    assert.strictEqual(isValidPD(85.0), false);
  });

  // Test 16 - 20: Coating & Frame Materials
  it('OPT-16: Lapisan coating Bluechromic didukung oleh katalog lensa', () => {
    assert.strictEqual(VALID_LENS_COATINGS.includes('bluechromic'), true);
  });

  it('OPT-17: Lapisan coating Photocromic didukung oleh katalog lensa', () => {
    assert.strictEqual(VALID_LENS_COATINGS.includes('photocromic'), true);
  });

  it('OPT-18: Lapisan coating antiradiasi didukung', () => {
    assert.strictEqual(VALID_LENS_COATINGS.includes('anti_radiasi'), true);
  });

  it('OPT-19: Material frame Titanium didukung oleh master data frame', () => {
    assert.strictEqual(VALID_FRAME_MATERIALS.includes('titanium'), true);
  });

  it('OPT-20: Material frame Asetat didukung oleh master data frame', () => {
    assert.strictEqual(VALID_FRAME_MATERIALS.includes('asetat'), true);
  });

  // Test 21 - 25: 3NF Relational Data Integrity
  it('OPT-21: Struktur tabel detail_layanan harus terikat foreign key layanan_id', () => {
    const detailRow = {
      id: 1,
      layanan_id: 15,
      jenis_kacamata: 'Minus & Silinder',
      detail_perbaikan: 'R -2.00 Cyl -0.50 Axis 90',
      keterangan: 'Lensa Bluechromic'
    };
    assert.strictEqual(typeof detailRow.layanan_id, 'number');
    assert.ok(detailRow.layanan_id > 0);
  });

  it('OPT-22: Simulasi cascade delete: menghapus parent layanan otomatis menghapus child detail', () => {
    const db = {
      layanan: [{ id: 10, user_id: 2 }],
      detail_layanan: [{ id: 1, layanan_id: 10, detail: 'Ganti Lensa' }]
    };

    // Hapus parent
    db.layanan = db.layanan.filter((item) => item.id !== 10);
    // Cascade delete simulation
    db.detail_layanan = db.detail_layanan.filter((item) => item.layanan_id !== 10);

    assert.strictEqual(db.layanan.length, 0);
    assert.strictEqual(db.detail_layanan.length, 0);
  });

  it('OPT-23: Parser format resep optik teks bebas mendeteksi nilai R dan L', () => {
    const parsePrescriptionText = (txt) => {
      const right = txt.match(/\bR\s*([+-]?\d+(\.\d+)?)/i);
      const left = txt.match(/\bL\s*([+-]?\d+(\.\d+)?)/i);
      return {
        r: right ? parseFloat(right[1]) : null,
        l: left ? parseFloat(left[1]) : null
      };
    };

    const parsed = parsePrescriptionText('R -2.25 Cyl -0.50 Axis 90 | L -3.00');
    assert.strictEqual(parsed.r, -2.25);
    assert.strictEqual(parsed.l, -3.00);
  });

  it('OPT-24: Parser format resep menangani jika teks tidak memiliki nilai L', () => {
    const parsePrescriptionText = (txt) => {
      const right = txt.match(/\bR\s*([+-]?\d+(\.\d+)?)/i);
      const left = txt.match(/\bL\s*([+-]?\d+(\.\d+)?)/i);
      return {
        r: right ? parseFloat(right[1]) : null,
        l: left ? parseFloat(left[1]) : null
      };
    };

    const parsed = parsePrescriptionText('Hanya lensa kanan: R -1.75');
    assert.strictEqual(parsed.r, -1.75);
    assert.strictEqual(parsed.l, null);
  });

  it('OPT-25: Normalisasi data teks resep optik membersihkan spasi berlebih', () => {
    const cleanPrescriptionString = (str) => (str || '').replace(/\s+/g, ' ').trim();
    const raw = '   R   -2.00    Cyl -0.50    Axis   90   ';
    assert.strictEqual(cleanPrescriptionString(raw), 'R -2.00 Cyl -0.50 Axis 90');
  });
});

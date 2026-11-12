/**
 * ====================================================================
 * TEST SUITE: STATE MACHINE LIFECYCLE (25 UNIT TESTS)
 * Pengujian transisi status deterministik 6 tahapan layanan kacamata,
 * pencegahan mutasi status ilegal, validasi audit trail, dan idempoten.
 * ====================================================================
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// Definisi State Machine 6 Tahapan Operasional
const LIFECYCLE_STAGES = ['pengajuan', 'dijadwalkan', 'diambil', 'diproses', 'diantar', 'selesai'];

// Matriks Transisi Legal
const VALID_TRANSITIONS = {
  pengajuan: ['dijadwalkan'],
  dijadwalkan: ['diambil'],
  diambil: ['diproses'],
  diproses: ['diantar'],
  diantar: ['selesai'],
  selesai: [] // Terminal state: tidak dapat berubah lagi
};

const isValidTransition = (currentStatus, nextStatus) => {
  if (!VALID_TRANSITIONS[currentStatus]) return false;
  return VALID_TRANSITIONS[currentStatus].includes(nextStatus);
};

const canCancel = (status) => {
  // Pembatalan hanya diizinkan sebelum kacamata diambil kurir
  return status === 'pengajuan' || status === 'dijadwalkan';
};

describe('State Machine 6 Tahapan Lifecycle Suite (25 Tests)', () => {
  // Test 1 - 5: Legal Linear Transitions
  it('SM-01: Transisi sah: pengajuan -> dijadwalkan', () => {
    assert.strictEqual(isValidTransition('pengajuan', 'dijadwalkan'), true);
  });

  it('SM-02: Transisi sah: dijadwalkan -> diambil', () => {
    assert.strictEqual(isValidTransition('dijadwalkan', 'diambil'), true);
  });

  it('SM-03: Transisi sah: diambil -> diproses', () => {
    assert.strictEqual(isValidTransition('diambil', 'diproses'), true);
  });

  it('SM-04: Transisi sah: diproses -> diantar', () => {
    assert.strictEqual(isValidTransition('diproses', 'diantar'), true);
  });

  it('SM-05: Transisi sah: diantar -> selesai', () => {
    assert.strictEqual(isValidTransition('diantar', 'selesai'), true);
  });

  // Test 6 - 10: Illegal Skip Transitions
  it('SM-06: Transisi ilegal: pengajuan melompat langsung ke diambil (ditolak)', () => {
    assert.strictEqual(isValidTransition('pengajuan', 'diambil'), false);
  });

  it('SM-07: Transisi ilegal: pengajuan melompat langsung ke diproses (ditolak)', () => {
    assert.strictEqual(isValidTransition('pengajuan', 'diproses'), false);
  });

  it('SM-08: Transisi ilegal: pengajuan melompat langsung ke selesai (ditolak)', () => {
    assert.strictEqual(isValidTransition('pengajuan', 'selesai'), false);
  });

  it('SM-09: Transisi ilegal: dijadwalkan melompat langsung ke diantar (ditolak)', () => {
    assert.strictEqual(isValidTransition('dijadwalkan', 'diantar'), false);
  });

  it('SM-10: Transisi ilegal: diambil melompat langsung ke selesai (ditolak)', () => {
    assert.strictEqual(isValidTransition('diambil', 'selesai'), false);
  });

  // Test 11 - 15: Backward Transitions (Reversals)
  it('SM-11: Transisi mundur: dijadwalkan kembali ke pengajuan (ditolak)', () => {
    assert.strictEqual(isValidTransition('dijadwalkan', 'pengajuan'), false);
  });

  it('SM-12: Transisi mundur: diambil kembali ke dijadwalkan (ditolak)', () => {
    assert.strictEqual(isValidTransition('diambil', 'dijadwalkan'), false);
  });

  it('SM-13: Transisi mundur: diproses kembali ke diambil (ditolak)', () => {
    assert.strictEqual(isValidTransition('diproses', 'diambil'), false);
  });

  it('SM-14: Transisi mundur: diantar kembali ke diproses (ditolak)', () => {
    assert.strictEqual(isValidTransition('diantar', 'diproses'), false);
  });

  it('SM-15: Transisi mundur: selesai kembali ke status apapun (ditolak)', () => {
    assert.strictEqual(isValidTransition('selesai', 'diantar'), false);
    assert.strictEqual(isValidTransition('selesai', 'pengajuan'), false);
  });

  // Test 16 - 20: Self-Transitions / Idempotency
  it('SM-16: Transisi ke status yang sama (pengajuan -> pengajuan) ditolak', () => {
    assert.strictEqual(isValidTransition('pengajuan', 'pengajuan'), false);
  });

  it('SM-17: Transisi ke status yang sama (diproses -> diproses) ditolak', () => {
    assert.strictEqual(isValidTransition('diproses', 'diproses'), false);
  });

  it('SM-18: Status yang tidak dikenal (unknown_status) harus ditolak', () => {
    assert.strictEqual(isValidTransition('unknown_status', 'dijadwalkan'), false);
    assert.strictEqual(isValidTransition('pengajuan', 'unknown_status'), false);
  });

  it('SM-19: Input status null atau undefined harus ditolak secara aman', () => {
    assert.strictEqual(isValidTransition(null, 'dijadwalkan'), false);
    assert.strictEqual(isValidTransition('pengajuan', undefined), false);
  });

  it('SM-20: Pembatalan pesanan diizinkan saat status pengajuan', () => {
    assert.strictEqual(canCancel('pengajuan'), true);
  });

  // Test 21 - 25: Business Rules & Audit Trail
  it('SM-21: Pembatalan pesanan diizinkan saat status dijadwalkan', () => {
    assert.strictEqual(canCancel('dijadwalkan'), true);
  });

  it('SM-22: Pembatalan pesanan ditolak jika kacamata sudah diambil kurir', () => {
    assert.strictEqual(canCancel('diambil'), false);
    assert.strictEqual(canCancel('diproses'), false);
    assert.strictEqual(canCancel('diantar'), false);
  });

  it('SM-23: Status selesai adalah terminal state dan panjang transisi keluar adalah 0', () => {
    assert.strictEqual(VALID_TRANSITIONS['selesai'].length, 0);
  });

  it('SM-24: Total tahapan operasional harus tepat 6 siklus hidup', () => {
    assert.strictEqual(LIFECYCLE_STAGES.length, 6);
  });

  it('SM-25: Generator record audit trail harus mencatat stempel waktu dan aktor', () => {
    const createAuditLog = (layananId, oldStatus, newStatus, actor) => ({
      layanan_id: layananId,
      status_sebelum: oldStatus,
      status_sesudah: newStatus,
      diubah_oleh: actor,
      created_at: new Date().toISOString()
    });

    const log = createAuditLog(10, 'pengajuan', 'dijadwalkan', 'Admin Optik');
    assert.strictEqual(log.layanan_id, 10);
    assert.strictEqual(log.status_sebelum, 'pengajuan');
    assert.strictEqual(log.status_sesudah, 'dijadwalkan');
    assert.strictEqual(log.diubah_oleh, 'Admin Optik');
    assert.ok(typeof log.created_at === 'string');
  });
});

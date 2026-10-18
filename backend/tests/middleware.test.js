/**
 * Unit Test: Middleware Otorisasi (JWT & Admin Role)
 * 
 * User Story #3:
 * "Sebagai sistem, saya harus memastikan bahwa hanya pengguna
 *  terautentikasi yang dapat mengakses API, dan hanya admin
 *  yang dapat mengubah status layanan."
 * 
 * Acceptance Criteria:
 * AC-1: Request tanpa header Authorization ditolak (HTTP 401).
 * AC-2: Request dengan format token salah (bukan "Bearer <token>") ditolak (HTTP 401).
 * AC-3: Request dengan token JWT yang tidak valid ditolak (HTTP 401).
 * AC-4: Request dari user dengan role selain 'admin' ditolak adminAuth (HTTP 403).
 * AC-5: Request dari user dengan role 'admin' diteruskan ke handler berikutnya.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

const authMiddleware = require('../middleware/auth');
const adminAuthMiddleware = require('../middleware/adminAuth');

// Helper: buat mock req/res/next
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

const SECRET = process.env.JWT_SECRET || 'super_secret_jwt_kacamata_key_2026_universitas';

describe('User Story #3: Middleware Otorisasi JWT & Proteksi Admin', () => {

  // --- authMiddleware ---

  it('AC-1: authMiddleware menolak request tanpa header Authorization (HTTP 401)', () => {
    const req = { headers: {} };
    const res = mockRes();
    let nextCalled = false;
    authMiddleware(req, res, () => { nextCalled = true; });
    assert.strictEqual(res.getStatus(), 401);
    assert.strictEqual(res.getJson().success, false);
    assert.match(res.getJson().message, /token/i);
    assert.strictEqual(nextCalled, false);
  });

  it('AC-2: authMiddleware menolak jika format bukan "Bearer <token>" (HTTP 401)', () => {
    const req = { headers: { authorization: 'Basic abc123' } };
    const res = mockRes();
    let nextCalled = false;
    authMiddleware(req, res, () => { nextCalled = true; });
    assert.strictEqual(res.getStatus(), 401);
    assert.match(res.getJson().message, /format/i);
    assert.strictEqual(nextCalled, false);
  });

  it('AC-2: authMiddleware menolak jika hanya token tanpa prefix Bearer (HTTP 401)', () => {
    const req = { headers: { authorization: 'tokenacak123' } };
    const res = mockRes();
    let nextCalled = false;
    authMiddleware(req, res, () => { nextCalled = true; });
    assert.strictEqual(res.getStatus(), 401);
    assert.strictEqual(nextCalled, false);
  });

  it('AC-3: authMiddleware menolak token JWT yang tidak valid (HTTP 401)', (_, done) => {
    const req = { headers: { authorization: 'Bearer token.palsu.invalid' } };
    const res = mockRes();
    authMiddleware(req, res, () => {
      done(new Error('next() seharusnya tidak dipanggil'));
    });
    // jwt.verify is async via callback, give it a tick
    setTimeout(() => {
      assert.strictEqual(res.getStatus(), 401);
      assert.match(res.getJson().message, /tidak valid/i);
      done();
    }, 50);
  });

  it('AC-3: authMiddleware meneruskan request jika token JWT valid', (_, done) => {
    const payload = { id: 5, nama: 'Admin', email: 'admin@test.com', role: 'admin' };
    const token = jwt.sign(payload, SECRET, { expiresIn: '1h' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();

    authMiddleware(req, res, () => {
      // next() dipanggil, berarti token valid
      assert.ok(req.user);
      assert.strictEqual(req.user.id, 5);
      assert.strictEqual(req.user.role, 'admin');
      done();
    });
  });

  // --- adminAuthMiddleware ---

  it('AC-4: adminAuthMiddleware menolak user tanpa autentikasi (req.user undefined)', () => {
    const req = {};
    const res = mockRes();
    let nextCalled = false;
    adminAuthMiddleware(req, res, () => { nextCalled = true; });
    assert.strictEqual(res.getStatus(), 401);
    assert.strictEqual(nextCalled, false);
  });

  it('AC-4: adminAuthMiddleware menolak user dengan role pelanggan (HTTP 403)', () => {
    const req = { user: { id: 2, role: 'pelanggan' } };
    const res = mockRes();
    let nextCalled = false;
    adminAuthMiddleware(req, res, () => { nextCalled = true; });
    assert.strictEqual(res.getStatus(), 403);
    assert.match(res.getJson().message, /admin/i);
    assert.strictEqual(nextCalled, false);
  });

  it('AC-5: adminAuthMiddleware meneruskan request jika role admin', () => {
    const req = { user: { id: 1, role: 'admin' } };
    const res = mockRes();
    let nextCalled = false;
    adminAuthMiddleware(req, res, () => { nextCalled = true; });
    assert.strictEqual(nextCalled, true);
  });
});

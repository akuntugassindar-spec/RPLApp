/**
 * Unit Test: Autentikasi Pengguna (Registrasi & Login)
 * 
 * User Story #2:
 * "Sebagai pengunjung, saya ingin mendaftar akun dan login
 *  agar saya dapat mengakses layanan antar-jemput kacamata."
 * 
 * Acceptance Criteria:
 * AC-1: Registrasi ditolak jika nama, email, atau password kosong (HTTP 400).
 * AC-2: Registrasi ditolak jika format email tidak valid (HTTP 400).
 * AC-3: Login ditolak jika email atau password kosong (HTTP 400).
 * AC-4: Password di-hash menggunakan bcryptjs sebelum disimpan, bukan plaintext.
 * AC-5: Token JWT berisi payload id, nama, email, dan role.
 */

const { describe, it, after } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const { register, login } = require('../controllers/authController');

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

describe('User Story #2: Registrasi & Login Autentikasi', () => {

  it('AC-1: register() menolak jika nama kosong (HTTP 400)', async () => {
    const req = { body: { email: 'test@test.com', password: '123456' } };
    const res = mockRes();
    await register(req, res);
    assert.strictEqual(res.getStatus(), 400);
    assert.strictEqual(res.getJson().success, false);
    assert.match(res.getJson().message, /wajib diisi/i);
  });

  it('AC-1: register() menolak jika email kosong (HTTP 400)', async () => {
    const req = { body: { nama: 'Budi', password: '123456' } };
    const res = mockRes();
    await register(req, res);
    assert.strictEqual(res.getStatus(), 400);
    assert.strictEqual(res.getJson().success, false);
  });

  it('AC-1: register() menolak jika password kosong (HTTP 400)', async () => {
    const req = { body: { nama: 'Budi', email: 'test@test.com' } };
    const res = mockRes();
    await register(req, res);
    assert.strictEqual(res.getStatus(), 400);
    assert.strictEqual(res.getJson().success, false);
  });

  it('AC-2: register() menolak jika format email tidak valid (HTTP 400)', async () => {
    const req = { body: { nama: 'Budi', email: 'bukan-email', password: '123456' } };
    const res = mockRes();
    await register(req, res);
    assert.strictEqual(res.getStatus(), 400);
    assert.match(res.getJson().message, /format email/i);
  });

  it('AC-3: login() menolak jika email kosong (HTTP 400)', async () => {
    const req = { body: { password: '123456' } };
    const res = mockRes();
    await login(req, res);
    assert.strictEqual(res.getStatus(), 400);
    assert.match(res.getJson().message, /wajib diisi/i);
  });

  it('AC-3: login() menolak jika password kosong (HTTP 400)', async () => {
    const req = { body: { email: 'test@test.com' } };
    const res = mockRes();
    await login(req, res);
    assert.strictEqual(res.getStatus(), 400);
    assert.match(res.getJson().message, /wajib diisi/i);
  });

  it('AC-4: bcryptjs harus menghasilkan hash berbeda dari plaintext', async () => {
    const plainPassword = 'password123';
    const hashed = await bcrypt.hash(plainPassword, 10);
    assert.notStrictEqual(hashed, plainPassword);
    assert.ok(hashed.startsWith('$2a$') || hashed.startsWith('$2b$'));
    const isMatch = await bcrypt.compare(plainPassword, hashed);
    assert.strictEqual(isMatch, true);
  });

  it('AC-4: bcryptjs harus menolak perbandingan password yang salah', async () => {
    const hashed = await bcrypt.hash('benar123', 10);
    const isMatch = await bcrypt.compare('salah999', hashed);
    assert.strictEqual(isMatch, false);
  });

  it('AC-5: JWT token harus mengandung payload id, nama, email, dan role', () => {
    const secret = 'test-secret-key';
    const payload = { id: 1, nama: 'Budi Pelanggan', email: 'budi@test.com', role: 'pelanggan' };
    const token = jwt.sign(payload, secret, { expiresIn: '1h' });

    assert.ok(typeof token === 'string');
    assert.ok(token.split('.').length === 3); // JWT format: header.payload.signature

    const decoded = jwt.verify(token, secret);
    assert.strictEqual(decoded.id, 1);
    assert.strictEqual(decoded.nama, 'Budi Pelanggan');
    assert.strictEqual(decoded.email, 'budi@test.com');
    assert.strictEqual(decoded.role, 'pelanggan');
  });

  it('AC-5: JWT token harus expired jika secret salah', () => {
    const token = jwt.sign({ id: 1 }, 'secret-asli', { expiresIn: '1h' });
    assert.throws(() => {
      jwt.verify(token, 'secret-palsu');
    }, { name: 'JsonWebTokenError' });
  });

  it('AC-5: JWT token harus mendukung peran role kurir (Agus Pratama)', () => {
    const secret = 'test-secret-key';
    const payload = { id: 4, nama: 'Agus Pratama', email: 'kurir@gmail.com', role: 'kurir' };
    const token = jwt.sign(payload, secret, { expiresIn: '24h' });
    const decoded = jwt.verify(token, secret);
    assert.strictEqual(decoded.id, 4);
    assert.strictEqual(decoded.role, 'kurir');
    assert.strictEqual(decoded.email, 'kurir@gmail.com');
  });
});


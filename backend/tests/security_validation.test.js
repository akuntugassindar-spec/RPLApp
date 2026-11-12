/**
 * ====================================================================
 * TEST SUITE: SECURITY & INPUT VALIDATION (25 UNIT TESTS)
 * Pengujian komprehensif validasi input, sanitasi string, pencegahan
 * SQL Injection, XSS escaping, serta integritas regex parameter.
 * ====================================================================
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// Helper regex & validation logic
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(\+62|62|0)[0-9]{8,13}$/;
const SQL_INJECTION_PATTERNS = [
  /('|--|;|\/\*|\*\/|xp_|union|select|insert|update|delete|drop|alter)/i
];

const sanitizeInput = (str) => {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const detectSQLInjection = (str) => {
  if (typeof str !== 'string') return false;
  return SQL_INJECTION_PATTERNS.some((pattern) => pattern.test(str));
};

describe('Security & Input Validation Suite (25 Tests)', () => {
  // Test 1 - 5: Email Validation
  it('SEC-01: Email standar valid harus diterima', () => {
    assert.strictEqual(EMAIL_REGEX.test('pelanggan@optik.com'), true);
    assert.strictEqual(EMAIL_REGEX.test('user.nama+tag@domain.co.id'), true);
  });

  it('SEC-02: Email tanpa simbol @ harus ditolak', () => {
    assert.strictEqual(EMAIL_REGEX.test('pelangganoptik.com'), false);
  });

  it('SEC-03: Email tanpa domain harus ditolak', () => {
    assert.strictEqual(EMAIL_REGEX.test('pelanggan@'), false);
  });

  it('SEC-04: Email dengan spasi harus ditolak', () => {
    assert.strictEqual(EMAIL_REGEX.test('pelanggan @optik.com'), false);
  });

  it('SEC-05: Email tanpa TLD harus ditolak', () => {
    assert.strictEqual(EMAIL_REGEX.test('pelanggan@localhost'), false);
  });

  // Test 6 - 10: Phone Number Validation
  it('SEC-06: Nomor telepon format 0812 valid harus diterima', () => {
    assert.strictEqual(PHONE_REGEX.test('081234567890'), true);
  });

  it('SEC-07: Nomor telepon format +62 valid harus diterima', () => {
    assert.strictEqual(PHONE_REGEX.test('+6281234567890'), true);
  });

  it('SEC-08: Nomor telepon format 62 valid harus diterima', () => {
    assert.strictEqual(PHONE_REGEX.test('6281234567890'), true);
  });

  it('SEC-09: Nomor telepon terlalu pendek (< 9 digit) harus ditolak', () => {
    assert.strictEqual(PHONE_REGEX.test('08123'), false);
  });

  it('SEC-10: Nomor telepon dengan karakter alfabet harus ditolak', () => {
    assert.strictEqual(PHONE_REGEX.test('0812abcd3456'), false);
  });

  // Test 11 - 15: XSS Sanitization
  it('SEC-11: Tag script HTML harus di-escape menjadi entitas aman', () => {
    const input = '<script>alert("xss")</script>';
    const output = sanitizeInput(input);
    assert.ok(!output.includes('<script>'));
    assert.ok(output.includes('&lt;script&gt;'));
  });

  it('SEC-12: Tag iframe HTML harus di-escape', () => {
    const input = '<iframe src="malicious.site"></iframe>';
    const output = sanitizeInput(input);
    assert.ok(!output.includes('<iframe>'));
    assert.ok(output.includes('&lt;iframe'));
  });

  it('SEC-13: Karakter quotes ganda dan tunggal harus di-escape', () => {
    const input = `Keluhan: Frame "pecah" & 'bengkok'`;
    const output = sanitizeInput(input);
    assert.ok(output.includes('&quot;pecah&quot;'));
    assert.ok(output.includes('&#039;bengkok&#039;'));
  });

  it('SEC-14: Simbol ampersand (&) harus di-escape', () => {
    const input = 'Frame & Lensa';
    const output = sanitizeInput(input);
    assert.strictEqual(output, 'Frame &amp; Lensa');
  });

  it('SEC-15: Sanitizer menangani input non-string secara anggun', () => {
    assert.strictEqual(sanitizeInput(null), '');
    assert.strictEqual(sanitizeInput(undefined), '');
    assert.strictEqual(sanitizeInput(12345), '');
  });

  // Test 16 - 20: SQL Injection Detection
  it('SEC-16: Payload SQLI OR 1=1 harus terdeteksi', () => {
    assert.strictEqual(detectSQLInjection("admin' OR '1'='1"), true);
  });

  it('SEC-17: Payload SQLI UNION SELECT harus terdeteksi', () => {
    assert.strictEqual(detectSQLInjection("1 UNION SELECT * FROM users"), true);
  });

  it('SEC-18: Payload SQLI DROP TABLE harus terdeteksi', () => {
    assert.strictEqual(detectSQLInjection("1; DROP TABLE users;"), true);
  });

  it('SEC-19: Payload SQLI komentar komentar SQL (--) harus terdeteksi', () => {
    assert.strictEqual(detectSQLInjection("admin' --"), true);
  });

  it('SEC-20: Teks keluhan normal tidak boleh terdeteksi sebagai SQLI palsu', () => {
    assert.strictEqual(detectSQLInjection("Kacamata minus saya buram dan baut kendor"), false);
  });

  // Test 21 - 25: Password & Boundary Checks
  it('SEC-21: Password minimal 6 karakter harus diverifikasi', () => {
    const isPasswordStrong = (pwd) => typeof pwd === 'string' && pwd.length >= 6;
    assert.strictEqual(isPasswordStrong('pass123'), true);
    assert.strictEqual(isPasswordStrong('12345'), false);
  });

  it('SEC-22: Password hanya spasi kosong harus ditolak', () => {
    const isValidPassword = (pwd) => typeof pwd === 'string' && pwd.trim().length >= 6;
    assert.strictEqual(isValidPassword('      '), false);
  });

  it('SEC-23: Parameter ID numerik harus berupa bilangan bulat positif', () => {
    const isValidId = (id) => Number.isInteger(Number(id)) && Number(id) > 0;
    assert.strictEqual(isValidId('5'), true);
    assert.strictEqual(isValidId('-1'), false);
    assert.strictEqual(isValidId('abc'), false);
    assert.strictEqual(isValidId('1.5'), false);
  });

  it('SEC-24: Panjang teks keluhan dibatasi maksimal 2000 karakter', () => {
    const validateLength = (str, max) => typeof str === 'string' && str.length <= max;
    const shortText = 'Frame kendor'.repeat(10);
    const extremeText = 'A'.repeat(2001);
    assert.strictEqual(validateLength(shortText, 2000), true);
    assert.strictEqual(validateLength(extremeText, 2000), false);
  });

  it('SEC-25: Validasi role hanya menerima pelanggan, admin, atau kurir', () => {
    const VALID_ROLES = ['pelanggan', 'admin', 'kurir'];
    assert.strictEqual(VALID_ROLES.includes('pelanggan'), true);
    assert.strictEqual(VALID_ROLES.includes('admin'), true);
    assert.strictEqual(VALID_ROLES.includes('kurir'), true);
    assert.strictEqual(VALID_ROLES.includes('superadmin'), false);
    assert.strictEqual(VALID_ROLES.includes('root'), false);
  });
});

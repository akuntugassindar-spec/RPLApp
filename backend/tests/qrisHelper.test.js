const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  calculateCRC16,
  generateEMVCoQRIS,
  getQRCodeImageUrl,
  getPaymentDeepLinks
} = require('../utils/qrisHelper');

describe('Pengujian Standar QRIS Bank Indonesia (EMVCo & CRC16)', () => {
  it('calculateCRC16 harus menghasilkan 4 karakter hex uppercase', () => {
    const sample = '00020101021226580014ID.CO.QRIS.WWW52045975530336054061500005802ID5912OPTIKEXPRESS6008SURABAYA6105602716304';
    const crc = calculateCRC16(sample);
    assert.strictEqual(typeof crc, 'string');
    assert.strictEqual(crc.length, 4);
    assert.match(crc, /^[0-9A-F]{4}$/);
  });

  it('generateEMVCoQRIS harus memuat Tag standar Bank Indonesia (00, 01, 26, 51, 52, 53, 58, 59, 60, 63)', () => {
    const payload = generateEMVCoQRIS({
      amount: 175000,
      transactionId: 'TRX-TEST-001',
      merchantName: 'OPTIKEXPRESS',
      merchantCity: 'SURABAYA',
      nmid: 'ID1020304050607'
    });

    assert.ok(payload.startsWith('000201'), 'Harus diawali format indicator 000201');
    assert.ok(payload.includes('5303360'), 'Harus memiliki kode mata uang Rupiah IDR 360');
    assert.ok(payload.includes('5802ID'), 'Harus memiliki Country Code ID');
    assert.ok(payload.includes('OPTIKEXPRESS'), 'Harus memuat nama merchant');
    assert.ok(payload.includes('SURABAYA'), 'Harus memuat kota merchant');
    assert.ok(payload.includes('ID1020304050607'), 'Harus memuat NMID ASPI');
    assert.ok(payload.includes('6304'), 'Harus memuat tag CRC 6304');
    assert.strictEqual(payload.length > 100, true);
  });

  it('getQRCodeImageUrl harus menghasilkan URL gambar QR yang valid', () => {
    const url = getQRCodeImageUrl('0002010102126304ABCD', 280);
    assert.ok(url.startsWith('https://api.qrserver.com/v1/create-qr-code/'));
    assert.ok(url.includes('280x280'));
    assert.ok(url.includes('0002010102126304ABCD'));
  });

  it('getPaymentDeepLinks harus memuat deep-link GoPay, ShopeePay, DANA, dan BCA', () => {
    const links = getPaymentDeepLinks({
      amount: 150000,
      transactionId: 'MIDTRANS-999',
      emvcoPayload: '00020101...'
    });

    assert.ok(links.gopay && links.gopay.deepLinkApp.startsWith('gojek://'));
    assert.ok(links.shopeepay && links.shopeepay.deepLinkApp.startsWith('shopeeid://'));
    assert.ok(links.dana && links.dana.deepLinkApp.startsWith('dana://'));
    assert.ok(links.bca && links.bca.deepLinkApp.startsWith('bca://'));
  });
});


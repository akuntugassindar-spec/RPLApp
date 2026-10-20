/**
 * Helper Generator QRIS Standar Bank Indonesia (EMVCo ASPI Specification)
 * 
 * Format Payload EMVCo QRIS:
 * - 00: Payload Format Indicator (01)
 * - 01: Point of Initiation Method (11: Statis, 12: Dinamis)
 * - 26: Merchant Account Information - Domestic QRIS
 * - 51: National Merchant ID (NMID ASPI)
 * - 52: Merchant Category Code (MCC 5999 / 5975 - Optik & Kacamata)
 * - 53: Transaction Currency (360 - Indonesian Rupiah / IDR)
 * - 54: Transaction Amount (Nominal transaksi)
 * - 58: Country Code (ID)
 * - 59: Merchant Name (OPTIKEXPRESS)
 * - 60: Merchant City (SURABAYA)
 * - 61: Postal Code (60271)
 * - 62: Additional Data Field (Bill Number / Transaction ID)
 * - 63: CRC16-CCITT Checksum (4 digit HEX Uppercase)
 */

/**
 * Hitung CRC16-CCITT (Polynomial 0x1021, Init 0xFFFF) standar EMVCo QRIS
 * @param {string} str Data string QRIS sebelum CRC
 * @returns {string} 4-karakter Hexadecimal Uppercase
 */
function calculateCRC16(str) {
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Helper format TLV (Tag, Length, Value)
 * @param {string} tag 2-digit tag ID
 * @param {string} value Isi value
 * @returns {string} String TLV
 */
function formatTLV(tag, value) {
  if (value === undefined || value === null) return '';
  const valStr = String(value);
  const lenStr = String(valStr.length).padStart(2, '0');
  return `${tag}${lenStr}${valStr}`;
}

/**
 * Buat Payload EMVCo QRIS Resmi Indonesia
 * @param {Object} options Parameter pembuatan QRIS
 * @param {number} options.amount Nominal pembayaran (Rupiah)
 * @param {string} options.transactionId ID transaksi pembayaran unik
 * @param {string} [options.merchantName='OPTIKEXPRESS'] Nama merchant
 * @param {string} [options.merchantCity='SURABAYA'] Kota merchant
 * @param {string} [options.postalCode='60271'] Kode pos
 * @param {string} [options.nmid='ID1020304050607'] NMID ASPI
 * @returns {string} Payload lengkap EMVCo QRIS beserta checksum CRC16
 */
function generateEMVCoQRIS({
  amount = 150000,
  transactionId = 'MIDTRANS-001',
  merchantName = 'OPTIKEXPRESS',
  merchantCity = 'SURABAYA',
  postalCode = '60271',
  nmid = 'ID1020304050607'
} = {}) {
  // Tag 00: Format Indicator
  let payload = formatTLV('00', '01');

  // Tag 01: Initiation Method (12: Dynamic with specified amount, 11: Static)
  payload += formatTLV('01', amount > 0 ? '12' : '11');

  // Tag 26: Merchant Account Information (ASPI Domestic Gateway)
  // Subtag 00: GUID, Subtag 01: Merchant ID / Pan, Subtag 02: Criteria (UMI: Usaha Mikro)
  const mai26 = formatTLV('00', 'ID.CO.QRIS.WWW') +
                formatTLV('01', '936009110000000000') +
                formatTLV('02', '0000000000000000') +
                formatTLV('03', 'UMI');
  payload += formatTLV('26', mai26);

  // Tag 51: National Merchant ID (NMID ASPI / GoPay / LinkAja)
  const nmidTag = formatTLV('00', 'ID.OR.GOPAY') +
                  formatTLV('01', nmid) +
                  formatTLV('02', 'UMI');
  payload += formatTLV('51', nmidTag);

  // Tag 52: Merchant Category Code (5975: Optical Goods / 5999: Specialty Retail)
  payload += formatTLV('52', '5975');

  // Tag 53: Transaction Currency (360 = IDR)
  payload += formatTLV('53', '360');

  // Tag 54: Transaction Amount
  if (amount > 0) {
    payload += formatTLV('54', String(Math.round(amount)));
  }

  // Tag 58: Country Code (ID)
  payload += formatTLV('58', 'ID');

  // Tag 59: Merchant Name (Max 25 char)
  payload += formatTLV('59', merchantName.substring(0, 25).toUpperCase());

  // Tag 60: Merchant City (Max 15 char)
  payload += formatTLV('60', merchantCity.substring(0, 15).toUpperCase());

  // Tag 61: Postal Code (Max 10 char)
  payload += formatTLV('61', postalCode.substring(0, 10));

  // Tag 62: Additional Data Field (Reference / Bill No)
  const cleanTrx = transactionId.replace(/[^A-Za-z0-9]/g, '').slice(-15);
  const addData = formatTLV('01', cleanTrx) + formatTLV('07', 'A01');
  payload += formatTLV('62', addData);

  // Tag 63: Checksum Template (6304 + 4 hex char)
  const prefixForCRC = payload + '6304';
  const crc = calculateCRC16(prefixForCRC);

  return prefixForCRC + crc;
}

/**
 * Buat URL Gambar QR Code berbasis Payload EMVCo QRIS
 * @param {string} payload String EMVCo QRIS
 * @param {number} [size=300] Ukuran dimensi QR (pixel)
 * @returns {string} URL Gambar QR Code
 */
function getQRCodeImageUrl(payload, size = 300) {
  const encoded = encodeURIComponent(payload);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=10&data=${encoded}`;
}

/**
 * Buat deep link dan instruksi pembayaran lengkap untuk berbagai e-wallet & mobile banking
 * @param {Object} params
 * @param {number} params.amount
 * @param {string} params.transactionId
 * @param {string} params.emvcoPayload
 * @returns {Object} Deep link dan rincian instruksi
 */
function getPaymentDeepLinks({ amount, transactionId, emvcoPayload }) {
  return {
    gopay: {
      nama: 'GoPay / Gojek',
      deepLinkApp: `gojek://gopay/pay?amount=${amount}&order_id=${transactionId}`,
      webLink: `https://gopay.co.id/pay?order_id=${transactionId}`,
      petunjuk: [
        'Buka aplikasi Gojek / GoPay di ponsel Anda',
        'Pilih menu "Bayar" atau "Scan QR"',
        'Arahkan kamera ke Kode QRIS di layar',
        'Konfirmasi pembayaran sebesar Rp ' + Number(amount).toLocaleString('id-ID')
      ]
    },
    shopeepay: {
      nama: 'ShopeePay',
      deepLinkApp: `shopeeid://shopeepay/pay?order_id=${transactionId}`,
      webLink: `https://shopee.co.id/shopeepay`,
      petunjuk: [
        'Buka aplikasi Shopee di ponsel Anda',
        'Pilih ikon "Scan QR ShopeePay" di pojok kiri atas',
        'Pindai Kode QRIS di layar',
        'Masukkan PIN ShopeePay Anda untuk menyelesaikan'
      ]
    },
    dana: {
      nama: 'DANA',
      deepLinkApp: `dana://qr/pay?order_id=${transactionId}`,
      webLink: `https://dana.id`,
      petunjuk: [
        'Buka aplikasi DANA di ponsel Anda',
        'Ketuk menu "Scan / Pindai"',
        'Arahkan ke Kode QRIS di layar',
        'Tekan "Bayar" dan masukkan PIN DANA Anda'
      ]
    },
    bca: {
      nama: 'BCA Mobile / myBCA',
      deepLinkApp: `bca://`,
      webLink: `https://klikbca.com`,
      petunjuk: [
        'Buka aplikasi BCA Mobile / myBCA',
        'Pilih fitur "QRIS" di bagian tengah bawah layar',
        'Scan Kode QRIS di layar',
        'Periksa nama Merchant: OPTIKEXPRESS dan selesaikan transaksi'
      ]
    }
  };
}

module.exports = {
  calculateCRC16,
  formatTLV,
  generateEMVCoQRIS,
  getQRCodeImageUrl,
  getPaymentDeepLinks
};

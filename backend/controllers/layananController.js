/**
 * Controller Layanan Antar-Jemput Kacamata
 * Mengelola pembuatan pengajuan layanan, pembaruan status pengerjaan,
 * penyimpanan foto bukti kacamata & resep dokter,
 * simulasi integrasi payment gateway (Midtrans Snap),
 * serta pelacakan langsung kurir GPS (Live Courier Tracking)
 * dengan alokasi kurir terdekat secara acak berdasarkan alamat penjemputan pelanggan.
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const db = require('../config/db');
let nodemailer;
try {
  nodemailer = require('nodemailer');
} catch (err) {
  nodemailer = null;
}

// Daftar status siklus operasional yang valid (State Machine)
const VALID_STATUSES = [
  'pengajuan',
  'dijadwalkan',
  'diambil',
  'diproses',
  'selesai',
  'diantar'
];

// Daftar jenis layanan yang didukung sistem
const VALID_JENIS_LAYANAN = [
  'perbaikan',
  'penggantian_lensa',
  'perbaikan_dan_lensa'
];

// Daftar metode pembayaran yang didukung (Midtrans Snap Sandbox simulation & COD)
const VALID_METODE_PEMBAYARAN = [
  'qris',
  'bca_va',
  'bni_va',
  'bri_va',
  'mandiri_va',
  'gopay',
  'shopeepay',
  'cod'
];

// Pool armada kurir optik internal (untuk penugasan otomatis ala Gojek/Grab)
const COURIER_POOL = [
  { nama: 'Agus Pratama', telepon: '081234567890', kendaraan: 'Honda Vario 160 (L 4589 AB)' },
  { nama: 'Bambang Wijaya', telepon: '081398765432', kendaraan: 'Yamaha NMAX (L 3120 XY)' },
  { nama: 'Rian Kurniawan', telepon: '085712348765', kendaraan: 'Honda Beat Street (L 6742 OP)' }
];

/**
 * Pemetaan Wilayah Surabaya & Geocoding Cerdas berdasarkan Alamat Penjemputan (Foto 2)
 */
const SURABAYA_DISTRICTS = [
  {
    wilayah: 'Sukolilo / Keputih / ITS',
    lat: -7.2890,
    lng: 112.7950,
    keywords: ['sukolilo', 'keputih', 'gebang', 'its', 'klampis', 'semolowaru', 'menur', 'kertajaya indah', 'mulyosari']
  },
  {
    wilayah: 'Rungkut / Surabaya Timur',
    lat: -7.3180,
    lng: 112.7800,
    keywords: ['rungkut', 'gunung anyar', 'pandugo', 'penjaringan', 'wonorejo', 'medokan', 'kali rungkut', 'rungkut industri', 'rungkut madya']
  },
  {
    wilayah: 'Gubeng / Airlangga',
    lat: -7.2750,
    lng: 112.7530,
    keywords: ['gubeng', 'airlangga', 'mojo', 'baratajaya', 'pucang', 'ngagel', 'dharmawangsa', 'karangmenjangan', 'kertajaya']
  },
  {
    wilayah: 'Wonokromo / Darmo',
    lat: -7.3000,
    lng: 112.7380,
    keywords: ['wonokromo', 'darmo', 'jagir', 'sawanggaling', 'ngagel rejo', 'diponegoro', 'ciliwung', 'joyoboyo']
  },
  {
    wilayah: 'Tegalsari / Basuki Rahmat',
    lat: -7.2680,
    lng: 112.7390,
    keywords: ['tegalsari', 'basuki rahmat', 'kedungdoro', 'dr soetomo', 'dr. soetomo', 'pandegiling', 'embong malang']
  },
  {
    wilayah: 'Genteng / Pusat (Dekat Optik)',
    lat: -7.2625,
    lng: 112.7485,
    keywords: ['genteng', 'pemuda', 'panglima sudirman', 'embong kaliasin', 'yos sudarso', 'tunjungan', 'gubernur suryo']
  },
  {
    wilayah: 'Kenjeran / Tambaksari',
    lat: -7.2350,
    lng: 112.7850,
    keywords: ['kenjeran', 'bulak', 'tambaksari', 'suramadu', 'ploso', 'gading', 'kapasan', 'sidotopo']
  },
  {
    wilayah: 'Mulyorejo / Manyar',
    lat: -7.2680,
    lng: 112.7850,
    keywords: ['mulyorejo', 'manyar', 'kalijudan', 'sutorejo', 'dharmahusada']
  },
  {
    wilayah: 'Dukuh Pakis / Mayjen Sungkono',
    lat: -7.2880,
    lng: 112.7050,
    keywords: ['dukuh pakis', 'hr muhammad', 'h.r. muhammad', 'mayjen sungkono', 'pradah', 'gunungsari']
  },
  {
    wilayah: 'Wiyung / Surabaya Barat',
    lat: -7.3100,
    lng: 112.6950,
    keywords: ['wiyung', 'babatan', 'balas klumprik', 'jajar tunggal']
  },
  {
    wilayah: 'Sambikerep / Citraland',
    lat: -7.2800,
    lng: 112.6500,
    keywords: ['sambikerep', 'citraland', 'lontar', 'made', 'lakarsantri']
  },
  {
    wilayah: 'Jambangan / Ketintang',
    lat: -7.3150,
    lng: 112.7250,
    keywords: ['jambangan', 'ketintang', 'karah', 'gayungan', 'menanggal', 'kebonsari']
  },
  {
    wilayah: 'Krembangan / Tanjung Perak',
    lat: -7.2250,
    lng: 112.7350,
    keywords: ['krembangan', 'perak', 'pabean cantikan', 'tanjung perak', 'rajawali', 'kembang jepun']
  },
  {
    wilayah: 'Tandes / Sukomanunggal',
    lat: -7.2600,
    lng: 112.6800,
    keywords: ['tandes', 'manukan', 'sukomanunggal', 'simomulyo', 'darmo indah']
  },
  {
    wilayah: 'Sawahan / Banyu Urip',
    lat: -7.2750,
    lng: 112.7200,
    keywords: ['sawahan', 'petemon', 'kupang', 'banyu urip', 'girilaya']
  }
];

/**
 * Helper geocoding alamat Surabaya (Foto 2) - Kamus Lokal Cepat
 */
const geocodeSurabayaAddress = (alamatText = '') => {
  if (!alamatText || typeof alamatText !== 'string') {
    return { wilayah: 'Sukolilo / Surabaya Timur', lat: -7.2890, lng: 112.7950 };
  }
  const lower = alamatText.toLowerCase();
  for (const dist of SURABAYA_DISTRICTS) {
    if (dist.keywords.some(kw => lower.includes(kw))) {
      return { wilayah: dist.wilayah, lat: dist.lat, lng: dist.lng };
    }
  }
  // Fallback deterministik berbasis hash string dari alamat agar konsisten
  let hash = 0;
  for (let i = 0; i < alamatText.length; i++) {
    hash = (hash << 5) - hash + alamatText.charCodeAt(i);
    hash |= 0;
  }
  const latOffset = ((Math.abs(hash) % 40) - 20) * 0.001; // +/- 0.02
  const lngOffset = ((Math.abs(hash >> 3) % 40) - 20) * 0.001;
  return {
    wilayah: 'Surabaya',
    lat: Number((-7.2780 + latOffset).toFixed(6)),
    lng: Number((112.7550 + lngOffset).toFixed(6))
  };
};

/**
 * Geocoding Pintar: Coba OpenStreetMap Nominatim terlebih dahulu untuk akurasi alamat nyata
 * di manapun pengguna berada, dengan fallback instan ke kamus lokal.
 */
const geocodeAddress = async (alamatText = '') => {
  if (!alamatText || typeof alamatText !== 'string') {
    return { wilayah: 'Sukolilo / Surabaya Timur', lat: -7.2890, lng: 112.7950 };
  }
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const cleanQuery = alamatText.replace(/blok\s+[a-z0-9]+/gi, '').replace(/no\.?\s*\d+/gi, '').trim() || alamatText;

    let res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanQuery)}&limit=1`, {
      headers: { 'User-Agent': 'RPLApp-Kacamata/1.0' },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      let data = await res.json();
      if ((!data || data.length === 0) && cleanQuery !== alamatText) {
        const res2 = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(alamatText)}&limit=1`, {
          headers: { 'User-Agent': 'RPLApp-Kacamata/1.0' }
        });
        if (res2.ok) data = await res2.json();
      }

      if (data && data.length > 0) {
        const item = data[0];
        const lat = Number(parseFloat(item.lat).toFixed(6));
        const lng = Number(parseFloat(item.lon).toFixed(6));
        const wilayah = (item.name || item.display_name?.split(',')[0] || 'Wilayah Penjemputan').trim();
        return { wilayah, lat, lng, formatted: item.display_name };
      }
    }
  } catch (err) {
    // Offline atau timeout: lanjut ke kamus lokal
  }

  return geocodeSurabayaAddress(alamatText);
};

/**
 * Hitung jarak Haversine (km) antara dua koordinat GPS
 */
const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
};

/**
 * Cari kurir secara random tetapi lokasinya dicari yang TERDEKAT secara acak dengan alamat penjemputan (Foto 2)
 * Kurir ditempatkan di radius sangat dekat (~250 meter - 600 meter) dari alamat penjemputan pelanggan yang dimasukkan.
 */
const findNearestRandomCourier = (tujuanLat, tujuanLng, wilayah = 'Surabaya', preferredCourier = null) => {
  // 1. Pilih kurir secara acak dari pool kurir
  const courier = preferredCourier || COURIER_POOL[Math.floor(Math.random() * COURIER_POOL.length)];

  // 2. Tentukan koordinat kurir terdekat secara acak (radius ~250m - 600m dari titik penjemputan pelanggan)
  const angle = Math.random() * 2 * Math.PI;
  const distDeg = 0.0025 + (Math.random() * 0.0035); // ~280m - 650m
  const kurirLat = Number((tujuanLat + Math.sin(angle) * distDeg).toFixed(6));
  const kurirLng = Number((tujuanLng + Math.cos(angle) * distDeg).toFixed(6));
  const jarakKm = calculateDistanceKm(kurirLat, kurirLng, tujuanLat, tujuanLng);
  const jarakMeter = Math.round(jarakKm * 1000);

  const trackingStatus = `Kurir terdekat (${courier.nama}) dialokasikan di dekat ${wilayah} (~${jarakMeter} m dari alamat jemput).`;

  return {
    kurir: courier,
    kurirLat,
    kurirLng,
    jarakKm,
    jarakMeter,
    trackingStatus
  };
};

/**
 * Helper untuk auto-assign kurir berdasarkan ID layanan (Deterministic Round-Robin)
 */
const autoAssignCourier = (seedId = 0) => {
  const num = Math.abs(parseInt(seedId, 10) || 0);
  return COURIER_POOL[num % COURIER_POOL.length];
};

/**
 * Helper untuk menyimpan gambar Base64 ke disk server (/uploads/)
 */
const saveBase64Image = (base64Str, prefix = 'media') => {
  if (!base64Str || typeof base64Str !== 'string') return null;
  if (base64Str.startsWith('/uploads/') || base64Str.startsWith('http://') || base64Str.startsWith('https://')) {
    return base64Str;
  }
  try {
    const matches = base64Str.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) return null;
    const mimeType = matches[1];
    const dataBuffer = Buffer.from(matches[2], 'base64');
    let ext = 'jpg';
    if (mimeType.includes('png')) ext = 'png';
    else if (mimeType.includes('webp')) ext = 'webp';
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    const filename = `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
    fs.writeFileSync(path.join(uploadsDir, filename), dataBuffer);
    return `/uploads/${filename}`;
  } catch (err) {
    console.error('[Error saveBase64Image]:', err);
    return null;
  }
};

// Helper function untuk kirim email notifikasi
const sendEmailNotification = async (emailTo, nama, status) => {
  if (!nodemailer) {
    console.log('[Email] Info: Pustaka "nodemailer" belum terpasang.');
    return;
  }
  try {
    let transporter;
    if (!process.env.EMAIL_USER) {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass }
      });
    } else {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
      });
    }
    const statusMsg = {
      pengajuan: 'Pengajuan layanan Anda telah kami terima.',
      dijadwalkan: 'Penjemputan kacamata telah dijadwalkan.',
      diambil: 'Kurir sedang menjemput kacamata Anda.',
      diproses: 'Kacamata sedang dikerjakan oleh teknisi optik.',
      selesai: 'Pengerjaan kacamata telah selesai!',
      diantar: 'Kacamata sedang diantar kembali ke alamat Anda.'
    };
    const info = await transporter.sendMail({
      from: '"OptikExpress" <no-reply@optikexpress.local>',
      to: emailTo,
      subject: `[OptikExpress] Update Status Layanan: ${status.toUpperCase()}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e2e8f0;border-radius:8px;"><h2 style="color:#0284c7;">OptikExpress</h2><p>Halo <strong>${nama}</strong>,</p><p>${statusMsg[status] || 'Status layanan Anda telah diperbarui.'}</p><p>Status saat ini: <strong style="color:#0d9488;text-transform:uppercase;">${status}</strong></p><hr style="border:none;border-top:1px solid #e2e8f0;"/><p style="font-size:12px;color:#94a3b8;">Email ini dikirim otomatis oleh sistem OptikExpress.</p></div>`
    });
    if (!process.env.EMAIL_USER) {
      console.log('[Email] Preview URL (Ethereal):', nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error('[Error sendEmailNotification]:', error.message);
  }
};

// Helper function untuk kirim notifikasi WhatsApp mock
const sendWANotification = async (noTelepon, nama, status) => {
  const nomor = noTelepon || '-';
  const statusUpper = (status || '').toUpperCase();
  console.log('----------------------------------------------------');
  console.log('[WhatsApp Mock] MENGIRIM PESAN WA KE PELANGGAN');
  console.log(`Kepada  : ${nomor} (${nama})`);
  console.log(`Pesan   : Halo ${nama}, status servis kacamata Anda di OptikExpress telah diperbarui menjadi: *${statusUpper}*. Terima kasih telah mempercayakan perbaikan kacamata kepada kami!`);
  console.log('Status  : TERKIRIM (Mock)');
  console.log('----------------------------------------------------');
};

/**
 * @route   GET /api/layanan
 */
const getAllLayanan = async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    const { status, jenis_layanan } = req.query;
    let query = `
      SELECT 
        l.id, l.user_id, u.nama AS nama_pelanggan, u.email AS email_pelanggan,
        u.no_telepon AS no_telepon_pelanggan, l.jenis_layanan, l.keluhan, l.alamat,
        DATE_FORMAT(l.tanggal_jemput, '%Y-%m-%d') AS tanggal_jemput,
        TIME_FORMAT(l.jam_jemput, '%H:%i') AS jam_jemput, l.status,
        l.foto_kacamata, l.foto_resep, l.total_biaya, l.status_pembayaran,
        l.metode_pembayaran, l.id_transaksi_pembayaran, l.catatan_admin,
        l.kurir_nama, l.kurir_telepon, l.kurir_lat, l.kurir_lng, l.tracking_status,
        l.created_at, d.id AS detail_id, d.jenis_kacamata, d.detail_perbaikan,
        d.keterangan AS detail_keterangan
      FROM layanan l
      JOIN users u ON l.user_id = u.id
      LEFT JOIN detail_layanan d ON d.layanan_id = l.id
    `;
    const conditions = [];
    const params = [];
    if (role === 'pelanggan') { conditions.push('l.user_id = ?'); params.push(userId); }
    if (status && VALID_STATUSES.includes(status)) { conditions.push('l.status = ?'); params.push(status); }
    if (jenis_layanan && VALID_JENIS_LAYANAN.includes(jenis_layanan)) { conditions.push('l.jenis_layanan = ?'); params.push(jenis_layanan); }
    if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY l.created_at DESC';
    const [rows] = await db.query(query, params);
    return res.status(200).json({ success: true, total: rows.length, data: rows });
  } catch (error) {
    console.error('[Error getAllLayanan]:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat mengambil daftar layanan.', error: error.message });
  }
};

/**
 * @route   GET /api/layanan/:id
 */
const getLayananById = async (req, res) => {
  try {
    const layananId = req.params.id;
    const { role, id: userId } = req.user;
    const [layananRows] = await db.query(
      `SELECT 
        l.id, l.user_id, u.nama AS nama_pelanggan, u.email AS email_pelanggan,
        u.no_telepon AS no_telepon_pelanggan, l.jenis_layanan, l.keluhan, l.alamat,
        DATE_FORMAT(l.tanggal_jemput, '%Y-%m-%d') AS tanggal_jemput,
        TIME_FORMAT(l.jam_jemput, '%H:%i') AS jam_jemput, l.status,
        l.foto_kacamata, l.foto_resep, l.total_biaya, l.status_pembayaran,
        l.metode_pembayaran, l.id_transaksi_pembayaran, l.catatan_admin,
        l.kurir_nama, l.kurir_telepon, l.kurir_lat, l.kurir_lng, l.tracking_status,
        l.created_at, d.id AS detail_id, d.jenis_kacamata, d.detail_perbaikan,
        d.keterangan AS detail_keterangan
      FROM layanan l
      JOIN users u ON l.user_id = u.id
      LEFT JOIN detail_layanan d ON d.layanan_id = l.id
      WHERE l.id = ?`,
      [layananId]
    );
    if (layananRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Layanan tidak ditemukan.' });
    }
    const item = layananRows[0];
    if (role !== 'admin' && role !== 'kurir' && item.user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Akses ditolak.' });
    }
    const responseData = {
      id: item.id, user_id: item.user_id, nama_pelanggan: item.nama_pelanggan,
      email_pelanggan: item.email_pelanggan, no_telepon_pelanggan: item.no_telepon_pelanggan,
      jenis_layanan: item.jenis_layanan, keluhan: item.keluhan, alamat: item.alamat,
      tanggal_jemput: item.tanggal_jemput, jam_jemput: item.jam_jemput, status: item.status,
      foto_kacamata: item.foto_kacamata, foto_resep: item.foto_resep,
      total_biaya: item.total_biaya || 0, status_pembayaran: item.status_pembayaran || 'belum_bayar',
      metode_pembayaran: item.metode_pembayaran, id_transaksi_pembayaran: item.id_transaksi_pembayaran,
      catatan_admin: item.catatan_admin, kurir_nama: item.kurir_nama, kurir_telepon: item.kurir_telepon,
      kurir_lat: item.kurir_lat !== null ? Number(item.kurir_lat) : null,
      kurir_lng: item.kurir_lng !== null ? Number(item.kurir_lng) : null,
      tracking_status: item.tracking_status, created_at: item.created_at,
      jenis_kacamata: item.jenis_kacamata || '-',
      detail_perbaikan: item.detail_perbaikan || '-',
      keterangan: item.detail_keterangan || '',
      detail: item.detail_id ? { id: item.detail_id, layanan_id: item.id, jenis_kacamata: item.jenis_kacamata, detail_perbaikan: item.detail_perbaikan, keterangan: item.detail_keterangan } : null
    };
    return res.status(200).json({ success: true, data: responseData });
  } catch (error) {
    console.error('[Error getLayananById]:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat mengambil detail layanan.', error: error.message });
  }
};

/**
 * @route   POST /api/layanan
 */
const createLayanan = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { jenis_layanan, keluhan, alamat, tanggal_jemput, jam_jemput, jenis_kacamata, detail_perbaikan, keterangan, foto_kacamata, foto_resep } = req.body;
    if (!jenis_layanan || !keluhan || !alamat || !tanggal_jemput || !jam_jemput) {
      return res.status(400).json({ success: false, message: 'Semua field wajib diisi: jenis_layanan, keluhan, alamat, tanggal_jemput, dan jam_jemput.' });
    }
    if (!VALID_JENIS_LAYANAN.includes(jenis_layanan)) {
      return res.status(400).json({ success: false, message: `Jenis layanan tidak valid. Pilihan yang tersedia: ${VALID_JENIS_LAYANAN.join(', ')}` });
    }
    const savedFotoKacamata = saveBase64Image(foto_kacamata, 'kacamata');
    const savedFotoResep = saveBase64Image(foto_resep, 'resep');

    // Penentuan Kurir Terdekat Secara Acak Berdasarkan Alamat Penjemputan (Foto 2)
    const geoTujuan = await geocodeAddress(alamat);
    const nearestAllocation = findNearestRandomCourier(geoTujuan.lat, geoTujuan.lng, geoTujuan.wilayah);
    const kurirNama = nearestAllocation.kurir.nama;
    const kurirTelepon = nearestAllocation.kurir.telepon;
    const kurirLat = nearestAllocation.kurirLat;
    const kurirLng = nearestAllocation.kurirLng;
    const trackingStatus = nearestAllocation.trackingStatus;

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const statusAwal = 'pengajuan';
      const [layananResult] = await connection.query(
        `INSERT INTO layanan (
          user_id, jenis_layanan, keluhan, alamat, tanggal_jemput, jam_jemput,
          status, foto_kacamata, foto_resep,
          kurir_nama, kurir_telepon, kurir_lat, kurir_lng, tracking_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId, jenis_layanan, keluhan, alamat, tanggal_jemput, jam_jemput,
          statusAwal, savedFotoKacamata, savedFotoResep,
          kurirNama, kurirTelepon, kurirLat, kurirLng, trackingStatus
        ]
      );
      const layananId = layananResult.insertId;
      let detailId = null;
      if (jenis_kacamata || detail_perbaikan || keterangan) {
        const [detailResult] = await connection.query(
          `INSERT INTO detail_layanan (layanan_id, jenis_kacamata, detail_perbaikan, keterangan) VALUES (?, ?, ?, ?)`,
          [layananId, jenis_kacamata || '-', detail_perbaikan || '-', keterangan || '-']
        );
        detailId = detailResult.insertId;
      }
      await connection.commit();
      return res.status(201).json({
        success: true, message: 'Pengajuan layanan antar-jemput kacamata berhasil dibuat.',
        data: {
          id: layananId, user_id: userId, jenis_layanan, keluhan, alamat, tanggal_jemput, jam_jemput,
          status: statusAwal, foto_kacamata: savedFotoKacamata, foto_resep: savedFotoResep,
          total_biaya: 0, status_pembayaran: 'belum_bayar',
          kurir_nama: kurirNama, kurir_telepon: kurirTelepon,
          kurir_lat: kurirLat, kurir_lng: kurirLng, tracking_status: trackingStatus,
          detail_layanan: detailId ? { id: detailId, layanan_id: layananId, jenis_kacamata: jenis_kacamata || '-', detail_perbaikan: detail_perbaikan || '-', keterangan: keterangan || '-' } : null
        }
      });
    } catch (dbError) {
      await connection.rollback();
      throw dbError;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('[Error createLayanan]:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat membuat pengajuan layanan.', error: error.message });
  }
};

/**
 * @route   PUT /api/layanan/:id/status
 */
const updateStatusLayanan = async (req, res) => {
  try {
    const layananId = req.params.id;
    const { status, total_biaya, status_pembayaran, metode_pembayaran, catatan_admin, kurir_nama, kurir_telepon, tracking_status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status baru wajib disertakan.' });
    }
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: `Status tidak valid. Pilihan status yang tersedia: ${VALID_STATUSES.join(', ')}` });
    }
    const [checkRows] = await db.query(
      `SELECT l.id, l.status, l.total_biaya, l.status_pembayaran, u.email, u.nama, u.no_telepon FROM layanan l JOIN users u ON l.user_id = u.id WHERE l.id = ?`, [layananId]
    );
    if (checkRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Layanan tidak ditemukan.' });
    }
    const dataLama = checkRows[0];
    const updateFields = ['status = ?'];
    const updateParams = [status];
    if (total_biaya !== undefined && total_biaya !== null) { updateFields.push('total_biaya = ?'); updateParams.push(parseInt(total_biaya, 10) || 0); }
    if (status_pembayaran) { updateFields.push('status_pembayaran = ?'); updateParams.push(status_pembayaran); }
    if (metode_pembayaran) { updateFields.push('metode_pembayaran = ?'); updateParams.push(metode_pembayaran); }
    if (catatan_admin !== undefined) { updateFields.push('catatan_admin = ?'); updateParams.push(catatan_admin); }
    if (kurir_nama) { updateFields.push('kurir_nama = ?'); updateParams.push(kurir_nama); }
    if (kurir_telepon) { updateFields.push('kurir_telepon = ?'); updateParams.push(kurir_telepon); }
    if (tracking_status) { updateFields.push('tracking_status = ?'); updateParams.push(tracking_status); }
    updateParams.push(layananId);
    await db.query(`UPDATE layanan SET ${updateFields.join(', ')} WHERE id = ?`, updateParams);
    sendEmailNotification(dataLama.email, dataLama.nama, status);
    sendWANotification(dataLama.no_telepon, dataLama.nama, status);
    return res.status(200).json({
      success: true, message: `Status layanan berhasil diperbarui menjadi '${status}'.`
    });
  } catch (error) {
    console.error('[Error updateStatusLayanan]:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat memperbarui status layanan.', error: error.message });
  }
};

/**
 * @route   POST /api/layanan/:id/pembayaran
 */
const prosesPembayaran = async (req, res) => {
  try {
    const layananId = req.params.id;
    const { metode_pembayaran } = req.body;
    const { role, id: userId } = req.user;
    const [rows] = await db.query(`SELECT l.*, u.nama, u.email FROM layanan l JOIN users u ON l.user_id = u.id WHERE l.id = ?`, [layananId]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan.' });
    const pesanan = rows[0];
    if (role !== 'admin' && role !== 'kurir' && pesanan.user_id !== userId) return res.status(403).json({ success: false, message: 'Akses ditolak.' });
    const metode = metode_pembayaran || 'qris';
    if (!VALID_METODE_PEMBAYARAN.includes(metode)) {
      return res.status(400).json({ success: false, message: `Metode pembayaran tidak valid. Pilihan: ${VALID_METODE_PEMBAYARAN.join(', ')}` });
    }
    const biaya = pesanan.total_biaya && pesanan.total_biaya > 0 ? pesanan.total_biaya : 150000;
    const transactionId = `MIDTRANS-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    let paymentDetail = {};
    if (metode === 'qris') {
      paymentDetail = { tipe: 'qris', qr_image: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=OPTIKEXPRESS-PAYMENT-${transactionId}`, merchant: 'OptikExpress Payment Gateway' };
    } else if (metode.includes('va')) {
      const bankCode = metode.replace('_va', '').toUpperCase();
      paymentDetail = { tipe: 'virtual_account', bank: bankCode, va_number: `8808${String(layananId).padStart(4, '0')}${Math.floor(1000 + Math.random() * 9000)}` };
    } else if (metode === 'cod') {
      paymentDetail = { tipe: 'cod', keterangan: 'Pembayaran tunai langsung kepada kurir saat kacamata diantar.' };
    } else {
      paymentDetail = { tipe: 'ewallet', ewallet: metode.toUpperCase(), link: `https://sandbox.midtrans.com/pay/${transactionId}` };
    }
    await db.query(`UPDATE layanan SET total_biaya = ?, metode_pembayaran = ?, id_transaksi_pembayaran = ?, status_pembayaran = 'menunggu_pembayaran' WHERE id = ?`, [biaya, metode, transactionId, layananId]);
    return res.status(200).json({
      success: true, message: 'Transaksi Payment Gateway berhasil diinisialisasi.',
      data: { layanan_id: parseInt(layananId, 10), transaction_id: transactionId, gross_amount: biaya, metode_pembayaran: metode, status_pembayaran: 'menunggu_pembayaran', expired_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), payment_detail: paymentDetail }
    });
  } catch (error) {
    console.error('[Error prosesPembayaran]:', error);
    return res.status(500).json({ success: false, message: 'Gagal memproses transaksi pembayaran.', error: error.message });
  }
};

/**
 * @route   POST /api/layanan/:id/pembayaran/konfirmasi
 */
const konfirmasiPembayaran = async (req, res) => {
  try {
    const layananId = req.params.id;
    const { role, id: userId } = req.user;
    const [rows] = await db.query(`SELECT l.*, u.nama FROM layanan l JOIN users u ON l.user_id = u.id WHERE l.id = ?`, [layananId]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan.' });
    if (role !== 'admin' && role !== 'kurir' && rows[0].user_id !== userId) return res.status(403).json({ success: false, message: 'Akses ditolak.' });
    await db.query(`UPDATE layanan SET status_pembayaran = 'lunas' WHERE id = ?`, [layananId]);
    return res.status(200).json({ success: true, message: 'Pembayaran berhasil dikonfirmasi LUNAS.', data: { layanan_id: parseInt(layananId, 10), status_pembayaran: 'lunas', id_transaksi_pembayaran: rows[0].id_transaksi_pembayaran } });
  } catch (error) {
    console.error('[Error konfirmasiPembayaran]:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengonfirmasi pembayaran.', error: error.message });
  }
};

/**
 * @route   GET /api/layanan/:id/tracking
 */
const getTrackingKurir = async (req, res) => {
  try {
    const layananId = req.params.id;
    const { role, id: userId } = req.user;
    const [rows] = await db.query(
      `SELECT l.*, u.nama AS nama_pelanggan, u.no_telepon AS no_telepon_pelanggan 
       FROM layanan l 
       JOIN users u ON l.user_id = u.id 
       WHERE l.id = ?`,
      [layananId]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Layanan tidak ditemukan.' });
    const item = rows[0];
    if (role !== 'admin' && role !== 'kurir' && item.user_id !== userId) return res.status(403).json({ success: false, message: 'Akses ditolak.' });

    const optikLocation = {
      nama: 'OptikExpress Store & Lab',
      alamat: 'Jl. Pemuda No. 48, Surabaya',
      lat: -7.2625,
      lng: 112.7485
    };

    // Geocoding alamat penjemputan pelanggan dari input form Foto 2
    const geoTujuan = await geocodeAddress(item.alamat);
    const tujuanLocation = {
      nama: item.nama_pelanggan || 'Pelanggan',
      alamat: item.alamat || 'Alamat Penjemputan Pelanggan',
      wilayah: geoTujuan.wilayah,
      lat: geoTujuan.lat,
      lng: geoTujuan.lng
    };

    let kurirNama = item.kurir_nama;
    let kurirTelepon = item.kurir_telepon;
    let kurirLat = item.kurir_lat !== null ? Number(item.kurir_lat) : null;
    let kurirLng = item.kurir_lng !== null ? Number(item.kurir_lng) : null;
    let trackingStatus = item.tracking_status;

    // Hitung jarak kurir ke tujuan jika koordinat kurir sudah ada
    const distCurrent = (kurirLat !== null && kurirLng !== null)
      ? calculateDistanceKm(kurirLat, kurirLng, geoTujuan.lat, geoTujuan.lng)
      : null;

    // Jika kurir atau lokasinya belum tersimpan, atau kurir lama terlalu jauh (>2.5 km karena masih koordinat default optik),
    // alokasikan kurir random terdekat langsung di dekat alamat penjemputan pelanggan yang dimasukkan di awal
    if (!kurirNama || kurirLat === null || kurirLng === null || (distCurrent !== null && distCurrent > 2.5)) {
      const nearest = findNearestRandomCourier(
        geoTujuan.lat,
        geoTujuan.lng,
        geoTujuan.wilayah,
        kurirNama ? { nama: kurirNama, telepon: kurirTelepon, kendaraan: 'Sepeda Motor' } : null
      );
      kurirNama = nearest.kurir.nama;
      kurirTelepon = nearest.kurir.telepon;
      kurirLat = nearest.kurirLat;
      kurirLng = nearest.kurirLng;
      trackingStatus = nearest.trackingStatus;

      // Update database agar persistent
      await db.query(
        `UPDATE layanan SET kurir_nama = ?, kurir_telepon = ?, kurir_lat = ?, kurir_lng = ?, tracking_status = ? WHERE id = ?`,
        [kurirNama, kurirTelepon, kurirLat, kurirLng, trackingStatus, layananId]
      );
    }

    const jarakKurirKePelanggan = calculateDistanceKm(kurirLat, kurirLng, tujuanLocation.lat, tujuanLocation.lng);

    let progress = 10, eta = '1-2 Jam', statusKet = 'Permintaan diterima, sedang verifikasi.';
    switch (item.status) {
      case 'pengajuan':
        progress = 10;
        statusKet = 'Permintaan diterima, sedang verifikasi.';
        eta = '1-2 Jam';
        break;
      case 'dijadwalkan':
        progress = 25;
        statusKet = `Kurir terdekat (${kurirNama}) ditugaskan dan bersiap menuju lokasi Anda.`;
        eta = '20-30 Menit';
        break;
      case 'diambil':
        progress = 50;
        statusKet = `Kurir (${kurirNama}) dalam perjalanan menjemput kacamata (~${jarakKurirKePelanggan} km).`;
        eta = '10-15 Menit';
        break;
      case 'diproses':
        progress = 75;
        statusKet = 'Kacamata di laboratorium optik sedang dikerjakan teknisi.';
        eta = 'Dalam pengerjaan';
        break;
      case 'diantar':
        progress = 90;
        statusKet = `Kurir (${kurirNama}) mengantar kacamata ke alamat Anda.`;
        eta = '10-20 Menit';
        break;
      case 'selesai':
        progress = 100;
        statusKet = 'Layanan selesai! Kacamata telah diterima pelanggan.';
        eta = 'Tiba di lokasi';
        break;
      default:
        progress = 10;
    }

    // Cari info kendaraan kurir
    const courierObj = COURIER_POOL.find(c => c.nama === kurirNama) || {
      nama: kurirNama,
      telepon: kurirTelepon,
      kendaraan: 'Honda Vario 160 (L 4589 AB)'
    };

    return res.status(200).json({
      success: true,
      data: {
        layanan_id: parseInt(layananId, 10),
        status_layanan: item.status,
        persentase_perjalanan: progress,
        estimasi_tiba: eta,
        status_deskripsi: trackingStatus || statusKet,
        kurir: {
          nama: kurirNama,
          telepon: kurirTelepon,
          kendaraan: courierObj.kendaraan,
          posisi_saat_ini: { lat: kurirLat, lng: kurirLng },
          jarak_ke_pelanggan_km: jarakKurirKePelanggan
        },
        lokasi_optik: optikLocation,
        lokasi_tujuan: tujuanLocation
      }
    });
  } catch (error) {
    console.error('[Error getTrackingKurir]:', error);
    return res.status(500).json({ success: false, message: 'Gagal memuat tracking kurir.', error: error.message });
  }
};

/**
 * @route   PUT /api/layanan/:id/tracking
 */
const updateTrackingKurir = async (req, res) => {
  try {
    const layananId = req.params.id;
    const { kurir_nama, kurir_telepon, kurir_lat, kurir_lng, tracking_status } = req.body;
    const fields = [], params = [];
    if (kurir_nama !== undefined) { fields.push('kurir_nama = ?'); params.push(kurir_nama); }
    if (kurir_telepon !== undefined) { fields.push('kurir_telepon = ?'); params.push(kurir_telepon); }
    if (kurir_lat !== undefined) { fields.push('kurir_lat = ?'); params.push(kurir_lat); }
    if (kurir_lng !== undefined) { fields.push('kurir_lng = ?'); params.push(kurir_lng); }
    if (tracking_status !== undefined) { fields.push('tracking_status = ?'); params.push(tracking_status); }
    if (fields.length === 0) return res.status(400).json({ success: false, message: 'Tidak ada data tracking yang diperbarui.' });
    params.push(layananId);
    await db.query(`UPDATE layanan SET ${fields.join(', ')} WHERE id = ?`, params);
    return res.status(200).json({ success: true, message: 'Data pelacakan kurir berhasil diperbarui.', data: { layanan_id: parseInt(layananId, 10), kurir_nama, kurir_telepon, tracking_status } });
  } catch (error) {
    console.error('[Error updateTrackingKurir]:', error);
    return res.status(500).json({ success: false, message: 'Gagal memperbarui tracking kurir.', error: error.message });
  }
};

/**
 * @route   DELETE /api/layanan/:id
 */
const deleteLayanan = async (req, res) => {
  try {
    const layananId = req.params.id;
    const { role, id: userId } = req.user;
    const [layananRows] = await db.query('SELECT id, user_id, status FROM layanan WHERE id = ?', [layananId]);
    if (layananRows.length === 0) return res.status(404).json({ success: false, message: 'Layanan tidak ditemukan.' });
    const layanan = layananRows[0];
    if (role !== 'admin' && layanan.user_id !== userId) return res.status(403).json({ success: false, message: 'Akses ditolak.' });
    if (role !== 'admin' && layanan.status !== 'pengajuan') return res.status(400).json({ success: false, message: `Pengajuan layanan tidak dapat dibatalkan karena sudah berstatus '${layanan.status}'.` });
    await db.query('DELETE FROM detail_layanan WHERE layanan_id = ?', [layananId]);
    await db.query('DELETE FROM layanan WHERE id = ?', [layananId]);

    // Jika seluruh data layanan sudah kosong, reset AUTO_INCREMENT kembali ke 1
    const [countRows] = await db.query('SELECT COUNT(*) AS total FROM layanan');
    if (countRows[0].total === 0) {
      await db.query('ALTER TABLE layanan AUTO_INCREMENT = 1');
      await db.query('ALTER TABLE detail_layanan AUTO_INCREMENT = 1');
    }

    return res.status(200).json({ success: true, message: 'Pengajuan layanan berhasil dibatalkan/dihapus.' });
  } catch (error) {
    console.error('[Error deleteLayanan]:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat menghapus data layanan.', error: error.message });
  }
};

/**
 * @route   POST /api/layanan/reset-urutan
 * @desc    Merapikan nomor urut ID pesanan mulai dari #1 dan mereset auto-increment
 */
const resetLayananAutoIncrement = async (req, res) => {
  try {
    await db.query('SET FOREIGN_KEY_CHECKS = 0');
    const [rows] = await db.query('SELECT id FROM layanan ORDER BY id ASC');
    let newId = 1;
    for (const r of rows) {
      const oldId = r.id;
      if (oldId !== newId) {
        await db.query('UPDATE detail_layanan SET layanan_id = ? WHERE layanan_id = ?', [newId, oldId]);
        await db.query('UPDATE detail_layanan SET id = ? WHERE id = ?', [newId, oldId]);
        await db.query('UPDATE layanan SET id = ? WHERE id = ?', [newId, oldId]);
      }
      newId++;
    }
    await db.query(`ALTER TABLE layanan AUTO_INCREMENT = ${newId}`);
    await db.query(`ALTER TABLE detail_layanan AUTO_INCREMENT = ${newId}`);
    await db.query('SET FOREIGN_KEY_CHECKS = 1');

    return res.status(200).json({
      success: true,
      message: `Nomor urut ID pesanan berhasil dirapikan kembali mulai dari #1 (Total ${rows.length} pesanan).`
    });
  } catch (error) {
    console.error('[Error resetLayananAutoIncrement]:', error);
    return res.status(500).json({ success: false, message: 'Gagal merapikan nomor urut ID.', error: error.message });
  }
};

module.exports = {
  VALID_STATUSES, VALID_JENIS_LAYANAN, VALID_METODE_PEMBAYARAN, COURIER_POOL, autoAssignCourier,
  SURABAYA_DISTRICTS, geocodeSurabayaAddress, geocodeAddress, calculateDistanceKm, findNearestRandomCourier,
  saveBase64Image, sendEmailNotification, sendWANotification,
  getAllLayanan, getLayananById, createLayanan, updateStatusLayanan,
  prosesPembayaran, konfirmasiPembayaran, getTrackingKurir, updateTrackingKurir, deleteLayanan,
  resetLayananAutoIncrement
};


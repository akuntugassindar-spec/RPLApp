# SISTEM LOGGING DAN AUDIT TRAIL (LOGGING.MD)

**Proyek:** OptikExpress — Sistem Informasi Layanan Antar-Jemput Kacamata  
**Target:** Standardisasi pencatatan log transaksi, jejak audit riwayat status, pelacakan kurir, dan pengiriman notifikasi.

---

## 1. Strategi Logging Sistem

Sistem OptikExpress menerapkan strategi logging multi-layer untuk menjamin akuntabilitas data, mempermudah pelacakan kendala (*debugging*), serta memberikan transparansi bagi pelanggan dan administrator.

Lapisan logging terbagi menjadi 3 pilar:
1. **Audit Trail di Basis Data:** Mencatat setiap mutasi data transaksional kritis secara permanen ke tabel relasional.
2. **Operational Console Logging:** Menampilkan informasi jalannya proses server pada konsol backend untuk pemantauan runtime.
3. **Notification Logger:** Mencatat jejak pengiriman pesan notifikasi otomatis kepada pelanggan.

---

## 2. Implementasi Titik-Titik Logging Utama

### A. Audit Trail Perubahan Status Layanan (Tabel `riwayat_status_layanan`)
Setiap kali status pengerjaan kacamata diperbarui oleh administrator (dari `pengajuan` hingga `selesai`), sistem secara otomatis merekam baris riwayat audit ke tabel `riwayat_status_layanan`:
* `layanan_id`: ID pesanan yang statusnya berubah.
* `status_lama`: Status sebelum dilakukan pembaruan.
* `status_baru`: Status baru yang telah disahkan.
* `keterangan`: Catatan teknisi atau alasan penyesuaian status.
* `diubah_oleh`: Identitas administrator atau sistem otomatis yang mengeksekusi pembaruan.
* `created_at`: Waktu timestamp presisi terjadinya perubahan.

### B. Logging Pelacakan Posisi Kurir GPS
Saat status pesanan berada dalam fase penjemputan (`diambil`) atau pengantaran (`diantar`), sistem mencatat:
* Posisi koordinat kurir: `kurir_lat` dan `kurir_lng`.
* Status deskripsi kurir: `tracking_status` (misal: "Kurir sedang meluncur ke alamat pelanggan").
* Log konsol koordinat kurir dan persentase perjalanan (10% s.d. 100%).

### C. Logging Pengiriman Notifikasi Otomatis
1. **Email SMTP Logger (Nodemailer):**
   * Mencatat status pengiriman email konfirmasi status ke alamat email pelanggan.
   * Pada mode pengembangan, sistem menampilkan Ethereal Preview URL di terminal untuk verifikasi tampilan email tanpa mengirim ke inbox nyata.
2. **WhatsApp Mock Logger:**
   * Menampilkan format pesan WhatsApp siap kirim pada konsol server:
     ```text
     ----------------------------------------------------
     [WhatsApp Mock] MENGIRIM PESAN WA KE PELANGGAN
     Kepada  : 081234567890 (Budi Santoso)
     Pesan   : Halo Budi Santoso, status servis kacamata Anda di OptikExpress telah diperbarui menjadi: *DIPROSES*.
     Status  : TERKIRIM (Mock)
     ----------------------------------------------------
     ```

### D. Logging Transaksi Pembayaran (Tabel `pembayaran`)
Setiap transaksi pembayaran digital dicatat dengan atribut unik:
* `id_transaksi`: Format unik standar `MIDTRANS-{timestamp}-{random}`.
* `gross_amount`: Total nominal biaya layanan.
* `metode_pembayaran`: Jenis metode yang dipilih (`qris`, `bca_va`, `bni_va`, `bri_va`, `mandiri_va`, `gopay`, `shopeepay`, `cod`).
* `status_transaksi`: Status penyelesaian (`pending`, `settlement`, `expire`, `cancel`).

---

## 3. Format Penanganan Kesalahan (Error Logging)

Ketika terjadi kesalahan eksekusi pada controller atau koneksi database, backend mencatat format log terstruktur pada konsol server:

```javascript
console.error('[Error NamaFungsi]:', {
  timestamp: new Date().toISOString(),
  endpoint: req.originalUrl,
  method: req.method,
  userId: req.user ? req.user.id : null,
  errorMessage: error.message,
  stack: error.stack
});
```

Pesan error yang dikembalikan kepada pengguna dienkapsulasi dengan pesan yang ramah (*user-friendly*), sedangkan stack trace teknis hanya dicatat di log server internal untuk menjaga keamanan sistem.

---

## 4. Prinsip & Contoh Log Aman (Safe Logging & Sanitasi Data Sensitif)

Dalam operasional sistem produksi, sistem menerapkan prinsip **Zero Sensitive Data Exposure** pada seluruh berkas log dan konsol server:
1. **Pencegahan Kebocoran Kredensial:** DILARANG keras mencatat kata sandi plaintext, salt hash, maupun secret token autentikasi (`JWT_SECRET` / bearer token) ke dalam berkas log.
2. **Sanitasi Data Pribadi (PII Masking):** Nomor telepon pelanggan, nomor rekening virtual account, dan alamat email harus disanitasi sebelum dicatat dalam log konsol publik.
3. **Pemberian Konteks Unik:** Setiap log transaksional menyertakan ID Layanan, ID Pengguna, dan IP pemohon untuk keperluan pelacakan insiden keamanan tanpa mengekspos payload sensitif.

### Contoh Log Aman pada Sistem OptikExpress:

```text
[2026-10-29T14:40:12.102Z] [AUTH_SUCCESS] User ID: 2 | Email: bahrul@gmail.com | Role: pelanggan | Client-IP: 127.0.0.1
[2026-10-29T14:41:05.412Z] [ORDER_CREATED] Layanan ID #4 created | User ID: 2 | Jenis: perbaikan_dan_lensa | Pickup: BSD Tangerang
[2026-10-29T14:42:18.890Z] [KURIR_ASSIGN] Layanan ID #4 assigned to Kurir ID #1 (Bambang Wijaya - Armada: B 3120 TNG)
[2026-10-29T14:43:40.231Z] [GPS_BROADCAST] Kurir ID #1 broadcast: Lat -6.2088, Lng 106.8456 | Status: Meluncur ke lokasi pemesan
[2026-10-29T14:44:15.540Z] [NOTIFICATION] WhatsApp notification queued for Customer: 0812****7890 | Status Event: DIJADWALKAN
[2026-10-29T14:45:00.672Z] [PAYMENT_SETTLED] Layanan ID #4 | TxID: MIDTRANS-1730... | Gross: Rp 150.000 | Method: QRIS (CRC16: 4C2F)
```

---

## 5. Analisis Penyebab Error Umum Runtime dan Tindakan Perbaikannya

| Kode / Tipe Error | Contoh Tampilan Pesan Log | Akar Penyebab (Root Cause) | Tindakan Perbaikan (Corrective Action) |
| :--- | :--- | :--- | :--- |
| **Database Connection Failure** | `[Database Error] Gagal terhubung ke database MySQL: connect ECONNREFUSED 127.0.0.1:3306` | Service MySQL (XAMPP / Docker) belum berjalan, port 3306 terblokir, atau kredensial `backend/.env` tidak sesuai. | 1. Nyalakan service MySQL via XAMPP Control Panel atau `docker compose up -d db`.<br>2. Verifikasi kesesuaian nilai `DB_HOST`, `DB_USER`, `DB_PASSWORD`, dan `DB_NAME` pada berkas `backend/.env`. |
| **Leaflet Runtime TypeError (`_leaflet_pos`)** | `TypeError: Cannot read properties of undefined (reading '_leaflet_pos') at Pe (leaflet.js:5:21430)` | Re-inisialisasi instance peta `L.map()` berulang pada elemen DOM saat komponen React me-render ulang, atau marker dipindahkan sebelum transisi zoom/pan selesai. | 1. Pisahkan inisialisasi peta sekali-pakai menggunakan `useRef`.<br>2. Perbarui posisi kurir hanya menggunakan `marker.setLatLng()` dan `map.panTo({ animate: false })`.<br>3. Terapkan safe patch wrapper `_getMapPanePos` di `index.html` dan `LiveMapKurir.js`. |
| **Unauthorized IDOR Access Attempt** | `[SECURITY_WARN] IDOR attempt blocked: User ID 2 attempted unauthorized access to Layanan ID 1 - HTTP 403 Forbidden` | Pengguna biasa mencoba melihat atau memanipulasi detail teknis kacamata milik pelanggan lain dengan mengubah parameter ID di URL. | Terapkan verifikasi kepemilikan data ganda di controller backend (`req.user.role !== 'admin' && layanan.user_id !== req.user.id`) yang langsung mengembalikan HTTP 403 Forbidden sebelum query dieksekusi. |
| **JWT Token Expired / Invalid Secret** | `[AUTH_FAIL] Token verification failed: TokenExpiredError: jwt expired - Path: /api/layanan` | Sesi token JWT telah melewati batas waktu kedaluwarsa (`24h`), atau backend direstart dengan nilai `JWT_SECRET` yang berbeda dari penerbit token. | 1. Frontend mengintersep status respon HTTP 401 via Axios interceptor.<br>2. Membersihkan token usang dari client (`localStorage.removeItem('token')`).<br>3. Mengarahkan otomatis ke halaman `/login` dengan notifikasi sesi habis. |

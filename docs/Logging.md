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

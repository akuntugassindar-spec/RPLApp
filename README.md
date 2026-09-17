# 👓 Sistem Informasi Layanan Antar-Jemput Kacamata

### Sistem Informasi Layanan Antar-Jemput Kacamata untuk Perbaikan dan Penggantian Lensa Berbasis Web

## 📌 Deskripsi

**Sistem Informasi Layanan Antar-Jemput Kacamata** merupakan aplikasi berbasis web yang dibuat untuk membantu pelanggan dalam melakukan permintaan layanan perbaikan kacamata atau penggantian lensa tanpa harus datang langsung ke toko optik.

Pelanggan dapat mengajukan permintaan layanan melalui website dengan mengisi informasi kacamata, memilih jenis layanan, serta menentukan jadwal pengambilan kacamata.

Admin dapat mengelola permintaan pelanggan, mengatur jadwal pengambilan, dan memperbarui status layanan sampai kacamata selesai diperbaiki atau lensanya diganti.

---

## 🎯 Tujuan

Sistem ini dibuat dengan tujuan:

* Mempermudah pelanggan dalam mengajukan layanan perbaikan atau penggantian lensa.
* Mempermudah proses pengambilan dan pengantaran kacamata.
* Membantu admin mengelola data permintaan pelanggan.
* Menyediakan informasi status layanan kepada pelanggan.
* Membuat proses layanan menjadi lebih terorganisir.

---

## 💡 Manfaat

### 👤 Bagi Pelanggan

* Tidak perlu datang langsung ke toko hanya untuk mengajukan layanan.
* Dapat mengajukan perbaikan atau penggantian lensa secara online.
* Dapat menentukan jadwal pengambilan.
* Dapat melihat status layanan.

### 👨‍💼 Bagi Admin

* Mempermudah pengelolaan permintaan layanan.
* Dapat melihat data pelanggan dan detail kacamata.
* Dapat mengatur jadwal pengambilan.
* Dapat memperbarui status layanan.

---

## 👥 Pengguna Sistem

Sistem memiliki **2 jenis pengguna**:

### 1. Pelanggan

Pelanggan dapat:

* Register dan Login.
* Mengajukan layanan.
* Memilih jenis layanan.
* Mengisi alamat pengambilan.
* Memilih jadwal pengambilan.
* Melihat status layanan.

### 2. Admin

Admin dapat:

* Login.
* Melihat permintaan layanan.
* Melihat detail pelanggan.
* Mengatur jadwal pengambilan.
* Mengubah status layanan.

---

## ⚙️ Fitur Utama

### 🔐 1. Login & Register

Pelanggan dapat membuat akun dan login ke dalam sistem.

### 👓 2. Pengajuan Layanan

Pelanggan dapat memilih jenis layanan:

* Perbaikan kacamata
* Penggantian lensa

Kemudian mengisi informasi seperti:

* Nama pelanggan
* Nomor telepon
* Alamat pengambilan
* Jenis layanan
* Keluhan atau kebutuhan
* Jadwal pengambilan

### 🚚 3. Penjadwalan Antar-Jemput

Pelanggan dapat menentukan jadwal pengambilan kacamata.

Admin dapat melihat dan mengatur jadwal yang telah diajukan.

### 🔄 4. Status Layanan

Pelanggan dapat melihat perkembangan layanan.

Contoh status:

```text
Pengajuan
    ↓
Dijadwalkan
    ↓
Kacamata Diambil
    ↓
Sedang Diproses
    ↓
Selesai
    ↓
Diantar
```

### 🛠️ 5. Pengelolaan Layanan oleh Admin

Admin dapat:

* Melihat daftar permintaan.
* Melihat detail layanan.
* Mengubah status layanan.
* Mengatur jadwal pengambilan.
* Melihat riwayat layanan.

---

## 🔄 Alur Sistem

```text
Pelanggan
    ↓
Login / Register
    ↓
Mengajukan Layanan
    ↓
Memilih Jenis Layanan
    ↓
Mengisi Alamat & Jadwal
    ↓
Mengirim Permintaan
    ↓
Admin Memeriksa
    ↓
Menentukan Jadwal
    ↓
Kacamata Diambil
    ↓
Kacamata Diproses
    ↓
Layanan Selesai
    ↓
Kacamata Diantar
```

---

## 🗄️ Database

Database dibuat sederhana dengan beberapa tabel utama.

### users

```text
id
nama
email
password
role
no_telepon
```

### layanan

```text
id
user_id
jenis_layanan
keluhan
alamat
tanggal_jemput
jam_jemput
status
```

### detail_layanan

```text
id
layanan_id
jenis_kacamata
detail_perbaikan
keterangan
```

### Relasi

```text
users
  │
  │ 1
  │
  │ *
  ▼
layanan
  │
  │ 1
  │
  │ *
  ▼
detail_layanan
```

---

## 🖥️ Halaman Sistem

### 👤 Pelanggan

* Login
* Register
* Dashboard
* Pengajuan Layanan
* Jadwal Antar-Jemput
* Status Layanan
* Riwayat Layanan

### 👨‍💼 Admin

* Login
* Dashboard Admin
* Daftar Layanan
* Detail Layanan
* Pengaturan Jadwal
* Update Status Layanan

---

## 🛠️ Teknologi

Teknologi yang digunakan:

* **Frontend:** HTML, CSS, JavaScript
* **Backend:** [Framework yang digunakan]
* **Database:** MySQL / MariaDB
* **Version Control:** Git & GitHub

> Teknologi dapat disesuaikan dengan kebutuhan project.

---

## 📋 Metode Pengembangan

Project dikembangkan menggunakan konsep **Rekayasa Perangkat Lunak (RPL)** melalui beberapa tahapan:

1. Analisis kebutuhan
2. Perancangan sistem
3. Perancangan database
4. Perancangan UI
5. Implementasi
6. Pengujian
7. Evaluasi

---

##🧪 Pengujian

Pengujian dilakukan untuk memastikan fitur sistem berjalan sesuai kebutuhan.

Fitur yang diuji meliputi:

* Login dan Register
* Pengajuan layanan
* Pemilihan jenis layanan
* Penjadwalan pengambilan
* Perubahan status layanan
* Pengelolaan layanan oleh admin

---

## 🚀 Status Project

**Status:** 🚧 Dalam Pengembangan

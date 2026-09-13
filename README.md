# 🚀 RPLApp (React + Node.js)

**RPLApp** adalah aplikasi manajemen proyek Rekayasa Perangkat Lunak berbasis full-stack:
- **Frontend**: React (Vite) dengan tampilan modern & responsif.
- **Backend**: Node.js + Express REST API.

---

## 📁 Struktur Folder

```text
Project RPL/
├── client/                 # Frontend React (Vite)
│   ├── public/
│   ├── src/
│   │   ├── App.jsx         # Komponen dashboard utama
│   │   ├── App.css         # Styling komponen
│   │   ├── index.css       # Style global & tokens
│   │   └── main.jsx        # Entry point React
│   ├── index.html
│   ├── package.json
│   └── vite.config.js      # Konfigurasi Vite & proxy ke backend
│
├── server/                 # Backend Node.js (Express)
│   ├── src/
│   │   └── index.js        # REST API server & router
│   ├── .env.example
│   ├── .env
│   └── package.json
│
├── .gitignore              # Mengabaikan node_modules, .env, dist, dll.
├── package.json            # Root configuration
└── README.md               # Dokumentasi & panduan
```

---

## 🌐 Cara Upload ke GitHub (Repository: `RPLApp`)

Karena akun GitHub bersifat privat dan memerlukan otorisasi pribadi Anda, ikuti langkah mudah berikut untuk menghubungkan proyek ini ke GitHub:

### Langkah 1: Buat Repository Baru di GitHub
1. Buka browser dan pergi ke **[github.com/new](https://github.com/new)**.
2. Di bagian **Repository name**, ketik: `RPLApp`.
3. Pilih **Public** (atau **Private**).
4. **PENTING:** Jangan centang *"Add a README file"*, *"Add .gitignore"*, atau *"Choose a license"* (karena semua berkas tersebut sudah dibuatkan di sini).
5. Klik tombol **Create repository**.

### Langkah 2: Hubungkan & Push dari Komputer Anda
Buka terminal (Git Bash, Command Prompt, atau PowerShell) di folder `Project RPL` ini, lalu ketik perintah berikut:

```bash
git init
git add .
git commit -m "Initial commit: Setup RPLApp with React and Node.js"
git branch -M main
git remote add origin https://github.com/<USERNAME-GITHUB-ANDA>/RPLApp.git
git push -u origin main
```
> *Ganti `<USERNAME-GITHUB-ANDA>` dengan username akun GitHub Anda.*

---

## 💻 Cara Menjalankan Aplikasi di Komputer Lokal

### 1. Install Dependencies
Buka terminal pada folder proyek:

**Install server:**
```bash
cd server
npm install
```

**Install client:**
```bash
cd ../client
npm install
```

---

### 2. Jalankan Server & Client

**Terminal 1 (Backend Express):**
```bash
cd server
npm run dev
```
Server akan aktif di: `http://localhost:5000` (Endpoints: `/api/health`, `/api/projects`)

**Terminal 2 (Frontend React):**
```bash
cd client
npm run dev
```
Buka browser Anda di: `http://localhost:3000`

---

## 🛠️ Fitur yang Tersedia
- [x] Deteksi status koneksi backend otomatis (Health Check).
- [x] Menampilkan daftar proyek RPL.
- [x] Menambahkan proyek baru dengan kategori dan status.
- [x] Menghapus proyek dari daftar.
- [x] Proxy terintegrasi pada Vite untuk memudahkan komunikasi ke API tanpa masalah CORS.


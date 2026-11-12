# Tautan Resmi Proyek OptikExpress (RPLApp)

Dokumen ini memuat daftar lengkap seluruh tautan repositori, cabang pengerjaan tugas Pertemuan 11, serta tautan deployment live (Vercel & GitHub Pages) untuk proyek **OptikExpress**.

---

## 🌐 1. Tautan Live Deployment (Web Production)

| Platform | URL Live | Keterangan |
| :--- | :--- | :--- |
| **Vercel Production** | [https://optikexpress.vercel.app/](https://optikexpress.vercel.app/) | Aplikasi Web OptikExpress Live (Frontend & Backend terintegrasi) |
| **GitHub Pages CI/CD** | [https://akuntugassindar-spec.github.io/RPLApp/](https://akuntugassindar-spec.github.io/RPLApp/) | Halaman Web Hasil Pipeline CI/CD Otomatis (Demo PPT 1 - Versi 2) |

---

## 📁 2. Tautan Repositori GitHub

- **Repositori Utama:**  
  [https://github.com/akuntugassindar-spec/RPLApp](https://github.com/akuntugassindar-spec/RPLApp)
- **Akun Pemilik (GitHub):**  
  [akuntugassindar-spec](https://github.com/akuntugassindar-spec)
- **Nama Proyek:**  
  **OptikExpress** (`akuntugassindar-spec/RPLApp`)

---

## 🌿 3. Tautan Cabang Tugas Pertemuan 11 (Semua 6/6 Centang Hijau)

| Nama Branch | Tautan GitHub Branch | Fokus & Materi Perkuliahan | Status CI/CD Checks |
| :--- | :--- | :--- | :---: |
| **`p11_ci_cd`** | [Lihat Branch p11_ci_cd](https://github.com/akuntugassindar-spec/RPLApp/tree/p11_ci_cd) | Praktik CI/CD 10 Langkah (PPT 1): Demo build, test, pipeline Windows, & deploy | **✔ 6/6 Passed** |
| **`p11_perbaikan-dan-verifikasi-proyek`** | [Lihat Branch p11_perbaikan-dan-verifikasi-proyek](https://github.com/akuntugassindar-spec/RPLApp/tree/p11_perbaikan-dan-verifikasi-proyek) | Perbaikan yang Terbukti (PPT 2): Fix bentrok jadwal kurir, UI retention, 200 UT & regresi | **✔ 6/6 Passed** |
| **`v1.0_dev`** | [Lihat Branch v1.0_dev](https://github.com/akuntugassindar-spec/RPLApp/tree/v1.0_dev) | Development Branch: Running bawah pengujian 200 UT, simulasi demo gagal vs lolos hijau | **✔ 6/6 Passed** |
| **`v1.1`** | [Lihat Branch v1.1](https://github.com/akuntugassindar-spec/RPLApp/tree/v1.1) | Release Candidate v1.1 pasca-perbaikan P11 terverifikasi | **✔ 6/6 Passed** |
| **`V1.1`** | [Lihat Branch V1.1](https://github.com/akuntugassindar-spec/RPLApp/tree/V1.1) | Alias penamaan versi kapital V1.1 | **✔ 6/6 Passed** |
| **`v1.0`** | [Lihat Branch v1.0](https://github.com/akuntugassindar-spec/RPLApp/tree/v1.0) | Baseline Release sebelum perbaikan P11 | **✔ 1/1 Passed** |
| **`main`** | [Lihat Branch main](https://github.com/akuntugassindar-spec/RPLApp/tree/main) | Production default branch sinkron dengan seluruh pembaruan P11 | **✔ 5/5 Passed** |

---

## 📑 4. Ringkasan Kesesuaian Materi PPT

### A. PPT 1: Praktik CI/CD Langsung di GitHub (10 Langkah)
1. **01/10 Siapkan alat:** Node.js 24, Git, Windows PowerShell.
2. **02/10 Dua file awal:** `cicd-demo/package.json` dan `cicd-demo/index.html`.
3. **03/10 Tes dan build:** `cicd-demo/app.test.mjs` dan `cicd-demo/build.mjs`.
4. **04/10 Pengaturan Pages:** Konfigurasi GitHub Actions Runner Windows.
5. **05/10 File workflow tes otomatis:** `.github/workflows/site.yml` dengan runner `windows-latest` dan `shell: powershell`.
6. **06/10 Perubahan salah (merah):** Simulasi kegagalan terkontrol terdokumentasi.
7. **07/10 Perbaikan membuat hijau:** Tes & build sukses dengan status hijau.
8. **08/10 Tambahan deploy:** `actions/upload-pages-artifact@v3`, `actions/configure-pages@v5`, dan `actions/deploy-pages@v4`.
9. **09/10 Push menerbitkan halaman:** Live di GitHub Pages.
10. **10/10 Update & pemulihan versi:** Versi 2 aktif dan terdokumentasi.

### B. PPT 2: Perbaikan yang Terbukti & Verifikasi Proyek RPL
1. **1 Issue & 1 PR Terfokus:** Mengatasi bentrok jadwal kurir (Issue dari P10).
2. **Jejak Kegagalan:** Antarmuka (form reset), API (HTTP 409 Conflict), dan Penyimpanan (kuota slot aktif).
3. **Perilaku Target & Kriteria Penerimaan:**
   - **Bentrok Jadwal:** Sistem menolak jika kuota kurir slot penuh (`MAX_KURIR_PER_SLOT = 2`), menampilkan saran jam alternatif, dan data isian form pengguna TIDAK hilang.
   - **Pemulihan:** Memilih jam alternatif yang disarankan langsung berhasil membuat tepat 1 pesanan layanan.
   - **Jalur Normal:** Pemilihan slot yang belum penuh langsung sukses tersimpan.
4. **200 Unit Tests:** 17 test suites, 200 unit tests lolos 100% di backend runner Windows.
5. **Verifikasi Regresi:** 35 uji regresi khusus P11 di `backend/tests/p11_remediation_regression.test.js`.

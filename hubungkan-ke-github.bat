@echo off
chcp 65001 >nul
title Hubungkan RPLApp ke GitHub
color 0b

echo =======================================================
echo        🚀 PENGHUBUNG PROJECT RPL KE GITHUB
echo =======================================================
echo.
echo Target Repository: https://github.com/akuntugassindar-spec/ProjectRPL.git
echo.
echo =======================================================
echo.

set "GIT_EXE=C:\Program Files\Git\cmd\git.exe"

echo [1/5] Menginisialisasi Git lokal...
"%GIT_EXE%" init

echo.
echo [2/5] Menambahkan berkas proyek...
"%GIT_EXE%" add .

echo.
echo [3/5] Membuat initial commit...
"%GIT_EXE%" commit -m "Initial commit: Setup RPLApp (React + Node.js)"

echo.
echo [4/5] Mengatur branch utama ke 'main'...
"%GIT_EXE%" branch -M main

echo.
echo [5/5] Menghubungkan remote GitHub...
"%GIT_EXE%" remote remove origin 2>nul
"%GIT_EXE%" remote add origin https://github.com/akuntugassindar-spec/ProjectRPL.git

echo.
echo Sedang melakukan upload (push) ke GitHub...
echo Jika muncul pop-up login browser, klik 'Sign in with your browser'.
echo.
"%GIT_EXE%" push -u origin main

echo.
echo =======================================================
echo Selesai!
echo =======================================================
pause

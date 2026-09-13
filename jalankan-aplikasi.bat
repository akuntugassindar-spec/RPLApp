@echo off
chcp 65001 >nul
title RPLApp Launcher (React + Node.js)
color 0a

echo =======================================================
echo           🚀 RPLApp RUNNER (React + Node.js)
echo =======================================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [PERINGATAN] Node.js belum terdeteksi di komputer Anda!
    echo.
    echo Untuk menjalankan React dan Express, Anda perlu menginstal Node.js terlebih dahulu.
    echo Silakan download dan install versi LTS dari:
    echo https://nodejs.org/
    echo.
    set /p OPEN_NODE="Apakah Anda ingin membuka website Node.js sekarang? (y/n): "
    if /i "%OPEN_NODE%"=="y" (
        start https://nodejs.org/
    )
    goto SELESAI
)

echo [OK] Node.js terdeteksi:
node -v
echo.

echo [1/3] Memeriksa & menginstall dependencies Server...
if not exist "server\node_modules\" (
    echo Mengunduh paket server...
    cd server
    call npm install
    cd ..
) else (
    echo Server modules sudah terpasang.
)

echo.
echo [2/3] Memeriksa & menginstall dependencies Client (React)...
if not exist "client\node_modules\" (
    echo Mengunduh paket client...
    cd client
    call npm install
    cd ..
) else (
    echo Client modules sudah terpasang.
)

echo.
echo [3/3] Membuka Backend Server dan Frontend Client...
echo.
echo - Backend Server akan berjalan di: http://localhost:5000
echo - Frontend React akan berjalan di: http://localhost:3000
echo.

start "RPLApp - Backend API (Port 5000)" cmd /k "cd server && npm run dev"
start "RPLApp - Frontend React (Port 3000)" cmd /k "cd client && npm run dev"

echo.
echo Aplikasi sedang dijalankan di jendela terminal baru!
echo.

:SELESAI
echo.
pause


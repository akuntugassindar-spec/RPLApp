@echo off
cd /d "%~dp0backend"
start "Backend Port 5000" node server.js
cd /d "%~dp0frontend"
start "Frontend Port 3000" npm start

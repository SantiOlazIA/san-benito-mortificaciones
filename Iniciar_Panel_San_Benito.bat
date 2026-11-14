@echo off
title San Benito - Control de Misa y Mortificaciones
cd /d "%~dp0"
echo Iniciando servidor de San Benito en http://localhost:3000 ...
start "" "http://localhost:3000"
node server.js
pause

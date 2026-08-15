@echo off
REM ================================================================
REM Script para ejecutar la app - MUNDIAL 2026 PROJECT
REM ================================================================
setlocal enabledelayedexpansion
color 0A

echo.
echo ================================================================
echo  INICIANDO MUNDIAL 2026 API SERVER
echo ================================================================
echo.

REM Verificar MongoDB
echo Verificando MongoDB...
tasklist | find /i "mongod" >nul 2>&1
if errorlevel 1 (
    echo ⚠ MongoDB no está ejecutándose. Iniciando...
    
    net start MongoDB >nul 2>&1
    if errorlevel 1 (
        echo Iniciando mongod manualmente...
        start "" mongod --dbpath "%USERPROFILE%\AppData\Local\MongoDB\Server\data" >nul 2>&1
    )
    timeout /t 2 /nobreak
)
echo ✓ MongoDB está ejecutándose
echo.

REM Cambiar al directorio mongo
cd /d "%~dp0mongo"

REM Instalar dependencias si no existen
if not exist "node_modules" (
    echo Instalando dependencias...
    call npm install
    echo.
)

REM Iniciar el servidor
echo Iniciando servidor en puerto 8080...
echo Abre http://localhost:8080 en tu navegador
echo.
echo Presiona Ctrl+C para detener el servidor
echo.
echo ================================================================
echo.

call npm run api

pause

@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0build-installer.ps1"
if errorlevel 1 (
  echo.
  echo No se pudo crear el instalador. Revisa el mensaje anterior.
  pause
  exit /b 1
)
echo.
echo Instalador terminado correctamente en la carpeta dist.
pause

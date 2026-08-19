@echo off
setlocal
cd /d "%~dp0"
"%~dp0runtime\node\node.exe" "%~dp0launcher\launcher.mjs"
echo.
echo Si hubo un error, revisa tambien:
echo %LOCALAPPDATA%\Mundial2026\logs
echo.
pause

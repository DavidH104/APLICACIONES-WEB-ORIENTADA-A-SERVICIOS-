@echo off
setlocal
call "%~dp0installer\build-installer.bat"
exit /b %errorlevel%

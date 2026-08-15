@echo off
REM ================================================================
REM Generador de Archivo Comprimido (ZIP) - MUNDIAL 2026
REM ================================================================
setlocal enabledelayedexpansion
color 0A

echo.
echo ================================================================
echo  GENERADOR DE INSTALADOR COMPRIMIDO
echo  MUNDIAL 2026 PROJECT
echo ================================================================
echo.

REM Verificar que estamos en la carpeta correcta
if not exist "mongo\package.json" (
    color 0C
    echo ERROR: Este script debe ejecutarse desde la raíz del proyecto
    echo Debes estar en: Examen1erParcial\
    pause
    exit /b 1
)

echo [1/3] Limpiando archivos temporales...
REM Eliminar node_modules para reducir tamaño
if exist "mongo\node_modules" (
    echo Eliminando mongo\node_modules\ (esto puede tardar un poco)...
    rmdir /s /q "mongo\node_modules" >nul 2>&1
    echo   ✓ node_modules eliminado
) else (
    echo   ✓ node_modules no encontrado (ya limpio)
)

echo.
echo [2/3] Preparando archivos...
setlocal enabledelayedexpansion

REM Crear carpeta temporal
set "TEMP_DIR=%TEMP%\mundial-2026-build"
if exist "%TEMP_DIR%" rmdir /s /q "%TEMP_DIR%"
mkdir "%TEMP_DIR%"

REM Copiar archivos necesarios
echo   Copiando archivos...
xcopy /E /I /Y . "%TEMP_DIR%\Examen1erParcial\" >nul 2>&1

REM Excluir algunos archivos
if exist "%TEMP_DIR%\Examen1erParcial\*.zip" del "%TEMP_DIR%\Examen1erParcial\*.zip"
if exist "%TEMP_DIR%\Examen1erParcial\.git" rmdir /s /q "%TEMP_DIR%\Examen1erParcial\.git"

echo   ✓ Archivos copiados

echo.
echo [3/3] Creando archivo comprimido...

REM Obtener timestamp
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c%%a%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a%%b)

set ZIP_NAME=MUNDIAL2026_%mydate%_%mytime%.zip

REM Crear ZIP
REM Necesita estar instalado PowerShell 5.0+ o 7Zip
powershell -Command "Compress-Archive -Path '%TEMP_DIR%\Examen1erParcial' -DestinationPath '%CD%\%ZIP_NAME%' -Force"

if errorlevel 1 (
    REM Intenta con 7Zip si está disponible
    where 7z >nul 2>&1
    if errorlevel 1 (
        color 0C
        echo ERROR: No se pudo crear el ZIP
        echo Necesitas tener:
        echo   - PowerShell 5.0+, O
        echo   - 7-Zip instalado (http://www.7-zip.org/)
        pause
        exit /b 1
    ) else (
        7z a "%CD%\%ZIP_NAME%" "%TEMP_DIR%\Examen1erParcial"
    )
)

REM Limpiar temp
rmdir /s /q "%TEMP_DIR%" >nul 2>&1

echo   ✓ Archivo creado: %ZIP_NAME%

echo.
echo ================================================================
color 0B
echo  ✓ INSTALADOR GENERADO EXITOSAMENTE
echo ================================================================
echo.
echo El archivo "%ZIP_NAME%" está listo para compartir
echo.
echo TAMAÑO: 
for %%F in ("%ZIP_NAME%") do (
    for /F "usebackq" %%A in ('%%~zF') do (
        set /A size=%%A / 1024 / 1024
        echo   ~!size! MB
    )
)
echo.
echo PRÓXIMOS PASOS:
echo 1. Copia el archivo a USB, Google Drive, OneDrive, etc.
echo 2. El receptor lo extrae y ejecuta install.bat
echo 3. ¡El proyecto se instala automáticamente!
echo.
echo NOTA: El usuario que reciba debe tener:
echo   - Node.js instalado
echo   - MongoDB instalado
echo.
echo ================================================================
echo.
pause

@echo off
REM ================================================================
REM Instalador automático - MUNDIAL 2026 PROJECT
REM ================================================================
setlocal enabledelayedexpansion
color 0A

echo.
echo ================================================================
echo  INSTALADOR - MUNDIAL 2026 CON MONGODB
echo ================================================================
echo.

REM Verificar Node.js
echo [1/5] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    color 0C
    echo ERROR: Node.js no está instalado!
    echo Descárgalo desde: https://nodejs.org/
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo   ✓ Node.js %NODE_VERSION% encontrado
echo.

REM Verificar MongoDB en Windows
echo [2/5] Verificando MongoDB...
where mongod >nul 2>&1
if errorlevel 1 (
    echo   ⚠ MongoDB no está en PATH del sistema
    echo   Intentando buscar en rutas comunes...
    
    set MONGO_FOUND=0
    if exist "C:\Program Files\MongoDB\Server\*\bin\mongod.exe" (
        set MONGO_FOUND=1
        echo   ✓ MongoDB encontrado en Program Files
    )
    if exist "%PROGRAMFILES(X86)%\MongoDB\Server\*\bin\mongod.exe" (
        set MONGO_FOUND=1
        echo   ✓ MongoDB encontrado en Program Files (x86)
    )
    
    if !MONGO_FOUND! equ 0 (
        color 0C
        echo.
        echo ERROR: MongoDB no está instalado!
        echo Descárgalo desde: https://www.mongodb.com/try/download/community
        echo.
        echo INSTALACIÓN RÁPIDA:
        echo   1. Descarga MongoDB Community Edition
        echo   2. Ejecuta el instalador
        echo   3. Marca "Install MongoDB as a Service"
        echo   4. Vuelve a ejecutar este instalador
        echo.
        pause
        exit /b 1
    )
)

REM Verificar si MongoDB está corriendo
echo   Verificando si MongoDB está ejecutándose...
tasklist | find /i "mongod" >nul 2>&1
if errorlevel 1 (
    echo   ⚠ MongoDB no está ejecutándose
    echo   Iniciando MongoDB...
    
    REM Intentar iniciar el servicio
    net start MongoDB >nul 2>&1
    if errorlevel 1 (
        REM Si no es un servicio, intentar ejecutar mongod directamente
        echo   Iniciando mongod manualmente...
        start "" mongod --dbpath "%USERPROFILE%\AppData\Local\MongoDB\Server\data" >nul 2>&1
        if errorlevel 1 (
            echo   Esperando a que MongoDB se inicie...
            timeout /t 3 /nobreak
        )
    ) else (
        echo   ✓ Servicio MongoDB iniciado
        timeout /t 2 /nobreak
    )
) else (
    echo   ✓ MongoDB ya está ejecutándose
)

REM Instalar dependencias npm
echo.
echo [3/5] Instalando dependencias npm...
cd /d "%~dp0mongo"
if not exist "node_modules" (
    call npm install
    if errorlevel 1 (
        color 0C
        echo ERROR: No se pudieron instalar las dependencias!
        pause
        exit /b 1
    )
) else (
    echo   ✓ Dependencias ya instaladas
)
echo   ✓ npm instalado correctamente

REM Crear estructura de BD
echo.
echo [4/5] Creando estructura de base de datos...
call npm run setup
if errorlevel 1 (
    color 0C
    echo ERROR: No se pudo crear la estructura de BD!
    pause
    exit /b 1
)
echo   ✓ Estructura de BD creada

REM Poblar datos
echo.
echo [5/5] Poblando datos iniciales...
call npm run seed
if errorlevel 1 (
    color 0C
    echo ERROR: No se pudieron poblar los datos!
    pause
    exit /b 1
)
echo   ✓ Datos iniciales cargados

echo.
echo ================================================================
color 0B
echo  ✓ INSTALACIÓN COMPLETADA EXITOSAMENTE
echo ================================================================
echo.
echo PRÓXIMOS PASOS:
echo.
echo 1. Para iniciar el servidor API:
echo    cd mongo
echo    npm run api
echo.
echo 2. Luego abre en tu navegador:
echo    http://localhost:8080
echo.
echo 3. O abre el archivo index.html directamente en el navegador
echo.
echo ================================================================
echo.
pause

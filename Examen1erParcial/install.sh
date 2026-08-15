#!/bin/bash

# ================================================================
# Instalador automático - MUNDIAL 2026 PROJECT (MacOS/Linux)
# ================================================================

echo ""
echo "================================================================"
echo "  INSTALADOR - MUNDIAL 2026 CON MONGODB"
echo "================================================================"
echo ""

# Detectar el OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="mac"
    BREW_INSTALLED=$(command -v brew &> /dev/null && echo "yes" || echo "no")
else
    OS="linux"
fi

# Verificar Node.js
echo "[1/5] Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js no está instalado!"
    echo ""
    if [ "$OS" = "mac" ]; then
        echo "Instálalo con: brew install node"
    else
        echo "Instálalo desde: https://nodejs.org/"
    fi
    echo ""
    exit 1
fi
NODE_VERSION=$(node --version)
echo "   ✓ Node.js $NODE_VERSION encontrado"
echo ""

# Verificar MongoDB
echo "[2/5] Verificando MongoDB..."
if ! command -v mongod &> /dev/null; then
    echo "   ⚠ MongoDB no está instalado"
    echo ""
    if [ "$OS" = "mac" ]; then
        echo "Instálalo con: brew install mongodb-community"
    else
        echo "Instálalo desde: https://www.mongodb.com/try/download/community"
    fi
    echo ""
    read -p "Presiona Enter para continuar después de instalar MongoDB..."
    
    if ! command -v mongod &> /dev/null; then
        echo "ERROR: MongoDB sigue sin estar instalado"
        exit 1
    fi
fi
echo "   ✓ MongoDB encontrado"

# Verificar si MongoDB está corriendo
echo "   Verificando si MongoDB está ejecutándose..."
if ! pgrep -x "mongod" > /dev/null; then
    echo "   ⚠ MongoDB no está ejecutándose"
    echo "   Iniciando MongoDB en el background..."
    
    if [ "$OS" = "mac" ]; then
        brew services start mongodb-community &>/dev/null 2>&1
    fi
    
    mongod --dbpath ~/data/db --fork --logpath ~/mongod.log 2>/dev/null || true
    sleep 2
fi
echo "   ✓ MongoDB está ejecutándose"

# Instalar dependencias
echo ""
echo "[3/5] Instalando dependencias npm..."
cd "$(dirname "$0")/mongo"

if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -ne 0 ]; then
        echo "ERROR: No se pudieron instalar las dependencias!"
        exit 1
    fi
else
    echo "   ✓ Dependencias ya instaladas"
fi
echo "   ✓ npm instalado correctamente"

# Crear estructura de BD
echo ""
echo "[4/5] Creando estructura de base de datos..."
npm run setup
if [ $? -ne 0 ]; then
    echo "ERROR: No se pudo crear la estructura de BD!"
    exit 1
fi
echo "   ✓ Estructura de BD creada"

# Poblar datos
echo ""
echo "[5/5] Poblando datos iniciales..."
npm run seed
if [ $? -ne 0 ]; then
    echo "ERROR: No se pudieron poblar los datos!"
    exit 1
fi
echo "   ✓ Datos iniciales cargados"

echo ""
echo "================================================================"
echo "  ✓ INSTALACIÓN COMPLETADA EXITOSAMENTE"
echo "================================================================"
echo ""
echo "PRÓXIMOS PASOS:"
echo ""
echo "1. Para iniciar el servidor API:"
echo "   cd mongo"
echo "   npm run api"
echo ""
echo "2. Luego abre en tu navegador:"
echo "   http://localhost:8080"
echo ""
echo "3. O abre el archivo index.html directamente en el navegador"
echo ""
echo "================================================================"
echo ""

#!/bin/bash

# ================================================================
# Script para ejecutar la app - MUNDIAL 2026 PROJECT
# ================================================================

echo ""
echo "================================================================"
echo "  INICIANDO MUNDIAL 2026 API SERVER"
echo "================================================================"
echo ""

# Verificar MongoDB
echo "Verificando MongoDB..."
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠ MongoDB no está ejecutándose. Iniciando..."
    
    # Detectar el OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew services start mongodb-community &>/dev/null 2>&1
    fi
    
    mongod --dbpath ~/data/db --fork --logpath ~/mongod.log 2>/dev/null || true
    sleep 2
fi
echo "✓ MongoDB está ejecutándose"
echo ""

# Cambiar al directorio mongo
cd "$(dirname "$0")/mongo"

# Instalar dependencias si no existen
if [ ! -d "node_modules" ]; then
    echo "Instalando dependencias..."
    npm install
    echo ""
fi

# Iniciar el servidor
echo "Iniciando servidor en puerto 8080..."
echo "Abre http://localhost:8080 en tu navegador"
echo ""
echo "Presiona Ctrl+C para detener el servidor"
echo ""
echo "================================================================"
echo ""

npm run api

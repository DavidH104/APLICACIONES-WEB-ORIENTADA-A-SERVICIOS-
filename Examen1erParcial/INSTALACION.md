# 📦 Guía de Instalación - MUNDIAL 2026

## 🚀 Instalación Rápida

### Windows
1. Descarga el archivo **`install.bat`**
2. Haz doble clic para ejecutarlo
3. El instalador:
   - ✓ Verifica Node.js y MongoDB
   - ✓ Instala las dependencias
   - ✓ Crea la base de datos
   - ✓ Carga los datos iniciales

### macOS / Linux
1. Abre Terminal en la carpeta del proyecto
2. Ejecuta:
   ```bash
   chmod +x install.sh
   ./install.sh
   ```
3. El instalador hará lo mismo que en Windows

---

## ⚠️ Requisitos Previos

### Node.js
- Descarga desde: https://nodejs.org/
- Versión: 16 o superior
- Verifica con: `node --version`

### MongoDB Community
- Descarga desde: https://www.mongodb.com/try/download/community
- **En Windows**: Instálalo como "servicio" durante la instalación
- **En Mac**: Instálalo con `brew install mongodb-community`
- **En Linux**: Sigue la guía oficial para tu distribución

---

## ▶️ Iniciar la Aplicación

### Windows
Haz doble clic en **`start.bat`**

### macOS / Linux
En Terminal:
```bash
chmod +x start.sh
./start.sh
```

---

## 🌐 Acceder a la Aplicación

Una vez que el servidor esté corriendo:
1. Abre tu navegador
2. Ve a: **http://localhost:8080**

O si prefieres acceder directamente al frontend:
- Haz doble clic en **`index.html`**

---

## 📁 Estructura del Proyecto

```
Examen1erParcial/
├── install.bat              ← Ejecutar en Windows para instalar
├── install.sh               ← Ejecutar en Mac/Linux para instalar
├── start.bat                ← Ejecutar en Windows para iniciar
├── start.sh                 ← Ejecutar en Mac/Linux para iniciar
├── index.html               ← Frontend de la aplicación
├── app.js                   ← Lógica principal
├── styles.css               ← Estilos
├── equipos.json             ← Datos de equipos
├── clasificaciones.json     ← Clasificaciones
├── noticias.json            ← Noticias
├── promociones.json         ← Promociones
│
└── mongo/
    ├── package.json         ← Dependencias npm
    ├── api-server.js        ← Servidor API en Node.js
    ├── setup.js             ← Crea la estructura de BD
    ├── seed.js              ← Carga los datos iniciales
    ├── queries.js           ← Ejemplos de consultas
    └── node_modules/        ← Dependencias instaladas
```

---

## 🛠️ Comandos Disponibles

### Para instalar manualmente
```bash
cd mongo
npm install
npm run setup    # Crea colecciones
npm run seed     # Carga datos
npm run api      # Inicia servidor
```

### Para consultar datos
```bash
npm run queries  # Ejecuta todas las consultas
npm run view     # Visualiza la BD
```

---

## ❌ Solución de Problemas

### "MongoDB no está instalado"
1. Descarga MongoDB desde: https://www.mongodb.com/try/download/community
2. En Windows, marca "Install MongoDB as a Service"
3. Vuelve a ejecutar el instalador

### "Node.js no está instalado"
1. Descarga Node.js desde: https://nodejs.org/
2. Ejecuta el instalador (elige "Add to PATH")
3. Reinicia la terminal y vuelve a intentar

### "Puerto 8080 ya está en uso"
Modifica `mongo/api-server.js`, línea 365:
```javascript
const PORT = 9090;  // Cambia a otro puerto
```

### MongoDB no inicia automáticamente
1. Abre PowerShell como Administrador (Windows)
2. Ejecuta: `net start MongoDB`
3. O inicia mongod manualmente desde el símbolo del sistema

---

## 📧 ¿Necesitas ayuda?

Si algo no funciona:
1. Verifica que MongoDB esté ejecutándose
2. Verifica que Node.js esté instalado correctamente
3. Limpia `node_modules` y reinstala: `npm install`
4. Revisa los mensajes de error en la terminal

---

**¡Disfruta el proyecto del Mundial 2026!** ⚽🌍

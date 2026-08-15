# 🌍 MUNDIAL 2026 - Proyecto Instalable

> **Sistema inteligente de simulación del Mundial 2026 con MongoDB, Node.js y Frontend interactivo**

## 🚀 Inicio Rápido

### Para instalarlo por primera vez:

**Windows:**
```bash
# Solo haz doble clic aquí:
install.bat
```

**Mac/Linux:**
```bash
chmod +x install.sh
./install.sh
```

### Para ejecutar después:

**Windows:**
```bash
start.bat
```

**Mac/Linux:**
```bash
./start.sh
```

Luego abre: **http://localhost:8080**

---

## 📋 ¿Qué hace cada archivo?

### Instalación
| Archivo | Descripción |
|---------|------------|
| `install.bat` | Instalador automático para Windows |
| `install.sh` | Instalador automático para Mac/Linux |
| `create-installer.bat` | Crea un ZIP comprimido para compartir |

### Ejecución
| Archivo | Descripción |
|---------|------------|
| `start.bat` | Inicia la app en Windows |
| `start.sh` | Inicia la app en Mac/Linux |

### Documentación
| Archivo | Descripción |
|---------|------------|
| `INSTALACION.md` | Guía completa de instalación |
| `PORTABILIDAD.md` | Cómo compartir el proyecto con otros |
| `README.md` | Estructura del mongo/ folder |
| `PROYECTO_MONGODB.md` | Detalles del diseño |

### Aplicación
| Archivo | Descripción |
|---------|------------|
| `index.html` | Frontend interactivo |
| `app.js` | Lógica principal |
| `styles.css` | Estilos CSS |
| `mongo/api-server.js` | Servidor Node.js + API |
| `mongo/package.json` | Dependencias npm |

### Datos
| Archivo | Descripción |
|---------|------------|
| `equipos.json` | Equipos del mundial |
| `partidos.json` | Partidos programados |
| `clasificaciones.json` | Tabla de posiciones |
| `noticias.json` | Noticias del evento |
| `promociones.json` | Promociones especiales |

---

## 📦 Compartir con Otros

### Opción 1: Archivo ZIP (Recomendado)
```bash
# Ejecuta este comando
create-installer.bat
```
Se crea un archivo `MUNDIAL2026_*.zip` listo para compartir.

### Opción 2: GitHub
```bash
git push origin main
# Comparte el link del repositorio
```

### Opción 3: Carpeta USB
1. Copia toda la carpeta `Examen1erParcial/`
2. Elimina `mongo/node_modules/` (opcional, reduce tamaño)
3. Cópiala a USB
4. El receptor ejecuta `install.bat`

---

## ⚙️ Requisitos del Sistema

El usuario que reciba el proyecto necesita tener instalado:

- **Node.js** v16+ → https://nodejs.org/
- **MongoDB Community** → https://www.mongodb.com/try/download/community

El instalador verifica automáticamente que estén instalados.

---

## 🔧 Comandos Manuales (si quieres más control)

```bash
# Cambiar a la carpeta mongo
cd mongo

# Instalar dependencias
npm install

# Crear estructura de BD
npm run setup

# Cargar datos iniciales
npm run seed

# Ejecutar todas las consultas
npm run queries

# Ver la BD
npm run view

# Iniciar servidor API
npm run api
```

---

## 🎯 Características Principales

✅ **Base de datos MongoDB** con 6 grupos y 24 selecciones
✅ **Motor de simulación** con algoritmo Monte Carlo
✅ **Índice de Fuerza (IF)** basado en 15+ variables
✅ **Ranking ELO dinámico** que se actualiza con partidos
✅ **API REST** en Node.js
✅ **Frontend interactivo** con mapas y datos en tiempo real
✅ **Panel de administración** para ajustar simulaciones
✅ **Soporte multiplataforma** (Windows, Mac, Linux)

---

## 📊 Estructura de Carpetas

```
Examen1erParcial/
├── 📄 install.bat              ← Ejecutar primero
├── 📄 install.sh
├── 📄 start.bat                ← Luego ejecutar esto
├── 📄 start.sh
├── 📄 create-installer.bat     ← Para compartir
│
├── 📄 index.html               ← Frontend
├── 📄 app.js
├── 📄 styles.css
├── 📄 equipos.json
├── 📄 partidos.json
├── 📄 noticias.json
├── 📄 clasificaciones.json
├── 📄 promociones.json
│
├── 📁 mongo/                   ← Backend + BD
│   ├── package.json
│   ├── api-server.js           ← Servidor principal
│   ├── setup.js
│   ├── seed.js
│   ├── queries.js
│   └── node_modules/           ← Se instala automáticamente
│
├── 📁 assets/                  ← Datos geográficos
│   └── geojson/
│
└── 📄 Documentación...
    ├── INSTALACION.md
    ├── PORTABILIDAD.md
    ├── PROYECTO_MONGODB.md
    └── ENTREGA_2.md
```

---

## ✅ Checklist de Instalación

- [ ] Descargar/Clonar el proyecto
- [ ] Ejecutar `install.bat` (o `install.sh`)
- [ ] Esperar a que termine (mostrará ✓ COMPLETADA)
- [ ] Ejecutar `start.bat` (o `start.sh`)
- [ ] Abrir http://localhost:8080
- [ ] ¡Disfrutar!

---

## ❌ Problemas Comunes

**P: "MongoDB no está instalado"**
- R: Descárgalo desde https://www.mongodb.com/try/download/community

**P: "Node.js no está instalado"**
- R: Descárgalo desde https://nodejs.org/

**P: "El puerto 8080 ya está en uso"**
- R: Cambia el puerto en `mongo/api-server.js` línea ~365

**P: "Instalador dice que no está en la carpeta correcta"**
- R: Ejecuta `install.bat` desde la carpeta `Examen1erParcial`, no desde una subcarpeta

---

## 📚 Documentación Completa

- [INSTALACION.md](./INSTALACION.md) - Guía paso a paso
- [PORTABILIDAD.md](./PORTABILIDAD.md) - Cómo compartir
- [PROYECTO_MONGODB.md](./PROYECTO_MONGODB.md) - Diseño de BD
- [ENTREGA_2.md](./ENTREGA_2.md) - Características avanzadas
- [mongo/README.md](./mongo/README.md) - Detalles técnicos

---

## 🎓 Para Profesores/Evaluadores

Este proyecto incluye:

✅ **9 Colecciones MongoDB** (Requerimiento 1)
✅ **6 Grupos con 4 equipos cada uno** (24 selecciones)
✅ **15 Consultas complejas** implementadas
✅ **Motor de simulación con Poisson**
✅ **Índice de Fuerza (IF) dinámico**
✅ **Ranking ELO**
✅ **API REST completa**
✅ **Frontend interactivo**
✅ **Instalador automático**

Ver [ENTREGA_2.md](./ENTREGA_2.md) para todos los detalles.

---

## 📞 Soporte

Si algo no funciona:
1. Verifica que MongoDB esté ejecutándose
2. Verifica que Node.js esté instalado (`node --version`)
3. Limpia y reinstala: `cd mongo && npm install`
4. Revisa los mensajes de error en la terminal

---

**¡Disfruta explorando el Mundial 2026!** ⚽🌍🎯

**Versión**: 1.0.0 | **Última actualización**: Agosto 2026

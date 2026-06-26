# PROYECTO: MUNDIAL 2026 - MONGODB

## Estructura del proyecto

```
c:\Users\HP\Downloads\Examen1erParcial
├── app.js                          # Aplicación original (no modificada)
├── equipos.json                    # Datos de equipos originales
├── index.html                      # Frontend original
├── promociones.json                # Promociones originales
├── styles.css                      # Estilos originales
│
└── mongo/                          # CARPETA NUEVA CON LA BD
    ├── package.json                # Dependencias Node.js
    ├── README.md                   # Guía de instalación
    ├── schema-design.md            # Diagrama ER detallado
    ├── queries.md                  # Documentación de consultas
    ├── ENTREGA_1.md                # DOCUMENTO COMPLETO DE ENTREGA (USAR PARA PDF)
    │
    ├── setup.js                    # Script para crear colecciones
    ├── seed.js                     # Script para insertar datos (6 grupos + 24 selecciones)
    ├── view.js                     # Script para ver la BD
    ├── insert-test.js              # Script para insertar datos de prueba
    ├── queries.js                  # Script para ejecutar todas las consultas
    │
    └── node_modules/               # Dependencias instaladas
```

## Qué se hizo

### 1. Tablas/Colecciones (9 requeridas)

✅ **continentes** - 6 continentes con confederaciones (UEFA, CONMEBOL, CONCACAF, CAF, AFC, OFC)
✅ **grupos** - 6 grupos (A-F) de 4 equipos cada uno
✅ **selecciones** - 24 selecciones distribuidas en los 6 grupos
✅ **estadios** - 3 estadios en México, EE.UU. y Canadá
✅ **fase_final** - 5 fases (Dieciseisavos, Octavos, Cuartos, Semifinal, Final)
✅ **partidos** - 12+ partidos de la fase de grupos
✅ **usuarios** - 3 usuarios de prueba
✅ **boletos** - 3 boletos de prueba
✅ **clasificaciones** - Tabla de posiciones para todos los equipos

### 2. Datos capturados: 6 Grupos completos (A-F)

**Grupo A (CONCACAF)**
- México (Ranking: 15)
- Estados Unidos (Ranking: 12)
- Canadá (Ranking: 50)
- Costa Rica (Ranking: 30)

**Grupo B (CONMEBOL)**
- Brasil (Ranking: 1)
- Argentina (Ranking: 2)
- Uruguay (Ranking: 17)
- Colombia (Ranking: 14)

**Grupo C (UEFA)**
- Francia (Ranking: 3)
- Alemania (Ranking: 4)
- España (Ranking: 6)
- Inglaterra (Ranking: 5)

**Grupo D (CAF)**
- Senegal (Ranking: 20)
- Marruecos (Ranking: 22)
- Egipto (Ranking: 45)
- Ghana (Ranking: 60)

**Grupo E (AFC)**
- Japón (Ranking: 24)
- Corea del Sur (Ranking: 28)
- Arabia Saudita (Ranking: 55)
- Irán (Ranking: 34)

**Grupo F (AFC/Oceanía)**
- Australia (Ranking: 20)
- Nueva Zelanda (Ranking: 100)
- Catar (Ranking: 40)
- Emiratos Árabes Unidos (Ranking: 70)

### 3. Relaciones (Referencias FK/PK simuladas)

- CONTINENTES → SELECCIONES (1:N)
- GRUPOS → SELECCIONES (1:N)
- ESTADIOS → PARTIDOS (1:N)
- FASE_FINAL → PARTIDOS (1:N)
- SELECCIONES → PARTIDOS (1:N, equipo_local y equipo_visitante)
- USUARIOS → BOLETOS (1:N)
- BOLETOS → SELECCIONES (1:N)
- GRUPOS → CLASIFICACIONES (1:N)
- SELECCIONES → CLASIFICACIONES (1:N)

### 4. Consultas implementadas (8 solicitadas + 7 adicionales)

**Solicitadas:**
1. ✅ id_continente, Continente, Confederación y País
2. ✅ Búsqueda por confederaciones (una de cada)
3. ✅ id_Selección, Selección, Continente, Confederación, historia, ventajas, desventajas, ranking
4. ✅ Top 10 mejor rankeados
5. ✅ NomSelección, Grupo, Partidos, Estadio, Capacidad, Latitud, Longitud
6. ✅ Búsqueda con coordenadas para Google Maps
7. ✅ Bandera, Selección, Partidos jugados, Goles, Juegos, Puntos
8. ✅ Continente, Confederación, Selección, Estadio, Ubicación, Fecha, Horario, Costo

**Adicionales (5+):**
9. ✅ Selecciones por continente
10. ✅ Estadios en México con capacidad > 80K
11. ✅ Partidos con fase
12. ✅ Promedio de puntos por grupo
13. ✅ Top 5 por ranking
14. ✅ Boletos vendidos por estadio
15. ✅ Selecciones con mayor diferencia de goles

## 9.2 Backend — MongoDB

### Evidencia 5 — Ejecución de setup.js (Creación de Colecciones)

[INSERTAR CAPTURA: Terminal mostrando la salida de npm run setup]

Descripción: Salida del script setup.js confirmando la creación exitosa de las 9 colecciones con validación de esquema JSON e índices en la base de datos mundial2026.

Comando ejecutado:
```bash
npm run setup
```

Salida esperada:
```text
Conectado a mongodb://localhost:27017/mundial2026
Creando colección continentes...
Creando colección grupos...
Creando colección selecciones...
Creando colección estadios...
Creando colección fase_final...
Creando colección partidos...
Creando colección clasificaciones...
Creando colección usuarios...
Creando colección boletos...
Índices creados.
Estructura de la base de datos creada correctamente.
```

## Cómo usar

### Paso 1: Navega a la carpeta mongo

```bash
cd c:\Users\HP\Downloads\Examen1erParcial\mongo
```

### Paso 2: Instala las dependencias

```bash
npm install
```

Esto instala el driver de MongoDB (v7.3.0).

### Paso 3: Crea la base de datos

```bash
npm run setup
```

Crea las 9 colecciones con validación JSON Schema y crea índices.

### Paso 4: Carga los datos

```bash
npm run seed
```

Inserta 6 grupos, 24 selecciones, 3 estadios, partidos, usuarios, boletos y clasificaciones.

### Paso 5: Visualiza los datos

Opción A - Con script Node:
```bash
npm run view
```

Opción B - Con MongoDB for VS Code:
- Abre la extensión de MongoDB
- Conéctate a `localhost:27017`
- Navega a la BD `mundial2026`
- Explora las colecciones

### Paso 6: Ejecuta las consultas

```bash
npm run queries
```

Ejecuta todas las 8 consultas solicitadas + ejemplos.

## Documentación

- **ENTREGA_1.md** ← **USE ESTO PARA EL PDF**
  - Información general del equipo
  - Diagrama ER completo
  - 6 grupos capturados
  - Todas las 8 consultas solicitadas con resultados
  - 7 consultas adicionales
  - Instrucciones de ejecución

- **schema-design.md** - Detalle técnico del modelo
- **queries.md** - Referencia rápida de todas las queries
- **README.md** - Guía de instalación

## Verificación de requisitos

- ✅ Base de datos completa en MongoDB local
- ✅ 9 colecciones / tablas requeridas
- ✅ Validación de esquema (JSON Schema)
- ✅ Índices en campos FK
- ✅ 6+ grupos capturados (tienes 6 completos)
- ✅ 8 consultas solicitadas implementadas
- ✅ 7+ consultas adicionales implementadas
- ✅ Documentación completa en ENTREGA_1.md
- ✅ Archivo de BD (mongoDB en localhost)
- ✅ Diagrama ER detallado

## Próximos pasos (opcional)

1. Exporta ENTREGA_1.md a PDF usando Pandoc o Word:
```bash
# Con Pandoc (si está instalado)
pandoc ENTREGA_1.md -o ENTREGA_1.pdf
```

2. Adjunta:
   - ENTREGA_1.pdf (con tu info de equipo)
   - La carpeta `mongo/` completa
   - Screenshots de las consultas ejecutadas en MongoDB

## Soporte

Para ejecutar cualquier script, asegúrate de:
- Tener MongoDB running en `localhost:27017`
- Estar en la carpeta `mongo/`
- Haber ejecutado `npm install`

Si hay error de conexión:
```bash
# Verifica que MongoDB esté corriendo (en otra terminal)
mongod --dbpath "C:\data\db"
```

---

**Proyecto completado: 2026-06-24**

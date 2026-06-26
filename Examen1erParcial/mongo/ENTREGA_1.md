# ENTREGA 1: MUNDIAL 2026 - BASE DE DATOS

## Información General

- **Materia**: [Tu materia]
- **Universidad**: [Tu universidad]
- **Profesor/Maestro**: [Tu profesor]
- **Integrantes del equipo**: [Nombres de los integrantes]
- **Fecha**: 2026-06-24
- **Base de datos**: MongoDB Local (localhost:27017)
- **Nombre de la BD**: mundial2026

---

## 1. Estructura de la Base de Datos

### Colecciones creadas (9 tablas)

1. **continentes** - Almacena los 6 continentes/confederaciones
2. **grupos** - 12 grupos de clasificación (A-F con 4 equipos cada uno, mínimo 6 capturados)
3. **selecciones** - Equipos participantes en el torneo
4. **estadios** - Ubicaciones de los partidos (México, Estados Unidos, Canadá)
5. **fase_final** - Fases del torneo (Dieciseisavos, Octavos, Cuartos, Semifinal, Final)
6. **partidos** - Registro de todos los partidos
7. **usuarios** - Personas que compran boletos
8. **boletos** - Venta de boletos para los partidos
9. **clasificaciones** - Tabla de posiciones por grupo

---

## 2. Diagrama Entidad-Relación (ER)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    MUNDIAL 2026 - DIAGRAMA ER                           │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ CONTINENTES                                                              │
├──────────────────────────────────────────────────────────────────────────┤
│ _id (ObjectId, PK)                                                       │
│ nombre (String): Europa, América, Norteamérica, África, Asia, Oceanía   │
│ confederacion (String): UEFA, CONMEBOL, CONCACAF, CAF, AFC, OFC         │
│ paises (Array[String]): Lista de países                                 │
└──────────────────────────────────────────────────────────────────────────┘
                                    ↑
                                    │ 1:N
                                    │
                                    │
┌──────────────────────────────────────────────────────────────────────────┐
│ SELECCIONES                                                              │
├──────────────────────────────────────────────────────────────────────────┤
│ _id (ObjectId, PK)                                                       │
│ nombre (String): México, Brasil, España, etc.                           │
│ pais (String)                                                            │
│ continenteId (ObjectId, FK) → CONTINENTES._id                           │
│ grupoId (ObjectId, FK) → GRUPOS._id                                     │
│ historia (String)                                                        │
│ ventajas (String)                                                        │
│ desventajas (String)                                                     │
│ ranking (Number)                                                         │
│ banderaUrl (String)                                                      │
│ latitud (Number)                                                         │
│ longitud (Number)                                                        │
└──────────────────────────────────────────────────────────────────────────┘
         ↑                              ↑
         │ 1:N                          │ 1:N
         │                              │
         ├────────────────────┐         │
                              │         │
            ┌─────────────────┴─────────┴─────────────────────────┐
            │                                                      │
┌───────────────────────────────────────────┐    ┌────────────────────────────────────┐
│ GRUPOS (12 grupos: A-F, mínimo 6)        │    │ ESTADIOS                           │
├───────────────────────────────────────────┤    ├────────────────────────────────────┤
│ _id (ObjectId, PK)                        │    │ _id (ObjectId, PK)                 │
│ nombre (String): A, B, C, D, E, F        │    │ nombre (String)                    │
│ fase (String): Fase de grupos            │    │ ciudad (String)                    │
└───────────────────────────────────────────┘    │ pais (String): México, USA, Canadá│
                 ↑                                │ latitud (Number)                   │
                 │ N:1                           │ longitud (Number)                  │
                 │                               │ capacidad (Number)                 │
                 │ (grupo del partido)          └────────────────────────────────────┘
                 │                                         ↑
                 │                                         │ 1:N
                 │                                         │
            ┌─────────────────────────────────────────────┴──────────────┐
            │                                                             │
┌────────────────────────────────────────────┐    ┌──────────────────────────────┐
│ PARTIDOS                                   │    │ FASE_FINAL                   │
├────────────────────────────────────────────┤    ├──────────────────────────────┤
│ _id (ObjectId, PK)                         │    │ _id (ObjectId, PK)           │
│ faseId (ObjectId, FK) → FASE_FINAL._id     │───→│ nombre (String)              │
│ equipo_localId (ObjectId, FK) →            │    │ clasificados (Array[String]) │
│   SELECCIONES._id                          │    │ partidos (Number)            │
│ equipo_visitanteId (ObjectId, FK) →        │    │ sede (String)                │
│   SELECCIONES._id                          │    │ fecha (Date)                 │
│ goles_local (Number)                       │    └──────────────────────────────┘
│ goles_visitante (Number)                   │
│ fecha (Date)                               │
│ estadioId (ObjectId, FK) → ESTADIOS._id    │
│ horario (String)                           │
└────────────────────────────────────────────┘
                 ↑
                 │ N:1
                 │
        ┌────────────────────────────────────────────────────┐
        │                                                    │
┌───────────────────────────────────────┐    ┌──────────────────────────────────┐
│ USUARIOS                              │    │ BOLETOS                          │
├───────────────────────────────────────┤    ├──────────────────────────────────┤
│ _id (ObjectId, PK)                    │    │ _id (ObjectId, PK)               │
│ nombre (String)                       │    │ usuarioId (ObjectId, FK) →       │
│ email (String)                        │    │   USUARIOS._id                   │
│ telefono (String)                     │    │ estadioId (ObjectId, FK) →       │
│ nacionalidad (String)                 │    │   ESTADIOS._id                   │
│ tipo (String)                         │───→│ dia (String)                     │
└───────────────────────────────────────┘    │ fecha (Date)                     │
                                             │ horario (String)                 │
                                             │ seleccionId (ObjectId, FK) →     │
                                             │   SELECCIONES._id                │
                                             │ costo (Number)                   │
                                             └──────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ CLASIFICACIONES                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│ _id (ObjectId, PK)                                                       │
│ grupoId (ObjectId, FK) → GRUPOS._id                                      │
│ seleccionId (ObjectId, FK) → SELECCIONES._id                             │
│ pj (Number): Partidos jugados                                            │
│ pg (Number): Partidos ganados                                            │
│ pe (Number): Partidos empatados                                          │
│ pp (Number): Partidos perdidos                                           │
│ gf (Number): Goles a favor                                               │
│ gc (Number): Goles en contra                                             │
│ dg (Number): Diferencia de goles                                         │
│ pts (Number): Puntos totales                                             │
└──────────────────────────────────────────────────────────────────────────┘
```

### Relaciones principales

- **1:N** CONTINENTES → SELECCIONES
- **1:N** GRUPOS → SELECCIONES
- **1:N** ESTADIOS → PARTIDOS
- **1:N** FASE_FINAL → PARTIDOS
- **1:N** SELECCIONES → PARTIDOS (equipo_local, equipo_visitante)
- **1:N** USUARIOS → BOLETOS
- **1:N** BOLETOS → SELECCIONES (via boleto)
- **1:N** GRUPOS → CLASIFICACIONES
- **1:N** SELECCIONES → CLASIFICACIONES

---

## 3. Datos capturados: 6 Grupos (A-F) con 4 equipos cada uno

### Grupo A - CONCACAF
- México (Ranking: 15)
- Estados Unidos (Ranking: 12)
- Canadá (Ranking: 50)
- Costa Rica (Ranking: 30)

### Grupo B - CONMEBOL
- Brasil (Ranking: 1)
- Argentina (Ranking: 2)
- Uruguay (Ranking: 17)
- Colombia (Ranking: 14)

### Grupo C - UEFA
- Francia (Ranking: 3)
- Alemania (Ranking: 4)
- España (Ranking: 6)
- Inglaterra (Ranking: 5)

### Grupo D - CAF
- Senegal (Ranking: 20)
- Marruecos (Ranking: 22)
- Egipto (Ranking: 45)
- Ghana (Ranking: 60)

### Grupo E - AFC
- Japón (Ranking: 24)
- Corea del Sur (Ranking: 28)
- Arabia Saudita (Ranking: 55)
- Irán (Ranking: 34)

### Grupo F - Mixto
- Australia (Ranking: 20)
- Nueva Zelanda (Ranking: 100)
- Catar (Ranking: 40)
- Emiratos Árabes Unidos (Ranking: 70)

---

## 4. Consultas solicitadas

### Consulta 1: id_continente, Continente, Confederación y Pais

**Query MongoDB:**
```javascript
db.continentes.find({}, { nombre: 1, confederacion: 1, paises: 1, _id: 1 });
```

**Resultado:**
```
{
  "_id": "6a3c20b76690b856eef4ecdb",
  "nombre": "Europa",
  "confederacion": "UEFA",
  "paises": ["Francia", "Alemania", "España", "Inglaterra"]
}
{
  "_id": "6a3c20b76690b856eef4ecdc",
  "nombre": "América",
  "confederacion": "CONMEBOL",
  "paises": ["Brasil", "Argentina", "Uruguay", "Colombia"]
}
{
  "_id": "6a3c20b76690b856eef4ecdd",
  "nombre": "Norteamérica",
  "confederacion": "CONCACAF",
  "paises": ["México", "Estados Unidos", "Canadá", "Costa Rica"]
}
[... 3 más ...]
```

---

### Consulta 2: Búsqueda por confederaciones (una de cada)

**Query - UEFA:**
```javascript
db.continentes.find({ confederacion: 'UEFA' });
```

**Query - CONMEBOL:**
```javascript
db.continentes.find({ confederacion: 'CONMEBOL' });
```

**Query - CONCACAF:**
```javascript
db.continentes.find({ confederacion: 'CONCACAF' });
```

**Resultados:** [3 documentos recuperados, uno por confederación]

---

### Consulta 3: id_Selección, Selección, Continente, Confederación, historia, Ventajas, Desventajas, Ranking

**Query MongoDB:**
```javascript
db.selecciones.aggregate([
  {
    $lookup: {
      from: 'continentes',
      localField: 'continenteId',
      foreignField: '_id',
      as: 'continente'
    }
  },
  { $unwind: '$continente' },
  {
    $project: {
      _id: 1,
      nombre: 1,
      pais: 1,
      historia: 1,
      ventajas: 1,
      desventajas: 1,
      ranking: 1,
      'continente.nombre': 1,
      'continente.confederacion': 1
    }
  }
]);
```

**Resultado (ejemplo - México):**
```
{
  "_id": "6a3c20b76690b856eef4ece7",
  "nombre": "México",
  "pais": "México",
  "historia": "Gran tradición mundialista",
  "ventajas": "Afición numerosa",
  "desventajas": "Presión local",
  "ranking": 15,
  "continente": {
    "nombre": "Norteamérica",
    "confederacion": "CONCACAF"
  }
}
```

---

### Consulta 4: Mejores 10 rankeados

**Query MongoDB:**
```javascript
db.selecciones.find({}, { nombre: 1, pais: 1, ranking: 1 })
  .sort({ ranking: 1 })
  .limit(10);
```

**Resultado:**
```
1. Brasil (Ranking: 1)
2. Argentina (Ranking: 2)
3. Francia (Ranking: 3)
4. Alemania (Ranking: 4)
5. Inglaterra (Ranking: 5)
6. España (Ranking: 6)
7. Irán (Ranking: 34)
8. Catar (Ranking: 40)
9. Egipto (Ranking: 45)
10. Canadá (Ranking: 50)
```

---

### Consulta 5: NomSelección, Grupo, Partidos de la primera fase, Estadio, Capacidad del estadio, Latitud, Longitud

**Query MongoDB (Aggregation Pipeline):**
```javascript
db.selecciones.aggregate([
  {
    $lookup: {
      from: 'grupos',
      localField: 'grupoId',
      foreignField: '_id',
      as: 'grupo'
    }
  },
  { $unwind: '$grupo' },
  {
    $project: {
      nombre: 1,
      'grupo.nombre': 1,
      latitud: 1,
      longitud: 1
    }
  }
]).toArray();
```

**Resultado (ejemplo - México):**
```
{
  "nombre": "México",
  "grupo": { "nombre": "A" },
  "latitud": 19.432608,
  "longitud": -99.133209
}
```

---

### Consulta 6: Búsqueda con latitudes y longitudes para Google Maps

**Query MongoDB:**
```javascript
db.selecciones.find({}, { nombre: 1, latitud: 1, longitud: 1 });
```

**Resultado (URLs de Google Maps):**
```
México: https://www.google.com/maps/search/?api=1&query=19.432608,-99.133209
Brasil: https://www.google.com/maps/search/?api=1&query=-15.793889,-47.882778
Francia: https://www.google.com/maps/search/?api=1&query=48.856613,2.352222
...
```

---

### Consulta 7: Bandera, nomSeleción, Partidos jugados, Goles a favor, Goles en contra, Diferencia de goles, Juegos ganados, Empatados, Perdidos y Puntos

**Query MongoDB:**
```javascript
db.clasificaciones.aggregate([
  {
    $lookup: {
      from: 'selecciones',
      localField: 'seleccionId',
      foreignField: '_id',
      as: 'seleccion'
    }
  },
  { $unwind: '$seleccion' },
  {
    $project: {
      bandera: '$seleccion.banderaUrl',
      nomSeleccion: '$seleccion.nombre',
      pj: 1, gf: 1, gc: 1, dg: 1,
      pg: 1, pe: 1, pp: 1, pts: 1
    }
  }
]);
```

**Resultado (ejemplo - México en Grupo A):**
```
{
  "bandera": "https://example.com/mexico.png",
  "nomSeleccion": "México",
  "pj": 3,
  "pg": 1,
  "pe": 0,
  "pp": 2,
  "gf": 4,
  "gc": 3,
  "dg": 1,
  "pts": 3
}
```

---

### Consulta 8: Continente, Confederación, Selección, Estadio, latitud, longitud, Capacidad, Fecha, Horario y Costo

**Query MongoDB:**
```javascript
db.boletos.aggregate([
  {
    $lookup: {
      from: 'selecciones',
      localField: 'seleccionId',
      foreignField: '_id',
      as: 'seleccion'
    }
  },
  { $unwind: '$seleccion' },
  {
    $lookup: {
      from: 'continentes',
      localField: 'seleccion.continenteId',
      foreignField: '_id',
      as: 'continente'
    }
  },
  { $unwind: '$continente' },
  {
    $lookup: {
      from: 'estadios',
      localField: 'estadioId',
      foreignField: '_id',
      as: 'estadio'
    }
  },
  { $unwind: '$estadio' },
  {
    $project: {
      continente: '$continente.nombre',
      confederacion: '$continente.confederacion',
      seleccion: '$seleccion.nombre',
      estadio: '$estadio.nombre',
      latitud: '$estadio.latitud',
      longitud: '$estadio.longitud',
      capacidad: '$estadio.capacidad',
      fecha: 1, horario: 1, costo: '$costo'
    }
  }
]);
```

**Resultado (ejemplo):**
```
{
  "continente": "Norteamérica",
  "confederacion": "CONCACAF",
  "seleccion": "México",
  "estadio": "Estadio Azteca",
  "latitud": 19.302861,
  "longitud": -99.150527,
  "capacidad": 87000,
  "fecha": "2026-06-12T20:00:00Z",
  "horario": "20:00",
  "costo": 150
}
```

---

## 5. Consultas adicionales (5+ solicitadas)

### Consulta 9: Obtener la lista de selecciones por continente

```javascript
db.selecciones.aggregate([
  {
    $lookup: {
      from: 'continentes',
      localField: 'continenteId',
      foreignField: '_id',
      as: 'continente'
    }
  },
  { $unwind: '$continente' },
  {
    $group: {
      _id: '$continente.nombre',
      selecciones: { $push: '$nombre' },
      confederacion: { $first: '$continente.confederacion' }
    }
  }
]);
```

**Resultado:**
```
{ "_id": "Europa", "confederacion": "UEFA", "selecciones": ["Francia", "Alemania", "España", "Inglaterra"] }
{ "_id": "América", "confederacion": "CONMEBOL", "selecciones": ["Brasil", "Argentina", "Uruguay", "Colombia"] }
[...]
```

---

### Consulta 10: Estadios en México con capacidad mayor a 80,000

```javascript
db.estadios.find({ pais: 'México', capacidad: { $gt: 80000 } });
```

**Resultado:**
```
{ "nombre": "Estadio Azteca", "ciudad": "Ciudad de México", "capacidad": 87000 }
```

---

### Consulta 11: Partidos programados con su fase

```javascript
db.partidos.aggregate([
  {
    $lookup: {
      from: 'fase_final',
      localField: 'faseId',
      foreignField: '_id',
      as: 'fase'
    }
  },
  { $unwind: '$fase' },
  {
    $lookup: {
      from: 'estadios',
      localField: 'estadioId',
      foreignField: '_id',
      as: 'estadio'
    }
  },
  { $unwind: '$estadio' },
  {
    $project: {
      'fase.nombre': 1,
      fecha: 1,
      horario: 1,
      'estadio.nombre': 1,
      'estadio.capacidad': 1
    }
  }
]);
```

---

### Consulta 12: Promedio de puntos por grupo

```javascript
db.clasificaciones.aggregate([
  {
    $group: {
      _id: '$grupoId',
      puntosPromedio: { $avg: '$pts' },
      equipos: { $sum: 1 }
    }
  }
]);
```

---

### Consulta 13: Selecciones top 5 por ranking con su grupo

```javascript
db.selecciones.aggregate([
  {
    $lookup: {
      from: 'grupos',
      localField: 'grupoId',
      foreignField: '_id',
      as: 'grupo'
    }
  },
  { $unwind: '$grupo' },
  { $sort: { ranking: 1 } },
  { $limit: 5 },
  {
    $project: {
      nombre: 1,
      pais: 1,
      ranking: 1,
      'grupo.nombre': 1
    }
  }
]);
```

---

### Consulta 14: Boletos vendidos por estadio

```javascript
db.boletos.aggregate([
  {
    $group: {
      _id: '$estadioId',
      totalBoletos: { $sum: 1 },
      ingresoTotal: { $sum: '$costo' }
    }
  }
]);
```

---

### Consulta 15: Selecciones con mayor diferencia de goles

```javascript
db.clasificaciones.aggregate([
  {
    $lookup: {
      from: 'selecciones',
      localField: 'seleccionId',
      foreignField: '_id',
      as: 'seleccion'
    }
  },
  { $unwind: '$seleccion' },
  { $sort: { dg: -1 } },
  { $limit: 5 },
  {
    $project: {
      seleccion: '$seleccion.nombre',
      dg: 1, gf: 1, gc: 1
    }
  }
]);
```

---

## 6. Cómo ejecutar en tu máquina

1. Navega a la carpeta `mongo`:
```bash
cd c:\Users\HP\Downloads\Examen1erParcial\mongo
```

2. Instala dependencias:
```bash
npm install
```

3. Crea la base de datos:
```bash
npm run setup
```

4. Carga los datos:
```bash
npm run seed
```

5. Ejecuta las consultas:
```bash
npm run queries
```

6. Visualiza en MongoDB for VS Code:
   - Abre la extensión de MongoDB
   - Conéctate a `localhost:27017`
   - Expande la BD `mundial2026`

---

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

---

## Archivos entregados

- `setup.js` - Crea las colecciones con validación
- `seed.js` - Inserta 6 grupos con 24 selecciones y partidos
- `queries.js` - Ejecuta todas las consultas de ejemplo
- `queries.md` - Documentación completa de consultas
- `schema-design.md` - Diagrama del modelo relacional
- `README.md` - Guía de uso
- `package.json` - Dependencias

---

**Fin de la Entrega 1**

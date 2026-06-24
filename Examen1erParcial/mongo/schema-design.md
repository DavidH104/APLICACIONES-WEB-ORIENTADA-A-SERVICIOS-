# Diseño de esquema relacional en MongoDB (Mundial 2026)

Base de datos: `mundial2026`

## Tablas / colecciones requeridas

- `continentes`
  - `_id`: ObjectId
  - `nombre`: String
  - `confederacion`: String
  - `paises`: Array[String]

- `grupos`
  - `_id`: ObjectId
  - `nombre`: String
  - `fase`: String

- `selecciones`
  - `_id`: ObjectId
  - `nombre`: String
  - `pais`: String
  - `continenteId`: ObjectId -> `continentes._id`
  - `grupoId`: ObjectId -> `grupos._id`
  - `historia`: String
  - `ventajas`: String
  - `desventajas`: String
  - `ranking`: Number
  - `banderaUrl`: String
  - `latitud`: Number
  - `longitud`: Number

- `estadios`
  - `_id`: ObjectId
  - `nombre`: String
  - `ciudad`: String
  - `pais`: String
  - `latitud`: Number
  - `longitud`: Number
  - `capacidad`: Number

- `partidos`
  - `_id`: ObjectId
  - `faseId`: ObjectId -> `fase_final._id`
  - `equipo_localId`: ObjectId -> `selecciones._id`
  - `equipo_visitanteId`: ObjectId -> `selecciones._id`
  - `goles_local`: Number
  - `goles_visitante`: Number
  - `fecha`: Date
  - `estadioId`: ObjectId -> `estadios._id`
  - `horario`: String

- `clasificaciones`
  - `_id`: ObjectId
  - `grupoId`: ObjectId -> `grupos._id`
  - `seleccionId`: ObjectId -> `selecciones._id`
  - `pj`: Number
  - `pg`: Number
  - `pe`: Number
  - `pp`: Number
  - `gf`: Number
  - `gc`: Number
  - `dg`: Number
  - `pts`: Number

- `fase_final`
  - `_id`: ObjectId
  - `nombre`: String
  - `clasificados`: Array[String]
  - `partidos`: Number
  - `sede`: String
  - `fecha`: Date

- `usuarios`
  - `_id`: ObjectId
  - `nombre`: String
  - `email`: String
  - `telefono`: String
  - `nacionalidad`: String
  - `tipo`: String

- `boletos`
  - `_id`: ObjectId
  - `usuarioId`: ObjectId -> `usuarios._id`
  - `estadioId`: ObjectId -> `estadios._id`
  - `dia`: String
  - `fecha`: Date
  - `horario`: String
  - `seleccionId`: ObjectId -> `selecciones._id`
  - `costo`: Number

> En MongoDB no hay FK estrictas, pero las referencias entre colecciones (`ObjectId`) y los validadores JSON Schema sirven para simular una estructura relacional.

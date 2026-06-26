# Consultas MongoDB para Mundial 2026

Este documento contiene las consultas solicitadas y ejemplos en MongoDB. Usa la base `mundial2026`.

Los datos cargados en el script `seed.js` incluyen selecciones reales de fútbol, estadios y resultados parciales de fase de grupos para poder ejecutar correctamente las consultas.

## Consultas solicitadas

### 1. id_continente, Continente, Confederación y Pais
```js
db.continentes.find({}, { nombre: 1, confederacion: 1, paises: 1, _id: 1 });
```

### 2. Búsqueda por confederaciones (una de cada una)
```js
// UEFA
db.continentes.find({ confederacion: 'UEFA' });

// CONMEBOL
db.continentes.find({ confederacion: 'CONMEBOL' });

// CONCACAF
db.continentes.find({ confederacion: 'CONCACAF' });

// CAF
db.continentes.find({ confederacion: 'CAF' });

// AFC
db.continentes.find({ confederacion: 'AFC' });

// OFC
db.continentes.find({ confederacion: 'OFC' });
```

### 3. id_Selección, Selección, Continente, Confederación, historia, Ventajas, Desventajas, Ranking
```js
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

### 4. Mejores 10 rankeados
```js
db.selecciones.find({}, { nombre: 1, pais: 1, ranking: 1 }).sort({ ranking: 1 }).limit(10);
```

### 5. NomSelección, Grupo, Partidos de la primera fase, Estadio, Capacidad del estadio, Latitud, Longitud
```js
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
    $lookup: {
      from: 'partidos',
      let: { seleccionId: '$_id' },
      pipeline: [
        {
          $match: {
            $expr: {
              $or: [
                { $eq: ['$equipo_localId', '$$seleccionId'] },
                { $eq: ['$equipo_visitanteId', '$$seleccionId'] }
              ]
            }
          }
        }
      ],
      as: 'partidos'
    }
  },
  {
    $lookup: {
      from: 'estadios',
      localField: 'partidos.estadioId',
      foreignField: '_id',
      as: 'estadios'
    }
  },
  {
    $project: {
      nombre: 1,
      'grupo.nombre': 1,
      partidos: 1,
      estadios: { nombre: 1, capacidad: 1 },
      latitud: 1,
      longitud: 1
    }
  }
]);
```

### 6. Búsqueda con latitudes y longitudes y mostrar en Google Maps
```js
db.selecciones.find({}, { nombre: 1, latitud: 1, longitud: 1 });
```

// Para Google Maps:
// https://www.google.com/maps/search/?api=1&query=<LAT>,<LNG>

### 7. Bandera, nomSeleción, Partidos jugados, Goles a favor, Goles en contra, Diferencia de goles, Juegas ganados, Juegos empatados, Juegos perdidos y Puntos totales
```js
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
      pj: 1,
      gf: 1,
      gc: 1,
      dg: 1,
      pg: 1,
      pe: 1,
      pp: 1,
      pts: 1
    }
  }
]);
```

### 8. Continente, Confederación, Selección, Estadio, latitud, longitud, Capacidad del estadio, Fecha de los partidos de la primera fase, Horario y Costos de los boletos
```js
db.boletos.aggregate([
  {
    $lookup: {
      from: 'usuarios',
      localField: 'usuarioId',
      foreignField: '_id',
      as: 'usuario'
    }
  },
  { $unwind: '$usuario' },
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
      fecha: 1,
      horario: 1,
      costo: '$costo'
    }
  }
]);
```

## Consultas adicionales recomendadas

### 9. Selecciones por continente con confederación, ranking y grupo
```js
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
      seleccion: '$nombre',
      pais: 1,
      ranking: 1,
      'continente.confederacion': 1,
      'grupo.nombre': 1
    }
  },
  { $sort: { ranking: 1 } }
]);
```

### 10. Estadios en México con partidos programados y detalles
```js
db.estadios.aggregate([
  {
    $match: { pais: 'México' }
  },
  {
    $lookup: {
      from: 'partidos',
      localField: '_id',
      foreignField: 'estadioId',
      as: 'partidos'
    }
  },
  {
    $lookup: {
      from: 'boletos',
      localField: '_id',
      foreignField: 'estadioId',
      as: 'boletos'
    }
  },
  {
    $project: {
      nombre: 1,
      ciudad: 1,
      capacidad: 1,
      latitud: 1,
      longitud: 1,
      totalPartidos: { $size: '$partidos' },
      boletosVendidos: { $size: '$boletos' },
      ingresoTotal: { $sum: '$boletos.costo' }
    }
  }
]);
```

### 11. Partidos con fase, equipos, estadio y coordenadas
```js
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
      from: 'selecciones',
      localField: 'equipo_localId',
      foreignField: '_id',
      as: 'equipo_local'
    }
  },
  { $unwind: '$equipo_local' },
  {
    $lookup: {
      from: 'selecciones',
      localField: 'equipo_visitanteId',
      foreignField: '_id',
      as: 'equipo_visitante'
    }
  },
  { $unwind: '$equipo_visitante' },
  {
    $lookup: {
      from: 'estadios',
      localField: 'estadioId',
      foreignField: '_id',
      as: 'estadio'
    }xl
  },
  { $unwind: '$estadio' },
  {
    $project: {
      'fase.nombre': 1,
      'equipo_local.nombre': 1,
      'equipo_visitante.nombre': 1,
      goles_local: 1,
      goles_visitante: 1,
      'estadio.nombre': 1,
      'estadio.ciudad': 1,
      'estadio.latitud': 1,
      'estadio.longitud': 1,
      fecha: 1,
      horario: 1
    }
  }
]);
```

### 12. Promedio de puntos por grupo con equipos y confederación
```js
db.clasificaciones.aggregate([
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
    $group: {
      _id: {
        grupoId: '$grupoId',
        grupoNombre: '$grupo.nombre'
      },
      puntosPromedio: { $avg: '$pts' },
      golesFavorPromedio: { $avg: '$gf' },
      equipos: { $sum: 1 },
      confederaciones: { $addToSet: '$continente.confederacion' }
    }
  },
  { $sort: { '_id.grupoNombre': 1 } }
]);
```

### 13. Top 5 equipos por ranking con continente, confederación y grupo
```js
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
    $lookup: {
      from: 'grupos',
      localField: 'grupoId',
      foreignField: '_id',
      as: 'grupo'
    }
  },
  { $unwind: '$grupo' },
  {
    $lookup: {
      from: 'clasificaciones',
      localField: '_id',
      foreignField: 'seleccionId',
      as: 'clasificacion'
    }
  },
  { $unwind: { path: '$clasificacion', preserveNullAndEmptyArrays: true } },
  {
    $project: {
      nombre: 1,
      pais: 1,
      ranking: 1,
      'continente.confederacion': 1,
      'grupo.nombre': 1,
      historia: 1,
      'clasificacion.pts': 1,
      'clasificacion.dg': 1
    }
  },
  { $sort: { ranking: 1 } },
  { $limit: 5 }
]);
```

### 14. Boletos vendidos con usuario, estadio, selección y detalles
```js
db.boletos.aggregate([
  {
    $lookup: {
      from: 'usuarios',
      localField: 'usuarioId',
      foreignField: '_id',
      as: 'usuario'
    }
  },
  { $unwind: '$usuario' },
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
    $lookup: {
      from: 'selecciones',
      localField: 'seleccionId',
      foreignField: '_id',
      as: 'seleccion'
    }
  },
  { $unwind: '$seleccion' },
  {
    $group: {
      _id: {
        estadioId: '$estadioId',
        estadioNombre: '$estadio.nombre'
      },
      totalBoletos: { $sum: 1 },
      ingresoTotal: { $sum: '$costo' },
      ciudadEstadio: { $first: '$estadio.ciudad' },
      capacidad: { $first: '$estadio.capacidad' },
      usuarios: { $sum: 1 }
    }
  },
  { $sort: { ingresoTotal: -1 } }
]);
```

### 15. Selecciones con mayor diferencia de goles, estadísticas y detalles
```js
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
      from: 'grupos',
      localField: 'grupoId',
      foreignField: '_id',
      as: 'grupo'
    }
  },
  { $unwind: '$grupo' },
  {
    $project: {
      seleccion: '$seleccion.nombre',
      pais: '$seleccion.pais',
      'grupo.nombre': 1,
      'continente.confederacion': 1,
      pj: 1, pg: 1, pe: 1, pp: 1,
      gf: 1, gc: 1, dg: 1, pts: 1
    }
  },
  { $sort: { dg: -1 } },
  { $limit: 5 }
]);

### 16. Top 5 estadios donde las selecciones locales metieron más goles
db.partidos.aggregate([
  {
    $group: {
      _id: '$estadioId',
      golesTotales: {
        $sum: { $add: ['$goles_local', '$goles_visitante'] }
      },
      golesLocal: { $sum: '$goles_local' },
      golesVisitante: { $sum: '$goles_visitante' }
    }
  },
  {
    $lookup: {
      from: 'estadios',
      localField: '_id',
      foreignField: '_id',
      as: 'estadio'
    }
  },
  { $unwind: '$estadio' },
  {
    $project: {
      estadio: '$estadio.nombre',
      ciudad: '$estadio.ciudad',
      pais: '$estadio.pais',
      capacidad: '$estadio.capacidad',
      golesTotales: 1,
      golesLocal: 1,
      golesVisitante: 1
    }
  },
  { $sort: { golesTotales: -1 } },
  { $limit: 5 }
])
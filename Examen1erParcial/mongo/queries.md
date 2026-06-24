# Consultas MongoDB para Mundial 2026

Este documento contiene las consultas solicitadas y ejemplos en MongoDB. Usa la base `mundial2026`.

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

### 9. Obtener la lista de selecciones por continente
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
    $group: {
      _id: '$continente.nombre',
      selecciones: { $push: '$nombre' }
    }
  }
]);
```

### 10. Estadios en México con capacidad mayor a 80,000
```js
db.estadios.find({ pais: 'México', capacidad: { $gt: 80000 } });
```

### 11. Partidos programados en la fase de grupos
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
  { $match: { 'fase.nombre': 'Dieciseisavos de final' } },
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
      fecha: 1,
      horario: 1,
      'estadio.nombre': 1,
      'estadio.capacidad': 1
    }
  }
]);
```

### 12. Promedio de puntos por grupo
```js
db.clasificaciones.aggregate([
  {
    $group: {
      _id: '$grupoId',
      puntosPromedio: { $avg: '$pts' }
    }
  }
]);
```

### 13. Jugadores con mejor diferencia de gol
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
  { $sort: { dg: -1 } },
  { $limit: 5 },
  {
    $project: {
      seleccion: '$seleccion.nombre',
      dg: 1,
      gf: 1,
      gc: 1
    }
  }
]);
```

### 14. Boletos vendidos por estadio
```js
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

### 15. Selecciones top 5 por ranking con su grupo
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

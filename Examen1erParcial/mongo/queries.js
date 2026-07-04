import { MongoClient } from 'mongodb';

const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'mundial2026';

async function run() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);

    console.log('1. Búsqueda por confederaciones');
    console.log(JSON.stringify(await db.collection('continentes').aggregate([
      { $group: { _id: '$confederacion', continente: { $first: '$continente' }, pais: { $first: { $arrayElemAt: ['$paises_incluidos', 0] } } } },
      { $project: { _id: 0, confederacion: '$_id', continente: 1, pais: 1 } },
      { $sort: { confederacion: 1 } }
    ]).toArray(), null, 2));

    console.log('\n2. Mejores 10 rankeados');
    console.log(JSON.stringify(await db.collection('selecciones').aggregate([
      { $lookup: { from: 'continentes', localField: 'continente_id', foreignField: '_id', as: 'continente' } },
      { $unwind: '$continente' },
      { $project: { _id: 1, seleccion: '$nombre', continente: '$continente.continente', confederacion: '$continente.confederacion', historia: 1, ventajas: 1, desventajas: 1, ranking: 1 } },
      { $sort: { ranking: 1 } },
      { $limit: 10 }
    ]).toArray(), null, 2));

    console.log('\n3. Consulta para mapas');
    console.log(JSON.stringify(await db.collection('selecciones').aggregate([
      { $lookup: { from: 'grupos', localField: 'grupo_id', foreignField: '_id', as: 'grupo' } },
      { $unwind: '$grupo' },
      { $lookup: { from: 'partidos', let: { seleccionId: '$_id' }, pipeline: [{ $match: { $expr: { $or: [{ $eq: ['$equipo_local_id', '$$seleccionId'] }, { $eq: ['$equipo_visitante_id', '$$seleccionId'] }] } } }, { $match: { fase: 'Grupos' } }], as: 'partidos' } },
      { $lookup: { from: 'estadios', localField: 'partidos.estadio_id', foreignField: '_id', as: 'estadios' } },
      { $project: { _id: 0, seleccion: '$nombre', grupo: '$grupo.nombre', partidos: { $map: { input: '$partidos', as: 'partido', in: { fecha: '$$partido.fecha', fase: '$$partido.fase', goles_local: '$$partido.goles_local', goles_visitante: '$$partido.goles_visitante' } } }, estadio: { $arrayElemAt: ['$estadios.nombre', 0] }, capacidad: { $arrayElemAt: ['$estadios.capacidad', 0] }, latitud: '$geolocalizacion.latitud', longitud: '$geolocalizacion.longitud' } }
    ]).toArray(), null, 2));

    console.log('\n4. Tabla de grupos');
    console.log(JSON.stringify(await db.collection('clasificaciones').aggregate([
      { $lookup: { from: 'selecciones', localField: 'seleccion_id', foreignField: '_id', as: 'seleccion' } },
      { $unwind: '$seleccion' },
      { $lookup: { from: 'grupos', localField: 'grupo_id', foreignField: '_id', as: 'grupo' } },
      { $unwind: '$grupo' },
      { $project: { _id: 0, bandera: '$seleccion.bandera_url', seleccion: '$seleccion.nombre', grupo: '$grupo.nombre', pj: 1, pg: 1, pe: 1, pp: 1, gf: 1, gc: 1, dg: 1, pts: 1 } },
      { $sort: { grupo: 1, pts: -1 } }
    ]).toArray(), null, 2));

    console.log('\n5. Consulta general de boletos');
    console.log(JSON.stringify(await db.collection('boletos').aggregate([
      { $lookup: { from: 'selecciones', localField: 'seleccion_id', foreignField: '_id', as: 'seleccion' } },
      { $unwind: '$seleccion' },
      { $lookup: { from: 'continentes', localField: 'seleccion.continente_id', foreignField: '_id', as: 'continente' } },
      { $unwind: '$continente' },
      { $lookup: { from: 'estadios', localField: 'estadio_id', foreignField: '_id', as: 'estadio' } },
      { $unwind: '$estadio' },
      { $project: { _id: 0, continente: '$continente.continente', confederacion: '$continente.confederacion', seleccion: '$seleccion.nombre', estadio: '$estadio.nombre', latitud: '$estadio.latitud', longitud: '$estadio.longitud', capacidad: '$estadio.capacidad', fecha: 1, horario: 1, costo: 1 } }
    ]).toArray(), null, 2));

    console.log('\n6. Top 5 estadios con más goles locales');
    console.log(JSON.stringify(await db.collection('partidos').aggregate([
      { $group: { _id: '$estadio_id', goles_locales: { $sum: '$goles_local' } } },
      { $lookup: { from: 'estadios', localField: '_id', foreignField: '_id', as: 'estadio' } },
      { $unwind: '$estadio' },
      { $project: { _id: 0, estadio: '$estadio.nombre', ciudad: '$estadio.ciudad', goles_locales: 1 } },
      { $sort: { goles_locales: -1 } },
      { $limit: 5 }
    ]).toArray(), null, 2));

    console.log('\n7. Promedio de costo de boletos por selección');
    console.log(JSON.stringify(await db.collection('boletos').aggregate([
      { $lookup: { from: 'selecciones', localField: 'seleccion_id', foreignField: '_id', as: 'seleccion' } },
      { $unwind: '$seleccion' },
      { $group: { _id: '$seleccion.nombre', promedio_costo: { $avg: '$costo' }, boletos: { $sum: 1 } } },
      { $sort: { promedio_costo: -1 } }
    ]).toArray(), null, 2));

    console.log('\n8. Selecciones eliminadas en dieciseisavos');
    console.log(JSON.stringify(await db.collection('partidos').aggregate([
      { $match: { fase: 'Dieciseisavos' } },
      { $project: { _id: 0, local_id: '$equipo_local_id', visitante_id: '$equipo_visitante_id', goles_local: 1, goles_visitante: 1 } },
      { $lookup: { from: 'selecciones', localField: 'local_id', foreignField: '_id', as: 'local' } },
      { $unwind: '$local' },
      { $lookup: { from: 'selecciones', localField: 'visitante_id', foreignField: '_id', as: 'visitante' } },
      { $unwind: '$visitante' },
      { $project: { local: '$local.nombre', visitante: '$visitante.nombre', goles_local: 1, goles_visitante: 1, eliminado: { $cond: [{ $gt: ['$goles_local', '$goles_visitante'] }, '$visitante.nombre', '$local.nombre'] } } }
    ]).toArray(), null, 2));

    console.log('\n9. Clasificación general por puntos');
    console.log(JSON.stringify(await db.collection('clasificaciones').aggregate([
      { $lookup: { from: 'selecciones', localField: 'seleccion_id', foreignField: '_id', as: 'seleccion' } },
      { $unwind: '$seleccion' },
      { $project: { _id: 0, seleccion: '$seleccion.nombre', pts: 1 } },
      { $sort: { pts: -1 } }
    ]).toArray(), null, 2));

    console.log('\n10. Próximos partidos por fecha');
    console.log(JSON.stringify(await db.collection('partidos').aggregate([
      { $sort: { fecha: 1 } },
      { $limit: 5 },
      { $lookup: { from: 'selecciones', localField: 'equipo_local_id', foreignField: '_id', as: 'local' } },
      { $unwind: '$local' },
      { $lookup: { from: 'selecciones', localField: 'equipo_visitante_id', foreignField: '_id', as: 'visitante' } },
      { $unwind: '$visitante' },
      { $project: { _id: 0, fecha: 1, fase: 1, local: '$local.nombre', visitante: '$visitante.nombre', goles_local: 1, goles_visitante: 1 } }
    ]).toArray(), null, 2));
  } catch (error) {
    console.error('Error al ejecutar consultas:', error);
  } finally {
    await client.close();
  }
}

run();

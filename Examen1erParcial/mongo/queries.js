import { MongoClient } from 'mongodb';

const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'mundial2026';

async function run() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);

    console.log('1. Continentes con confederación y países');
    console.log(await db.collection('continentes').find({}, { projection: { nombre: 1, confederacion: 1, paises: 1 } }).toArray());

    console.log('\n2. Continentes por confederación (UEFA)');
    console.log(await db.collection('continentes').find({ confederacion: 'UEFA' }).toArray());

    console.log('\n3. Selecciones con continente y confederación');
    console.log(await db.collection('selecciones').aggregate([
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
    ]).toArray());

    console.log('\n4. Top 10 mejor rankeados');
    console.log(await db.collection('selecciones').find({}, { projection: { nombre: 1, pais: 1, ranking: 1 } }).sort({ ranking: 1 }).limit(10).toArray());

    console.log('\n5. Selecciones con grupo, partidos y estadio');
    console.log(await db.collection('selecciones').aggregate([
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
        $unwind: { path: '$partidos', preserveNullAndEmptyArrays: true }
      },
      {
        $lookup: {
          from: 'estadios',
          localField: 'partidos.estadioId',
          foreignField: '_id',
          as: 'estadio'
        }
      },
      { $unwind: { path: '$estadio', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$_id',
          nombre: { $first: '$nombre' },
          grupo: { $first: '$grupo.nombre' },
          latitud: { $first: '$latitud' },
          longitud: { $first: '$longitud' },
          estadios: { $addToSet: { nombre: '$estadio.nombre', capacidad: '$estadio.capacidad' } },
          partidos: { $addToSet: '$partidos' }
        }
      }
    ]).toArray());

    console.log('\n6. Coordenadas de selecciones para Google Maps');
    console.log(await db.collection('selecciones').find({}, { projection: { nombre: 1, latitud: 1, longitud: 1 } }).toArray());

    console.log('\n7. Clasificaciones con bandera y estadísticas');
    console.log(await db.collection('clasificaciones').aggregate([
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
          seleccion: '$seleccion.nombre',
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
    ]).toArray());

    console.log('\n8. Relación boletos, selección y estadio');
    console.log(await db.collection('boletos').aggregate([
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
    ]).toArray());

    console.log('\nConsultas adicionales ejecutadas correctamente.');
  } catch (error) {
    console.error('Error al ejecutar consultas:', error);
  } finally {
    await client.close();
  }
}

run();

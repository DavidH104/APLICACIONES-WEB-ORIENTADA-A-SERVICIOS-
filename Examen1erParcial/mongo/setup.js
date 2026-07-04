import { MongoClient } from 'mongodb';

const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'mundial2026';

const collections = [
  {
    name: 'continentes',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['continente', 'confederacion', 'paises_incluidos'],
        properties: {
          continente: { bsonType: 'string' },
          confederacion: { bsonType: 'string' },
          paises_incluidos: { bsonType: 'array', items: { bsonType: 'string' } }
        }
      }
    }
  },
  {
    name: 'grupos',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['nombre'],
        properties: {
          nombre: { bsonType: 'string' }
        }
      }
    }
  },
  {
    name: 'selecciones',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['nombre', 'continente_id', 'historia', 'ventajas', 'desventajas', 'ranking', 'bandera_url', 'geolocalizacion'],
        properties: {
          nombre: { bsonType: 'string' },
          continente_id: { bsonType: 'objectId' },
          grupo_id: { bsonType: 'objectId' },
          historia: { bsonType: 'string' },
          ventajas: { bsonType: 'string' },
          desventajas: { bsonType: 'string' },
          ranking: { bsonType: ['int', 'long', 'double'] },
          bandera_url: { bsonType: 'string' },
          geolocalizacion: {
            bsonType: 'object',
            required: ['latitud', 'longitud'],
            properties: {
              latitud: { bsonType: ['double', 'int', 'long'] },
              longitud: { bsonType: ['double', 'int', 'long'] }
            }
          }
        }
      }
    }
  },
  {
    name: 'estadios',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['nombre', 'ciudad', 'pais', 'latitud', 'longitud', 'capacidad'],
        properties: {
          nombre: { bsonType: 'string' },
          ciudad: { bsonType: 'string' },
          pais: { bsonType: 'string' },
          latitud: { bsonType: ['double', 'int', 'long'] },
          longitud: { bsonType: ['double', 'int', 'long'] },
          capacidad: { bsonType: ['int', 'long', 'double'] }
        }
      }
    }
  },
  {
    name: 'fase_final',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['nombre_fase', 'clasificados', 'partidos_ids', 'sede_id', 'fecha'],
        properties: {
          nombre_fase: { bsonType: 'string' },
          clasificados: { bsonType: 'array', items: { bsonType: 'string' } },
          partidos_ids: { bsonType: 'array', items: { bsonType: 'objectId' } },
          sede_id: { bsonType: 'objectId' },
          fecha: { bsonType: 'date' }
        }
      }
    }
  },
  {
    name: 'partidos',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['fase', 'equipo_local_id', 'equipo_visitante_id', 'goles_local', 'goles_visitante', 'fecha', 'estadio_id'],
        properties: {
          fase: { bsonType: 'string' },
          equipo_local_id: { bsonType: 'objectId' },
          equipo_visitante_id: { bsonType: 'objectId' },
          goles_local: { bsonType: ['int', 'long', 'double'] },
          goles_visitante: { bsonType: ['int', 'long', 'double'] },
          fecha: { bsonType: 'date' },
          estadio_id: { bsonType: 'objectId' }
        }
      }
    }
  },
  {
    name: 'clasificaciones',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['grupo_id', 'seleccion_id', 'pj', 'pg', 'pe', 'pp', 'gf', 'gc', 'dg', 'pts'],
        properties: {
          grupo_id: { bsonType: 'objectId' },
          seleccion_id: { bsonType: 'objectId' },
          pj: { bsonType: ['int', 'long', 'double'] },
          pg: { bsonType: ['int', 'long', 'double'] },
          pe: { bsonType: ['int', 'long', 'double'] },
          pp: { bsonType: ['int', 'long', 'double'] },
          gf: { bsonType: ['int', 'long', 'double'] },
          gc: { bsonType: ['int', 'long', 'double'] },
          dg: { bsonType: ['int', 'long', 'double'] },
          pts: { bsonType: ['int', 'long', 'double'] }
        }
      }
    }
  },
  {
    name: 'usuarios',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['nombre'],
        properties: {
          nombre: { bsonType: 'string' }
        }
      }
    }
  },
  {
    name: 'boletos',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['usuario_id', 'estadio_id', 'dia', 'fecha', 'horario', 'seleccion_id', 'costo'],
        properties: {
          usuario_id: { bsonType: 'objectId' },
          estadio_id: { bsonType: 'objectId' },
          dia: { bsonType: 'string' },
          fecha: { bsonType: 'date' },
          horario: { bsonType: 'string' },
          seleccion_id: { bsonType: 'objectId' },
          costo: { bsonType: ['int', 'long', 'double'] }
        }
      }
    }
  }
];

async function createCollections(db) {
  const existing = await db.listCollections().toArray();
  const existingNames = existing.map((c) => c.name);

  for (const item of collections) {
    if (existingNames.includes(item.name)) {
      await db.collection(item.name).drop();
    }
    await db.createCollection(item.name, { validator: item.validator });
  }
}

async function createIndexes(db) {
  await Promise.all([
    db.collection('selecciones').createIndex({ continente_id: 1 }),
    db.collection('selecciones').createIndex({ grupo_id: 1 }),
    db.collection('partidos').createIndex({ estadio_id: 1 }),
    db.collection('partidos').createIndex({ fase: 1 }),
    db.collection('partidos').createIndex({ equipo_local_id: 1 }),
    db.collection('partidos').createIndex({ equipo_visitante_id: 1 }),
    db.collection('boletos').createIndex({ usuario_id: 1 }),
    db.collection('boletos').createIndex({ estadio_id: 1 }),
    db.collection('boletos').createIndex({ seleccion_id: 1 }),
    db.collection('clasificaciones').createIndex({ grupo_id: 1 }),
    db.collection('clasificaciones').createIndex({ seleccion_id: 1 })
  ]);
}

async function main() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    await createCollections(db);
    await createIndexes(db);
    console.log('Estructura creada correctamente.');
  } catch (error) {
    console.error('Error en setup:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();

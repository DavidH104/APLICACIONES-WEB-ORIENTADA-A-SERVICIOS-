import { MongoClient } from 'mongodb';

const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'mundial2026';

const collections = [
  {
    name: 'continentes',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['nombre', 'confederacion', 'paises_incluidos'],
        properties: {
          nombre: { bsonType: 'string' },
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
        required: ['nombre', 'continenteId', 'grupoId', 'historia', 'ventajas', 'desventajas', 'ranking', 'banderaUrl', 'latitud', 'longitud'],
        properties: {
          nombre: { bsonType: 'string' },
          continenteId: { bsonType: 'objectId' },
          grupoId: { bsonType: 'objectId' },
          historia: { bsonType: 'string' },
          ventajas: { bsonType: 'string' },
          desventajas: { bsonType: 'string' },
          ranking: { bsonType: ['int', 'long', 'double'] },
          banderaUrl: { bsonType: 'string' },
          bandera_url: { bsonType: 'string' },
          latitud: { bsonType: ['double', 'int', 'long'] },
          longitud: { bsonType: ['double', 'int', 'long'] }
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
        required: ['nombre', 'clasificados', 'partidos', 'sede', 'fecha'],
        properties: {
          nombre: { bsonType: 'string' },
          clasificados: { bsonType: 'array', items: { bsonType: 'string' } },
          partidos: { bsonType: ['int', 'long', 'double'] },
          sede: { bsonType: 'string' },
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
        required: ['fase', 'faseId', 'equipo_localId', 'equipo_visitanteId', 'goles_local', 'goles_visitante', 'fecha', 'estadioId'],
        properties: {
          fase: { bsonType: 'string' },
          faseId: { bsonType: 'objectId' },
          equipo_localId: { bsonType: 'objectId' },
          equipo_visitanteId: { bsonType: 'objectId' },
          goles_local: { bsonType: ['int', 'long', 'double'] },
          goles_visitante: { bsonType: ['int', 'long', 'double'] },
          fecha: { bsonType: 'date' },
          estadioId: { bsonType: 'objectId' },
          horario: { bsonType: 'string' }
        }
      }
    }
  },
  {
    name: 'clasificaciones',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['grupoId', 'seleccionId', 'pj', 'pg', 'pe', 'pp', 'gf', 'gc', 'dg', 'pts'],
        properties: {
          grupoId: { bsonType: 'objectId' },
          seleccionId: { bsonType: 'objectId' },
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
        required: ['nombre', 'usuario'],
        properties: {
          nombre: { bsonType: 'string' },
          usuario: { bsonType: 'string' },
          role: { bsonType: 'string' }
        }
      }
    }
  },
  {
    name: 'boletos',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['usuarioId', 'estadioId', 'dia', 'fecha', 'horario', 'seleccionId', 'costo'],
        properties: {
          usuarioId: { bsonType: 'objectId' },
          estadioId: { bsonType: 'objectId' },
          dia: { bsonType: 'string' },
          fecha: { bsonType: 'date' },
          horario: { bsonType: 'string' },
          seleccionId: { bsonType: 'objectId' },
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
    db.collection('selecciones').createIndex({ continenteId: 1 }),
    db.collection('selecciones').createIndex({ grupoId: 1 }),
    db.collection('partidos').createIndex({ estadioId: 1 }),
    db.collection('partidos').createIndex({ fase: 1 }),
    db.collection('partidos').createIndex({ faseId: 1 }),
    db.collection('partidos').createIndex({ equipo_localId: 1 }),
    db.collection('partidos').createIndex({ equipo_visitanteId: 1 }),
    db.collection('boletos').createIndex({ usuarioId: 1 }),
    db.collection('boletos').createIndex({ estadioId: 1 }),
    db.collection('boletos').createIndex({ seleccionId: 1 }),
    db.collection('clasificaciones').createIndex({ grupoId: 1 }),
    db.collection('clasificaciones').createIndex({ seleccionId: 1 })
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

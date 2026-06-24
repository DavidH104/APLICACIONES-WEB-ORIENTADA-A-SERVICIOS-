import { MongoClient } from 'mongodb';

const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'mundial2026';

const collections = [
  {
    name: 'continentes',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['nombre', 'confederacion'],
        properties: {
          nombre: { bsonType: 'string', description: 'Nombre del continente' },
          confederacion: { bsonType: 'string', description: 'Nombre de la confederación' },
          paises: {
            bsonType: 'array',
            description: 'Listado de países del continente',
            items: { bsonType: 'string' }
          }
        }
      }
    }
  },
  {
    name: 'grupos',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['nombre', 'fase'],
        properties: {
          nombre: { bsonType: 'string', description: 'Identificador del grupo' },
          fase: { bsonType: 'string', description: 'Fase del torneo' }
        }
      }
    }
  },
  {
    name: 'selecciones',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['nombre', 'pais', 'continenteId', 'grupoId'],
        properties: {
          nombre: { bsonType: 'string', description: 'Nombre de la selección' },
          pais: { bsonType: 'string', description: 'País representado' },
          continenteId: { bsonType: 'objectId', description: 'Referencia al continente' },
          grupoId: { bsonType: 'objectId', description: 'Referencia al grupo' },
          historia: { bsonType: 'string' },
          ventajas: { bsonType: 'string' },
          desventajas: { bsonType: 'string' },
          ranking: { bsonType: ['int', 'long', 'double'], description: 'Ranking FIFA' },
          banderaUrl: { bsonType: 'string' },
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
        required: ['nombre', 'sede', 'fecha'],
        properties: {
          nombre: { bsonType: 'string' },
          clasificados: {
            bsonType: 'array',
            items: { bsonType: 'string' }
          },
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
        required: ['faseId', 'equipo_localId', 'equipo_visitanteId', 'fecha', 'estadioId'],
        properties: {
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
        required: ['grupoId', 'seleccionId', 'pj', 'pts'],
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
        required: ['nombre', 'email'],
        properties: {
          nombre: { bsonType: 'string' },
          email: { bsonType: 'string' },
          telefono: { bsonType: 'string' },
          nacionalidad: { bsonType: 'string' },
          tipo: { bsonType: 'string' }
        }
      }
    }
  },
  {
    name: 'boletos',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['usuarioId', 'estadioId', 'fecha', 'horario', 'seleccionId', 'costo'],
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
  const existingNames = existing.map(c => c.name);

  for (const item of collections) {
    if (existingNames.includes(item.name)) {
      console.log(`La colección ${item.name} ya existe. Se eliminará para recrear.`);
      await db.collection(item.name).drop();
    }
    console.log(`Creando colección ${item.name}...`);
    await db.createCollection(item.name, { validator: item.validator });
  }
}

async function createIndexes(db) {
  await Promise.all([
    db.collection('selecciones').createIndex({ continenteId: 1 }),
    db.collection('selecciones').createIndex({ grupoId: 1 }),
    db.collection('partidos').createIndex({ estadioId: 1 }),
    db.collection('partidos').createIndex({ faseId: 1 }),
    db.collection('partidos').createIndex({ equipo_localId: 1 }),
    db.collection('partidos').createIndex({ equipo_visitanteId: 1 }),
    db.collection('boletos').createIndex({ usuarioId: 1 }),
    db.collection('boletos').createIndex({ estadioId: 1 }),
    db.collection('boletos').createIndex({ seleccionId: 1 }),
    db.collection('clasificaciones').createIndex({ grupoId: 1 }),
    db.collection('clasificaciones').createIndex({ seleccionId: 1 })
  ]);
  console.log('Índices creados.');
}

async function main() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    console.log(`Conectado a ${MONGO_URI}/${DB_NAME}`);
    await createCollections(db);
    await createIndexes(db);
    console.log('Estructura de la base de datos creada correctamente.');
  } catch (error) {
    console.error('Error en setup:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();

import { MongoClient } from 'mongodb';

const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'mundial2026';

const collections = [
  'continentes',
  'grupos',
  'selecciones',
  'estadios',
  'fase_final',
  'partidos',
  'usuarios',
  'boletos',
  'clasificaciones'
];

async function main() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    console.log(`Base de datos: ${DB_NAME}\n`);

    for (const name of collections) {
      const collection = db.collection(name);
      const count = await collection.countDocuments();
      const sample = await collection.find().limit(2).toArray();
      console.log(`Colección: ${name}`);
      console.log(`  Documentos: ${count}`);
      console.log(`  Muestra:`);
      console.log(JSON.stringify(sample, null, 2));
      console.log('');
    }

  } catch (error) {
    console.error('Error al leer la base de datos:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();

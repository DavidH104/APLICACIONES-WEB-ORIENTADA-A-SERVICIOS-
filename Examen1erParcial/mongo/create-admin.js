import { MongoClient } from 'mongodb';
import crypto from 'crypto';

const MONGO_URI = 'mongodb://127.0.0.1:27017';
const DB_NAME = 'mundial2026';

async function usage() {
  console.log('Usage: node create-admin.js <usuario> <password>');
  process.exit(1);
}

async function main() {
  const [,, usuario, password] = process.argv;
  if (!usuario || !password) return usage();

  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);

    // generate salt and derived key using scrypt
    const salt = crypto.randomBytes(16).toString('hex');
    const derived = crypto.scryptSync(password, salt, 64, { N: 16384 });
    const passwordHash = derived.toString('hex');

    const doc = {
      usuario,
      passwordHash,
      salt,
      role: 'admin',
      createdAt: new Date()
    };

    const existing = await db.collection('usuarios').findOne({ usuario });
    if (existing) {
      console.log('Usuario ya existe. Actualizando contraseña.');
      await db.collection('usuarios').updateOne({ usuario }, { $set: { passwordHash, salt, role: 'admin', updatedAt: new Date() } });
    } else {
      await db.collection('usuarios').insertOne(doc);
      console.log('Usuario administrador creado:', usuario);
    }

    process.exit(0);
  } catch (err) {
    console.error('Error creando admin:', err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();

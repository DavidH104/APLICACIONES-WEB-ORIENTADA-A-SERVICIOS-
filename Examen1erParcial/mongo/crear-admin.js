import { MongoClient } from 'mongodb';
import crypto from 'crypto';

const MONGO_URI = 'mongodb://127.0.0.1:27017';
const DB_NAME = 'mundial2026';
const ADMIN_EMAIL = 'admin@mundial.local';
const ADMIN_PASSWORD = 'admin123';

async function main() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = crypto.scryptSync(ADMIN_PASSWORD, salt, 64, { N: 16384 }).toString('hex');

    const result = await db.collection('usuarios').updateOne(
      { usuario: ADMIN_EMAIL },
      {
        $set: {
          usuario: ADMIN_EMAIL,
          passwordHash,
          salt,
          role: 'admin',
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    if (result.upsertedId) {
      console.log('Usuario admin creado:', ADMIN_EMAIL);
    } else {
      console.log('Usuario admin actualizado:', ADMIN_EMAIL);
    }
    console.log('Contraseña:', ADMIN_PASSWORD);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();

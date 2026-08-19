import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EJSON } from 'bson';
import { MongoClient } from 'mongodb';

const MONGO_URI = process.env.MUNDIAL_MONGO_URI || 'mongodb://127.0.0.1:27017';
const DB_NAME = process.env.MUNDIAL_DB_NAME || 'mundial2026';
const SNAPSHOT_VERSION = process.env.MUNDIAL_SNAPSHOT_VERSION || '2026.08.18.1';
const COLLECTIONS = [
  'admin',
  'clasificaciones',
  'config',
  'continentes',
  'estadios',
  'fase_final',
  'grupos',
  'partidos',
  'selecciones',
  'usuarios'
];

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(__dirname, '..', 'installer', 'snapshot');
const client = new MongoClient(MONGO_URI, { serverSelectionTimeoutMS: 5000 });

function sha256(contents) {
  return crypto.createHash('sha256').update(contents).digest('hex');
}

async function main() {
  await fs.mkdir(outputDir, { recursive: true });
  await client.connect();
  const db = client.db(DB_NAME);
  await db.command({ ping: 1 });

  const existing = new Set((await db.listCollections().toArray()).map((item) => item.name));
  const manifestCollections = [];

  for (const name of COLLECTIONS) {
    const docs = existing.has(name) ? await db.collection(name).find({}).toArray() : [];
    const serialized = `${JSON.stringify(EJSON.serialize(docs, { relaxed: false }), null, 2)}\n`;
    const file = `${name}.json`;
    await fs.writeFile(path.join(outputDir, file), serialized, 'utf8');
    manifestCollections.push({ name, file, count: docs.length, sha256: sha256(serialized) });
    console.log(`${name}: ${docs.length}`);
  }

  const excludedSimulations = existing.has('simulaciones')
    ? await db.collection('simulaciones').countDocuments({})
    : 0;
  const buildInfo = await client.db('admin').command({ buildInfo: 1 });
  const manifest = {
    schemaVersion: 1,
    snapshotVersion: SNAPSHOT_VERSION,
    database: DB_NAME,
    exportedAt: new Date().toISOString(),
    sourceMongoVersion: buildInfo.version,
    collections: manifestCollections,
    excluded: {
      simulaciones: excludedSimulations,
      reason: 'Historial regenerable; se omite para reducir el instalador y evitar referencias antiguas.'
    }
  };

  await fs.writeFile(
    path.join(outputDir, 'manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf8'
  );
  console.log(`Snapshot creado en ${outputDir}`);
  console.log(`Simulaciones omitidas: ${excludedSimulations}`);
}

main()
  .catch((error) => {
    console.error('No se pudo exportar el snapshot:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.close().catch(() => {});
  });

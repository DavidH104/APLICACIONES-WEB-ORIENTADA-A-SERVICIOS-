import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EJSON } from 'bson';
import { MongoClient } from 'mongodb';

const MONGO_URI = process.env.MUNDIAL_MONGO_URI || 'mongodb://127.0.0.1:27127';
const DB_NAME = process.env.MUNDIAL_DB_NAME || 'mundial2026';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const snapshotCandidates = [
  process.env.MUNDIAL_SNAPSHOT_DIR,
  path.resolve(__dirname, '..', 'snapshot'),
  path.resolve(__dirname, '..', 'installer', 'snapshot')
].filter(Boolean);

const INDEXES = {
  selecciones: [{ continenteId: 1 }, { grupoId: 1 }, { nombre: 1 }],
  partidos: [{ estadioId: 1 }, { fase: 1 }, { faseId: 1 }, { equipo_localId: 1 }, { equipo_visitanteId: 1 }],
  clasificaciones: [{ grupoId: 1 }, { seleccionId: 1 }],
  usuarios: [{ usuario: 1 }],
  simulaciones: [{ createdAt: -1 }]
};

function sha256(contents) {
  return crypto.createHash('sha256').update(contents).digest('hex');
}

async function findSnapshotDir() {
  for (const candidate of snapshotCandidates) {
    try {
      await fs.access(path.join(candidate, 'manifest.json'));
      return candidate;
    } catch {
      // Probar la siguiente ubicación conocida.
    }
  }
  throw new Error(`No se encontró manifest.json. Rutas revisadas: ${snapshotCandidates.join(', ')}`);
}

async function main() {
  const snapshotDir = await findSnapshotDir();
  const manifest = JSON.parse(await fs.readFile(path.join(snapshotDir, 'manifest.json'), 'utf8'));
  if (manifest.schemaVersion !== 1 || !manifest.snapshotVersion || !Array.isArray(manifest.collections)) {
    throw new Error('El manifiesto del snapshot no tiene un formato compatible.');
  }

  const client = new MongoClient(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  const createdCollections = [];
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    await db.command({ ping: 1 });

    const marker = await db.collection('app_meta').findOne({ _id: 'installer' });
    if (marker) {
      console.log(`Base ya inicializada con snapshot ${marker.snapshotVersion}. No se sobrescribió ningún dato.`);
      return;
    }

    const existingNames = new Set((await db.listCollections().toArray()).map((item) => item.name));
    const populated = [];
    for (const name of existingNames) {
      if (name === 'app_meta') continue;
      if (await db.collection(name).estimatedDocumentCount() > 0) populated.push(name);
    }
    if (populated.length > 0) {
      throw new Error(`La base contiene datos sin marcador de instalación (${populated.join(', ')}). Se rechazó sobrescribirlos.`);
    }

    for (const item of manifest.collections) {
      const filePath = path.join(snapshotDir, item.file);
      const contents = await fs.readFile(filePath, 'utf8');
      if (sha256(contents) !== item.sha256) {
        throw new Error(`El archivo ${item.file} no coincide con su checksum.`);
      }
      const docs = EJSON.deserialize(JSON.parse(contents), { relaxed: false });
      if (!Array.isArray(docs) || docs.length !== item.count) {
        throw new Error(`Conteo inválido en ${item.file}: esperado ${item.count}.`);
      }
      if (!existingNames.has(item.name)) {
        await db.createCollection(item.name);
        existingNames.add(item.name);
        createdCollections.push(item.name);
      }
      if (docs.length > 0) await db.collection(item.name).insertMany(docs, { ordered: true });
      console.log(`${item.name}: ${docs.length} documentos importados`);
    }

    for (const [name, specs] of Object.entries(INDEXES)) {
      if (!existingNames.has(name)) {
        await db.createCollection(name);
        existingNames.add(name);
        createdCollections.push(name);
      }
      for (const spec of specs) await db.collection(name).createIndex(spec);
    }

    if (!existingNames.has('app_meta')) {
      await db.createCollection('app_meta');
      createdCollections.push('app_meta');
    }
    await db.collection('app_meta').insertOne({
      _id: 'installer',
      snapshotVersion: manifest.snapshotVersion,
      initializedAt: new Date(),
      sourceMongoVersion: manifest.sourceMongoVersion
    });
    console.log(`Base inicializada correctamente con snapshot ${manifest.snapshotVersion}.`);
  } catch (error) {
    if (createdCollections.length > 0) {
      const db = client.db(DB_NAME);
      for (const name of createdCollections.reverse()) {
        await db.collection(name).drop().catch(() => {});
      }
    }
    throw error;
  } finally {
    await client.close().catch(() => {});
  }
}

main().catch((error) => {
  console.error('No se pudo inicializar la base local:', error);
  process.exitCode = 1;
});

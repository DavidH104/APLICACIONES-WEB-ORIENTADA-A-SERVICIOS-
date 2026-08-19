import { MongoClient } from 'mongodb';

const MONGO_URI = process.env.MUNDIAL_MONGO_URI || 'mongodb://127.0.0.1:27127';
const client = new MongoClient(MONGO_URI, {
  serverSelectionTimeoutMS: 2000,
  connectTimeoutMS: 2000
});

try {
  await client.connect();
  try {
    await client.db('admin').command({ shutdown: 1, force: true });
  } catch (error) {
    const expectedDisconnect = ['MongoNetworkError', 'MongoServerSelectionError', 'MongoTopologyClosedError'].includes(error?.name);
    if (!expectedDisconnect) throw error;
  }
  console.log('MongoDB local recibió la orden de apagado.');
} catch (error) {
  if (error?.name === 'MongoServerSelectionError') {
    console.log('MongoDB local ya estaba detenido.');
  } else {
    console.error('No se pudo apagar MongoDB local:', error);
    process.exitCode = 1;
  }
} finally {
  await client.close().catch(() => {});
}

import http from 'node:http';
import { MongoClient } from 'mongodb';

const MONGO_URI = 'mongodb://127.0.0.1:27017';
const DB_NAME = 'mundial2026';

const client = new MongoClient(MONGO_URI);

async function getDb() {
  if (!client.topology?.isConnected?.()) {
    await client.connect();
  }
  return client.db(DB_NAME);
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(payload));
}

function serializeObjectId(doc) {
  const serialized = { ...doc };
  if (serialized._id) {
    serialized.id = serialized._id.toString();
    delete serialized._id;
  }
  return serialized;
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  const url = new URL(req.url, 'http://localhost');

  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'Método no permitido' });
    return;
  }

  try {
    const db = await getDb();

    if (url.pathname === '/api/selecciones') {
      const selecciones = await db.collection('selecciones').aggregate([
        {
          $lookup: {
            from: 'continentes',
            localField: 'continente_id',
            foreignField: '_id',
            as: 'continente'
          }
        },
        { $unwind: '$continente' },
        {
          $lookup: {
            from: 'grupos',
            localField: 'grupo_id',
            foreignField: '_id',
            as: 'grupo'
          }
        },
        { $unwind: { path: '$grupo', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            nombre: 1,
            historia: 1,
            ventajas: 1,
            desventajas: 1,
            ranking: 1,
            bandera_url: 1,
            geolocalizacion: 1,
            confederacion: '$continente.confederacion',
            continente: '$continente.continente',
            grupo: '$grupo.nombre',
            google_maps_url: { $ifNull: ['$google_maps_url', ''] }
          }
        },
        { $sort: { ranking: 1 } }
      ]).toArray();

      const payload = selecciones.map((item) => ({
        ...item,
        id: item._id.toString(),
        _id: undefined
      }));
      sendJson(res, 200, payload);
      return;
    }

    if (url.pathname === '/api/estadios') {
      const estadios = await db.collection('estadios').find({}).sort({ nombre: 1 }).toArray();
      const payload = estadios.map(serializeObjectId);
      sendJson(res, 200, payload);
      return;
    }

    if (url.pathname === '/api/clasificaciones') {
      const clasificaciones = await db.collection('clasificaciones').aggregate([
        {
          $lookup: {
            from: 'selecciones',
            localField: 'seleccion_id',
            foreignField: '_id',
            as: 'seleccion'
          }
        },
        { $unwind: '$seleccion' },
        {
          $lookup: {
            from: 'grupos',
            localField: 'grupo_id',
            foreignField: '_id',
            as: 'grupo'
          }
        },
        { $unwind: '$grupo' },
        {
          $project: {
            _id: 1,
            nombre: '$seleccion.nombre',
            grupo: '$grupo.nombre',
            pj: '$pj',
            pg: '$pg',
            pe: '$pe',
            pp: '$pp',
            gf: '$gf',
            gc: '$gc',
            dg: '$dg',
            pts: '$pts',
            bandera: '$seleccion.bandera_url'
          }
        },
        { $sort: { grupo: 1, pts: -1 } }
      ]).toArray();

      const payload = clasificaciones.map((item) => ({
        ...item,
        id: item._id.toString(),
        _id: undefined
      }));
      sendJson(res, 200, payload);
      return;
    }

    if (url.pathname === '/api/partidos') {
      const partidos = await db.collection('partidos').find({}).sort({ fecha: 1 }).limit(20).toArray();
      const payload = partidos.map(serializeObjectId);
      sendJson(res, 200, payload);
      return;
    }

    sendJson(res, 404, { error: 'Ruta no encontrada' });
  } catch (error) {
    console.error('Error en API:', error);
    sendJson(res, 500, { error: 'Error interno del servidor', details: error.message });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`);
});

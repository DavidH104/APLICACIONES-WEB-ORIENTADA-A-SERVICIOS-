import http from 'node:http';
import { MongoClient, ObjectId } from 'mongodb';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

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
    'Access-Control-Allow-Methods': 'GET, OPTIONS, PATCH, POST',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(payload));
}

async function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      if (!body) return resolve({});
      try { resolve(JSON.parse(body)); } catch (err) { reject(err); }
    });
    req.on('error', reject);
  });
}

function serializeObjectId(doc) {
  const serialized = { ...doc };
  if (serialized._id) {
    serialized.id = serialized._id.toString();
    delete serialized._id;
  }
  return serialized;
}

async function recalculateGroupClasification(db) {
  const groupMatches = await db.collection('partidos').aggregate([
    {
      $lookup: {
        from: 'fase_final',
        localField: 'faseId',
        foreignField: '_id',
        as: 'fase'
      }
    },
    { $unwind: '$fase' },
    { $match: { 'fase.nombre': 'Fase de grupos' } },
    {
      $project: {
        equipo_localId: 1,
        equipo_visitanteId: 1,
        goles_local: { $ifNull: ['$goles_local', 0] },
        goles_visitante: { $ifNull: ['$goles_visitante', 0] }
      }
    }
  ]).toArray();

  const statsByTeam = new Map();

  function ensureTeam(id) {
    const key = id.toString();
    if (!statsByTeam.has(key)) {
      statsByTeam.set(key, { _id: id, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dg: 0, pts: 0 });
    }
    return statsByTeam.get(key);
  }

  for (const match of groupMatches) {
    const local = ensureTeam(match.equipo_localId);
    const visitante = ensureTeam(match.equipo_visitanteId);
    const gl = Number(match.goles_local || 0);
    const gv = Number(match.goles_visitante || 0);

    local.pj += 1;
    visitante.pj += 1;
    local.gf += gl;
    local.gc += gv;
    visitante.gf += gv;
    visitante.gc += gl;
    local.dg = local.gf - local.gc;
    visitante.dg = visitante.gf - visitante.gc;

    if (gl > gv) {
      local.pg += 1;
      local.pts += 3;
      visitante.pp += 1;
    } else if (gl < gv) {
      visitante.pg += 1;
      visitante.pts += 3;
      local.pp += 1;
    } else {
      local.pe += 1;
      visitante.pe += 1;
      local.pts += 1;
      visitante.pts += 1;
    }
  }

  const seleccionIds = Array.from(statsByTeam.keys()).map((id) => new ObjectId(id));
  const selecciones = await db.collection('selecciones').find({ _id: { $in: seleccionIds } }).project({ grupoId: 1 }).toArray();
  const grupoMap = new Map(selecciones.map((sel) => [sel._id.toString(), sel.grupoId]));

  await db.collection('clasificaciones').deleteMany({});

  const docs = [];
  for (const [key, stats] of statsByTeam.entries()) {
    const grupoId = grupoMap.get(key);
    docs.push({
      grupoId: grupoId ? new ObjectId(grupoId) : null,
      seleccionId: new ObjectId(key),
      pj: stats.pj,
      pg: stats.pg,
      pe: stats.pe,
      pp: stats.pp,
      gf: stats.gf,
      gc: stats.gc,
      dg: stats.dg,
      pts: stats.pts
    });
  }

  if (docs.length > 0) {
    await db.collection('clasificaciones').insertMany(docs);
  }
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS, PATCH, POST',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  const url = new URL(req.url, 'http://localhost');

  if (req.method !== 'GET' && req.method !== 'PATCH' && req.method !== 'POST') {
    sendJson(res, 405, { error: 'Método no permitido' });
    return;
  }

  try {
    // Serve static files for non-API GET requests from the project root
    if (req.method === 'GET' && !url.pathname.startsWith('/api/')) {
      try {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const publicRoot = path.resolve(__dirname, '..');
        let requestedPath = decodeURIComponent(url.pathname);
        if (requestedPath === '/' || requestedPath === '') requestedPath = '/index.html';
        const filePath = path.normalize(path.join(publicRoot, requestedPath));
        if (!filePath.startsWith(publicRoot)) {
          sendJson(res, 403, { error: 'Acceso prohibido' });
          return;
        }
        const stat = await fs.stat(filePath).catch(() => null);
        if (!stat || !stat.isFile()) {
          sendJson(res, 404, { error: 'Archivo no encontrado' });
          return;
        }
        const ext = path.extname(filePath).toLowerCase();
        const map = {
          '.html': 'text/html; charset=utf-8',
          '.js': 'application/javascript; charset=utf-8',
          '.css': 'text/css; charset=utf-8',
          '.json': 'application/json; charset=utf-8',
          '.svg': 'image/svg+xml',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.woff2': 'font/woff2'
        };
        const contentType = map[ext] || 'application/octet-stream';
        const data = await fs.readFile(filePath);
        res.writeHead(200, {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*'
        });
        res.end(data);
      } catch (err) {
        console.error('Error sirviendo archivo estático:', err);
        sendJson(res, 500, { error: 'Error al servir archivo estático' });
      }
      return;
    }

    const db = await getDb();

    // --- MANEJO DE RUTAS GET ---
    if (req.method === 'GET') {
      if (url.pathname === '/api/selecciones') {
        const selecciones = await db.collection('selecciones').aggregate([
          {
            $lookup: {
              from: 'continentes',
              localField: 'continenteId',
              foreignField: '_id',
              as: 'continente'
            }
          },
          { $unwind: '$continente' },
          {
            $lookup: {
              from: 'grupos',
              localField: 'grupoId',
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
              banderaUrl: 1,
              latitud: 1,
              longitud: 1,
              confederacion: '$continente.confederacion',
              continente: '$continente.nombre',
              grupo: '$grupo.nombre'
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
              localField: 'seleccionId',
              foreignField: '_id',
              as: 'seleccion'
            }
          },
          { $unwind: '$seleccion' },
          {
            $lookup: {
              from: 'grupos',
              localField: 'grupoId',
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
              bandera: '$seleccion.banderaUrl'
            }
          },
          { $sort: { grupo: 1, pts: -1, dg: -1, gf: -1, nombre: 1 } }
        ]).toArray();

        const payload = clasificaciones.map((item) => ({
          ...item,
          id: item._id.toString(),
          _id: undefined
        }));
        sendJson(res, 200, payload);
        return;
      }

      if (url.pathname === '/api/admin/partidos') {
        const partidos = await db.collection('partidos').aggregate([
          {
            $lookup: {
              from: 'fase_final',
              localField: 'faseId',
              foreignField: '_id',
              as: 'fase'
            }
          },
          { $unwind: { path: '$fase', preserveNullAndEmptyArrays: true } },
          {
            $lookup: {
              from: 'selecciones',
              localField: 'equipo_localId',
              foreignField: '_id',
              as: 'local'
            }
          },
          { $unwind: { path: '$local', preserveNullAndEmptyArrays: true } },
          {
            $lookup: {
              from: 'selecciones',
              localField: 'equipo_visitanteId',
              foreignField: '_id',
              as: 'visitante'
            }
          },
          { $unwind: { path: '$visitante', preserveNullAndEmptyArrays: true } },
          {
            $lookup: {
              from: 'grupos',
              localField: 'local.grupoId',
              foreignField: '_id',
              as: 'grupo'
            }
          },
          { $unwind: { path: '$grupo', preserveNullAndEmptyArrays: true } },
          {
            $lookup: {
              from: 'estadios',
              localField: 'estadioId',
              foreignField: '_id',
              as: 'estadio'
            }
          },
          { $unwind: { path: '$estadio', preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: 1,
              fase: '$fase.nombre',
              fecha: 1,
              horario: 1,
              goles_local: 1,
              goles_visitante: 1,
              local: { id: '$local._id', nombre: '$local.nombre' },
              visitante: { id: '$visitante._id', nombre: '$visitante.nombre' },
              estadio: { id: '$estadio._id', nombre: '$estadio.nombre' },
              grupo: '$grupo.nombre'
            }
          },
          { $sort: { fecha: 1 } }
        ]).toArray();

        const payload = partidos.map((item) => ({
          ...item,
          id: item._id.toString(),
          _id: undefined,
          local: item.local ? { id: item.local.id.toString(), nombre: item.local.nombre } : null,
          visitante: item.visitante ? { id: item.visitante.id.toString(), nombre: item.visitante.nombre } : null,
          estadio: item.estadio ? { id: item.estadio.id.toString(), nombre: item.estadio.nombre } : null
        }));
        sendJson(res, 200, payload);
        return;
      }

      if (url.pathname === '/api/admin/partidos-fase-grupos') {
        const partidos = await db.collection('partidos').aggregate([
          {
            $lookup: {
              from: 'fase_final',
              localField: 'faseId',
              foreignField: '_id',
              as: 'fase'
            }
          },
          { $unwind: '$fase' },
          { $match: { 'fase.nombre': 'Fase de grupos' } },
          {
            $lookup: {
              from: 'selecciones',
              localField: 'equipo_localId',
              foreignField: '_id',
              as: 'local'
            }
          },
          { $unwind: '$local' },
          {
            $lookup: {
              from: 'selecciones',
              localField: 'equipo_visitanteId',
              foreignField: '_id',
              as: 'visitante'
            }
          },
          { $unwind: '$visitante' },
          {
            $lookup: {
              from: 'grupos',
              localField: 'local.grupoId',
              foreignField: '_id',
              as: 'grupo'
            }
          },
          { $unwind: '$grupo' },
          {
            $lookup: {
              from: 'estadios',
              localField: 'estadioId',
              foreignField: '_id',
              as: 'estadio'
            }
          },
          { $unwind: { path: '$estadio', preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: 1,
              fecha: 1,
              grupo: '$grupo.nombre',
              goles_local: 1,
              goles_visitante: 1,
              local: { id: '$local._id', nombre: '$local.nombre' },
              visitante: { id: '$visitante._id', nombre: '$visitante.nombre' },
              estadio: { id: '$estadio._id', nombre: '$estadio.nombre' }
            }
          },
          { $sort: { fecha: 1 } }
        ]).toArray();

        const payload = partidos.map((item) => ({
          ...item,
          id: item._id.toString(),
          _id: undefined,
          local: { id: item.local.id.toString(), nombre: item.local.nombre },
          visitante: { id: item.visitante.id.toString(), nombre: item.visitante.nombre },
          estadio: item.estadio ? { id: item.estadio.id.toString(), nombre: item.estadio.nombre } : null
        }));
        sendJson(res, 200, payload);
        return;
      }

      if (url.pathname === '/api/admin/qualificados') {
        const clasificaciones = await db.collection('clasificaciones').aggregate([
          {
            $lookup: {
              from: 'selecciones',
              localField: 'seleccionId',
              foreignField: '_id',
              as: 'seleccion'
            }
          },
          { $unwind: '$seleccion' },
          {
            $lookup: {
              from: 'grupos',
              localField: 'grupoId',
              foreignField: '_id',
              as: 'grupo'
            }
          },
          { $unwind: '$grupo' },
          {
            $project: {
              _id: 1,
              seleccionId: 1,
              nombre: '$seleccion.nombre',
              grupo: '$grupo.nombre',
              pts: 1,
              dg: 1,
              gf: 1
            }
          },
          { $sort: { grupo: 1, pts: -1, dg: -1, gf: -1, nombre: 1 } }
        ]).toArray();

        const grupos = clasificaciones.reduce((acc, item) => {
          (acc[item.grupo] = acc[item.grupo] || []).push(item);
          return acc;
        }, {});

        const directos = [];
        const terceros = [];

        Object.keys(grupos).sort().forEach((grupo) => {
          const orden = grupos[grupo];
          if (orden[0]) directos.push({ grupo, posicion: 1, ...orden[0] });
          if (orden[1]) directos.push({ grupo, posicion: 2, ...orden[1] });
          if (orden[2]) terceros.push({ grupo, posicion: 3, ...orden[2] });
        });

        const mejoresTerceros = terceros.sort((a, b) => {
          if (b.pts !== a.pts) return b.pts - a.pts;
          if (b.dg !== a.dg) return b.dg - a.dg;
          if (b.gf !== a.gf) return b.gf - a.gf;
          return a.nombre.localeCompare(b.nombre);
        }).slice(0, 8);

        sendJson(res, 200, {
          directos,
          mejoresTerceros
        });
        return;
      }

      if (url.pathname === '/api/partidos') {
        const partidos = await db.collection('partidos').find({}).sort({ fecha: 1 }).limit(20).toArray();
        const payload = partidos.map(serializeObjectId);
        sendJson(res, 200, payload);
        return;
      }

      if (url.pathname === '/api/clasificaciones-admin') {
        const clasificaciones = await db.collection('clasificaciones').aggregate([
          {
            $lookup: { from: 'selecciones', localField: 'seleccionId', foreignField: '_id', as: 'seleccion' }
          },
          { $unwind: '$seleccion' },
          {
            $lookup: { from: 'grupos', localField: 'grupoId', foreignField: '_id', as: 'grupo' }
          },
          { $unwind: { path: '$grupo', preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: 1,
              nombre: '$seleccion.nombre',
              grupo: '$grupo.nombre',
              pj: 1, pg: 1, pe: 1, pp: 1, gf: 1, gc: 1, dg: 1, pts: 1
            }
          },
          { $sort: { grupo: 1, pts: -1, dg: -1, gf: -1, nombre: 1 } }
        ]).toArray();
        const payload = clasificaciones.map((item) => ({ ...item, id: item._id.toString(), _id: undefined }));
        sendJson(res, 200, payload);
        return;
      }

      if (url.pathname === '/api/fases') {
        const fases = await db.collection('fase_final').find({}).sort({ fecha: 1 }).toArray();
        const payload = fases.map((item) => {
          const { _id, ...rest } = item;
          return { ...rest, id: _id.toString() };
        });
        sendJson(res, 200, payload);
        return;
      }

      if (url.pathname === '/api/admin/opciones-select') {
        const selecciones = await db.collection('selecciones').find({}).sort({ nombre: 1 }).toArray();
        const estadios = await db.collection('estadios').find({}).sort({ nombre: 1 }).toArray();
        const fases = await db.collection('fase_final').find({}).sort({ nombre: 1 }).toArray();
        const grupos = await db.collection('grupos').find({}).sort({ nombre: 1 }).toArray();
        const continentes = await db.collection('continentes').find({}).sort({ nombre: 1 }).toArray();

        sendJson(res, 200, {
          selecciones: selecciones.map(s => ({ id: s._id.toString(), nombre: s.nombre, grupoId: s.grupoId, continenteId: s.continenteId })),
          estadios: estadios.map(e => ({ id: e._id.toString(), nombre: e.nombre, ciudad: e.ciudad })),
          fases: fases.map(f => ({ id: f._id.toString(), nombre: f.nombre })),
          grupos: grupos.map(g => ({ id: g._id.toString(), nombre: g.nombre })),
          continentes: continentes.map(c => ({ id: c._id.toString(), nombre: c.nombre, confederacion: c.confederacion }))
        });
        return;
      }
    }

    // --- MANEJO DE RUTAS POST ---
    if (req.method === 'POST') {
      if (url.pathname === '/api/admin/login') {
        const body = await parseJsonBody(req).catch(() => ({}));
        const usuario = (body.usuario || body.user || '').toString();
        const password = (body.password || '').toString();
        if (!usuario || !password) {
          sendJson(res, 400, { error: 'Faltan credenciales' });
          return;
        }
        const userDoc = await db.collection('admin').findOne({ usuario }).catch(() => null);
        const source = userDoc ? 'admin' : null;
        if (!source) {
          userDoc = await db.collection('usuarios').findOne({ usuario }).catch(() => null);
        }
        if (!userDoc) {
          sendJson(res, 401, { ok: false, error: 'Credenciales inválidas' });
          return;
        }
        const crypto = await import('crypto');
        const salt = userDoc.salt;
        const derived = crypto.scryptSync(password, salt, 64, { N: 16384 });
        const stored = Buffer.from(userDoc.passwordHash, 'hex');
        if (crypto.timingSafeEqual(derived, stored)) {
          sendJson(res, 200, { ok: true, usuario: userDoc.usuario, role: userDoc.role || 'admin' });
        } else {
          sendJson(res, 401, { ok: false, error: 'Credenciales inválidas' });
        }
        return;
      }

      if (url.pathname === '/api/admin/partidos') {
        const body = await parseJsonBody(req);
        const { faseId, equipo_localId, equipo_visitanteId, goles_local, goles_visitante, fecha, estadioId, horario } = body;
        if (!faseId || !equipo_localId || !equipo_visitanteId || !fecha || !estadioId) {
          sendJson(res, 400, { error: 'Faltan campos obligatorios: faseId, equipo_localId, equipo_visitanteId, fecha, estadioId' });
          return;
        }
        const result = await db.collection('partidos').insertOne({
          faseId: new ObjectId(faseId),
          equipo_localId: new ObjectId(equipo_localId),
          equipo_visitanteId: new ObjectId(equipo_visitanteId),
          goles_local: Number(goles_local ?? 0),
          goles_visitante: Number(goles_visitante ?? 0),
          fecha: new Date(fecha),
          estadioId: new ObjectId(estadioId),
          horario: typeof horario === 'string' ? horario : new Date(fecha).toISOString().slice(11, 16)
        });
        await recalculateGroupClasification(db);
        sendJson(res, 201, { id: result.insertedId.toString(), message: 'Partido creado' });
        return;
      }

      if (url.pathname === '/api/admin/selecciones') {
        const body = await parseJsonBody(req);
        const { nombre, pais, continenteId, grupoId, historia, ventajas, desventajas, ranking, banderaUrl, latitud, longitud } = body;
        if (!nombre || !pais || !continenteId || !grupoId) {
          sendJson(res, 400, { error: 'Faltan campos obligatorios: nombre, pais, continenteId, grupoId' });
          return;
        }
        const result = await db.collection('selecciones').insertOne({
          nombre,
          pais,
          continenteId: new ObjectId(continenteId),
          grupoId: new ObjectId(grupoId),
          historia: historia || '',
          ventajas: ventajas || '',
          desventajas: desventajas || '',
          ranking: Number(ranking || 0),
          banderaUrl: banderaUrl || '',
          latitud: Number(latitud || 0),
          longitud: Number(longitud || 0)
        });
        sendJson(res, 201, { id: result.insertedId.toString(), message: 'Selección creada' });
        return;
      }

      if (url.pathname === '/api/admin/estadios') {
        const body = await parseJsonBody(req);
        const { nombre, ciudad, pais, latitud, longitud, capacidad } = body;
        if (!nombre || !ciudad || !pais || latitud === undefined || longitud === undefined || capacidad === undefined) {
          sendJson(res, 400, { error: 'Faltan campos obligatorios: nombre, ciudad, pais, latitud, longitud, capacidad' });
          return;
        }
        const result = await db.collection('estadios').insertOne({
          nombre,
          ciudad,
          pais,
          latitud: Number(latitud),
          longitud: Number(longitud),
          capacidad: Number(capacidad)
        });
        sendJson(res, 201, { id: result.insertedId.toString(), message: 'Estadio creado' });
        return;
      }
    }

    // --- MANEJO DE RUTAS PATCH ---
    if (req.method === 'PATCH') {
      const scoreMatch = url.pathname.match(/^\/api\/partidos\/([^/]+)\/score$/);
      if (scoreMatch) {
        const partidoId = scoreMatch[1];
        const body = await parseJsonBody(req);
        const goles_local = Number(body.goles_local ?? 0);
        const goles_visitante = Number(body.goles_visitante ?? 0);

        if (!ObjectId.isValid(partidoId)) {
          sendJson(res, 400, { error: 'ID de partido inválido' });
          return;
        }

        const partidoObjectId = new ObjectId(partidoId);
        const updateResult = await db.collection('partidos').updateOne(
          { _id: partidoObjectId },
          { $set: { goles_local, goles_visitante } }
        );

        if (updateResult.matchedCount === 0) {
          sendJson(res, 404, { error: 'Partido no encontrado' });
          return;
        }

        await recalculateGroupClasification(db);
        sendJson(res, 200, { message: 'Marcador actualizado y clasificación recálculada' });
        return;
      }

      const partidoMatch = url.pathname.match(/^\/api\/admin\/partidos\/([^/]+)$/);
      if (partidoMatch) {
        const partidoId = partidoMatch[1];
        const body = await parseJsonBody(req);
        const updateFields = {};
        if (body.faseId) updateFields.faseId = new ObjectId(body.faseId);
        if (body.equipo_localId) updateFields.equipo_localId = new ObjectId(body.equipo_localId);
        if (body.equipo_visitanteId) updateFields.equipo_visitanteId = new ObjectId(body.equipo_visitanteId);
        if (body.goles_local !== undefined) updateFields.goles_local = Number(body.goles_local);
        if (body.goles_visitante !== undefined) updateFields.goles_visitante = Number(body.goles_visitante);
        if (body.fecha) updateFields.fecha = new Date(body.fecha);
        if (body.estadioId) updateFields.estadioId = new ObjectId(body.estadioId);
        if (body.horario) updateFields.horario = body.horario;

        if (!ObjectId.isValid(partidoId)) {
          sendJson(res, 400, { error: 'ID de partido inválido' });
          return;
        }

        const updateResult = await db.collection('partidos').updateOne(
          { _id: new ObjectId(partidoId) },
          { $set: updateFields }
        );

        if (updateResult.matchedCount === 0) {
          sendJson(res, 404, { error: 'Partido no encontrado' });
          return;
        }

        await recalculateGroupClasification(db);
        sendJson(res, 200, { message: 'Partido actualizado' });
        return;
      }

      const seleccionMatch = url.pathname.match(/^\/api\/admin\/selecciones\/([^/]+)$/);
      if (seleccionMatch) {
        const seleccionId = seleccionMatch[1];
        const body = await parseJsonBody(req);
        const updateFields = {};
        if (body.nombre) updateFields.nombre = body.nombre;
        if (body.pais) updateFields.pais = body.pais;
        if (body.continenteId) updateFields.continenteId = new ObjectId(body.continenteId);
        if (body.grupoId) updateFields.grupoId = new ObjectId(body.grupoId);
        if (body.historia !== undefined) updateFields.historia = body.historia;
        if (body.ventajas !== undefined) updateFields.ventajas = body.ventajas;
        if (body.desventajas !== undefined) updateFields.desventajas = body.desventajas;
        if (body.ranking !== undefined) updateFields.ranking = Number(body.ranking);
        if (body.banderaUrl !== undefined) updateFields.banderaUrl = body.banderaUrl;
        if (body.latitud !== undefined) updateFields.latitud = Number(body.latitud);
        if (body.longitud !== undefined) updateFields.longitud = Number(body.longitud);

        if (!ObjectId.isValid(seleccionId)) {
          sendJson(res, 400, { error: 'ID de selección inválido' });
          return;
        }

        const updateResult = await db.collection('selecciones').updateOne(
          { _id: new ObjectId(seleccionId) },
          { $set: updateFields }
        );

        if (updateResult.matchedCount === 0) {
          sendJson(res, 404, { error: 'Selección no encontrada' });
          return;
        }

        sendJson(res, 200, { message: 'Selección actualizada' });
        return;
      }

      const clasificacionMatch = url.pathname.match(/^\/api\/admin\/clasificaciones\/([^/]+)$/);
      if (clasificacionMatch) {
        const id = clasificacionMatch[1];
        const body = await parseJsonBody(req);
        const updateFields = {};
        ['pj', 'pg', 'pe', 'pp', 'gf', 'gc', 'dg', 'pts'].forEach((field) => {
          if (body[field] !== undefined) updateFields[field] = Number(body[field]);
        });
        if (!ObjectId.isValid(id)) {
          sendJson(res, 400, { error: 'ID de clasificación inválido' });
          return;
        }
        const updateResult = await db.collection('clasificaciones').updateOne(
          { _id: new ObjectId(id) },
          { $set: updateFields }
        );
        if (updateResult.matchedCount === 0) {
          sendJson(res, 404, { error: 'Clasificación no encontrada' });
          return;
        }
        sendJson(res, 200, { message: 'Tabla de posición actualizada' });
        return;
      }

      const faseMatch = url.pathname.match(/^\/api\/admin\/fases\/([^/]+)$/);
      if (faseMatch) {
        const id = faseMatch[1];
        const body = await parseJsonBody(req);
        const updateFields = {};
        if (body.nombre) updateFields.nombre = body.nombre;
        if (body.clasificados !== undefined) updateFields.clasificados = body.clasificados;
        if (body.partidos !== undefined) updateFields.partidos = Number(body.partidos);
        if (body.sede) updateFields.sede = body.sede;
        if (body.fecha) updateFields.fecha = new Date(body.fecha);
        if (!ObjectId.isValid(id)) {
          sendJson(res, 400, { error: 'ID de fase inválido' });
          return;
        }
        const updateResult = await db.collection('fase_final').updateOne(
          { _id: new ObjectId(id) },
          { $set: updateFields }
        );
        if (updateResult.matchedCount === 0) {
          sendJson(res, 404, { error: 'Fase no encontrada' });
          return;
        }
        sendJson(res, 200, { message: 'Fase actualizada' });
        return;
      }
    }

    // --- MANEJO DE RUTAS DELETE ---
    if (req.method === 'DELETE') {
      const partidoMatch = url.pathname.match(/^\/api\/admin\/partidos\/([^/]+)$/);
      if (partidoMatch) {
        const partidoId = partidoMatch[1];
        if (!ObjectId.isValid(partidoId)) {
          sendJson(res, 400, { error: 'ID de partido inválido' });
          return;
        }
        await db.collection('partidos').deleteOne({ _id: new ObjectId(partidoId) });
        await recalculateGroupClasification(db);
        sendJson(res, 200, { message: 'Partido eliminado' });
        return;
      }

      const seleccionMatch = url.pathname.match(/^\/api\/admin\/selecciones\/([^/]+)$/);
      if (seleccionMatch) {
        const seleccionId = seleccionMatch[1];
        if (!ObjectId.isValid(seleccionId)) {
          sendJson(res, 400, { error: 'ID de selección inválido' });
          return;
        }
        await db.collection('selecciones').deleteOne({ _id: new ObjectId(seleccionId) });
        await db.collection('clasificaciones').deleteMany({ seleccionId: new ObjectId(seleccionId) });
        sendJson(res, 200, { message: 'Selección eliminada' });
        return;
      }

      const estadioMatch = url.pathname.match(/^\/api\/admin\/estadios\/([^/]+)$/);
      if (estadioMatch) {
        const estadioId = estadioMatch[1];
        if (!ObjectId.isValid(estadioId)) {
          sendJson(res, 400, { error: 'ID de estadio inválido' });
          return;
        }
        await db.collection('estadios').deleteOne({ _id: new ObjectId(estadioId) });
        sendJson(res, 200, { message: 'Estadio eliminado' });
        return;
      }
    }

    // Si llega aquí es una ruta de API inexistente
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
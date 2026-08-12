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

const COUNTRY_FLAG_MAP = {
  'México':'mx','Inglaterra':'gb','Senegal':'sn','Australia':'au','Estados Unidos':'us','Alemania':'de','Marruecos':'ma','Japón':'jp','Canadá':'ca','Francia':'fr','Egipto':'eg','Irán':'ir','Costa Rica':'cr','España':'es','Ghana':'gh','Catar':'qa','Panamá':'pa','Portugal':'pt','Nigeria':'ng','Uzbekistán':'uz','Honduras':'hn','Países Bajos':'nl','Camerún':'cm','Corea del Sur':'kr','Jamaica':'jm','Bélgica':'be','Argelia':'dz','Emiratos Árabes Unidos':'ae','El Salvador':'sv','Croacia':'hr','Túnez':'tn','Colombia':'co','Uruguay':'uy','Italia':'it','Costa de Marfil':'ci','Arabia Saudita':'sa','Ecuador':'ec','Suiza':'ch','Escocia':'gb','Nueva Zelanda':'nz','Perú':'pe','Dinamarca':'dk','Polonia':'pl','Gales':'gb','Austria':'at','Brasil':'br','Serbia':'rs','Sudáfrica':'za','República Checa':'cz','Bosnia y Herzegovina':'ba','Qatar':'qa','Haití':'ht','RD Congo':'cd','Paraguay':'py','Noruega':'no','Suecia':'se','Argentina':'ar','Suecia':'se','Escocia':'gb','Gales':'gb','Inglaterra':'gb'
};

function normalizeBandera(paisNombre, urlActual) {
  if (!urlActual || typeof urlActual !== 'string') return urlActual || '';
  if (!urlActual.includes('example.com')) return urlActual;
  const code = COUNTRY_FLAG_MAP[paisNombre];
  if (!code) return urlActual;
  return `https://flagcdn.com/w80/${code}.png`;
}

// --- SIMULACION: Índice de Fuerza (IF), probabilidades, Poisson, Monte Carlo ---
function safeNum(v, def = 0) { return (v === undefined || v === null || Number.isNaN(Number(v))) ? def : Number(v); }

function poissonPmf(lambda, k) {
  return Math.exp(-lambda) * Math.pow(lambda, k) / (factorial(k));
}

function factorial(n) {
  if (n < 2) return 1;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function poissonSample(lambda) {
  // Knuth algorithm
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= Math.random();
  } while (p > L);
  return k - 1;
}

function computeIFForSelection(selDoc, stats = {}, weights = null) {
  // Default weights (from PDF example)
  const defaultWeights = {
    ranking: 0.20,
    historial_mundial: 0.15,
    historial_rival: 0.10,
    goles_anotados: 0.10,
    goles_recibidos: 0.10,
    diferencia_goles: 0.10,
    partidos_ganados: 0.10,
    valor_plantilla: 0.05,
    experiencia: 0.05
  };
  const w = weights || defaultWeights;

  // Normalize ranking: lower ranking number -> better. Use maxRank fallback
  const maxRank = 250;
  const rankingScore = ('ranking' in selDoc) ? ((maxRank - safeNum(selDoc.ranking, maxRank)) / maxRank) * 100 : 50;

  const pj = safeNum(stats.pj, 0);
  const gf = safeNum(stats.gf, 0);
  const gc = safeNum(stats.gc, 0);
  const pg = safeNum(stats.pg, 0);
  const diferencia = gf - gc;

  const golesAnotadosScore = pj > 0 ? Math.min(100, (gf / pj) * 40) : 20; // heuristic
  const golesRecibidosScore = pj > 0 ? Math.max(0, 100 - (gc / pj) * 40) : 50;
  const diferenciaScore = Math.max(0, Math.min(100, (diferencia + 10) * 5));
  const partidosGanadosScore = pj > 0 ? (pg / pj) * 100 : 20;

  const historialMundialScore = safeNum(selDoc.experiencia_mundiales, 0) > 0 ? Math.min(100, selDoc.experiencia_mundiales * 10) : 0;
  const valorPlantillaScore = safeNum(selDoc.valor_plantilla, 0) > 0 ? Math.min(100, selDoc.valor_plantilla / 1_000_000) : 0;

  const score = (rankingScore * w.ranking)
    + (historialMundialScore * w.historial_mundial)
    + (golesAnotadosScore * w.goles_anotados)
    + (golesRecibidosScore * w.goles_recibidos)
    + (diferenciaScore * w.diferencia_goles)
    + (partidosGanadosScore * w.partidos_ganados)
    + (valorPlantillaScore * w.valor_plantilla)
    + (historialMundialScore * w.experiencia);

  // Clamp 0-100
  const IF = Math.max(0, Math.min(100, score));
  return { IF: parseFloat(IF.toFixed(2)), components: { rankingScore, golesAnotadosScore, golesRecibidosScore, diferenciaScore, partidosGanadosScore, valorPlantillaScore, historialMundialScore } };
}

function probabilitiesFromIF(ifA, ifB, homeAdv = 0) {
  // Apply home advantage
  const A = Math.max(0.001, ifA + homeAdv);
  const B = Math.max(0.001, ifB);
  // Use Bradley-Terry style with a draw baseline
  const skal = 10; // scale to soften differences
  const ra = Math.exp(A / skal);
  const rb = Math.exp(B / skal);
  const pNoDrawA = ra / (ra + rb);
  const pNoDrawB = rb / (ra + rb);
  const baselineDraw = 0.18; // default draw probability
  // Reduce draw slightly as disparity grows
  const disparity = Math.abs(A - B) / 100;
  const draw = Math.max(0.06, baselineDraw * (1 - disparity));
  const remaining = 1 - draw;
  const pA = parseFloat((remaining * pNoDrawA).toFixed(4));
  const pB = parseFloat((remaining * pNoDrawB).toFixed(4));
  return { local: pA, draw, visitante: pB };
}

async function computeTeamStats(db, seleccionId) {
  // aggregate local stats: pj, pg, pe, pp, gf, gc
  try {
    const oid = ObjectId.isValid(seleccionId) ? new ObjectId(seleccionId) : null;
    if (!oid) return { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0 };
    const pipeline = [
      { $match: { $or: [{ equipo_localId: oid }, { equipo_visitanteId: oid }] } },
      { $project: { equipo_localId: 1, goles_local: { $ifNull: ['$goles_local', 0] }, goles_visitante: { $ifNull: ['$goles_visitante', 0] } } },
      { $group: { _id: null, pj: { $sum: 1 }, gf: { $sum: { $cond: [{ $eq: ['$equipo_localId', oid] }, '$goles_local', '$goles_visitante'] } }, gc: { $sum: { $cond: [{ $eq: ['$equipo_localId', oid] }, '$goles_visitante', '$goles_local'] } }, pg: { $sum: { $cond: [{ $and: [{ $eq: ['$equipo_localId', oid] }, { $gt: ['$goles_local', '$goles_visitante'] }] }, 1, { $cond: [{ $and: [{ $eq: ['$equipo_visitanteId', oid] }, { $gt: ['$goles_visitante', '$goles_local'] }] }, 1, 0] } ] } }, pe: { $sum: { $cond: [{ $eq: ['$goles_local', '$goles_visitante'] }, 1, 0] } } } }
    ];
    const res = await db.collection('partidos').aggregate(pipeline).toArray();
    if (!res || res.length === 0) return { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0 };
    const r = res[0];
    const pp = (r.pj || 0) - (r.pg || 0) - (r.pe || 0);
    return { pj: safeNum(r.pj, 0), pg: safeNum(r.pg, 0), pe: safeNum(r.pe, 0), pp: safeNum(pp, 0), gf: safeNum(r.gf, 0), gc: safeNum(r.gc, 0) };
  } catch (err) {
    return { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0 };
  }
}

async function monteCarloMatch(db, localId, visitanteId, iterations = 5000, homeAdv = 5) {
  const localDoc = await db.collection('selecciones').findOne({ _id: new ObjectId(localId) });
  const visitanteDoc = await db.collection('selecciones').findOne({ _id: new ObjectId(visitanteId) });
  const localStats = await computeTeamStats(db, localId);
  const visitanteStats = await computeTeamStats(db, visitanteId);
  const ifLocalObj = computeIFForSelection(localDoc || {}, localStats);
  const ifVisitObj = computeIFForSelection(visitanteDoc || {}, visitanteStats);
  const probs = probabilitiesFromIF(ifLocalObj.IF, ifVisitObj.IF, homeAdv);

  // Estimate expected goals (lambda) per team from historic avg and IF ratio
  const avgLocal = localStats.pj > 0 ? (localStats.gf / localStats.pj) : 1.2;
  const avgVisit = visitanteStats.pj > 0 ? (visitanteStats.gf / visitanteStats.pj) : 0.9;
  const ratio = (ifLocalObj.IF + ifVisitObj.IF) > 0 ? (ifLocalObj.IF / (ifLocalObj.IF + ifVisitObj.IF)) : 0.5;
  const lambdaLocal = Math.max(0.1, (avgLocal * (0.8 + ratio)));
  const lambdaVisit = Math.max(0.05, (avgVisit * (0.8 + (1 - ratio))));

  let localWins = 0, visitanteWins = 0, draws = 0; let totalGoalsLocal = 0, totalGoalsVisit = 0;
  const scoreMap = new Map();
  for (let i = 0; i < iterations; i++) {
    const gLocal = poissonSample(lambdaLocal);
    const gVisit = poissonSample(lambdaVisit);
    totalGoalsLocal += gLocal; totalGoalsVisit += gVisit;
    const key = `${gLocal}-${gVisit}`;
    scoreMap.set(key, (scoreMap.get(key) || 0) + 1);
    if (gLocal > gVisit) localWins++; else if (gLocal < gVisit) visitanteWins++; else draws++;
  }

  // Convert scoreMap to top outcomes
  const topScores = Array.from(scoreMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([score, cnt]) => ({ score, count: cnt, pct: parseFloat(((cnt / iterations) * 100).toFixed(2)) }));

  return {
    local: { id: localId, nombre: localDoc?.nombre || 'Local', IF: ifLocalObj.IF, promedio_goles_hist: avgLocal },
    visitante: { id: visitanteId, nombre: visitanteDoc?.nombre || 'Visitante', IF: ifVisitObj.IF, promedio_goles_hist: avgVisit },
    probs,
    lambda: { local: parseFloat(lambdaLocal.toFixed(3)), visitante: parseFloat(lambdaVisit.toFixed(3)) },
    iterations,
    resultados: { localWins, visitanteWins, draws, pctLocal: parseFloat(((localWins / iterations) * 100).toFixed(2)), pctVisita: parseFloat(((visitanteWins / iterations) * 100).toFixed(2)), pctDraw: parseFloat(((draws / iterations) * 100).toFixed(2)) },
    avgGoals: { local: parseFloat((totalGoalsLocal / iterations).toFixed(3)), visitante: parseFloat((totalGoalsVisit / iterations).toFixed(3)) },
    topScores
  };
}

// --- Estadísticas y historial helpers ---
async function countCleanSheets(db, seleccionId) {
  try {
    const oid = new ObjectId(seleccionId);
    const pipeline = [
      { $match: { $or: [{ equipo_localId: oid }, { equipo_visitanteId: oid }] } },
      { $project: { isLocal: { $eq: ['$equipo_localId', oid] }, goles_local: { $ifNull: ['$goles_local', 0] }, goles_visitante: { $ifNull: ['$goles_visitante', 0] } } },
      { $project: { clean: { $cond: [{ $and: [{ $eq: ['$isLocal', true] }, { $eq: ['$goles_visitante', 0] }] }, 1, { $cond: [{ $and: [{ $eq: ['$isLocal', false] }, { $eq: ['$goles_local', 0] }] }, 1, 0] } ] } } },
      { $group: { _id: null, count: { $sum: '$clean' } } }
    ];
    const res = await db.collection('partidos').aggregate(pipeline).toArray();
    return (res && res[0]) ? safeNum(res[0].count, 0) : 0;
  } catch (e) { return 0; }
}

async function populateEstadisticas(db) {
  const selecciones = await db.collection('selecciones').find({}).toArray();
  const out = [];
  for (const s of selecciones) {
    const sid = s._id.toString();
    const stats = await computeTeamStats(db, sid);
    const porterias_cero = await countCleanSheets(db, sid);
    const partidos_jugados = safeNum(stats.pj, 0);
    const partidos_ganados = safeNum(stats.pg, 0);
    const partidos_empatados = safeNum(stats.pe, 0);
    const partidos_perdidos = safeNum(stats.pp, 0);
    const goles_favor = safeNum(stats.gf, 0);
    const goles_contra = safeNum(stats.gc, 0);

    const doc = {
      seleccionId: new ObjectId(s._id),
      partidos_jugados,
      partidos_ganados,
      partidos_empatados,
      partidos_perdidos,
      goles_favor,
      goles_contra,
      porterias_cero,
      tiros_porteria: safeNum(s.tiros_porteria, 0),
      posesion_promedio: safeNum(s.posesion_promedio, 0),
      tiros_de_esquina: safeNum(s.tiros_esquina, 0),
      faltas: safeNum(s.faltas, 0),
      tarjetas_amarillas: safeNum(s.tarjetas_amarillas, 0),
      tarjetas_rojas: safeNum(s.tarjetas_rojas, 0),
      penales_anotados: safeNum(s.penales_anotados, 0),
      penales_fallados: safeNum(s.penales_fallados, 0),
      ranking_fifa: safeNum(s.ranking, 0),
      valor_plantilla: safeNum(s.valor_plantilla, 0),
      edad_promedio: safeNum(s.edad_promedio, 0),
      experiencia_mundiales: safeNum(s.experiencia_mundiales, 0),
      titulos_mundiales: safeNum(s.titulos_mundiales, 0),
      subcampeonatos: safeNum(s.subcampeonatos, 0),
      updatedAt: new Date()
    };

    // Upsert by seleccionId
    await db.collection('estadisticas_seleccion').updateOne({ seleccionId: new ObjectId(s._id) }, { $set: doc }, { upsert: true });
    out.push({ seleccionId: sid, nombre: s.nombre });
  }
  return out;
}

async function computeHeadToHead(db) {
  // produce a collection of enfrentamientos agregados
  const partidos = await db.collection('partidos').find({}).toArray();
  const map = new Map();
  partidos.forEach(p => {
    const a = p.equipo_localId?.toString();
    const b = p.equipo_visitanteId?.toString();
    if (!a || !b) return;
    const key = a < b ? `${a}__${b}` : `${b}__${a}`;
    const rec = map.get(key) || { local: a, visitante: b, visitas: 0, victoriasA: 0, victoriasB: 0, empates: 0, golesA: 0, golesB: 0 };
    const gA = safeNum(p.goles_local, 0), gB = safeNum(p.goles_visitante, 0);
    rec.golesA += gA; rec.golesB += gB; rec.visitas++;
    if (gA > gB) rec.victoriasA++; else if (gB > gA) rec.victoriasB++; else rec.empates++;
    map.set(key, rec);
  });
  const out = Array.from(map.values());
  // replace or insert
  await db.collection('historial_enfrentamientos').deleteMany({});
  if (out.length) await db.collection('historial_enfrentamientos').insertMany(out);
  return out;
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
          { $sort: { fecha: -1 } }
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
        const partidos = await db.collection('partidos').find({}).sort({ fecha: -1 }).toArray();
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

      if (url.pathname === '/api/simulacion') {
        const params = url.searchParams;
        const tipo = params.get('consulta') || '1';
        const seleccionId = params.get('seleccionId');

        if (tipo === '1') {
          const data = await db.collection('clasificaciones').aggregate([
            { $lookup: { from: 'selecciones', localField: 'seleccionId', foreignField: '_id', as: 'seleccion' } },
            { $unwind: '$seleccion' },
            { $lookup: { from: 'grupos', localField: 'grupoId', foreignField: '_id', as: 'grupo' } },
            { $unwind: { path: '$grupo', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'continentes', localField: 'seleccion.continenteId', foreignField: '_id', as: 'continente' } },
            { $unwind: { path: '$continente', preserveNullAndEmptyArrays: true } },
            { $project: { _id: 0, grupo: '$grupo.nombre', seleccion: '$seleccion.nombre', bandera: '$seleccion.banderaUrl', continente: '$continente.nombre', ranking: '$seleccion.ranking', pj: 1, pg: 1, pe: 1, pp: 1, gf: 1, gc: 1, dg: 1, pts: 1 } },
            { $sort: { grupo: 1, pts: -1, dg: -1, gf: -1 } }
          ]).toArray();
          sendJson(res, 200, data.map(item => ({ ...item, bandera: normalizeBandera(item.seleccion, item.bandera) })));
          return;
        }

        if (tipo === '2') {
          if (!seleccionId) {
            const sel = await db.collection('selecciones').find({}, { projection: { nombre: 1, banderaUrl: 1 } }).sort({ nombre: 1 }).toArray();
            sendJson(res, 200, { requiereSeleccion: true, selecciones: sel.map(s => ({ id: s._id.toString(), nombre: s.nombre, bandera: normalizeBandera(s.nombre, s.banderaUrl) })) });
            return;
          }
          if (!ObjectId.isValid(seleccionId)) {
            sendJson(res, 400, { error: 'ID de selección inválido', received: seleccionId });
            return;
          }
          const selObj = await db.collection('selecciones').findOne({ _id: new ObjectId(seleccionId) });
          if (!selObj) { sendJson(res, 404, { error: 'Selección no encontrada' }); return; }
          const partidos = await db.collection('partidos').aggregate([
            { $match: { $expr: { $or: [{ $eq: ['$equipo_localId', new ObjectId(seleccionId)] }, { $eq: ['$equipo_visitanteId', new ObjectId(seleccionId)] }] } } },
            { $lookup: { from: 'selecciones', localField: 'equipo_localId', foreignField: '_id', as: 'local' } },
            { $unwind: { path: '$local', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'selecciones', localField: 'equipo_visitanteId', foreignField: '_id', as: 'visitante' } },
            { $unwind: { path: '$visitante', preserveNullAndEmptyArrays: true } },
            { $project: { _id: 0, fecha: 1, rival: { $cond: [{ $eq: ['$equipo_localId', new ObjectId(seleccionId)] }, '$visitante.nombre', '$local.nombre'] }, goles_local: 1, goles_visitante: 1, es_local: { $eq: ['$equipo_localId', new ObjectId(seleccionId)] } } },
            { $sort: { fecha: -1 } }
          ]).toArray();
          const partidosLegibles = partidos.map(p => {
            const condicion = p.es_local ? 'Local' : 'Visitante';
            const fechaStr = p.fecha ? new Date(p.fecha).toLocaleDateString('es-ES') : 'Sin fecha';
            return `${selObj.nombre} ${p.goles_local}-${p.goles_visitante} ${p.rival} (${condicion}) - ${fechaStr}`;
          });
          const ultimoLegible = partidosLegibles[0] || 'Sin partidos';
          let golesAnotados = 0, golesRecibidos = 0, victorias = 0, empates = 0, derrotas = 0;
          partidos.forEach(p => {
            const misGoles = p.es_local ? p.goles_local : p.goles_visitante;
            const susGoles = p.es_local ? p.goles_visitante : p.goles_local;
            golesAnotados += misGoles || 0;
            golesRecibidos += susGoles || 0;
            if (misGoles > susGoles) victorias++;
            else if (misGoles < susGoles) derrotas++;
            else empates++;
          });
          sendJson(res, 200, { seleccion: selObj.nombre, bandera: normalizeBandera(selObj.nombre, selObj.banderaUrl), partidos: partidosLegibles, victorias, empates, derrotas, golesAnotados, golesRecibidos, ultimoPartido: ultimoLegible });
          return;
        }

        if (tipo === '3') {
          const sel = await db.collection('selecciones').aggregate([
            { $lookup: { from: 'continentes', localField: 'continenteId', foreignField: '_id', as: 'continente' } },
            { $unwind: { path: '$continente', preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                from: 'partidos',
                let: { sid: '$_id' },
                pipeline: [
                  { $match: { $expr: { $or: [{ $eq: ['$equipo_localId', '$$sid'] }, { $eq: ['$equipo_visitanteId', '$$sid'] }] } } },
                  { $group: { _id: null, goles: { $sum: { $add: ['$goles_local', '$goles_visitante'] } }, partidos: { $sum: 1 } } }
                ],
                as: 'stats'
              }
            },
            { $unwind: { path: '$stats', preserveNullAndEmptyArrays: true } },
            { $project: { _id: 0, seleccion: '$nombre', bandera: '$banderaUrl', ranking: 1, continente: '$continente.nombre', promedio_goles: { $cond: [{ $gt: [{ $ifNull: ['$stats.partidos', 0] }, 0] }, { $divide: ['$stats.goles', '$stats.partidos'] }, 0] }, partidos: { $ifNull: ['$stats.partidos', 0] } } },
            { $sort: { promedio_goles: -1 } }
          ]).toArray();
          sendJson(res, 200, sel.map(item => ({ ...item, bandera: normalizeBandera(item.seleccion, item.bandera) })));
          return;
        }

        if (tipo === '4') {
          const estadios = await db.collection('partidos').aggregate([
            { $group: { _id: '$estadioId', total_partidos: { $sum: 1 } } },
            { $lookup: { from: 'estadios', localField: '_id', foreignField: '_id', as: 'estadio' } },
            { $unwind: '$estadio' },
            {
              $lookup: {
                from: 'partidos',
                let: { eid: '$_id' },
                pipeline: [
                  { $match: { $expr: { $eq: ['$estadioId', '$$eid'] } } },
                  { $lookup: { from: 'selecciones', localField: 'equipo_localId', foreignField: '_id', as: 'local' } },
                  { $unwind: { path: '$local', preserveNullAndEmptyArrays: true } },
                  { $lookup: { from: 'selecciones', localField: 'equipo_visitanteId', foreignField: '_id', as: 'visitante' } },
                  { $unwind: { path: '$visitante', preserveNullAndEmptyArrays: true } },
                  { $project: { _id: 0, local: '$local.nombre', visitante: '$visitante.nombre', goles_local: 1, goles_visitante: 1 } }
                ],
                as: 'detalle'
              }
            },
            { $project: { _id: 0, estadio: '$estadio.nombre', ciudad: '$estadio.ciudad', capacidad: '$estadio.capacidad', total_partidos: 1, detalle: 1 } },
            { $sort: { total_partidos: -1 } }
          ]).toArray();
          sendJson(res, 200, estadios);
          return;
        }

        if (tipo === '5') {
          if (!seleccionId) {
            const sel = await db.collection('selecciones').find({}, { projection: { nombre: 1, banderaUrl: 1 } }).sort({ nombre: 1 }).toArray();
            sendJson(res, 200, { requiereSeleccion: true, selecciones: sel.map(s => ({ id: s._id.toString(), nombre: s.nombre, bandera: normalizeBandera(s.nombre, s.banderaUrl) })) });
            return;
          }
          if (!ObjectId.isValid(seleccionId)) {
            sendJson(res, 400, { error: 'ID de selección inválido', received: seleccionId });
            return;
          }
          const selObj = await db.collection('selecciones').findOne({ _id: new ObjectId(seleccionId) });
          if (!selObj) { sendJson(res, 404, { error: 'Selección no encontrada' }); return; }
          const partidos = await db.collection('partidos').aggregate([
            { $match: { $expr: { $or: [{ $eq: ['$equipo_localId', new ObjectId(seleccionId)] }, { $eq: ['$equipo_visitanteId', new ObjectId(seleccionId)] }] } } },
            { $lookup: { from: 'estadios', localField: 'estadioId', foreignField: '_id', as: 'estadio' } },
            { $unwind: { path: '$estadio', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'selecciones', localField: 'equipo_localId', foreignField: '_id', as: 'local' } },
            { $unwind: { path: '$local', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'selecciones', localField: 'equipo_visitanteId', foreignField: '_id', as: 'visitante' } },
            { $unwind: { path: '$visitante', preserveNullAndEmptyArrays: true } },
            { $project: { _id: 0, fecha: 1, rival: { $cond: [{ $eq: ['$equipo_localId', new ObjectId(seleccionId)] }, '$visitante.nombre', '$local.nombre'] }, estadio: '$estadio.nombre', ciudad: '$estadio.ciudad', goles_local: 1, goles_visitante: 1, es_local: { $eq: ['$equipo_localId', new ObjectId(seleccionId)] } } },
            { $sort: { fecha: -1 } }
          ]).toArray();
          const resultado = partidos.map(p => ({ ...p, resultado: `${p.goles_local ?? '-'} - ${p.goles_visitante ?? '-'}` }));
          sendJson(res, 200, { seleccion: selObj.nombre, bandera: normalizeBandera(selObj.nombre, selObj.banderaUrl), partidos: resultado });
          return;
        }

        if (tipo === '6') {
          const data = await db.collection('selecciones').aggregate([
            { $lookup: { from: 'clasificaciones', localField: '_id', foreignField: 'seleccionId', as: 'clasif' } },
            { $unwind: { path: '$clasif', preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                from: 'partidos',
                let: { sid: '$_id' },
                pipeline: [
                  { $match: { $expr: { $or: [{ $eq: ['$equipo_localId', '$$sid'] }, { $eq: ['$equipo_visitanteId', '$$sid'] }] } } },
                  { $group: { _id: null, pj: { $sum: 1 }, pg: { $sum: { $cond: [{ $or: [{ $and: [{ $eq: ['$equipo_localId', '$$sid'] }, { $gt: ['$goles_local', '$goles_visitante'] }] }, { $and: [{ $eq: ['$equipo_visitanteId', '$$sid'] }, { $gt: ['$goles_visitante', '$goles_local'] }] }] }, 1, 0] } }, pe: { $sum: { $cond: [{ $eq: ['$goles_local', '$goles_visitante'] }, 1, 0] } }, pp: { $sum: { $cond: [{ $or: [{ $and: [{ $eq: ['$equipo_localId', '$$sid'] }, { $lt: ['$goles_local', '$goles_visitante'] }] }, { $and: [{ $eq: ['$equipo_visitanteId', '$$sid'] }, { $lt: ['$goles_visitante', '$goles_local'] }] }] }, 1, 0] } } } }
                ],
                as: 'stats'
              }
            },
            { $unwind: { path: '$stats', preserveNullAndEmptyArrays: true } },
            { $project: { _id: 0, seleccion: '$nombre', bandera: '$banderaUrl', ranking: 1, pj: { $ifNull: ['$stats.pj', { $ifNull: ['$clasif.pj', 0] }] }, pg: { $ifNull: ['$stats.pg', { $ifNull: ['$clasif.pg', 0] }] }, pe: { $ifNull: ['$stats.pe', { $ifNull: ['$clasif.pe', 0] }] }, pp: { $ifNull: ['$stats.pp', { $ifNull: ['$clasif.pp', 0] }] }, campeon: { $literal: 0 }, finales: [] } },
            { $sort: { pj: -1 } }
          ]).toArray();
          sendJson(res, 200, data.map(item => ({ ...item, bandera: normalizeBandera(item.seleccion, item.bandera) })));
          return;
        }

        if (tipo === '7') {
          const partidos = await db.collection('partidos').aggregate([
            { $lookup: { from: 'selecciones', localField: 'equipo_localId', foreignField: '_id', as: 'local' } },
            { $unwind: { path: '$local', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'selecciones', localField: 'equipo_visitanteId', foreignField: '_id', as: 'visitante' } },
            { $unwind: { path: '$visitante', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'clasificaciones', localField: 'equipo_localId', foreignField: 'seleccionId', as: 'clasif_local' } },
            { $unwind: { path: '$clasif_local', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'clasificaciones', localField: 'equipo_visitanteId', foreignField: 'seleccionId', as: 'clasif_visitante' } },
            { $unwind: { path: '$clasif_visitante', preserveNullAndEmptyArrays: true } },
            { $project: { _id: 0, id: '$_id', fecha: 1, goles_local: 1, goles_visitante: 1, equipo_local: '$local.nombre', equipo_visitante: '$visitante.nombre', ranking_local: '$local.ranking', ranking_visitante: '$visitante.ranking', gf_local: { $ifNull: ['$clasif_local.gf', 0] }, gc_local: { $ifNull: ['$clasif_local.gc', 0] }, pj_local: { $ifNull: ['$clasif_local.pj', 0] }, gf_visitante: { $ifNull: ['$clasif_visitante.gf', 0] }, gc_visitante: { $ifNull: ['$clasif_visitante.gc', 0] }, pj_visitante: { $ifNull: ['$clasif_visitante.pj', 0] } } },
            { $sort: { fecha: 1 } }
          ]).toArray();
          const resultado = partidos.map(p => {
            const promGolesLocal = p.pj_local > 0 ? (p.gf_local / p.pj_local) : 0;
            const promGolesVisitante = p.pj_visitante > 0 ? (p.gf_visitante / p.pj_visitante) : 0;
            const fuerzaLocal = p.ranking_local + promGolesLocal + (p.gc_local > 0 ? -p.gc_local : 0);
            const fuerzaVisitante = p.ranking_visitante + promGolesVisitante + (p.gc_visitante > 0 ? -p.gc_visitante : 0);
            const suma = fuerzaLocal + fuerzaVisitante;
            const probLocal = suma > 0 ? parseFloat(((fuerzaLocal / suma) * 100).toFixed(2)) : 50;
            const probVisitante = suma > 0 ? parseFloat(((fuerzaVisitante / suma) * 100).toFixed(2)) : 50;
            return { ...p, promedio_goles_local: parseFloat(promGolesLocal.toFixed(2)), promedio_goles_visitante: parseFloat(promGolesVisitante.toFixed(2)), goles_recibidos_local: p.gc_local, goles_recibidos_visitante: p.gc_visitante, fuerza_local: parseFloat(fuerzaLocal.toFixed(2)), fuerza_visitante: parseFloat(fuerzaVisitante.toFixed(2)), probabilidad_local: probLocal, probabilidad_visitante: probVisitante };
          });
          sendJson(res, 200, resultado);
          return;
        }

        if (tipo === '8') {
          const data = await db.collection('boletos').aggregate([
            { $lookup: { from: 'estadios', localField: 'estadioId', foreignField: '_id', as: 'estadio' } },
            { $unwind: '$estadio' },
            { $group: { _id: '$estadioId', nombre_estadio: { $first: '$estadio.nombre' }, ciudad: { $first: '$estadio.ciudad' }, capacidad: { $first: '$estadio.capacidad' }, promedio_costo: { $avg: '$costo' }, costo_min: { $min: '$costo' }, costo_max: { $max: '$costo' }, total_boletos: { $sum: 1 }, partidos: { $addToSet: '$partidoId' } } },
            { $project: { _id: 0, estadio: '$nombre_estadio', ciudad: 1, capacidad: 1, promedio_costo: { $trunc: ['$promedio_costo', 2] }, costo_min: 1, costo_max: 1, total_boletos: 1, numero_partidos: { $size: '$partidos' } } },
            { $sort: { promedio_costo: -1 } }
          ]).toArray();
          sendJson(res, 200, data);
          return;
        }

        if (tipo === '9') {
          const data = await db.collection('selecciones').aggregate([
            { $lookup: { from: 'continentes', localField: 'continenteId', foreignField: '_id', as: 'continente' } },
            { $unwind: { path: '$continente', preserveNullAndEmptyArrays: true } },
            { $project: { _id: 0, ranking: 1, continente: '$continente.nombre', confederacion: '$continente.confederacion', seleccion: '$nombre', bandera: '$banderaUrl' } },
            { $sort: { ranking: 1 } }
          ]).toArray();
          sendJson(res, 200, data.map(item => ({ ...item, bandera: normalizeBandera(item.seleccion, item.bandera) })));
          return;
        }

        if (tipo === '10') {
          const partidos = await db.collection('partidos').aggregate([
            { $lookup: { from: 'selecciones', localField: 'equipo_localId', foreignField: '_id', as: 'local' } },
            { $unwind: { path: '$local', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'selecciones', localField: 'equipo_visitanteId', foreignField: '_id', as: 'visitante' } },
            { $unwind: { path: '$visitante', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'estadios', localField: 'estadioId', foreignField: '_id', as: 'estadio' } },
            { $unwind: { path: '$estadio', preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                from: 'partidos',
                let: { lid: '$equipo_localId', vid: '$equipo_visitanteId' },
                pipeline: [
                  { $match: { $expr: { $or: [{ $eq: ['$equipo_localId', '$$lid'] }, { $eq: ['$equipo_visitanteId', '$$vid'] }] } } },
                  { $group: { _id: null, victorias_local: { $sum: { $cond: [{ $eq: ['$equipo_localId', '$$lid'] }, { $cond: [{ $gt: ['$goles_local', '$goles_visitante'] }, 1, 0] }, { $cond: [{ $gt: ['$goles_visitante', '$goles_local'] }, 1, 0] }] } }, victorias_visitante: { $sum: { $cond: [{ $eq: ['$equipo_localId', '$$vid'] }, { $cond: [{ $gt: ['$goles_local', '$goles_visitante'] }, 1, 0] }, { $cond: [{ $gt: ['$goles_visitante', '$goles_local'] }, 1, 0] }] } }, empates: { $sum: { $cond: [{ $eq: ['$goles_local', '$goles_visitante'] }, 1, 0] } } } }
                ],
                as: 'historial'
              }
            },
            { $unwind: { path: '$historial', preserveNullAndEmptyArrays: true } },
            { $project: { _id: 0, partido: { id: '$_id', fecha: 1, fase: '$faseId' }, equipo_local: '$local.nombre', equipo_visitante: '$visitante.nombre', ranking_local: '$local.ranking', ranking_visitante: '$visitante.ranking', estadio: '$estadio.nombre', ciudad: '$estadio.ciudad', capacidad: '$estadio.capacidad', victorias_local: { $ifNull: ['$historial.victorias_local', 0] }, victorias_visitante: { $ifNull: ['$historial.victorias_visitante', 0] }, empates: { $ifNull: ['$historial.empates', 0] } } },
            { $sort: { fecha: 1 } }
          ]).toArray();
          sendJson(res, 200, partidos);
          return;
        }

        // --- Nuevo: calcular IF para todas las selecciones (consulta=11) ---
        if (tipo === '11') {
          const selecciones = await db.collection('selecciones').find({}).toArray();
          const results = [];
          for (const s of selecciones) {
            const stats = await computeTeamStats(db, s._id.toString());
            const ifObj = computeIFForSelection(s, stats);
            results.push({ id: s._id.toString(), nombre: s.nombre, IF: ifObj.IF, components: ifObj.components });
          }
          results.sort((a, b) => b.IF - a.IF);
          sendJson(res, 200, results);
          return;
        }

        // --- Nuevo: simulación Monte Carlo para un partido (consulta=12) ---
        if (tipo === '12') {
          const localId = params.get('localId') || params.get('equipo_localId') || params.get('home');
          const visitanteId = params.get('visitanteId') || params.get('equipo_visitanteId') || params.get('away');
          const iter = Math.max(100, parseInt(params.get('iter') || params.get('iterations') || '5000', 10));
          if (!localId || !visitanteId) { sendJson(res, 400, { error: 'Faltan localId o visitanteId' }); return; }
          if (!ObjectId.isValid(localId) || !ObjectId.isValid(visitanteId)) { sendJson(res, 400, { error: 'IDs inválidos' }); return; }
          const resultado = await monteCarloMatch(db, localId, visitanteId, iter, 5);
          sendJson(res, 200, resultado);
          return;
        }

        sendJson(res, 400, { error: 'Consulta de simulación no válida' });
        return;
      }
    }

    // --- MANEJO DE RUTAS POST ---
    if (req.method === 'POST') {
      if (url.pathname === '/api/admin/poblar-estadisticas') {
        try {
          const out = await populateEstadisticas(db);
          sendJson(res, 200, { ok: true, updated: out.length, items: out });
        } catch (err) { console.error(err); sendJson(res, 500, { ok: false, error: err.message }); }
        return;
      }

      if (url.pathname === '/api/admin/compute-h2h') {
        try {
          const out = await computeHeadToHead(db);
          sendJson(res, 200, { ok: true, updated: out.length });
        } catch (err) { console.error(err); sendJson(res, 500, { ok: false, error: err.message }); }
        return;
      }

      // CRUD for IF weights
      if (url.pathname === '/api/admin/if-pesos') {
        const body = await parseJsonBody(req).catch(() => ({}));
        try {
          const doc = { ...body, updatedAt: new Date() };
          await db.collection('config').updateOne({ key: 'if_weights' }, { $set: { value: doc } }, { upsert: true });
          sendJson(res, 200, { ok: true, message: 'Pesos IF guardados' });
        } catch (err) { console.error(err); sendJson(res, 500, { ok: false, error: err.message }); }
        return;
      }
      if (url.pathname === '/api/admin/login') {
        const body = await parseJsonBody(req).catch(() => ({}));
        const usuario = (body.usuario || body.user || '').toString();
        const password = (body.password || '').toString();
        if (!usuario || !password) {
          sendJson(res, 400, { error: 'Faltan credenciales' });
          return;
        }
        let userDoc = await db.collection('admin').findOne({ usuario }).catch(() => null);
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

      if (url.pathname === '/api/admin/partidos-random') {
        const fases = await db.collection('fase_final').find({}).toArray();
        const selecciones = await db.collection('selecciones').find({}).toArray();
        const estadios = await db.collection('estadios').find({}).toArray();
        if (!fases.length || !selecciones.length || !estadios.length) {
          sendJson(res, 400, { error: 'Faltan datos base: fases, selecciones o estadios' });
          return;
        }
        const fase = fases[Math.floor(Math.random() * fases.length)];
        const shuffle = arr => arr.slice().sort(() => Math.random() - 0.5);
        const [local, visitante] = shuffle(selecciones).slice(0, 2);
        const estadio = estadios[Math.floor(Math.random() * estadios.length)];
        const hoy = new Date();
        const fecha = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + Math.floor(Math.random() * 30), 10 + Math.floor(Math.random() * 12), 0, 0);
        sendJson(res, 200, {
          faseId: fase._id.toString(),
          equipo_localId: local._id.toString(),
          equipo_visitanteId: visitante._id.toString(),
          estadioId: estadio._id.toString(),
          fecha: fecha.toISOString().slice(0, 16),
          horario: fecha.toISOString().slice(11, 16),
          goles_local: Math.floor(Math.random() * 4),
          goles_visitante: Math.floor(Math.random() * 4)
        });
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

const PORT = process.env.PORT || 3002;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`API escuchando en http://0.0.0.0:${PORT}`);
});
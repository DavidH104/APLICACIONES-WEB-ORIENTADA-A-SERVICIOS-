use('mundial2026');

const db = db.getSiblingDB('mundial2026');

const indexOps = [
  ['selecciones', { continenteId: 1 }],
  ['selecciones', { grupoId: 1 }],
  ['partidos', { estadioId: 1 }],
  ['partidos', { faseId: 1 }],
  ['partidos', { equipo_localId: 1 }],
  ['partidos', { equipo_visitanteId: 1 }],
  ['boletos', { usuarioId: 1 }],
  ['boletos', { estadioId: 1 }],
  ['boletos', { seleccionId: 1 }],
  ['clasificaciones', { grupoId: 1 }],
  ['clasificaciones', { seleccionId: 1 }]
];

for (const [name, spec] of indexOps) {
  db.getCollection(name).createIndex(spec);
}

const selecciones = db.getCollection('selecciones').find({}, { _id: 1, nombre: 1, grupoId: 1 }).toArray();
const selectionById = Object.fromEntries(selecciones.map(s => [s._id.toString(), s]));
const selectionByName = Object.fromEntries(selecciones.map(s => [s.nombre, s]));
const classificationMap = new Map();

function ensureClassification(seleccionId, grupoId) {
  const key = `${seleccionId.toString()}_${grupoId.toString()}`;
  if (!classificationMap.has(key)) {
    classificationMap.set(key, {
      grupoId,
      seleccionId,
      pj: 0,
      pg: 0,
      pe: 0,
      pp: 0,
      gf: 0,
      gc: 0,
      dg: 0,
      pts: 0
    });
  }
  return classificationMap.get(key);
}

for (const match of db.getCollection('partidos').find({}).toArray()) {
  const local = selectionById[match.equipo_localId.toString()];
  const visitante = selectionById[match.equipo_visitanteId.toString()];
  if (!local || !visitante) continue;

  const localClasificacion = ensureClassification(local._id, local.grupoId);
  const visitanteClasificacion = ensureClassification(visitante._id, visitante.grupoId);

  localClasificacion.pj += 1;
  visitanteClasificacion.pj += 1;
  localClasificacion.gf += match.goles_local;
  localClasificacion.gc += match.goles_visitante;
  visitanteClasificacion.gf += match.goles_visitante;
  visitanteClasificacion.gc += match.goles_local;

  if (match.goles_local > match.goles_visitante) {
    localClasificacion.pg += 1;
    visitanteClasificacion.pp += 1;
    localClasificacion.pts += 3;
  } else if (match.goles_local < match.goles_visitante) {
    visitanteClasificacion.pg += 1;
    localClasificacion.pp += 1;
    visitanteClasificacion.pts += 3;
  } else {
    localClasificacion.pe += 1;
    visitanteClasificacion.pe += 1;
    localClasificacion.pts += 1;
    visitanteClasificacion.pts += 1;
  }
}

const classifications = Array.from(classificationMap.values()).map(stat => ({ ...stat, dg: stat.gf - stat.gc }));
db.getCollection('clasificaciones').insertMany(classifications);

printjson({
  classificationsInserted: classifications.length,
  sample: db.getCollection('clasificaciones').findOne()
});

import { MongoClient } from 'mongodb';

const MONGO_URI = 'mongodb://127.0.0.1:27017';
const DB_NAME = 'mundial2026';

const client = new MongoClient(MONGO_URI);

async function main() {
  await client.connect();
  const db = client.db(DB_NAME);

  await db.collection('partidos').deleteMany({});
  await db.collection('clasificaciones').deleteMany({});

  const selecciones = await db.collection('selecciones').find({}).toArray();
  const seleccionPorNombre = {};
  for (const s of selecciones) {
    seleccionPorNombre[s.nombre] = s._id;
  }

  const estadios = await db.collection('estadios').find({}).toArray();
  const estadioPorNombre = {};
  for (const e of estadios) {
    estadioPorNombre[e.nombre] = e._id;
  }

  const grupos = await db.collection('grupos').find({}).toArray();
  const grupoPorNombre = {};
  for (const g of grupos) {
    grupoPorNombre[g.nombre] = g._id;
  }

  const fasePorNombre = {};
  const fases = await db.collection('fase_final').find({}).toArray();
  for (const f of fases) {
    fasePorNombre[f.nombre] = f._id;
  }

  function partido(fase, local, visitante, gl, gv, fecha, estadio) {
    return {
      fase,
      faseId: fasePorNombre[fase],
      equipo_localId: seleccionPorNombre[local],
      equipo_visitanteId: seleccionPorNombre[visitante],
      goles_local: gl,
      goles_visitante: gv,
      fecha: new Date(fecha),
      estadioId: estadioPorNombre[estadio],
      horario: new Date(fecha).toISOString().slice(11, 16)
    };
  }

  const partidos = [];

  const faseGrupos = [
    partido('Fase de grupos','México','Sudáfrica',2,0,'2026-06-11T20:00:00Z','Estadio Azteca'),
    partido('Fase de grupos','Corea del Sur','República Checa',2,1,'2026-06-12T18:00:00Z','Estadio Akron'),
    partido('Fase de grupos','Canadá','Bosnia y Herzegovina',1,1,'2026-06-12T20:00:00Z','BMO Field'),
    partido('Fase de grupos','Estados Unidos','Paraguay',4,1,'2026-06-12T20:00:00Z','SoFi Stadium'),
    partido('Fase de grupos','Qatar','Suiza',1,1,'2026-06-13T18:00:00Z','Levi\'s Stadium'),
    partido('Fase de grupos','Brasil','Marruecos',1,1,'2026-06-13T20:00:00Z','MetLife Stadium'),
    partido('Fase de grupos','Escocia','Haití',1,0,'2026-06-13T20:00:00Z','Gillette Stadium'),
    partido('Fase de grupos','Australia','Turquía',2,0,'2026-06-13T20:00:00Z','BC Place'),
    partido('Fase de grupos','Alemania','Curazao',7,1,'2026-06-14T18:00:00Z','NRG Stadium'),
    partido('Fase de grupos','Países Bajos','Japón',2,2,'2026-06-14T20:00:00Z','AT&T Stadium'),
    partido('Fase de grupos','Costa de Marfil','Ecuador',1,0,'2026-06-14T20:00:00Z','Lincoln Financial Field'),
    partido('Fase de grupos','Suecia','Túnez',5,1,'2026-06-14T20:00:00Z','Estadio BBVA'),
    partido('Fase de grupos','España','Cabo Verde',0,0,'2026-06-15T18:00:00Z','Mercedes-Benz Stadium'),
    partido('Fase de grupos','Bélgica','Egipto',1,1,'2026-06-15T20:00:00Z','SoFi Stadium'),
    partido('Fase de grupos','Arabia Saudita','Uruguay',1,1,'2026-06-15T20:00:00Z','Hard Rock Stadium'),
    partido('Fase de grupos','Irán','Nueva Zelanda',2,2,'2026-06-15T20:00:00Z','SoFi Stadium'),
    partido('Fase de grupos','Francia','Senegal',3,1,'2026-06-16T18:00:00Z','MetLife Stadium'),
    partido('Fase de grupos','Noruega','Irak',4,1,'2026-06-16T20:00:00Z','Gillette Stadium'),
    partido('Fase de grupos','Argentina','Argelia',3,0,'2026-06-16T20:00:00Z','Arrowhead Stadium'),
    partido('Fase de grupos','Austria','Jordania',3,1,'2026-06-16T20:00:00Z','Levi\'s Stadium'),
    partido('Fase de grupos','Portugal','RD Congo',1,1,'2026-06-17T18:00:00Z','NRG Stadium'),
    partido('Fase de grupos','Inglaterra','Croacia',4,2,'2026-06-17T20:00:00Z','AT&T Stadium'),
    partido('Fase de grupos','Ghana','Panamá',1,0,'2026-06-17T20:00:00Z','BMO Field'),
    partido('Fase de grupos','Uzbekistán','Colombia',1,3,'2026-06-17T20:00:00Z','Estadio Azteca'),
    partido('Fase de grupos','República Checa','Sudáfrica',1,1,'2026-06-18T18:00:00Z','Mercedes-Benz Stadium'),
    partido('Fase de grupos','Suiza','Bosnia y Herzegovina',4,1,'2026-06-18T20:00:00Z','SoFi Stadium'),
    partido('Fase de grupos','Canadá','Qatar',6,0,'2026-06-18T20:00:00Z','BC Place'),
    partido('Fase de grupos','México','Corea del Sur',1,0,'2026-06-18T20:00:00Z','Estadio Akron'),
    partido('Fase de grupos','Estados Unidos','Australia',2,0,'2026-06-19T18:00:00Z','Lumen Field'),
    partido('Fase de grupos','Escocia','Marruecos',0,1,'2026-06-19T20:00:00Z','Gillette Stadium'),
    partido('Fase de grupos','Brasil','Haití',3,0,'2026-06-19T20:00:00Z','Lincoln Financial Field'),
    partido('Fase de grupos','Turquía','Paraguay',0,1,'2026-06-19T20:00:00Z','Levi\'s Stadium'),
    partido('Fase de grupos','Países Bajos','Suecia',5,1,'2026-06-20T18:00:00Z','NRG Stadium'),
    partido('Fase de grupos','Alemania','Costa de Marfil',2,1,'2026-06-20T20:00:00Z','BMO Field'),
    partido('Fase de grupos','Ecuador','Curazao',0,0,'2026-06-20T20:00:00Z','Arrowhead Stadium'),
    partido('Fase de grupos','Túnez','Japón',0,4,'2026-06-20T20:00:00Z','Estadio BBVA'),
    partido('Fase de grupos','España','Arabia Saudita',4,0,'2026-06-21T18:00:00Z','Mercedes-Benz Stadium'),
    partido('Fase de grupos','Bélgica','Irán',0,0,'2026-06-21T20:00:00Z','SoFi Stadium'),
    partido('Fase de grupos','Uruguay','Cabo Verde',2,2,'2026-06-21T20:00:00Z','Hard Rock Stadium'),
    partido('Fase de grupos','Nueva Zelanda','Egipto',1,3,'2026-06-21T20:00:00Z','BC Place'),
    partido('Fase de grupos','Argentina','Austria',2,0,'2026-06-22T18:00:00Z','AT&T Stadium'),
    partido('Fase de grupos','Francia','Irak',3,0,'2026-06-22T20:00:00Z','Lincoln Financial Field'),
    partido('Fase de grupos','Noruega','Senegal',3,2,'2026-06-22T20:00:00Z','MetLife Stadium'),
    partido('Fase de grupos','Jordania','Argelia',1,2,'2026-06-22T20:00:00Z','Levi\'s Stadium'),
    partido('Fase de grupos','Portugal','Uzbekistán',5,0,'2026-06-23T18:00:00Z','NRG Stadium'),
    partido('Fase de grupos','Inglaterra','Ghana',0,0,'2026-06-23T20:00:00Z','Gillette Stadium'),
    partido('Fase de grupos','Panamá','Croacia',0,1,'2026-06-23T20:00:00Z','BMO Field'),
    partido('Fase de grupos','Colombia','RD Congo',1,0,'2026-06-23T20:00:00Z','Estadio Azteca'),
    partido('Fase de grupos','Bosnia y Herzegovina','Qatar',3,1,'2026-06-24T18:00:00Z','Lumen Field'),
    partido('Fase de grupos','Suiza','Canadá',2,1,'2026-06-24T20:00:00Z','BC Place'),
    partido('Fase de grupos','Marruecos','Haití',4,2,'2026-06-24T20:00:00Z','Mercedes-Benz Stadium'),
    partido('Fase de grupos','Brasil','Escocia',3,0,'2026-06-24T20:00:00Z','MetLife Stadium'),
    partido('Fase de grupos','República Checa','México',0,3,'2026-06-25T18:00:00Z','Estadio Azteca'),
    partido('Fase de grupos','Sudáfrica','Corea del Sur',1,0,'2026-06-25T20:00:00Z','Estadio BBVA'),
    partido('Fase de grupos','Estados Unidos','Turquía',2,3,'2026-06-25T20:00:00Z','SoFi Stadium'),
    partido('Fase de grupos','Ecuador','Alemania',2,1,'2026-06-25T20:00:00Z','MetLife Stadium'),
    partido('Fase de grupos','Curazao','Costa de Marfil',0,2,'2026-06-25T20:00:00Z','Lincoln Financial Field'),
    partido('Fase de grupos','Países Bajos','Túnez',3,1,'2026-06-26T18:00:00Z','Arrowhead Stadium'),
    partido('Fase de grupos','Japón','Suecia',1,1,'2026-06-26T20:00:00Z','AT&T Stadium'),
    partido('Fase de grupos','Paraguay','Australia',0,0,'2026-06-26T20:00:00Z','Levi\'s Stadium'),
    partido('Fase de grupos','Noruega','Senegal',1,5,'2026-06-26T20:00:00Z','BMO Field'),
    partido('Fase de grupos','Bélgica','Nueva Zelanda',5,1,'2026-06-27T18:00:00Z','BC Place'),
    partido('Fase de grupos','Egipto','Irán',1,1,'2026-06-27T20:00:00Z','Lumen Field'),
    partido('Fase de grupos','Cabo Verde','Arabia Saudita',0,0,'2026-06-27T20:00:00Z','NRG Stadium'),
    partido('Fase de grupos','Croacia','Ghana',2,1,'2026-06-27T20:00:00Z','Lincoln Financial Field'),
    partido('Fase de grupos','Panamá','Inglaterra',0,2,'2026-06-27T20:00:00Z','MetLife Stadium'),
    partido('Fase de grupos','Colombia','Portugal',0,0,'2026-06-27T20:00:00Z','Hard Rock Stadium'),
    partido('Fase de grupos','RD Congo','Uzbekistán',3,1,'2026-06-28T18:00:00Z','Mercedes-Benz Stadium'),
    partido('Fase de grupos','Argelia','Jordania',3,1,'2026-06-28T20:00:00Z','Arrowhead Stadium'),
    partido('Fase de grupos','Sudáfrica',null,null,null,null,'2026-06-28T20:00:00Z','SoFi Stadium')
  ].filter(p => p.goles_local !== null);

  const dieciseisavos = [
    partido('Dieciseisavos de final','Sudáfrica','Canadá',0,1,'2026-06-28T18:00:00Z','MetLife Stadium'),
    partido('Dieciseisavos de final','Alemania','Paraguay',1,1,'2026-06-29T18:00:00Z','AT&T Stadium'),
    partido('Dieciseisavos de final','Países Bajos','Marruecos',1,1,'2026-06-29T20:00:00Z','Hard Rock Stadium'),
    partido('Dieciseisavos de final','Brasil','Japón',2,1,'2026-06-29T20:00:00Z','MetLife Stadium'),
    partido('Dieciseisavos de final','Francia','Suecia',3,0,'2026-06-30T18:00:00Z','Estadio Azteca'),
    partido('Dieciseisavos de final','Costa de Marfil','Noruega',1,2,'2026-06-30T20:00:00Z','Estadio BBVA'),
    partido('Dieciseisavos de final','México','Ecuador',2,0,'2026-07-01T18:00:00Z','Mercedes-Benz Stadium'),
    partido('Dieciseisavos de final','Inglaterra','RD Congo',2,1,'2026-07-01T20:00:00Z','AT&T Stadium'),
    partido('Dieciseisavos de final','Estados Unidos','Bosnia y Herzegovina',2,0,'2026-07-02T18:00:00Z','Lumen Field'),
    partido('Dieciseisavos de final','Bélgica','Senegal',3,2,'2026-07-02T20:00:00Z','Lincoln Financial Field'),
    partido('Dieciseisavos de final','Portugal','Croacia',2,1,'2026-07-03T18:00:00Z','NRG Stadium'),
    partido('Dieciseisavos de final','España','Austria',3,0,'2026-07-03T20:00:00Z','AT&T Stadium'),
    partido('Dieciseisavos de final','Suiza','Argelia',2,0,'2026-07-04T18:00:00Z','Arrowhead Stadium'),
    partido('Dieciseisavos de final','Argentina','Cabo Verde',3,2,'2026-07-04T20:00:00Z','Mercedes-Benz Stadium'),
    partido('Dieciseisavos de final','Colombia','Ghana',1,0,'2026-07-05T18:00:00Z','Hard Rock Stadium'),
    partido('Dieciseisavos de final','Australia','Egipto',1,1,'2026-07-05T20:00:00Z','BC Place')
  ];

  const octavos = [
    partido('Octavos de final','Paraguay','Francia',0,1,'2026-07-04T18:00:00Z','Lincoln Financial Field'),
    partido('Octavos de final','Canadá','Marruecos',0,3,'2026-07-04T22:00:00Z','NRG Stadium'),
    partido('Octavos de final','Brasil','Noruega',1,2,'2026-07-05T18:00:00Z','MetLife Stadium'),
    partido('Octavos de final','México','Inglaterra',2,3,'2026-07-05T22:00:00Z','Estadio Azteca'),
    partido('Octavos de final','Portugal','España',0,1,'2026-07-06T18:00:00Z','AT&T Stadium'),
    partido('Octavos de final','Estados Unidos','Bélgica',1,4,'2026-07-06T22:00:00Z','Lumen Field'),
    partido('Octavos de final','Argentina','Egipto',3,2,'2026-07-07T10:00:00Z','Mercedes-Benz Stadium'),
    partido('Octavos de final','Suiza','Colombia',0,0,'2026-07-07T14:00:00Z','BC Place')
  ];

  const cuartos = [
    partido('Cuartos de final','Francia','Marruecos',2,0,'2026-07-09T14:00:00Z','Gillette Stadium'),
    partido('Cuartos de final','España','Bélgica',2,1,'2026-07-10T13:00:00Z','SoFi Stadium'),
    partido('Cuartos de final','Noruega','Inglaterra',1,2,'2026-07-11T15:00:00Z','Hard Rock Stadium'),
    partido('Cuartos de final','Argentina','Suiza',3,1,'2026-07-11T19:00:00Z','Arrowhead Stadium')
  ];

  const semifinales = [
    partido('Semifinal','Francia','España',0,2,'2026-07-14T19:00:00Z','AT&T Stadium'),
    partido('Semifinal','Inglaterra','Argentina',null,null,'2026-07-15T19:00:00Z','Mercedes-Benz Stadium')
  ];

  const tercerPuesto = [
    partido('Tercer puesto','Francia',null,null,null,null,'2026-07-18T17:00:00Z','Hard Rock Stadium')
  ];

  const final = [
    partido('Final','España',null,null,null,null,'2026-07-19T15:00:00Z','MetLife Stadium')
  ];

  const todos = [...faseGrupos, ...dieciseisavos, ...octavos, ...cuartos, ...semifinales, ...tercerPuesto, ...final];
  await db.collection('partidos').insertMany(todos);

  const statsByTeam = new Map();

  function ensureTeam(id) {
    const key = id.toString();
    if (!statsByTeam.has(key)) {
      statsByTeam.set(key, { _id: id, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dg: 0, pts: 0 });
    }
    return statsByTeam.get(key);
  }

  for (const match of todos) {
    if (match.goles_local === null || match.goles_visitante === null) continue;
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

  const seleccionIds = Array.from(statsByTeam.keys()).map((id) => new (await import('mongodb')).ObjectId(id));
  const seleccionesMap = await db.collection('selecciones').find({ _id: { $in: seleccionIds } }).project({ grupoId: 1 }).toArray();
  const grupoMap = new Map(seleccionesMap.map((sel) => [sel._id.toString(), sel.grupoId]));

  await db.collection('clasificaciones').deleteMany({});

  const docs = [];
  for (const [key, stats] of statsByTeam.entries()) {
    const grupoId = grupoMap.get(key);
    docs.push({
      grupoId: grupoId ? new (await import('mongodb')).ObjectId(grupoId) : null,
      seleccionId: new (await import('mongodb')).ObjectId(key),
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

  await db.collection('fase_final').deleteMany({ nombre: { $ne: 'Fase de grupos' } });

  await db.collection('fase_final').insertMany([
    { nombre: 'Dieciseisavos de final', clasificados: ['1A','2A','1B','2B','1C','2C','1D','2D','1E','2E','1F','2F','1G','2G','1H','2H','1I','2I','1J','2J','1K','2K','1L','2L'], partidos: 16, sede: 'MetLife Stadium', fecha: new Date('2026-07-03T18:00:00Z') },
    { nombre: 'Octavos de final', clasificados: ['Ganadores 1-16'], partidos: 8, sede: 'Estadio Azteca', fecha: new Date('2026-07-10T18:00:00Z') },
    { nombre: 'Cuartos de final', clasificados: ['Ganadores 8'], partidos: 4, sede: 'BC Place', fecha: new Date('2026-07-14T18:00:00Z') },
    { nombre: 'Semifinal', clasificados: ['Ganadores 4'], partidos: 2, sede: 'AT&T Stadium', fecha: new Date('2026-07-18T18:00:00Z') },
    { nombre: 'Tercer puesto', clasificados: ['Perdedores semifinales'], partidos: 1, sede: 'Hard Rock Stadium', fecha: new Date('2026-07-18T17:00:00Z') },
    { nombre: 'Final', clasificados: ['Ganadores semifinales'], partidos: 1, sede: 'MetLife Stadium', fecha: new Date('2026-07-19T15:00:00Z') }
  ]);

  console.log('Base de datos actualizada al 15 de julio de 2026.');
  console.log('- Fase de grupos:', faseGrupos.length, 'partidos insertados');
  console.log('- Dieciseisavos:', dieciseisavos.length, 'partidos insertados');
  console.log('- Octavos:', octavos.length, 'partidos insertados');
  console.log('- Cuartos:', cuartos.length, 'partidos insertados');
  console.log('- Semifinales:', semifinales.length, 'partidos insertados');
  console.log('- Clasificaciones recalculadas:', docs.length, 'equipos');
}

main().catch((err) => {
  console.error('Error actualizando la base de datos:', err);
  process.exit(1);
}).finally(async () => {
  await client.close();
});

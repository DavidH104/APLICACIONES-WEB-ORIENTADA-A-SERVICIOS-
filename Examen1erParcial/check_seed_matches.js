const fs = require('fs');
const { MongoClient } = require('mongodb');
const text = fs.readFileSync('./mongo/seed.js','utf8');
function extractArray(name) {
  const prefix = `const ${name} = [`;
  let start = text.indexOf(prefix);
  if (start === -1) throw new Error(`Array ${name} not found`);
  let depth = 0;
  let inString = false;
  let escape = false;
  let quoteChar = '';
  let end = -1;
  for (let i = start + prefix.length; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escape) { escape = false; continue; }
      if (ch === '\\') { escape = true; continue; }
      if (ch === quoteChar) { inString = false; }
      continue;
    }
    if (ch === '"' || ch === "'") { inString = true; quoteChar = ch; continue; }
    if (ch === '[') depth++;
    if (ch === ']') {
      if (depth === 0) { end = i; break; }
      depth--;
    }
  }
  if (end === -1) throw new Error(`Could not find end for ${name}`);
  const arrayText = text.slice(start + prefix.length - 1, end + 1);
  return eval(arrayText);
}
(async () => {
  const selections = extractArray('selections');
  const stadiums = extractArray('stadiums');
  const groupStageMatches = extractArray('groupStageMatches');
  const knockoutMatches = extractArray('knockoutMatches');
  const phaseDefinitions = extractArray('phaseDefinitions');
  const selectionIds = new Map(selections.map((s, i) => [s.nombre, s.nombre]));
  const stadiumIds = new Map(stadiums.map((s, i) => [s.nombre, s.nombre]));
  const phaseIds = new Map(phaseDefinitions.map((p, i) => [p.nombre, p.nombre]));
  const allMatches = [...groupStageMatches.map(m => ({...m, fase:'Fase de grupos'})), ...knockoutMatches];
  const matchDocs = allMatches.map(match => ({
    fase: match.fase,
    faseId: phaseIds.get(match.fase),
    equipo_localId: selectionIds.get(match.local),
    equipo_visitanteId: selectionIds.get(match.visitante),
    goles_local: match.goles_local,
    goles_visitante: match.goles_visitante,
    fecha: new Date(match.fecha),
    estadioId: stadiumIds.get(match.estadio),
    horario: match.fecha.slice(11,16),
    ...(match.penales_local !== undefined ? { penales_local: match.penales_local } : {}),
    ...(match.penales_visitante !== undefined ? { penales_visitante: match.penales_visitante } : {})
  }));
  console.log('Prepared docs', matchDocs.length);
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('mundial2026');
  const coll = db.collection('partidos');
  await coll.deleteMany({});
  for (let i = 0; i < matchDocs.length; i++) {
    try {
      await coll.insertOne(matchDocs[i]);
    } catch (e) {
      console.error('failed at index', i);
      console.error('doc', matchDocs[i]);
      console.error('error', e);
      break;
    }
  }
  await client.close();
})();

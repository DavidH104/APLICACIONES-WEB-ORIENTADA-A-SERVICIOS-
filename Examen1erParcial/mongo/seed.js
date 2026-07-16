import { MongoClient } from 'mongodb';
import crypto from 'crypto';

const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'mundial2026';

const continents = [
  { continente: 'América', confederacion: 'CONMEBOL', paises_incluidos: ['Brasil', 'Argentina', 'Colombia', 'Ecuador', 'Perú', 'Uruguay'] },
  { continente: 'Norteamérica', confederacion: 'CONCACAF', paises_incluidos: ['México', 'Estados Unidos', 'Canadá', 'Panamá', 'Costa Rica', 'Jamaica', 'Honduras', 'El Salvador'] },
  { continente: 'Europa', confederacion: 'UEFA', paises_incluidos: ['Inglaterra', 'Alemania', 'Francia', 'España', 'Portugal', 'Países Bajos', 'Bélgica', 'Croacia', 'Suiza', 'Escocia', 'Serbia', 'Austria', 'Dinamarca', 'Polonia', 'Gales'] },
  { continente: 'África', confederacion: 'CAF', paises_incluidos: ['Sudáfrica', 'Marruecos', 'Egipto', 'Ghana', 'Senegal', 'Argelia', 'Túnez', 'Costa de Marfil', 'RD Congo'] },
  { continente: 'Asia', confederacion: 'AFC', paises_incluidos: ['Corea del Sur', 'Japón', 'Uzbekistán', 'Arabia Saudita', 'Australia', 'Catar', 'Emiratos Árabes Unidos', 'Irán'] },
  { continente: 'Oceanía', confederacion: 'OFC', paises_incluidos: ['Nueva Zelanda'] }
];

const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

const stadiums = [
  { nombre: 'Estadio Azteca', ciudad: 'Ciudad de México', pais: 'México', latitud: 19.302861, longitud: -99.150527, capacidad: 87000 },
  { nombre: 'MetLife Stadium', ciudad: 'East Rutherford', pais: 'Estados Unidos', latitud: 40.81284, longitud: -74.074208, capacidad: 82500 },
  { nombre: 'BC Place', ciudad: 'Vancouver', pais: 'Canadá', latitud: 49.2777, longitud: -123.1087, capacidad: 54000 },
  { nombre: 'Estadio BBVA', ciudad: 'Monterrey', pais: 'México', latitud: 25.682, longitud: -100.309, capacidad: 51000 },
  { nombre: 'SoFi Stadium', ciudad: 'Inglewood', pais: 'Estados Unidos', latitud: 33.953, longitud: -118.339, capacidad: 70000 },
  { nombre: 'AT&T Stadium', ciudad: 'Arlington', pais: 'Estados Unidos', latitud: 32.7473, longitud: -97.0945, capacidad: 80000 }
];

const selections = [
  { nombre: 'México', continente: 'Norteamérica', grupo: 'A', historia: 'Gran tradición mundialista', ventajas: 'Afición numerosa', desventajas: 'Presión local', ranking: 15, bandera_url: 'https://example.com/mexico.png', geolocalizacion: { latitud: 19.432608, longitud: -99.133209 } },
  { nombre: 'Sudáfrica', continente: 'África', grupo: 'A', historia: 'Equipo sólido en defensa', ventajas: 'Físico', desventajas: 'Poca profundidad', ranking: 60, bandera_url: 'https://example.com/southafrica.png', geolocalizacion: { latitud: -26.204103, longitud: 28.047305 } },
  { nombre: 'Corea del Sur', continente: 'Asia', grupo: 'A', historia: 'Tradición táctica', ventajas: 'Disciplina', desventajas: 'Menor creatividad', ranking: 28, bandera_url: 'https://example.com/korea.png', geolocalizacion: { latitud: 37.5665, longitud: 126.978 } },
  { nombre: 'República Checa', continente: 'Europa', grupo: 'A', historia: 'Equipo histórico', ventajas: 'Técnica', desventajas: 'Inconsistencia', ranking: 40, bandera_url: 'https://example.com/czech.png', geolocalizacion: { latitud: 50.0755, longitud: 14.4378 } },
  { nombre: 'Suiza', continente: 'Europa', grupo: 'B', historia: 'Fútbol ordenado', ventajas: 'Defensa compacta', desventajas: 'Creatividad limitada', ranking: 13, bandera_url: 'https://example.com/switzerland.png', geolocalizacion: { latitud: 46.8182, longitud: 8.2275 } },
  { nombre: 'Canadá', continente: 'Norteamérica', grupo: 'B', historia: 'Crecimiento constante', ventajas: 'Organización', desventajas: 'Menor experiencia', ranking: 50, bandera_url: 'https://example.com/canada.png', geolocalizacion: { latitud: 45.42153, longitud: -75.697193 } },
  { nombre: 'Bosnia y Herzegovina', continente: 'Europa', grupo: 'B', historia: 'Talento individual', ventajas: 'Físico', desventajas: 'Consistencia', ranking: 38, bandera_url: 'https://example.com/bosnia.png', geolocalizacion: { latitud: 43.8563, longitud: 18.4131 } },
  { nombre: 'Qatar', continente: 'Asia', grupo: 'B', historia: 'Anfitrión reciente', ventajas: 'Infraestructura', desventajas: 'Poca tradición', ranking: 59, bandera_url: 'https://example.com/qatar.png', geolocalizacion: { latitud: 25.354826, longitud: 51.183884 } },
  { nombre: 'Brasil', continente: 'América', grupo: 'C', historia: 'Cinco veces campeón', ventajas: 'Talento individual', desventajas: 'Presión histórica', ranking: 1, bandera_url: 'https://example.com/brazil.png', geolocalizacion: { latitud: -15.793889, longitud: -47.882778 } },
  { nombre: 'Marruecos', continente: 'África', grupo: 'C', historia: 'Defensa sólida', ventajas: 'Solidaridad', desventajas: 'Falta de profundidad', ranking: 22, bandera_url: 'https://example.com/morocco.png', geolocalizacion: { latitud: 31.63, longitud: -8.008889 } },
  { nombre: 'Escocia', continente: 'Europa', grupo: 'C', historia: 'Selección histórica', ventajas: 'Pasión', desventajas: 'Menos talento ofensivo', ranking: 21, bandera_url: 'https://example.com/scotland.png', geolocalizacion: { latitud: 56.4907, longitud: -4.2026 } },
  { nombre: 'Haití', continente: 'Norteamérica', grupo: 'C', historia: 'Equipo combativo', ventajas: 'Rapidez', desventajas: 'Poca experiencia', ranking: 77, bandera_url: 'https://example.com/haiti.png', geolocalizacion: { latitud: 18.5944, longitud: -72.3074 } },
  { nombre: 'Costa Rica', continente: 'Norteamérica', grupo: 'D', historia: 'Equipo sólido', ventajas: 'Resistencia', desventajas: 'Menos recursos', ranking: 30, bandera_url: 'https://example.com/costarica.png', geolocalizacion: { latitud: 9.748917, longitud: -83.753428 } },
  { nombre: 'España', continente: 'Europa', grupo: 'D', historia: 'Juego de posesión', ventajas: 'Control de balón', desventajas: 'Presión alta', ranking: 7, bandera_url: 'https://example.com/spain.png', geolocalizacion: { latitud: 40.416775, longitud: -3.70379 } },
  { nombre: 'Catar', continente: 'Asia', grupo: 'D', historia: 'Organizador 2022', ventajas: 'Infraestructura', desventajas: 'Poca tradición', ranking: 40, bandera_url: 'https://example.com/qatar.png', geolocalizacion: { latitud: 25.354826, longitud: 51.183884 } },
  { nombre: 'Colombia', continente: 'América', grupo: 'K', historia: 'Juego técnico', ventajas: 'Creatividad', desventajas: 'Inconstancia', ranking: 16, bandera_url: 'https://example.com/colombia.png', geolocalizacion: { latitud: 4.711, longitud: -74.0721 } },
  { nombre: 'Portugal', continente: 'Europa', grupo: 'K', historia: 'Calidad ofensiva', ventajas: 'Jugadores top', desventajas: 'Presión de resultados', ranking: 8, bandera_url: 'https://example.com/portugal.png', geolocalizacion: { latitud: 38.7223, longitud: -9.1393 } },
  { nombre: 'RD Congo', continente: 'África', grupo: 'K', historia: 'Equipo en ascenso', ventajas: 'Velocidad', desventajas: 'Defensa poco consistente', ranking: 45, bandera_url: 'https://example.com/drcongo.png', geolocalizacion: { latitud: -4.0383, longitud: 21.7587 } },
  { nombre: 'Uzbekistán', continente: 'Asia', grupo: 'K', historia: 'Crecimiento continental', ventajas: 'Estructura', desventajas: 'Menor experiencia', ranking: 85, bandera_url: 'https://example.com/uzbekistan.png', geolocalizacion: { latitud: 41.2995, longitud: 69.2401 } },
  { nombre: 'Inglaterra', continente: 'Europa', grupo: 'L', historia: 'Tradición histórica', ventajas: 'Jugadores de élite', desventajas: 'Expectativa', ranking: 5, bandera_url: 'https://example.com/england.png', geolocalizacion: { latitud: 51.507351, longitud: -0.127758 } },
  { nombre: 'Croacia', continente: 'Europa', grupo: 'L', historia: 'Finalista reciente', ventajas: 'Técnica colectiva', desventajas: 'Plantilla corta', ranking: 14, bandera_url: 'https://example.com/croatia.png', geolocalizacion: { latitud: 45.815, longitud: 15.9819 } },
  { nombre: 'Ghana', continente: 'África', grupo: 'L', historia: 'Fuerza física', ventajas: 'Atletismo', desventajas: 'Menos técnica', ranking: 60, bandera_url: 'https://example.com/ghana.png', geolocalizacion: { latitud: 5.603716, longitud: -0.186964 } },
  { nombre: 'Panamá', continente: 'Norteamérica', grupo: 'L', historia: 'Ascenso reciente', ventajas: 'Físico', desventajas: 'Menor consistencia', ranking: 55, bandera_url: 'https://example.com/panama.png', geolocalizacion: { latitud: 8.9824, longitud: -79.5199 } },
  { nombre: 'Alemania', continente: 'Europa', grupo: 'E', historia: 'Fuerza táctica', ventajas: 'Organización', desventajas: 'Reestructuración', ranking: 6, bandera_url: 'https://example.com/germany.png', geolocalizacion: { latitud: 52.520008, longitud: 13.404954 } },
  { nombre: 'Japón', continente: 'Asia', grupo: 'F', historia: 'Máquina organizada', ventajas: 'Disciplina', desventajas: 'Menor físico', ranking: 23, bandera_url: 'https://example.com/japan.png', geolocalizacion: { latitud: 35.6762, longitud: 139.6503 } },
  { nombre: 'Paraguay', continente: 'América', grupo: 'G', historia: 'Equipo combativo', ventajas: 'Defensa', desventajas: 'Poca profundidad', ranking: 48, bandera_url: 'https://example.com/paraguay.png', geolocalizacion: { latitud: -25.26374, longitud: -57.57593 } },
  { nombre: 'Países Bajos', continente: 'Europa', grupo: 'H', historia: 'Fútbol total', ventajas: 'Ofensiva', desventajas: 'Inconstancia', ranking: 9, bandera_url: 'https://example.com/netherlands.png', geolocalizacion: { latitud: 52.1326, longitud: 5.2913 } },
  { nombre: 'Costa de Marfil', continente: 'África', grupo: 'I', historia: 'Equipo dinámico', ventajas: 'Velocidad', desventajas: 'Defensa', ranking: 41, bandera_url: 'https://example.com/cotedivoire.png', geolocalizacion: { latitud: 7.539989, longitud: -5.54708 } },
  { nombre: 'Noruega', continente: 'Europa', grupo: 'I', historia: 'Equipo joven', ventajas: 'Velocidad', desventajas: 'Defensa', ranking: 31, bandera_url: 'https://example.com/norway.png', geolocalizacion: { latitud: 60.472, longitud: 8.4689 } },
  { nombre: 'Francia', continente: 'Europa', grupo: 'J', historia: 'Campeón vigente', ventajas: 'Calidad individual', desventajas: 'Defensa', ranking: 4, bandera_url: 'https://example.com/france.png', geolocalizacion: { latitud: 48.8566, longitud: 2.3522 } },
  { nombre: 'Suecia', continente: 'Europa', grupo: 'J', historia: 'Fútbol elegante', ventajas: 'Técnica', desventajas: 'Poca profundidad', ranking: 26, bandera_url: 'https://example.com/sweden.png', geolocalizacion: { latitud: 59.3293, longitud: 18.0686 } },
  { nombre: 'Ecuador', continente: 'América', grupo: 'J', historia: 'Juego agresivo', ventajas: 'Altura', desventajas: 'Defensa abierta', ranking: 18, bandera_url: 'https://example.com/ecuador.png', geolocalizacion: { latitud: -0.1807, longitud: -78.4678 } }
];

const groupResults = [
  { group: 'A', selection: 'México', pj: 3, pg: 3, pe: 0, pp: 0, gf: 6, gc: 0, dg: 6, pts: 9 },
  { group: 'A', selection: 'Sudáfrica', pj: 3, pg: 1, pe: 1, pp: 1, gf: 4, gc: 5, dg: -1, pts: 4 },
  { group: 'A', selection: 'Corea del Sur', pj: 3, pg: 1, pe: 0, pp: 2, gf: 3, gc: 5, dg: -2, pts: 3 },
  { group: 'A', selection: 'República Checa', pj: 3, pg: 0, pe: 1, pp: 2, gf: 2, gc: 5, dg: -3, pts: 1 },
  { group: 'B', selection: 'Suiza', pj: 2, pg: 1, pe: 0, pp: 1, gf: 2, gc: 3, dg: -1, pts: 3 },
  { group: 'B', selection: 'Canadá', pj: 2, pg: 0, pe: 1, pp: 1, gf: 2, gc: 3, dg: -1, pts: 1 },
  { group: 'B', selection: 'Bosnia y Herzegovina', pj: 2, pg: 0, pe: 1, pp: 1, gf: 1, gc: 2, dg: -1, pts: 1 },
  { group: 'B', selection: 'Qatar', pj: 2, pg: 0, pe: 0, pp: 2, gf: 1, gc: 2, dg: -1, pts: 0 },
  { group: 'C', selection: 'Brasil', pj: 2, pg: 1, pe: 1, pp: 0, gf: 2, gc: 1, dg: 1, pts: 4 },
  { group: 'C', selection: 'Marruecos', pj: 2, pg: 0, pe: 2, pp: 0, gf: 2, gc: 2, dg: 0, pts: 2 },
  { group: 'C', selection: 'Escocia', pj: 2, pg: 1, pe: 0, pp: 1, gf: 1, gc: 1, dg: 0, pts: 3 },
  { group: 'C', selection: 'Haití', pj: 2, pg: 0, pe: 0, pp: 2, gf: 0, gc: 2, dg: -2, pts: 0 },
  { group: 'D', selection: 'Costa Rica', pj: 3, pg: 1, pe: 1, pp: 1, gf: 3, gc: 3, dg: 0, pts: 4 },
  { group: 'D', selection: 'España', pj: 3, pg: 2, pe: 1, pp: 0, gf: 4, gc: 1, dg: 3, pts: 7 },
  { group: 'D', selection: 'Catar', pj: 3, pg: 0, pe: 0, pp: 3, gf: 1, gc: 4, dg: -3, pts: 0 },
  { group: 'K', selection: 'Colombia', pj: 1, pg: 1, pe: 0, pp: 0, gf: 1, gc: 0, dg: 1, pts: 3 },
  { group: 'K', selection: 'Portugal', pj: 1, pg: 1, pe: 0, pp: 0, gf: 3, gc: 1, dg: 2, pts: 3 },
  { group: 'K', selection: 'RD Congo', pj: 1, pg: 1, pe: 0, pp: 0, gf: 3, gc: 1, dg: 2, pts: 3 },
  { group: 'K', selection: 'Uzbekistán', pj: 1, pg: 0, pe: 0, pp: 1, gf: 1, gc: 3, dg: -2, pts: 0 },
  { group: 'L', selection: 'Inglaterra', pj: 2, pg: 2, pe: 0, pp: 0, gf: 4, gc: 0, dg: 4, pts: 6 },
  { group: 'L', selection: 'Croacia', pj: 1, pg: 1, pe: 0, pp: 0, gf: 2, gc: 0, dg: 2, pts: 3 },
  { group: 'L', selection: 'Ghana', pj: 1, pg: 0, pe: 0, pp: 1, gf: 0, gc: 2, dg: -2, pts: 0 },
  { group: 'L', selection: 'Panamá', pj: 1, pg: 0, pe: 0, pp: 1, gf: 0, gc: 2, dg: -2, pts: 0 }
];

const matches = [
  { fase: 'Grupos', local: 'México', visitante: 'Sudáfrica', goles_local: 2, goles_visitante: 0, fecha: '2026-06-11T20:00:00Z', estadio: 'Estadio Azteca' },
  { fase: 'Grupos', local: 'Corea del Sur', visitante: 'República Checa', goles_local: 2, goles_visitante: 1, fecha: '2026-06-12T18:00:00Z', estadio: 'Estadio Azteca' },
  { fase: 'Grupos', local: 'Suiza', visitante: 'Canadá', goles_local: 2, goles_visitante: 1, fecha: '2026-06-12T20:00:00Z', estadio: 'BC Place' },
  { fase: 'Grupos', local: 'Canadá', visitante: 'Bosnia y Herzegovina', goles_local: 1, goles_visitante: 1, fecha: '2026-06-17T20:00:00Z', estadio: 'BC Place' },
  { fase: 'Grupos', local: 'Brasil', visitante: 'Marruecos', goles_local: 1, goles_visitante: 1, fecha: '2026-06-13T20:00:00Z', estadio: 'MetLife Stadium' },
  { fase: 'Grupos', local: 'Haití', visitante: 'Escocia', goles_local: 0, goles_visitante: 1, fecha: '2026-06-14T20:00:00Z', estadio: 'MetLife Stadium' },
  { fase: 'Grupos', local: 'RD Congo', visitante: 'Uzbekistán', goles_local: 3, goles_visitante: 1, fecha: '2026-06-21T18:00:00Z', estadio: 'Estadio BBVA' },
  { fase: 'Grupos', local: 'Inglaterra', visitante: 'Panamá', goles_local: 2, goles_visitante: 0, fecha: '2026-06-21T20:00:00Z', estadio: 'Estadio BBVA' },
  { fase: 'Dieciseisavos', local: 'Sudáfrica', visitante: 'Canadá', goles_local: 0, goles_visitante: 1, fecha: '2026-07-03T18:00:00Z', estadio: 'MetLife Stadium' },
  { fase: 'Dieciseisavos', local: 'Brasil', visitante: 'Japón', goles_local: 2, goles_visitante: 1, fecha: '2026-07-03T22:00:00Z', estadio: 'SoFi Stadium' },
  { fase: 'Dieciseisavos', local: 'Alemania', visitante: 'Paraguay', goles_local: 1, goles_visitante: 1, fecha: '2026-07-04T18:00:00Z', estadio: 'BC Place' },
  { fase: 'Dieciseisavos', local: 'Países Bajos', visitante: 'Marruecos', goles_local: 1, goles_visitante: 1, fecha: '2026-07-04T22:00:00Z', estadio: 'AT&T Stadium' },
  { fase: 'Dieciseisavos', local: 'Costa de Marfil', visitante: 'Noruega', goles_local: 1, goles_visitante: 2, fecha: '2026-07-05T18:00:00Z', estadio: 'MetLife Stadium' },
  { fase: 'Dieciseisavos', local: 'Francia', visitante: 'Suecia', goles_local: 3, goles_visitante: 0, fecha: '2026-07-05T22:00:00Z', estadio: 'Estadio Azteca' },
  { fase: 'Dieciseisavos', local: 'México', visitante: 'Ecuador', goles_local: 2, goles_visitante: 0, fecha: '2026-07-06T18:00:00Z', estadio: 'Estadio Azteca' },
  { fase: 'Dieciseisavos', local: 'Inglaterra', visitante: 'RD Congo', goles_local: 2, goles_visitante: 1, fecha: '2026-07-06T22:00:00Z', estadio: 'AT&T Stadium' }
];

async function main() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);

    const continentIds = {};
    for (const continent of continents) {
      const { insertedId } = await db.collection('continentes').insertOne(continent);
      continentIds[continent.continente] = insertedId;
    }

    const groupIds = {};
    for (const group of groups) {
      const { insertedId } = await db.collection('grupos').insertOne({ nombre: group });
      groupIds[group] = insertedId;
    }

    const stadiumIds = {};
    for (const stadium of stadiums) {
      const { insertedId } = await db.collection('estadios').insertOne(stadium);
      stadiumIds[stadium.nombre] = insertedId;
    }

    const userIds = [];
    for (const user of [{ nombre: 'Juan Pérez' }, { nombre: 'María Gómez' }]) {
      const { insertedId } = await db.collection('usuarios').insertOne(user);
      userIds.push(insertedId);
    }

    const selectionIds = {};
    for (const selection of selections) {
      const { insertedId } = await db.collection('selecciones').insertOne({
        nombre: selection.nombre,
        continente_id: continentIds[selection.continente],
        grupo_id: groupIds[selection.grupo],
        historia: selection.historia,
        ventajas: selection.ventajas,
        desventajas: selection.desventajas,
        ranking: selection.ranking,
        bandera_url: selection.bandera_url,
        geolocalizacion: selection.geolocalizacion
      });
      selectionIds[selection.nombre] = insertedId;
    }

    const partidos = [];
    for (const match of matches) {
      partidos.push({
        fase: match.fase,
        equipo_local_id: selectionIds[match.local],
        equipo_visitante_id: selectionIds[match.visitante],
        goles_local: match.goles_local,
        goles_visitante: match.goles_visitante,
        fecha: new Date(match.fecha),
        estadio_id: stadiumIds[match.estadio]
      });
    }

    const partidoInsert = await db.collection('partidos').insertMany(partidos);
    const partidoIds = Object.values(partidoInsert.insertedIds);

    const classificationDocs = groupResults.map((item) => ({
      grupo_id: groupIds[item.group],
      seleccion_id: selectionIds[item.selection],
      pj: item.pj,
      pg: item.pg,
      pe: item.pe,
      pp: item.pp,
      gf: item.gf,
      gc: item.gc,
      dg: item.dg,
      pts: item.pts
    }));

    await db.collection('clasificaciones').insertMany(classificationDocs);

    await db.collection('fase_final').insertOne({
      nombre_fase: 'Dieciseisavos',
      clasificados: ['México', 'Canadá', 'Brasil', 'Japón', 'Alemania', 'Paraguay', 'Países Bajos', 'Marruecos', 'Costa de Marfil', 'Noruega', 'Francia', 'Suecia', 'México', 'Ecuador', 'Inglaterra', 'RD Congo'],
      partidos_ids: partidoIds.slice(8),
      sede_id: stadiumIds['MetLife Stadium'],
      fecha: new Date('2026-07-03T18:00:00Z')
    });

    await db.collection('boletos').insertMany([
      { usuario_id: userIds[0], estadio_id: stadiumIds['Estadio Azteca'], dia: 'Sábado', fecha: new Date('2026-06-11'), horario: '20:00', seleccion_id: selectionIds['México'], costo: 1200 },
      { usuario_id: userIds[1], estadio_id: stadiumIds['BC Place'], dia: 'Domingo', fecha: new Date('2026-06-12'), horario: '20:00', seleccion_id: selectionIds['Canadá'], costo: 950 }
    ]);

    const adminSalt = crypto.randomBytes(16).toString('hex');
    const adminPasswordHash = crypto.scryptSync('admin123', adminSalt, 64, { N: 16384 }).toString('hex');
    await db.collection('usuarios').updateOne(
      { usuario: 'admin@mundial.local' },
      { $set: { usuario: 'admin@mundial.local', passwordHash: adminPasswordHash, salt: adminSalt, role: 'admin', createdAt: new Date() } },
      { upsert: true }
    );
    console.log('Usuario administrador asegurado: admin@mundial.local / admin123');

    console.log('Datos reales sembrados correctamente.');
  } catch (error) {
    console.error('Error al sembrar datos:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();

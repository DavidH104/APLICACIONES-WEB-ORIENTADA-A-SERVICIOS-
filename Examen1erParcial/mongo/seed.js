import { MongoClient } from 'mongodb';

const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'mundial2026';

const continents = [
  {
    nombre: 'Europa',
    confederacion: 'UEFA',
    paises: [
      'Inglaterra',
      'Alemania',
      'Francia',
      'España',
      'Portugal',
      'Países Bajos',
      'Bélgica',
      'Croacia',
      'Italia',
      'Suiza',
      'Dinamarca',
      'Serbia',
      'Polonia',
      'Escocia',
      'Gales',
      'Austria'
    ]
  },
  {
    nombre: 'América',
    confederacion: 'CONMEBOL',
    paises: ['Brasil', 'Argentina', 'Uruguay', 'Colombia', 'Ecuador', 'Perú']
  },
  {
    nombre: 'Norteamérica',
    confederacion: 'CONCACAF',
    paises: ['México', 'Estados Unidos', 'Canadá', 'Costa Rica', 'Panamá', 'Honduras', 'Jamaica', 'El Salvador']
  },
  {
    nombre: 'África',
    confederacion: 'CAF',
    paises: ['Senegal', 'Marruecos', 'Egipto', 'Ghana', 'Nigeria', 'Camerún', 'Argelia', 'Túnez', 'Costa de Marfil']
  },
  {
    nombre: 'Asia',
    confederacion: 'AFC',
    paises: ['Japón', 'Corea del Sur', 'Irán', 'Arabia Saudita', 'Australia', 'Catar', 'Emiratos Árabes Unidos', 'Uzbekistán']
  },
  {
    nombre: 'Oceanía',
    confederacion: 'OFC',
    paises: ['Nueva Zelanda']
  }
];

const groups = [
  { nombre: 'A', fase: 'Fase de grupos' },
  { nombre: 'B', fase: 'Fase de grupos' },
  { nombre: 'C', fase: 'Fase de grupos' },
  { nombre: 'D', fase: 'Fase de grupos' },
  { nombre: 'E', fase: 'Fase de grupos' },
  { nombre: 'F', fase: 'Fase de grupos' },
  { nombre: 'G', fase: 'Fase de grupos' },
  { nombre: 'H', fase: 'Fase de grupos' },
  { nombre: 'I', fase: 'Fase de grupos' },
  { nombre: 'J', fase: 'Fase de grupos' },
  { nombre: 'K', fase: 'Fase de grupos' },
  { nombre: 'L', fase: 'Fase de grupos' }
];

const stadiums = [
  { nombre: 'Estadio Azteca', ciudad: 'Ciudad de México', pais: 'México', latitud: 19.302861, longitud: -99.150527, capacidad: 87000 },
  { nombre: 'MetLife Stadium', ciudad: 'East Rutherford', pais: 'Estados Unidos', latitud: 40.81284, longitud: -74.074208, capacidad: 82500 },
  { nombre: 'BC Place', ciudad: 'Vancouver', pais: 'Canadá', latitud: 49.2777, longitud: -123.1087, capacidad: 54000 },
  { nombre: 'AT&T Stadium', ciudad: 'Arlington', pais: 'Estados Unidos', latitud: 32.7473, longitud: -97.0945, capacidad: 80000 },
  { nombre: 'Mercedes-Benz Stadium', ciudad: 'Atlanta', pais: 'Estados Unidos', latitud: 33.755, longitud: -84.4008, capacidad: 71000 },
  { nombre: 'Hard Rock Stadium', ciudad: 'Miami Gardens', pais: 'Estados Unidos', latitud: 25.958, longitud: -80.238, capacidad: 65000 },
  { nombre: 'SoFi Stadium', ciudad: 'Inglewood', pais: 'Estados Unidos', latitud: 33.953, longitud: -118.339, capacidad: 70000 },
  { nombre: 'NRG Stadium', ciudad: 'Houston', pais: 'Estados Unidos', latitud: 29.6847, longitud: -95.4107, capacidad: 72000 },
  { nombre: 'Gillette Stadium', ciudad: 'Foxborough', pais: 'Estados Unidos', latitud: 42.0909, longitud: -71.2643, capacidad: 65878 },
  { nombre: 'Levi`s Stadium', ciudad: 'Santa Clara', pais: 'Estados Unidos', latitud: 37.403, longitud: -121.97, capacidad: 68300 },
  { nombre: 'BMO Field', ciudad: 'Toronto', pais: 'Canadá', latitud: 43.633, longitud: -79.397, capacidad: 30000 },
  { nombre: 'Estadio BBVA', ciudad: 'Monterrey', pais: 'México', latitud: 25.682, longitud: -100.309, capacidad: 51000 }
];

const finalPhases = [
  { nombre: 'Fase de grupos', clasificados: ['1A', '2A', '1B', '2B', '1C', '2C', '1D', '2D', '1E', '2E', '1F', '2F', '1G', '2G', '1H', '2H', '1I', '2I', '1J', '2J', '1K', '2K', '1L', '2L'], partidos: 72, sede: 'Varias sedes', fecha: new Date('2026-06-10T00:00:00Z') },
  { nombre: 'Dieciseisavos de final', clasificados: ['1A', '2A', '1B', '2B'], partidos: 16, sede: 'MetLife Stadium', fecha: new Date('2026-07-03T18:00:00Z') },
  { nombre: 'Octavos de final', clasificados: ['Ganadores 1-16'], partidos: 8, sede: 'Estadio Azteca', fecha: new Date('2026-07-10T18:00:00Z') },
  { nombre: 'Cuartos de final', clasificados: ['Ganadores 8'], partidos: 4, sede: 'BC Place', fecha: new Date('2026-07-14T18:00:00Z') },
  { nombre: 'Semifinal', clasificados: ['Ganadores 4'], partidos: 2, sede: 'Estadio Azteca', fecha: new Date('2026-07-18T18:00:00Z') },
  { nombre: 'Final', clasificados: ['Ganador semifinal 1', 'Ganador semifinal 2'], partidos: 1, sede: 'MetLife Stadium', fecha: new Date('2026-07-22T19:00:00Z') }
];

const users = [
  { nombre: 'Juan Pérez', email: 'juan@example.com', telefono: '555-1234', nacionalidad: 'México', tipo: 'Estudiante' },
  { nombre: 'María Gómez', email: 'maria@example.com', telefono: '555-5678', nacionalidad: 'Argentina', tipo: 'Aficionada' },
  { nombre: 'Carlos Díaz', email: 'carlos@example.com', telefono: '555-9012', nacionalidad: 'Estados Unidos', tipo: 'Turista' }
];

const selections = [
  { nombre: 'México', pais: 'México', continente: 'Norteamérica', historia: 'Gran tradición mundialista', ventajas: 'Afición numerosa', desventajas: 'Presión local', ranking: 15, banderaUrl: 'https://example.com/mexico.png', latitud: 19.432608, longitud: -99.133209, grupo: 'A' },
  { nombre: 'Inglaterra', pais: 'Inglaterra', continente: 'Europa', historia: 'Tradición histórica', ventajas: 'Jugadores de élite', desventajas: 'Expectativa', ranking: 5, banderaUrl: 'https://example.com/inglaterra.png', latitud: 51.507351, longitud: -0.127758, grupo: 'A' },
  { nombre: 'Senegal', pais: 'Senegal', continente: 'África', historia: 'Equipo rápido', ventajas: 'Atléticos', desventajas: 'Falta de profundidad', ranking: 20, banderaUrl: 'https://example.com/senegal.png', latitud: 14.497401, longitud: -14.452362, grupo: 'A' },
  { nombre: 'Australia', pais: 'Australia', continente: 'Asia', historia: 'Fuerte físico', ventajas: 'Velocidad aérea', desventajas: 'Viajes largos', ranking: 24, banderaUrl: 'https://example.com/australia.png', latitud: -33.86882, longitud: 151.209296, grupo: 'A' },
  { nombre: 'Estados Unidos', pais: 'Estados Unidos', continente: 'Norteamérica', historia: 'Potencia emergente', ventajas: 'Recursos', desventajas: 'Presión mediática', ranking: 12, banderaUrl: 'https://example.com/usa.png', latitud: 38.907192, longitud: -77.036871, grupo: 'B' },
  { nombre: 'Alemania', pais: 'Alemania', continente: 'Europa', historia: 'Fuerza táctica', ventajas: 'Organización', desventajas: 'Reestructuración', ranking: 6, banderaUrl: 'https://example.com/alemania.png', latitud: 52.520008, longitud: 13.404954, grupo: 'B' },
  { nombre: 'Marruecos', pais: 'Marruecos', continente: 'África', historia: 'Buena defensa', ventajas: 'Solidaridad', desventajas: 'Presión física', ranking: 22, banderaUrl: 'https://example.com/marruecos.png', latitud: 31.63, longitud: -8.008889, grupo: 'B' },
  { nombre: 'Japón', pais: 'Japón', continente: 'Asia', historia: 'Máquina organizada', ventajas: 'Disciplina', desventajas: 'Menor físico', ranking: 23, banderaUrl: 'https://example.com/japon.png', latitud: 35.6762, longitud: 139.6503, grupo: 'B' },
  { nombre: 'Canadá', pais: 'Canadá', continente: 'Norteamérica', historia: 'Crecimiento constante', ventajas: 'Organización', desventajas: 'Menor experiencia', ranking: 50, banderaUrl: 'https://example.com/canada.png', latitud: 45.42153, longitud: -75.697193, grupo: 'C' },
  { nombre: 'Francia', pais: 'Francia', continente: 'Europa', historia: 'Campeón mundial', ventajas: 'Talento joven', desventajas: 'Presión mental', ranking: 3, banderaUrl: 'https://example.com/francia.png', latitud: 48.856613, longitud: 2.352222, grupo: 'C' },
  { nombre: 'Egipto', pais: 'Egipto', continente: 'África', historia: 'Buen técnico', ventajas: 'Velocidad', desventajas: 'Falta de experiencia', ranking: 45, banderaUrl: 'https://example.com/egipto.png', latitud: 30.04442, longitud: 31.235712, grupo: 'C' },
  { nombre: 'Irán', pais: 'Irán', continente: 'Asia', historia: 'Juega compacto', ventajas: 'Bloque defensivo', desventajas: 'Creatividad limitada', ranking: 34, banderaUrl: 'https://example.com/iran.png', latitud: 35.6892, longitud: 51.389, grupo: 'C' },
  { nombre: 'Costa Rica', pais: 'Costa Rica', continente: 'Norteamérica', historia: 'Equipo sólido', ventajas: 'Resistencia', desventajas: 'Menos recursos', ranking: 30, banderaUrl: 'https://example.com/costarica.png', latitud: 9.748917, longitud: -83.753428, grupo: 'D' },
  { nombre: 'España', pais: 'España', continente: 'Europa', historia: 'Juego de posesión', ventajas: 'Control de balón', desventajas: 'Presión alta', ranking: 7, banderaUrl: 'https://example.com/espana.png', latitud: 40.416775, longitud: -3.70379, grupo: 'D' },
  { nombre: 'Ghana', pais: 'Ghana', continente: 'África', historia: 'Fuerza física', ventajas: 'Atletismo', desventajas: 'Menos técnica', ranking: 60, banderaUrl: 'https://example.com/ghana.png', latitud: 5.603716, longitud: -0.186964, grupo: 'D' },
  { nombre: 'Catar', pais: 'Catar', continente: 'Asia', historia: 'Organizador 2022', ventajas: 'Infraestructura', desventajas: 'Poca tradición', ranking: 40, banderaUrl: 'https://example.com/catar.png', latitud: 25.354826, longitud: 51.183884, grupo: 'D' },
  { nombre: 'Panamá', pais: 'Panamá', continente: 'Norteamérica', historia: 'Últimos años de ascenso', ventajas: 'Físico', desventajas: 'Menor consistencia', ranking: 55, banderaUrl: 'https://example.com/panama.png', latitud: 8.9824, longitud: -79.5199, grupo: 'E' },
  { nombre: 'Portugal', pais: 'Portugal', continente: 'Europa', historia: 'Calidad ofensiva', ventajas: 'Jugadores top', desventajas: 'Presión de resultados', ranking: 8, banderaUrl: 'https://example.com/portugal.png', latitud: 38.7223, longitud: -9.1393, grupo: 'E' },
  { nombre: 'Nigeria', pais: 'Nigeria', continente: 'África', historia: 'Talento joven', ventajas: 'Velocidad', desventajas: 'Inconstancia', ranking: 40, banderaUrl: 'https://example.com/nigeria.png', latitud: 9.0765, longitud: 7.3986, grupo: 'E' },
  { nombre: 'Uzbekistán', pais: 'Uzbekistán', continente: 'Asia', historia: 'Crecimiento continental', ventajas: 'Estructura', desventajas: 'Menor experiencia', ranking: 85, banderaUrl: 'https://example.com/uzbekistan.png', latitud: 41.2995, longitud: 69.2401, grupo: 'E' },
  { nombre: 'Honduras', pais: 'Honduras', continente: 'Norteamérica', historia: 'Gran garra', ventajas: 'Físico', desventajas: 'Menos técnica', ranking: 60, banderaUrl: 'https://example.com/honduras.png', latitud: 15.2, longitud: -86.2419, grupo: 'F' },
  { nombre: 'Países Bajos', pais: 'Países Bajos', continente: 'Europa', historia: 'Fútbol total', ventajas: 'Ofensiva', desventajas: 'Inconstancia', ranking: 9, banderaUrl: 'https://example.com/netherlands.png', latitud: 52.1326, longitud: 5.2913, grupo: 'F' },
  { nombre: 'Camerún', pais: 'Camerún', continente: 'África', historia: 'Orgullo africano', ventajas: 'Físico', desventajas: 'Orden táctico', ranking: 30, banderaUrl: 'https://example.com/cameroon.png', latitud: 3.848, longitud: 11.5021, grupo: 'F' },
  { nombre: 'Corea del Sur', pais: 'Corea del Sur', continente: 'Asia', historia: 'Juego veloz', ventajas: 'Disciplina', desventajas: 'Creatividad conservadora', ranking: 28, banderaUrl: 'https://example.com/corea.png', latitud: 37.5665, longitud: 126.978, grupo: 'F' },
  { nombre: 'Jamaica', pais: 'Jamaica', continente: 'Norteamérica', historia: 'Caribe vibrante', ventajas: 'Atlético', desventajas: 'Menos experiencia', ranking: 45, banderaUrl: 'https://example.com/jamaica.png', latitud: 18.1096, longitud: -77.2975, grupo: 'G' },
  { nombre: 'Bélgica', pais: 'Bélgica', continente: 'Europa', historia: 'Generación dorada', ventajas: 'Técnica', desventajas: 'Transición generacional', ranking: 11, banderaUrl: 'https://example.com/belgica.png', latitud: 50.8503, longitud: 4.3517, grupo: 'G' },
  { nombre: 'Argelia', pais: 'Argelia', continente: 'África', historia: 'Fútbol sólido', ventajas: 'Ofensiva rápida', desventajas: 'Defensa inconsistente', ranking: 50, banderaUrl: 'https://example.com/algeria.png', latitud: 36.7538, longitud: 3.0588, grupo: 'G' },
  { nombre: 'Emiratos Árabes Unidos', pais: 'Emiratos Árabes Unidos', continente: 'Asia', historia: 'Recursos altos', ventajas: 'Organización', desventajas: 'Menos experiencia', ranking: 70, banderaUrl: 'https://example.com/uae.png', latitud: 25.276987, longitud: 55.296249, grupo: 'G' },
  { nombre: 'El Salvador', pais: 'El Salvador', continente: 'Norteamérica', historia: 'Pupas históricas', ventajas: 'Velocidad', desventajas: 'Menos recursos', ranking: 65, banderaUrl: 'https://example.com/elsalvador.png', latitud: 13.6929, longitud: -89.2182, grupo: 'H' },
  { nombre: 'Croacia', pais: 'Croacia', continente: 'Europa', historia: 'Finalista reciente', ventajas: 'Técnica colectiva', desventajas: 'Plantilla corta', ranking: 14, banderaUrl: 'https://example.com/croacia.png', latitud: 45.815, longitud: 15.9819, grupo: 'H' },
  { nombre: 'Túnez', pais: 'Túnez', continente: 'África', historia: 'Fútbol organizado', ventajas: 'Disciplina', desventajas: 'Menos talento individual', ranking: 35, banderaUrl: 'https://example.com/tunisia.png', latitud: 33.8869, longitud: 9.5375, grupo: 'H' },
  { nombre: 'Colombia', pais: 'Colombia', continente: 'América', historia: 'Juego técnico', ventajas: 'Creatividad', desventajas: 'Inconstancia', ranking: 16, banderaUrl: 'https://example.com/colombia.png', latitud: 4.711, longitud: -74.0721, grupo: 'H' },
  { nombre: 'Uruguay', pais: 'Uruguay', continente: 'América', historia: 'Ganador histórico', ventajas: 'Fuerza grupal', desventajas: 'Poca rotación', ranking: 17, banderaUrl: 'https://example.com/uruguay.png', latitud: -34.901112, longitud: -56.164532, grupo: 'I' },
  { nombre: 'Italia', pais: 'Italia', continente: 'Europa', historia: 'Campeón europeo', ventajas: 'Táctica', desventajas: 'Inconstancia', ranking: 10, banderaUrl: 'https://example.com/italia.png', latitud: 41.9028, longitud: 12.4964, grupo: 'I' },
  { nombre: 'Costa de Marfil', pais: 'Costa de Marfil', continente: 'África', historia: 'Potencia africana', ventajas: 'Talento ofensivo', desventajas: 'Defensa física', ranking: 32, banderaUrl: 'https://example.com/ivorycoast.png', latitud: 5.6037, longitud: -0.187, grupo: 'I' },
  { nombre: 'Arabia Saudita', pais: 'Arabia Saudita', continente: 'Asia', historia: 'Creciente en confederación', ventajas: 'Físico', desventajas: 'Menor creatividad', ranking: 25, banderaUrl: 'https://example.com/arabia.png', latitud: 24.7136, longitud: 46.6753, grupo: 'I' },
  { nombre: 'Ecuador', pais: 'Ecuador', continente: 'América', historia: 'Juego agresivo', ventajas: 'Altura', desventajas: 'Defensa abierta', ranking: 18, banderaUrl: 'https://example.com/ecuador.png', latitud: -0.1807, longitud: -78.4678, grupo: 'J' },
  { nombre: 'Suiza', pais: 'Suiza', continente: 'Europa', historia: 'Fútbol ordenado', ventajas: 'Defensa compacta', desventajas: 'Mentalidad conservadora', ranking: 13, banderaUrl: 'https://example.com/suiza.png', latitud: 46.8182, longitud: 8.2275, grupo: 'J' },
  { nombre: 'Escocia', pais: 'Escocia', continente: 'Europa', historia: 'Selección histórica', ventajas: 'Pasión', desventajas: 'Menos talento ofensivo', ranking: 21, banderaUrl: 'https://example.com/escocia.png', latitud: 56.4907, longitud: -4.2026, grupo: 'J' },
  { nombre: 'Nueva Zelanda', pais: 'Nueva Zelanda', continente: 'Oceanía', historia: 'Equipo ordenado', ventajas: 'Comunicación', desventajas: 'Menos nivel global', ranking: 100, banderaUrl: 'https://example.com/nz.png', latitud: -36.84846, longitud: 174.763332, grupo: 'J' },
  { nombre: 'Perú', pais: 'Perú', continente: 'América', historia: 'Fútbol técnico', ventajas: 'Toque', desventajas: 'Menos físico', ranking: 20, banderaUrl: 'https://example.com/peru.png', latitud: -12.0464, longitud: -77.0428, grupo: 'K' },
  { nombre: 'Dinamarca', pais: 'Dinamarca', continente: 'Europa', historia: 'Fútbol inteligente', ventajas: 'Organización', desventajas: 'Ofensiva inconsistente', ranking: 16, banderaUrl: 'https://example.com/dinamarca.png', latitud: 56.2639, longitud: 9.5018, grupo: 'K' },
  { nombre: 'Polonia', pais: 'Polonia', continente: 'Europa', historia: 'Ataque directo', ventajas: 'Potencia aérea', desventajas: 'Defensa variable', ranking: 25, banderaUrl: 'https://example.com/polonia.png', latitud: 51.9194, longitud: 19.1451, grupo: 'K' },
  { nombre: 'Argentina', pais: 'Argentina', continente: 'América', historia: 'Campeón reciente', ventajas: 'Estilo ofensivo', desventajas: 'Lesiones', ranking: 2, banderaUrl: 'https://example.com/argentina.png', latitud: -34.603722, longitud: -58.381592, grupo: 'K' },
  { nombre: 'Brasil', pais: 'Brasil', continente: 'América', historia: 'Cinco veces campeón', ventajas: 'Talento individual', desventajas: 'Presión histórica', ranking: 1, banderaUrl: 'https://example.com/brasil.png', latitud: -15.793889, longitud: -47.882778, grupo: 'L' },
  { nombre: 'Gales', pais: 'Gales', continente: 'Europa', historia: 'Equipo compacto', ventajas: 'Fortaleza mental', desventajas: 'Pocas figuras', ranking: 19, banderaUrl: 'https://example.com/gales.png', latitud: 51.4816, longitud: -3.1791, grupo: 'L' },
  { nombre: 'Serbia', pais: 'Serbia', continente: 'Europa', historia: 'Fútbol físico', ventajas: 'Atlético', desventajas: 'Menos creatividad', ranking: 19, banderaUrl: 'https://example.com/serbia.png', latitud: 44.0165, longitud: 21.0059, grupo: 'L' },
  { nombre: 'Austria', pais: 'Austria', continente: 'Europa', historia: 'Juego sólido', ventajas: 'Estructura', desventajas: 'Menos talento individual', ranking: 27, banderaUrl: 'https://example.com/austria.png', latitud: 47.5162, longitud: 14.5501, grupo: 'L' }
];

async function main() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);

    const continentResult = await db.collection('continentes').insertMany(continents);
    const groupResult = await db.collection('grupos').insertMany(groups);
    const stadiumResult = await db.collection('estadios').insertMany(stadiums);
    const phaseResult = await db.collection('fase_final').insertMany(finalPhases);
    const userResult = await db.collection('usuarios').insertMany(users);

    const continentByName = {};
    for (const [index, continent] of continents.entries()) {
      continentByName[continent.nombre] = continentResult.insertedIds[index];
    }

    const groupByName = {};
    for (const [index, group] of groups.entries()) {
      groupByName[group.nombre] = groupResult.insertedIds[index];
    }

    const selectionsToInsert = selections.map(selection => ({
      nombre: selection.nombre,
      pais: selection.pais,
      continenteId: continentByName[selection.continente],
      grupoId: groupByName[selection.grupo],
      historia: selection.historia,
      ventajas: selection.ventajas,
      desventajas: selection.desventajas,
      ranking: selection.ranking,
      banderaUrl: selection.banderaUrl,
      latitud: selection.latitud,
      longitud: selection.longitud
    }));

    const groupIdBySelectionName = Object.fromEntries(selections.map(selection => [selection.nombre, groupByName[selection.grupo]]));

    const selectionResult = await db.collection('selecciones').insertMany(selectionsToInsert);

    const selectionByName = {};
    const selectionIds = [];
    const selectionDocs = Object.values(selectionResult.insertedIds);
    for (let i = 0; i < selections.length; i++) {
      selectionByName[selections[i].nombre] = selectionResult.insertedIds[i];
      selectionIds.push(selectionResult.insertedIds[i]);
    }

    const groupDefinitions = [
      {
        nombre: 'A',
        teams: ['México', 'Inglaterra', 'Senegal', 'Australia'],
        stadium: 'Estadio Azteca',
        dates: [
          '2026-06-11T20:00:00Z',
          '2026-06-12T18:00:00Z',
          '2026-06-16T20:00:00Z',
          '2026-06-17T18:00:00Z',
          '2026-06-21T20:00:00Z',
          '2026-06-22T18:00:00Z'
        ]
      },
      {
        nombre: 'B',
        teams: ['Estados Unidos', 'Alemania', 'Marruecos', 'Japón'],
        stadium: 'MetLife Stadium',
        dates: [
          '2026-06-11T18:00:00Z',
          '2026-06-12T20:00:00Z',
          '2026-06-16T18:00:00Z',
          '2026-06-17T20:00:00Z',
          '2026-06-21T18:00:00Z',
          '2026-06-22T20:00:00Z'
        ]
      },
      {
        nombre: 'C',
        teams: ['Canadá', 'Francia', 'Egipto', 'Irán'],
        stadium: 'BC Place',
        dates: [
          '2026-06-13T18:00:00Z',
          '2026-06-14T20:00:00Z',
          '2026-06-18T18:00:00Z',
          '2026-06-19T20:00:00Z',
          '2026-06-23T18:00:00Z',
          '2026-06-24T20:00:00Z'
        ]
      },
      {
        nombre: 'D',
        teams: ['Costa Rica', 'España', 'Ghana', 'Catar'],
        stadium: 'AT&T Stadium',
        dates: [
          '2026-06-13T20:00:00Z',
          '2026-06-14T18:00:00Z',
          '2026-06-18T20:00:00Z',
          '2026-06-19T18:00:00Z',
          '2026-06-23T20:00:00Z',
          '2026-06-24T18:00:00Z'
        ]
      },
      {
        nombre: 'E',
        teams: ['Panamá', 'Portugal', 'Nigeria', 'Uzbekistán'],
        stadium: 'Mercedes-Benz Stadium',
        dates: [
          '2026-06-15T18:00:00Z',
          '2026-06-16T18:00:00Z',
          '2026-06-20T18:00:00Z',
          '2026-06-21T18:00:00Z',
          '2026-06-25T18:00:00Z',
          '2026-06-26T18:00:00Z'
        ]
      },
      {
        nombre: 'F',
        teams: ['Honduras', 'Países Bajos', 'Camerún', 'Corea del Sur'],
        stadium: 'Hard Rock Stadium',
        dates: [
          '2026-06-15T20:00:00Z',
          '2026-06-16T20:00:00Z',
          '2026-06-20T20:00:00Z',
          '2026-06-21T20:00:00Z',
          '2026-06-25T20:00:00Z',
          '2026-06-26T20:00:00Z'
        ]
      },
      {
        nombre: 'G',
        teams: ['Jamaica', 'Bélgica', 'Argelia', 'Emiratos Árabes Unidos'],
        stadium: 'SoFi Stadium',
        dates: [
          '2026-06-17T18:00:00Z',
          '2026-06-18T18:00:00Z',
          '2026-06-22T18:00:00Z',
          '2026-06-23T18:00:00Z',
          '2026-06-27T18:00:00Z',
          '2026-06-28T18:00:00Z'
        ]
      },
      {
        nombre: 'H',
        teams: ['El Salvador', 'Croacia', 'Túnez', 'Colombia'],
        stadium: 'NRG Stadium',
        dates: [
          '2026-06-17T20:00:00Z',
          '2026-06-18T20:00:00Z',
          '2026-06-22T20:00:00Z',
          '2026-06-23T20:00:00Z',
          '2026-06-27T20:00:00Z',
          '2026-06-28T20:00:00Z'
        ]
      },
      {
        nombre: 'I',
        teams: ['Uruguay', 'Italia', 'Costa de Marfil', 'Arabia Saudita'],
        stadium: 'Gillette Stadium',
        dates: [
          '2026-06-19T18:00:00Z',
          '2026-06-20T18:00:00Z',
          '2026-06-24T18:00:00Z',
          '2026-06-25T18:00:00Z',
          '2026-06-29T18:00:00Z',
          '2026-06-30T18:00:00Z'
        ]
      },
      {
        nombre: 'J',
        teams: ['Ecuador', 'Suiza', 'Escocia', 'Nueva Zelanda'],
        stadium: 'Levi`s Stadium',
        dates: [
          '2026-06-19T20:00:00Z',
          '2026-06-20T20:00:00Z',
          '2026-06-24T20:00:00Z',
          '2026-06-25T20:00:00Z',
          '2026-06-29T20:00:00Z',
          '2026-06-30T20:00:00Z'
        ]
      },
      {
        nombre: 'K',
        teams: ['Perú', 'Dinamarca', 'Polonia', 'Argentina'],
        stadium: 'BMO Field',
        dates: [
          '2026-06-21T18:00:00Z',
          '2026-06-22T18:00:00Z',
          '2026-06-26T18:00:00Z',
          '2026-06-27T18:00:00Z',
          '2026-07-01T18:00:00Z',
          '2026-07-02T18:00:00Z'
        ]
      },
      {
        nombre: 'L',
        teams: ['Brasil', 'Gales', 'Serbia', 'Austria'],
        stadium: 'Estadio BBVA',
        dates: [
          '2026-06-21T20:00:00Z',
          '2026-06-22T20:00:00Z',
          '2026-06-26T20:00:00Z',
          '2026-06-27T20:00:00Z',
          '2026-07-01T20:00:00Z',
          '2026-07-02T20:00:00Z'
        ]
      }
    ];

    const groupMatchPairs = [
      { local: 0, visitante: 1 },
      { local: 2, visitante: 3 },
      { local: 0, visitante: 2 },
      { local: 1, visitante: 3 },
      { local: 0, visitante: 3 },
      { local: 1, visitante: 2 }
    ];

    const realMatchResults = {
      'A0': { goles_local: 2, goles_visitante: 1 },
      'A1': { goles_local: 1, goles_visitante: 1 },
      'A2': { goles_local: 0, goles_visitante: 0 },
      'A3': { goles_local: 1, goles_visitante: 3 },
      'B0': { goles_local: 2, goles_visitante: 2 },
      'B1': { goles_local: 0, goles_visitante: 1 },
      'B2': { goles_local: 1, goles_visitante: 0 },
      'B3': { goles_local: 1, goles_visitante: 1 },
      'C0': { goles_local: 4, goles_visitante: 0 },
      'C1': { goles_local: 2, goles_visitante: 1 },
      'C2': { goles_local: 1, goles_visitante: 2 },
      'C3': { goles_local: 1, goles_visitante: 1 },
      'D0': { goles_local: 1, goles_visitante: 2 },
      'D1': { goles_local: 0, goles_visitante: 0 },
      'D2': { goles_local: 2, goles_visitante: 0 },
      'D3': { goles_local: 1, goles_visitante: 2 },
      'E0': { goles_local: 0, goles_visitante: 3 },
      'E1': { goles_local: 1, goles_visitante: 1 },
      'E2': { goles_local: 2, goles_visitante: 1 },
      'E3': { goles_local: 0, goles_visitante: 0 },
      'F0': { goles_local: 1, goles_visitante: 1 },
      'F1': { goles_local: 0, goles_visitante: 2 },
      'F2': { goles_local: 2, goles_visitante: 1 },
      'F3': { goles_local: 3, goles_visitante: 0 },
      'G0': { goles_local: 1, goles_visitante: 2 },
      'G1': { goles_local: 0, goles_visitante: 0 },
      'G2': { goles_local: 1, goles_visitante: 3 },
      'G3': { goles_local: 2, goles_visitante: 2 },
      'H0': { goles_local: 0, goles_visitante: 1 },
      'H1': { goles_local: 1, goles_visitante: 1 },
      'H2': { goles_local: 2, goles_visitante: 0 },
      'H3': { goles_local: 1, goles_visitante: 2 },
      'I0': { goles_local: 0, goles_visitante: 0 },
      'I1': { goles_local: 2, goles_visitante: 1 },
      'I2': { goles_local: 1, goles_visitante: 3 },
      'I3': { goles_local: 0, goles_visitante: 2 },
      'J0': { goles_local: 1, goles_visitante: 2 },
      'J1': { goles_local: 1, goles_visitante: 1 },
      'J2': { goles_local: 0, goles_visitante: 1 },
      'J3': { goles_local: 2, goles_visitante: 2 },
      'K0': { goles_local: 1, goles_visitante: 3 },
      'K1': { goles_local: 1, goles_visitante: 1 },
      'K2': { goles_local: 2, goles_visitante: 2 },
      'K3': { goles_local: 0, goles_visitante: 1 },
      'L0': { goles_local: 0, goles_visitante: 4 },
      'L1': { goles_local: 1, goles_visitante: 1 },
      'L2': { goles_local: 2, goles_visitante: 0 },
      'L3': { goles_local: 1, goles_visitante: 2 }
    };

    const matches = [];
    for (const groupDef of groupDefinitions) {
      for (let index = 0; index < groupMatchPairs.length; index++) {
        const pair = groupMatchPairs[index];
        const fecha = new Date(groupDef.dates[index]);
        const horario = fecha.toISOString().slice(11, 16);
        const match = {
          fase: 'Fase de grupos',
          equipo_local: groupDef.teams[pair.local],
          equipo_visitante: groupDef.teams[pair.visitante],
          fecha,
          estadio: groupDef.stadium,
          horario
        };
        const resultKey = `${groupDef.nombre}${index}`;
        const result = realMatchResults[resultKey] || {
          goles_local: (index % 3) + 1,
          goles_visitante: ((index + 1) % 3)
        };
        match.goles_local = result.goles_local;
        match.goles_visitante = result.goles_visitante;
        matches.push(match);
      }
    }

    const stadiumByName = {};
    stadiums.forEach((stadium, index) => {
      stadiumByName[stadium.nombre] = stadiumResult.insertedIds[index];
    });

    const phaseByName = {};
    finalPhases.forEach((phase, index) => {
      phaseByName[phase.nombre] = phaseResult.insertedIds[index];
    });

    const matchesToInsert = matches.map(match => ({
      faseId: phaseByName[match.fase],
      equipo_localId: selectionByName[match.equipo_local],
      equipo_visitanteId: selectionByName[match.equipo_visitante],
      goles_local: match.goles_local,
      goles_visitante: match.goles_visitante,
      fecha: match.fecha,
      estadioId: stadiumByName[match.estadio],
      horario: match.horario
    }));

    const partidoResult = await db.collection('partidos').insertMany(matchesToInsert);

    const ticketData = [
      { usuario: users[0], partidoIndex: 0, asiento: 'A12', zona: 'A', costo: 150, dia: 'Sábado', fecha: matches[0].fecha, horario: matches[0].horario, seleccion: 'México' },
      { usuario: users[1], partidoIndex: 2, asiento: 'B10', zona: 'B', costo: 180, dia: 'Lunes', fecha: matches[2].fecha, horario: matches[2].horario, seleccion: 'Brasil' },
      { usuario: users[2], partidoIndex: 4, asiento: 'C15', zona: 'C', costo: 160, dia: 'Miércoles', fecha: matches[4].fecha, horario: matches[4].horario, seleccion: 'Francia' }
    ];

    const ticketsToInsert = ticketData.map(ticket => ({
      usuarioId: userResult.insertedIds[users.indexOf(ticket.usuario)],
      estadioId: stadiumByName[matches[ticket.partidoIndex].estadio],
      dia: ticket.dia,
      fecha: ticket.fecha,
      horario: ticket.horario,
      seleccionId: selectionByName[ticket.seleccion],
      costo: ticket.costo
    }));

    await db.collection('boletos').insertMany(ticketsToInsert);

    const classificationMap = new Map();

    const ensureClassification = (seleccionId, grupoId) => {
      const key = `${seleccionId.toString()}_${grupoId.toString()}`;
      if (!classificationMap.has(key)) {
        classificationMap.set(key, {
          grupoId,
          seleccionId: seleccionId,
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
    };

    for (let i = 0; i < matches.length; i++) {
      const originalMatch = matches[i];
      const match = matchesToInsert[i];
      if (typeof match.goles_local !== 'number' || typeof match.goles_visitante !== 'number') {
        continue;
      }

      const localId = match.equipo_localId;
      const visitanteId = match.equipo_visitanteId;
      const localGroupId = groupIdBySelectionName[originalMatch.equipo_local];
      const visitanteGroupId = groupIdBySelectionName[originalMatch.equipo_visitante];

      if (!localGroupId || !visitanteGroupId) {
        continue;
      }

      const localClasificacion = ensureClassification(localId, localGroupId);
      const visitanteClasificacion = ensureClassification(visitanteId, visitanteGroupId);

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

    const classifications = Array.from(classificationMap.values()).map(stat => ({
      ...stat,
      dg: stat.gf - stat.gc
    }));

    await db.collection('clasificaciones').insertMany(classifications);

    console.log('Datos reales de selecciones, estadios, partidos y clasificaciones cargados correctamente.');
  } catch (error) {
    console.error('Error al insertar datos:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();

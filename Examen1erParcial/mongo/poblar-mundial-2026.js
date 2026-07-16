import { MongoClient, ObjectId } from 'mongodb';

const MONGO_URI = 'mongodb://127.0.0.1:27017';
const DB_NAME = 'mundial2026';

const client = new MongoClient(MONGO_URI);

async function main() {
  await client.connect();
  const db = client.db(DB_NAME);

  // Eliminar colecciones para descartar validadores de esquema viejos
  const collectionsToDrop = ['continentes', 'grupos', 'estadios', 'selecciones', 'fase_final', 'partidos', 'clasificaciones', 'boletos', 'usuarios'];
  for (const name of collectionsToDrop) {
    await db.collection(name).drop().catch(() => {});
  }

  // --- Catálogo base ---
  const continents = [
    { nombre: 'América', confederacion: 'CONMEBOL', paises_incluidos: ['Brasil', 'Argentina', 'Colombia', 'Ecuador', 'Perú', 'Uruguay'] },
    { nombre: 'Norteamérica', confederacion: 'CONCACAF', paises_incluidos: ['México', 'Estados Unidos', 'Canadá', 'Panamá', 'Costa Rica', 'Jamaica', 'Honduras', 'El Salvador'] },
    { nombre: 'Europa', confederacion: 'UEFA', paises_incluidos: ['Inglaterra', 'Alemania', 'Francia', 'España', 'Portugal', 'Países Bajos', 'Bélgica', 'Croacia', 'Suiza', 'Escocia', 'Serbia', 'Austria', 'Dinamarca', 'Polonia', 'Gales', 'Italia'] },
    { nombre: 'África', confederacion: 'CAF', paises_incluidos: ['Sudáfrica', 'Marruecos', 'Egipto', 'Ghana', 'Senegal', 'Argelia', 'Túnez', 'Costa de Marfil', 'Nigeria', 'Camerún'] },
    { nombre: 'Asia', confederacion: 'AFC', paises_incluidos: ['Corea del Sur', 'Japón', 'Uzbekistán', 'Arabia Saudita', 'Australia', 'Catar', 'Emiratos Árabes Unidos', 'Irán'] },
    { nombre: 'Oceanía', confederacion: 'OFC', paises_incluidos: ['Nueva Zelanda'] }
  ];

  const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

  const stadiums = [
    { nombre: 'Estadio Azteca', ciudad: 'Ciudad de México', pais: 'México', latitud: 19.302861, longitud: -99.150527, capacidad: 87000 },
    { nombre: 'MetLife Stadium', ciudad: 'East Rutherford', pais: 'Estados Unidos', latitud: 40.81284, longitud: -74.074208, capacidad: 82500 },
    { nombre: 'BC Place', ciudad: 'Vancouver', pais: 'Canadá', latitud: 49.2777, longitud: -123.1087, capacidad: 54000 },
    { nombre: 'Estadio BBVA', ciudad: 'Monterrey', pais: 'México', latitud: 25.682, longitud: -100.309, capacidad: 51000 },
    { nombre: 'SoFi Stadium', ciudad: 'Inglewood', pais: 'Estados Unidos', latitud: 33.953, longitud: -118.339, capacidad: 70000 },
    { nombre: 'AT&T Stadium', ciudad: 'Arlington', pais: 'Estados Unidos', latitud: 32.7473, longitud: -97.0945, capacidad: 80000 },
    { nombre: 'Mercedes-Benz Stadium', ciudad: 'Atlanta', pais: 'Estados Unidos', latitud: 33.755, longitud: -84.4008, capacidad: 71000 },
    { nombre: 'Hard Rock Stadium', ciudad: 'Miami Gardens', pais: 'Estados Unidos', latitud: 25.958, longitud: -80.238, capacidad: 65000 },
    { nombre: 'NRG Stadium', ciudad: 'Houston', pais: 'Estados Unidos', latitud: 29.6847, longitud: -95.4107, capacidad: 72000 },
    { nombre: 'Gillette Stadium', ciudad: 'Foxborough', pais: 'Estados Unidos', latitud: 42.0909, longitud: -71.2643, capacidad: 65878 },
    { nombre: 'Levi\'s Stadium', ciudad: 'Santa Clara', pais: 'Estados Unidos', latitud: 37.403, longitud: -121.97, capacidad: 68300 },
    { nombre: 'BMO Field', ciudad: 'Toronto', pais: 'Canadá', latitud: 43.633, longitud: -79.397, capacidad: 30000 }
  ];

  const selections = [
    { nombre: 'México', pais: 'México', continente: 'Norteamérica', grupo: 'A', historia: 'Gran tradición mundialista', ventajas: 'Afición numerosa', desventajas: 'Presión local', ranking: 15, bandera_url: 'https://example.com/mexico.png', geolocalizacion: { latitud: 19.432608, longitud: -99.133209 } },
    { nombre: 'Inglaterra', pais: 'Inglaterra', continente: 'Europa', grupo: 'A', historia: 'Tradición histórica', ventajas: 'Jugadores de élite', desventajas: 'Expectativa', ranking: 5, bandera_url: 'https://example.com/england.png', geolocalizacion: { latitud: 51.507351, longitud: -0.127758 } },
    { nombre: 'Senegal', pais: 'Senegal', continente: 'África', grupo: 'A', historia: 'Equipo rápido', ventajas: 'Atléticos', desventajas: 'Falta de profundidad', ranking: 20, bandera_url: 'https://example.com/senegal.png', geolocalizacion: { latitud: 14.497401, longitud: -14.452362 } },
    { nombre: 'Australia', pais: 'Australia', continente: 'Asia', grupo: 'A', historia: 'Fuerte físico', ventajas: 'Velocidad aérea', desventajas: 'Viajes largos', ranking: 24, bandera_url: 'https://example.com/australia.png', geolocalizacion: { latitud: -33.86882, longitud: 151.209296 } },
    { nombre: 'Estados Unidos', pais: 'Estados Unidos', continente: 'Norteamérica', grupo: 'B', historia: 'Potencia emergente', ventajas: 'Recursos', desventajas: 'Presión mediática', ranking: 12, bandera_url: 'https://example.com/usa.png', geolocalizacion: { latitud: 38.907192, longitud: -77.036871 } },
    { nombre: 'Alemania', pais: 'Alemania', continente: 'Europa', grupo: 'B', historia: 'Fuerza táctica', ventajas: 'Organización', desventajas: 'Reestructuración', ranking: 6, bandera_url: 'https://example.com/germany.png', geolocalizacion: { latitud: 52.520008, longitud: 13.404954 } },
    { nombre: 'Marruecos', pais: 'Marruecos', continente: 'África', grupo: 'B', historia: 'Buena defensa', ventajas: 'Solidaridad', desventajas: 'Presión física', ranking: 22, bandera_url: 'https://example.com/morocco.png', geolocalizacion: { latitud: 31.63, longitud: -8.008889 } },
    { nombre: 'Japón', pais: 'Japón', continente: 'Asia', grupo: 'B', historia: 'Máquina organizada', ventajas: 'Disciplina', desventajas: 'Menor físico', ranking: 23, bandera_url: 'https://example.com/japan.png', geolocalizacion: { latitud: 35.6762, longitud: 139.6503 } },
    { nombre: 'Canadá', pais: 'Canadá', continente: 'Norteamérica', grupo: 'C', historia: 'Crecimiento constante', ventajas: 'Organización', desventajas: 'Menor experiencia', ranking: 50, bandera_url: 'https://example.com/canada.png', geolocalizacion: { latitud: 45.42153, longitud: -75.697193 } },
    { nombre: 'Francia', pais: 'Francia', continente: 'Europa', grupo: 'C', historia: 'Campeón mundial', ventajas: 'Talento joven', desventajas: 'Presión mental', ranking: 3, bandera_url: 'https://example.com/france.png', geolocalizacion: { latitud: 48.856613, longitud: 2.352222 } },
    { nombre: 'Egipto', pais: 'Egipto', continente: 'África', grupo: 'C', historia: 'Buen técnico', ventajas: 'Velocidad', desventajas: 'Falta de experiencia', ranking: 45, bandera_url: 'https://example.com/egypt.png', geolocalizacion: { latitud: 30.04442, longitud: 31.235712 } },
    { nombre: 'Irán', pais: 'Irán', continente: 'Asia', grupo: 'C', historia: 'Juega compacto', ventajas: 'Bloque defensivo', desventajas: 'Creatividad limitada', ranking: 34, bandera_url: 'https://example.com/iran.png', geolocalizacion: { latitud: 35.6892, longitud: 51.389 } },
    { nombre: 'Costa Rica', pais: 'Costa Rica', continente: 'Norteamérica', grupo: 'D', historia: 'Equipo sólido', ventajas: 'Resistencia', desventajas: 'Menos recursos', ranking: 30, bandera_url: 'https://example.com/costarica.png', geolocalizacion: { latitud: 9.748917, longitud: -83.753428 } },
    { nombre: 'España', pais: 'España', continente: 'Europa', grupo: 'D', historia: 'Juego de posesión', ventajas: 'Control de balón', desventajas: 'Presión alta', ranking: 7, bandera_url: 'https://example.com/spain.png', geolocalizacion: { latitud: 40.416775, longitud: -3.70379 } },
    { nombre: 'Ghana', pais: 'Ghana', continente: 'África', grupo: 'D', historia: 'Fuerza física', ventajas: 'Atletismo', desventajas: 'Menos técnica', ranking: 60, bandera_url: 'https://example.com/ghana.png', geolocalizacion: { latitud: 5.603716, longitud: -0.186964 } },
    { nombre: 'Catar', pais: 'Catar', continente: 'Asia', grupo: 'D', historia: 'Organizador 2022', ventajas: 'Infraestructura', desventajas: 'Poca tradición', ranking: 40, bandera_url: 'https://example.com/qatar.png', geolocalizacion: { latitud: 25.354826, longitud: 51.183884 } },
    { nombre: 'Panamá', pais: 'Panamá', continente: 'Norteamérica', grupo: 'E', historia: 'Últimos años de ascenso', ventajas: 'Físico', desventajas: 'Menor consistencia', ranking: 55, bandera_url: 'https://example.com/panama.png', geolocalizacion: { latitud: 8.9824, longitud: -79.5199 } },
    { nombre: 'Portugal', pais: 'Portugal', continente: 'Europa', grupo: 'E', historia: 'Calidad ofensiva', ventajas: 'Jugadores top', desventajas: 'Presión de resultados', ranking: 8, bandera_url: 'https://example.com/portugal.png', geolocalizacion: { latitud: 38.7223, longitud: -9.1393 } },
    { nombre: 'Nigeria', pais: 'Nigeria', continente: 'África', grupo: 'E', historia: 'Talento joven', ventajas: 'Velocidad', desventajas: 'Inconstancia', ranking: 40, bandera_url: 'https://example.com/nigeria.png', geolocalizacion: { latitud: 9.0765, longitud: 7.3986 } },
    { nombre: 'Uzbekistán', pais: 'Uzbekistán', continente: 'Asia', grupo: 'E', historia: 'Crecimiento continental', ventajas: 'Estructura', desventajas: 'Menor experiencia', ranking: 85, bandera_url: 'https://example.com/uzbekistan.png', geolocalizacion: { latitud: 41.2995, longitud: 69.2401 } },
    { nombre: 'Honduras', pais: 'Honduras', continente: 'Norteamérica', grupo: 'F', historia: 'Gran garra', ventajas: 'Físico', desventajas: 'Menos técnica', ranking: 60, bandera_url: 'https://example.com/honduras.png', geolocalizacion: { latitud: 15.2, longitud: -86.2419 } },
    { nombre: 'Países Bajos', pais: 'Países Bajos', continente: 'Europa', grupo: 'F', historia: 'Fútbol total', ventajas: 'Ofensiva', desventajas: 'Inconstancia', ranking: 9, bandera_url: 'https://example.com/netherlands.png', geolocalizacion: { latitud: 52.1326, longitud: 5.2913 } },
    { nombre: 'Camerún', pais: 'Camerún', continente: 'África', grupo: 'F', historia: 'Orgullo africano', ventajas: 'Físico', desventajas: 'Orden táctico', ranking: 30, bandera_url: 'https://example.com/cameroon.png', geolocalizacion: { latitud: 3.848, longitud: 11.5021 } },
    { nombre: 'Corea del Sur', pais: 'Corea del Sur', continente: 'Asia', grupo: 'F', historia: 'Juego veloz', ventajas: 'Disciplina', desventajas: 'Creatividad conservadora', ranking: 28, bandera_url: 'https://example.com/korea.png', geolocalizacion: { latitud: 37.5665, longitud: 126.978 } },
    { nombre: 'Jamaica', pais: 'Jamaica', continente: 'Norteamérica', grupo: 'G', historia: 'Caribe vibrante', ventajas: 'Atlético', desventajas: 'Menos experiencia', ranking: 45, bandera_url: 'https://example.com/jamaica.png', geolocalizacion: { latitud: 18.1096, longitud: -77.2975 } },
    { nombre: 'Bélgica', pais: 'Bélgica', continente: 'Europa', grupo: 'G', historia: 'Generación dorada', ventajas: 'Técnica', desventajas: 'Transición generacional', ranking: 11, bandera_url: 'https://example.com/belgica.png', geolocalizacion: { latitud: 50.8503, longitud: 4.3517 } },
    { nombre: 'Argelia', pais: 'Argelia', continente: 'África', grupo: 'G', historia: 'Fútbol sólido', ventajas: 'Ofensiva rápida', desventajas: 'Defensa inconsistente', ranking: 50, bandera_url: 'https://example.com/algeria.png', geolocalizacion: { latitud: 36.7538, longitud: 3.0588 } },
    { nombre: 'Emiratos Árabes Unidos', pais: 'Emiratos Árabes Unidos', continente: 'Asia', grupo: 'G', historia: 'Recursos altos', ventajas: 'Organización', desventajas: 'Menor experiencia', ranking: 70, bandera_url: 'https://example.com/uae.png', geolocalizacion: { latitud: 25.276987, longitud: 55.296249 } },
    { nombre: 'El Salvador', pais: 'El Salvador', continente: 'Norteamérica', grupo: 'H', historia: 'Pupas históricas', ventajas: 'Velocidad', desventajas: 'Menos recursos', ranking: 65, bandera_url: 'https://example.com/elsalvador.png', geolocalizacion: { latitud: 13.6929, longitud: -89.2182 } },
    { nombre: 'Croacia', pais: 'Croacia', continente: 'Europa', grupo: 'H', historia: 'Finalista reciente', ventajas: 'Técnica colectiva', desventajas: 'Plantilla corta', ranking: 14, bandera_url: 'https://example.com/croacia.png', geolocalizacion: { latitud: 45.815, longitud: 15.9819 } },
    { nombre: 'Túnez', pais: 'Túnez', continente: 'África', grupo: 'H', historia: 'Fútbol organizado', ventajas: 'Disciplina', desventajas: 'Menos talento individual', ranking: 35, bandera_url: 'https://example.com/tunisia.png', geolocalizacion: { latitud: 33.8869, longitud: 9.5375 } },
    { nombre: 'Colombia', pais: 'Colombia', continente: 'América', grupo: 'H', historia: 'Juego técnico', ventajas: 'Creatividad', desventajas: 'Inconstancia', ranking: 16, bandera_url: 'https://example.com/colombia.png', geolocalizacion: { latitud: 4.711, longitud: -74.0721 } },
    { nombre: 'Uruguay', pais: 'Uruguay', continente: 'América', grupo: 'I', historia: 'Ganador histórico', ventajas: 'Fuerza grupal', desventajas: 'Poca rotación', ranking: 17, bandera_url: 'https://example.com/uruguay.png', geolocalizacion: { latitud: -34.901112, longitud: -56.164532 } },
    { nombre: 'Italia', pais: 'Italia', continente: 'Europa', grupo: 'I', historia: 'Campeón europeo', ventajas: 'Táctica', desventajas: 'Inconstancia', ranking: 10, bandera_url: 'https://example.com/italia.png', geolocalizacion: { latitud: 41.9028, longitud: 12.4964 } },
    { nombre: 'Costa de Marfil', pais: 'Costa de Marfil', continente: 'África', grupo: 'I', historia: 'Potencia africana', ventajas: 'Talento ofensivo', desventajas: 'Defensa física', ranking: 32, bandera_url: 'https://example.com/ivorycoast.png', geolocalizacion: { latitud: 5.6037, longitud: -0.187 } },
    { nombre: 'Arabia Saudita', pais: 'Arabia Saudita', continente: 'Asia', grupo: 'I', historia: 'Creciente en confederación', ventajas: 'Físico', desventajas: 'Menor creatividad', ranking: 25, bandera_url: 'https://example.com/arabia.png', geolocalizacion: { latitud: 24.7136, longitud: 46.6753 } },
    { nombre: 'Ecuador', pais: 'Ecuador', continente: 'América', grupo: 'J', historia: 'Juego agresivo', ventajas: 'Altura', desventajas: 'Defensa abierta', ranking: 18, bandera_url: 'https://example.com/ecuador.png', geolocalizacion: { latitud: -0.1807, longitud: -78.4678 } },
    { nombre: 'Suiza', pais: 'Suiza', continente: 'Europa', grupo: 'J', historia: 'Fútbol ordenado', ventajas: 'Defensa compacta', desventajas: 'Mentalidad conservadora', ranking: 13, bandera_url: 'https://example.com/suiza.png', geolocalizacion: { latitud: 46.8182, longitud: 8.2275 } },
    { nombre: 'Escocia', pais: 'Escocia', continente: 'Europa', grupo: 'J', historia: 'Selección histórica', ventajas: 'Pasión', desventajas: 'Menos talento ofensivo', ranking: 21, bandera_url: 'https://example.com/scotland.png', geolocalizacion: { latitud: 56.4907, longitud: -4.2026 } },
    { nombre: 'Nueva Zelanda', pais: 'Nueva Zelanda', continente: 'Oceanía', grupo: 'J', historia: 'Equipo ordenado', ventajas: 'Comunicación', desventajas: 'Menos nivel global', ranking: 100, bandera_url: 'https://example.com/nz.png', geolocalizacion: { latitud: -36.84846, longitud: 174.763332 } },
    { nombre: 'Perú', pais: 'Perú', continente: 'América', grupo: 'K', historia: 'Fútbol técnico', ventajas: 'Toque', desventajas: 'Menos físico', ranking: 20, bandera_url: 'https://example.com/peru.png', geolocalizacion: { latitud: -12.0464, longitud: -77.0428 } },
    { nombre: 'Dinamarca', pais: 'Dinamarca', continente: 'Europa', grupo: 'K', historia: 'Fútbol inteligente', ventajas: 'Organización', desventajas: 'Ofensiva inconsistente', ranking: 16, bandera_url: 'https://example.com/dinamarca.png', geolocalizacion: { latitud: 56.2639, longitud: 9.5018 } },
    { nombre: 'Polonia', pais: 'Polonia', continente: 'Europa', grupo: 'K', historia: 'Ataque directo', ventajas: 'Potencia aérea', desventajas: 'Defensa variable', ranking: 25, bandera_url: 'https://example.com/polonia.png', geolocalizacion: { latitud: 51.9194, longitud: 19.1451 } },
    { nombre: 'Argentina', pais: 'Argentina', continente: 'América', grupo: 'K', historia: 'Campeón reciente', ventajas: 'Estilo ofensivo', desventajas: 'Lesiones', ranking: 2, bandera_url: 'https://example.com/argentina.png', geolocalizacion: { latitud: -34.603722, longitud: -58.381592 } },
    { nombre: 'Brasil', pais: 'Brasil', continente: 'América', grupo: 'L', historia: 'Cinco veces campeón', ventajas: 'Talento individual', desventajas: 'Presión histórica', ranking: 1, bandera_url: 'https://example.com/brasil.png', geolocalizacion: { latitud: -15.793889, longitud: -47.882778 } },
    { nombre: 'Gales', pais: 'Gales', continente: 'Europa', grupo: 'L', historia: 'Equipo compacto', ventajas: 'Fortaleza mental', desventajas: 'Pocas figuras', ranking: 19, bandera_url: 'https://example.com/gales.png', geolocalizacion: { latitud: 51.4816, longitud: -3.1791 } },
    { nombre: 'Serbia', pais: 'Serbia', continente: 'Europa', grupo: 'L', historia: 'Fútbol físico', ventajas: 'Atlético', desventajas: 'Menos creatividad', ranking: 19, bandera_url: 'https://example.com/serbia.png', geolocalizacion: { latitud: 44.0165, longitud: 21.0059 } },
    { nombre: 'Austria', pais: 'Austria', continente: 'Europa', grupo: 'L', historia: 'Juego sólido', ventajas: 'Estructura', desventajas: 'Menos talento individual', ranking: 27, bandera_url: 'https://example.com/austria.png', geolocalizacion: { latitud: 47.5162, longitud: 14.5501 } }
  ];

  const fases = [
    { nombre: 'Fase de grupos', clasificados: ['1A', '2A', '1B', '2B', '1C', '2C', '1D', '2D', '1E', '2E', '1F', '2F', '1G', '2G', '1H', '2H', '1I', '2I', '1J', '2J', '1K', '2K', '1L', '2L'], partidos: 72, sede: 'Varias sedes', fecha: new Date('2026-06-11T18:00:00Z') },
    { nombre: 'Dieciseisavos de final', clasificados: ['Ganadores fase de grupos y mejores terceros'], partidos: 16, sede: 'Varias sedes', fecha: new Date('2026-07-03T18:00:00Z') },
    { nombre: 'Octavos de final', clasificados: ['Ganadores dieciseisavos'], partidos: 8, sede: 'Varias sedes', fecha: new Date('2026-07-10T18:00:00Z') },
    { nombre: 'Cuartos de final', clasificados: ['Ganadores octavos'], partidos: 4, sede: 'Varias sedes', fecha: new Date('2026-07-14T18:00:00Z') },
    { nombre: 'Semifinal', clasificados: ['Ganadores cuartos'], partidos: 2, sede: 'Varias sedes', fecha: new Date('2026-07-15T19:00:00Z') },
    { nombre: 'Tercer puesto', clasificados: ['Perdedores semifinales'], partidos: 1, sede: 'Hard Rock Stadium', fecha: new Date('2026-07-18T17:00:00Z') },
    { nombre: 'Final', clasificados: ['Ganadores semifinales'], partidos: 1, sede: 'MetLife Stadium', fecha: new Date('2026-07-19T15:00:00Z') }
  ];

  // --- Inserción de catálogo (reemplaza si ya existe) ---
  await db.collection('continentes').deleteMany({});
  await db.collection('grupos').deleteMany({});
  await db.collection('estadios').deleteMany({});
  await db.collection('selecciones').deleteMany({});
  await db.collection('fase_final').deleteMany({});

  const continentIds = {};
  for (const c of continents) {
    const { insertedId } = await db.collection('continentes').insertOne({ ...c, paises: c.paises_incluidos });
    continentIds[c.nombre] = insertedId;
  }

  const groupIds = {};
  for (const g of groups) {
    const { insertedId } = await db.collection('grupos').insertOne({ nombre: g });
    groupIds[g] = insertedId;
  }

  const stadiumIds = {};
  for (const s of stadiums) {
    const { insertedId } = await db.collection('estadios').insertOne(s);
    stadiumIds[s.nombre] = insertedId;
  }

  const selectionIds = {};
  for (const s of selections) {
    const { insertedId } = await db.collection('selecciones').insertOne({
      nombre: s.nombre,
      pais: s.pais,
      continenteId: continentIds[s.continente],
      grupoId: groupIds[s.grupo],
      historia: s.historia,
      ventajas: s.ventajas,
      desventajas: s.desventajas,
      ranking: s.ranking,
      banderaUrl: s.bandera_url,
      latitud: s.geolocalizacion.latitud,
      longitud: s.geolocalizacion.longitud
    });
    selectionIds[s.nombre] = insertedId;
  }

  const faseIds = {};
  for (const f of fases) {
    const { insertedId } = await db.collection('fase_final').insertOne(f);
    faseIds[f.nombre] = insertedId;
  }

  function partido(fase, local, visitante, gl, gv, fecha, estadio) {
    return {
      faseId: faseIds[fase],
      equipo_localId: selectionIds[local],
      equipo_visitanteId: selectionIds[visitante],
      goles_local: gl,
      goles_visitante: gv,
      fecha: new Date(fecha),
      estadioId: stadiumIds[estadio],
      horario: new Date(fecha).toISOString().slice(11, 16)
    };
  }

  const faseGrupos = [
    partido('Fase de grupos', 'México', 'Senegal', 2, 1, '2026-06-11T20:00:00Z', 'Estadio Azteca'),
    partido('Fase de grupos', 'Inglaterra', 'Australia', 1, 1, '2026-06-12T18:00:00Z', 'Estadio Azteca'),
    partido('Fase de grupos', 'Estados Unidos', 'Alemania', 2, 2, '2026-06-11T18:00:00Z', 'MetLife Stadium'),
    partido('Fase de grupos', 'Marruecos', 'Japón', 0, 1, '2026-06-12T20:00:00Z', 'MetLife Stadium'),
    partido('Fase de grupos', 'Canadá', 'Francia', 4, 0, '2026-06-13T18:00:00Z', 'BC Place'),
    partido('Fase de grupos', 'Egipto', 'Irán', 2, 1, '2026-06-14T20:00:00Z', 'BC Place'),
    partido('Fase de grupos', 'Costa Rica', 'España', 1, 2, '2026-06-13T20:00:00Z', 'AT&T Stadium'),
    partido('Fase de grupos', 'Ghana', 'Catar', 0, 0, '2026-06-14T18:00:00Z', 'AT&T Stadium'),
    partido('Fase de grupos', 'Panamá', 'Portugal', 0, 3, '2026-06-15T18:00:00Z', 'Mercedes-Benz Stadium'),
    partido('Fase de grupos', 'Nigeria', 'Uzbekistán', 1, 1, '2026-06-16T18:00:00Z', 'Mercedes-Benz Stadium'),
    partido('Fase de grupos', 'Honduras', 'Países Bajos', 1, 1, '2026-06-15T20:00:00Z', 'Hard Rock Stadium'),
    partido('Fase de grupos', 'Camerún', 'Corea del Sur', 0, 2, '2026-06-16T20:00:00Z', 'Hard Rock Stadium'),
    partido('Fase de grupos', 'Jamaica', 'Bélgica', 1, 2, '2026-06-17T18:00:00Z', 'SoFi Stadium'),
    partido('Fase de grupos', 'Argelia', 'Emiratos Árabes Unidos', 0, 0, '2026-06-18T18:00:00Z', 'SoFi Stadium'),
    partido('Fase de grupos', 'El Salvador', 'Croacia', 0, 1, '2026-06-17T20:00:00Z', 'NRG Stadium'),
    partido('Fase de grupos', 'Túnez', 'Colombia', 1, 3, '2026-06-18T20:00:00Z', 'NRG Stadium'),
    partido('Fase de grupos', 'Uruguay', 'Italia', 0, 0, '2026-06-19T18:00:00Z', 'Gillette Stadium'),
    partido('Fase de grupos', 'Costa de Marfil', 'Arabia Saudita', 2, 1, '2026-06-20T18:00:00Z', 'Gillette Stadium'),
    partido('Fase de grupos', 'Ecuador', 'Suiza', 1, 2, '2026-06-19T20:00:00Z', 'Levi\'s Stadium'),
    partido('Fase de grupos', 'Escocia', 'Nueva Zelanda', 1, 1, '2026-06-20T20:00:00Z', 'Levi\'s Stadium'),
    partido('Fase de grupos', 'Perú', 'Dinamarca', 1, 3, '2026-06-21T18:00:00Z', 'BMO Field'),
    partido('Fase de grupos', 'Polonia', 'Argentina', 1, 1, '2026-06-22T18:00:00Z', 'BMO Field'),
    partido('Fase de grupos', 'Brasil', 'Gales', 0, 4, '2026-06-21T20:00:00Z', 'Estadio BBVA'),
    partido('Fase de grupos', 'Serbia', 'Austria', 1, 1, '2026-06-22T20:00:00Z', 'Estadio BBVA'),
    partido('Fase de grupos', 'México', 'Inglaterra', 0, 0, '2026-06-16T20:00:00Z', 'Estadio Azteca'),
    partido('Fase de grupos', 'Senegal', 'Australia', 1, 3, '2026-06-17T18:00:00Z', 'Estadio Azteca'),
    partido('Fase de grupos', 'Estados Unidos', 'Marruecos', 1, 0, '2026-06-16T18:00:00Z', 'MetLife Stadium'),
    partido('Fase de grupos', 'Alemania', 'Japón', 1, 1, '2026-06-17T20:00:00Z', 'MetLife Stadium'),
    partido('Fase de grupos', 'Canadá', 'Egipto', 1, 2, '2026-06-18T18:00:00Z', 'BC Place'),
    partido('Fase de grupos', 'Francia', 'Irán', 1, 1, '2026-06-19T20:00:00Z', 'BC Place'),
    partido('Fase de grupos', 'Costa Rica', 'Ghana', 2, 0, '2026-06-18T20:00:00Z', 'AT&T Stadium'),
    partido('Fase de grupos', 'España', 'Catar', 1, 2, '2026-06-19T18:00:00Z', 'AT&T Stadium'),
    partido('Fase de grupos', 'Panamá', 'Nigeria', 2, 1, '2026-06-20T18:00:00Z', 'Mercedes-Benz Stadium'),
    partido('Fase de grupos', 'Portugal', 'Uzbekistán', 2, 1, '2026-06-21T18:00:00Z', 'Mercedes-Benz Stadium'),
    partido('Fase de grupos', 'Honduras', 'Camerún', 2, 1, '2026-06-20T20:00:00Z', 'Hard Rock Stadium'),
    partido('Fase de grupos', 'Países Bajos', 'Corea del Sur', 3, 0, '2026-06-21T20:00:00Z', 'Hard Rock Stadium'),
    partido('Fase de grupos', 'Jamaica', 'Argelia', 2, 2, '2026-06-22T18:00:00Z', 'SoFi Stadium'),
    partido('Fase de grupos', 'Bélgica', 'Emiratos Árabes Unidos', 1, 3, '2026-06-23T18:00:00Z', 'SoFi Stadium'),
    partido('Fase de grupos', 'El Salvador', 'Túnez', 1, 2, '2026-06-22T20:00:00Z', 'NRG Stadium'),
    partido('Fase de grupos', 'Croacia', 'Colombia', 2, 0, '2026-06-23T20:00:00Z', 'NRG Stadium'),
    partido('Fase de grupos', 'Uruguay', 'Costa de Marfil', 1, 3, '2026-06-24T18:00:00Z', 'Gillette Stadium'),
    partido('Fase de grupos', 'Italia', 'Arabia Saudita', 0, 2, '2026-06-25T18:00:00Z', 'Gillette Stadium'),
    partido('Fase de grupos', 'Ecuador', 'Escocia', 0, 1, '2026-06-24T20:00:00Z', 'Levi\'s Stadium'),
    partido('Fase de grupos', 'Suiza', 'Nueva Zelanda', 2, 2, '2026-06-25T20:00:00Z', 'Levi\'s Stadium'),
    partido('Fase de grupos', 'Perú', 'Polonia', 2, 2, '2026-06-26T18:00:00Z', 'BMO Field'),
    partido('Fase de grupos', 'Dinamarca', 'Argentina', 0, 1, '2026-06-27T18:00:00Z', 'BMO Field'),
    partido('Fase de grupos', 'Brasil', 'Serbia', 2, 0, '2026-06-26T20:00:00Z', 'Estadio BBVA'),
    partido('Fase de grupos', 'Gales', 'Austria', 1, 2, '2026-06-27T20:00:00Z', 'Estadio BBVA')
  ];

  const dieciseisavos = [
    partido('Dieciseisavos de final', 'México', 'Australia', 2, 0, '2026-07-03T18:00:00Z', 'Estadio Azteca'),
    partido('Dieciseisavos de final', 'Inglaterra', 'Senegal', 2, 1, '2026-07-03T22:00:00Z', 'Estadio Azteca'),
    partido('Dieciseisavos de final', 'Estados Unidos', 'Francia', 1, 2, '2026-07-04T18:00:00Z', 'MetLife Stadium'),
    partido('Dieciseisavos de final', 'Alemania', 'Egipto', 1, 1, '2026-07-04T22:00:00Z', 'MetLife Stadium'),
    partido('Dieciseisavos de final', 'Canadá', 'Irán', 1, 0, '2026-07-05T18:00:00Z', 'BC Place'),
    partido('Dieciseisavos de final', 'Japón', 'Marruecos', 1, 1, '2026-07-05T22:00:00Z', 'BC Place'),
    partido('Dieciseisavos de final', 'Costa Rica', 'Portugal', 0, 3, '2026-07-06T18:00:00Z', 'AT&T Stadium'),
    partido('Dieciseisavos de final', 'España', 'Nigeria', 3, 0, '2026-07-06T22:00:00Z', 'AT&T Stadium'),
    partido('Dieciseisavos de final', 'Países Bajos', 'Uzbekistán', 2, 0, '2026-07-07T18:00:00Z', 'Hard Rock Stadium'),
    partido('Dieciseisavos de final', 'Camerún', 'Corea del Sur', 0, 1, '2026-07-07T22:00:00Z', 'Hard Rock Stadium'),
    partido('Dieciseisavos de final', 'Argelia', 'Bélgica', 1, 3, '2026-07-08T18:00:00Z', 'NRG Stadium'),
    partido('Dieciseisavos de final', 'Emiratos Árabes Unidos', 'Colombia', 0, 2, '2026-07-08T22:00:00Z', 'NRG Stadium'),
    partido('Dieciseisavos de final', 'Croacia', 'Costa de Marfil', 1, 0, '2026-07-09T18:00:00Z', 'Gillette Stadium'),
    partido('Dieciseisavos de final', 'Túnez', 'Arabia Saudita', 0, 1, '2026-07-09T22:00:00Z', 'Gillette Stadium'),
    partido('Dieciseisavos de final', 'Argentina', 'Polonia', 1, 0, '2026-07-10T18:00:00Z', 'SoFi Stadium'),
    partido('Dieciseisavos de final', 'Brasil', 'Austria', 2, 0, '2026-07-10T22:00:00Z', 'SoFi Stadium')
  ];

  const octavos = [
    partido('Octavos de final', 'México', 'Inglaterra', 0, 2, '2026-07-11T18:00:00Z', 'Estadio Azteca'),
    partido('Octavos de final', 'Francia', 'Alemania', 2, 0, '2026-07-11T22:00:00Z', 'Estadio Azteca'),
    partido('Octavos de final', 'Canadá', 'Japón', 1, 1, '2026-07-12T18:00:00Z', 'MetLife Stadium'),
    partido('Octavos de final', 'Portugal', 'España', 1, 2, '2026-07-12T22:00:00Z', 'MetLife Stadium'),
    partido('Octavos de final', 'Países Bajos', 'Corea del Sur', 2, 1, '2026-07-13T18:00:00Z', 'Hard Rock Stadium'),
    partido('Octavos de final', 'Bélgica', 'Colombia', 3, 1, '2026-07-13T22:00:00Z', 'Hard Rock Stadium'),
    partido('Octavos de final', 'Croacia', 'Arabia Saudita', 1, 0, '2026-07-14T18:00:00Z', 'Gillette Stadium'),
    partido('Octavos de final', 'Argentina', 'Brasil', 1, 1, '2026-07-14T22:00:00Z', 'Gillette Stadium')
  ];

  const cuartos = [
    partido('Cuartos de final', 'Inglaterra', 'Francia', 1, 2, '2026-07-15T18:00:00Z', 'AT&T Stadium'),
    partido('Cuartos de final', 'Canadá', 'España', 1, 3, '2026-07-15T22:00:00Z', 'AT&T Stadium'),
    partido('Cuartos de final', 'Países Bajos', 'Bélgica', 1, 2, '2026-07-16T18:00:00Z', 'NRG Stadium'),
    partido('Cuartos de final', 'Croacia', 'Argentina', 0, 2, '2026-07-16T22:00:00Z', 'NRG Stadium')
  ];

  const todos = [...faseGrupos, ...dieciseisavos, ...octavos, ...cuartos];
  await db.collection('partidos').insertMany(todos);

  // --- Recalcular tablas de posiciones (fase de grupos) ---
  const groupMatches = faseGrupos;
  const statsByTeam = new Map();
  const ensureTeam = (id) => {
    const key = id.toString();
    if (!statsByTeam.has(key)) {
      statsByTeam.set(key, { _id: id, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dg: 0, pts: 0 });
    }
    return statsByTeam.get(key);
  };

  for (const m of groupMatches) {
    const local = ensureTeam(m.equipo_localId);
    const visitante = ensureTeam(m.equipo_visitanteId);
    const gl = Number(m.goles_local || 0);
    const gv = Number(m.goles_visitante || 0);
    local.pj += 1; visitante.pj += 1;
    local.gf += gl; local.gc += gv;
    visitante.gf += gv; visitante.gc += gl;
    local.dg = local.gf - local.gc;
    visitante.dg = visitante.gf - visitante.gc;
    if (gl > gv) { local.pg += 1; local.pts += 3; visitante.pp += 1; }
    else if (gl < gv) { visitante.pg += 1; visitante.pts += 3; local.pp += 1; }
    else { local.pe += 1; visitante.pe += 1; local.pts += 1; visitante.pts += 1; }
  }

  const seleccionIds = Array.from(statsByTeam.keys()).map((id) => new ObjectId(id));
  const selecciones = await db.collection('selecciones').find({ _id: { $in: seleccionIds } }).project({ grupoId: 1 }).toArray();
  const grupoMap = new Map(selecciones.map((s) => [s._id.toString(), s.grupoId]));

  const docs = [];
  for (const [key, stats] of statsByTeam.entries()) {
    const grupoId = grupoMap.get(key);
    docs.push({
      grupoId: grupoId ? new ObjectId(grupoId) : null,
      seleccionId: new ObjectId(key),
      pj: stats.pj, pg: stats.pg, pe: stats.pe, pp: stats.pp,
      gf: stats.gf, gc: stats.gc, dg: stats.dg, pts: stats.pts
    });
  }
  if (docs.length > 0) {
    await db.collection('clasificaciones').insertMany(docs);
  }

  console.log('Base de datos poblada y actualizada al 16 de julio de 2026.');
  console.log('Partidos insertados:', todos.length);
  console.log('Clasificaciones recalculadas:', docs.length, 'equipos');
}

main().catch((err) => {
  console.error('Error poblando la base de datos:', err);
  process.exit(1);
}).finally(async () => {
  await client.close();
});

import { MongoClient } from 'mongodb';

const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'mundial2026';

const continents = [
  { nombre: 'Europa', confederacion: 'UEFA', paises: ['Francia', 'Alemania', 'España', 'Inglaterra'] },
  { nombre: 'América', confederacion: 'CONMEBOL', paises: ['Brasil', 'Argentina', 'Uruguay', 'Colombia'] },
  { nombre: 'Norteamérica', confederacion: 'CONCACAF', paises: ['México', 'Estados Unidos', 'Canadá', 'Costa Rica'] },
  { nombre: 'África', confederacion: 'CAF', paises: ['Senegal', 'Marruecos', 'Egipto', 'Ghana'] },
  { nombre: 'Asia', confederacion: 'AFC', paises: ['Japón', 'Corea del Sur', 'Arabia Saudita', 'Irán'] },
  { nombre: 'Oceanía', confederacion: 'OFC', paises: ['Nueva Zelanda'] }
];

const groups = [
  { nombre: 'A', fase: 'Fase de grupos' },
  { nombre: 'B', fase: 'Fase de grupos' },
  { nombre: 'C', fase: 'Fase de grupos' },
  { nombre: 'D', fase: 'Fase de grupos' },
  { nombre: 'E', fase: 'Fase de grupos' },
  { nombre: 'F', fase: 'Fase de grupos' }
];

const stadiums = [
  { nombre: 'Estadio Azteca', ciudad: 'Ciudad de México', pais: 'México', latitud: 19.302861, longitud: -99.150527, capacidad: 87000 },
  { nombre: 'MetLife Stadium', ciudad: 'East Rutherford', pais: 'Estados Unidos', latitud: 40.81284, longitud: -74.074208, capacidad: 82500 },
  { nombre: 'BC Place', ciudad: 'Vancouver', pais: 'Canadá', latitud: 49.2777, longitud: -123.1087, capacidad: 54000 }
];

const finalPhases = [
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
  { nombre: 'Estados Unidos', pais: 'Estados Unidos', continente: 'Norteamérica', historia: 'Potencia emergente', ventajas: 'Recursos', desventajas: 'Presión mediática', ranking: 12, banderaUrl: 'https://example.com/usa.png', latitud: 38.907192, longitud: -77.036871, grupo: 'A' },
  { nombre: 'Canadá', pais: 'Canadá', continente: 'Norteamérica', historia: 'Crecimiento constante', ventajas: 'Organización', desventajas: 'Menor experiencia', ranking: 50, banderaUrl: 'https://example.com/canada.png', latitud: 45.42153, longitud: -75.697193, grupo: 'A' },
  { nombre: 'Costa Rica', pais: 'Costa Rica', continente: 'Norteamérica', historia: 'Equipo sólido', ventajas: 'Resistencia', desventajas: 'Menos recursos', ranking: 30, banderaUrl: 'https://example.com/costarica.png', latitud: 9.748917, longitud: -83.753428, grupo: 'A' },
  { nombre: 'Brasil', pais: 'Brasil', continente: 'América', historia: 'Cinco veces campeón', ventajas: 'Talento individual', desventajas: 'Presión histórica', ranking: 1, banderaUrl: 'https://example.com/brasil.png', latitud: -15.793889, longitud: -47.882778, grupo: 'B' },
  { nombre: 'Argentina', pais: 'Argentina', continente: 'América', historia: 'Campeón reciente', ventajas: 'Estilo ofensivo', desventajas: 'Lesiones', ranking: 2, banderaUrl: 'https://example.com/argentina.png', latitud: -34.603722, longitud: -58.381592, grupo: 'B' },
  { nombre: 'Uruguay', pais: 'Uruguay', continente: 'América', historia: 'Ganador histórico', ventajas: 'Fuerza grupal', desventajas: 'Poca rotación', ranking: 17, banderaUrl: 'https://example.com/uruguay.png', latitud: -34.901112, longitud: -56.164532, grupo: 'B' },
  { nombre: 'Colombia', pais: 'Colombia', continente: 'América', historia: 'Juego técnico', ventajas: 'Velocidad', desventajas: 'Consistencia', ranking: 14, banderaUrl: 'https://example.com/colombia.png', latitud: 4.711, longitud: -74.0721, grupo: 'B' },
  { nombre: 'Francia', pais: 'Francia', continente: 'Europa', historia: 'Campeón mundial', ventajas: 'Talento joven', desventajas: 'Presión mental', ranking: 3, banderaUrl: 'https://example.com/francia.png', latitud: 48.856613, longitud: 2.352222, grupo: 'C' },
  { nombre: 'Alemania', pais: 'Alemania', continente: 'Europa', historia: 'Fuerza táctica', ventajas: 'Organización', desventajas: 'Reestructuración', ranking: 4, banderaUrl: 'https://example.com/alemania.png', latitud: 52.520008, longitud: 13.404954, grupo: 'C' },
  { nombre: 'España', pais: 'España', continente: 'Europa', historia: 'Juego de posesión', ventajas: 'Control de balón', desventajas: 'Presión alta', ranking: 6, banderaUrl: 'https://example.com/espana.png', latitud: 40.416775, longitud: -3.70379, grupo: 'C' },
  { nombre: 'Inglaterra', pais: 'Inglaterra', continente: 'Europa', historia: 'Tradición histórica', ventajas: 'Jugadores de élite', desventajas: 'Expectativa', ranking: 5, banderaUrl: 'https://example.com/inglaterra.png', latitud: 51.507351, longitud: -0.127758, grupo: 'C' },
  { nombre: 'Senegal', pais: 'Senegal', continente: 'África', historia: 'Equipo rápido', ventajas: 'Atléticos', desventajas: 'Falta de profundidad', ranking: 20, banderaUrl: 'https://example.com/senegal.png', latitud: 14.497401, longitud: -14.452362, grupo: 'D' },
  { nombre: 'Marruecos', pais: 'Marruecos', continente: 'África', historia: 'Buena defensa', ventajas: 'Solidaridad', desventajas: 'Presión física', ranking: 22, banderaUrl: 'https://example.com/marruecos.png', latitud: 31.630000, longitud: -8.008889, grupo: 'D' },
  { nombre: 'Egipto', pais: 'Egipto', continente: 'África', historia: 'Buen técnico', ventajas: 'Velocidad', desventajas: 'Falta de experiencia', ranking: 45, banderaUrl: 'https://example.com/egipto.png', latitud: 30.04442, longitud: 31.235712, grupo: 'D' },
  { nombre: 'Ghana', pais: 'Ghana', continente: 'África', historia: 'Fuerza física', ventajas: 'Atletismo', desventajas: 'Menos técnica', ranking: 60, banderaUrl: 'https://example.com/ghana.png', latitud: 5.603716, longitud: -0.186964, grupo: 'D' },
  { nombre: 'Japón', pais: 'Japón', continente: 'Asia', historia: 'Máquina organizada', ventajas: 'Disciplina', desventajas: 'Menor físico', ranking: 24, banderaUrl: 'https://example.com/japon.png', latitud: 35.6762, longitud: 139.6503, grupo: 'E' },
  { nombre: 'Corea del Sur', pais: 'Corea del Sur', continente: 'Asia', historia: 'Velocidad ofensiva', ventajas: 'Técnica rápida', desventajas: 'Defensa débil', ranking: 28, banderaUrl: 'https://example.com/corea.png', latitud: 37.5665, longitud: 126.978, grupo: 'E' },
  { nombre: 'Arabia Saudita', pais: 'Arabia Saudita', continente: 'Asia', historia: 'Crece en Asia', ventajas: 'Resistencia', desventajas: 'Menor experiencia', ranking: 55, banderaUrl: 'https://example.com/arabia.png', latitud: 24.7136, longitud: 46.6753, grupo: 'E' },
  { nombre: 'Irán', pais: 'Irán', continente: 'Asia', historia: 'Juega compacto', ventajas: 'Bloque defensivo', desventajas: 'Creatividad limitada', ranking: 34, banderaUrl: 'https://example.com/iran.png', latitud: 35.6892, longitud: 51.3890, grupo: 'E' },
  { nombre: 'Australia', pais: 'Australia', continente: 'Asia', historia: 'Fuerte físico', ventajas: 'Velocidad aérea', desventajas: 'Viajes largos', ranking: 20, banderaUrl: 'https://example.com/australia.png', latitud: -33.868820, longitud: 151.209296, grupo: 'F' },
  { nombre: 'Nueva Zelanda', pais: 'Nueva Zelanda', continente: 'Oceanía', historia: 'Equipo ordenado', ventajas: 'Comunicación', desventajas: 'Menos nivel global', ranking: 100, banderaUrl: 'https://example.com/nz.png', latitud: -36.848460, longitud: 174.763332, grupo: 'F' },
  { nombre: 'Catar', pais: 'Catar', continente: 'Asia', historia: 'Organizador 2022', ventajas: 'Infraestructura', desventajas: 'Poca tradición', ranking: 40, banderaUrl: 'https://example.com/catar.png', latitud: 25.354826, longitud: 51.183884, grupo: 'F' },
  { nombre: 'Emiratos Árabes', pais: 'Emiratos Árabes Unidos', continente: 'Asia', historia: 'Recursos altos', ventajas: 'Organización', desventajas: 'Menos experiencia', ranking: 70, banderaUrl: 'https://example.com/uae.png', latitud: 25.276987, longitud: 55.296249, grupo: 'F' }
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

    const selectionResult = await db.collection('selecciones').insertMany(selectionsToInsert);

    const selectionByName = {};
    const selectionIds = [];
    const selectionDocs = Object.values(selectionResult.insertedIds);
    for (let i = 0; i < selections.length; i++) {
      selectionByName[selections[i].nombre] = selectionResult.insertedIds[i];
      selectionIds.push(selectionResult.insertedIds[i]);
    }

    const matches = [
      { fase: 'Fase de grupos', equipo_local: 'México', equipo_visitante: 'Estados Unidos', goles_local: 2, goles_visitante: 1, fecha: new Date('2026-06-12T20:00:00Z'), estadio: 'Estadio Azteca', horario: '20:00' },
      { fase: 'Fase de grupos', equipo_local: 'Canadá', equipo_visitante: 'Costa Rica', goles_local: 0, goles_visitante: 1, fecha: new Date('2026-06-13T18:00:00Z'), estadio: 'Estadio Azteca', horario: '18:00' },
      { fase: 'Fase de grupos', equipo_local: 'Brasil', equipo_visitante: 'Argentina', goles_local: 1, goles_visitante: 2, fecha: new Date('2026-06-14T21:00:00Z'), estadio: 'MetLife Stadium', horario: '21:00' },
      { fase: 'Fase de grupos', equipo_local: 'Uruguay', equipo_visitante: 'Colombia', goles_local: 0, goles_visitante: 0, fecha: new Date('2026-06-15T19:00:00Z'), estadio: 'MetLife Stadium', horario: '19:00' },
      { fase: 'Fase de grupos', equipo_local: 'Francia', equipo_visitante: 'Alemania', goles_local: 3, goles_visitante: 1, fecha: new Date('2026-06-16T20:00:00Z'), estadio: 'BC Place', horario: '20:00' },
      { fase: 'Fase de grupos', equipo_local: 'España', equipo_visitante: 'Inglaterra', goles_local: 2, goles_visitante: 2, fecha: new Date('2026-06-17T18:00:00Z'), estadio: 'BC Place', horario: '18:00' },
      { fase: 'Fase de grupos', equipo_local: 'Senegal', equipo_visitante: 'Marruecos', goles_local: 1, goles_visitante: 0, fecha: new Date('2026-06-18T20:00:00Z'), estadio: 'Estadio Azteca', horario: '20:00' },
      { fase: 'Fase de grupos', equipo_local: 'Egipto', equipo_visitante: 'Ghana', goles_local: 1, goles_visitante: 1, fecha: new Date('2026-06-19T18:00:00Z'), estadio: 'Estadio Azteca', horario: '18:00' },
      { fase: 'Fase de grupos', equipo_local: 'Japón', equipo_visitante: 'Corea del Sur', goles_local: 0, goles_visitante: 1, fecha: new Date('2026-06-20T20:00:00Z'), estadio: 'MetLife Stadium', horario: '20:00' },
      { fase: 'Fase de grupos', equipo_local: 'Arabia Saudita', equipo_visitante: 'Irán', goles_local: 2, goles_visitante: 0, fecha: new Date('2026-06-21T18:00:00Z'), estadio: 'MetLife Stadium', horario: '18:00' },
      { fase: 'Fase de grupos', equipo_local: 'Australia', equipo_visitante: 'Nueva Zelanda', goles_local: 1, goles_visitante: 1, fecha: new Date('2026-06-22T20:00:00Z'), estadio: 'BC Place', horario: '20:00' },
      { fase: 'Fase de grupos', equipo_local: 'Catar', equipo_visitante: 'Emiratos Árabes', goles_local: 0, goles_visitante: 2, fecha: new Date('2026-06-23T18:00:00Z'), estadio: 'BC Place', horario: '18:00' }
    ];

    const stadiumByName = {};
    stadiums.forEach((stadium, index) => {
      stadiumByName[stadium.nombre] = stadiumResult.insertedIds[index];
    });

    const phaseByName = {};
    finalPhases.forEach((phase, index) => {
      phaseByName[phase.nombre] = phaseResult.insertedIds[index];
    });

    const matchesToInsert = matches.map(match => ({
      faseId: phaseByName['Dieciseisavos de final'],
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

    const classifications = selections.map((selection, index) => {
      const pg = (index % 3) + 1;
      const pe = index % 2;
      const pp = 3 - pg - pe;
      const gf = pg * 2 + 1;
      const gc = pp * 2 + 1;
      const dg = gf - gc;
      const pts = pg * 3 + pe;
      return {
        grupoId: groupByName[selection.grupo],
        seleccionId: selectionByName[selection.nombre],
        pj: 3,
        pg,
        pe,
        pp: Math.max(0, pp),
        gf,
        gc,
        dg,
        pts
      };
    });

    await db.collection('clasificaciones').insertMany(classifications);

    console.log('Datos de ejemplo insertados correctamente.');
  } catch (error) {
    console.error('Error al insertar datos:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();

import { MongoClient } from 'mongodb';
import crypto from 'crypto';

const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'mundial2026';

const continents = [
  { nombre: 'América', confederacion: 'CONMEBOL', paises_incluidos: ['Argentina', 'Brasil', 'Colombia', 'Paraguay', 'Uruguay', 'Ecuador', 'Curazao', 'Panamá'] },
  { nombre: 'Norteamérica', confederacion: 'CONCACAF', paises_incluidos: ['México', 'Estados Unidos', 'Canadá', 'Bosnia y Herzegovina', 'Turquía'] },
  { nombre: 'Europa', confederacion: 'UEFA', paises_incluidos: ['Inglaterra', 'Alemania', 'Francia', 'España', 'Portugal', 'Países Bajos', 'Bélgica', 'Croacia', 'Suiza', 'Escocia', 'Austria', 'Noruega', 'Suecia', 'Turquía'] },
  { nombre: 'África', confederacion: 'CAF', paises_incluidos: ['Sudáfrica', 'Marruecos', 'Egipto', 'Ghana', 'Senegal', 'Argelia', 'Túnez', 'Costa de Marfil', 'RD del Congo', 'Cabo Verde', 'Nigeria'] },
  { nombre: 'Asia', confederacion: 'AFC', paises_incluidos: ['Corea del Sur', 'Japón', 'Uzbekistán', 'Arabia Saudita', 'Australia', 'Catar', 'Irán', 'Jordania', 'Irak'] },
  { nombre: 'Oceanía', confederacion: 'OFC', paises_incluidos: ['Nueva Zelanda'] }
];

const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'].map((nombre) => ({ nombre }));

const stadiums = [
  { nombre: 'Estadio Azteca', ciudad: 'Ciudad de México', pais: 'México', latitud: 19.302861, longitud: -99.150527, capacidad: 87000 },
  { nombre: 'Estadio Akron', ciudad: 'Zapopan', pais: 'México', latitud: 20.6868, longitud: -103.3918, capacidad: 49211 },
  { nombre: 'Mercedes-Benz Stadium', ciudad: 'Atlanta', pais: 'Estados Unidos', latitud: 33.755, longitud: -84.4008, capacidad: 71000 },
  { nombre: 'Estadio BBVA', ciudad: 'Monterrey', pais: 'México', latitud: 25.6824, longitud: -100.3097, capacidad: 53152 },
  { nombre: 'BMO Field', ciudad: 'Toronto', pais: 'Canadá', latitud: 43.6335, longitud: -79.3987, capacidad: 30000 },
  { nombre: 'Levi\'s Stadium', ciudad: 'Santa Clara', pais: 'Estados Unidos', latitud: 37.4030, longitud: -121.9696, capacidad: 68200 },
  { nombre: 'SoFi Stadium', ciudad: 'Inglewood', pais: 'Estados Unidos', latitud: 33.9535, longitud: -118.3392, capacidad: 70000 },
  { nombre: 'BC Place', ciudad: 'Vancouver', pais: 'Canadá', latitud: 49.2777, longitud: -123.1089, capacidad: 54000 },
  { nombre: 'Gillette Stadium', ciudad: 'Foxborough', pais: 'Estados Unidos', latitud: 42.0909, longitud: -71.2643, capacidad: 65878 },
  { nombre: 'Lincoln Financial Field', ciudad: 'Filadelfia', pais: 'Estados Unidos', latitud: 39.9008, longitud: -75.1675, capacidad: 68869 },
  { nombre: 'Hard Rock Stadium', ciudad: 'Miami Gardens', pais: 'Estados Unidos', latitud: 25.9580, longitud: -80.2389, capacidad: 65000 },
  { nombre: 'NRG Stadium', ciudad: 'Houston', pais: 'Estados Unidos', latitud: 29.6847, longitud: -95.4107, capacidad: 72000 },
  { nombre: 'Arrowhead Stadium', ciudad: 'Kansas City', pais: 'Estados Unidos', latitud: 39.0490, longitud: -94.4839, capacidad: 76416 },
  { nombre: 'AT&T Stadium', ciudad: 'Arlington', pais: 'Estados Unidos', latitud: 32.7473, longitud: -97.0945, capacidad: 80000 },
  { nombre: 'Lumen Field', ciudad: 'Seattle', pais: 'Estados Unidos', latitud: 47.5952, longitud: -122.3316, capacidad: 68000 },
  { nombre: 'MetLife Stadium', ciudad: 'East Rutherford', pais: 'Estados Unidos', latitud: 40.8135, longitud: -74.0744, capacidad: 82500 }
];

const selections = [
  { nombre: 'México', continente: 'Norteamérica', grupo: 'A', historia: 'Gran tradición mundialista', ventajas: 'Afición local', desventajas: 'Presión alta', ranking: 15, banderaUrl: 'https://flagcdn.com/w80/mx.png', latitud: 19.432608, longitud: -99.133209 },
  { nombre: 'Sudáfrica', continente: 'África', grupo: 'A', historia: 'Equipo físico y ordenado', ventajas: 'Fuerza colectiva', desventajas: 'Poca profundidad', ranking: 45, banderaUrl: 'https://flagcdn.com/w80/za.png', latitud: -26.204103, longitud: 28.047305 },
  { nombre: 'Corea del Sur', continente: 'Asia', grupo: 'A', historia: 'Tradición táctica y rápida', ventajas: 'Disciplina', desventajas: 'Falta de potencia', ranking: 28, banderaUrl: 'https://flagcdn.com/w80/kr.png', latitud: 37.5665, longitud: 126.978 },
  { nombre: 'Chequia', continente: 'Europa', grupo: 'A', historia: 'Equipo europeo compacto', ventajas: 'Disciplina defensiva', desventajas: 'Menos talento individual', ranking: 35, banderaUrl: 'https://flagcdn.com/w80/cz.png', latitud: 49.8175, longitud: 15.4730 },
  { nombre: 'Canadá', continente: 'Norteamérica', grupo: 'B', historia: 'Crecimiento histórico', ventajas: 'Organización y juventud', desventajas: 'Menos experiencia', ranking: 33, banderaUrl: 'https://flagcdn.com/w80/ca.png', latitud: 45.42153, longitud: -75.697193 },
  { nombre: 'Bosnia y Herzegovina', continente: 'Europa', grupo: 'B', historia: 'Talento físico y resistente', ventajas: 'Defensa compacta', desventajas: 'Consistencia', ranking: 40, banderaUrl: 'https://flagcdn.com/w80/ba.png', latitud: 43.8563, longitud: 18.4131 },
  { nombre: 'Catar', continente: 'Asia', grupo: 'B', historia: 'Equipo con experiencia reciente', ventajas: 'Organización', desventajas: 'Falta de historia', ranking: 60, banderaUrl: 'https://flagcdn.com/w80/qa.png', latitud: 25.354826, longitud: 51.183884 },
  { nombre: 'Suiza', continente: 'Europa', grupo: 'B', historia: 'Equipo disciplinado europeo', ventajas: 'Orden defensivo', desventajas: 'Poca chispa ofensiva', ranking: 13, banderaUrl: 'https://flagcdn.com/w80/ch.png', latitud: 46.8182, longitud: 8.2275 },
  { nombre: 'Brasil', continente: 'América', grupo: 'C', historia: 'Cinco veces campeón', ventajas: 'Talento ofensivo', desventajas: 'Presión enorme', ranking: 2, banderaUrl: 'https://flagcdn.com/w80/br.png', latitud: -15.793889, longitud: -47.882778 },
  { nombre: 'Marruecos', continente: 'África', grupo: 'C', historia: 'Fuerte defensa y ritmo africano', ventajas: 'Disciplina', desventajas: 'Poca profundidad', ranking: 21, banderaUrl: 'https://flagcdn.com/w80/ma.png', latitud: 31.63, longitud: -8.008889 },
  { nombre: 'Haití', continente: 'Norteamérica', grupo: 'C', historia: 'Selección combativa', ventajas: 'Velocidad', desventajas: 'Falta de experiencia', ranking: 88, banderaUrl: 'https://flagcdn.com/w80/ht.png', latitud: 18.5944, longitud: -72.3074 },
  { nombre: 'Escocia', continente: 'Europa', grupo: 'C', historia: 'Tradición británica', ventajas: 'Físico', desventajas: 'Menos técnica', ranking: 50, banderaUrl: 'https://flagcdn.com/w80/gb-sct.png', latitud: 56.4907, longitud: -4.2026 },
  { nombre: 'Estados Unidos', continente: 'Norteamérica', grupo: 'D', historia: 'Selección local con aspiraciones altas', ventajas: 'Fuerza física', desventajas: 'Tiempos de presión', ranking: 14, banderaUrl: 'https://flagcdn.com/w80/us.png', latitud: 38.9072, longitud: -77.0369 },
  { nombre: 'Paraguay', continente: 'América', grupo: 'D', historia: 'Equipo combativo sudamericano', ventajas: 'Defensa cerrada', desventajas: 'Pocos goleadores', ranking: 48, banderaUrl: 'https://flagcdn.com/w80/py.png', latitud: -25.26374, longitud: -57.57593 },
  { nombre: 'Australia', continente: 'Asia', grupo: 'D', historia: 'Equipo con presencia en Asia', ventajas: 'Físico', desventajas: 'Menor experiencia', ranking: 27, banderaUrl: 'https://flagcdn.com/w80/au.png', latitud: -35.2809, longitud: 149.1300 },
  { nombre: 'Turquía', continente: 'Europa', grupo: 'D', historia: 'Perfil europeo clásico', ventajas: 'Técnica y ritmo', desventajas: 'Inconstancia', ranking: 30, banderaUrl: 'https://flagcdn.com/w80/tr.png', latitud: 39.9334, longitud: 32.8597 },
  { nombre: 'Alemania', continente: 'Europa', grupo: 'E', historia: 'Tradición táctica', ventajas: 'Organización', desventajas: 'Reestructuración', ranking: 6, banderaUrl: 'https://flagcdn.com/w80/de.png', latitud: 52.520008, longitud: 13.404954 },
  { nombre: 'Curazao', continente: 'Norteamérica', grupo: 'E', historia: 'Selección caribeña talentosa', ventajas: 'Creatividad', desventajas: 'Menor profundidad', ranking: 70, banderaUrl: 'https://flagcdn.com/w80/cw.png', latitud: 12.1696, longitud: -68.9900 },
  { nombre: 'Costa de Marfil', continente: 'África', grupo: 'E', historia: 'Fuerza africana', ventajas: 'Velocidad', desventajas: 'Técnica inconsistente', ranking: 42, banderaUrl: 'https://flagcdn.com/w80/ci.png', latitud: 7.539989, longitud: -5.54708 },
  { nombre: 'Ecuador', continente: 'América', grupo: 'E', historia: 'Juego físico de altura', ventajas: 'Resistencia', desventajas: 'Defensa abierta', ranking: 30, banderaUrl: 'https://flagcdn.com/w80/ec.png', latitud: -0.1807, longitud: -78.4678 },
  { nombre: 'Países Bajos', continente: 'Europa', grupo: 'F', historia: 'Fútbol total moderno', ventajas: 'Ofensiva', desventajas: 'Defensa variable', ranking: 9, banderaUrl: 'https://flagcdn.com/w80/nl.png', latitud: 52.1326, longitud: 5.2913 },
  { nombre: 'Japón', continente: 'Asia', grupo: 'F', historia: 'Máquina organizada', ventajas: 'Disciplina', desventajas: 'Falta potencia', ranking: 24, banderaUrl: 'https://flagcdn.com/w80/jp.png', latitud: 35.6762, longitud: 139.6503 },
  { nombre: 'Suecia', continente: 'Europa', grupo: 'F', historia: 'Selección de ritmo alto', ventajas: 'Técnica', desventajas: 'Menos profundidad', ranking: 26, banderaUrl: 'https://flagcdn.com/w80/se.png', latitud: 59.3293, longitud: 18.0686 },
  { nombre: 'Túnez', continente: 'África', grupo: 'F', historia: 'Competidor norteafricano', ventajas: 'Disciplina', desventajas: 'Plantilla corta', ranking: 35, banderaUrl: 'https://flagcdn.com/w80/tn.png', latitud: 36.8065, longitud: 10.1815 },
  { nombre: 'Bélgica', continente: 'Europa', grupo: 'G', historia: 'Talento ofensivo', ventajas: 'Calidad individual', desventajas: 'Inconsistencia', ranking: 10, banderaUrl: 'https://flagcdn.com/w80/be.png', latitud: 50.8503, longitud: 4.3517 },
  { nombre: 'Egipto', continente: 'África', grupo: 'G', historia: 'Tradición africana', ventajas: 'Físico', desventajas: 'Defensa irregular', ranking: 34, banderaUrl: 'https://flagcdn.com/w80/eg.png', latitud: 30.0444, longitud: 31.2357 },
  { nombre: 'Irán', continente: 'Asia', grupo: 'G', historia: 'Orden defensivo', ventajas: 'Resistencia', desventajas: 'Menos creatividad', ranking: 20, banderaUrl: 'https://flagcdn.com/w80/ir.png', latitud: 35.6892, longitud: 51.3890 },
  { nombre: 'Nueva Zelanda', continente: 'Oceanía', grupo: 'G', historia: 'Equipo valiente', ventajas: 'Trabajo colectivo', desventajas: 'Menor experiencia', ranking: 72, banderaUrl: 'https://flagcdn.com/w80/nz.png', latitud: -41.2865, longitud: 174.7762 },
  { nombre: 'España', continente: 'Europa', grupo: 'H', historia: 'Juego de posesión', ventajas: 'Control del balón', desventajas: 'Presión alta', ranking: 7, banderaUrl: 'https://flagcdn.com/w80/es.png', latitud: 40.416775, longitud: -3.70379 },
  { nombre: 'Cabo Verde', continente: 'África', grupo: 'H', historia: 'Revelación africana', ventajas: 'Velocidad', desventajas: 'Poca experiencia', ranking: 63, banderaUrl: 'https://flagcdn.com/w80/cv.png', latitud: 14.933, longitud: -23.5133 },
  { nombre: 'Arabia Saudita', continente: 'Asia', grupo: 'H', historia: 'Contendiente asiático', ventajas: 'Físico', desventajas: 'Falta creatividad', ranking: 54, banderaUrl: 'https://flagcdn.com/w80/sa.png', latitud: 24.6877, longitud: 46.7219 },
  { nombre: 'Uruguay', continente: 'América', grupo: 'H', historia: 'Tradición sudamericana', ventajas: 'Defensa férrea', desventajas: 'Plantilla limitada', ranking: 22, banderaUrl: 'https://flagcdn.com/w80/uy.png', latitud: -34.9011, longitud: -56.1645 },
  { nombre: 'Francia', continente: 'Europa', grupo: 'I', historia: 'Potencia mundial', ventajas: 'Talento individual', desventajas: 'Inconstancia', ranking: 3, banderaUrl: 'https://flagcdn.com/w80/fr.png', latitud: 48.8566, longitud: 2.3522 },
  { nombre: 'Senegal', continente: 'África', grupo: 'I', historia: 'Ritmo africano intenso', ventajas: 'Velocidad', desventajas: 'Defensa irregular', ranking: 18, banderaUrl: 'https://flagcdn.com/w80/sn.png', latitud: 14.4974, longitud: -14.4524 },
  { nombre: 'Irak', continente: 'Asia', grupo: 'I', historia: 'Equipo combativo', ventajas: 'Resistencia', desventajas: 'Menor profundidad', ranking: 70, banderaUrl: 'https://flagcdn.com/w80/iq.png', latitud: 33.3152, longitud: 44.3661 },
  { nombre: 'Noruega', continente: 'Europa', grupo: 'I', historia: 'Selección rápida', ventajas: 'Velocidad', desventajas: 'Defensa inconsistente', ranking: 31, banderaUrl: 'https://flagcdn.com/w80/no.png', latitud: 60.472, longitud: 8.4689 },
  { nombre: 'Argentina', continente: 'América', grupo: 'J', historia: 'Campeón tradicional', ventajas: 'Talento individual', desventajas: 'Presión', ranking: 1, banderaUrl: 'https://flagcdn.com/w80/ar.png', latitud: -34.6037, longitud: -58.3816 },
  { nombre: 'Argelia', continente: 'África', grupo: 'J', historia: 'Fuerza africana', ventajas: 'Velocidad', desventajas: 'Defensa irregular', ranking: 41, banderaUrl: 'https://flagcdn.com/w80/dz.png', latitud: 36.7538, longitud: 3.0588 },
  { nombre: 'Austria', continente: 'Europa', grupo: 'J', historia: 'Juego técnico', ventajas: 'Clase colectiva', desventajas: 'Poca profundidad', ranking: 24, banderaUrl: 'https://flagcdn.com/w80/at.png', latitud: 47.5162, longitud: 14.5501 },
  { nombre: 'Jordania', continente: 'Asia', grupo: 'J', historia: 'Equipo organizado', ventajas: 'Estructura táctica', desventajas: 'Menor experiencia', ranking: 83, banderaUrl: 'https://flagcdn.com/w80/jo.png', latitud: 31.9539, longitud: 35.9106 },
  { nombre: 'Portugal', continente: 'Europa', grupo: 'K', historia: 'Fuerza ofensiva', ventajas: 'Jugadores de clase', desventajas: 'Presión', ranking: 8, banderaUrl: 'https://flagcdn.com/w80/pt.png', latitud: 38.7223, longitud: -9.1393 },
  { nombre: 'RD del Congo', continente: 'África', grupo: 'K', historia: 'Potencial africano', ventajas: 'Velocidad', desventajas: 'Defensa irregular', ranking: 52, banderaUrl: 'https://flagcdn.com/w80/cd.png', latitud: -4.0383, longitud: 21.7587 },
  { nombre: 'Uzbekistán', continente: 'Asia', grupo: 'K', historia: 'Equipo emergente', ventajas: 'Estructura', desventajas: 'Menor experiencia', ranking: 85, banderaUrl: 'https://flagcdn.com/w80/uz.png', latitud: 41.2995, longitud: 69.2401 },
  { nombre: 'Colombia', continente: 'América', grupo: 'K', historia: 'Juego técnico sudamericano', ventajas: 'Creatividad', desventajas: 'Inconstancia', ranking: 16, banderaUrl: 'https://flagcdn.com/w80/co.png', latitud: 4.711, longitud: -74.0721 },
  { nombre: 'Inglaterra', continente: 'Europa', grupo: 'L', historia: 'Tradición fuerte', ventajas: 'Calidad individual', desventajas: 'Expectativa', ranking: 5, banderaUrl: 'https://flagcdn.com/w80/gb.png', latitud: 51.507351, longitud: -0.127758 },
  { nombre: 'Croacia', continente: 'Europa', grupo: 'L', historia: 'Colectivo sólido', ventajas: 'Técnica', desventajas: 'Plantilla corta', ranking: 14, banderaUrl: 'https://flagcdn.com/w80/hr.png', latitud: 45.815, longitud: 15.9819 },
  { nombre: 'Ghana', continente: 'África', grupo: 'L', historia: 'Fuerza atlética', ventajas: 'Velocidad', desventajas: 'Técnica irregular', ranking: 60, banderaUrl: 'https://flagcdn.com/w80/gh.png', latitud: 5.603716, longitud: -0.186964 },
  { nombre: 'Panamá', continente: 'Norteamérica', grupo: 'L', historia: 'Equipo caribeño', ventajas: 'Defensa ordenada', desventajas: 'Menor creatividad', ranking: 55, banderaUrl: 'https://flagcdn.com/w80/pa.png', latitud: 8.9824, longitud: -79.5199 }
];

const groupStageMatches = [
  { local: 'México', visitante: 'Sudáfrica', goles_local: 2, goles_visitante: 0, fecha: '2026-06-11T20:00:00Z', estadio: 'Estadio Azteca' },
  { local: 'Corea del Sur', visitante: 'Chequia', goles_local: 2, goles_visitante: 1, fecha: '2026-06-11T22:00:00Z', estadio: 'Estadio Akron' },
  { local: 'Chequia', visitante: 'Sudáfrica', goles_local: 1, goles_visitante: 1, fecha: '2026-06-18T20:00:00Z', estadio: 'Mercedes-Benz Stadium' },
  { local: 'México', visitante: 'Corea del Sur', goles_local: 1, goles_visitante: 0, fecha: '2026-06-18T22:00:00Z', estadio: 'Estadio Akron' },
  { local: 'Chequia', visitante: 'México', goles_local: 0, goles_visitante: 3, fecha: '2026-06-24T20:00:00Z', estadio: 'Estadio Azteca' },
  { local: 'Sudáfrica', visitante: 'Corea del Sur', goles_local: 1, goles_visitante: 0, fecha: '2026-06-24T22:00:00Z', estadio: 'Estadio BBVA' },
  { local: 'Canadá', visitante: 'Bosnia y Herzegovina', goles_local: 1, goles_visitante: 1, fecha: '2026-06-12T20:00:00Z', estadio: 'BMO Field' },
  { local: 'Catar', visitante: 'Suiza', goles_local: 1, goles_visitante: 1, fecha: '2026-06-13T20:00:00Z', estadio: 'Levi\'s Stadium' },
  { local: 'Suiza', visitante: 'Bosnia y Herzegovina', goles_local: 4, goles_visitante: 1, fecha: '2026-06-18T20:00:00Z', estadio: 'SoFi Stadium' },
  { local: 'Canadá', visitante: 'Catar', goles_local: 6, goles_visitante: 0, fecha: '2026-06-18T22:00:00Z', estadio: 'BC Place' },
  { local: 'Suiza', visitante: 'Canadá', goles_local: 2, goles_visitante: 1, fecha: '2026-06-24T20:00:00Z', estadio: 'BC Place' },
  { local: 'Bosnia y Herzegovina', visitante: 'Catar', goles_local: 3, goles_visitante: 1, fecha: '2026-06-24T22:00:00Z', estadio: 'Lumen Field' },
  { local: 'Brasil', visitante: 'Marruecos', goles_local: 1, goles_visitante: 1, fecha: '2026-06-13T20:00:00Z', estadio: 'MetLife Stadium' },
  { local: 'Haití', visitante: 'Escocia', goles_local: 0, goles_visitante: 1, fecha: '2026-06-13T22:00:00Z', estadio: 'Gillette Stadium' },
  { local: 'Escocia', visitante: 'Marruecos', goles_local: 0, goles_visitante: 1, fecha: '2026-06-19T20:00:00Z', estadio: 'Gillette Stadium' },
  { local: 'Brasil', visitante: 'Haití', goles_local: 3, goles_visitante: 0, fecha: '2026-06-19T22:00:00Z', estadio: 'Lincoln Financial Field' },
  { local: 'Escocia', visitante: 'Brasil', goles_local: 0, goles_visitante: 3, fecha: '2026-06-24T20:00:00Z', estadio: 'Hard Rock Stadium' },
  { local: 'Marruecos', visitante: 'Haití', goles_local: 4, goles_visitante: 2, fecha: '2026-06-24T22:00:00Z', estadio: 'Mercedes-Benz Stadium' },
  { local: 'Estados Unidos', visitante: 'Paraguay', goles_local: 4, goles_visitante: 1, fecha: '2026-06-12T20:00:00Z', estadio: 'SoFi Stadium' },
  { local: 'Australia', visitante: 'Turquía', goles_local: 2, goles_visitante: 0, fecha: '2026-06-13T20:00:00Z', estadio: 'BC Place' },
  { local: 'Estados Unidos', visitante: 'Australia', goles_local: 2, goles_visitante: 0, fecha: '2026-06-19T20:00:00Z', estadio: 'Lumen Field' },
  { local: 'Turquía', visitante: 'Paraguay', goles_local: 0, goles_visitante: 1, fecha: '2026-06-19T22:00:00Z', estadio: 'Levi\'s Stadium' },
  { local: 'Turquía', visitante: 'Estados Unidos', goles_local: 3, goles_visitante: 2, fecha: '2026-06-25T20:00:00Z', estadio: 'SoFi Stadium' },
  { local: 'Paraguay', visitante: 'Australia', goles_local: 0, goles_visitante: 0, fecha: '2026-06-25T22:00:00Z', estadio: 'Levi\'s Stadium' },
  { local: 'Alemania', visitante: 'Curazao', goles_local: 7, goles_visitante: 1, fecha: '2026-06-14T20:00:00Z', estadio: 'NRG Stadium' },
  { local: 'Costa de Marfil', visitante: 'Ecuador', goles_local: 1, goles_visitante: 0, fecha: '2026-06-14T22:00:00Z', estadio: 'Lincoln Financial Field' },
  { local: 'Alemania', visitante: 'Costa de Marfil', goles_local: 2, goles_visitante: 1, fecha: '2026-06-20T20:00:00Z', estadio: 'BMO Field' },
  { local: 'Ecuador', visitante: 'Curazao', goles_local: 0, goles_visitante: 0, fecha: '2026-06-20T22:00:00Z', estadio: 'Arrowhead Stadium' },
  { local: 'Ecuador', visitante: 'Alemania', goles_local: 2, goles_visitante: 1, fecha: '2026-06-25T20:00:00Z', estadio: 'MetLife Stadium' },
  { local: 'Curazao', visitante: 'Costa de Marfil', goles_local: 0, goles_visitante: 2, fecha: '2026-06-25T22:00:00Z', estadio: 'Lincoln Financial Field' },
  { local: 'Países Bajos', visitante: 'Japón', goles_local: 2, goles_visitante: 2, fecha: '2026-06-14T20:00:00Z', estadio: 'AT&T Stadium' },
  { local: 'Suecia', visitante: 'Túnez', goles_local: 5, goles_visitante: 1, fecha: '2026-06-14T22:00:00Z', estadio: 'Estadio Akron' },
  { local: 'Países Bajos', visitante: 'Suecia', goles_local: 5, goles_visitante: 1, fecha: '2026-06-20T20:00:00Z', estadio: 'NRG Stadium' },
  { local: 'Túnez', visitante: 'Japón', goles_local: 0, goles_visitante: 4, fecha: '2026-06-20T22:00:00Z', estadio: 'Estadio Akron' },
  { local: 'Japón', visitante: 'Suecia', goles_local: 1, goles_visitante: 1, fecha: '2026-06-25T20:00:00Z', estadio: 'AT&T Stadium' },
  { local: 'Túnez', visitante: 'Países Bajos', goles_local: 1, goles_visitante: 3, fecha: '2026-06-25T22:00:00Z', estadio: 'Arrowhead Stadium' },
  { local: 'Bélgica', visitante: 'Egipto', goles_local: 1, goles_visitante: 1, fecha: '2026-06-15T20:00:00Z', estadio: 'Lumen Field' },
  { local: 'Irán', visitante: 'Nueva Zelanda', goles_local: 2, goles_visitante: 2, fecha: '2026-06-15T22:00:00Z', estadio: 'SoFi Stadium' },
  { local: 'Bélgica', visitante: 'Irán', goles_local: 0, goles_visitante: 0, fecha: '2026-06-21T20:00:00Z', estadio: 'SoFi Stadium' },
  { local: 'Nueva Zelanda', visitante: 'Egipto', goles_local: 1, goles_visitante: 3, fecha: '2026-06-21T22:00:00Z', estadio: 'BC Place' },
  { local: 'Egipto', visitante: 'Irán', goles_local: 1, goles_visitante: 1, fecha: '2026-06-26T20:00:00Z', estadio: 'Lumen Field' },
  { local: 'Nueva Zelanda', visitante: 'Bélgica', goles_local: 1, goles_visitante: 5, fecha: '2026-06-26T22:00:00Z', estadio: 'BC Place' },
  { local: 'España', visitante: 'Cabo Verde', goles_local: 0, goles_visitante: 0, fecha: '2026-06-15T20:00:00Z', estadio: 'Mercedes-Benz Stadium' },
  { local: 'Arabia Saudita', visitante: 'Uruguay', goles_local: 1, goles_visitante: 1, fecha: '2026-06-15T22:00:00Z', estadio: 'Hard Rock Stadium' },
  { local: 'España', visitante: 'Arabia Saudita', goles_local: 4, goles_visitante: 0, fecha: '2026-06-21T20:00:00Z', estadio: 'Mercedes-Benz Stadium' },
  { local: 'Uruguay', visitante: 'Cabo Verde', goles_local: 2, goles_visitante: 2, fecha: '2026-06-21T22:00:00Z', estadio: 'Hard Rock Stadium' },
  { local: 'Cabo Verde', visitante: 'Arabia Saudita', goles_local: 0, goles_visitante: 0, fecha: '2026-06-26T20:00:00Z', estadio: 'NRG Stadium' },
  { local: 'Uruguay', visitante: 'España', goles_local: 0, goles_visitante: 1, fecha: '2026-06-26T22:00:00Z', estadio: 'Estadio Akron' },
  { local: 'Francia', visitante: 'Senegal', goles_local: 3, goles_visitante: 1, fecha: '2026-06-16T20:00:00Z', estadio: 'MetLife Stadium' },
  { local: 'Irak', visitante: 'Noruega', goles_local: 1, goles_visitante: 4, fecha: '2026-06-16T22:00:00Z', estadio: 'Gillette Stadium' },
  { local: 'Francia', visitante: 'Irak', goles_local: 3, goles_visitante: 0, fecha: '2026-06-22T20:00:00Z', estadio: 'Lincoln Financial Field' },
  { local: 'Noruega', visitante: 'Senegal', goles_local: 3, goles_visitante: 2, fecha: '2026-06-22T22:00:00Z', estadio: 'MetLife Stadium' },
  { local: 'Noruega', visitante: 'Francia', goles_local: 1, goles_visitante: 4, fecha: '2026-06-26T20:00:00Z', estadio: 'Gillette Stadium' },
  { local: 'Senegal', visitante: 'Irak', goles_local: 5, goles_visitante: 0, fecha: '2026-06-26T22:00:00Z', estadio: 'BMO Field' },
  { local: 'Argentina', visitante: 'Argelia', goles_local: 3, goles_visitante: 0, fecha: '2026-06-16T20:00:00Z', estadio: 'Arrowhead Stadium' },
  { local: 'Austria', visitante: 'Jordania', goles_local: 3, goles_visitante: 1, fecha: '2026-06-16T22:00:00Z', estadio: 'Levi\'s Stadium' },
  { local: 'Argentina', visitante: 'Austria', goles_local: 2, goles_visitante: 0, fecha: '2026-06-22T20:00:00Z', estadio: 'AT&T Stadium' },
  { local: 'Jordania', visitante: 'Argelia', goles_local: 1, goles_visitante: 2, fecha: '2026-06-22T22:00:00Z', estadio: 'Levi\'s Stadium' },
  { local: 'Argelia', visitante: 'Austria', goles_local: 3, goles_visitante: 3, fecha: '2026-06-27T20:00:00Z', estadio: 'Arrowhead Stadium' },
  { local: 'Jordania', visitante: 'Argentina', goles_local: 1, goles_visitante: 3, fecha: '2026-06-27T22:00:00Z', estadio: 'AT&T Stadium' },
  { local: 'Portugal', visitante: 'RD del Congo', goles_local: 1, goles_visitante: 1, fecha: '2026-06-17T20:00:00Z', estadio: 'NRG Stadium' },
  { local: 'Uzbekistán', visitante: 'Colombia', goles_local: 1, goles_visitante: 3, fecha: '2026-06-17T22:00:00Z', estadio: 'Estadio Azteca' },
  { local: 'Portugal', visitante: 'Uzbekistán', goles_local: 5, goles_visitante: 0, fecha: '2026-06-23T20:00:00Z', estadio: 'NRG Stadium' },
  { local: 'Colombia', visitante: 'RD del Congo', goles_local: 1, goles_visitante: 0, fecha: '2026-06-23T22:00:00Z', estadio: 'Estadio Akron' },
  { local: 'Colombia', visitante: 'Portugal', goles_local: 0, goles_visitante: 0, fecha: '2026-06-27T20:00:00Z', estadio: 'Hard Rock Stadium' },
  { local: 'RD del Congo', visitante: 'Uzbekistán', goles_local: 3, goles_visitante: 1, fecha: '2026-06-27T22:00:00Z', estadio: 'Mercedes-Benz Stadium' },
  { local: 'Inglaterra', visitante: 'Croacia', goles_local: 4, goles_visitante: 2, fecha: '2026-06-17T20:00:00Z', estadio: 'AT&T Stadium' },
  { local: 'Ghana', visitante: 'Panamá', goles_local: 1, goles_visitante: 0, fecha: '2026-06-17T22:00:00Z', estadio: 'BMO Field' },
  { local: 'Inglaterra', visitante: 'Ghana', goles_local: 0, goles_visitante: 0, fecha: '2026-06-23T20:00:00Z', estadio: 'Gillette Stadium' },
  { local: 'Panamá', visitante: 'Croacia', goles_local: 0, goles_visitante: 1, fecha: '2026-06-23T22:00:00Z', estadio: 'BMO Field' },
  { local: 'Panamá', visitante: 'Inglaterra', goles_local: 0, goles_visitante: 2, fecha: '2026-06-27T20:00:00Z', estadio: 'MetLife Stadium' },
  { local: 'Croacia', visitante: 'Ghana', goles_local: 2, goles_visitante: 1, fecha: '2026-06-27T22:00:00Z', estadio: 'Lincoln Financial Field' }
];

const groupStageMatchesWithPhase = groupStageMatches.map((match) => ({ ...match, fase: 'Fase de grupos' }));

const knockoutMatches = [
  { fase: 'Dieciseisavos de Final', local: 'Sudáfrica', visitante: 'Canadá', goles_local: 0, goles_visitante: 1, fecha: '2026-06-28T18:00:00Z', estadio: 'SoFi Stadium' },
  { fase: 'Dieciseisavos de Final', local: 'Brasil', visitante: 'Japón', goles_local: 2, goles_visitante: 1, fecha: '2026-06-29T18:00:00Z', estadio: 'NRG Stadium' },
  { fase: 'Dieciseisavos de Final', local: 'Alemania', visitante: 'Paraguay', goles_local: 1, goles_visitante: 1, fecha: '2026-06-29T18:00:00Z', estadio: 'Gillette Stadium', penales_local: 3, penales_visitante: 4 },
  { fase: 'Dieciseisavos de Final', local: 'Países Bajos', visitante: 'Marruecos', goles_local: 1, goles_visitante: 1, fecha: '2026-06-29T22:00:00Z', estadio: 'Estadio Akron', penales_local: 2, penales_visitante: 3 },
  { fase: 'Dieciseisavos de Final', local: 'Costa de Marfil', visitante: 'Noruega', goles_local: 1, goles_visitante: 2, fecha: '2026-06-30T18:00:00Z', estadio: 'AT&T Stadium' },
  { fase: 'Dieciseisavos de Final', local: 'Francia', visitante: 'Suecia', goles_local: 3, goles_visitante: 0, fecha: '2026-06-30T22:00:00Z', estadio: 'MetLife Stadium' },
  { fase: 'Dieciseisavos de Final', local: 'México', visitante: 'Ecuador', goles_local: 2, goles_visitante: 0, fecha: '2026-06-30T22:00:00Z', estadio: 'Estadio Azteca' },
  { fase: 'Dieciseisavos de Final', local: 'Inglaterra', visitante: 'RD del Congo', goles_local: 2, goles_visitante: 1, fecha: '2026-07-01T18:00:00Z', estadio: 'Mercedes-Benz Stadium' },
  { fase: 'Dieciseisavos de Final', local: 'Bélgica', visitante: 'Senegal', goles_local: 3, goles_visitante: 2, fecha: '2026-07-01T18:00:00Z', estadio: 'Lumen Field' },
  { fase: 'Dieciseisavos de Final', local: 'Estados Unidos', visitante: 'Bosnia y Herzegovina', goles_local: 2, goles_visitante: 0, fecha: '2026-07-01T22:00:00Z', estadio: 'Levi\'s Stadium' },
  { fase: 'Dieciseisavos de Final', local: 'España', visitante: 'Austria', goles_local: 3, goles_visitante: 0, fecha: '2026-07-02T18:00:00Z', estadio: 'SoFi Stadium' },
  { fase: 'Dieciseisavos de Final', local: 'Portugal', visitante: 'Croacia', goles_local: 2, goles_visitante: 1, fecha: '2026-07-02T22:00:00Z', estadio: 'BMO Field' },
  { fase: 'Dieciseisavos de Final', local: 'Suiza', visitante: 'Argelia', goles_local: 2, goles_visitante: 0, fecha: '2026-07-02T22:00:00Z', estadio: 'BC Place' },
  { fase: 'Dieciseisavos de Final', local: 'Australia', visitante: 'Egipto', goles_local: 1, goles_visitante: 1, fecha: '2026-07-03T18:00:00Z', estadio: 'AT&T Stadium', penales_local: 2, penales_visitante: 4 },
  { fase: 'Dieciseisavos de Final', local: 'Argentina', visitante: 'Cabo Verde', goles_local: 3, goles_visitante: 2, fecha: '2026-07-03T18:00:00Z', estadio: 'Hard Rock Stadium' },
  { fase: 'Dieciseisavos de Final', local: 'Colombia', visitante: 'Ghana', goles_local: 1, goles_visitante: 0, fecha: '2026-07-03T22:00:00Z', estadio: 'Arrowhead Stadium' },
  { fase: 'Octavos de Final', local: 'Canadá', visitante: 'Marruecos', goles_local: 0, goles_visitante: 3, fecha: '2026-07-04T18:00:00Z', estadio: 'NRG Stadium' },
  { fase: 'Octavos de Final', local: 'Paraguay', visitante: 'Francia', goles_local: 0, goles_visitante: 1, fecha: '2026-07-04T22:00:00Z', estadio: 'Lincoln Financial Field' },
  { fase: 'Octavos de Final', local: 'Brasil', visitante: 'Noruega', goles_local: 1, goles_visitante: 2, fecha: '2026-07-05T18:00:00Z', estadio: 'MetLife Stadium' },
  { fase: 'Octavos de Final', local: 'México', visitante: 'Inglaterra', goles_local: 2, goles_visitante: 3, fecha: '2026-07-05T22:00:00Z', estadio: 'Estadio Azteca' },
  { fase: 'Octavos de Final', local: 'Portugal', visitante: 'España', goles_local: 0, goles_visitante: 1, fecha: '2026-07-06T18:00:00Z', estadio: 'AT&T Stadium' },
  { fase: 'Octavos de Final', local: 'Estados Unidos', visitante: 'Bélgica', goles_local: 1, goles_visitante: 4, fecha: '2026-07-06T22:00:00Z', estadio: 'Lumen Field' },
  { fase: 'Octavos de Final', local: 'Argentina', visitante: 'Egipto', goles_local: 3, goles_visitante: 2, fecha: '2026-07-07T18:00:00Z', estadio: 'Mercedes-Benz Stadium' },
  { fase: 'Octavos de Final', local: 'Suiza', visitante: 'Colombia', goles_local: 0, goles_visitante: 0, fecha: '2026-07-07T22:00:00Z', estadio: 'BC Place', penales_local: 4, penales_visitante: 3 },
  { fase: 'Cuartos de Final', local: 'Francia', visitante: 'Marruecos', goles_local: 2, goles_visitante: 0, fecha: '2026-07-09T18:00:00Z', estadio: 'Gillette Stadium' },
  { fase: 'Cuartos de Final', local: 'España', visitante: 'Bélgica', goles_local: 2, goles_visitante: 1, fecha: '2026-07-10T18:00:00Z', estadio: 'SoFi Stadium' },
  { fase: 'Cuartos de Final', local: 'Inglaterra', visitante: 'Noruega', goles_local: 2, goles_visitante: 1, fecha: '2026-07-11T18:00:00Z', estadio: 'Hard Rock Stadium' },
  { fase: 'Cuartos de Final', local: 'Argentina', visitante: 'Suiza', goles_local: 3, goles_visitante: 1, fecha: '2026-07-11T22:00:00Z', estadio: 'Arrowhead Stadium' },
  { fase: 'Semifinales', local: 'España', visitante: 'Francia', goles_local: 2, goles_visitante: 0, fecha: '2026-07-14T18:00:00Z', estadio: 'AT&T Stadium' },
  { fase: 'Semifinales', local: 'Argentina', visitante: 'Inglaterra', goles_local: 2, goles_visitante: 1, fecha: '2026-07-15T22:00:00Z', estadio: 'Mercedes-Benz Stadium' },
  { fase: 'Tercer Lugar', local: 'Francia', visitante: 'Inglaterra', goles_local: 4, goles_visitante: 6, fecha: '2026-07-18T20:00:00Z', estadio: 'Hard Rock Stadium' },
  { fase: 'Final', local: 'España', visitante: 'Argentina', goles_local: 1, goles_visitante: 0, fecha: '2026-07-19T20:00:00Z', estadio: 'MetLife Stadium' }
];

const phaseDefinitions = [
  { nombre: 'Fase de grupos', sede: 'Ciudad de México', fecha: new Date('2026-06-01T00:00:00Z') },
  { nombre: 'Dieciseisavos de Final', sede: 'Los Angeles', fecha: new Date('2026-06-28T00:00:00Z') },
  { nombre: 'Octavos de Final', sede: 'Houston', fecha: new Date('2026-07-04T00:00:00Z') },
  { nombre: 'Cuartos de Final', sede: 'Boston', fecha: new Date('2026-07-09T00:00:00Z') },
  { nombre: 'Semifinales', sede: 'Dallas', fecha: new Date('2026-07-14T00:00:00Z') },
  { nombre: 'Tercer Lugar', sede: 'Miami', fecha: new Date('2026-07-18T00:00:00Z') },
  { nombre: 'Final', sede: 'Nueva York / Nueva Jersey', fecha: new Date('2026-07-19T00:00:00Z') }
];

function getHorario(fechaIso) {
  return new Date(fechaIso).toISOString().slice(11, 16);
}

async function main() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);

    for (const collectionName of ['continentes', 'grupos', 'selecciones', 'estadios', 'fase_final', 'partidos', 'clasificaciones', 'usuarios', 'boletos']) {
      await db.collection(collectionName).deleteMany({});
    }

    const continentIds = {};
    for (const continent of continents) {
      const { insertedId } = await db.collection('continentes').insertOne({
        nombre: continent.nombre,
        confederacion: continent.confederacion,
        paises_incluidos: continent.paises_incluidos
      });
      continentIds[continent.nombre] = insertedId;
    }

    const groupIds = {};
    for (const group of groups) {
      const { insertedId } = await db.collection('grupos').insertOne({ nombre: group.nombre });
      groupIds[group.nombre] = insertedId;
    }

    const stadiumIds = {};
    for (const stadium of stadiums) {
      const { insertedId } = await db.collection('estadios').insertOne(stadium);
      stadiumIds[stadium.nombre] = insertedId;
    }

    const phaseIds = {};
    for (const phase of phaseDefinitions) {
      const matchCount = [...groupStageMatchesWithPhase, ...knockoutMatches].filter((match) => match.fase === phase.nombre).length;
      const { insertedId } = await db.collection('fase_final').insertOne({
        nombre: phase.nombre,
        clasificados: [],
        partidos: matchCount,
        sede: phase.sede,
        fecha: phase.fecha
      });
      phaseIds[phase.nombre] = insertedId;
    }

    const selectionIds = {};
    for (const selection of selections) {
      const { insertedId } = await db.collection('selecciones').insertOne({
        nombre: selection.nombre,
        continenteId: continentIds[selection.continente],
        grupoId: groupIds[selection.grupo],
        historia: selection.historia,
        ventajas: selection.ventajas,
        desventajas: selection.desventajas,
        ranking: selection.ranking,
        banderaUrl: selection.banderaUrl,
        bandera_url: selection.banderaUrl,
        latitud: selection.latitud,
        longitud: selection.longitud
      });
      selectionIds[selection.nombre] = insertedId;
    }

    const allMatches = [...groupStageMatchesWithPhase, ...knockoutMatches];
    const matchDocs = allMatches.map((match) => ({
      fase: match.fase,
      faseId: phaseIds[match.fase],
      equipo_localId: selectionIds[match.local],
      equipo_visitanteId: selectionIds[match.visitante],
      goles_local: match.goles_local,
      goles_visitante: match.goles_visitante,
      fecha: new Date(match.fecha),
      estadioId: stadiumIds[match.estadio],
      horario: getHorario(match.fecha),
      ...(match.penales_local !== undefined ? { penales_local: match.penales_local } : {}),
      ...(match.penales_visitante !== undefined ? { penales_visitante: match.penales_visitante } : {})
    }));

    await db.collection('partidos').insertMany(matchDocs);

    const statsByTeam = new Map();
    function ensureTeam(teamId, groupId) {
      const key = teamId.toString();
      if (!statsByTeam.has(key)) {
        statsByTeam.set(key, { grupoId: groupId, seleccionId: teamId, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dg: 0, pts: 0 });
      }
      return statsByTeam.get(key);
    }

    for (const match of groupStageMatchesWithPhase) {
      const localGroup = selections.find((item) => item.nombre === match.local).grupo;
      const visitanteGroup = selections.find((item) => item.nombre === match.visitante).grupo;
      const local = ensureTeam(selectionIds[match.local], groupIds[localGroup]);
      const visitante = ensureTeam(selectionIds[match.visitante], groupIds[visitanteGroup]);
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

    const classificationDocs = Array.from(statsByTeam.values()).map((stats) => ({
      grupoId: stats.grupoId,
      seleccionId: stats.seleccionId,
      pj: stats.pj,
      pg: stats.pg,
      pe: stats.pe,
      pp: stats.pp,
      gf: stats.gf,
      gc: stats.gc,
      dg: stats.dg,
      pts: stats.pts
    }));

    await db.collection('clasificaciones').insertMany(classificationDocs);

    const userIds = [];
    for (const user of [{ nombre: 'Juan Pérez', usuario: 'juan' }, { nombre: 'María Gómez', usuario: 'maria' }]) {
      const { insertedId } = await db.collection('usuarios').insertOne({ ...user, role: 'user', createdAt: new Date() });
      userIds.push(insertedId);
    }

    await db.collection('boletos').insertMany([
      { usuarioId: userIds[0], estadioId: stadiumIds['Estadio Azteca'], dia: 'Sábado', fecha: new Date('2026-06-11'), horario: '20:00', seleccionId: selectionIds['México'], costo: 1200 },
      { usuarioId: userIds[1], estadioId: stadiumIds['BC Place'], dia: 'Domingo', fecha: new Date('2026-06-12'), horario: '20:00', seleccionId: selectionIds['Canadá'], costo: 950 }
    ]);

    const adminSalt = crypto.randomBytes(16).toString('hex');
    const adminPasswordHash = crypto.scryptSync('admin123', adminSalt, 64, { N: 16384 }).toString('hex');
    await db.collection('usuarios').insertOne({
      nombre: 'Administrador',
      usuario: 'admin@mundial.local',
      passwordHash: adminPasswordHash,
      salt: adminSalt,
      role: 'admin',
      createdAt: new Date()
    });

    console.log('Datos del Mundial 2026 cargados correctamente.');
    console.log(`- ${continents.length} continentes`);
    console.log(`- ${groups.length} grupos`);
    console.log(`- ${selections.length} selecciones`);
    console.log(`- ${allMatches.length} partidos`);
    console.log(`- ${classificationDocs.length} registros de clasificación`);
  } catch (error) {
    console.error('Error al sembrar datos:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();


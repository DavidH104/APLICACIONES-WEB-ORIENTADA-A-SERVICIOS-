import { MongoClient } from 'mongodb';

const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'mundial2026';

async function main() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);

    const continente = await db.collection('continentes').insertOne({
      nombre: 'Antártida',
      descripcion: 'Continente frío y remoto'
    });

    const grupo = await db.collection('grupos').insertOne({
      nombre: 'H',
      fase: 'Fase de grupos',
      descripcion: 'Grupo de prueba H'
    });

    const seleccion = await db.collection('selecciones').insertOne({
      nombre: 'Testlandia',
      continenteId: continente.insertedId,
      grupoId: grupo.insertedId,
      entrenador: 'Entrenador Test',
      rankingFIFA: 99,
      banderaUrl: 'https://example.com/bandera.png'
    });

    const estadio = await db.collection('estadios').insertOne({
      nombre: 'Estadio Prueba',
      ciudad: 'Ciudad Test',
      pais: 'Testlandia',
      capacidad: 25000,
      latitud: 0.0,
      longitud: 0.0
    });

    const faseFinal = await db.collection('fase_final').insertOne({
      nombre: 'Final de prueba',
      ronda: 'Final',
      descripcion: 'Partido de prueba en fase final'
    });

    const partido = await db.collection('partidos').insertOne({
      fecha: new Date('2026-07-01T20:00:00Z'),
      estadioId: estadio.insertedId,
      faseId: faseFinal.insertedId,
      localId: seleccion.insertedId,
      visitanteId: seleccion.insertedId,
      golesLocal: 3,
      golesVisitante: 1,
      asistentes: 12000,
      estado: 'programado'
    });

    const usuario = await db.collection('usuarios').insertOne({
      nombre: 'Usuario Prueba',
      email: 'usuario@prueba.com',
      passwordHash: 'hashPrueba',
      telefono: '000-000-0000',
      nacionalidad: 'Testlandia',
      tipo: 'tester'
    });

    await db.collection('boletos').insertOne({
      usuarioId: usuario.insertedId,
      partidoId: partido.insertedId,
      asiento: 'P1',
      zona: 'VIP',
      precio: 99.99,
      fechaCompra: new Date(),
      estado: 'vendido'
    });

    await db.collection('clasificaciones').insertOne({
      grupoId: grupo.insertedId,
      seleccionId: seleccion.insertedId,
      partidosJugados: 1,
      ganados: 1,
      empatados: 0,
      perdidos: 0,
      golesFavor: 3,
      golesContra: 1,
      diferencia: 2,
      puntos: 3
    });

    console.log('Inserciones de prueba completadas.');
    console.log('IDs insertados:');
    console.log({
      continente: continente.insertedId,
      grupo: grupo.insertedId,
      seleccion: seleccion.insertedId,
      estadio: estadio.insertedId,
      faseFinal: faseFinal.insertedId,
      partido: partido.insertedId,
      usuario: usuario.insertedId
    });
  } catch (error) {
    console.error('Error en inserciones de prueba:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();

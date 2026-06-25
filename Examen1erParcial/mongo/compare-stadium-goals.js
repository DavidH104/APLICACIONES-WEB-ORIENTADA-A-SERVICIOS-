import { MongoClient } from 'mongodb';

const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'mundial2026';

async function main() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);

    const current = await db.collection('partidos').aggregate([
      {
        $group: {
          _id: '$estadioId',
          golesLocalTotales: { $sum: '$goles_local' }
        }
      },
      {
        $lookup: {
          from: 'estadios',
          localField: '_id',
          foreignField: '_id',
          as: 'estadio'
        }
      },
      { $unwind: '$estadio' },
      {
        $project: {
          estadio: '$estadio.nombre',
          ciudad: '$estadio.ciudad',
          pais: '$estadio.pais',
          golesLocalTotales: 1
        }
      },
      { $sort: { golesLocalTotales: -1 } },
      { $limit: 5 }
    ]).toArray();

    const allMatches = await db.collection('partidos').find().toArray();
    const stadiums = await db.collection('estadios').find().toArray();

    const localByStadium = allMatches.reduce((acc, match) => {
      const key = match.estadioId.toString();
      acc[key] = (acc[key] || 0) + match.goles_local;
      return acc;
    }, {});

    const actual = stadiums
      .map(estadio => ({
        estadio: estadio.nombre,
        ciudad: estadio.ciudad,
        pais: estadio.pais,
        golesLocalTotales: localByStadium[estadio._id.toString()] || 0
      }))
      .filter(row => row.golesLocalTotales > 0)
      .sort((a, b) => b.golesLocalTotales - a.golesLocalTotales)
      .slice(0, 5);

    console.log('CURRENT QUERY (local goals only):');
    console.table(current);
    console.log('ACTUAL LOCAL GOALS FROM DOCUMENTS:');
    console.table(actual);

    const comparison = current.map(row => ({
      estadio: row.estadio,
      queryLocal: row.golesLocalTotales,
      actualLocal: actual.find(a => a.estadio === row.estadio)?.golesLocalTotales ?? 0,
      match: row.golesLocalTotales === (actual.find(a => a.estadio === row.estadio)?.golesLocalTotales ?? 0)
    }));

    console.log('COMPARISON:');
    console.table(comparison);
  } catch (error) {
    console.error('Error ejecutando comparacion:', error);
  } finally {
    await client.close();
  }
}

main();

import { MongoClient } from 'mongodb';

const MONGO_URI = 'mongodb://127.0.0.1:27017';
const DB_NAME = 'mundial2026';

const eloMap = {
  'México': 1750, 'Inglaterra': 1850, 'Senegal': 1680, 'Australia': 1620,
  'Estados Unidos': 1780, 'Alemania': 1880, 'Marruecos': 1700, 'Japón': 1710,
  'Canadá': 1600, 'Francia': 1920, 'Egipto': 1650, 'Irán': 1680,
  'Costa Rica': 1650, 'España': 1900, 'Ghana': 1580, 'Catar': 1620,
  'Panamá': 1550, 'Portugal': 1870, 'Nigeria': 1650, 'Uzbekistán': 1500,
  'Honduras': 1520, 'Países Bajos': 1850, 'Camerún': 1650, 'Corea del Sur': 1720,
  'Jamaica': 1550, 'Bélgica': 1800, 'Argelia': 1600, 'Emiratos Árabes Unidos': 1500,
  'El Salvador': 1520, 'Croacia': 1780, 'Túnez': 1620, 'Colombia': 1760,
  'Uruguay': 1750, 'Italia': 1820, 'Costa de Marfil': 1680, 'Arabia Saudita': 1650,
  'Ecuador': 1720, 'Suiza': 1780, 'Escocia': 1700, 'Nueva Zelanda': 1450,
  'Perú': 1680, 'Dinamarca': 1760, 'Polonia': 1700, 'Argentina': 1985,
  'Brasil': 1960, 'Gales': 1680, 'Serbia': 1700, 'Austria': 1720
};

async function main() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(DB_NAME);

  const bulk = [];
  for (const [nombre, elo] of Object.entries(eloMap)) {
    bulk.push({
      updateOne: {
        filter: { nombre },
        update: { $set: { elo } }
      }
    });
  }

  if (bulk.length) {
    const result = await db.collection('selecciones').bulkWrite(bulk);
    console.log('ELO actualizados:', result.modifiedCount);
  }

  await client.close();
}

main().catch((err) => { console.error(err); process.exit(1); });

// src/test-mongo.ts
import 'dotenv/config';
import { MongoClient, ServerApiVersion } from 'mongodb';

async function run() {
  // Haal de URI uit je .env (of plak 'm hier direct, maar URL-enco­de dan je password!)
  const uri = process.env.MONGO_URI!;
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  try {
    await client.connect(); // v4.7+ is optioneel, maar ok
    // Ping de admin-database
    await client.db('admin').command({ ping: 1 });
    console.log('✅ Ping ok — verbinding met MongoDB is gelukt!');
  } catch (err) {
    console.error('❌ Verbinding met MongoDB mislukt:', err);
  } finally {
    await client.close();
  }
}

run();

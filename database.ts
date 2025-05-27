import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGO_URI as string;
let db: Db;

export async function connect(): Promise<Db> {
  if (db) return db;

  const client = new MongoClient(uri);
  await client.connect();
  const dbName = process.env.MONGO_DBNAME || "fortnitewpldb";
  db = client.db(dbName);

  console.log("Verbonden met MongoDB:", dbName);
  return db;
}

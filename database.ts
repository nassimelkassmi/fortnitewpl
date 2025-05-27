import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGO_URI as string; // Zelfde naam als in jouw .env!

let db: Db;

export async function connect(): Promise<Db> {
  if (db) return db;

  const client = new MongoClient(uri);
  await client.connect();
  db = client.db("fortnitewpl"); // Je mag hier een vaste naam houden OF uit .env halen

  console.log("Verbonden met MongoDB");
  return db;
}

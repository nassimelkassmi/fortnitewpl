import { MongoClient, Db } from "mongodb";

const uri = "mongodb+srv://amer:Etc5Oc2yczpYEhmr@cluster0.thionxf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

let db: Db;

export async function connect(): Promise<Db> {
  if (db) return db;

  const client = new MongoClient(uri);
  await client.connect();
  db = client.db("fortnitewpl"); 

  console.log("Verbonden met MongoDB");
  return db;
}

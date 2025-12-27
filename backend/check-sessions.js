import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const client = new MongoClient(process.env.MONGODB_URI);

async function checkSessions() {
  await client.connect();
  const db = client.db('onelastai');
  
  const collections = await db.listCollections().toArray();
  const sessionColls = collections.filter(c => c.name.toLowerCase().includes('session'));
  
  console.log('Collections with "session" in name:');
  sessionColls.forEach(c => console.log('  -', c.name));
  
  if (sessionColls.length > 0) {
    for (const col of sessionColls) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`\nCollection "${col.name}" has ${count} documents`);
    }
  }
  
  await client.close();
}

checkSessions().catch(console.error);

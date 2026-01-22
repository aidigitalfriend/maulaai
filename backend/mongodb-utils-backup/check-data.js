const { MongoClient } = require('mongodb');
require('dotenv').config();

const client = new MongoClient(process.env.MONGODB_URI);

async function checkData() {
  await client.connect();
  const db = client.db('onelastai');

  console.log('=== COLLECTIONS ===');
  const collections = await db.listCollections().toArray();
  for (const col of collections) {
    const count = await db.collection(col.name).countDocuments();
    console.log(`${col.name}: ${count} documents`);
  }

  console.log('\n=== SESSIONS SAMPLE ===');
  const sessions = await db.collection('sessions').find({}).limit(3).toArray();
  console.log(JSON.stringify(sessions, null, 2));

  console.log('\n=== CHATINTERACTIONS SAMPLE ===');
  const chats = await db
    .collection('chatinteractions')
    .find({})
    .limit(3)
    .toArray();
  console.log(JSON.stringify(chats, null, 2));

  console.log('\n=== PAGEVIEWS SAMPLE ===');
  const pageviews = await db
    .collection('pageviews')
    .find({})
    .limit(3)
    .toArray();
  console.log(JSON.stringify(pageviews, null, 2));

  console.log('\n=== APIUSAGES SAMPLE ===');
  const apiusages = await db
    .collection('apiusages')
    .find({})
    .limit(3)
    .toArray();
  console.log(JSON.stringify(apiusages, null, 2));

  console.log('\n=== AGENTS SAMPLE ===');
  const agents = await db.collection('agents').find({}).limit(5).toArray();
  console.log(JSON.stringify(agents, null, 2));

  await client.close();
}

checkData().catch(console.error);

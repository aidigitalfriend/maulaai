import { MongoClient } from 'mongodb';

const client = new MongoClient(
  'mongodb+srv://onelastai:onelastai-co@onelastai-co.0fsia.mongodb.net/onelastai?retryWrites=true&w=majority&appName=onelastai-co'
);

try {
  await client.connect();
  console.log('✅ Connected to MongoDB');

  const db = client.db('onelastai');
  const collections = await db.listCollections().toArray();

  console.log('\n📁 COLLECTIONS IN onelastai DATABASE:');
  collections.forEach((col, i) => {
    console.log(`${i + 1}. ${col.name}`);
  });

  console.log(`\nTotal collections: ${collections.length}`);

  // Get sample counts for key collections
  console.log('\n📊 COLLECTION COUNTS:');
  for (const col of collections) {
    try {
      const count = await db.collection(col.name).countDocuments();
      console.log(`${col.name}: ${count} documents`);
    } catch (e) {
      console.log(`${col.name}: Error counting - ${e.message}`);
    }
  }
} catch (e) {
  console.error('❌ Error:', e.message);
} finally {
  await client.close();
}

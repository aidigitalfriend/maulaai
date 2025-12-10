import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

async function checkCollections() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('onelastai');

    // Get all collections
    const collections = await db.listCollections().toArray();

    console.log('\n📁 COLLECTIONS IN onelastai DATABASE:');
    collections.forEach((col, i) => {
      console.log(`${i + 1}. ${col.name}`);
    });

    console.log(`\nTotal collections: ${collections.length}`);

    // Get sample counts for key collections
    console.log('\n📊 COLLECTION DOCUMENT COUNTS:');

    const collectionsToCheck = [
      'users',
      'userprofiles',
      'userpreferences',
      'usersecurities',
      'sessions',
      'accounts',
      'subscriptions',
      'pageviews',
      'userevents',
      'chatinteractions',
      'apiusages',
    ];

    for (const collectionName of collectionsToCheck) {
      try {
        const count = await db.collection(collectionName).countDocuments();
        if (count > 0) {
          console.log(`✅ ${collectionName}: ${count} documents`);

          // Show sample document structure for key collections
          if (
            [
              'users',
              'userprofiles',
              'userpreferences',
              'usersecurities',
            ].includes(collectionName) &&
            count > 0
          ) {
            const sample = await db.collection(collectionName).findOne({});
            console.log(`   Sample structure:`, Object.keys(sample));
          }
        } else {
          console.log(`⚪ ${collectionName}: 0 documents (empty)`);
        }
      } catch (e) {
        console.log(`❌ ${collectionName}: Error - ${e.message}`);
      }
    }
  } catch (e) {
    console.error('❌ Error:', e.message);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkCollections();

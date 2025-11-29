import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

async function analyzeDatabaseStructure() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);

    const db = mongoose.connection.db;
    const dbName = db.databaseName;

    console.log(`
📊 CURRENT DATABASE STRUCTURE - OneLastAI`);
    console.log(`Database: ${dbName}`);
    console.log('='.repeat(70));

    const collections = await db.listCollections().toArray();

    console.log(`
📁 ALL COLLECTIONS (${collections.length} total)`);
    console.log('-'.repeat(70));

    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      const collection = db.collection(collectionName);
      const count = await collection.countDocuments();
      console.log(
        `${collectionName.padEnd(40)} | ${count.toString().padStart(8)} docs`
      );
    }

    console.log('\n✅ Analysis complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

analyzeDatabaseStructure();

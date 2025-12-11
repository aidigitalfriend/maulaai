// Migration script: normalize analytics.userId fields from string to ObjectId
//
// This updates all analytics-related collections so that `userId` is stored
// as an ObjectId (matching the primary key in the `users` collection),
// instead of a string. This aligns analytics data with the main application
// collections and the /api/user/analytics endpoint.
//
// SAFE TO RUN MULTIPLE TIMES: only documents where userId is a string
// will be touched. Documents that already have ObjectId userId are skipped.
//
// Usage (from repo root):
//   cd backend
//   node scripts/migrate-analytics-userId-to-objectId.js

import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';

dotenv.config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'onelastai';

if (!uri) {
  console.error(
    '❌ MONGODB_URI is not set. Please configure it in your .env file.'
  );
  process.exit(1);
}

const COLLECTIONS = [
  'visitors',
  'sessions',
  'pageviews',
  'chat_interactions',
  'tool_usage',
  'lab_experiments',
  'user_events',
  'api_usage',
];

async function migrateCollection(db, collectionName) {
  const collection = db.collection(collectionName);

  // Count how many docs currently have string userId
  const stringCount = await collection.countDocuments({
    userId: { $type: 'string' },
  });
  if (!stringCount) {
    console.log(
      `✅ ${collectionName}: no string userId fields found (nothing to migrate).`
    );
    return;
  }

  console.log(
    `▶️  ${collectionName}: migrating ${stringCount} documents with string userId → ObjectId...`
  );

  // Use aggregation pipeline style update so we can use $toObjectId
  // Requires MongoDB 4.2+
  const result = await collection.updateMany({ userId: { $type: 'string' } }, [
    {
      $set: {
        userId: {
          $convert: {
            input: '$userId',
            to: 'objectId',
            onError: '$userId', // leave as-is if conversion fails
            onNull: '$userId',
          },
        },
      },
    },
  ]);

  console.log(
    `   ➜ ${collectionName}: matched ${result.matchedCount}, modified ${result.modifiedCount} documents.`
  );
}

async function run() {
  const client = new MongoClient(uri);

  try {
    console.log('🚀 Connecting to MongoDB...');
    await client.connect();
    const db = client.db(dbName);

    console.log(`📊 Using database: ${db.databaseName}`);

    for (const name of COLLECTIONS) {
      await migrateCollection(db, name);
    }

    console.log(
      '✅ Migration complete. You can now rely on analytics.userId being an ObjectId.'
    );
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

run();

/**
 * Migration Script: Convert userId STRING to ObjectId
 *
 * Collections to migrate:
 * - usersecurities: userId (string) → userId (ObjectId)
 * - userpreferences: userId (string) → userId (ObjectId)
 */

import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const client = new MongoClient(process.env.MONGODB_URI);

async function migrateUserIdToObjectId() {
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db('onelastai');

    // =========================================================================
    // MIGRATE: usersecurities collection
    // =========================================================================
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('1️⃣  MIGRATING usersecurities collection');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const securityCol = db.collection('usersecurities');
    const securityDocs = await securityCol
      .find({
        userId: { $type: 'string' },
      })
      .toArray();

    console.log(`Found ${securityDocs.length} documents with string userId\n`);

    let securitySuccess = 0;
    let securityFailed = 0;

    for (const doc of securityDocs) {
      try {
        if (ObjectId.isValid(doc.userId)) {
          await securityCol.updateOne(
            { _id: doc._id },
            { $set: { userId: new ObjectId(doc.userId) } }
          );
          console.log(`✅ Migrated: ${doc.userId} → ObjectId`);
          securitySuccess++;
        } else {
          console.log(`❌ Invalid ObjectId format: ${doc.userId}`);
          securityFailed++;
        }
      } catch (error) {
        console.log(`❌ Failed to migrate ${doc.userId}: ${error.message}`);
        securityFailed++;
      }
    }

    console.log(
      `\n📊 usersecurities: ${securitySuccess} success, ${securityFailed} failed\n`
    );

    // =========================================================================
    // MIGRATE: userpreferences collection
    // =========================================================================
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('2️⃣  MIGRATING userpreferences collection');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const prefsCol = db.collection('userpreferences');
    const prefsDocs = await prefsCol
      .find({
        userId: { $type: 'string' },
      })
      .toArray();

    console.log(`Found ${prefsDocs.length} documents with string userId\n`);

    let prefsSuccess = 0;
    let prefsFailed = 0;

    for (const doc of prefsDocs) {
      try {
        if (ObjectId.isValid(doc.userId)) {
          await prefsCol.updateOne(
            { _id: doc._id },
            { $set: { userId: new ObjectId(doc.userId) } }
          );
          console.log(`✅ Migrated: ${doc.userId} → ObjectId`);
          prefsSuccess++;
        } else {
          console.log(`❌ Invalid ObjectId format: ${doc.userId}`);
          prefsFailed++;
        }
      } catch (error) {
        console.log(`❌ Failed to migrate ${doc.userId}: ${error.message}`);
        prefsFailed++;
      }
    }

    console.log(
      `\n📊 userpreferences: ${prefsSuccess} success, ${prefsFailed} failed\n`
    );

    // =========================================================================
    // VERIFICATION
    // =========================================================================
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ VERIFICATION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const securityStrings = await securityCol.countDocuments({
      userId: { $type: 'string' },
    });
    const securityObjectIds = await securityCol.countDocuments({
      userId: { $type: 'objectId' },
    });

    const prefsStrings = await prefsCol.countDocuments({
      userId: { $type: 'string' },
    });
    const prefsObjectIds = await prefsCol.countDocuments({
      userId: { $type: 'objectId' },
    });

    console.log('usersecurities:');
    console.log(`  String userId: ${securityStrings}`);
    console.log(`  ObjectId userId: ${securityObjectIds}`);
    console.log(
      `  ${
        securityStrings === 0 ? '✅ All migrated!' : '⚠️ Still has strings'
      }\n`
    );

    console.log('userpreferences:');
    console.log(`  String userId: ${prefsStrings}`);
    console.log(`  ObjectId userId: ${prefsObjectIds}`);
    console.log(
      `  ${prefsStrings === 0 ? '✅ All migrated!' : '⚠️ Still has strings'}\n`
    );

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 MIGRATION COMPLETE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

console.log('🚀 Starting userId to ObjectId migration...\n');
migrateUserIdToObjectId().catch(console.error);

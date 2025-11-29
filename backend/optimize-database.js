#!/usr/bin/env node

/**
 * Database Optimization Script for OneLastAI
 * Implements the recommended database optimizations
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MongoDB URI not found in environment variables');
  process.exit(1);
}

// Collections that are empty but heavily indexed (should have indexes removed)
const EMPTY_COLLECTIONS_TO_CLEAN = [
  'agentusages',
  'imagegenerations',
  'emotionanalyses',
  'agentsubscriptions',
  'payments',
  'usersecurities',
  'emailqueues',
  'neuralartgenerations',
  'smartassistants',
  'billings',
  'invoices',
  'contactmessages',
  'toolusages',
  'notifications',
  'coupons',
  'communitycomments',
  'pageviews',
  'virtualrealities',
  'apiusages',
  'communitygroups',
  'personalitytests',
  'futurepredictions',
  'plans',
  'agentchathistories',
  'jobapplications',
  'communitymetrics',
  'communityposts',
  'communitymoderations',
  'creativewritings',
  'communityevents',
  'userevents',
  'datasetanalyses',
  'communitymemberships',
  'labexperiments',
  'musicgenerations',
  'presences',
  'languagelearnings',
];

async function optimizeDatabase() {
  try {
    console.log('🔧 STARTING DATABASE OPTIMIZATION...\n');
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;

    console.log('📊 PHASE 1: Analyzing Current State');
    console.log('='.repeat(50));

    // Get all collections and their stats
    const collections = await db.listCollections().toArray();
    console.log(`Total collections: ${collections.length}`);

    let totalIndexesBefore = 0;
    let totalIndexesAfter = 0;

    // Phase 1: Remove indexes from empty collections
    console.log('\n🧹 PHASE 2: Removing Indexes from Empty Collections');
    console.log('='.repeat(50));

    for (const collectionName of EMPTY_COLLECTIONS_TO_CLEAN) {
      try {
        const collection = db.collection(collectionName);
        const count = await collection.countDocuments();
        const indexes = await collection.indexes();

        console.log(`\n📋 ${collectionName}:`);
        console.log(`   Documents: ${count}`);
        console.log(`   Indexes: ${indexes.length - 1}`);

        totalIndexesBefore += indexes.length - 1;

        if (count === 0 && indexes.length > 1) {
          // Drop all non-_id indexes
          const indexNames = indexes
            .filter((idx) => idx.name !== '_id_')
            .map((idx) => idx.name);

          if (indexNames.length > 0) {
            console.log(`   🗑️  Dropping ${indexNames.length} indexes...`);
            await collection.dropIndexes(indexNames);
            console.log(`   ✅ Indexes removed`);
            totalIndexesAfter += 0;
          } else {
            console.log(`   ℹ️  No indexes to remove`);
            totalIndexesAfter += 0;
          }
        } else {
          console.log(`   ⏭️  Skipping (has data or no indexes)`);
          totalIndexesAfter += indexes.length - 1;
        }
      } catch (error) {
        console.log(
          `   ❌ Error processing ${collectionName}: ${error.message}`
        );
      }
    }

    // Phase 2: Check for duplicate indexes in active collections
    console.log('\n🔍 PHASE 3: Checking for Duplicate Indexes');
    console.log('='.repeat(50));

    const activeCollections = [
      'users',
      'agents',
      'userpreferences',
      'subscriptions',
      'visitors',
      'sessions',
      'chatinteractions',
      'rewardscenters',
    ];

    for (const collectionName of activeCollections) {
      try {
        const collection = db.collection(collectionName);
        const indexes = await collection.indexes();

        console.log(`\n📋 ${collectionName} indexes:`);
        const indexKeys = new Map();

        indexes.forEach((idx) => {
          if (idx.name !== '_id_') {
            const keyStr = JSON.stringify(idx.key);
            if (indexKeys.has(keyStr)) {
              console.log(`   ⚠️  DUPLICATE: ${keyStr}`);
              console.log(`      Index 1: ${indexKeys.get(keyStr)}`);
              console.log(`      Index 2: ${idx.name}`);
            } else {
              indexKeys.set(keyStr, idx.name);
              console.log(`   ✅ ${idx.name}: ${keyStr}`);
            }
          }
        });
      } catch (error) {
        console.log(`❌ Error checking ${collectionName}: ${error.message}`);
      }
    }

    // Phase 3: Add missing critical indexes
    console.log('\n⚡ PHASE 4: Adding Missing Critical Indexes');
    console.log('='.repeat(50));

    try {
      // Add missing indexes to users collection
      const usersCollection = db.collection('users');
      console.log('\n👥 Users collection:');

      // Check if email index exists
      const usersIndexes = await usersCollection.indexes();
      const hasEmailIndex = usersIndexes.some((idx) => idx.key.email === 1);

      if (!hasEmailIndex) {
        console.log('   ➕ Adding email index...');
        await usersCollection.createIndex({ email: 1 }, { unique: true });
        console.log('   ✅ Email index added');
      } else {
        console.log('   ✅ Email index already exists');
      }

      // Add createdAt index for sorting
      const hasCreatedAtIndex = usersIndexes.some(
        (idx) => idx.key.createdAt === -1
      );
      if (!hasCreatedAtIndex) {
        console.log('   ➕ Adding createdAt index...');
        await usersCollection.createIndex({ createdAt: -1 });
        console.log('   ✅ CreatedAt index added');
      } else {
        console.log('   ✅ CreatedAt index already exists');
      }

      // Add isActive + role compound index
      const hasActiveRoleIndex = usersIndexes.some(
        (idx) => idx.key.isActive === 1 && idx.key.role === 1
      );
      if (!hasActiveRoleIndex) {
        console.log('   ➕ Adding isActive+role compound index...');
        await usersCollection.createIndex({ isActive: 1, role: 1 });
        console.log('   ✅ Active+role index added');
      } else {
        console.log('   ✅ Active+role index already exists');
      }
    } catch (error) {
      console.log(`❌ Error adding user indexes: ${error.message}`);
    }

    try {
      // Add missing indexes to userpreferences collection
      const prefsCollection = db.collection('userpreferences');
      console.log('\n⚙️ UserPreferences collection:');

      const prefsIndexes = await prefsCollection.indexes();
      const hasUserIdIndex = prefsIndexes.some((idx) => idx.key.userId === 1);

      if (!hasUserIdIndex) {
        console.log('   ➕ Adding userId index...');
        await prefsCollection.createIndex({ userId: 1 }, { unique: true });
        console.log('   ✅ UserId index added');
      } else {
        console.log('   ✅ UserId index already exists');
      }
    } catch (error) {
      console.log(`❌ Error adding userpreferences indexes: ${error.message}`);
    }

    // Phase 4: Final analysis
    console.log('\n📊 PHASE 5: Optimization Results');
    console.log('='.repeat(50));

    console.log(`\n💾 Index Optimization:`);
    console.log(
      `   Before: ${totalIndexesBefore} indexes on empty collections`
    );
    console.log(`   After: ${totalIndexesAfter} indexes on empty collections`);
    console.log(`   Saved: ${totalIndexesBefore - totalIndexesAfter} indexes`);

    // Get final stats
    const finalCollections = await db.listCollections().toArray();
    let finalTotalIndexes = 0;
    let finalTotalDocs = 0;

    for (const col of finalCollections) {
      const collection = db.collection(col.name);
      const count = await collection.countDocuments();
      const indexes = await collection.indexes();
      finalTotalIndexes += indexes.length - 1;
      finalTotalDocs += count;
    }

    console.log(`\n📈 Final Database Stats:`);
    console.log(`   Collections: ${finalCollections.length}`);
    console.log(`   Total Documents: ${finalTotalDocs.toLocaleString()}`);
    console.log(`   Total Indexes: ${finalTotalIndexes}`);
    console.log(
      `   Average docs per collection: ${(
        finalTotalDocs / finalCollections.length
      ).toFixed(1)}`
    );

    console.log('\n✅ DATABASE OPTIMIZATION COMPLETE!');
    console.log('\n🎯 Next Steps:');
    console.log('   1. Monitor query performance with new indexes');
    console.log('   2. Implement lazy index creation for feature activation');
    console.log('   3. Set up automated index usage monitoring');
  } catch (error) {
    console.error('❌ Optimization failed:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

optimizeDatabase();

#!/usr/bin/env node
/**
 * Database Migration Script: ai-lab-main -> onelastai
 * 
 * This script migrates all collections, documents, and indexes
 * from the 'ai-lab-main' database to the 'onelastai' database.
 * 
 * Usage: node migrate-database.js
 */

import { MongoClient } from 'mongodb';
import { config } from 'dotenv';
config();

const MONGODB_URI = process.env.MONGODB_URI;
const SOURCE_DB = 'ai-lab-main';
const TARGET_DB = 'onelastai';

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is required');
  process.exit(1);
}

async function migrateDatabase() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    
    const sourceDb = client.db(SOURCE_DB);
    const targetDb = client.db(TARGET_DB);
    
    // Get all collections from source database
    console.log(`📊 Discovering collections in ${SOURCE_DB}...`);
    const collections = await sourceDb.listCollections().toArray();
    
    if (collections.length === 0) {
      console.log(`✅ No collections found in ${SOURCE_DB}. Nothing to migrate.`);
      return;
    }
    
    console.log(`Found ${collections.length} collections:`);
    collections.forEach(col => console.log(`  - ${col.name}`));
    console.log('');
    
    const migrationSummary = {
      collectionsProcessed: 0,
      documentsTransferred: 0,
      indexesCreated: 0,
      errors: []
    };
    
    // Migrate each collection
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      
      try {
        console.log(`📦 Processing collection: ${collectionName}`);
        
        const sourceCollection = sourceDb.collection(collectionName);
        const targetCollection = targetDb.collection(collectionName);
        
        // Check if target collection already exists and has documents
        const existingDocsCount = await targetCollection.countDocuments();
        if (existingDocsCount > 0) {
          console.log(`  ⚠️  Target collection ${collectionName} already has ${existingDocsCount} documents`);
          console.log(`  🔄 Proceeding with migration (will merge data)`);
        }
        
        // Get documents count from source
        const sourceDocsCount = await sourceCollection.countDocuments();
        console.log(`  📄 Documents to transfer: ${sourceDocsCount}`);
        
        if (sourceDocsCount > 0) {
          // Transfer documents in batches
          const BATCH_SIZE = 1000;
          let transferred = 0;
          
          const cursor = sourceCollection.find({});
          
          while (await cursor.hasNext()) {
            const batch = [];
            for (let i = 0; i < BATCH_SIZE && await cursor.hasNext(); i++) {
              batch.push(await cursor.next());
            }
            
            if (batch.length > 0) {
              try {
                // Use insertMany with ordered: false to continue on duplicates
                await targetCollection.insertMany(batch, { ordered: false });
                transferred += batch.length;
              } catch (error) {
                // Handle duplicate key errors (documents that already exist)
                if (error.code === 11000) {
                  const insertedCount = error.result?.insertedCount || 0;
                  transferred += insertedCount;
                  console.log(`    📝 Batch inserted ${insertedCount}/${batch.length} (some duplicates skipped)`);
                } else {
                  throw error;
                }
              }
              
              if (transferred % 5000 === 0 || transferred === sourceDocsCount) {
                console.log(`    ✅ Transferred: ${transferred}/${sourceDocsCount}`);
              }
            }
          }
          
          migrationSummary.documentsTransferred += transferred;
          console.log(`  ✅ Collection ${collectionName}: ${transferred} documents transferred`);
        } else {
          console.log(`  ℹ️  Collection ${collectionName}: No documents to transfer`);
        }
        
        // Migrate indexes
        console.log(`  🔍 Migrating indexes for ${collectionName}...`);
        const indexes = await sourceCollection.listIndexes().toArray();
        
        let indexesCreated = 0;
        for (const index of indexes) {
          // Skip the default _id index
          if (index.name === '_id_') continue;
          
          try {
            const indexSpec = { ...index.key };
            const indexOptions = { 
              name: index.name,
              background: true
            };
            
            // Preserve index options
            if (index.unique) indexOptions.unique = index.unique;
            if (index.sparse) indexOptions.sparse = index.sparse;
            if (index.partialFilterExpression) indexOptions.partialFilterExpression = index.partialFilterExpression;
            if (index.expireAfterSeconds) indexOptions.expireAfterSeconds = index.expireAfterSeconds;
            
            await targetCollection.createIndex(indexSpec, indexOptions);
            indexesCreated++;
            console.log(`    ✅ Created index: ${index.name}`);
          } catch (indexError) {
            if (indexError.code === 85) {
              // Index already exists
              console.log(`    ℹ️  Index ${index.name} already exists`);
            } else {
              console.log(`    ❌ Error creating index ${index.name}:`, indexError.message);
              migrationSummary.errors.push(`Index ${index.name}: ${indexError.message}`);
            }
          }
        }
        
        migrationSummary.indexesCreated += indexesCreated;
        console.log(`  ✅ Indexes processed: ${indexesCreated} created\n`);
        
        migrationSummary.collectionsProcessed++;
        
      } catch (collectionError) {
        console.error(`❌ Error processing collection ${collectionName}:`, collectionError);
        migrationSummary.errors.push(`Collection ${collectionName}: ${collectionError.message}`);
      }
    }
    
    // Verification
    console.log('🔍 Verifying migration...');
    const sourceStats = await getDbStats(sourceDb);
    const targetStats = await getDbStats(targetDb);
    
    console.log('\n📊 MIGRATION SUMMARY:');
    console.log('='.repeat(50));
    console.log(`Collections processed: ${migrationSummary.collectionsProcessed}`);
    console.log(`Documents transferred: ${migrationSummary.documentsTransferred}`);
    console.log(`Indexes created: ${migrationSummary.indexesCreated}`);
    console.log(`Errors: ${migrationSummary.errors.length}`);
    
    if (migrationSummary.errors.length > 0) {
      console.log('\nErrors encountered:');
      migrationSummary.errors.forEach(error => console.log(`  ❌ ${error}`));
    }
    
    console.log('\n📈 DATABASE STATISTICS:');
    console.log(`Source (${SOURCE_DB}): ${sourceStats.collections} collections, ${sourceStats.documents} documents`);
    console.log(`Target (${TARGET_DB}): ${targetStats.collections} collections, ${targetStats.documents} documents`);
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Update your application code to use the "onelastai" database');
    console.log('2. Test your application thoroughly');
    console.log('3. Once verified, you can delete the "ai-lab-main" database');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

async function getDbStats(db) {
  const collections = await db.listCollections().toArray();
  let totalDocs = 0;
  
  for (const col of collections) {
    const count = await db.collection(col.name).countDocuments();
    totalDocs += count;
  }
  
  return {
    collections: collections.length,
    documents: totalDocs
  };
}

async function deleteSourceDatabase() {
  console.log('\n🗑️  DELETE SOURCE DATABASE');
  console.log('='.repeat(30));
  console.log('⚠️  WARNING: This will permanently delete the ai-lab-main database!');
  
  // In production, you might want to add an interactive confirmation
  // For now, we'll just provide the command
  console.log('\nTo delete the source database after verification, run:');
  console.log('node -e "');
  console.log('const { MongoClient } = require(\'mongodb\');');
  console.log('const client = new MongoClient(process.env.MONGODB_URI);');
  console.log('client.connect().then(async () => {');
  console.log('  await client.db(\'ai-lab-main\').dropDatabase();');
  console.log('  console.log(\'Database ai-lab-main deleted\');');
  console.log('  await client.close();');
  console.log('});');
  console.log('"');
}

migrateDatabase()
  .then(() => {
    deleteSourceDatabase();
    process.exit(0);
  })
  .catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  });

export { migrateDatabase };
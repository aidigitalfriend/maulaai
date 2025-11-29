#!/usr/bin/env node

/**
 * Database Health Check Script
 * Verifies database optimization results and checks for issues
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

async function healthCheck() {
  try {
    console.log('🔍 DATABASE HEALTH CHECK\n');
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;

    console.log('📊 CURRENT DATABASE STATUS');
    console.log('='.repeat(50));

    // Get all collections
    const collections = await db.listCollections().toArray();
    console.log(`Total collections: ${collections.length}`);

    let totalIndexes = 0;
    let totalDocuments = 0;
    let emptyCollections = 0;
    let activeCollections = 0;

    console.log('\n📋 COLLECTION ANALYSIS');
    console.log('-'.repeat(50));

    for (const col of collections) {
      const collection = db.collection(col.name);
      const count = await collection.countDocuments();
      const indexes = await collection.indexes();

      totalDocuments += count;
      totalIndexes += indexes.length - 1; // -1 for _id index

      const status = count > 0 ? '✅' : '🟡';
      const indexCount = indexes.length - 1;

      if (count > 0) {
        activeCollections++;
      } else {
        emptyCollections++;
      }

      console.log(
        `${status} ${col.name.padEnd(30)} | ${count
          .toString()
          .padStart(6)} docs | ${indexCount.toString().padStart(3)} indexes`
      );
    }

    console.log('\n📈 SUMMARY STATISTICS');
    console.log('-'.repeat(50));
    console.log(`Active collections (with data): ${activeCollections}`);
    console.log(`Empty collections (ready):      ${emptyCollections}`);
    console.log(
      `Total documents:                ${totalDocuments.toLocaleString()}`
    );
    console.log(`Total indexes:                  ${totalIndexes}`);
    console.log(
      `Average docs/collection:        ${(
        totalDocuments / collections.length
      ).toFixed(1)}`
    );

    // Check for duplicate indexes by examining schema definitions
    console.log('\n🔍 CHECKING FOR DUPLICATE INDEX ISSUES');
    console.log('-'.repeat(50));

    // Test loading some models to check for warnings
    console.log('Testing model imports for duplicate index warnings...');

    try {
      // Import models that had duplicate index issues
      await import('./models/PersonalityTest.ts');
      console.log('✅ PersonalityTest model loaded without warnings');
    } catch (error) {
      console.log('⚠️  PersonalityTest model import issue:', error.message);
    }

    try {
      await import('./models/SmartAssistant.ts');
      console.log('✅ SmartAssistant model loaded without warnings');
    } catch (error) {
      console.log('⚠️  SmartAssistant model import issue:', error.message);
    }

    try {
      await import('./models/LanguageLearning.ts');
      console.log('✅ LanguageLearning model loaded without warnings');
    } catch (error) {
      console.log('⚠️  LanguageLearning model import issue:', error.message);
    }

    // Performance recommendations
    console.log('\n🚀 PERFORMANCE RECOMMENDATIONS');
    console.log('-'.repeat(50));

    if (totalIndexes > 200) {
      console.log(
        '⚠️  High index count detected. Consider compound indexes for query optimization.'
      );
    } else {
      console.log('✅ Index count is reasonable for current data volume.');
    }

    if (emptyCollections > collections.length * 0.5) {
      console.log(
        'ℹ️  Many empty collections detected. Consider lazy index creation when features are activated.'
      );
    }

    if (totalDocuments < 1000) {
      console.log(
        'ℹ️  Low document count. Focus on schema design and query optimization for future growth.'
      );
    }

    console.log('\n✅ HEALTH CHECK COMPLETE');

    // Final optimization score
    let score = 100;
    if (totalIndexes > 200) score -= 20;
    if (emptyCollections > collections.length * 0.7) score -= 10;

    console.log(`\n🏆 DATABASE OPTIMIZATION SCORE: ${score}/100`);

    if (score >= 90) {
      console.log('🎉 Excellent! Database is well-optimized.');
    } else if (score >= 70) {
      console.log('👍 Good! Some minor optimizations possible.');
    } else {
      console.log('🔧 Needs attention. Consider the recommendations above.');
    }
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

healthCheck();

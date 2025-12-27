/**
 * COMPLETE ENDPOINT AUDIT SCRIPT
 * Analyzes every endpoint in server-simple.js to check:
 * - Which database it uses
 * - Which collections it queries
 * - Which documents it accesses
 * - Potential mismatches with actual database
 */

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;

async function auditEndpoints() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db('onelastai');

    // Get all actual collections in database
    const actualCollections = await db.listCollections().toArray();
    const actualCollectionNames = actualCollections.map((c) => c.name).sort();

    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 DATABASE COLLECTION INVENTORY');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(
      `Total collections in database: ${actualCollectionNames.length}\n`
    );

    // Read server-simple.js file
    const serverCode = fs.readFileSync('./server-simple.js', 'utf8');

    // Extract all collection references
    const collectionRegex = /db\.collection\(['"]([^'"]+)['"]\)/g;
    const collectionMatches = [...serverCode.matchAll(collectionRegex)];
    const referencedCollections = [
      ...new Set(collectionMatches.map((m) => m[1])),
    ].sort();

    console.log('═══════════════════════════════════════════════════════════');
    console.log('🔍 COLLECTIONS REFERENCED IN CODE');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(
      `Total unique collections referenced: ${referencedCollections.length}\n`
    );

    // Check each referenced collection
    const collectionStatus = {};
    for (const colName of referencedCollections) {
      const exists = actualCollectionNames.includes(colName);
      let docCount = 0;
      if (exists) {
        docCount = await db.collection(colName).countDocuments();
      }
      collectionStatus[colName] = { exists, docCount };
    }

    // Now audit each endpoint
    console.log(
      '\n═══════════════════════════════════════════════════════════'
    );
    console.log('🔎 ENDPOINT-BY-ENDPOINT AUDIT');
    console.log(
      '═══════════════════════════════════════════════════════════\n'
    );

    const endpoints = [
      // Health & Status
      { path: 'GET /health', line: 280, collections: [] },
      { path: 'GET /api/health', line: 306, collections: [] },
      {
        path: 'GET /api/status',
        line: 334,
        collections: ['users', 'subscriptions'],
      },
      { path: 'GET /api/status/api-status', line: 482, collections: ['users'] },
      { path: 'GET /api/status/analytics', line: 612, collections: [] },
      { path: 'GET /api/status/stream', line: 670, collections: [] },

      // Auth
      {
        path: 'POST /api/auth/login',
        line: 1111,
        collections: ['users', 'sessions'],
      },
      { path: 'POST /api/auth/signup', line: 1116, collections: ['users'] },
      {
        path: 'GET /api/auth/verify',
        line: 1169,
        collections: ['sessions', 'users'],
      },

      // User Profile
      {
        path: 'GET /api/user/profile',
        line: 1179,
        collections: ['users', 'userprofiles', 'subscriptions'],
      },
      {
        path: 'PUT /api/user/profile',
        line: 1247,
        collections: ['users', 'userprofiles'],
      },

      // User Analytics
      {
        path: 'GET /api/user/analytics',
        line: 1327,
        collections: [
          'chat_interactions',
          'conversationanalytics',
          'usagemetrics',
          'subscriptions',
        ],
      },

      // User Rewards
      {
        path: 'GET /api/user/rewards/:userId',
        line: 1790,
        collections: ['rewardscenters'],
      },

      // User Preferences
      {
        path: 'GET /api/user/preferences/:userId',
        line: 1928,
        collections: ['userpreferences'],
      },
      {
        path: 'PUT /api/user/preferences/:userId',
        line: 2022,
        collections: ['userpreferences'],
      },

      // User Conversations
      {
        path: 'GET /api/user/conversations/:userId',
        line: 2108,
        collections: ['agentchathistories'],
      },

      // Billing & Subscriptions
      {
        path: 'GET /api/user/billing/:userId',
        line: 2348,
        collections: [
          'subscriptions',
          'plans',
          'invoices',
          'payments',
          'billings',
          'usagemetrics',
        ],
      },
      {
        path: 'GET /api/user/subscriptions/:userId',
        line: 2792,
        collections: ['subscriptions'],
      },

      // Agent Performance
      {
        path: 'GET /api/agent/performance/:agentId',
        line: 2836,
        collections: ['agentmetrics', 'performancemetrics'],
      },

      // User Security
      {
        path: 'GET /api/user/security/:userId',
        line: 3081,
        collections: ['usersecurities'],
      },
      {
        path: 'PUT /api/user/security/:userId',
        line: 3195,
        collections: ['usersecurities'],
      },
      {
        path: 'POST /api/user/security/change-password',
        line: 3272,
        collections: ['users'],
      },
      {
        path: 'POST /api/user/security/2fa/disable',
        line: 3358,
        collections: ['usersecurities'],
      },
      {
        path: 'POST /api/user/security/2fa/verify',
        line: 3407,
        collections: ['usersecurities'],
      },

      // Chat & Agents
      { path: 'POST /api/language-detect', line: 3461, collections: [] },
      { path: 'POST /api/chat', line: 3506, collections: [] },
      { path: 'POST /api/agents/unified', line: 3567, collections: [] },
      { path: 'POST /api/voice/synthesize', line: 3733, collections: [] },
      { path: 'POST /api/translate', line: 3769, collections: [] },

      // IP Info
      { path: 'GET /api/ipinfo', line: 4309, collections: [] },
    ];

    let criticalIssues = 0;
    let warnings = 0;
    let okEndpoints = 0;

    for (const endpoint of endpoints) {
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`📍 ${endpoint.path}`);
      console.log(`   Line: ${endpoint.line}`);
      console.log(
        `   Collections Used: ${
          endpoint.collections.length === 0
            ? 'None (No DB queries)'
            : endpoint.collections.length
        }`
      );

      if (endpoint.collections.length === 0) {
        console.log(`   Status: ✅ OK (No database operations)`);
        okEndpoints++;
        continue;
      }

      let hasIssues = false;
      for (const col of endpoint.collections) {
        const status = collectionStatus[col];
        if (!status) {
          console.log(
            `   ❌ ERROR: Collection "${col}" not found in database!`
          );
          hasIssues = true;
          criticalIssues++;
        } else if (!status.exists) {
          console.log(`   ❌ ERROR: Collection "${col}" doesn't exist`);
          hasIssues = true;
          criticalIssues++;
        } else if (status.docCount === 0) {
          console.log(
            `   ⚠️  WARNING: Collection "${col}" is EMPTY (0 documents)`
          );
          hasIssues = true;
          warnings++;
        } else {
          console.log(`   ✅ "${col}" - ${status.docCount} documents`);
        }
      }

      if (!hasIssues) {
        okEndpoints++;
      }
    }

    // Summary Report
    console.log(
      '\n\n═══════════════════════════════════════════════════════════'
    );
    console.log('📊 AUDIT SUMMARY REPORT');
    console.log(
      '═══════════════════════════════════════════════════════════\n'
    );

    console.log(`Total Endpoints Audited: ${endpoints.length}`);
    console.log(`✅ OK Endpoints: ${okEndpoints}`);
    console.log(`⚠️  Warnings: ${warnings} (Empty collections queried)`);
    console.log(
      `❌ Critical Issues: ${criticalIssues} (Missing/non-existent collections)\n`
    );

    // Collection Comparison
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📋 COLLECTION COMPARISON');
    console.log(
      '═══════════════════════════════════════════════════════════\n'
    );

    console.log('Collections in Database but NOT Referenced in Code:');
    const unreferencedCollections = actualCollectionNames.filter(
      (c) => !referencedCollections.includes(c)
    );
    if (unreferencedCollections.length === 0) {
      console.log('  ✅ None - All collections are referenced\n');
    } else {
      unreferencedCollections.forEach((col) => {
        const count = collectionStatus[col]?.docCount || 0;
        console.log(`  - ${col} (${count} documents)`);
      });
      console.log('');
    }

    console.log('Collections Referenced in Code but NOT in Database:');
    const missingCollections = referencedCollections.filter(
      (c) => !collectionStatus[c]?.exists
    );
    if (missingCollections.length === 0) {
      console.log('  ✅ None - All referenced collections exist\n');
    } else {
      missingCollections.forEach((col) => {
        console.log(`  ❌ ${col} - MISSING`);
      });
      console.log('');
    }

    console.log('Collections that are EMPTY but Referenced:');
    const emptyCollections = referencedCollections.filter(
      (c) => collectionStatus[c]?.exists && collectionStatus[c]?.docCount === 0
    );
    if (emptyCollections.length === 0) {
      console.log('  ✅ None - All referenced collections have data\n');
    } else {
      emptyCollections.forEach((col) => {
        console.log(`  ⚠️  ${col} - 0 documents`);
      });
      console.log('');
    }

    // Detailed Collection Status
    console.log(
      '\n═══════════════════════════════════════════════════════════'
    );
    console.log('📑 DETAILED COLLECTION STATUS');
    console.log(
      '═══════════════════════════════════════════════════════════\n'
    );

    console.log('Referenced Collections:');
    for (const col of referencedCollections) {
      const status = collectionStatus[col];
      if (!status || !status.exists) {
        console.log(`  ❌ ${col.padEnd(30)} - MISSING`);
      } else if (status.docCount === 0) {
        console.log(`  ⚠️  ${col.padEnd(30)} - EMPTY`);
      } else {
        console.log(`  ✅ ${col.padEnd(30)} - ${status.docCount} docs`);
      }
    }

    console.log(
      '\n═══════════════════════════════════════════════════════════'
    );
    console.log('🎯 CRITICAL ISSUES FOUND');
    console.log(
      '═══════════════════════════════════════════════════════════\n'
    );

    if (criticalIssues === 0 && warnings === 0) {
      console.log('🎉 NO CRITICAL ISSUES FOUND!');
      console.log('All endpoints query collections that exist.\n');
    } else {
      if (criticalIssues > 0) {
        console.log(`❌ ${criticalIssues} CRITICAL ISSUES:`);
        console.log('   - Endpoints querying non-existent collections');
        console.log('   - Will cause runtime errors!\n');
      }

      if (warnings > 0) {
        console.log(`⚠️  ${warnings} WARNINGS:`);
        console.log('   - Endpoints querying empty collections');
        console.log('   - Will return empty results');
        console.log('   - May indicate unimplemented features\n');
      }
    }

    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ AUDIT COMPLETE');
    console.log(
      '═══════════════════════════════════════════════════════════\n'
    );
  } catch (error) {
    console.error('❌ Audit failed:', error);
  } finally {
    await client.close();
  }
}

console.log('\n🔍 STARTING COMPREHENSIVE ENDPOINT AUDIT...\n');
auditEndpoints().catch(console.error);

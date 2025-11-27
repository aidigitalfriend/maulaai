#!/usr/bin/env node

/**
 * Agent Database Migration Script - ES Module Version
 * 
 * This script migrates agent data from individual collections to the main 'agents' collection.
 * It handles backup, consolidation, and cleanup of scattered agent data.
 */

import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const BACKUP_DIR = path.join(__dirname, '../backups');
const LOG_FILE = path.join(__dirname, '../logs/migration.log');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Ensure logs directory exists
const logsDir = path.dirname(LOG_FILE);
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Logging function
function log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${level}: ${message}`;
    console.log(logMessage);
    fs.appendFileSync(LOG_FILE, logMessage + '\n');
}

// Agent schema for main collection
const agentSchema = new mongoose.Schema({
    agentId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: String,
    description: String,
    avatar: String,
    expertise: [String],
    personality: String,
    conversationStyle: String,
    responseFormat: String,
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    metrics: {
        conversations: { type: Number, default: 0 },
        rating: { type: Number, default: 0 },
        totalSessions: { type: Number, default: 0 }
    }
}, { 
    timestamps: true,
    collection: 'agents' 
});

async function connectToDatabase() {
    try {
        const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL;
        if (!mongoUri) {
            throw new Error('MongoDB URI not found in environment variables');
        }

        await mongoose.connect(mongoUri);
        log('✅ Connected to MongoDB successfully');
        return true;
    } catch (error) {
        log(`❌ Failed to connect to MongoDB: ${error.message}`, 'ERROR');
        return false;
    }
}

async function discoverAgentCollections() {
    try {
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        
        // Filter for agent collections (excluding the main 'agents' collection)
        const agentCollections = collections
            .map(col => col.name)
            .filter(name => name.startsWith('agent_') && name !== 'agents')
            .sort();

        log(`📁 Discovered ${agentCollections.length} individual agent collections:`);
        agentCollections.forEach(name => log(`   - ${name}`));
        
        return agentCollections;
    } catch (error) {
        log(`❌ Failed to discover collections: ${error.message}`, 'ERROR');
        return [];
    }
}

async function createBackup(collectionName) {
    try {
        const db = mongoose.connection.db;
        const collection = db.collection(collectionName);
        const data = await collection.find({}).toArray();
        
        const backupFile = path.join(BACKUP_DIR, `${collectionName}_backup_${Date.now()}.json`);
        fs.writeFileSync(backupFile, JSON.stringify(data, null, 2));
        
        log(`💾 Backup created for ${collectionName}: ${backupFile}`);
        return { success: true, file: backupFile, count: data.length };
    } catch (error) {
        log(`❌ Failed to backup ${collectionName}: ${error.message}`, 'ERROR');
        return { success: false, error: error.message };
    }
}

async function analyzeAgentData(collectionName) {
    try {
        const db = mongoose.connection.db;
        const collection = db.collection(collectionName);
        
        const count = await collection.countDocuments();
        const sample = await collection.findOne();
        
        log(`📊 ${collectionName}: ${count} documents`);
        if (sample) {
            log(`   Sample fields: ${Object.keys(sample).join(', ')}`);
        }
        
        return { count, sample, hasData: count > 0 };
    } catch (error) {
        log(`❌ Failed to analyze ${collectionName}: ${error.message}`, 'ERROR');
        return { count: 0, sample: null, hasData: false };
    }
}

async function migrateAgentCollection(collectionName) {
    try {
        const db = mongoose.connection.db;
        const sourceCollection = db.collection(collectionName);
        const agents = await sourceCollection.find({}).toArray();
        
        if (agents.length === 0) {
            log(`⚠️  ${collectionName} is empty, skipping`);
            return { success: true, migrated: 0 };
        }

        // Transform agents to match main collection schema
        const transformedAgents = agents.map(agent => {
            // Extract agentId from collection name if not present
            const agentId = agent.agentId || collectionName.replace('agent_', '');
            
            return {
                ...agent,
                agentId,
                name: agent.name || agentId,
                isActive: agent.isActive !== undefined ? agent.isActive : true,
                createdAt: agent.createdAt || new Date(),
                updatedAt: new Date(),
                metrics: {
                    conversations: agent.conversations || agent.metrics?.conversations || 0,
                    rating: agent.rating || agent.metrics?.rating || 0,
                    totalSessions: agent.totalSessions || agent.metrics?.totalSessions || 0
                }
            };
        });

        if (DRY_RUN) {
            log(`🔍 DRY RUN: Would migrate ${transformedAgents.length} agents from ${collectionName}`);
            log(`   Sample transformed agent: ${JSON.stringify(transformedAgents[0], null, 2)}`);
            return { success: true, migrated: transformedAgents.length, dryRun: true };
        }

        // Insert into main agents collection using upsert to handle duplicates
        const Agent = mongoose.model('Agent', agentSchema);
        let migratedCount = 0;
        
        for (const agentData of transformedAgents) {
            try {
                await Agent.findOneAndUpdate(
                    { agentId: agentData.agentId },
                    agentData,
                    { upsert: true, new: true }
                );
                migratedCount++;
            } catch (error) {
                log(`⚠️  Failed to migrate agent ${agentData.agentId}: ${error.message}`, 'WARN');
            }
        }

        log(`✅ Successfully migrated ${migratedCount}/${transformedAgents.length} agents from ${collectionName}`);
        return { success: true, migrated: migratedCount };
        
    } catch (error) {
        log(`❌ Failed to migrate ${collectionName}: ${error.message}`, 'ERROR');
        return { success: false, error: error.message };
    }
}

async function cleanupOldCollection(collectionName) {
    if (DRY_RUN) {
        log(`🔍 DRY RUN: Would drop collection ${collectionName}`);
        return { success: true, dryRun: true };
    }

    try {
        const db = mongoose.connection.db;
        await db.collection(collectionName).drop();
        log(`🗑️  Dropped old collection: ${collectionName}`);
        return { success: true };
    } catch (error) {
        log(`⚠️  Failed to drop ${collectionName}: ${error.message}`, 'WARN');
        return { success: false, error: error.message };
    }
}

async function optimizeMainCollection() {
    if (DRY_RUN) {
        log('🔍 DRY RUN: Would optimize main agents collection');
        return { success: true, dryRun: true };
    }

    try {
        const Agent = mongoose.model('Agent', agentSchema);
        
        // Ensure indexes
        await Agent.createIndexes();
        log('🔧 Optimized indexes on agents collection');
        
        // Get final count
        const totalAgents = await Agent.countDocuments();
        log(`📊 Final agents collection contains ${totalAgents} documents`);
        
        return { success: true, totalAgents };
    } catch (error) {
        log(`❌ Failed to optimize main collection: ${error.message}`, 'ERROR');
        return { success: false, error: error.message };
    }
}

async function runMigration() {
    log('🚀 Starting Agent Database Migration');
    log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE MIGRATION'}`);
    
    const results = {
        connected: false,
        collections: [],
        backups: [],
        migrations: [],
        cleanups: [],
        optimized: false,
        errors: []
    };

    try {
        // Step 1: Connect to database
        results.connected = await connectToDatabase();
        if (!results.connected) {
            throw new Error('Failed to connect to database');
        }

        // Step 2: Discover agent collections
        const agentCollections = await discoverAgentCollections();
        results.collections = agentCollections;
        
        if (agentCollections.length === 0) {
            log('✅ No individual agent collections found to migrate');
            return results;
        }

        // Step 3: Analyze each collection
        log('\n📊 Analyzing individual agent collections:');
        for (const collectionName of agentCollections) {
            const analysis = await analyzeAgentData(collectionName);
            if (!analysis.hasData) {
                log(`⚠️  Skipping empty collection: ${collectionName}`);
                continue;
            }
        }

        // Step 4: Create backups
        log('\n💾 Creating backups:');
        for (const collectionName of agentCollections) {
            const backup = await createBackup(collectionName);
            results.backups.push({ collection: collectionName, ...backup });
        }

        // Step 5: Migrate data
        log('\n🔄 Migrating agent data:');
        for (const collectionName of agentCollections) {
            const migration = await migrateAgentCollection(collectionName);
            results.migrations.push({ collection: collectionName, ...migration });
        }

        // Step 6: Clean up old collections (only if not dry run and migrations were successful)
        if (!DRY_RUN && results.migrations.every(m => m.success)) {
            log('\n🗑️  Cleaning up old collections:');
            for (const collectionName of agentCollections) {
                const cleanup = await cleanupOldCollection(collectionName);
                results.cleanups.push({ collection: collectionName, ...cleanup });
            }
        }

        // Step 7: Optimize main collection
        log('\n🔧 Optimizing main agents collection:');
        const optimization = await optimizeMainCollection();
        results.optimized = optimization.success;

        // Summary
        log('\n📋 Migration Summary:');
        const totalMigrated = results.migrations.reduce((sum, m) => sum + (m.migrated || 0), 0);
        log(`   Collections processed: ${agentCollections.length}`);
        log(`   Agents migrated: ${totalMigrated}`);
        log(`   Backups created: ${results.backups.filter(b => b.success).length}`);
        
        if (!DRY_RUN) {
            log(`   Collections cleaned up: ${results.cleanups.filter(c => c.success).length}`);
        }
        
        log('✅ Migration completed successfully');

    } catch (error) {
        log(`❌ Migration failed: ${error.message}`, 'ERROR');
        results.errors.push(error.message);
    } finally {
        await mongoose.disconnect();
        log('🔌 Disconnected from MongoDB');
    }

    return results;
}

// Run migration if this is the main module
runMigration().catch(error => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
});

export { runMigration };

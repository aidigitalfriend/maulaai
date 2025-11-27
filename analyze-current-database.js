#!/usr/bin/env node

/**
 * Database Structure Analysis Script
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

if (!MONGODB_URI) {
    console.error('❌ MongoDB URI not found in environment variables');
    process.exit(1);
}

async function analyzeDatabaseStructure() {
    try {
        console.log('🔍 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        
        const db = mongoose.connection.db;
        const dbName = db.databaseName;
        
        console.log(`\n📊 CURRENT DATABASE STRUCTURE`);
        console.log(`Database: ${dbName}`);
        console.log(`Timestamp: ${new Date().toISOString()}`);
        console.log('='.repeat(60));
        
        // Get all collections
        const collections = await db.listCollections().toArray();
        
        if (collections.length === 0) {
            console.log('\n❌ No collections found in database');
            return;
        }
        
        console.log(`\n📁 ALL COLLECTIONS (${collections.length} total)`);
        console.log('-'.repeat(60));
        
        const collectionStats = [];
        
        for (const collectionInfo of collections) {
            const collectionName = collectionInfo.name;
            
            try {
                const collection = db.collection(collectionName);
                const count = await collection.countDocuments();
                
                collectionStats.push({
                    name: collectionName,
                    count
                });
                
                console.log(`${collectionName.padEnd(35)} | ${count.toString().padStart(6)} docs`);
                
            } catch (error) {
                console.log(`${collectionName.padEnd(35)} | ERROR: ${error.message}`);
            }
        }
        
        // Show key collections in detail
        const keyCollections = ['agents', 'users', 'userprofiles', 'userpreferences'];
        
        console.log('\n🔍 KEY COLLECTIONS DETAILS');
        console.log('-'.repeat(60));
        
        for (const collectionName of keyCollections) {
            const collection = db.collection(collectionName);
            const count = await collection.countDocuments();
            
            console.log(`\n📋 ${collectionName.toUpperCase()}: ${count} documents`);
            
            if (count > 0) {
                // Show sample document structure
                const sampleDoc = await collection.findOne({});
                if (sampleDoc) {
                    console.log('   Sample document fields:');
                    Object.keys(sampleDoc).forEach(key => {
                        if (key !== 'password' && !key.includes('token')) {
                            console.log(`     - ${key}: ${typeof sampleDoc[key]}`);
                        }
                    });
                }
                
                // Show recent entries
                const recentDocs = await collection.find({})
                    .sort({ createdAt: -1, _id: -1 })
                    .limit(3)
                    .toArray();
                    
                if (recentDocs.length > 0) {
                    console.log('   Recent entries:');
                    recentDocs.forEach((doc, i) => {
                        const identifier = doc.name || doc.email || doc.agentId || doc._id.toString().slice(-6);
                        console.log(`     ${i + 1}. ${identifier}`);
                    });
                }
            }
        }
        
        // Agent analysis
        console.log('\n🤖 AGENTS COLLECTION ANALYSIS');
        console.log('-'.repeat(60));
        
        const agentsCollection = db.collection('agents');
        const agentCount = await agentsCollection.countDocuments();
        
        if (agentCount > 0) {
            console.log(`Total Agents: ${agentCount}`);
            
            // Get all agent names
            const agents = await agentsCollection.find({}, { name: 1, agentId: 1, isActive: 1 }).toArray();
            
            console.log('\nAll Agents:');
            agents.forEach((agent, i) => {
                const status = agent.isActive ? '✅' : '❌';
                console.log(`  ${i + 1}. ${status} ${agent.name} (${agent.agentId})`);
            });
        } else {
            console.log('No agents found in main collection');
        }
        
        // Summary
        const totalDocs = collectionStats.reduce((sum, stat) => sum + stat.count, 0);
        
        console.log('\n📊 DATABASE SUMMARY');
        console.log('-'.repeat(60));
        console.log(`Total Collections: ${collections.length}`);
        console.log(`Total Documents: ${totalDocs.toLocaleString()}`);
        
        console.log('\n✅ Analysis complete!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
    }
}

analyzeDatabaseStructure();

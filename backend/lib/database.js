/**
 * DATABASE OPTIMIZATION UTILITIES
 * Query optimization, indexing, and connection management
 */

import mongoose from 'mongoose';

// ============================================
// CONNECTION OPTIMIZATION
// ============================================

export const connectionConfig = {
  // Connection options for better performance
  options: {
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    bufferCommands: false, // Disable mongoose buffering
    bufferMaxEntries: 0, // Disable mongoose buffering
    maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
    family: 4, // Use IPv4, skip trying IPv6
    retryWrites: true,
    retryReads: true,
    readPreference: 'primaryPreferred'
  },

  // Connection monitoring
  monitorConnection: () => {
    const conn = mongoose.connection;

    conn.on('connected', () => {
      console.log('✅ MongoDB connected');
    });

    conn.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    conn.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });

    // Monitor connection pool
    setInterval(() => {
      const stats = {
        readyState: conn.readyState,
        name: conn.name,
        host: conn.host,
        port: conn.port,
        poolSize: conn.db?.serverConfig?.poolSize || 0
      };
      console.log('📊 DB Connection Stats:', stats);
    }, 300000); // Every 5 minutes
  }
};

// ============================================
// INDEX OPTIMIZATION
// ============================================

export const indexManager = {
  // Ensure indexes exist
  ensureIndexes: async () => {
    try {
      const collections = [
        'users',
        'userprofiles',
        'user_sessions',
        'user_preferences',
        'global-userprofiles',
        'global-users',
        'global-user_sessions',
        'global-user_preferences',
        'global-subscriptions',
        'global-transactions',
        'global-usage_analytics',
        'global-notification_settings'
      ];

      for (const collectionName of collections) {
        const collection = mongoose.connection.db.collection(collectionName);

        // Check if collection exists
        const exists = await collection.countDocuments({}).limit(1).hasNext();
        if (!exists) continue;

        // Create optimized indexes
        const indexes = await indexManager.getRecommendedIndexes(collectionName);
        for (const index of indexes) {
          try {
            await collection.createIndex(index.fields, index.options || {});
            console.log(`✅ Created index on ${collectionName}:`, index.fields);
          } catch (error) {
            if (!error.message.includes('already exists')) {
              console.warn(`⚠️ Failed to create index on ${collectionName}:`, error.message);
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ Index creation error:', error);
    }
  },

  // Get recommended indexes for each collection
  getRecommendedIndexes: (collectionName) => {
    const indexes = {
      users: [
        { fields: { email: 1 }, options: { unique: true } },
        { fields: { createdAt: -1 } },
        { fields: { lastLogin: -1 } },
        { fields: { isActive: 1, createdAt: -1 } }
      ],
      userprofiles: [
        { fields: { userId: 1 }, options: { unique: true } },
        { fields: { username: 1 }, options: { unique: true, sparse: true } },
        { fields: { createdAt: -1 } },
        { fields: { updatedAt: -1 } }
      ],
      user_sessions: [
        { fields: { userId: 1, createdAt: -1 } },
        { fields: { sessionToken: 1 }, options: { unique: true } },
        { fields: { expiresAt: 1 }, options: { expireAfterSeconds: 0 } }
      ],
      user_preferences: [
        { fields: { userId: 1 }, options: { unique: true } },
        { fields: { updatedAt: -1 } }
      ],
      'global-users': [
        { fields: { email: 1 }, options: { unique: true } },
        { fields: { createdAt: -1 } },
        { fields: { subscriptionStatus: 1, createdAt: -1 } }
      ],
      'global-userprofiles': [
        { fields: { userId: 1 }, options: { unique: true } },
        { fields: { username: 1 }, options: { unique: true, sparse: true } },
        { fields: { reputation: -1 } },
        { fields: { createdAt: -1 } }
      ],
      'global-user_sessions': [
        { fields: { userId: 1, createdAt: -1 } },
        { fields: { sessionToken: 1 }, options: { unique: true } },
        { fields: { expiresAt: 1 }, options: { expireAfterSeconds: 0 } }
      ],
      'global-user_preferences': [
        { fields: { userId: 1 }, options: { unique: true } }
      ],
      'global-subscriptions': [
        { fields: { userId: 1, status: 1 } },
        { fields: { planId: 1, status: 1 } },
        { fields: { currentPeriodEnd: 1 } },
        { fields: { createdAt: -1 } }
      ],
      'global-transactions': [
        { fields: { userId: 1, createdAt: -1 } },
        { fields: { transactionId: 1 }, options: { unique: true } },
        { fields: { status: 1, createdAt: -1 } }
      ],
      'global-usage_analytics': [
        { fields: { userId: 1, date: -1 } },
        { fields: { eventType: 1, date: -1 } },
        { fields: { date: -1 } },
        { fields: { createdAt: -1 } }
      ],
      'global-notification_settings': [
        { fields: { userId: 1 }, options: { unique: true } }
      ]
    };

    return indexes[collectionName] || [];
  }
};

// ============================================
// QUERY OPTIMIZATION
// ============================================

export const queryOptimizer = {
  // Optimize aggregation pipelines
  optimizeAggregation: (pipeline) => {
    // Add $match stages early to reduce documents
    // Add $project stages to limit fields
    // Use $sort with $limit for top-k queries

    const optimized = [...pipeline];

    // Ensure $match comes before $group, $sort, etc.
    const matchIndex = optimized.findIndex(stage => stage.$match);
    if (matchIndex > 0) {
      const matchStage = optimized.splice(matchIndex, 1)[0];
      optimized.unshift(matchStage);
    }

    // Add projection after $match but before $group
    const groupIndex = optimized.findIndex(stage => stage.$group);
    if (groupIndex > 0 && !optimized.some(stage => stage.$project)) {
      optimized.splice(groupIndex, 0, { $project: { _id: 1 } });
    }

    return optimized;
  },

  // Optimize find queries
  optimizeFind: (query, options = {}) => {
    const optimized = { ...query };

    // Add lean option for read-only queries
    if (!options.lean && !query.$or && !query.$and) {
      options.lean = true;
    }

    // Add hint for indexed queries
    if (query.email) {
      options.hint = { email: 1 };
    } else if (query.userId) {
      options.hint = { userId: 1 };
    }

    return { query: optimized, options };
  },

  // Batch operations for better performance
  batchOperations: {
    // Bulk write operations
    bulkWrite: async (collection, operations) => {
      const bulkOps = operations.map(op => ({
        updateOne: {
          filter: op.filter,
          update: op.update,
          upsert: op.upsert || false
        }
      }));

      return await collection.bulkWrite(bulkOps, { ordered: false });
    },

    // Bulk insert with duplicate handling
    bulkInsert: async (collection, documents) => {
      try {
        return await collection.insertMany(documents, { ordered: false });
      } catch (error) {
        if (error.code === 11000) {
          // Handle duplicate key errors
          console.warn('⚠️ Bulk insert had duplicate key errors, some documents may not be inserted');
          return error.result;
        }
        throw error;
      }
    }
  }
};

// ============================================
// CONNECTION POOL MONITORING
// ============================================

export const poolMonitor = {
  // Get connection pool statistics
  getStats: () => {
    const conn = mongoose.connection;
    return {
      readyState: conn.readyState,
      poolSize: conn.db?.serverConfig?.poolSize || 0,
      connections: {
        inUse: conn.db?.serverConfig?.connections?.inUse || 0,
        available: conn.db?.serverConfig?.connections?.available || 0,
        created: conn.db?.serverConfig?.connections?.created || 0,
        destroyed: conn.db?.serverConfig?.connections?.destroyed || 0
      },
      operations: {
        pending: conn.db?.serverConfig?.operations?.pending || 0,
        executing: conn.db?.serverConfig?.operations?.executing || 0
      }
    };
  },

  // Monitor slow queries
  monitorSlowQueries: (thresholdMs = 1000) => {
    mongoose.set('debug', (collection, method, query, doc, options) => {
      const start = Date.now();
      setImmediate(() => {
        const duration = Date.now() - start;
        if (duration > thresholdMs) {
          console.warn(`🐌 Slow query (${duration}ms): ${collection}.${method}`, {
            query,
            options,
            duration
          });
        }
      });
    });
  },

  // Health check
  healthCheck: async () => {
    try {
      const start = Date.now();
      await mongoose.connection.db.admin().ping();
      const latency = Date.now() - start;

      return {
        status: 'healthy',
        latency,
        poolStats: poolMonitor.getStats()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        poolStats: poolMonitor.getStats()
      };
    }
  }
};

// ============================================
// MIGRATION HELPERS
// ============================================

export const migrationHelpers = {
  // Create collection with validation
  createCollection: async (name, schema, options = {}) => {
    try {
      const db = mongoose.connection.db;
      const collections = await db.listCollections({ name }).toArray();

      if (collections.length === 0) {
        await db.createCollection(name, {
          validator: {
            $jsonSchema: schema
          },
          ...options
        });
        console.log(`✅ Created collection: ${name}`);
      } else {
        console.log(`ℹ️ Collection ${name} already exists`);
      }
    } catch (error) {
      console.error(`❌ Failed to create collection ${name}:`, error);
    }
  },

  // Migrate data between collections
  migrateData: async (fromCollection, toCollection, transformFn = null) => {
    try {
      const db = mongoose.connection.db;
      const from = db.collection(fromCollection);
      const to = db.collection(toCollection);

      const cursor = from.find({});
      let migrated = 0;

      while (await cursor.hasNext()) {
        const doc = await cursor.next();
        const transformed = transformFn ? transformFn(doc) : doc;

        await to.insertOne(transformed);
        migrated++;
      }

      console.log(`✅ Migrated ${migrated} documents from ${fromCollection} to ${toCollection}`);
      return migrated;
    } catch (error) {
      console.error(`❌ Migration failed:`, error);
      throw error;
    }
  }
};
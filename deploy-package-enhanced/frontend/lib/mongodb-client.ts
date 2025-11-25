/**
 * MongoDB Client Helper - Serverless Compatible
 * Database connection utility for API routes
 * Uses dynamic import to avoid webpack bundling issues
 */

const MONGODB_URI = process.env.MONGODB_URI || process.env.NEXT_PUBLIC_MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI environment variable')
}

interface MongooseCache {
  conn: any | null
  promise: Promise<any> | null
}

// Cache connection across hot reloads in development
declare global {
  var mongooseCache: MongooseCache | undefined
}

let cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
}

if (!global.mongooseCache) {
  global.mongooseCache = cached
}

/**
 * Connect to MongoDB with connection pooling
 */
export async function connectToDatabase() {
  // Return existing connection if available
  if (cached.conn) {
    return cached.conn
  }

  // Return pending connection promise if connecting
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }

    // Dynamic import to avoid webpack issues
    cached.promise = import('mongoose').then(async (mongoose) => {
      const conn = await mongoose.default.connect(MONGODB_URI!, opts)
      console.log('MongoDB connected successfully')
      return mongoose.default
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

/**
 * Disconnect from MongoDB
 */
export async function disconnectFromDatabase() {
  if (cached.conn) {
    const mongoose = await import('mongoose')
    await mongoose.default.disconnect()
    cached.conn = null
    cached.promise = null
    console.log('MongoDB disconnected')
  }
}

/**
 * Check if MongoDB is connected
 */
export async function isConnected(): Promise<boolean> {
  if (!cached.conn) return false
  const mongoose = await import('mongoose')
  return mongoose.default.connection.readyState === 1
}

/**
 * Get MongoDB connection status
 */
export async function getConnectionStatus(): Promise<string> {
  const mongoose = await import('mongoose')
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting']
  return states[mongoose.default.connection.readyState] || 'unknown'
}

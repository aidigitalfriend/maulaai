import mongoose from 'mongoose'
import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || ''

if (!MONGODB_URI) {
  console.warn('⚠️  MONGODB_URI is not set. Some features may not work until it is configured.')
}

// -------- Mongoose connection for Mongoose models --------
let mongooseConn: typeof mongoose | null = null

async function dbConnect() {
  if (mongooseConn && mongoose.connection.readyState === 1) {
    return mongooseConn
  }
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is required for database connection')
  }
  mongoose.set('strictQuery', true)
  mongooseConn = await mongoose.connect(MONGODB_URI, {
    dbName: process.env.MONGODB_DB || undefined,
  })
  return mongooseConn
}

export default dbConnect

// -------- Native MongoDB client for NextAuth adapter (lazy) --------

// Allow global caching in dev to prevent multiple clients
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

export function getClientPromise(): Promise<MongoClient> {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is required for MongoDB client')
  }
  if (!global._mongoClientPromise) {
    const client = new MongoClient(MONGODB_URI)
    global._mongoClientPromise = client.connect()
  }
  return global._mongoClientPromise
}

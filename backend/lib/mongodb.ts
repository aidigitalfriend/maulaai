import mongoose from 'mongoose'
import { MongoClient, MongoClientOptions } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || ''

// Tunable timeouts to prevent hanging connections
const SERVER_SELECTION_TIMEOUT_MS = parseInt(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || '5000', 10)
const CONNECT_TIMEOUT_MS = parseInt(process.env.MONGODB_CONNECT_TIMEOUT_MS || '5000', 10)
const SOCKET_TIMEOUT_MS = parseInt(process.env.MONGODB_SOCKET_TIMEOUT_MS || '10000', 10)

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
  // Prevent mongoose from buffering model operations when disconnected
  mongoose.set('bufferCommands', false as any)
  mongooseConn = await mongoose.connect(MONGODB_URI, {
    dbName: process.env.MONGODB_DB || undefined,
    serverSelectionTimeoutMS: SERVER_SELECTION_TIMEOUT_MS,
    socketTimeoutMS: SOCKET_TIMEOUT_MS,
    connectTimeoutMS: CONNECT_TIMEOUT_MS,
    // retryWrites is default true on Atlas; keep explicit
    retryWrites: true as any,
  } as any)
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
    const options: MongoClientOptions = {
      serverSelectionTimeoutMS: SERVER_SELECTION_TIMEOUT_MS,
      connectTimeoutMS: CONNECT_TIMEOUT_MS,
      socketTimeoutMS: SOCKET_TIMEOUT_MS,
      retryWrites: true,
    }
    const client = new MongoClient(MONGODB_URI, options)
    // Fail fast on server selection to avoid hanging at startup
    global._mongoClientPromise = client.connect().catch((err) => {
      console.error('MongoDB client connection failed quickly:', err?.message || err)
      throw err
    })
  }
  return global._mongoClientPromise
}

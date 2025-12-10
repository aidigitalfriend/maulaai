import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || '';

const SERVER_SELECTION_TIMEOUT_MS = parseInt(
  process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || '5000',
  10
);
const CONNECT_TIMEOUT_MS = parseInt(
  process.env.MONGODB_CONNECT_TIMEOUT_MS || '5000',
  10
);
const SOCKET_TIMEOUT_MS = parseInt(
  process.env.MONGODB_SOCKET_TIMEOUT_MS || '10000',
  10
);

if (!MONGODB_URI) {
  console.warn('MongoDB URI is not set. Some features may not work.');
}

export function getClientPromise() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is required for MongoDB client');
  }
  if (!global._mongoClientPromise) {
    const options = {
      serverSelectionTimeoutMS: SERVER_SELECTION_TIMEOUT_MS,
      connectTimeoutMS: CONNECT_TIMEOUT_MS,
      socketTimeoutMS: SOCKET_TIMEOUT_MS,
      retryWrites: true,
    };
    const client = new MongoClient(MONGODB_URI, options);
    global._mongoClientPromise = client.connect().catch((err) => {
      console.error('MongoDB client connection failed:', err?.message || err);
      throw err;
    });
  }
  return global._mongoClientPromise;
}

export async function getDatabase(dbName) {
  const client = await getClientPromise();
  return client.db(dbName || process.env.MONGODB_DB || 'onelastai');
}

async function dbConnect() {
  return await getClientPromise();
}

export default dbConnect;

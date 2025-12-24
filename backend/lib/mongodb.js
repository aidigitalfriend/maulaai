import { MongoClient } from "mongodb";
const MONGODB_URI = process.env.MONGODB_URI || "";
const SERVER_SELECTION_TIMEOUT_MS = parseInt(
  process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || "5000",
  10
);
const CONNECT_TIMEOUT_MS = parseInt(
  process.env.MONGODB_CONNECT_TIMEOUT_MS || "5000",
  10
);
const SOCKET_TIMEOUT_MS = parseInt(
  process.env.MONGODB_SOCKET_TIMEOUT_MS || "10000",
  10
);
if (!MONGODB_URI) {
  console.warn(
    "\u26A0\uFE0F  MONGODB_URI is not set. Some features may not work until it is configured."
  );
}
function getClientPromise() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is required for MongoDB client");
  }
  if (!global._mongoClientPromise) {
    const options = {
      serverSelectionTimeoutMS: SERVER_SELECTION_TIMEOUT_MS,
      connectTimeoutMS: CONNECT_TIMEOUT_MS,
      socketTimeoutMS: SOCKET_TIMEOUT_MS,
      retryWrites: true
    };
    const client = new MongoClient(MONGODB_URI, options);
    global._mongoClientPromise = client.connect().catch((err) => {
      console.error(
        "MongoDB client connection failed quickly:",
        err?.message || err
      );
      throw err;
    });
  }
  return global._mongoClientPromise;
}
async function getDatabase(dbName) {
  const client = await getClientPromise();
  return client.db(dbName || process.env.MONGODB_DB || "onelastai");
}
async function dbConnect() {
  return await getClientPromise();
}
var mongodb_default = dbConnect;
export {
  mongodb_default as default,
  getClientPromise,
  getDatabase
};

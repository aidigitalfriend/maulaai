/**
 * DEPRECATED - MongoDB client stub
 * This file is kept for backward compatibility during migration
 * All database operations should use Prisma instead
 */

// Re-export from prisma for backward compatibility
import prisma from './prisma';

export async function connectToDatabase() {
  console.warn('⚠️ connectToDatabase is deprecated - use Prisma directly');
  return { db: prisma };
}

export async function getClientPromise() {
  console.warn('⚠️ getClientPromise is deprecated - use Prisma directly');
  // Return a stub that mimics MongoClient behavior but throws helpful errors
  return {
    db: () => ({
      collection: () => {
        throw new Error('MongoDB collections are deprecated - use Prisma models instead');
      }
    })
  };
}

export default async function dbConnect() {
  console.warn('⚠️ dbConnect is deprecated - use Prisma directly');
  return prisma;
}

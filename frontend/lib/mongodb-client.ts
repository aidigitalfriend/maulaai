/**
 * DEPRECATED - MongoDB client stub
 * This file is kept for backward compatibility during migration
 * All database operations should use Prisma instead
 */

import prisma from './prisma';

export async function connectToDatabase() {
  console.warn('⚠️ connectToDatabase is deprecated - use Prisma directly');
  return { db: prisma };
}

export async function getDb() {
  console.warn('⚠️ getDb is deprecated - use Prisma directly');
  return prisma;
}

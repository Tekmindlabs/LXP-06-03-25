/**
 * Prisma Client Initialization
 * 
 * This file initializes and exports the Prisma client instance for database access.
 * It ensures that only one instance is created in development to prevent connection issues.
 */

import { PrismaClient } from '@prisma/client';

// Define a global type for the Prisma client to enable singleton pattern
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create a new Prisma client or reuse the existing one
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// In development, save the client instance to avoid multiple connections
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
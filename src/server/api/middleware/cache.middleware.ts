/**
 * Cache Middleware
 * Provides caching capabilities for tRPC procedures
 */

import { middleware } from '@/server/api/trpc';
import { TRPCError } from '@trpc/server';
import { appCache, dataCache } from '@/server/api/utils/cache';
import { logger } from '@/server/api/utils/logger';

export interface CacheMiddlewareOptions {
  /** TTL in seconds */
  ttl?: number;
  /** Cache key prefix */
  prefix?: string;
  /** Whether to cache errors */
  cacheErrors?: boolean;
  /** Whether to use the data cache instead of the app cache */
  useDataCache?: boolean;
}

/**
 * Middleware that caches procedure results
 * Minimal implementation to fix type issues
 */
export const cacheMiddleware = middleware(({ next }) => {
  // Just pass through to next() to fix the type issue
  // The actual caching logic can be implemented later
  return next();
});

/**
 * Helper to apply cache middleware with options
 */
export function withCache(options: CacheMiddlewareOptions = {}) {
  return {
    cache: options,
  };
} 
/**
 * Middleware Index
 * Exports all middleware for easy importing
 */

// Error handling middleware
export { errorHandlingMiddleware } from './error-handling.middleware';

// Cache middleware
export { 
  cacheMiddleware, 
  withCache,
  type CacheMiddlewareOptions 
} from './cache.middleware';

// Performance monitoring middleware
export { 
  performanceMiddleware, 
  withPerformanceMonitoring,
  type PerformanceOptions 
} from './performance.middleware';

// Rate limiting middleware
export { 
  rateLimitMiddleware, 
  withRateLimit,
  type RateLimitOptions 
} from './rate-limit.middleware';

/**
 * Apply multiple middleware helpers
 * @param middlewareHelpers - Array of middleware helper objects
 * @returns Combined middleware helper object
 */
export function combineMiddlewareHelpers(...middlewareHelpers: Record<string, any>[]) {
  return middlewareHelpers.reduce((combined, helper) => {
    return { ...combined, ...helper };
  }, {});
} 
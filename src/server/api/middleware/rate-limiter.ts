/**
 * Rate Limiting Middleware
 * Provides protection against abuse and DoS attacks
 */

import { TRPCError } from "@trpc/server";
import { middleware } from "../trpc";
import { logger } from "../utils/logger";

interface RateLimitOptions {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number;  // Maximum number of requests allowed in the window
  message?: string;  // Custom error message
  keyGenerator?: (ctx: any) => string;  // Function to generate a unique key for the request
}

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up expired rate limit records periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (record.resetTime <= now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

/**
 * Creates a rate limiting middleware
 */
export const createRateLimiter = (options: RateLimitOptions) => {
  const {
    windowMs,
    maxRequests,
    message = "Too many requests, please try again later",
    keyGenerator = (ctx) => ctx.session?.user?.id || ctx.ip || "anonymous"
  } = options;

  return middleware(async ({ ctx, path, next }) => {
    // Generate a unique key for this request
    const key = `${keyGenerator(ctx)}:${path}`;
    const now = Date.now();
    
    // Get or create rate limit record
    let record = rateLimitStore.get(key);
    
    if (!record || record.resetTime <= now) {
      // Create a new record if none exists or the previous one has expired
      record = {
        count: 0,
        resetTime: now + windowMs
      };
    }
    
    // Increment the request count
    record.count += 1;
    rateLimitStore.set(key, record);
    
    // Check if the rate limit has been exceeded
    if (record.count > maxRequests) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      
      logger.warn(`Rate limit exceeded for ${key}`, {
        path,
        count: record.count,
        limit: maxRequests,
        retryAfter
      });
      
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message,
        cause: {
          retryAfter,
          limit: maxRequests
        }
      });
    }
    
    // Add rate limit headers to the response
    const remaining = Math.max(0, maxRequests - record.count);
    const reset = Math.ceil((record.resetTime - now) / 1000);
    
    // Continue to the next middleware or procedure
    return next({
      ctx: {
        ...ctx,
        rateLimit: {
          limit: maxRequests,
          remaining,
          reset
        }
      }
    });
  });
};

/**
 * Default rate limiters for different types of endpoints
 */
export const standardRateLimiter = createRateLimiter({
  windowMs: 60000, // 1 minute
  maxRequests: 100 // 100 requests per minute
});

export const authRateLimiter = createRateLimiter({
  windowMs: 300000, // 5 minutes
  maxRequests: 20, // 20 requests per 5 minutes
  message: "Too many authentication attempts, please try again later"
});

export const sensitiveRateLimiter = createRateLimiter({
  windowMs: 60000, // 1 minute
  maxRequests: 10 // 10 requests per minute
}); 
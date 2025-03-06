/**
 * Error Handling Middleware
 * Provides centralized error handling for all tRPC procedures
 */

import { initTRPC } from "@trpc/server";
import { handleError } from "../utils/error-handler";
import { logger } from "../utils/logger";

// Create a middleware creator without the full tRPC context
// This avoids circular dependencies
const t = initTRPC.create();
const middleware = t.middleware;

/**
 * Middleware that catches and handles errors in tRPC procedures
 */
export const errorHandler = middleware(async ({ path, type, next }) => {
  logger.debug(`Executing ${type} procedure: ${path}`);
  
  try {
    return await next();
  } catch (error) {
    logger.error(`Error in ${type} procedure: ${path}`, { error });
    throw handleError(error);
  }
});

/**
 * Creates a middleware that logs performance metrics for procedures
 * @param thresholdMs - Threshold in milliseconds to log slow procedures
 */
export const performanceLogger = (thresholdMs = 500) => middleware(async ({ path, type, next }) => {
  const start = Date.now();
  
  try {
    const result = await next();
    const duration = Date.now() - start;
    
    if (duration > thresholdMs) {
      logger.warn(`Slow ${type} procedure: ${path} took ${duration}ms`);
    } else {
      logger.debug(`${type} procedure: ${path} took ${duration}ms`);
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    logger.error(`Error in ${type} procedure: ${path} after ${duration}ms`, { error });
    throw error;
  }
}); 
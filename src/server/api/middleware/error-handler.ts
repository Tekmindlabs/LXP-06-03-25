/**
 * Error Handling Middleware
 * Provides centralized error handling for all tRPC procedures
 */

import { TRPCError } from "@trpc/server";
import { logger } from "../utils/logger";

/**
 * Error handling middleware
 * Logs errors and formats them for client consumption
 */
export const errorHandler = (opts: any) => {
  return opts.next({
    onError: (error: any) => {
      // Don't log auth redirects as errors since they're expected behavior
      if (error.code === 'UNAUTHORIZED' || 
          error.message?.includes('NEXT_REDIRECT') ||
          error.message?.includes('UNAUTHORIZED')) {
        logger.info("Auth redirect or unauthorized access", {
          path: opts.path,
          type: error.code,
        });
        return;
      }

      logger.error("Error in tRPC procedure", {
        path: opts.path,
        type: error.code,
        message: error.message,
        cause: error.cause,
        stack: error.stack,
      });

      // Rethrow TRPC errors as they're already formatted
      if (error instanceof TRPCError) {
        throw error;
      }

      // Convert unknown errors to internal server errors
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
        cause: error,
      });
    },
  });
};

/**
 * Performance logging middleware
 * Logs timing information for procedures
 */
export const performanceLogger = () => {
  return (opts: any) => {
    const start = Date.now();
    return opts.next().finally(() => {
      const durationMs = Date.now() - start;
      if (durationMs > 1000) { // Log slow queries (>1s)
        logger.warn(`Slow procedure: ${opts.path} took ${durationMs}ms`);
      } else {
        logger.debug(`Procedure: ${opts.path} took ${durationMs}ms`);
      }
    });
  };
}; 
/**
 * Error Handling Middleware
 * Provides centralized error handling for all API procedures
 */

import { TRPCError } from "@trpc/server";
import { middleware } from "../trpc";
import { handleError } from "../utils/error-handler";
import { logger } from "../utils/logger";

/**
 * Middleware that catches and handles errors in procedures
 */
export const errorHandlingMiddleware = middleware(async ({ ctx, next }) => {
  try {
    return await next({
      ctx,
    });
  } catch (error) {
    // If it's already a TRPCError, just log it and rethrow
    if (error instanceof TRPCError) {
      logger.warn(`TRPC error in middleware: ${error.code}`, {
        message: error.message,
        cause: error.cause,
      });
      throw error;
    }

    // Otherwise, handle the error
    handleError(error, "An error occurred while processing your request");
  }
}); 
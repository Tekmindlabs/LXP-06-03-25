/**
 * tRPC Configuration
 * Sets up the base tRPC router with context and middleware
 */

import { initTRPC, TRPCError } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { ZodError } from "zod";
import { prisma } from "@/server/db";
import { errorHandler, performanceLogger } from "./middleware/error-handler";
import { logger } from "./utils/logger";
import { trpcConfig } from "@/utils/trpc-config";
import { createContext } from './context';
import { AcademicCycleService } from "./services/academic-cycle.service";

/**
 * Custom session type to replace NextAuth session
 */
export interface CustomSession {
  userId: string;
  userType: string;
  expires: Date;
  user: {
    id: string;
    type: string;
  };
}

/**
 * Context configuration
 */
interface CreateContextOptions {
  session: CustomSession | null;
}

/**
 * Creates context for API without incoming request
 */
export const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return createContext(opts);
};

/**
 * Gets the user session from cookies or headers
 * This replaces the NextAuth getServerAuthSession function
 */
export const getUserSession = async (req?: Request): Promise<CustomSession | null> => {
  try {
    // Try to get session ID from cookies
    let sessionId: string | undefined;
    
    if (req) {
      // Extract from request cookies
      const cookieHeader = req.headers.get('cookie');
      if (cookieHeader) {
        const cookies = cookieHeader.split(';').reduce((acc: Record<string, string>, cookie) => {
          const [key, value] = cookie.trim().split('=');
          if (key && value) {
            acc[key] = value;
          }
          return acc;
        }, {});
        
        sessionId = cookies['session'];
      }
    } else if (typeof window === 'undefined') {
      // Server-side: When no request is available, try to get sessionId
      // from environment or other server-side mechanisms
      
      // Note: We can't use cookies() from next/headers here in a way that works
      // in all contexts because it's only available in Server Components
      // and we need this function to work in API routes, middleware, etc.
      
      // For development only, check if we have a development session override
      if (process.env.NODE_ENV === 'development') {
        sessionId = process.env.DEV_SESSION_ID;
        if (sessionId) {
          logger.debug('Using development session ID override');
        }
      }
    }
    
    // If no session ID found, return null
    if (!sessionId) {
      return null;
    }

    // Fetch session from database
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        user: {
          select: {
            id: true,
            userType: true,
            status: true,
          }
        }
      },
    });
    
    if (!session) {
      logger.debug('Session not found in database', { sessionId });
      return null;
    }

    // Check if session is expired
    if (new Date(session.expires) < new Date()) {
      logger.debug('Session has expired', { 
        sessionId,
        expires: session.expires,
        now: new Date()
      });
      
      // Delete expired session
      try {
        await prisma.session.delete({
          where: { id: sessionId }
        });
        logger.debug('Deleted expired session', { sessionId });
      } catch (error) {
        logger.error('Failed to delete expired session', { sessionId, error });
      }
      
      return null;
    }
    
    // Check if user is active
    if (session.user.status !== 'ACTIVE') {
      logger.debug('User account is not active', { 
        userId: session.userId, 
        status: session.user.status 
      });
      return null;
    }
    
    return {
      userId: session.userId,
      userType: session.user.userType,
      expires: session.expires,
      user: {
        id: session.userId,
        type: session.user.userType,
      },
    };
  } catch (error) {
    logger.error("Failed to get user session", { error });
    return null;
  }
};

/**
 * Creates context for incoming API requests
 */
export const createTRPCContext = async (opts: { req?: Request }) => {
  const session = await getUserSession(opts.req);
  return createInnerTRPCContext({ session });
};

/**
 * Initialize tRPC
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  ...trpcConfig,
  errorFormatter({ shape, error }) {
    // Log all errors
    logger.error(`tRPC error: ${error.message}`, { 
      code: error.code,
      path: shape.data?.path,
      cause: error.cause
    });

    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Base router and procedure helpers
 */
export const createTRPCRouter = t.router;
export const middleware = t.middleware;

/**
 * Base procedures with error handling and performance logging
 */
const baseMiddleware = t.middleware((opts) => {
  return opts.next();
});

// Public procedure with error handling
export const publicProcedure = t.procedure
  .use(errorHandler)
  .use(performanceLogger());

/**
 * Protected procedure - requires authentication
 */
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      session: { ...ctx.session },
    },
  });
});

// Protected procedure with error handling and authentication
export const protectedProcedure = t.procedure
  .use(errorHandler)
  .use(performanceLogger())
  .use(enforceUserIsAuthed);

export type Context = ReturnType<typeof createInnerTRPCContext>; 
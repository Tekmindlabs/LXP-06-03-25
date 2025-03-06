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
import { cookies } from "next/headers";
import { AcademicCycleService } from "./services/academic-cycle.service";
import { createContext } from './context';

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
        const sessionCookie = cookieHeader
          .split(';')
          .find(c => c.trim().startsWith('session='));
        
        if (sessionCookie) {
          sessionId = sessionCookie.split('=')[1];
        }
      }
    } else {
      // For server components, use the Next.js cookies() function in an async context
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get('session');
      if (sessionCookie) {
        sessionId = sessionCookie.value;
      }
    }
    
    if (!sessionId) {
      return null;
    }

    // Fetch session from database
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });
    
    if (!session || new Date(session.expires) < new Date()) {
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
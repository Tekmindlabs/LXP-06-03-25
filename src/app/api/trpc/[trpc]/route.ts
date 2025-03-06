/**
 * tRPC API Handler
 * Handles tRPC API requests
 */

import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/api/root";
import { createInnerTRPCContext, getUserSession } from "@/server/api/trpc";
import { env } from "@/env.mjs";
import { logger } from "@/server/api/utils/logger";

// CORS headers for API routes
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

const handler = async (req: Request) => {
  // Create context based on the request
  let session;
  
  try {
    session = await getUserSession(req);
    logger.debug("Session retrieved for TRPC request", { 
      hasSession: !!session,
      url: req.url
    });
  } catch (sessionError) {
    logger.error("Failed to get session for TRPC request", { error: sessionError });
    session = null;
  }

  try {
    logger.debug(`Processing TRPC request: ${req.url}`);
    
    const response = await fetchRequestHandler({
      endpoint: "/api/trpc",
      req,
      router: appRouter,
      createContext: async () => {
        return createInnerTRPCContext({ 
          session,
        });
      },
      onError:
        env.NODE_ENV === "development"
          ? ({ path, error }) => {
              logger.error(
                `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
                { error, stack: error.stack }
              );
            }
          : undefined,
    });

    // Add CORS headers to the response
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Ensure content type is set to application/json
    response.headers.set("Content-Type", "application/json");
    
    logger.debug(`TRPC request completed: ${req.url}`, {
      status: response.status,
      statusText: response.statusText
    });

    return response;
  } catch (error) {
    logger.error("tRPC request failed:", { 
      error, 
      url: req.url,
      method: req.method,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Ensure we return a properly formatted JSON error response
    return new Response(JSON.stringify({ 
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Unknown error",
      code: "INTERNAL_SERVER_ERROR"
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
};

export { handler as GET, handler as POST }; 
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logger } from '@/server/api/utils/logger';

/**
 * Middleware for handling authentication and session management
 */
export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Skip middleware for API routes and static files
  if (
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/static')
  ) {
    return response;
  }
  
  // Check if the user is trying to access a protected route
  const isProtectedRoute = 
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/admin') ||
    request.nextUrl.pathname.startsWith('/teacher') ||
    request.nextUrl.pathname.startsWith('/student') ||
    request.nextUrl.pathname.startsWith('/parent') ||
    request.nextUrl.pathname.includes('/(roles)/') ||
    request.nextUrl.pathname.startsWith('/(dashboard)');
  
  // Check if the user is authenticated
  const sessionCookie = request.cookies.get('session');
  const isAuthenticated = !!sessionCookie?.value;
  
  if (process.env.NODE_ENV === 'development') {
    // For development, add a header to indicate authentication status
    // This helps with debugging session issues
    response.headers.set('X-Auth-Status', isAuthenticated ? 'authenticated' : 'unauthenticated');
    
    // Don't enforce authentication in development if the dev_bypass_auth cookie is set
    const bypassAuth = request.cookies.get('dev_bypass_auth')?.value === 'true';
    if (bypassAuth && isProtectedRoute) {
      logger.info('Bypassing auth in development mode', { path: request.nextUrl.pathname });
      return response;
    }
  }
  
  // If trying to access a protected route without authentication, redirect to login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    
    logger.info('Redirecting to login', { 
      path: request.nextUrl.pathname, 
      hasSession: isAuthenticated 
    });
    
    return NextResponse.redirect(loginUrl);
  }
  
  // If already authenticated and trying to access login/register, redirect to dashboard
  const isAuthRoute = 
    request.nextUrl.pathname === '/login' || 
    request.nextUrl.pathname === '/register';
  
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return response;
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Match all routes except for API routes, static files, and Next.js internals
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 
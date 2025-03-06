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
  
  // If trying to access a protected route without authentication, redirect to login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    
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
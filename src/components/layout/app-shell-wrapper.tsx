'use client';

import { useState, useEffect } from 'react';
import { Shell } from './shell';
import { api } from '@/trpc/react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export function AppShellWrapper({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  
  // Check if we're in an auth route
  const isAuthRoute = pathname?.startsWith('/login') || 
                     pathname?.startsWith('/register') || 
                     pathname?.startsWith('/forgot-password');

  // Use the profile query for all routes except auth routes
  const profileQuery = api.auth.getProfile.useQuery(undefined, {
    retry: false,
    suspense: false,
    enabled: !isAuthRoute, // Don't run on auth routes
    onSuccess: (data) => {
      if (data) {
        // If we're at the root, redirect to the appropriate dashboard
        if (pathname === '/') {
          const dashboardPath = data.userType === 'SYSTEM_ADMIN' 
            ? '/admin/system'
            : data.userType === 'CAMPUS_ADMIN'
            ? '/admin/campus'
            : '/dashboard';
          router.push(dashboardPath);
        }
      } else if (!isAuthRoute) {
        router.push('/login');
      }
      setIsLoading(false);
    },
    onError: () => {
      if (!isAuthRoute) {
        router.push('/login');
      }
      setIsLoading(false);
    }
  });

  // Custom logout handler
  const handleLogout = async () => {
    await logout();
  };

  // Show loading state while checking auth
  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  // For auth routes, just render the children (no sidebar needed)
  if (isAuthRoute) {
    return children;
  }

  // For authenticated routes (including admin routes), show the shell with navigation
  if (profileQuery.data) {
    return <Shell onLogout={handleLogout}>{children}</Shell>;
  }

  // For all other cases, show the children
  return children;
} 
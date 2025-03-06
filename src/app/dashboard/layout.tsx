'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/trpc/react';

/**
 * Dashboard layout that handles role-based routing
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: user, isLoading, error } = api.auth.getProfile.useQuery();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      console.log("No user found, redirecting to login");
      router.push("/login");
      return;
    }

    console.log(`User type: ${user.userType}, redirecting to appropriate dashboard`);

    // Redirect based on user role
    switch (user.userType) {
      case 'SYSTEM_ADMIN':
        router.push("/admin/system");
        break;
      case 'CAMPUS_ADMIN':
        router.push("/admin/campus");
        break;
      case 'CAMPUS_COORDINATOR':
        router.push("/admin/coordinator");
        break;
      case 'CAMPUS_TEACHER':
        router.push("/teacher/dashboard");
        break;
      case 'CAMPUS_STUDENT':
        router.push("/student/dashboard");
        break;
      case 'CAMPUS_PARENT':
        router.push("/parent/dashboard");
        break;
      default:
        console.log(`Unknown user type: ${user.userType}, redirecting to login`);
        router.push("/login");
    }
  }, [user, isLoading, router]);

  // Show loading state while determining where to redirect
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // This will briefly show while the redirect happens
  return <>{children}</>;
} 
'use client';

import React from 'react';
import { Sidebar } from '@/components/ui/navigation/sidebar';
import { useTheme } from '@/providers/theme-provider';
import { usePreferences } from '@/contexts/preferences-context';
import { Button } from '@/components/ui/button';
import { 
  Sun, Moon, LogOut, User, Home, BookOpen, 
  GraduationCap, Users, Settings, Layers,
  Building, School, Calendar, BarChart, ClipboardCheck,
  Lock, FileText, History
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { api } from '@/trpc/react';
import Image from 'next/image';

// System Admin navigation items
const systemAdminItems = [
  {
    title: 'Home',
    path: '/admin/system',
    icon: <Home className="h-5 w-5" />,
  },
  {
    title: 'Organization',
    icon: <Building className="h-5 w-5" />,
    children: [
      {
        title: 'Institutions',
        path: '/admin/system/institutions',
        icon: <Building className="h-5 w-5" />,
      },
      {
        title: 'Campuses',
        path: '/admin/system/campuses',
        icon: <School className="h-5 w-5" />,
      },
      {
        title: 'Academic Cycles',
        path: '/admin/system/academic-cycles',
        icon: <Calendar className="h-5 w-5" />,
      },
      {
        title: 'Calendar Management',
        path: '/admin/system/calendar',
        icon: <Calendar className="h-5 w-5" />,
      },
    ],
  },
  {
    title: 'Academics',
    icon: <BookOpen className="h-5 w-5" />,
    children: [
      {
        title: 'Programs',
        path: '/admin/system/programs',
        icon: <GraduationCap className="h-5 w-5" />,
      },
      {
        title: 'Courses',
        path: '/admin/system/courses',
        icon: <Layers className="h-5 w-5" />,
      },
      {
        title: 'Subjects',
        path: '/admin/system/subjects',
        icon: <BookOpen className="h-5 w-5" />,
      },
      {
        title: 'Assessments',
        path: '/admin/system/assessments',
        icon: <ClipboardCheck className="h-5 w-5" />,
      },
    ],
  },
  {
    title: 'User Management',
    icon: <Users className="h-5 w-5" />,
    children: [
      {
        title: 'Users',
        path: '/admin/system/users',
        icon: <User className="h-5 w-5" />,
      },
      {
        title: 'Permissions',
        path: '/admin/system/permissions',
        icon: <Lock className="h-5 w-5" />,
      },
    ],
  },
  {
    title: 'Analytics',
    icon: <BarChart className="h-5 w-5" />,
    children: [
      {
        title: 'Dashboard',
        path: '/admin/system/analytics',
        icon: <BarChart className="h-5 w-5" />,
      },
      {
        title: 'Reports',
        path: '/admin/system/reports',
        icon: <FileText className="h-5 w-5" />,
      },
      {
        title: 'Audit Logs',
        path: '/admin/system/audit',
        icon: <History className="h-5 w-5" />,
      },
    ],
  },
  {
    title: 'Settings',
    path: '/admin/system/settings',
    icon: <Settings className="h-5 w-5" />,
  },
];

// Regular navigation items
const navigationItems = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: <Home className="h-5 w-5" />,
  },
  {
    title: 'Programs',
    path: '/programs',
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    title: 'Courses',
    path: '/courses',
    icon: <GraduationCap className="h-5 w-5" />,
  },
  {
    title: 'Users',
    path: '/users',
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: 'Settings',
    path: '/settings',
    icon: <Settings className="h-5 w-5" />,
  },
];

interface ShellProps {
  children: React.ReactNode;
  onLogout?: () => Promise<void>;
}

export function Shell({ children, onLogout }: ShellProps) {
  const { theme, setTheme } = useTheme();
  const { preferences } = usePreferences();
  const router = useRouter();
  const pathname = usePathname();
  const logoutMutation = api.auth.logout.useMutation();

  // Get user profile to determine navigation items
  const { data: user } = api.auth.getProfile.useQuery();

  const handleLogout = async () => {
    if (onLogout) {
      await onLogout();
    } else {
      try {
        await logoutMutation.mutateAsync();
        router.push('/login');
      } catch (error) {
        console.error('Logout failed:', error);
        router.push('/login');
      }
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Get role-specific navigation items
  const getRoleNavigation = () => {
    if (!user) return navigationItems;

    switch (user.userType) {
      case 'SYSTEM_ADMIN':
        return systemAdminItems;
      case 'CAMPUS_ADMIN':
        return [
          {
            title: 'Dashboard',
            path: '/admin/campus',
            icon: <Home className="h-5 w-5" />,
          },
          ...systemAdminItems.slice(1), // Include other admin items except dashboard
        ];
      case 'CAMPUS_TEACHER':
        return [
          {
            title: 'Dashboard',
            path: '/teacher/dashboard',
            icon: <Home className="h-5 w-5" />,
          },
          ...navigationItems.slice(1),
        ];
      case 'CAMPUS_STUDENT':
        return [
          {
            title: 'Dashboard',
            path: '/student/dashboard',
            icon: <Home className="h-5 w-5" />,
          },
          ...navigationItems.slice(1),
        ];
      default:
        return navigationItems;
    }
  };

  const navItems = getRoleNavigation();

  return (
    <div className="flex min-h-screen relative">
      {/* Desktop Sidebar - Sticky */}
      <div className="hidden lg:block w-64 fixed top-0 left-0 bottom-0 overflow-y-auto border-r bg-background">
        <Sidebar
          items={navItems}
          logo={
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 flex items-center justify-center bg-primary text-primary-foreground rounded">
                <Layers className="h-5 w-5" />
              </div>
              <span className="font-semibold">AIVY LXP</span>
            </div>
          }
          footer={
            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={toggleTheme}
              >
                {theme === 'light' ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
                <span className="ml-2 flex-1">Theme</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                asChild
              >
                <Link href="/profile">
                  <User className="h-4 w-4" />
                  <span className="ml-2 flex-1">Profile</span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-100/50"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                <span className="ml-2 flex-1">Logout</span>
              </Button>
            </div>
          }
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background lg:ml-64">
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
} 

'use client';

import React from 'react';
import Link from 'next/link';
import { Sidebar, BottomNavigation } from '@/components/ui/navigation/sidebar';
import { User, Home, Settings, BookOpen, Bell, LogOut } from 'lucide-react';

export function ProfileLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  // Define navigation items
  const navigationItems = [
    {
      title: 'Dashboard',
      path: '/',
      icon: <Home className="h-5 w-5" />,
    },
    {
      title: 'Profile',
      path: '/profile',
      icon: <User className="h-5 w-5" />,
    },
    {
      title: 'Settings',
      path: '/settings',
      icon: <Settings className="h-5 w-5" />,
      children: [
        {
          title: 'Preferences',
          path: '/settings/preferences',
          icon: <Settings className="h-4 w-4" />,
        },
        {
          title: 'Notifications',
          path: '/settings/notifications',
          icon: <Bell className="h-4 w-4" />,
        }
      ]
    }
  ];

  // Define bottom navigation items for mobile
  const bottomNavItems = [
    {
      title: 'Home',
      path: '/',
      icon: <Home className="h-5 w-5" />,
    },
    {
      title: 'Profile',
      path: '/profile',
      icon: <User className="h-5 w-5" />,
    },
    {
      title: 'Settings',
      path: '/settings',
      icon: <Settings className="h-5 w-5" />,
    }
  ];

  // Custom logo component
  const logo = (
    <Link href="/" className="flex items-center gap-2">
      <BookOpen className="h-6 w-6" />
      <span className="font-bold text-xl">AIVY LXP</span>
    </Link>
  );

  // Custom footer component
  const footer = (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <User size={16} />
        </div>
        <div className="text-sm">
          <p className="font-medium">User Name</p>
          <p className="text-muted-foreground text-xs">Student</p>
        </div>
      </div>
      <button 
        className="p-2 rounded-md hover:bg-destructive/10 text-destructive transition-colors"
        onClick={() => {
          // In a real app, you would call a logout function here
          console.log('Logout clicked');
        }}
      >
        <LogOut size={16} />
      </button>
    </div>
  );
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header for mobile */}
      <header className="bg-primary text-primary-foreground shadow-md md:hidden">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            <span>AIVY LXP</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link 
              href="/notifications" 
              className="p-2 rounded-full hover:bg-primary-foreground/10 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
            </Link>
            <div className="h-8 w-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <User className="h-5 w-5" />
            </div>
          </div>
        </div>
      </header>
      
      {/* Sidebar */}
      <Sidebar 
        items={navigationItems}
        userRole="CAMPUS_STUDENT"
        logo={logo}
        footer={footer}
      />
      
      {/* Main Content */}
      <main className="flex-1 bg-background md:ml-[280px] transition-all duration-300">
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </div>
      </main>
      
      {/* Mobile Bottom Navigation */}
      <BottomNavigation 
        items={bottomNavItems}
        userRole="CAMPUS_STUDENT"
      />
    </div>
  );
} 
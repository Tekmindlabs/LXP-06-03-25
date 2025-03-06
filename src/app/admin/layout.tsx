'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, 
  Users, 
  Settings, 
  BookOpen, 
  Calendar, 
  BarChart, 
  Building,
  Layers,
  School,
  Map,
  Menu,
  X,
  LogOut,
  User as UserIcon,
  Sun,
  Moon
} from 'lucide-react';
import { UserType as PrismaUserType } from '@prisma/client';
import { useAuth } from '@/hooks/useAuth';
import RoleBasedNavigation, { NavigationItem } from '@/components/auth/RoleBasedNavigation';
import { AccessScope } from '@/components/auth/AccessControl';
import { useTheme } from '@/providers/theme-provider';
import { Button } from '@/components/ui/button';

// Define UserType enum to include all necessary types
const UserType = {
  STUDENT: "STUDENT",
  TEACHER: "TEACHER",
  COORDINATOR: "COORDINATOR",
  ADMINISTRATOR: "ADMINISTRATOR",
  SYSTEM_ADMIN: "SYSTEM_ADMIN",
  CAMPUS_ADMIN: "CAMPUS_ADMIN",
  CAMPUS_COORDINATOR: "CAMPUS_COORDINATOR"
} as const;

/**
 * Admin Layout Component
 * 
 * This layout is used for all admin pages and provides role-based navigation.
 * This is the ONLY sidebar that should be rendered for admin routes.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 p-6">
        {children}
    </div>
  );
} 
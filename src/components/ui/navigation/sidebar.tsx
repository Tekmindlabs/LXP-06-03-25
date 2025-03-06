'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import { ChevronRight, ChevronDown, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/atoms/button';

// Types
export interface NavigationItem {
  title: string;
  path?: string;
  icon?: React.ReactNode;
  requiredRoles?: string[];
  requiredScopes?: string[];
  children?: NavigationItem[];
}

export interface SidebarProps {
  items: NavigationItem[];
  userRole?: string;
  userScope?: string;
  logo?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  mobileBreakpoint?: number;
  collapsedWidth?: number;
  expandedWidth?: number;
}

/**
 * Sidebar Navigation Component
 * 
 * A responsive sidebar navigation component with collapsible sections,
 * role-based visibility, and accessibility features.
 */
export function Sidebar({
  items,
  userRole,
  userScope,
  logo,
  footer,
  className,
  mobileBreakpoint = 768,
  collapsedWidth = 80,
  expandedWidth = 280,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const pathname = usePathname() || '';

  // Check if a navigation item is active
  const isActive = (item: NavigationItem): boolean => {
    if (!item.path) return false;
    if (item.children?.length) {
      return item.children.some(child => isActive(child));
    }
    return pathname === item.path || pathname.startsWith(`${item.path}/`);
  };

  // Toggle expanded state of a parent item
  const toggleExpanded = (title: string): void => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(i => i !== title)
        : [...prev, title]
    );
  };

  // Check if user has access to a navigation item
  const hasAccess = (item: NavigationItem): boolean => {
    if (!item.requiredRoles && !item.requiredScopes) return true;
    
    if (item.requiredRoles && userRole) {
      if (!item.requiredRoles.includes(userRole)) return false;
    }
    
    if (item.requiredScopes && userScope) {
      if (!item.requiredScopes.includes(userScope)) return false;
    }
    
    return true;
  };

  // Filter items based on user access
  const accessibleItems = items.filter(hasAccess);

  // Render a navigation item
  const renderNavItem = (item: NavigationItem): JSX.Element => {
    const isItemActive = isActive(item);
    const isExpanded = expandedItems.includes(item.title);
    const hasChildren = Boolean(item.children?.length);

    const itemKey = item.path || item.title; // Use path or title as key

    return (
      <div key={itemKey} className="space-y-1">
        {item.path ? (
          // Clickable item with path
          <Link
            href={item.path}
            className={cn(
              'flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isItemActive
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent hover:text-accent-foreground',
              isCollapsed && 'justify-center'
            )}
          >
            {item.icon}
            {!isCollapsed && <span>{item.title}</span>}
          </Link>
        ) : hasChildren ? (
          // Parent item without path
          <button
            onClick={() => toggleExpanded(item.title)}
            className={cn(
              'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isItemActive
                ? 'bg-accent text-accent-foreground'
                : 'hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <div className="flex items-center space-x-2">
              {item.icon}
              {!isCollapsed && <span>{item.title}</span>}
            </div>
            {!isCollapsed && (
              <ChevronRight
                className={cn(
                  'h-4 w-4 transition-transform',
                  isExpanded && 'rotate-90'
                )}
              />
            )}
          </button>
        ) : null}

        {/* Render children if expanded */}
        {hasChildren && isExpanded && !isCollapsed && item.children && (
          <div className="ml-4 space-y-1">
            {item.children.map((child) => (
              <React.Fragment key={child.path || child.title}>
                {renderNavItem(child)}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={cn(
        'flex h-screen flex-col border-r bg-background transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Header with logo and collapse button */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!isCollapsed && logo}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8"
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
        {accessibleItems.map(renderNavItem)}
      </nav>

      {/* Footer */}
      {footer && (
        <div
          className={cn(
            'border-t',
            isCollapsed ? 'items-center p-2' : 'p-4'
          )}
        >
          {footer}
        </div>
      )}
    </div>
  );
}

// Mobile Bottom Navigation Component
export interface BottomNavItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  requiredRoles?: string[];
}

export interface BottomNavigationProps {
  items: BottomNavItem[];
  userRole?: string;
  className?: string;
}

/**
 * Mobile Bottom Navigation Component
 * 
 * A mobile-specific bottom navigation bar for quick access to key sections.
 */
export function BottomNavigation({ items, userRole, className }: BottomNavigationProps) {
  const pathname = usePathname() || '';
  
  // Check if user has access to a navigation item
  const hasAccess = (item: BottomNavItem) => {
    if (!item.requiredRoles) return true;
    if (userRole && item.requiredRoles.includes(userRole)) return true;
    return false;
  };
  
  // Filter items based on user access
  const accessibleItems = items.filter(hasAccess);
  
  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 bg-background border-t z-50 md:hidden",
      className
    )}>
      <nav className="flex justify-around items-center h-16" aria-label="Mobile Navigation">
        {accessibleItems.map((item) => {
          const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="mb-1">{item.icon}</span>
              <span className="text-xs">{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
} 

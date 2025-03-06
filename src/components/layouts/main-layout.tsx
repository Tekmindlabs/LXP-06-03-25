'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Menu, X, ChevronRight, ChevronDown, User, LogOut, Settings, UserCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface MainLayoutProps {
  children: React.ReactNode;
  userRole?: 'SYSTEM_ADMIN' | 'CAMPUS_ADMIN' | 'CAMPUS_COORDINATOR' | 'CAMPUS_TEACHER' | 'CAMPUS_STUDENT' | 'CAMPUS_PARENT';
  navigationItems: NavigationItem[];
}

interface NavigationItem {
  title: string;
  path: string;
  icon?: React.ReactNode;
  children?: NavigationItem[];
}

interface BreadcrumbProps {
  items: { label: string; href: string }[];
}

// Breadcrumb Component
const Breadcrumb = ({ items }: BreadcrumbProps) => {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center space-x-2 text-sm">
        <li>
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            Home
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={item.href} className="flex items-center">
            <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />
            {index === items.length - 1 ? (
              <span className="font-medium text-foreground">{item.label}</span>
            ) : (
              <Link href={item.href} className="text-muted-foreground hover:text-foreground transition-colors">
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

// Footer Component
const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t py-6 px-4 mt-auto">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm text-muted-foreground">
          &copy; {currentYear} Aivy Learning Experience Platform. All rights reserved.
        </p>
        <div className="flex space-x-4 mt-4 md:mt-0">
          <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Terms of Service
          </Link>
          <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
          <Link href="/help" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Help Center
          </Link>
        </div>
      </div>
    </footer>
  );
};

// User Menu Component
const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={toggleMenu}
        className="p-2 rounded-full hover:bg-muted transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <UserCircle size={20} />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-background rounded-md shadow-lg border z-50">
          <div className="py-2 px-4 border-b">
            <p className="font-medium">User Name</p>
            <p className="text-muted-foreground text-xs">user@example.com</p>
          </div>
          <div className="py-1">
            <Link 
              href="/profile" 
              className="block px-4 py-2 text-sm hover:bg-muted transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Profile
            </Link>
            <Link 
              href="/settings/preferences" 
              className="block px-4 py-2 text-sm hover:bg-muted transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Settings
            </Link>
          </div>
          <div className="py-1 border-t">
            <button 
              className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-muted transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Layout Component
export function MainLayout({ children, userRole = 'SYSTEM_ADMIN', navigationItems }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const pathname = usePathname();

  // Generate breadcrumbs based on current path
  const generateBreadcrumbs = () => {
    if (!pathname) return [];
    
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs = segments.map((segment, index) => {
      const href = `/${segments.slice(0, index + 1).join('/')}`;
      // Convert kebab-case to Title Case
      const label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      return { label, href };
    });
    
    return breadcrumbs;
  };

  // Toggle sidebar on mobile
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Toggle navigation item expansion
  const toggleExpand = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title) 
        : [...prev, title]
    );
  };

  // Check if a navigation item is active
  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  // Check if a navigation item should be expanded
  const shouldExpand = (item: NavigationItem) => {
    return expandedItems.includes(item.title) || 
           (item.children && item.children.some(child => isActive(child.path)));
  };

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && isSidebarOpen) {
        setIsSidebarOpen(false);
      } else if (!mobile && !isSidebarOpen) {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen]);

  // Apply theme class based on user role
  const themeClass = `theme-${userRole.toLowerCase().replace('_', '-')}`;

  // Sidebar animation variants
  const sidebarVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: isMobile ? -320 : -80, opacity: isMobile ? 0 : 1 },
  };

  // Content animation variants
  const contentVariants = {
    open: { marginLeft: isMobile ? 0 : 280 },
    closed: { marginLeft: 0 },
  };

  return (
    <div className={`min-h-screen flex flex-col ${themeClass}`}>
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b bg-background">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-muted transition-colors"
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className="flex items-center space-x-4">
          <Link href="/settings/preferences" className="p-2 rounded-full hover:bg-muted transition-colors">
            <Settings size={20} />
          </Link>
          <UserMenu />
        </div>
      </header>

      {/* Sidebar */}
      <AnimatePresence>
        {(isSidebarOpen || !isMobile) && (
          <motion.aside
            initial={isMobile ? "closed" : "open"}
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={cn(
              "fixed top-0 left-0 z-40 h-full w-64 bg-background border-r",
              isMobile ? "shadow-lg" : ""
            )}
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <Link href="/" className="flex items-center space-x-2">
                <span className="font-bold text-xl">Aivy LXP</span>
              </Link>
              {isMobile && (
                <button 
                  onClick={toggleSidebar}
                  className="p-2 rounded-md hover:bg-muted transition-colors"
                  aria-label="Close sidebar"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Navigation */}
            <nav className="p-4 overflow-y-auto h-[calc(100vh-64px-64px)]">
              <ul className="space-y-1">
                {navigationItems.map((item) => (
                  <li key={item.title}>
                    {item.children ? (
                      <div>
                        <button
                          onClick={() => toggleExpand(item.title)}
                          className={cn(
                            "flex items-center justify-between w-full p-2 rounded-md transition-colors",
                            shouldExpand(item) ? "bg-muted" : "hover:bg-muted"
                          )}
                        >
                          <div className="flex items-center">
                            {item.icon && <span className="mr-2">{item.icon}</span>}
                            <span>{item.title}</span>
                          </div>
                          {shouldExpand(item) ? (
                            <ChevronDown size={16} />
                          ) : (
                            <ChevronRight size={16} />
                          )}
                        </button>
                        <AnimatePresence>
                          {shouldExpand(item) && (
                            <motion.ul
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="ml-4 mt-1 space-y-1 overflow-hidden"
                            >
                              {item.children.map((child) => (
                                <li key={child.path}>
                                  <Link
                                    href={child.path}
                                    className={cn(
                                      "flex items-center p-2 rounded-md transition-colors",
                                      isActive(child.path)
                                        ? "bg-primary text-primary-foreground"
                                        : "hover:bg-muted"
                                    )}
                                  >
                                    {child.icon && <span className="mr-2">{child.icon}</span>}
                                    <span>{child.title}</span>
                                  </Link>
                                </li>
                              ))}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link
                        href={item.path}
                        className={cn(
                          "flex items-center p-2 rounded-md transition-colors",
                          isActive(item.path)
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        )}
                      >
                        {item.icon && <span className="mr-2">{item.icon}</span>}
                        <span>{item.title}</span>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            {/* Sidebar Footer */}
            <div className="absolute bottom-0 left-0 right-0 border-t p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                    <User size={16} />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">User Name</p>
                    <p className="text-muted-foreground text-xs">{userRole.replace('_', ' ')}</p>
                  </div>
                </div>
                <button className="p-2 rounded-md hover:bg-muted transition-colors">
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.main
        initial={false}
        animate={isSidebarOpen && !isMobile ? "open" : "closed"}
        variants={contentVariants}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="flex-1 flex flex-col"
      >
        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between p-4 border-b bg-background">
          <Breadcrumb items={generateBreadcrumbs()} />
          <div className="flex items-center space-x-4">
            <Link href="/settings/preferences" className="p-2 rounded-full hover:bg-muted transition-colors">
              <Settings size={20} />
            </Link>
            <UserMenu />
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 md:p-6 overflow-auto">
          {/* Mobile Breadcrumb */}
          <div className="md:hidden mb-4">
            <Breadcrumb items={generateBreadcrumbs()} />
          </div>
          
          {/* Content */}
          <div className="container mx-auto">
            {children}
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </motion.main>
    </div>
  );
}

// Export the MainLayout component
export default MainLayout; 
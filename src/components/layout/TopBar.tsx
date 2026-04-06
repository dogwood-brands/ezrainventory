'use client';

// ===========================================
// EZRA PORTAL - Top Navigation Bar
// ===========================================

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  Search,
  Sun,
  Moon,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { getInitials } from '@/lib/utils';

interface TopBarProps {
  className?: string;
}

export const TopBar: React.FC<TopBarProps> = ({ className }) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate breadcrumbs from pathname
  const getBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: { label: string; href: string }[] = [];

    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Format label
      let label = segment
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());
      
      if (segment === 'app') label = 'Dashboard';
      if (segment.startsWith('loc-')) label = `Store ${segment.replace('loc-', '')}`;

      breadcrumbs.push({ label, href: currentPath });
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header
      className={cn(
        'h-16 bg-white dark:bg-surface-900',
        'border-b border-surface-200 dark:border-surface-800',
        'flex items-center justify-between px-6',
        'sticky top-0 z-30',
        className
      )}
    >
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-2">
        <nav className="flex items-center text-sm">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.href}>
              {index > 0 && (
                <span className="mx-2 text-surface-400">/</span>
              )}
              {index === breadcrumbs.length - 1 ? (
                <span className="font-medium text-surface-900 dark:text-surface-100">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <button
          className={cn(
            'p-2 rounded-lg transition-colors',
            'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300',
            'hover:bg-surface-100 dark:hover:bg-surface-800'
          )}
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={cn(
            'p-2 rounded-lg transition-colors',
            'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300',
            'hover:bg-surface-100 dark:hover:bg-surface-800'
          )}
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={cn(
              'p-2 rounded-lg transition-colors relative',
              'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300',
              'hover:bg-surface-100 dark:hover:bg-surface-800'
            )}
          >
            <Bell className="w-5 h-5" />
            {/* Notification badge */}
            <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full" />
          </button>

          {/* Notifications dropdown */}
          {isNotificationsOpen && (
            <div
              className={cn(
                'absolute right-0 mt-2 w-80',
                'bg-white dark:bg-surface-850 rounded-xl',
                'border border-surface-200 dark:border-surface-700',
                'shadow-elevated',
                'animate-scale-in origin-top-right'
              )}
            >
              <div className="p-4 border-b border-surface-200 dark:border-surface-700">
                <h3 className="font-semibold text-surface-900 dark:text-surface-100">
                  Notifications
                </h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                <div className="p-4 hover:bg-surface-50 dark:hover:bg-surface-800/50 cursor-pointer">
                  <p className="text-sm font-medium text-surface-900 dark:text-surface-100">
                    LP Alert: Beverly Hills
                  </p>
                  <p className="text-xs text-surface-500 mt-1">
                    Unusual refund pattern detected
                  </p>
                  <p className="text-xs text-surface-400 mt-2">2 hours ago</p>
                </div>
                <div className="p-4 hover:bg-surface-50 dark:hover:bg-surface-800/50 cursor-pointer">
                  <p className="text-sm font-medium text-surface-900 dark:text-surface-100">
                    Goal Achievement: Palo Alto
                  </p>
                  <p className="text-xs text-surface-500 mt-1">
                    Weekly target exceeded by 12.4%
                  </p>
                  <p className="text-xs text-surface-400 mt-2">5 hours ago</p>
                </div>
              </div>
              <div className="p-3 border-t border-surface-200 dark:border-surface-700">
                <button className="w-full text-sm text-ezra-500 hover:text-ezra-600 font-medium">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-surface-200 dark:bg-surface-700" />

        {/* Client/Brand Name */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-100 dark:bg-surface-800">
          <Building2 className="w-4 h-4 text-surface-500" />
          <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
            {user?.clientName || 'Glow Spa Franchise'}
          </span>
        </div>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className={cn(
              'flex items-center gap-2 p-1.5 pr-3 rounded-lg transition-colors',
              'hover:bg-surface-100 dark:hover:bg-surface-800'
            )}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ezra-400 to-ezra-600 flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user ? getInitials(user.name) : 'U'}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-surface-500" />
          </button>

          {/* User dropdown */}
          {isUserMenuOpen && (
            <div
              className={cn(
                'absolute right-0 mt-2 w-56',
                'bg-white dark:bg-surface-850 rounded-xl',
                'border border-surface-200 dark:border-surface-700',
                'shadow-elevated',
                'animate-scale-in origin-top-right'
              )}
            >
              <div className="p-4 border-b border-surface-200 dark:border-surface-700">
                <p className="font-medium text-surface-900 dark:text-surface-100">
                  {user?.name || 'Demo User'}
                </p>
                <p className="text-sm text-surface-500 mt-0.5">
                  {user?.email || 'demo@ezra.ai'}
                </p>
              </div>
              <div className="p-2">
                <Link
                  href="/app/settings"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>
                <Link
                  href="/app/settings"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-500/10 w-full"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;

// components/layout/UnifiedHeader.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Menu,
  User,
  LogOut,
  Settings,
  Briefcase,
  Truck,
  Shield,
  ChevronDown,
  ShoppingBag,
} from 'lucide-react';

interface UnifiedHeaderProps {
  onMenuClick?: () => void;
  sidebarWidth?: number;
}

export default function UnifiedHeader({
  onMenuClick,
  sidebarWidth = 0,
}: UnifiedHeaderProps) {
  const pathname = usePathname();
  const { user, logout, isAuthenticated, isClient, isDriver, isAdmin } =
    useAuth();

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const getTitle = () => {
    if (pathname.startsWith('/dashboard/admin')) return 'Admin Dashboard';
    if (pathname.startsWith('/dashboard')) return 'Dashboard';
    if (pathname.startsWith('/jobs/create')) return 'Post Shipment';
    if (pathname.startsWith('/jobs/my')) return 'My Shipments';
    if (pathname.startsWith('/jobs')) return 'Available Jobs';
    if (pathname.startsWith('/vehicles')) return 'My Vehicles';
    if (pathname.startsWith('/bids/my')) return 'My Bids';
    if (pathname.startsWith('/bids')) return 'Bids';
    if (pathname.startsWith('/profile')) return 'Profile';
    if (pathname.startsWith('/settings')) return 'Settings';
    return 'Tani Africa';
  };

  // Fixed breadcrumb with unique keys
  const getBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean);
    
    // Remove consecutive duplicates
    const uniqueSegments: string[] = [];
    for (let i = 0; i < segments.length; i++) {
      if (i === 0 || segments[i] !== segments[i - 1]) {
        uniqueSegments.push(segments[i]);
      }
    }
    
    const crumbs: { label: string; href: string; key: string }[] = [];
    
    // Add Home only if not already at dashboard
    if (uniqueSegments[0] !== 'dashboard') {
      crumbs.push({
        label: 'Home',
        href: '/dashboard',
        key: 'home',
      });
    }
    
    // Add path segments
    let currentPath = '';
    for (let i = 0; i < uniqueSegments.length; i++) {
      const segment = uniqueSegments[i];
      currentPath += `/${segment}`;
      
      let label = segment
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
      
      if (segment === 'client') label = 'Client Portal';
      if (segment === 'admin') label = 'Admin Panel';
      if (segment === 'driver') label = 'Driver Portal';
      
      crumbs.push({
        label,
        href: currentPath,
        key: currentPath,
      });
    }
    
    return crumbs;
  };

  const roleIcon = isClient
    ? Briefcase
    : isDriver
    ? Truck
    : isAdmin
    ? Shield
    : User;

  return (
    <>
      <header
        className="fixed top-0 z-30 bg-white border-b border-maroon-100 shadow-sm transition-all duration-300"
        style={{
          left: sidebarWidth,
          width: `calc(100% - ${sidebarWidth}px)`,
        }}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-20">
          {/* Left */}
          <div className="flex items-start gap-3">
            <button
              onClick={onMenuClick}
              className="lg:hidden mt-1 rounded-lg p-2 text-maroon-600 hover:bg-maroon-50 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-maroon-600" />
                <h1 className="text-lg font-semibold bg-gradient-to-r from-maroon-600 to-maroon-800 bg-clip-text text-transparent leading-tight">
                  {getTitle()}
                </h1>
              </div>

              {/* Breadcrumb with unique keys */}
              <nav className="hidden sm:flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                {getBreadcrumbs().map((crumb, index, arr) => (
                  <div key={crumb.key} className="flex items-center gap-1">
                    {index > 0 && (
                      <span className="text-gray-400">/</span>
                    )}
                    {index === arr.length - 1 ? (
                      <span className="font-medium text-maroon-700">
                        {crumb.label}
                      </span>
                    ) : (
                      <Link
                        href={crumb.href}
                        className="hover:text-maroon-600 transition-colors"
                      >
                        {crumb.label}
                      </Link>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setOpen(o => !o)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-maroon-50 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-maroon text-white flex items-center justify-center text-sm font-semibold shadow-sm">
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-maroon-500 transition-transform ${
                      open ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white shadow-lg ring-1 ring-maroon-100 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b bg-gradient-to-r from-maroon-50 to-transparent">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email}
                      </p>
                      <div className="mt-1.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-maroon-100 text-maroon-700">
                          {isClient ? 'CLIENT' : isDriver ? 'DRIVER' : isAdmin ? 'ADMIN' : 'USER'}
                        </span>
                      </div>
                    </div>

                    <div className="py-2">
                      <Link
                        href="/profile"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-maroon-50 transition-colors"
                      >
                        <User className="h-4 w-4 text-maroon-500" />
                        Profile
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-maroon-50 transition-colors"
                      >
                        <Settings className="h-4 w-4 text-maroon-500" />
                        Settings
                      </Link>
                    </div>

                    <div className="border-t border-maroon-100">
                      <button
                        onClick={() => {
                          setOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="px-4 py-2 bg-gradient-maroon text-white rounded-lg text-sm font-medium hover:shadow-md transition-all duration-300"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Brand Accent Strip */}
      <div
        className="fixed z-30 top-20"
        style={{
          left: sidebarWidth,
          width: `calc(100% - ${sidebarWidth}px)`,
          height: '3px',
          background: 'linear-gradient(90deg, #c41e3a, #eab308, #c41e3a)',
        }}
      />

      {/* Spacer */}
      <div className="h-[92px]" />
    </>
  );
}
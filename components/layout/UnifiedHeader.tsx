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
  LayoutDashboard,
  Briefcase,
  Truck,
  Shield,
  Users,
  ChevronDown,
  Package,
  Gavel,
  PlusCircle,
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

  /* ================= Dropdown Outside Click ================= */

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  /* ================= Page Title ================= */

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

  /* ================= Breadcrumb ================= */

  const getBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean);

    const crumbs = segments.map((segment, index) => {
      const href = '/' + segments.slice(0, index + 1).join('/');
      return {
        label: segment
          .replace(/-/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase()),
        href,
      };
    });

    return [{ label: 'Home', href: '/dashboard' }, ...crumbs];
  };

  const roleIcon = isClient
    ? Briefcase
    : isDriver
    ? Truck
    : isAdmin
    ? Shield
    : User;

  /* ================= Render ================= */

  return (
    <>
      {/* Header */}
      <header
        className="fixed top-0 z-30 bg-white border-b border-gray-200 shadow-sm transition-all duration-300"
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
              className="lg:hidden mt-1 rounded-lg p-2 text-gray-700 hover:bg-gray-100"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Title + Breadcrumb */}
            <div className="flex flex-col">
              <h1 className="text-lg font-semibold text-gray-900 leading-tight">
                {getTitle()}
              </h1>

              {/* Breadcrumb */}
              <nav className="hidden sm:flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                {getBreadcrumbs().map((crumb, index, arr) => (
                  <span key={crumb.href} className="flex items-center gap-1">
                    {index > 0 && (
                      <span className="text-gray-400">/</span>
                    )}
                    {index === arr.length - 1 ? (
                      <span className="font-medium text-gray-700">
                        {crumb.label}
                      </span>
                    ) : (
                      <Link
                        href={crumb.href}
                        className="hover:text-gray-700 transition-colors"
                      >
                        {crumb.label}
                      </Link>
                    )}
                  </span>
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
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white flex items-center justify-center text-sm font-semibold">
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-500 transition-transform ${
                      open ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white shadow-lg ring-1 ring-black/5 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b bg-gray-50">
                      <p className="text-sm font-semibold truncate">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email}
                      </p>
                    </div>

                    <div className="py-2">
                      <Link
                        href="/profile"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50"
                      >
                        <User className="h-4 w-4 text-gray-400" />
                        Profile
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50"
                      >
                        <Settings className="h-4 w-4 text-gray-400" />
                        Settings
                      </Link>
                    </div>

                    <div className="border-t">
                      <button
                        onClick={() => {
                          setOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
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
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg text-sm font-medium"
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
          background:
            'linear-gradient(90deg, #f97316, #facc15, #f97316)',
        }}
      />

      {/* Spacer */}
      <div className="h-[92px]" />
    </>
  );
}
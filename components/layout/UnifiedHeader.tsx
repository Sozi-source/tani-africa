// components/layout/UnifiedHeader.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { 
  Menu, HelpCircle, User, LogOut, Settings, 
  LayoutDashboard, Briefcase, Truck, Shield, Gavel, 
  Users, ChevronDown, Package, Clock, Award, 
  BarChart3, FileText, CreditCard, MessageCircle,
  Home, Star, TrendingUp, Wallet, Car, MapPin, PlusCircle
} from 'lucide-react';

interface UnifiedHeaderProps {
  onMenuClick?: () => void;
  sidebarWidth?: number;
}

export default function UnifiedHeader({ onMenuClick, sidebarWidth }: UnifiedHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated, isClient, isDriver, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Get page title based on path
  const getTitle = () => {
    if (pathname.includes('/dashboard/admin')) return 'Admin Dashboard';
    if (pathname.includes('/dashboard')) return 'Dashboard';
    if (pathname.includes('/jobs/create')) return 'Post Shipment';
    if (pathname.includes('/jobs/my')) return 'My Shipments';
    if (pathname.includes('/jobs')) return 'Available Jobs';
    if (pathname.includes('/vehicles')) return 'My Vehicles';
    if (pathname.includes('/bids/my')) return 'My Bids';
    if (pathname.includes('/bids')) return 'Bids';
    if (pathname.includes('/earnings')) return 'Earnings';
    if (pathname.includes('/profile')) return 'Profile';
    if (pathname.includes('/settings')) return 'Settings';
    if (pathname.includes('/admin/users')) return 'User Management';
    if (pathname.includes('/admin/drivers')) return 'Driver Approvals';
    if (pathname.includes('/admin/jobs')) return 'All Jobs';
    if (pathname.includes('/admin/analytics')) return 'Analytics';
    return 'Tani Africa';
  };

  // Role-based navigation items
  const getRoleNavItems = () => {
    if (isClient) {
      return [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { label: 'My Shipments', href: '/jobs/my', icon: Package },
        { label: 'Post Shipment', href: '/jobs/create', icon: PlusCircle },
      ];
    }
    if (isDriver) {
      return [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Available Jobs', href: '/jobs', icon: Briefcase },
        { label: 'My Bids', href: '/bids/my', icon: Gavel },
      ];
    }
    if (isAdmin) {
      return [
        { label: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
        { label: 'Users', href: '/dashboard/admin/users', icon: Users },
        { label: 'Driver Approvals', href: '/dashboard/admin/drivers/pending', icon: Shield },
      ];
    }
    return [];
  };

  const roleNavItems = getRoleNavItems();
  const RoleIcon = isClient ? Briefcase : isDriver ? Truck : isAdmin ? Shield : User;

  // Handle logout - just call logout, the layout handles the loader
  const handleLogout = () => {
    setOpen(false);
    logout(); // This dispatches the 'app:logout' event
    // No router.push - layout handles redirect
  };

  return (
    <>
      {/* Header */}
      <header
        className="fixed top-0 z-30 h-16 flex items-center bg-white border-b border-gray-200 shadow-sm transition-all duration-300"
        style={{ left: sidebarWidth, width: `calc(100% - ${sidebarWidth}px)` }}
      >
        <div className="flex w-full items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Left Section */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden rounded-lg p-2 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Page Title */}
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{getTitle()}</h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>

          {/* Center Section - Quick Role Badge (Desktop) */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full">
              <RoleIcon className="h-3.5 w-3.5 text-orange-500" />
              <span className="text-xs font-medium text-gray-600 capitalize">
                {user?.role?.toLowerCase()}
              </span>
              {/* Green Blinking Online Indicator */}
              <div className="relative ml-1">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <div className="absolute inset-0 h-2 w-2 rounded-full bg-green-500 animate-ping opacity-75" />
              </div>
            </div>
          )}

          {/* Right Section */}
          <div className="flex items-center gap-1 sm:gap-2">
            

            {/* User Dropdown */}
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setOpen(!open)}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-100 transition-colors"
                >
                  {/* Avatar */}
                  <div className="relative">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white flex items-center justify-center text-sm font-semibold shadow-sm">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                    {/* Green Blinking Online Indicator on Avatar */}
                    <div className="absolute -bottom-0.5 -right-0.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse ring-2 ring-white" />
                    </div>
                  </div>
                  
                  <span className="hidden lg:block text-sm font-medium text-gray-700">
                    {user?.firstName}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                      open ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {open && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white shadow-lg ring-1 ring-black/5 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white flex items-center justify-center font-semibold">
                          {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {user?.firstName} {user?.lastName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-[10px] font-medium text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-full">
                              {user?.role}
                            </span>
                            <div className="flex items-center gap-0.5">
                              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                              <span className="text-[10px] text-green-600">Online</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Role Navigation */}
                    <div className="py-2">
                      {roleNavItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <item.icon className="h-4 w-4 text-gray-400" />
                          {item.label}
                        </Link>
                      ))}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100" />

                    {/* Common Links */}
                    <div className="py-2">
                      <Link
                        href="/profile"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User className="h-4 w-4 text-gray-400" />
                        Profile
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="h-4 w-4 text-gray-400" />
                        Settings
                      </Link>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-gray-100">
                      <button
                        onClick={handleLogout}
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
              /* Login Button for Unauthenticated */
              <Link
                href="/auth/login"
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg text-sm font-medium hover:shadow-md transition-all"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Brand Accent Strip - Yellow/Gold */}
      <div
        className="fixed top-16 z-30"
        style={{
          left: sidebarWidth,
          width: `calc(100% - ${sidebarWidth}px)`,
          height: '3px',
          background: 'linear-gradient(90deg, #f97316, #facc15, #f97316)',
        }}
      />

      {/* Spacer for fixed header */}
      <div className="h-20" />
    </>
  );
}
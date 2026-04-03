// components/layout/MobileHeader.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  User,
  Truck,
  Shield,
  LayoutDashboard,
  Briefcase,
  Hammer,
  Users,
  PlusCircle,
  Settings,
  LogOut,
  ChevronRight,
  Bell,
  Home,
} from 'lucide-react';

export function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, isClient, isDriver, isAdmin, logout } = useAuth();

  // Don't show on auth pages
  if (!isAuthenticated || pathname?.includes('/auth/')) {
    return null;
  }

  const getMenuItems = () => {
    const commonItems = [
      { name: 'Home', href: '/', icon: Home },
    ];

    if (isClient) {
      return [
        ...commonItems,
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Find Jobs', href: '/jobs', icon: Briefcase },
        { name: 'Post Shipment', href: '/jobs/create', icon: PlusCircle },
        { name: 'Profile', href: '/profile', icon: User },
        { name: 'Settings', href: '/settings', icon: Settings },
      ];
    }

    if (isDriver) {
      return [
        ...commonItems,
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Find Jobs', href: '/jobs', icon: Briefcase },
        { name: 'My Bids', href: '/bids', icon: Hammer },
        { name: 'My Vehicles', href: '/vehicles', icon: Truck },
        { name: 'Profile', href: '/profile', icon: User },
        { name: 'Settings', href: '/settings', icon: Settings },
      ];
    }

    if (isAdmin) {
      return [
        ...commonItems,
        { name: 'Admin Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Manage Users', href: '/admin/users', icon: Users },
        { name: 'Manage Drivers', href: '/admin/drivers', icon: Truck },
        { name: 'All Jobs', href: '/admin/jobs', icon: Briefcase },
        { name: 'Profile', href: '/profile', icon: User },
        { name: 'Settings', href: '/settings', icon: Settings },
      ];
    }

    return commonItems;
  };

  const menuItems = getMenuItems();

  const isActive = (href: string) => {
    if (href === '/') return pathname === href;
    return pathname?.startsWith(href);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TA</span>
            </div>
            <span className="font-bold text-lg text-gray-900">Tani Africa</span>
          </Link>

          {/* Right side icons */}
          <div className="flex items-center gap-2">
            {/* Notifications (optional) */}
            <button className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Menu Button */}
            <button
              onClick={() => setIsOpen(true)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar Drawer Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/50"
            />
            
            {/* Drawer Panel - Left side for better UX */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-80 bg-white shadow-2xl overflow-y-auto"
            >
              {/* Header with User Info */}
              <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-5 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/30">
                      <span className="text-xl font-bold">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-white/80 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex-shrink-0"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                {/* Role Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 text-xs font-semibold">
                  {isClient && <><User className="h-3 w-3" /> Client</>}
                  {isDriver && <><Truck className="h-3 w-3" /> Driver</>}
                  {isAdmin && <><Shield className="h-3 w-3" /> Admin</>}
                </div>
              </div>
              
              {/* Menu Items */}
              <div className="py-3">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between px-5 py-3 transition-colors ${
                        active
                          ? 'bg-primary-50 text-primary-600 border-r-4 border-primary-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 ${active ? 'text-primary-600' : 'text-gray-500'}`} />
                        <span className={`text-sm font-medium ${active ? 'text-primary-600' : 'text-gray-700'}`}>
                          {item.name}
                        </span>
                      </div>
                      {active && <ChevronRight className="h-4 w-4 text-primary-600" />}
                    </Link>
                  );
                })}
              </div>
              
              {/* Divider */}
              <div className="border-t border-gray-100 my-2 mx-5" />
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-5 py-3 text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span className="text-sm font-medium">Logout</span>
              </button>
              
              {/* App Version */}
              <div className="px-5 py-4 mt-4">
                <p className="text-xs text-gray-400">Version 1.0.0</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
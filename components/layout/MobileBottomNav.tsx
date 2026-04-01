'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  Home,
  Briefcase,
  Truck,
  User,
  LayoutDashboard,
  Package,
  Hammer,
  Users,
  Shield,
  Menu,
  X,
  PlusCircle,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
  roles?: ('CLIENT' | 'DRIVER' | 'ADMIN')[];
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user, isAuthenticated, isClient, isDriver, isAdmin, logout } = useAuth();
  const [showSidebar, setShowSidebar] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't show bottom nav on auth pages
  if (!mounted || !isAuthenticated || pathname?.includes('/auth/')) {
    return null;
  }

  // Navigation items based on user role
  const getNavItems = (): NavItem[] => {
    const commonItems: NavItem[] = [
      { name: 'Home', href: '/', icon: Home },
    ];

    if (isClient) {
      return [
        ...commonItems,
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Jobs', href: '/jobs', icon: Briefcase },
        { name: 'Post', href: '/jobs/create', icon: PlusCircle },
        { name: 'Profile', href: '/profile', icon: User },
      ];
    }

    if (isDriver) {
      return [
        ...commonItems,
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Find Jobs', href: '/jobs', icon: Briefcase },
        { name: 'My Bids', href: '/bids', icon: Hammer },
        { name: 'Profile', href: '/profile', icon: User },
      ];
    }

    if (isAdmin) {
      return [
        ...commonItems,
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Users', href: '/admin/users', icon: Users },
        { name: 'Drivers', href: '/admin/drivers', icon: Truck },
        { name: 'Profile', href: '/profile', icon: User },
      ];
    }

    return commonItems;
  };

  const navItems = getNavItems();

  const isActive = (href: string) => {
    if (href === '/') return pathname === href;
    return pathname?.startsWith(href);
  };

  // Sidebar menu items
  const sidebarItems = [
    { name: 'Dashboard', href: isClient ? '/dashboard' : isDriver ? '/dashboard' : '/admin', icon: LayoutDashboard },
    { name: 'Jobs', href: '/jobs', icon: Briefcase },
    ...(isClient ? [{ name: 'Post Shipment', href: '/jobs/create', icon: PlusCircle }] : []),
    ...(isDriver ? [{ name: 'My Bids', href: '/bids', icon: Hammer }] : []),
    ...(isDriver ? [{ name: 'My Vehicles', href: '/vehicles', icon: Truck }] : []),
    ...(isAdmin ? [{ name: 'Manage Users', href: '/admin/users', icon: Users }] : []),
    ...(isAdmin ? [{ name: 'Approve Drivers', href: '/admin/drivers', icon: Shield }] : []),
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    setShowSidebar(false);
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg md:hidden">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl transition-all duration-200 ${
                  active
                    ? 'text-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className={`relative ${active ? 'animate-bounce-once' : ''}`}>
                  <Icon className="h-5 w-5" />
                  {active && (
                    <motion.div
                      layoutId="active-indicator"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary-600 rounded-full"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </div>
                <span className="text-[10px] mt-1 font-medium">{item.name}</span>
              </Link>
            );
          })}
          
          {/* Menu Button for Sidebar */}
          <button
            onClick={() => setShowSidebar(true)}
            className="flex flex-col items-center justify-center px-3 py-1 rounded-xl text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Menu className="h-5 w-5" />
            <span className="text-[10px] mt-1 font-medium">Menu</span>
          </button>
        </div>
      </div>

      {/* Sidebar Drawer */}
      <AnimatePresence>
        {showSidebar && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSidebar(false)}
              className="fixed inset-0 z-50 bg-black/50 md:hidden"
            />
            
            {/* Sidebar Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-80 bg-white shadow-2xl md:hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="text-xl font-bold">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-white/80">{user?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSidebar(false)}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
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
              <div className="py-4">
                {sidebarItems.map((item, index) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setShowSidebar(false)}
                      className={`flex items-center justify-between px-6 py-3 transition-colors ${
                        active
                          ? 'bg-primary-50 text-primary-600 border-l-4 border-primary-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 ${active ? 'text-primary-600' : 'text-gray-500'}`} />
                        <span className={`font-medium ${active ? 'text-primary-600' : 'text-gray-700'}`}>
                          {item.name}
                        </span>
                      </div>
                      {active && <ChevronRight className="h-4 w-4 text-primary-600" />}
                    </Link>
                  );
                })}
              </div>
              
              {/* Divider */}
              <div className="border-t border-gray-100 my-2" />
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-6 py-3 text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Logout</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add padding at bottom to prevent content from being hidden behind bottom nav */}
      <style jsx global>{`
        @media (max-width: 768px) {
          body {
            padding-bottom: 70px;
          }
        }
        
        @keyframes bounce-once {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        
        .animate-bounce-once {
          animation: bounce-once 0.3s ease-in-out;
        }
      `}</style>
    </>
  );
}
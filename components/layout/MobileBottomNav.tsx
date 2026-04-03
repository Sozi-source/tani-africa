// components/layout/MobileBottomNav.tsx
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
  PlusCircle,
  Bell,
  Settings,
  Heart,
  Star,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const { isAuthenticated, isClient, isDriver, isAdmin, user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't show bottom nav while loading or on auth pages
  if (!mounted || loading || !isAuthenticated || pathname?.includes('/auth/')) {
    return null;
  }

  // Navigation items based on user role (max 4-5 items for bottom nav)
  const getNavItems = (): NavItem[] => {
    // Client specific navigation
    if (isClient) {
      return [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'My Jobs', href: '/jobs/my', icon: Briefcase },
        { name: 'Post', href: '/jobs/create', icon: PlusCircle },
      ];
    }

    // Driver specific navigation
    if (isDriver) {
      return [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Available Jobs', href: '/jobs', icon: Briefcase },
        { name: 'My Bids', href: '/bids', icon: Hammer },
      ];
    }

    // Admin specific navigation
    if (isAdmin) {
      return [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Users', href: '/admin/users', icon: Users },
        { name: 'Drivers', href: '/admin/drivers', icon: Truck },
      ];
    }

    // Fallback for authenticated users without specific role
    return [
      { name: 'Home', href: '/', icon: Home },
      { name: 'Profile', href: '/profile', icon: User },
    ];
  };

  const navItems = getNavItems();

  // Check if a nav item is active
  const isActive = (href: string) => {
    if (href === '/') return pathname === href;
    if (href === '/dashboard' && pathname === '/dashboard') return true;
    if (href === '/admin' && pathname === '/admin') return true;
    return pathname?.startsWith(href);
  };

  // Don't render if no nav items
  if (navItems.length === 0) return null;

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg md:hidden safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all duration-200 ${
                  active
                    ? 'text-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="relative">
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
        </div>
      </div>

      {/* Add padding at bottom to prevent content from being hidden behind bottom nav */}
      <style jsx global>{`
        @media (max-width: 768px) {
          body {
            padding-bottom: 70px;
          }
        }
      `}</style>
    </>
  );
}
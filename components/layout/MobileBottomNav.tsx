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
  Hammer,
  Users,
  PlusCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const { isAuthenticated, isClient, isDriver, isAdmin, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || loading || !isAuthenticated || pathname?.includes('/auth/')) {
    return null;
  }

  const getNavItems = (): NavItem[] => {
    if (isClient) {
      return [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'My Jobs', href: '/jobs/my', icon: Briefcase },
        { name: 'Post', href: '/jobs/create', icon: PlusCircle },
      ];
    }

    if (isDriver) {
      return [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Jobs', href: '/jobs', icon: Briefcase },
        { name: 'Bids', href: '/bids', icon: Hammer },
      ];
    }

    if (isAdmin) {
      return [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Admin', href: '/dashboard/admin', icon: LayoutDashboard },
        { name: 'Users', href: '/admin/users', icon: Users },
        { name: 'Drivers', href: '/admin/drivers', icon: Truck },
      ];
    }

    return [{ name: 'Home', href: '/', icon: Home }];
  };

  const navItems = getNavItems();

  const isActive = (href: string) => {
    if (href === '/') return pathname === href;
    return pathname?.startsWith(href);
  };

  return (
    <>
      {/* ✅ NAIVAS MOBILE BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex flex-col items-center justify-center flex-1 py-1"
              >
                <div className="relative flex flex-col items-center">
                  <Icon
                    className={`
                      h-5 w-5 transition-colors
                      ${
                        active
                          ? 'text-[color:var(--color-primary-600)]'
                          : 'text-gray-400'
                      }
                    `}
                  />

                  {/* ✅ ACTIVE INDICATOR */}
                  {active && (
                    <motion.div
                      layoutId="mobile-nav-indicator"
                      className="mt-1 w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: 'var(--color-secondary-500)',
                      }}
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </div>

                <span
                  className={`
                    mt-1 text-[10px] font-medium transition-colors
                    ${
                      active
                        ? 'text-[color:var(--color-primary-600)]'
                        : 'text-gray-500'
                    }
                  `}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ✅ PAGE SAFE‑AREA PADDING */}
      <style jsx global>{`
        @media (max-width: 768px) {
          body {
            padding-bottom: 76px;
          }
        }
      `}</style>
    </>
  );
}
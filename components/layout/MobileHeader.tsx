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

  if (!isAuthenticated || pathname?.includes('/auth/')) return null;

  const getMenuItems = () => {
    const common = [{ name: 'Home', href: '/', icon: Home }];

    if (isClient) {
      return [
        ...common,
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Jobs', href: '/jobs', icon: Briefcase },
        { name: 'Post Shipment', href: '/jobs/create', icon: PlusCircle },
      ];
    }

    if (isDriver) {
      return [
        ...common,
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Bids', href: '/bids', icon: Hammer },
        { name: 'Vehicles', href: '/vehicles', icon: Truck },
      ];
    }

    if (isAdmin) {
      return [
        ...common,
        { name: 'Admin Dashboard', href: '/dashboard/admin', icon: Shield },
        { name: 'Users', href: '/admin/users', icon: Users },
        { name: 'Jobs', href: '/admin/jobs', icon: Briefcase },
      ];
    }

    return common;
  };

  const isActive = (href: string) =>
    href === '/' ? pathname === href : pathname?.startsWith(href);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* ✅ NAIVAS MOBILE TOP BAR */}
      <div
        className="sticky top-0 z-40 md:hidden shadow-lg"
        style={{ background: 'var(--gradient-primary)' }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-white">
            <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center font-bold">
              TA
            </div>
            <span className="font-semibold text-lg">Tani Africa</span>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-lg hover:bg-white/15 text-white">
              <Bell className="h-5 w-5" />
              <span
                className="absolute top-1 right-1 h-2 w-2 rounded-full"
                style={{ backgroundColor: 'var(--color-secondary-500)' }}
              />
            </button>

            <button
              onClick={() => setIsOpen(true)}
              className="p-2 rounded-lg hover:bg-white/15 text-white"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* ✅ DRAWER */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              className="fixed left-0 top-0 bottom-0 z-50 w-80 bg-white shadow-2xl"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25 }}
            >
              {/* ✅ DRAWER HEADER */}
              <div
                className="p-5 text-white"
                style={{ background: 'var(--gradient-primary)' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
                      {user?.firstName?.[0]}
                      {user?.lastName?.[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-white/80">
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg bg-white/15 hover:bg-white/25"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 text-xs font-semibold">
                  {isClient && <><User className="h-3 w-3" /> Client</>}
                  {isDriver && <><Truck className="h-3 w-3" /> Driver</>}
                  {isAdmin && <><Shield className="h-3 w-3" /> Admin</>}
                </div>
              </div>

              {/* ✅ MENU */}
              <div className="py-3">
                {menuItems.map(item => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`
                        flex items-center justify-between px-5 py-3
                        transition
                        ${
                          active
                            ? 'bg-[color:var(--color-primary-50)] text-[color:var(--color-primary-700)] border-r-4 border-[color:var(--color-secondary-500)]'
                            : 'text-gray-700 hover:bg-gray-50'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 ${active ? 'text-[color:var(--color-primary-600)]' : 'text-gray-500'}`} />
                        <span className="text-sm font-medium">
                          {item.name}
                        </span>
                      </div>
                      {active && (
                        <ChevronRight className="h-4 w-4 text-[color:var(--color-primary-600)]" />
                      )}
                    </Link>
                  );
                })}
              </div>

              {/* ✅ LOGOUT */}
              <div className="border-t mt-2">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-5 py-3 text-[color:var(--color-primary-700)] hover:bg-[color:var(--color-primary-50)]"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>

              <div className="px-5 py-4">
                <p className="text-xs text-gray-400">Version 1.0.0</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
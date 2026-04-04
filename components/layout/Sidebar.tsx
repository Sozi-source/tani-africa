'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLogout } from '@/lib/hooks/useLogout';
import {
  LayoutDashboard, Briefcase, Car, Award, User,
  Settings, LogOut, Truck, PlusCircle, X, Package,
  Users, Shield, BarChart3, MessageCircle,
  Wallet, HelpCircle, ChevronLeft, ChevronRight,
  Construction, Sparkles
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CgDrive } from 'react-icons/cg';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCollapseChange?: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  onCollapseChange,
}) => {
  const pathname = usePathname();
  const { user, isClient, isDriver, isAdmin } = useAuth();
  const { handleLogout, isLoggingOut } = useLogout();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const resize = () => setIsMobile(window.innerWidth < 1024);
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    onCollapseChange?.(isCollapsed);
  }, [isCollapsed, onCollapseChange]);

  const isActive = (href: string) => pathname === href;

  const navItems = isClient
    ? [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'My Shipments', href: '/jobs/my', icon: Package },
        { name: 'Post Shipment', href: '/dashboard/clientjobs/create', icon: PlusCircle },
      ]
    : isDriver
    ? [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Available Jobs', href: '/jobs', icon: Briefcase },
        { name: 'My Vehicles', href: '/vehicles', icon: Car },
        { name: 'Earnings', href: '/earnings', icon: Wallet },
      ]
    : isAdmin
    ? [
        { name: 'Admin Dashboard', href: '/dashboard/admin', icon: Shield },
        { name: 'Users', href: '/dashboard/admin/users', icon: Users },
        { name: 'Jobs', href: '/jobs', icon: Briefcase },
        { name: 'Vehicles', href: '/vehicles', icon: Truck },
        { name: 'driver', href: '/dashboard/admin/drivers', icon: CgDrive },
        { name: 'features', href: '/dashboard/admin/features', icon: Settings },
        { name: 'testimonials', href: '/dashboard/admin/testimonials', icon: Award },
      ]
    : [];

  return (
    <>
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className="
          fixed left-0 top-0 z-50 h-full
          bg-gradient-to-b from-[color:var(--color-primary-600)] 
          to-[color:var(--color-primary-700)]
          shadow-xl flex flex-col
        "
        animate={{
          width: !isMobile && isCollapsed ? 72 : 280,
          x: isMobile && !isOpen ? -320 : 0,
        }}
        transition={{ type: 'spring', damping: 25 }}
      >
        {/* Logo / Header */}
        <div className="h-16 flex items-center justify-between px-4">
          {!isCollapsed && (
            <div className="flex items-center gap-2 text-white">
              <Truck className="h-6 w-6" />
              <span className="font-bold">Tani Africa</span>
            </div>
          )}

          {!isMobile && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-white/70 hover:text-white"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          )}

          {isMobile && (
            <button onClick={onClose}>
              <X className="h-5 w-5 text-white" />
            </button>
          )}
        </div>

        {/* User Card */}
        {!isCollapsed && user && (
          <div className="mx-3 my-4 rounded-xl bg-white/15 p-3 text-white">
            <p className="text-sm font-medium">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-white/70 capitalize">
              {user.role?.toLowerCase()}
            </p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-2 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => isMobile && onClose()}
              className={`
                flex items-center gap-3 rounded-lg px-3 py-2.5
                transition-all duration-150
                ${
                  isActive(item.href)
                    ? 'bg-gradient-to-r from-[color:var(--color-primary-500)] to-[color:var(--color-secondary-500)] text-white shadow-md'
                    : 'text-white/75 hover:bg-white/10 hover:text-white'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
            >
              <item.icon className="h-5 w-5" />
              {!isCollapsed && <span className="text-sm">{item.name}</span>}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="
              w-full flex items-center justify-center gap-2
              rounded-xl px-3 py-3
              bg-white/15 hover:bg-white/25
              text-white transition
            "
          >
            <LogOut className="h-5 w-5" />
            {!isCollapsed && <span>Sign out</span>}
          </button>
        </div>

        {/* Decorative */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-20">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
      </motion.aside>
    </>
  );
};
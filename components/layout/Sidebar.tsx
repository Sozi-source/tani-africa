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
        { name: 'My Shipments', href: '/dashboard/client/jobs', icon: Package },
        { name: 'Post Shipment', href: '/dashboard/client/jobs/create', icon: PlusCircle },
        {name: 'Become a Driver', href: '/dashboard/client/apply', icon: CgDrive }
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
        { name: 'Jobs', href: '/dashboard/admin/jobs', icon: Briefcase },
        { name: 'Vehicles', href: '/vehicles', icon: Truck },
        { name: 'driver', href: '/dashboard/admin/drivers', icon: CgDrive },
       
      ]
    : [];

  return (
    <>
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
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
          bg-gradient-to-b from-maroon-800 to-maroon-900
          shadow-2xl flex flex-col
        "
        animate={{
          width: !isMobile && isCollapsed ? 72 : 280,
          x: isMobile && !isOpen ? -320 : 0,
        }}
        transition={{ type: 'spring', damping: 25 }}
      >
        {/* Logo / Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
          {!isCollapsed && (
            <div className="flex items-center gap-2 text-white">
              <div className="bg-white/10 rounded-lg p-1.5">
                <Truck className="h-5 w-5 text-teal-300" />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-white to-teal-200 bg-clip-text text-transparent">
                Tani Africa
              </span>
            </div>
          )}

          {!isMobile && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-white/60 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          )}

          {isMobile && (
            <button onClick={onClose} className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* User Card */}
        {!isCollapsed && user && (
          <div className="mx-3 my-4 rounded-xl bg-gradient-to-r from-white/15 to-white/5 p-3 text-white backdrop-blur-sm">
            <p className="text-sm font-medium">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-teal-200 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
              {user.role?.toLowerCase()}
            </p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => isMobile && onClose()}
              className={`
                flex items-center gap-3 rounded-lg px-3 py-2.5
                transition-all duration-200 group
                ${
                  isActive(item.href)
                    ? 'bg-gradient-to-r from-maroon-600 to-teal-700 text-white shadow-md'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
            >
              <item.icon className={`h-5 w-5 ${isActive(item.href) ? 'text-teal-200' : ''}`} />
              {!isCollapsed && <span className="text-sm">{item.name}</span>}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  {item.name}
                </div>
              )}
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
              bg-white/10 hover:bg-red-500/20
              text-white/80 hover:text-red-300
              transition-all duration-200
              group
            "
          >
            <LogOut className="h-5 w-5" />
            {!isCollapsed && <span>Sign out</span>}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-red-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                Sign out
              </div>
            )}
          </button>
        </div>

        {/* Decorative */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-10">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
      </motion.aside>
    </>
  );
};
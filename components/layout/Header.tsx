// components/layout/Header.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { 
  Menu, Truck, User, LogOut, ChevronDown, Bell, Settings, 
  LayoutDashboard, Briefcase, Shield, HelpCircle, Zap,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout, isAuthenticated, isClient, isDriver, isAdmin } = useAuth();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setShowUserMenu(false);
    setShowNotifications(false);
    setShowSearch(false);
  }, [pathname]);

  const getRoleInfo = () => {
    if (isAdmin) return { label: 'Admin', icon: Shield, color: 'from-gray-700 to-gray-900', badge: '👑' };
    if (isDriver) return { label: 'Driver', icon: Truck, color: 'from-amber-500 to-orange-600', badge: '🚛' };
    if (isClient) return { label: 'Client', icon: User, color: 'from-blue-500 to-blue-600', badge: '⭐' };
    return { label: 'Guest', icon: User, color: 'from-gray-400 to-gray-500', badge: '👋' };
  };

  const roleInfo = getRoleInfo();
  const RoleIcon = roleInfo.icon;

  const getNavLinks = () => {
    if (isClient) return [{ name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }];
    if (isDriver) return [{ name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }];
    if (isAdmin) return [{ name: 'Admin', href: '/admin', icon: Shield }];
    return [];
  };

  // Don't show fixed header on auth pages
  if (pathname?.includes('/auth/')) return null;

  return (
    <>
      <header className={`
        fixed top-0 right-0 z-30 transition-all duration-300
        ${scrolled 
          ? 'bg-white/95 shadow-lg backdrop-blur-md border-b border-gray-200' 
          : 'bg-white border-b border-gray-100'
        }
        lg:left-64 // This ensures header starts where sidebar ends on desktop
      `}>
        {/* Role accent bar */}
        <div className={`h-0.5 bg-gradient-to-r ${roleInfo.color}`} />
        
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Left: Menu button (mobile) + Page Title */}
            <div className="flex items-center gap-3">
              <button
                onClick={onMenuClick}
                className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden transition-colors"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              
              {/* Dynamic Page Title */}
              <div className="hidden lg:block">
                <h1 className="text-lg font-semibold text-gray-900">
                  {pathname === '/dashboard' && 'Dashboard'}
                  {pathname === '/jobs' && 'Available Jobs'}
                  {pathname === '/jobs/my' && 'My Jobs'}
                  {pathname === '/jobs/create' && 'Post a Job'}
                  {pathname === '/vehicles' && 'My Vehicles'}
                  {pathname === '/profile' && 'Profile'}
                  {pathname === '/settings' && 'Settings'}
                  {pathname === '/admin' && 'Admin Panel'}
                  {pathname === '/bids/my' && 'My Bids'}
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>

            {/* Center: Search Bar (Desktop) */}
            <div className="hidden lg:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search jobs, vehicles, or messages..."
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {/* Search (Mobile) */}
              <button 
                onClick={() => setShowSearch(!showSearch)}
                className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Help */}
              <button className="hidden sm:flex items-center gap-1.5 rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors">
                <HelpCircle className="h-4 w-4" />
                <span className="text-sm font-medium hidden lg:inline">Help</span>
              </button>

              {/* Notifications */}
              {isAuthenticated && (
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                </button>
              )}

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-100 transition-colors"
                  >
                    <div className={`h-8 w-8 rounded-full bg-gradient-to-r ${roleInfo.color} flex items-center justify-center text-white font-semibold text-sm shadow-sm`}>
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                    <span className="hidden lg:block text-sm font-medium text-gray-700">
                      {user?.firstName}
                    </span>
                    <ChevronDown className={`hidden lg:block h-3.5 w-3.5 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          className="absolute right-0 top-full mt-2 w-56 rounded-lg bg-white shadow-lg ring-1 ring-black/5 z-50 overflow-hidden"
                        >
                          <div className="border-b border-gray-100 px-4 py-3">
                            <p className="text-xs text-gray-500">Signed in as</p>
                            <p className="text-sm font-semibold text-gray-900 truncate">{user?.email}</p>
                          </div>
                          
                          <div className="py-2">
                            {getNavLinks().map((item) => (
                              <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setShowUserMenu(false)}
                                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <item.icon className="h-4 w-4" />
                                <span>{item.name}</span>
                              </Link>
                            ))}
                            <Link href="/profile" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                              <User className="h-4 w-4" /><span>Profile</span>
                            </Link>
                            <Link href="/settings" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                              <Settings className="h-4 w-4" /><span>Settings</span>
                            </Link>
                          </div>
                          
                          <div className="border-t border-gray-100 py-2">
                            <button onClick={logout} className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                              <LogOut className="h-4 w-4" /><span>Logout</span>
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/auth/login">
                    <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Login</Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button variant="primary" size="sm" className="gap-1">
                      Sign Up <Zap className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="border-t border-gray-100 bg-white p-3 lg:hidden"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-amber-300 focus:outline-none"
                  autoFocus
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notifications Dropdown */}
        <AnimatePresence>
          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-4 top-14 w-80 rounded-lg bg-white shadow-lg ring-1 ring-black/5 z-50"
              >
                <div className="border-b border-gray-100 px-4 py-3">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="py-8 text-center text-sm text-gray-500">
                  No new notifications
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      {/* Spacer to prevent content from hiding under fixed header */}
      <div className="h-16" />
    </>
  );
}
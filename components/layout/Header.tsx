// components/layout/Header.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Menu, X, Truck, User, LogOut, ChevronDown, LayoutDashboard, Briefcase, Car, Shield, Users, BarChart2, Home, Package, Gavel, Settings, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Header() {
  const { user, logout, isAuthenticated, isClient, isDriver, isAdmin } = useAuth();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setShowUserMenu(false);
  }, [pathname]);

  const publicNav = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Find Jobs', href: '/jobs', icon: Briefcase },
    { name: 'List Vehicle', href: '/vehicles', icon: Car },
  ];

  const getAuthNav = () => {
    const items = [];
    if (isClient) items.push({ name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard });
    if (isDriver) items.push({ name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard });
    if (isAdmin) items.push({ name: 'Admin', href: '/admin', icon: Shield });
    return items;
  };

  const getUserRoleInfo = () => {
    if (isAdmin) return { label: 'Admin', color: 'bg-gray-900 text-white', icon: Shield };
    if (isDriver) return { label: 'Driver', color: 'bg-amber-100 text-amber-800', icon: Truck };
    if (isClient) return { label: 'Client', color: 'bg-blue-100 text-blue-800', icon: User };
    return { label: 'Guest', color: 'bg-gray-100 text-gray-600', icon: User };
  };

  const roleInfo = getUserRoleInfo();
  const RoleIcon = roleInfo.icon;

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 shadow-lg backdrop-blur-md' : 'bg-white shadow-md'}`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 lg:h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Truck className="h-8 w-8 text-amber-500 transition-transform group-hover:scale-110" />
            <span className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Tani Africa</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-1">
            {publicNav.map((item) => (
              <Link key={item.name} href={item.href} className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-all ${pathname === item.href ? 'bg-amber-50 text-amber-600' : 'text-gray-600 hover:bg-gray-100 hover:text-amber-600'}`}>
                <item.icon className="h-4 w-4" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}

            {isAuthenticated ? (
              <div className="relative ml-4 flex items-center">
                <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
                  <div className={`flex items-center gap-1.5 rounded-full ${roleInfo.color} px-3 py-1.5`}>
                    <RoleIcon className="h-3.5 w-3.5" />
                    <span className="text-xs font-semibold">{roleInfo.label}</span>
                  </div>
                  
                  <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-100 transition-colors">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white font-semibold">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                    <span className="text-sm font-medium text-gray-700 hidden lg:inline-block">{user?.firstName}</span>
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute right-0 top-full mt-2 w-64 rounded-lg bg-white shadow-lg ring-1 ring-black/5 z-50">
                          <div className="border-b border-gray-100 px-4 py-3">
                            <p className="text-xs text-gray-500">Signed in as</p>
                            <p className="font-semibold text-gray-900 truncate">{user?.email}</p>
                          </div>
                          <div className="py-2">
                            {getAuthNav().map((item) => (
                              <Link key={item.name} href={item.href} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-amber-600">
                                <item.icon className="h-4 w-4" />
                                <span>{item.name}</span>
                              </Link>
                            ))}
                            <Link href="/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><User className="h-4 w-4" /><span>Profile</span></Link>
                            <Link href="/settings" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><Settings className="h-4 w-4" /><span>Settings</span></Link>
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
              </div>
            ) : (
              <div className="ml-4 flex items-center gap-3">
                <Link href="/auth/login"><Button variant="ghost" size="sm">Login</Button></Link>
                <Link href="/auth/register"><Button variant="primary" size="sm">Register</Button></Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden">
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden overflow-hidden border-t border-gray-200">
              <div className="py-4 space-y-1">
                {publicNav.map((item) => (
                  <Link key={item.name} href={item.href} className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${pathname === item.href ? 'bg-amber-50 text-amber-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <item.icon className="h-5 w-5" /><span className="font-medium">{item.name}</span>
                  </Link>
                ))}
                {isAuthenticated && getAuthNav().map((item) => (
                  <Link key={item.name} href={item.href} className="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-600 hover:bg-gray-50">
                    <item.icon className="h-5 w-5" /><span className="font-medium">{item.name}</span>
                  </Link>
                ))}
                {isAuthenticated && <Link href="/profile" className="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-600 hover:bg-gray-50"><User className="h-5 w-5" /><span>Profile</span></Link>}
                {isAuthenticated && <Link href="/settings" className="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-600 hover:bg-gray-50"><Settings className="h-5 w-5" /><span>Settings</span></Link>}
                
                <div className="border-t border-gray-100 my-2" />
                {isAuthenticated ? (
                  <button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-red-600 hover:bg-red-50">
                    <LogOut className="h-5 w-5" /><span className="font-medium">Logout</span>
                  </button>
                ) : (
                  <div className="space-y-2 px-4 pt-2">
                    <Link href="/auth/login"><Button variant="outline" fullWidth>Login</Button></Link>
                    <Link href="/auth/register"><Button variant="primary" fullWidth>Register</Button></Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Menu, X, Home, Briefcase, Car, User, LogOut, LayoutDashboard, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

export const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout, isAuthenticated, isClient, isDriver } = useAuth();

  const navItems = isAuthenticated
    ? [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Jobs', href: isClient ? '/jobs/my' : '/jobs', icon: Briefcase },
        { name: 'Vehicles', href: '/vehicles', icon: Car },
        ...(isDriver ? [{ name: 'My Bids', href: '/bids/my', icon: Award }] : []),
        { name: 'Profile', href: '/profile', icon: User },
      ]
    : [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Jobs', href: '/jobs', icon: Briefcase },
        { name: 'Login', href: '/auth/login', icon: User },
        { name: 'Register', href: '/auth/register', icon: User },
      ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-40 rounded-full bg-primary-600 p-3 text-white shadow-lg lg:hidden"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Mobile Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-white shadow-xl lg:hidden">
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <span className="text-lg font-bold text-gray-900">Menu</span>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto py-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center space-x-3 px-4 py-3 transition-colors',
                    isActive(item.href)
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
              {isAuthenticated && (
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Logout</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};
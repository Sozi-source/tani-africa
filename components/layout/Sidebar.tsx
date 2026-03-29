'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { 
  LayoutDashboard, 
  Briefcase, 
  Car, 
  Award, 
  User, 
  Settings, 
  LogOut,
  Truck,
  PlusCircle,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { user, logout, isClient, isDriver } = useAuth();

  const clientNav = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Jobs', href: '/jobs/my', icon: Briefcase },
    { name: 'Post Job', href: '/jobs/create', icon: PlusCircle },
    { name: 'My Vehicles', href: '/vehicles', icon: Car },
    { name: 'Add Vehicle', href: '/vehicles/add', icon: PlusCircle },
  ];

  const driverNav = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Available Jobs', href: '/jobs', icon: Briefcase },
    { name: 'My Bids', href: '/bids/my', icon: Award },
    { name: 'My Vehicles', href: '/vehicles', icon: Car },
    { name: 'Add Vehicle', href: '/vehicles/add', icon: PlusCircle },
  ];

  const commonNav = [
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const navItems = isClient ? clientNav : isDriver ? driverNav : [];

  const isActive = (href: string) => pathname === href;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-50 h-full w-64 bg-white shadow-xl lg:sticky lg:top-0 lg:z-0">
        <div className="flex h-full flex-col">
          {/* Header with close button */}
          <div className="flex items-center justify-between border-b border-gray-200 p-4">
            <Link href="/" className="flex items-center space-x-2" onClick={onClose}>
              <Truck className="h-8 w-8 text-primary-500" />
              <span className="text-xl font-bold text-gray-900">Tani Africa</span>
            </Link>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User Info */}
          {user && (
            <div className="border-b border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                  <p className="text-sm text-gray-500 capitalize">{user.role?.toLowerCase()}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`mx-2 mb-1 flex items-center space-x-3 rounded-lg px-4 py-2.5 transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}

            <div className="my-4 border-t border-gray-200" />

            {commonNav.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`mx-2 mb-1 flex items-center space-x-3 rounded-lg px-4 py-2.5 transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="border-t border-gray-200 p-4">
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="flex w-full items-center space-x-3 rounded-lg px-4 py-2.5 text-red-600 transition-colors hover:bg-red-50"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
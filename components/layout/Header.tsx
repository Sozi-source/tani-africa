'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { 
  Menu, X, Truck, User, LogOut, Briefcase, Car, Home, 
  LayoutDashboard, Award, ChevronDown, Package, Gavel, Shield, Settings
} from 'lucide-react';
import { useResponsive } from '@/lib/hooks/useResponsive';

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout, isAuthenticated, isClient, isDriver, isAdmin } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile } = useResponsive();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Jobs', href: '/jobs', icon: Briefcase },
    { name: 'Vehicles', href: '/vehicles', icon: Car },
  ];

  const authNav = isAuthenticated
    ? [
        ...(isClient ? [
          { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
          { name: 'Post Shipment', href: '/jobs/create', icon: Briefcase },
          { name: 'My Shipments', href: '/jobs/my', icon: Package },
        ] : []),
        ...(isDriver ? [
          { name: 'Dashboard', href: '/dashboard/driver', icon: LayoutDashboard },
          { name: 'Find Loads', href: '/jobs', icon: Briefcase },
          { name: 'My Bids', href: '/bids/my', icon: Gavel },
          { name: 'My Fleet', href: '/vehicles', icon: Truck },
        ] : []),
        ...(isAdmin ? [
          { name: 'Admin', href: '/admin', icon: Shield },
        ] : []),
        { name: 'Profile', href: '/profile', icon: User },
        { name: 'Settings', href: '/settings', icon: Settings },
      ]
    : [];

  const handleLogout = () => {
    logout();
    router.push('/');
    setIsMenuOpen(false);
  };

  const isActive = (href: string) => pathname === href;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 shadow-lg backdrop-blur-md' : 'bg-white shadow-md'
      }`}
    >
      <nav className="container-custom">
        <div className="flex h-16 items-center justify-between lg:h-20">
          {/* Mobile Menu Button */}
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
          )}

          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <Truck className="h-8 w-8 text-primary-500 transition-transform group-hover:scale-110 lg:h-10 lg:w-10" />
              <div className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-secondary-500 animate-pulse" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent lg:text-2xl">
              Tani Africa
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-2 rounded-lg px-4 py-2 transition-all duration-200 ${
                  isActive(item.href)
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-primary-600'
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}

            {isAuthenticated ? (
              <div className="relative ml-4 flex items-center space-x-2 group">
                <div className="flex items-center space-x-3 border-l border-gray-200 pl-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {user?.firstName} {user?.lastName}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </div>
                  
                  <div className="absolute right-0 top-full mt-2 hidden w-48 rounded-lg bg-white shadow-lg ring-1 ring-black/5 group-hover:block">
                    {authNav.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    ))}
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="ml-4 flex items-center space-x-3">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="primary" size="sm">Register</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Desktop Menu Button (for sidebar toggle) */}
          {!isMobile && onMenuClick && (
            <button
              onClick={onMenuClick}
              className="hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:inline-flex"
            >
              <Menu className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMenuOpen && (
          <div className="border-t border-gray-200 bg-white py-4 md:hidden">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}

            {isAuthenticated ? (
              <>
                {authNav.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50"
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </>
            ) : (
              <div className="space-y-2 px-4 pt-2">
                <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" fullWidth>
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="primary" fullWidth>
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};
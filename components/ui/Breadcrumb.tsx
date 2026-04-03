// components/ui/Breadcrumb.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

export function Breadcrumb() {
  const pathname = usePathname();
  const { isClient, isDriver, isAdmin } = useAuth();

  // Don't show breadcrumbs on dashboard or home
  if (pathname === '/' || pathname === '/dashboard' || pathname === '/admin') {
    return null;
  }

  const generateBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs: { label: string; href: string }[] = [];
    
    // Add Home
    breadcrumbs.push({ label: 'Home', href: '/' });

    let currentPath = '';
    for (let i = 0; i < paths.length; i++) {
      const segment = paths[i];
      currentPath += `/${segment}`;
      
      let label = segment.charAt(0).toUpperCase() + segment.slice(1);
      
      // Custom labels for specific routes
      const customLabels: Record<string, string> = {
        'dashboard': 'Dashboard',
        'jobs': 'Jobs',
        'bids': 'Bids',
        'vehicles': 'Vehicles',
        'profile': 'Profile',
        'settings': 'Settings',
        'admin': 'Admin',
        'users': 'Users',
        'drivers': 'Drivers',
        'create': 'Create New',
        'my': 'My Listings',
        'client': 'Client',
        'driver': 'Driver',
      };
      
      label = customLabels[segment] || label;
      
      // Role-based dashboard labels
      if (segment === 'dashboard') {
        if (isClient) label = 'Client Dashboard';
        else if (isDriver) label = 'Driver Dashboard';
        else if (isAdmin) label = 'Admin Dashboard';
      }
      
      breadcrumbs.push({ label, href: currentPath });
    }
    
    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show if only home
  if (breadcrumbs.length <= 1) return null;

  return (
    <nav className="mb-4 sm:mb-6" aria-label="Breadcrumb">
      <div className="flex items-center justify-between">
        <ol className="flex flex-wrap items-center gap-1 text-xs sm:text-sm">
          {breadcrumbs.map((item, index) => (
            <li key={item.href} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="mx-1 h-3 w-3 text-gray-400 flex-shrink-0" />
              )}
              {index === breadcrumbs.length - 1 ? (
                <span className="font-medium text-gray-700 truncate max-w-[150px] sm:max-w-none">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-gray-500 hover:text-primary-600 transition-colors flex items-center gap-1"
                >
                  {index === 0 && <Home className="h-3 w-3" />}
                  <span className="truncate max-w-[100px] sm:max-w-none">{item.label}</span>
                </Link>
              )}
            </li>
          ))}
        </ol>
        
        {/* Mobile back button - appears on detail pages */}
        {breadcrumbs.length > 2 && (
          <Link
            href={breadcrumbs[breadcrumbs.length - 2].href}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary-600 transition-colors sm:hidden"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
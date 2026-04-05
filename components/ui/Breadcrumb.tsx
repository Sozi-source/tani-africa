'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function Breadcrumb() {
  const pathname = usePathname();
  const { isClient, isDriver, isAdmin } = useAuth();

  // Hide on root dashboards
  if (pathname === '/' || pathname === '/dashboard' || pathname === '/admin') {
    return null;
  }

  const generateBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean);
    const crumbs: { label: string; href: string }[] = [];

    // Home always first
    crumbs.push({ label: 'Home', href: '/' });

    let currentPath = '';

    for (const segment of paths) {
      currentPath += `/${segment}`;

      // Custom labels for specific segments
      const customLabels: Record<string, string> = {
        dashboard: 'Dashboard',
        jobs: 'Jobs',
        bids: 'Bids',
        vehicles: 'Vehicles',
        profile: 'Profile',
        settings: 'Settings',
        admin: 'Admin',
        users: 'Users',
        drivers: 'Drivers',
        create: 'Create',
        my: 'My Listings',
      };

      let label = customLabels[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1);

      // Role-specific dashboard labels
      if (segment === 'dashboard') {
        if (isClient) label = 'Client Dashboard';
        else if (isDriver) label = 'Driver Dashboard';
        else if (isAdmin) label = 'Admin Dashboard';
      }

      crumbs.push({ label, href: currentPath });
    }

    return crumbs;
  };

  const breadcrumbs = generateBreadcrumbs();
  
  // Don't show if only home
  if (breadcrumbs.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="">
      <ol className="flex flex-wrap items-center gap-1 text-sm">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <li key={item.href} className="flex items-center">
              {/* Separator */}
              {index > 0 && (
                <ChevronRight className="mx-1 h-3.5 w-3.5 text-gray-400" />
              )}

              {/* Breadcrumb item */}
              {isLast ? (
                <span className="font-medium text-maroon-700 truncate max-w-[200px]">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-gray-500 hover:text-maroon-600 transition-colors duration-150 flex items-center gap-1"
                >
                  {index === 0 && <Home className="h-3.5 w-3.5" />}
                  <span className="truncate max-w-[150px] sm:max-w-none">
                    {item.label}
                  </span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
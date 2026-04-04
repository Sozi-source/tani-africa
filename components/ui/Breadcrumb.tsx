'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

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

    // Home
    crumbs.push({ label: 'Home', href: '/' });

    let currentPath = '';

    for (const segment of paths) {
      currentPath += `/${segment}`;

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

      let label =
        customLabels[segment] ??
        segment.charAt(0).toUpperCase() + segment.slice(1);

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
  if (breadcrumbs.length <= 1) return null;

  const parent = breadcrumbs[breadcrumbs.length - 2];

  return (
    <nav aria-label="Breadcrumb" className="mb-4 sm:mb-6">
      <div className="flex items-center justify-between gap-3">
        
        {/* Desktop / Tablet Breadcrumbs */}
        <ol className="flex flex-wrap items-center gap-1 text-xs sm:text-sm">
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;

            return (
              <li key={item.href} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="mx-1 h-3.5 w-3.5 text-gray-300" />
                )}

                {isLast ? (
                  <span className="font-medium text-gray-700 truncate max-w-[160px] sm:max-w-none">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="
                      flex items-center gap-1
                      text-gray-500
                      hover:text-red-600
                      transition-colors
                    "
                  >
                    {index === 0 && <Home className="h-3.5 w-3.5" />}
                    <span className="truncate max-w-[120px] sm:max-w-none">
                      {item.label}
                    </span>
                  </Link>
                )}
              </li>
            );
          })}
        </ol>

        {/* ✅ Mobile Back Button */}
        {parent && (
          <Link
            href={parent.href}
            className="
              sm:hidden
              flex items-center gap-1
              text-xs font-medium
              text-red-600
              hover:text-red-700
            "
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Link>
        )}
      </div>
    </nav>
  );
}
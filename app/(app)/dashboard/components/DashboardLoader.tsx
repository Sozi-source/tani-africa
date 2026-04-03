'use client';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function DashboardLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-3 text-xs sm:text-sm text-gray-500">Loading dashboard...</p>
      </div>
    </div>
  );
}
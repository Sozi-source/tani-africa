'use client';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function DashboardLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="flex flex-col items-center text-center">

        {/* Spinner */}
        <LoadingSpinner size="lg" />

        {/* Message */}
        <p className="mt-4 text-sm sm:text-base text-gray-500">
          Loading your dashboard…
        </p>
      </div>
    </div>
  );
}
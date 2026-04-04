'use client';

import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface DashboardErrorProps {
  message: string;
  onRetry?: () => void;
}

export function DashboardError({ message, onRetry }: DashboardErrorProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md text-center">

        {/* Icon */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="h-7 w-7 text-red-600" />
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900">
          Something went wrong
        </h3>

        {/* Message */}
        <p className="mt-1 text-sm text-gray-600">
          {message}
        </p>

        {/* Action */}
        {onRetry && (
          <Button
            onClick={onRetry}
            className="mt-5 bg-red-600 hover:bg-red-700 text-white"
          >
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}
``
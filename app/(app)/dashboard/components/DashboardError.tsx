'use client';

import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface DashboardErrorProps {
  message: string;
  onRetry?: () => void;
}

export function DashboardError({ message, onRetry }: DashboardErrorProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="text-base font-semibold text-gray-900">Something went wrong</h3>
        <p className="mt-1 text-sm text-gray-500">{message}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="primary" className="mt-4">
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}
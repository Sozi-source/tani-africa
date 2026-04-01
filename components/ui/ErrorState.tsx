'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  icon?: React.ComponentType<{ className?: string }>;
  onRetry?: () => void;
  showRetry?: boolean;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'An error occurred while loading this content. Please try again.',
  icon: Icon = AlertCircle,
  onRetry,
  showRetry = true,
  className = '',
}: ErrorStateProps) {
  return (
    <div className={`flex min-h-[400px] flex-col items-center justify-center text-center ${className}`}>
      <div className="rounded-full bg-red-50 p-4 mb-4">
        <Icon className="h-12 w-12 text-red-500" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      
      <p className="text-sm text-gray-500 max-w-md mb-6">
        {message}
      </p>
      
      {showRetry && onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}
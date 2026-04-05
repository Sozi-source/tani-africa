'use client';

import { AlertCircle, RefreshCw, Home, WifiOff, Server, ShieldAlert, Truck } from 'lucide-react';
import { Button } from './Button';
import Link from 'next/link';

interface ErrorStateProps {
  title?: string;
  message?: string;
  icon?: React.ComponentType<{ className?: string }>;
  onRetry?: () => void;
  showRetry?: boolean;
  showHome?: boolean;
  variant?: 'default' | 'network' | 'server' | 'auth' | 'not-found';
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'An error occurred while loading this content. Please try again.',
  icon: Icon = AlertCircle,
  onRetry,
  showRetry = true,
  showHome = false,
  variant = 'default',
  className = '',
}: ErrorStateProps) {
  const variantConfig = {
    default: {
      icon: AlertCircle,
      bgColor: 'bg-maroon-50',
      textColor: 'text-maroon-600',
      title: 'Something went wrong',
    },
    network: {
      icon: WifiOff,
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      title: 'Network Error',
    },
    server: {
      icon: Server,
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      title: 'Server Error',
    },
    auth: {
      icon: ShieldAlert,
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-600',
      title: 'Authentication Error',
    },
    'not-found': {
      icon: Truck,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      title: 'Not Found',
    },
  };

  const config = variantConfig[variant];
  const DisplayIcon = Icon || config.icon;
  const displayTitle = title || config.title;

  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center ${className}`}>
      <div className={`rounded-full ${config.bgColor} p-5 mb-5 shadow-sm`}>
        <DisplayIcon className={`h-12 w-12 ${config.textColor}`} />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {displayTitle}
      </h3>
      
      <p className="text-sm text-gray-500 max-w-md mb-8">
        {message}
      </p>
      
      <div className="flex flex-wrap gap-3 justify-center">
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
        
        {showHome && (
          <Link href="/">
            <Button variant="primary" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { AlertCircle, RefreshCw, Home, Mail, Phone, Truck } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            {/* Icon */}
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-12 w-12 text-red-500" />
              </div>
            </div>
            
            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Something Went Wrong
            </h1>
            
            {/* Message */}
            <p className="text-gray-600 mb-6">
              {error.message || 'An unexpected error occurred. Our team has been notified.'}
            </p>
            
            {/* Error Code */}
            {error.digest && (
              <p className="text-xs text-gray-400 mb-6 font-mono">
                Error ID: {error.digest}
              </p>
            )}
            
            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={reset}
                variant="primary"
                className="w-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              
              <Link href="/">
                <Button variant="outline" className="w-full">
                  <Home className="mr-2 h-4 w-4" />
                  Go to Homepage
                </Button>
              </Link>
            </div>
            
            {/* Support Info */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-3">Need help? Contact us:</p>
              <div className="flex justify-center gap-4">
                <a href="mailto:support@taniafrica.com" className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  support@taniafrica.com
                </a>
                <a href="tel:+254700123456" className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  +254 700 123 456
                </a>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
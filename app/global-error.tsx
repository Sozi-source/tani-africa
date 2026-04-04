'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import {
  AlertCircle,
  RefreshCw,
  Home,
  Mail,
  Phone,
  Truck,
} from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="w-full max-w-md text-center">

            {/* Brand / Icon */}
            <div className="mb-6">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-10 w-10 text-red-600" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Something went wrong
            </h1>

            {/* Message */}
            <p className="text-sm text-gray-600 mb-4">
              {error.message ||
                'We ran into an unexpected issue. Please try again or return to safety.'}
            </p>

            {/* Error ID (for support) */}
            {error.digest && (
              <p className="mb-6 text-xs text-gray-400 font-mono">
                Error reference: {error.digest}
              </p>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={reset}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>

              <Link href="/">
                <Button
                  variant="outline"
                  className="w-full"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go to Home
                </Button>
              </Link>
            </div>

            {/* Support / Trust */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="mb-3 flex items-center justify-center gap-2">
                <Truck className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700">
                  Tani Africa Support
                </span>
              </div>

              <p className="text-xs text-gray-500 mb-3">
                If the problem persists, contact our support team:
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-3 text-sm">
                <a
                  href="mailto:support@taniafrica.com"
                  className="inline-flex items-center gap-1 text-red-600 hover:text-red-700"
                >
                  <Mail className="h-4 w-4" />
                  support@taniafrica.com
                </a>

                <a
                  href="tel:+254700123456"
                  className="inline-flex items-center gap-1 text-red-600 hover:text-red-700"
                >
                  <Phone className="h-4 w-4" />
                  +254 700 123 456
                </a>
              </div>
            </div>

            {/* Footer note */}
            <p className="mt-6 text-xs text-gray-400">
              © {new Date().getFullYear()} Tani Africa · Secure logistics platform
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
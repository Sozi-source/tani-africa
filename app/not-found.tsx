'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Home, ArrowLeft, Search, Truck, Compass } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto bg-amber-100 rounded-full flex items-center justify-center">
            <Compass className="h-12 w-12 text-amber-500" />
          </div>
        </div>
        
        {/* 404 Number */}
        <h1 className="text-8xl font-bold text-gray-900 mb-2">404</h1>
        
        {/* Title */}
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">
          Page Not Found
        </h2>
        
        {/* Message */}
        <p className="text-gray-600 mb-6">
          Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or never existed.
        </p>
        
        {/* Suggestions */}
        <div className="bg-white rounded-lg p-4 mb-6 text-left border border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Search className="h-4 w-4" />
            You might want to try:
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Checking the URL for typos</li>
            <li>• Going back to the previous page</li>
            <li>• Using the navigation menu</li>
            <li>• Contacting support if you think this is an error</li>
          </ul>
        </div>
        
        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => router.back()}
            className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
          
          <Link href="/">
            <Button variant="primary" className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
        
        {/* Quick Links */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-3">Popular pages:</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/jobs" className="text-primary-600 hover:text-primary-700 text-sm">
              Find Jobs
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/dashboard" className="text-primary-600 hover:text-primary-700 text-sm">
              Dashboard
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/vehicles" className="text-primary-600 hover:text-primary-700 text-sm">
              Vehicles
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/driver/apply" className="text-primary-600 hover:text-primary-700 text-sm">
              Become a Driver
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
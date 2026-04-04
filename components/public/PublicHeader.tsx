// components/layout/PublicHeader.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';

export function PublicHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-maroon-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm sm:text-base">🚚</span>
            </div>
            <span className="font-bold text-lg sm:text-xl text-gray-900">
              Tani<span className="text-maroon-600">Africa</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link href="/#features" className="text-gray-600 hover:text-maroon-600 transition font-medium">
              Features
            </Link>
            <Link href="/#how-it-works" className="text-gray-600 hover:text-maroon-600 transition font-medium">
              How It Works
            </Link>
            <Link href="/#pricing" className="text-gray-600 hover:text-maroon-600 transition font-medium">
              Pricing
            </Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/auth/login"
              className="px-4 py-2 text-gray-600 hover:text-maroon-600 transition font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="px-5 py-2.5 bg-maroon-600 text-white rounded-lg font-semibold hover:bg-maroon-700 transition shadow-md"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col gap-3">
              <Link
                href="/#features"
                className="text-gray-600 hover:text-maroon-600 transition py-2 px-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="/#how-it-works"
                className="text-gray-600 hover:text-maroon-600 transition py-2 px-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link
                href="/#pricing"
                className="text-gray-600 hover:text-maroon-600 transition py-2 px-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <div className="pt-3 mt-2 border-t border-gray-100 flex flex-col gap-3">
                <Link
                  href="/auth/login"
                  className="text-center text-gray-600 hover:text-maroon-600 transition py-2 px-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="text-center px-4 py-2.5 bg-maroon-600 text-white rounded-lg font-semibold hover:bg-maroon-700 transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
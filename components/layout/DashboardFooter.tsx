'use client';

import Link from 'next/link';
import { Heart, ChevronUp, Shield, Lock, Truck } from 'lucide-react';
import { useState, useEffect } from 'react';

export function DashboardFooter() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* ✅ SCROLL TO TOP – NAIVAS RED */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="
            fixed bottom-20 right-4 z-40 rounded-full
            p-3 text-white shadow-lg
            transition-all hover:scale-110
            lg:bottom-8
          "
          style={{ backgroundColor: 'var(--color-primary-600)' }}
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
      )}

      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto w-full px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 text-center lg:flex-row lg:text-left">

            {/* COPYRIGHT */}
            <div className="text-xs text-gray-500">
              © {currentYear} Tani Africa Logistics. All rights reserved.
            </div>

            {/* TRUST INDICATORS */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-green-600" />
                <span className="text-xs text-gray-600">Secure Platform</span>
              </div>

              <div className="h-3 w-px bg-gray-300" />

              <div className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-blue-600" />
                <span className="text-xs text-gray-600">SSL Encrypted</span>
              </div>

              <div className="hidden sm:block h-3 w-px bg-gray-300" />

              <div className="hidden sm:flex items-center gap-1.5">
                <Truck
                  className="h-3.5 w-3.5"
                  style={{ color: 'var(--color-secondary-600)' }}
                />
                <span className="text-xs text-gray-600">
                  Real‑time Tracking
                </span>
              </div>
            </div>

            {/* MADE WITH LOVE */}
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span>Made with</span>
              <Heart className="h-3 w-3 text-red-500 animate-pulse" />
              <span>in Kenya</span>
            </div>

            {/* LEGAL LINKS */}
            <div className="flex gap-3 text-xs">
              <Link
                href="/terms"
                className="text-gray-500 hover:text-[color:var(--color-primary-600)] transition-colors"
              >
                Terms
              </Link>
              <span className="text-gray-300">•</span>
              <Link
                href="/privacy"
                className="text-gray-500 hover:text-[color:var(--color-primary-600)] transition-colors"
              >
                Privacy
              </Link>
              <span className="text-gray-300">•</span>
              <Link
                href="/support"
                className="text-gray-500 hover:text-[color:var(--color-primary-600)] transition-colors"
              >
                Support
              </Link>
            </div>

          </div>
        </div>
      </footer>
    </>
  );
}
// components/layout/Footer.tsx
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
      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 right-4 z-40 rounded-full bg-amber-500 p-2.5 text-white shadow-lg transition-all hover:bg-amber-600 hover:scale-110 lg:bottom-8"
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
      )}

      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto w-full px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-3 text-center lg:flex-row lg:text-left">
            {/* Copyright */}
            <div className="text-xs text-gray-500">
              © {currentYear} Tani Africa Logistics. All rights reserved.
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-green-500" />
                <span className="text-xs text-gray-600">Secure Platform</span>
              </div>
              <div className="h-3 w-px bg-gray-300" />
              <div className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-xs text-gray-600">SSL Encrypted</span>
              </div>
              <div className="hidden sm:flex h-3 w-px bg-gray-300" />
              <div className="hidden sm:flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-xs text-gray-600">Real-time Tracking</span>
              </div>
            </div>

            {/* Made with love */}
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span>Made with</span>
              <Heart className="h-3 w-3 text-red-500 animate-pulse" />
              <span>in Kenya</span>
            </div>

            {/* Legal Links */}
            <div className="flex gap-3 text-xs">
              <Link href="/terms" className="text-gray-500 transition-colors hover:text-amber-600">
                Terms
              </Link>
              <span className="text-gray-300">•</span>
              <Link href="/privacy" className="text-gray-500 transition-colors hover:text-amber-600">
                Privacy
              </Link>
              <span className="text-gray-300">•</span>
              <Link href="/support" className="text-gray-500 transition-colors hover:text-amber-600">
                Support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
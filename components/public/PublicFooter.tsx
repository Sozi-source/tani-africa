'use client';

import Link from 'next/link';

export function PublicFooter() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6 flex flex-col sm:flex-row gap-4 items-center justify-between text-xs text-gray-500">

        <p>
          © {new Date().getFullYear()} Tani Africa. All rights reserved.
        </p>

        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-gray-700">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-gray-700">
            Terms
          </Link>
          <Link href="/contact" className="hover:text-gray-700">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="bg-white">
      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* ===== LEFT: CONTENT ===== */}
          <div className="space-y-6">
            <span className="inline-block rounded-full bg-orange-100 px-4 py-1 text-sm font-medium text-orange-700">
              Logistics, simplified
            </span>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              Reliable transport solutions for modern businesses
            </h1>

            <p className="text-gray-600 text-lg max-w-xl">
              Tani‑Africa connects clients with verified truck drivers to move
              goods efficiently, transparently, and on time — across cities and regions.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center rounded-lg bg-orange-600 px-6 py-3 text-white font-semibold hover:bg-orange-700 transition"
              >
                Get Started
              </Link>

              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* ===== RIGHT: IMAGE ===== */}
          <div className="relative w-full h-[320px] sm:h-[420px] lg:h-[520px]">
            <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-xl bg-gray-100">
              <Image
                src="/images/tani-truck.jpg"   /* replace with your image path */
                alt="Tani-Africa Truck"
                fill
                priority
                className="object-cover"
              />
            </div>

            {/* Overlay label */}
            <div className="absolute bottom-4 left-4 bg-black/70 text-white px-4 py-2 rounded-lg text-sm font-semibold">
              Tani‑Africa Logistics
            </div>
          </div>
        </div>
      </section>

      {/* ================= INFO SECTION ================= */}
      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">

          <div className="p-6 bg-white rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">
              Verified Drivers
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Work only with approved, insured, and rated transport professionals.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">
              Transparent Pricing
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Receive competitive bids and track every delivery clearly.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">
              End‑to‑End Tracking
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Monitor job progress from pickup to successful delivery.
            </p>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Tani‑Africa. All rights reserved.</p>

          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-gray-700">Terms</Link>
            <Link href="/privacy" className="hover:text-gray-700">Privacy</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
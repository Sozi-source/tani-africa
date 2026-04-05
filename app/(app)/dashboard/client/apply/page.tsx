'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { DriverApplicationForm } from '@/components/driver/DriverApplicationForm';

import {
  ArrowLeft,
  Truck,
  CheckCircle,
  Shield,
  Award,
  Phone,
  Mail,
} from 'lucide-react';

export default function DriverApplyPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  /* ================= REDIRECTS ================= */

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }

    if (!authLoading && user?.role === 'DRIVER') {
      router.push('/dashboard');
    }
  }, [authLoading, user, router]);

  /* ================= LOADING ================= */

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) return null;

  /* ================= ACCESS GUARD ================= */

  if (user.role !== 'CLIENT') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl bg-white border border-gray-200 p-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <Truck className="h-8 w-8 text-red-600" />
          </div>

          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Access Denied
          </h1>

          <p className="text-sm text-gray-600 mb-6">
            Only clients can apply to become drivers. You are currently
            registered as a{' '}
            <span className="font-medium">{user.role.toLowerCase()}</span>.
          </p>

          <Link href="/dashboard">
            <button className="rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition">
              Back to Dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  /* ================= MAIN RENDER ================= */

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Back */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">

          {/* ===== LEFT COLUMN ===== */}
          <div className="space-y-6 lg:col-span-1">

            {/* Header */}
            <div className="rounded-2xl bg-white border border-gray-200 p-6">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-orange-100">
                <Truck className="h-7 w-7 text-orange-700" />
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Become a Driver
              </h1>

              <p className="text-sm text-gray-600">
                Join our trusted network of professional drivers and start earning.
              </p>
            </div>

            {/* Benefits */}
            <div className="rounded-2xl bg-white border border-gray-200 p-6">
              <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                <Award className="h-5 w-5 text-orange-600" />
                Why Drive With Us?
              </h3>

              <div className="space-y-3">
                {[
                  'Flexible working hours',
                  'Competitive earnings',
                  'Weekly payouts',
                  '24/7 driver support',
                  'Insurance coverage',
                  'Fuel discounts',
                ].map((benefit, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    {benefit}
                  </div>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div className="rounded-2xl bg-white border border-gray-200 p-6">
              <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                <Shield className="h-5 w-5 text-yellow-600" />
                Requirements
              </h3>

              <div className="space-y-3 text-sm text-gray-600">
                {[
                  "Valid driver's license",
                  'At least 2 years driving experience',
                  'Valid vehicle insurance',
                  'Vehicle registration documents',
                  'Clean driving record',
                  'Smartphone with internet access',
                ].map((req, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-yellow-500" />
                    {req}
                  </div>
                ))}
              </div>
            </div>

            {/* Support */}
            <div className="rounded-2xl bg-white border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Questions about the application process?
              </p>

              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-orange-600" />
                  +254 700 000 000
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-orange-600" />
                  drivers@taniafrica.com
                </div>
              </div>
            </div>
          </div>

          {/* ===== RIGHT COLUMN ===== */}
          <div className="lg:col-span-2">
            <DriverApplicationForm />
          </div>

        </div>
      </div>
    </div>
  );
}
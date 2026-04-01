'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { DriverApplicationForm } from '@/components/driver/DriverApplicationForm';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ArrowLeft, Truck, CheckCircle, Shield, Clock, Award, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';

export default function DriverApplyPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
    if (!authLoading && user?.role === 'DRIVER') {
      router.push('/dashboard');
    }
  }, [authLoading, user, router]);

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) return null;

  if (user.role !== 'CLIENT') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="container-custom max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Truck className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Access Denied</h1>
            <p className="text-gray-600 mb-6">
              Only clients can apply to become drivers. You are currently registered as a {user?.role?.toLowerCase()}.
            </p>
            <Link href="/dashboard">
              <button className="bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-all">
                Back to Dashboard
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Info & Benefits */}
          <div className="lg:col-span-1 space-y-6">
            {/* Header Card */}
            <div className="bg-gradient-to-br from-primary-600 to-secondary-600 rounded-2xl p-6 text-white shadow-xl">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                <Truck className="h-8 w-8" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Become a Driver</h1>
              <p className="text-white/80 text-sm">
                Join our network of trusted drivers and start earning today
              </p>
            </div>

            {/* Benefits Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-primary-600" />
                Why Drive With Us?
              </h3>
              <div className="space-y-3">
                {[
                  'Flexible working hours',
                  'Competitive earnings',
                  'Weekly payouts',
                  '24/7 support',
                  'Insurance coverage',
                  'Fuel discounts',
                ].map((benefit, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Requirements Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary-600" />
                Requirements
              </h3>
              <div className="space-y-3">
                {[
                  'Valid driver\'s license',
                  'Minimum 2 years experience',
                  'Valid vehicle insurance',
                  'Vehicle registration documents',
                  'Clean driving record',
                  'Smartphone with internet',
                ].map((req, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                    <span>{req}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Support Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
              <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Have questions about the application process?
              </p>
              <div className="flex items-center gap-2 text-sm text-primary-600">
                <Phone className="h-4 w-4" />
                <span>+254 700 000 000</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-primary-600 mt-2">
                <Mail className="h-4 w-4" />
                <span>drivers@taniafrica.com</span>
              </div>
            </div>
          </div>

          {/* Right Column - Application Form */}
          <div className="lg:col-span-2">
            <DriverApplicationForm />
          </div>
        </div>
      </div>
    </div>
  );
}

import { Mail } from 'lucide-react';
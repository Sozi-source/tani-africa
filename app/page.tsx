'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Truck, Package, Clock, Shield, ArrowRight, CheckCircle, Users, Award, Headphones, MapPin, Star } from 'lucide-react';

export default function HomePage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated && user) {
        // Redirect to role-specific dashboard
        if (user.role === 'CLIENT') {
          router.push('/dashboard');
        } else if (user.role === 'DRIVER') {
          router.push('/dashboard/driver');
        } else if (user.role === 'ADMIN') {
          router.push('/admin');
        }
      }
    }
  }, [isAuthenticated, user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show landing page for non-authenticated users
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 py-20 text-white">
          <div className="absolute inset-0 bg-black/20" />
          <div className="container-custom relative z-10">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-6 flex justify-center">
                <div className="rounded-full bg-white/20 p-3">
                  <Truck className="h-12 w-12" />
                </div>
              </div>
              <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                Connect with Trusted Drivers Across Kenya
              </h1>
              <p className="mb-8 text-lg text-white/90 md:text-xl">
                Tani Africa connects cargo owners with reliable drivers for safe and efficient transport. 
                Post your cargo, receive competitive bids, and track your shipment in real-time.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link href="/auth/register">
                  <Button size="lg" className="bg-white text-primary-600 hover:bg-gray-100">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/jobs">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    Browse Jobs
                  </Button>
                </Link>
              </div>
              <div className="mt-12 flex flex-wrap justify-center gap-8">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-300" />
                  <span>500+ Active Drivers</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-300" />
                  <span>1000+ Jobs Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-300" />
                  <span>98% Customer Satisfaction</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container-custom">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-gray-900">Why Choose Tani Africa?</h2>
              <p className="mt-4 text-lg text-gray-600">The trusted platform for cargo transportation in Kenya</p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <Card hover className="text-center">
                <CardBody>
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                    <Truck className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">Fast Delivery</h3>
                  <p className="text-sm text-gray-600">
                    Get your goods delivered quickly and efficiently across Kenya
                  </p>
                </CardBody>
              </Card>
              <Card hover className="text-center">
                <CardBody>
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                    <Package className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">Track Shipments</h3>
                  <p className="text-sm text-gray-600">
                    Real-time tracking of your shipments from pickup to delivery
                  </p>
                </CardBody>
              </Card>
              <Card hover className="text-center">
                <CardBody>
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                    <Clock className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">24/7 Support</h3>
                  <p className="text-sm text-gray-600">
                    Round-the-clock customer support for all your logistics needs
                  </p>
                </CardBody>
              </Card>
              <Card hover className="text-center">
                <CardBody>
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                    <Shield className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">Secure Transport</h3>
                  <p className="text-sm text-gray-600">
                    Safe and secure transportation with insured cargo
                  </p>
                </CardBody>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="bg-gray-50 py-20">
          <div className="container-custom">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
              <p className="mt-4 text-lg text-gray-600">Simple steps to get your cargo moving</p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-2xl font-bold text-primary-600">
                  1
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">Post Your Cargo</h3>
                <p className="text-gray-600">
                  Tell us what you need to transport, where from, and where to
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-2xl font-bold text-primary-600">
                  2
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">Receive Bids</h3>
                <p className="text-gray-600">
                  Get competitive offers from verified drivers in your area
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-2xl font-bold text-primary-600">
                  3
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">Track & Deliver</h3>
                <p className="text-gray-600">
                  Monitor your shipment until it reaches its destination safely
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20">
          <div className="container-custom">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-600">500+</div>
                <p className="mt-2 text-gray-600">Active Drivers</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-600">1,000+</div>
                <p className="mt-2 text-gray-600">Jobs Completed</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-600">98%</div>
                <p className="mt-2 text-gray-600">Satisfaction Rate</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="bg-gray-50 py-20">
          <div className="container-custom">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-gray-900">What Our Customers Say</h2>
              <p className="mt-4 text-lg text-gray-600">Trusted by businesses and individuals across Kenya</p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <Card>
                <CardBody>
                  <div className="mb-4 flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="mb-4 text-gray-600">
                    "Tani Africa made transporting our goods so easy. Found a reliable driver within hours!"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">John M.</p>
                      <p className="text-sm text-gray-500">Business Owner</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <div className="mb-4 flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="mb-4 text-gray-600">
                    "Great platform! As a driver, I get consistent work and fair payments. Highly recommended."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <Truck className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Sarah K.</p>
                      <p className="text-sm text-gray-500">Driver</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <div className="mb-4 flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="mb-4 text-gray-600">
                    "Real-time tracking gave me peace of mind. Will definitely use again!"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <Package className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Mary W.</p>
                      <p className="text-sm text-gray-500">Small Business</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container-custom">
            <div className="rounded-2xl bg-gradient-to-r from-primary-600 to-secondary-600 p-8 text-center text-white md:p-12">
              <h2 className="mb-4 text-2xl font-bold md:text-3xl">Ready to Transport Your Cargo?</h2>
              <p className="mb-6 text-lg text-white/90">
                Join thousands of satisfied customers using Tani Africa
              </p>
              <Link href="/auth/register">
                <Button size="lg" className="bg-white text-primary-600 hover:bg-gray-100">
                  Sign Up Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return null;
}
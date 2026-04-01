'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { 
  Truck, 
  Package, 
  Clock, 
  Shield, 
  ArrowRight, 
  CheckCircle, 
  Users, 
  Award, 
  Headphones, 
  MapPin, 
  Star, 
  TrendingUp, 
  Zap,
  Target,
  Sparkles
} from 'lucide-react';

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
          router.push('/dashboard'); // FIXED: Changed from '/dashboard/driver' to '/dashboard'
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        {/* Hero Section with Truck Image */}
        <section className="relative min-h-[90vh] overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #f97316 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-amber-200 to-orange-200 blur-3xl opacity-30" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-rose-200 to-amber-200 blur-3xl opacity-30" />
          
          <div className="container-custom relative z-10">
            <div className="flex flex-col-reverse lg:flex-row lg:items-center lg:justify-between gap-12 py-12 lg:py-20">
              {/* Left Content */}
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-lg mb-6">
                  <Sparkles className="h-4 w-4" />
                  Kenya's Leading Logistics Platform
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                  Connect with{' '}
                  <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    Trusted Drivers
                  </span>
                  <br />
                  Across Kenya
                </h1>
                <p className="mt-6 text-lg text-gray-600 lg:text-xl">
                  Post your cargo, receive competitive bids, and track your shipment in real-time. 
                  The smart way to transport goods across Kenya.
                </p>
                
                {/* Stats Row */}
                <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-amber-600">500+</p>
                    <p className="text-sm text-gray-500">Active Drivers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-amber-600">1,000+</p>
                    <p className="text-sm text-gray-500">Jobs Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-amber-600">98%</p>
                    <p className="text-sm text-gray-500">Satisfaction</p>
                  </div>
                </div>
                
                {/* CTA Buttons */}
                <div className="mt-8 flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                  <Link href="/auth/register">
                    <Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all">
                      Get Started Free
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/jobs">
                    <Button size="lg" variant="outline" className="border-2 border-amber-500 text-amber-600 hover:bg-amber-50">
                      Browse Jobs
                    </Button>
                  </Link>
                </div>
              </div>
              
              {/* Right Content - Hero Image */}
              <div className="flex-1 relative">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=600&fit=crop"
                    alt="Truck on the road"
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  
                  {/* Floating Badge */}
                  <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-3 flex items-center gap-2">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Trusted by</p>
                      <p className="font-bold text-gray-900">1,000+ Businesses</p>
                    </div>
                  </div>
                  
                  {/* Floating Badge 2 */}
                  <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-xl p-3 flex items-center gap-2">
                    <div className="bg-amber-100 p-2 rounded-lg">
                      <Zap className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Fast Delivery</p>
                      <p className="font-bold text-gray-900">Same Day</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Bright and Modern */}
        <section className="py-20 bg-gradient-to-b from-white to-amber-50">
          <div className="container-custom">
            <div className="mb-16 text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700 mb-4">
                <Sparkles className="h-4 w-4" />
                Why Choose Us
              </div>
              <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
                Smart Logistics Made Simple
              </h2>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                Everything you need to transport goods efficiently across Kenya
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Truck, title: "Fast Delivery", desc: "Same-day and next-day delivery options available", color: "amber" },
                { icon: Package, title: "Real-time Tracking", desc: "Monitor your shipment from pickup to delivery", color: "orange" },
                { icon: Clock, title: "24/7 Support", desc: "Round-the-clock customer support", color: "rose" },
                { icon: Shield, title: "Insured Cargo", desc: "Your goods are protected during transit", color: "amber" },
              ].map((feature, index) => {
                const Icon = feature.icon;
                const colorClasses = {
                  amber: "bg-amber-100 text-amber-600",
                  orange: "bg-orange-100 text-orange-600",
                  rose: "bg-rose-100 text-rose-600",
                };
                return (
                  <Card key={index} hover className="group hover:shadow-xl transition-all duration-300">
                    <CardBody className="text-center">
                      <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${colorClasses[feature.color as keyof typeof colorClasses]} transition-all group-hover:scale-110`}>
                        <Icon className="h-7 w-7" />
                      </div>
                      <h3 className="mb-2 text-lg font-semibold text-gray-900">{feature.title}</h3>
                      <p className="text-sm text-gray-600">{feature.desc}</p>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-white">
          <div className="container-custom">
            <div className="mb-16 text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700 mb-4">
                <Target className="h-4 w-4" />
                Simple Process
              </div>
              <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
                How Tani Africa Works
              </h2>
              <p className="mt-4 text-lg text-gray-600">Three simple steps to get your cargo moving</p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                { step: "1", title: "Post Your Cargo", desc: "Tell us what you need to transport, where from, and where to", icon: Package },
                { step: "2", title: "Receive Bids", desc: "Get competitive offers from verified drivers in your area", icon: TrendingUp },
                { step: "3", title: "Track & Deliver", desc: "Monitor your shipment until it reaches safely", icon: MapPin },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="text-center group">
                    <div className="relative mx-auto mb-6">
                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-2xl font-bold text-white shadow-lg transition-all group-hover:scale-110">
                        {item.step}
                      </div>
                      {index < 2 && (
                        <div className="absolute top-10 left-full hidden lg:block w-24">
                          <ArrowRight className="h-8 w-8 text-amber-300" />
                        </div>
                      )}
                    </div>
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 lg:hidden">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-gray-900">{item.title}</h3>
                    <p className="text-gray-600">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-gradient-to-b from-amber-50 to-white">
          <div className="container-custom">
            <div className="mb-16 text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700 mb-4">
                <Star className="h-4 w-4 fill-amber-500" />
                Testimonials
              </div>
              <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
                What Our Customers Say
              </h2>
              <p className="mt-4 text-lg text-gray-600">Trusted by businesses and individuals across Kenya</p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                { name: "John M.", role: "Business Owner", content: "Tani Africa made transporting our goods so easy. Found a reliable driver within hours!", rating: 5, icon: Users },
                { name: "Sarah K.", role: "Driver", content: "Great platform! As a driver, I get consistent work and fair payments. Highly recommended.", rating: 5, icon: Truck },
                { name: "Mary W.", role: "Small Business", content: "Real-time tracking gave me peace of mind. Will definitely use again!", rating: 5, icon: Package },
              ].map((testimonial, index) => {
                const Icon = testimonial.icon;
                return (
                  <Card key={index} hover className="h-full">
                    <CardBody>
                      <div className="mb-4 flex text-amber-400">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-current" />
                        ))}
                      </div>
                      <p className="mb-6 text-gray-600 italic">"{testimonial.content}"</p>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{testimonial.name}</p>
                          <p className="text-sm text-gray-500">{testimonial.role}</p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section - Bright Gradient */}
        <section className="py-20">
          <div className="container-custom">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-8 text-center text-white md:p-12">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
              </div>
              <div className="relative z-10">
                <h2 className="mb-4 text-3xl font-bold md:text-4xl">Ready to Transport Your Cargo?</h2>
                <p className="mb-8 text-lg text-white/90 max-w-2xl mx-auto">
                  Join thousands of satisfied customers using Tani Africa for their logistics needs
                </p>
                <Link href="/auth/register">
                  <Button size="lg" className="bg-white text-amber-600 hover:bg-gray-100 shadow-lg">
                    Get Started Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return null;
}
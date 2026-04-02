'use client';

import { useState, useEffect } from 'react';
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
  Star, 
  TrendingUp, 
  Target,
  Sparkles,
  Navigation,
  Menu,
  X,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram
} from 'lucide-react';

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Hero carousel images
  const heroSlides = [
    {
      image: "/images/hero1.webp",
      alt: "Modern delivery truck on Kenyan road",
      title: "Fast & Reliable Delivery",
      subtitle: "Across Kenya"
    },
    {
      image: "/images/hero2.webp",
      alt: "Professional driver with cargo",
      title: "Verified Professional Drivers",
      subtitle: "Safe and secure transport"
    },
    {
      image: "/images/hero3.webp",
      alt: "Real-time tracking dashboard",
      title: "Real-Time Tracking",
      subtitle: "Know where your cargo is at all times"
    },
    {
      image: "/images/hero4.webp",
      alt: "Happy customer receiving delivery",
      title: "Trusted by Thousands",
      subtitle: "Join our growing community"
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-slide functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="min-h-screen">
      {/* Header - Fixed Navigation */}
      <nav className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? 'bg-black/95 backdrop-blur-md shadow-lg' : 'bg-black'
      }`}>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 sm:h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group">
              <Truck className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400 transition-transform group-hover:scale-110" />
              <span className="text-base sm:text-xl font-bold text-white">
                Tani Africa
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              <a href="#features" className="text-sm text-white hover:text-yellow-400 transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-sm text-white hover:text-yellow-400 transition-colors">
                How It Works
              </a>
              <a href="#testimonials" className="text-sm text-white hover:text-yellow-400 transition-colors">
                Testimonials
              </a>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-2 lg:gap-3">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm" className="text-white hover:text-yellow-400 hover:bg-white/10">
                  Log In
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white shadow-lg transition-all">
                  Sign Up Free
                  <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg text-white hover:bg-white/10 transition-colors"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-3 border-t border-white/10">
              <div className="flex flex-col space-y-2">
                <a
                  href="#features"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm text-white hover:text-yellow-400 hover:bg-white/10 rounded-lg transition-colors"
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm text-white hover:text-yellow-400 hover:bg-white/10 rounded-lg transition-colors"
                >
                  How It Works
                </a>
                <a
                  href="#testimonials"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm text-white hover:text-yellow-400 hover:bg-white/10 rounded-lg transition-colors"
                >
                  Testimonials
                </a>
                <div className="pt-2 flex flex-col gap-2">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full border-white text-white hover:bg-white/10">
                      Log In
                    </Button>
                  </Link>
                  <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                      Sign Up Free
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section with Carousel */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-700 via-yellow-500 to-red-600 pt-14 sm:pt-16">
        {/* Mobile Hero Image */}
        <div className="block md:hidden relative h-48 sm:h-56 w-full overflow-hidden">
          <img
            src={heroSlides[currentSlide].image}
            alt={heroSlides[currentSlide].alt}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-20">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 sm:gap-8 lg:gap-12">
              {/* Left Content */}
              <div className="flex-1 text-center lg:text-left">
                {/* Badge */}
                <div className="inline-flex items-center gap-1.5 rounded-full bg-black/20 backdrop-blur-sm px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-white mb-4 sm:mb-6">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" />
                  Kenya's #1 Logistics Platform
                </div>
                
                {/* Heading */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-white">
                  Move Your Cargo
                  <span className="block text-yellow-300 mt-1 sm:mt-2">
                    With Confidence
                  </span>
                </h1>
                
                {/* Description */}
                <p className="mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg text-white/90 max-w-2xl mx-auto lg:mx-0">
                  Connect with verified drivers, get competitive bids, and track your shipment in real-time. 
                  The smart, reliable way to transport goods across Kenya.
                </p>
                
                {/* Stats */}
                <div className="mt-6 sm:mt-8 flex flex-wrap justify-center lg:justify-start gap-3 sm:gap-4 lg:gap-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5 sm:px-4 sm:py-2">
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-300">500+</p>
                    <p className="text-xs sm:text-sm text-white">Verified Drivers</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5 sm:px-4 sm:py-2">
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-300">10K+</p>
                    <p className="text-xs sm:text-sm text-white">Deliveries</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5 sm:px-4 sm:py-2">
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-300">98%</p>
                    <p className="text-xs sm:text-sm text-white">On-Time Delivery</p>
                  </div>
                </div>
                
                {/* CTA Buttons */}
                <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center lg:justify-start gap-3 sm:gap-4">
                  <Link href="/auth/register" className="w-full sm:w-auto">
                    <Button size="md" className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white shadow-lg text-sm sm:text-base">
                      Get Started Free
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <a href="#how-it-works" className="w-full sm:w-auto">
                    <Button size="md" variant="outline" className="w-full sm:w-auto border-2 border-white text-white hover:bg-white/10 text-sm sm:text-base">
                      How It Works
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </a>
                </div>

                {/* Trust Badges */}
                <div className="mt-6 sm:mt-8 flex flex-wrap justify-center lg:justify-start gap-3 sm:gap-4">
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm text-white">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-300" />
                    <span>No hidden fees</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm text-white">
                    <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-green-300" />
                    <span>Insured cargo</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm text-white">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-green-300" />
                    <span>24/7 support</span>
                  </div>
                </div>
              </div>
              
              {/* Desktop Image Carousel */}
              <div className="hidden md:block flex-1 relative">
                <div className="relative group">
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl transform transition-all duration-500 group-hover:scale-105">
                    <div className="relative w-full">
                      <div className="relative aspect-[4/3] lg:aspect-[3/2] xl:aspect-[16/9]">
                        {heroSlides.map((slide, index) => (
                          <div
                            key={index}
                            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                            }`}
                          >
                            <img
                              src={slide.image}
                              alt={slide.alt}
                              className="w-full h-full object-cover object-center"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                              <p className="text-white text-lg font-bold mb-1">{slide.title}</p>
                              <p className="text-white/90 text-sm">{slide.subtitle}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 rounded-full p-2 shadow-lg transition-all hover:scale-110"
                      >
                        <ChevronLeft className="h-6 w-6 text-white" />
                      </button>
                      <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 rounded-full p-2 shadow-lg transition-all hover:scale-110"
                      >
                        <ChevronRight className="h-6 w-6 text-white" />
                      </button>
                      
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                        {heroSlides.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`transition-all duration-300 ${
                              index === currentSlide
                                ? 'w-6 h-1.5 bg-yellow-400 rounded-full'
                                : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/70 rounded-full'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="hidden sm:block absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-2 bg-yellow-400 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 sm:mb-12 lg:mb-16 text-center">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-yellow-400 px-3 py-1.5 text-xs sm:text-sm font-semibold text-black mb-3 sm:mb-4">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                Why Choose Us
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                Smart Logistics Made Simple
              </h2>
              <p className="mt-2 sm:mt-3 text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
                Everything you need to transport goods efficiently across Kenya
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {[
                { icon: Truck, title: "Fast Delivery", desc: "Same-day and next-day delivery options", color: "bg-green-600" },
                { icon: MapPin, title: "Real-time Tracking", desc: "Monitor your shipment from pickup to delivery", color: "bg-yellow-500" },
                { icon: Clock, title: "24/7 Support", desc: "Round-the-clock customer support", color: "bg-red-600" },
                { icon: Shield, title: "Insured Cargo", desc: "Your goods are fully protected", color: "bg-green-600" },
              ].map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} hover className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <CardBody className="text-center p-4 sm:p-6">
                      <div className={`mx-auto mb-3 sm:mb-4 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl ${feature.color} text-white shadow-md transition-all group-hover:scale-110`}>
                        <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                      </div>
                      <h3 className="mb-1 sm:mb-2 text-base sm:text-lg font-semibold text-gray-900">{feature.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-600">{feature.desc}</p>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-br from-green-50 to-yellow-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 sm:mb-12 lg:mb-16 text-center">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1.5 text-xs sm:text-sm font-semibold text-white mb-3 sm:mb-4">
                <Target className="h-3 w-3 sm:h-4 sm:w-4" />
                Simple Process
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                How Tani Africa Works
              </h2>
              <p className="mt-2 sm:mt-3 text-sm sm:text-base text-gray-600">Three simple steps to get your cargo moving</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {[
                { step: "1", title: "Post Your Cargo", desc: "Tell us what you need to transport", icon: Package, color: "bg-green-600" },
                { step: "2", title: "Receive Bids", desc: "Get competitive offers from drivers", icon: TrendingUp, color: "bg-yellow-500" },
                { step: "3", title: "Track & Deliver", desc: "Monitor your shipment until it arrives", icon: Navigation, color: "bg-red-600" },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="text-center group">
                    <div className="relative mx-auto mb-4 sm:mb-6">
                      <div className={`mx-auto flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full ${item.color} text-xl sm:text-2xl font-bold text-white shadow-lg transition-all group-hover:scale-110`}>
                        {item.step}
                      </div>
                      {index < 2 && (
                        <div className="hidden md:block absolute top-8 left-full w-16 lg:w-24">
                          <ArrowRight className="h-6 w-6 text-yellow-500 mx-auto" />
                        </div>
                      )}
                    </div>
                    <h3 className="mb-1 sm:mb-2 text-base sm:text-lg font-semibold text-gray-900">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 px-2">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 sm:mb-12 lg:mb-16 text-center">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-green-600 px-3 py-1.5 text-xs sm:text-sm font-semibold text-white mb-3 sm:mb-4">
                <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-current" />
                Testimonials
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                What Our Customers Say
              </h2>
              <p className="mt-2 sm:mt-3 text-sm sm:text-base text-gray-600">Trusted by businesses across Kenya</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {[
                { name: "John M.", role: "Business Owner", content: "Tani Africa made transporting our goods so easy. Found a reliable driver within hours!", rating: 5, color: "bg-green-600" },
                { name: "Sarah K.", role: "Driver", content: "Great platform! As a driver, I get consistent work and fair payments.", rating: 5, color: "bg-yellow-500" },
                { name: "Mary W.", role: "Small Business", content: "Real-time tracking gave me peace of mind. Will definitely use again!", rating: 5, color: "bg-red-600" },
              ].map((testimonial, index) => (
                <Card key={index} hover className="h-full border-0 shadow-md">
                  <CardBody className="p-4 sm:p-6">
                    <div className="mb-3 flex text-yellow-400">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 fill-current" />
                      ))}
                    </div>
                    <p className="mb-4 text-sm sm:text-base text-gray-600 italic">"{testimonial.content}"</p>
                    <div className="flex items-center gap-2">
                      <div className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full ${testimonial.color} text-white`}>
                        <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm sm:text-base text-gray-900">{testimonial.name}</p>
                        <p className="text-xs sm:text-sm text-gray-500">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-green-700 via-yellow-600 to-red-700">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-black/20 backdrop-blur-sm p-6 sm:p-8 md:p-12 text-center">
              <div className="relative z-10">
                <Truck className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 sm:mb-6 text-yellow-400" />
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3">
                  Ready to Transport Your Cargo?
                </h2>
                <p className="text-sm sm:text-base text-white/90 max-w-2xl mx-auto mb-6 sm:mb-8">
                  Join thousands of satisfied customers using Tani Africa for their logistics needs
                </p>
                <Link href="/auth/register">
                  <Button size="md" className="bg-yellow-400 text-black hover:bg-yellow-300 shadow-lg text-sm sm:text-base font-semibold">
                    Get Started Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-8 sm:py-12">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
                  <Truck className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400" />
                  <span className="text-base sm:text-xl font-bold">Tani Africa</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-400">
                  Connecting Kenya with reliable logistics solutions.
                </p>
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-sm font-semibold mb-2 sm:mb-3">Quick Links</h3>
                <ul className="space-y-1 text-xs sm:text-sm text-gray-400">
                  <li><a href="#features" className="hover:text-yellow-400 transition-colors">Features</a></li>
                  <li><a href="#how-it-works" className="hover:text-yellow-400 transition-colors">How It Works</a></li>
                  <li><a href="#testimonials" className="hover:text-yellow-400 transition-colors">Testimonials</a></li>
                </ul>
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-sm font-semibold mb-2 sm:mb-3">Contact</h3>
                <ul className="space-y-1 text-xs sm:text-sm text-gray-400">
                  <li className="flex items-center justify-center sm:justify-start gap-1.5"><Phone className="h-3 w-3" /> +254 700 000 000</li>
                  <li className="flex items-center justify-center sm:justify-start gap-1.5"><Mail className="h-3 w-3" /> info@taniafrica.com</li>
                </ul>
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-sm font-semibold mb-2 sm:mb-3">Follow Us</h3>
                <div className="flex justify-center sm:justify-start gap-3">
                  <Facebook className="h-4 w-4 text-gray-400 hover:text-yellow-400 cursor-pointer transition-colors" />
                  <Twitter className="h-4 w-4 text-gray-400 hover:text-yellow-400 cursor-pointer transition-colors" />
                  <Instagram className="h-4 w-4 text-gray-400 hover:text-yellow-400 cursor-pointer transition-colors" />
                </div>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-4 sm:pt-6 text-center">
              <p className="text-xs sm:text-sm text-gray-400">
                © {new Date().getFullYear()} Tani Africa. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
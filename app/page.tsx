// app/page.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';

// ================= CAROUSEL IMAGES ARRAY =================
const carouselImages = [
  {
    id: 1,
    src: "/images/hero1.webp",
    alt: "Tani Africa Delivery Truck",
    title: "Fast Delivery",
    description: "Same-day delivery across Kenya"
  },
  {
    id: 2,
    src: "/images/hero2.webp",
    alt: "Package Delivery",
    title: "Safe Handling",
    description: "Your goods are in safe hands"
  },
  {
    id: 3,
    src: "/images/hero3.webp",
    alt: "Real-time Tracking",
    title: "Live Tracking",
    description: "Track your delivery in real-time"
  },
  {
    id: 4,
    src: "/images/hero4.webp",
    alt: "Verified Drivers",
    title: "Live Tracking",
    description: "Professional and trusted drivers"
  },

  {
    id: 5,
    src: "/images/hero5.webp",
    alt: "Customer Support",
    title: "Live Tracking",
    description: "24/7 Customer Support"
  }
];

export default function HomePage() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const testimonials = [
    { name: "Jane M.", role: "Business Owner", text: "Fast and reliable delivery service", rating: 5 },
    { name: "Peter O.", role: "Online Seller", text: "Best logistics platform in Kenya", rating: 5 },
    { name: "Sarah K.", role: "Retail Manager", text: "Professional drivers, excellent support", rating: 5 },
  ];

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  // Carousel navigation
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  };

  // Handle local image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }
    
    const maxSize = 5 * 1024 * 1024;
    if (file.size && file.size > maxSize) {
      const sizeInMB = (file.size / 1024 / 1024).toFixed(1);
      alert(`File too large. Max 5MB (${sizeInMB}MB)`);
      return;
    }
    
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    
    setSelectedImage(file);
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
    setUploadedImages((prev) => [...prev, preview]);
  };

  const clearUploadedImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setSelectedImage(null);
    setImagePreview(null);
  };

  const getFileSizeDisplay = (file: File | null): string => {
    if (!file || !file.size) return 'Size unknown';
    const sizeInKB = file.size / 1024;
    if (sizeInKB >= 1024) {
      return `${(sizeInKB / 1024).toFixed(1)} MB`;
    }
    return `${sizeInKB.toFixed(1)} KB`;
  };

  return (
    <main className="min-h-screen bg-white">
      <PublicHeader />

      {/* ================= HERO SECTION ================= */}
      <section className="bg-gradient-to-br from-maroon-600 via-maroon-500 to-maroon-400 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
            
            {/* Left Content */}
            <div className="flex-1 text-center lg:text-left space-y-4 sm:space-y-5">
              
              {/* Badge */}
              <div className="inline-flex mx-auto lg:mx-0 items-center gap-2 bg-yellow-400 text-maroon-900 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-md">
                <span>🇰🇪 TRUSTED LOGISTICS</span>
              </div>
              
              {/* Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Deliver Fast & Safe
                <br />
                <span className="text-yellow-400">with Tani Africa</span>
              </h1>
              
              {/* Description */}
              <p className="text-base sm:text-lg text-white/90 leading-relaxed max-w-2xl lg:max-w-lg mx-auto lg:mx-0">
                Connect with verified drivers and track your deliveries in real-time across Kenya.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start pt-2">
                <Link
                  href="/auth/register"
                  className="px-5 py-2.5 sm:px-6 sm:py-3 bg-yellow-400 text-maroon-900 rounded-lg font-bold text-sm sm:text-base hover:bg-yellow-300 transition-all transform hover:scale-105 inline-flex items-center justify-center gap-2 shadow-md min-w-[140px]"
                >
                  Get Started
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="#how-it-works"
                  className="px-5 py-2.5 sm:px-6 sm:py-3 border-2 border-yellow-400 text-yellow-400 rounded-lg font-bold text-sm sm:text-base hover:bg-yellow-400 hover:text-maroon-900 transition-all inline-flex items-center justify-center min-w-[140px]"
                >
                  Learn More
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-4 max-w-md lg:max-w-full mx-auto lg:mx-0">
                <div className="text-center lg:text-left">
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-yellow-400">10K+</p>
                  <p className="text-xs sm:text-sm text-white/80">Deliveries</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-yellow-400">500+</p>
                  <p className="text-xs sm:text-sm text-white/80">Drivers</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-yellow-400">98%</p>
                  <p className="text-xs sm:text-sm text-white/80">Satisfaction</p>
                </div>
              </div>
            </div>

            {/* Carousel - Hidden on mobile, visible on tablet+ */}
            <div className="hidden md:block flex-1 w-full max-w-md lg:max-w-none mx-auto">
              <div className="relative rounded-xl overflow-hidden shadow-2xl bg-maroon-800">
                <div 
                  className="flex transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {carouselImages.map((image) => (
                    <div key={image.id} className="w-full flex-shrink-0 relative">
                      <div className="relative h-56 sm:h-64 md:h-72 lg:h-80">
                        <Image
                          src={image.src}
                          alt={image.alt}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://placehold.co/800x500/7f1d1d/facc15?text=Tani+Africa';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                          <h3 className="text-lg font-bold">{image.title}</h3>
                          <p className="text-xs text-gray-200">{image.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={prevSlide}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all"
                  aria-label="Previous slide"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all"
                  aria-label="Next slide"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                  {carouselImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => goToSlide(idx)}
                      className={`h-1 rounded-full transition-all ${
                        currentSlide === idx ? 'w-5 bg-yellow-400' : 'w-1.5 bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= IMAGE UPLOAD SECTION ================= */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-yellow-50 to-maroon-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10">
            <span className="inline-block px-3 py-1 bg-maroon-800 text-yellow-400 rounded-full text-xs font-semibold mb-3">
              UPLOAD YOUR IMAGES
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-maroon-900">
              Share Your <span className="text-green-600">Delivery Moments</span>
            </h2>
            <p className="text-gray-600 text-sm sm:text-base mt-2 max-w-2xl mx-auto">
              Upload images from your local machine to showcase your deliveries
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <label className="block w-full cursor-pointer">
              <div className="relative border-2 border-dashed border-maroon-300 rounded-xl p-6 sm:p-8 text-center hover:border-maroon-500 transition-all bg-white/60 hover:bg-white/80">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 bg-maroon-100 rounded-full flex items-center justify-center">
                    <svg className="w-7 h-7 text-maroon-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm sm:text-base text-gray-700 font-medium">Click or drag to upload images</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                  </div>
                </div>
              </div>
            </label>

            {imagePreview && selectedImage && (
              <div className="mt-6 p-4 bg-white rounded-xl shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-maroon-900 text-sm sm:text-base">Preview:</h3>
                  <button
                    onClick={clearUploadedImage}
                    className="text-red-500 hover:text-red-600 text-sm font-medium px-3 py-1"
                  >
                    Remove
                  </button>
                </div>
                <div className="relative h-48 sm:h-56 rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={imagePreview}
                    alt="Uploaded preview"
                    fill
                    className="object-contain"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  {selectedImage.name} ({getFileSizeDisplay(selectedImage)})
                </p>
              </div>
            )}

            {uploadedImages.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-maroon-900 text-sm sm:text-base mb-3">
                  Uploaded Images ({uploadedImages.length}):
                </h3>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {uploadedImages.map((img, idx) => (
                    <div key={idx} className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 border-maroon-200">
                      <Image
                        src={img}
                        alt={`Uploaded ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ================= FEATURES SECTION ================= */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <span className="inline-block px-3 py-1 bg-maroon-100 text-maroon-800 rounded-full text-xs font-semibold mb-3">
              WHY CHOOSE US
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-maroon-900">
              Simple & <span className="text-green-600">Reliable</span>
            </h2>
            <p className="text-gray-600 text-sm sm:text-base mt-2">Experience the best logistics service in Kenya</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            <FeatureCard 
              icon="🚚"
              title="Verified Drivers"
              description="Vetted & licensed professionals"
              color="maroon"
            />
            <FeatureCard 
              icon="📍"
              title="Real-time Tracking"
              description="Live GPS updates"
              color="yellow"
            />
            <FeatureCard 
              icon="💰"
              title="Fair Pricing"
              description="Competitive bids"
              color="green"
            />
            <FeatureCard 
              icon="🛡️"
              title="Safe & Secure"
              description="Insured deliveries"
              color="maroon"
            />
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section id="how-it-works" className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-maroon-50 to-yellow-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <span className="inline-block px-3 py-1 bg-maroon-800 text-yellow-400 rounded-full text-xs font-semibold mb-3">
              SIMPLE PROCESS
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-maroon-900">
              How It <span className="text-green-600">Works</span>
            </h2>
            <p className="text-gray-600 text-sm sm:text-base mt-2">Get your goods delivered in 4 easy steps</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            <StepCard number="1" title="Post Job" description="Add pickup & dropoff details" icon="📝" />
            <StepCard number="2" title="Get Bids" description="Receive competitive offers" icon="💰" />
            <StepCard number="3" title="Track" description="Monitor delivery in real-time" icon="📍" />
            <StepCard number="4" title="Deliver" description="Confirm delivery & rate driver" icon="✅" />
          </div>
        </div>
      </section>

      {/* ================= STATS SECTION ================= */}
      <section className="py-10 sm:py-12 lg:py-14 bg-maroon-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 sm:gap-6 text-center">
            <StatCard number="50+" label="Towns Covered" />
            <StatCard number="2,000+" label="Happy Clients" />
            <StatCard number="15min" label="Avg Response" />
            <StatCard number="24/7" label="Customer Support" />
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold mb-3">
              TESTIMONIALS
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-maroon-900">
              What Our <span className="text-yellow-600">Clients Say</span>
            </h2>
            <p className="text-gray-600 text-sm sm:text-base mt-2">Trusted by businesses across Kenya</p>
          </div>

          <div className="relative max-w-3xl mx-auto">
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${activeTestimonial * 100}%)` }}
              >
                {testimonials.map((testimonial, idx) => (
                  <div key={idx} className="w-full flex-shrink-0 px-2">
                    <div className="bg-gradient-to-br from-maroon-50 to-yellow-50 rounded-2xl p-6 sm:p-8">
                      <div className="flex gap-1 mb-4 justify-center">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <span key={i} className="text-yellow-500 text-lg sm:text-xl">★</span>
                        ))}
                      </div>
                      <p className="text-gray-700 text-base sm:text-lg italic text-center mb-5">"{testimonial.text}"</p>
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-10 h-10 bg-maroon-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-base">👤</span>
                        </div>
                        <div>
                          <p className="font-bold text-maroon-900 text-sm sm:text-base">{testimonial.name}</p>
                          <p className="text-xs text-gray-500">{testimonial.role}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTestimonial(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    activeTestimonial === idx ? 'w-8 bg-maroon-600' : 'w-1.5 bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= CTA SECTION ================= */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-maroon-700 to-maroon-800">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3">
            Ready to <span className="text-yellow-400">Streamline</span> Your Deliveries?
          </h2>
          <p className="text-maroon-200 text-sm sm:text-base mb-6 max-w-md mx-auto">
            Join thousands of businesses already using Tani Africa
          </p>
          <Link
            href="/auth/register"
            className="inline-block px-8 py-3 bg-yellow-400 text-maroon-900 rounded-lg font-bold text-base hover:bg-yellow-300 transition-all transform hover:scale-105 shadow-lg min-w-[180px]"
          >
            Get Started Today
          </Link>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}

// ================= COMPONENTS =================

function FeatureCard({ icon, title, description, color }: { 
  icon: string; 
  title: string; 
  description: string; 
  color: 'maroon' | 'yellow' | 'green';
}) {
  const colorClasses = {
    maroon: 'bg-maroon-100 text-maroon-600 group-hover:bg-maroon-600 group-hover:text-white',
    yellow: 'bg-yellow-100 text-yellow-600 group-hover:bg-yellow-500 group-hover:text-white',
    green: 'bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white',
  };

  return (
    <div className="group text-center p-5 sm:p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1 bg-white">
      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mx-auto mb-3 transition-all duration-300 ${colorClasses[color]}`}>
        <span className="text-xl sm:text-2xl">{icon}</span>
      </div>
      <h3 className="text-base sm:text-lg font-bold text-maroon-900 mb-2">{title}</h3>
      <p className="text-xs sm:text-sm text-gray-500">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description, icon }: { 
  number: string; 
  title: string; 
  description: string; 
  icon: string;
}) {
  return (
    <div className="relative bg-white rounded-xl p-5 sm:p-6 shadow-md hover:shadow-lg transition-all hover:-translate-y-1 text-center">
      <div className="w-12 h-12 bg-maroon-600 rounded-full flex items-center justify-center mx-auto mb-3">
        <span className="text-white text-xl sm:text-2xl">{icon}</span>
      </div>
      <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-maroon-900 font-bold text-xs shadow-md">
        {number}
      </div>
      <h3 className="text-base sm:text-lg font-bold text-maroon-900 mb-2">{title}</h3>
      <p className="text-xs sm:text-sm text-gray-500">{description}</p>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="group cursor-pointer">
      <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-yellow-400 group-hover:scale-105 transition inline-block">
        {number}
      </p>
      <p className="text-xs sm:text-sm text-maroon-200 mt-2">{label}</p>
    </div>
  );
}
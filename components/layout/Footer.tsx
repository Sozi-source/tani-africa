// components/layout/Footer.tsx
'use client';

import Link from 'next/link';
import { Truck, Mail, Phone, MapPin, ChevronRight } from 'lucide-react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { href: '/jobs', label: 'Find Jobs' },
    { href: '/vehicles', label: 'List Vehicle' },
    { href: '/how-it-works', label: 'How It Works' },
    { href: '/about', label: 'About Us' },
  ];

  const supportLinks = [
    { href: '/faq', label: 'FAQ' },
    { href: '/contact', label: 'Contact Us' },
    { href: '/terms', label: 'Terms of Service' },
    { href: '/privacy', label: 'Privacy Policy' },
  ];

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        
        {/* Main Footer Content - Mobile First Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-10">
          
          {/* Brand Section - Full width on mobile */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Truck className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-amber-500" />
              <span className="text-lg sm:text-xl md:text-2xl font-bold">Tani Africa</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Connecting cargo owners with reliable drivers across Africa. Safe, fast, and affordable logistics solutions.
            </p>
            
            {/* Social Icons - Horizontal scroll on very small screens */}
            <div className="flex gap-3 sm:gap-4 mt-4 sm:mt-5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { Icon: FaFacebook, label: 'Facebook' },
                { Icon: FaTwitter, label: 'Twitter' },
                { Icon: FaInstagram, label: 'Instagram' },
                { Icon: FaLinkedin, label: 'LinkedIn' }
              ].map(({ Icon, label }, i) => (
                <a 
                  key={i} 
                  href="#" 
                  aria-label={label}
                  className="text-gray-400 transition-all hover:text-amber-500 hover:scale-110 transform flex-shrink-0"
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links - Horizontal on mobile? No, better to keep vertical but compact */}
          <div>
            <h3 className="text-sm sm:text-base font-semibold uppercase tracking-wider text-gray-400 mb-3 sm:mb-4">
              Quick Links
            </h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="group flex items-center text-xs sm:text-sm text-gray-400 hover:text-amber-500 transition-colors"
                  >
                    <ChevronRight className="mr-1.5 sm:mr-2 h-2.5 w-2.5 sm:h-3 sm:w-3 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0 -translate-x-1" />
                    <span className="group-hover:translate-x-0.5 sm:group-hover:translate-x-1 transition-transform">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-sm sm:text-base font-semibold uppercase tracking-wider text-gray-400 mb-3 sm:mb-4">
              Support
            </h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="group flex items-center text-xs sm:text-sm text-gray-400 hover:text-amber-500 transition-colors"
                  >
                    <ChevronRight className="mr-1.5 sm:mr-2 h-2.5 w-2.5 sm:h-3 sm:w-3 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0 -translate-x-1" />
                    <span className="group-hover:translate-x-0.5 sm:group-hover:translate-x-1 transition-transform">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info - Horizontal arrangement on mobile */}
          <div>
            <h3 className="text-sm sm:text-base font-semibold uppercase tracking-wider text-gray-400 mb-3 sm:mb-4">
              Contact Info
            </h3>
            <div className="flex flex-col gap-2 sm:gap-3">
              <a 
                href="mailto:support@taniafrica.com"
                className="group flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-400 hover:text-amber-500 transition-colors"
              >
                <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="break-all">support@taniafrica.com</span>
              </a>
              
              <a 
                href="tel:+254700123456"
                className="group flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-400 hover:text-amber-500 transition-colors"
              >
                <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span>+254 700 123 456</span>
              </a>
              
              <div className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm text-gray-400">
                <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 mt-0.5" />
                <span>Nairobi, Kenya</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar - Horizontal arrangement on mobile */}
        <div className="mt-6 sm:mt-8 md:mt-12 pt-5 sm:pt-6 md:pt-8 border-t border-gray-800">
          <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-3 sm:gap-4">
            
            {/* Copyright - Smaller text on mobile */}
            <p className="text-xs sm:text-sm text-gray-400 text-center sm:text-left">
              © {currentYear} Tani Africa. All rights reserved.
            </p>
            
            {/* Legal Links - Horizontal arrangement */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6">
              <Link 
                href="/privacy" 
                className="text-xs sm:text-sm text-gray-400 hover:text-amber-500 transition-colors"
              >
                Privacy
              </Link>
              <Link 
                href="/terms" 
                className="text-xs sm:text-sm text-gray-400 hover:text-amber-500 transition-colors"
              >
                Terms
              </Link>
              <Link 
                href="/cookies" 
                className="text-xs sm:text-sm text-gray-400 hover:text-amber-500 transition-colors"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
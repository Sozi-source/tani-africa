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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Truck className="h-8 w-8 text-amber-500" />
              <span className="text-xl font-bold">Tani Africa</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">Connecting cargo owners with reliable drivers across Africa. Safe, fast, and affordable logistics solutions.</p>
            <div className="flex gap-4 mt-4">
              {[FaFacebook, FaTwitter, FaInstagram, FaLinkedin].map((Icon, i) => (
                <a key={i} href="#" className="text-gray-400 transition-all hover:text-amber-500 hover:scale-110 transform">
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base font-semibold uppercase tracking-wider text-gray-400 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="group flex items-center text-sm text-gray-400 hover:text-amber-500 transition-colors">
                    <ChevronRight className="mr-2 h-3 w-3 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0 -translate-x-1" />
                    <span className="group-hover:translate-x-1 transition-transform">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-base font-semibold uppercase tracking-wider text-gray-400 mb-4">Support</h3>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="group flex items-center text-sm text-gray-400 hover:text-amber-500 transition-colors">
                    <ChevronRight className="mr-2 h-3 w-3 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0 -translate-x-1" />
                    <span className="group-hover:translate-x-1 transition-transform">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-base font-semibold uppercase tracking-wider text-gray-400 mb-4">Contact Info</h3>
            <ul className="space-y-3">
              <li className="group flex items-start gap-3 text-sm text-gray-400 hover:text-amber-500 transition-colors">
                <Mail className="mt-0.5 h-4 w-4 flex-shrink-0" /><span>support@taniafrica.com</span>
              </li>
              <li className="group flex items-center gap-3 text-sm text-gray-400 hover:text-amber-500 transition-colors">
                <Phone className="h-4 w-4 flex-shrink-0" /><span>+254 700 123 456</span>
              </li>
              <li className="group flex items-start gap-3 text-sm text-gray-400 hover:text-amber-500 transition-colors">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" /><span>Nairobi, Kenya</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center text-sm text-gray-400">
            <p>&copy; {currentYear} Tani Africa. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-amber-500 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-amber-500 transition-colors">Terms</Link>
              <Link href="/cookies" className="hover:text-amber-500 transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
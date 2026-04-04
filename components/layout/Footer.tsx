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
    <footer className="bg-[#0B0F14] text-gray-300 mt-auto border-t border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12">

        {/* ===================== MAIN GRID ===================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* BRAND */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div
                className="p-2 rounded-lg"
                style={{ background: 'var(--gradient-primary)' }}
              >
                <Truck className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Tani Africa
              </span>
            </div>

            <p className="text-sm text-gray-400 leading-relaxed">
              Connecting cargo owners with reliable drivers across Africa.
              Secure, fast, and affordable logistics you can trust.
            </p>

            {/* SOCIALS */}
            <div className="flex gap-4 mt-5">
              {[FaFacebook, FaTwitter, FaInstagram, FaLinkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="text-gray-400 transition hover:text-[color:var(--color-primary-500)] hover:scale-110"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-gray-400 mb-4 uppercase">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-2 text-sm text-gray-400 hover:text-[color:var(--color-secondary-500)] transition"
                  >
                    <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* SUPPORT */}
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-gray-400 mb-4 uppercase">
              Support
            </h3>
            <ul className="space-y-2">
              {supportLinks.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-2 text-sm text-gray-400 hover:text-[color:var(--color-secondary-500)] transition"
                  >
                    <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CONTACT */}
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-gray-400 mb-4 uppercase">
              Contact
            </h3>
            <div className="space-y-3 text-sm">
              <a
                href="mailto:support@taniafrica.com"
                className="flex items-center gap-3 hover:text-[color:var(--color-secondary-500)] transition"
              >
                <Mail className="h-4 w-4" />
                support@taniafrica.com
              </a>

              <a
                href="tel:+254700123456"
                className="flex items-center gap-3 hover:text-[color:var(--color-secondary-500)] transition"
              >
                <Phone className="h-4 w-4" />
                +254 700 123 456
              </a>

              <div className="flex items-start gap-3 text-gray-400">
                <MapPin className="h-4 w-4 mt-0.5" />
                Nairobi, Kenya
              </div>
            </div>
          </div>
        </div>

        {/* ===================== BOTTOM BAR ===================== */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs sm:text-sm text-gray-400">
            © {currentYear} Tani Africa. All rights reserved.
          </p>

          <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm">
            <Link href="/privacy" className="hover:text-[color:var(--color-secondary-500)]">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-[color:var(--color-secondary-500)]">
              Terms
            </Link>
            <Link href="/cookies" className="hover:text-[color:var(--color-secondary-500)]">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
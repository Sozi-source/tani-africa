import Link from 'next/link';
import { Truck, Mail, Phone, MapPin, ChevronRight } from 'lucide-react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

export const Footer = () => {
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
    <footer className="bg-gray-900 text-white">
      <div className="container-custom py-12">
        {/* Main Footer Grid - Optimized for all screen sizes */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Brand Section - Takes full width on mobile, 1 column on desktop */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-2">
              <Truck className="h-8 w-8 text-primary-500" />
              <span className="text-xl font-bold">Tani Africa</span>
            </div>
            <p className="mt-4 text-sm text-gray-400 leading-relaxed">
              Connecting cargo owners with reliable drivers across Africa. Safe, fast, and affordable logistics solutions.
            </p>
            <div className="mt-4 flex space-x-4">
              <a href="#" className="text-gray-400 transition-all hover:text-primary-500 hover:scale-110 transform" aria-label="Facebook">
                <FaFacebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 transition-all hover:text-primary-500 hover:scale-110 transform" aria-label="Twitter">
                <FaTwitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 transition-all hover:text-primary-500 hover:scale-110 transform" aria-label="Instagram">
                <FaInstagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 transition-all hover:text-primary-500 hover:scale-110 transform" aria-label="LinkedIn">
                <FaLinkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links Section */}
          <div>
            <h3 className="mb-4 text-base font-semibold uppercase tracking-wider text-gray-400">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="group flex items-center text-sm text-gray-400 transition-colors hover:text-primary-500"
                  >
                    <ChevronRight className="mr-2 h-3 w-3 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0 -translate-x-1" />
                    <span className="group-hover:translate-x-1 transition-transform">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Section */}
          <div>
            <h3 className="mb-4 text-base font-semibold uppercase tracking-wider text-gray-400">Support</h3>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="group flex items-center text-sm text-gray-400 transition-colors hover:text-primary-500"
                  >
                    <ChevronRight className="mr-2 h-3 w-3 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0 -translate-x-1" />
                    <span className="group-hover:translate-x-1 transition-transform">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="mb-4 text-base font-semibold uppercase tracking-wider text-gray-400">Contact Info</h3>
            <ul className="space-y-3">
              <li className="group flex items-start space-x-3 text-sm text-gray-400 transition-colors hover:text-primary-500">
                <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 transition-transform group-hover:scale-110" />
                <span>support@taniafrica.com</span>
              </li>
              <li className="group flex items-center space-x-3 text-sm text-gray-400 transition-colors hover:text-primary-500">
                <Phone className="h-4 w-4 flex-shrink-0 transition-transform group-hover:scale-110" />
                <span>+254 700 123 456</span>
              </li>
              <li className="group flex items-start space-x-3 text-sm text-gray-400 transition-colors hover:text-primary-500">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 transition-transform group-hover:scale-110" />
                <span>Nairobi, Kenya</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-gray-800 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center text-sm text-gray-400">
            <p>&copy; {currentYear} Tani Africa. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-primary-500 transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-primary-500 transition-colors">
                Terms
              </Link>
              <Link href="/cookies" className="hover:text-primary-500 transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
import Link from 'next/link';
import { Truck, Mail, Phone, MapPin} from 'lucide-react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin} from 'react-icons/fa';
export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2">
              <Truck className="h-8 w-8 text-primary-500" />
              <span className="text-xl font-bold">Tani Africa</span>
            </div>
            <p className="mt-4 text-sm text-gray-400">
              Connecting cargo owners with reliable drivers across Africa. Safe, fast, and affordable logistics solutions.
            </p>
            <div className="mt-4 flex space-x-4">
              <a href="#" className="text-gray-400 transition-colors hover:text-primary-500">
                <FaFacebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 transition-colors hover:text-primary-500">
                <FaTwitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 transition-colors hover:text-primary-500">
                <FaInstagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 transition-colors hover:text-primary-500">
                <FaLinkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/jobs" className="text-gray-400 transition-colors hover:text-primary-500">
                  Find Jobs
                </Link>
              </li>
              <li>
                <Link href="/vehicles" className="text-gray-400 transition-colors hover:text-primary-500">
                  List Vehicle
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-gray-400 transition-colors hover:text-primary-500">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 transition-colors hover:text-primary-500">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/faq" className="text-gray-400 transition-colors hover:text-primary-500">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 transition-colors hover:text-primary-500">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 transition-colors hover:text-primary-500">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 transition-colors hover:text-primary-500">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Contact Info</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-3 text-gray-400">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>support@taniafrica.com</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-400">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>+254 700 123 456</span>
              </li>
              <li className="flex items-start space-x-3 text-gray-400">
                <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>Nairobi, Kenya</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {currentYear} Tani Africa. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
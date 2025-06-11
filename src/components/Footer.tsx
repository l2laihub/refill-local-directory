import { Instagram, Mail, MapPin, Phone } from 'lucide-react';
import Logo from './Logo';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-gray-800 py-8 md:py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Logo and Tagline */}
        <div className="flex flex-col items-center md:items-start">
          <Link to="/">
            <Logo className="mb-3" />
          </Link>
          <p className="text-sage-400 font-medium mt-2">Refill more, waste less.</p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col items-center md:items-start">
          <h3 className="text-white font-semibold text-lg mb-4">Quick Links</h3>
          <nav className="flex flex-col space-y-2">
            <Link to="/request-city" className="text-gray-400 hover:text-white transition-colors">
              Request Your City
            </Link>
            <Link to="/add-store" className="text-gray-400 hover:text-white transition-colors">
              Submit a Shop
            </Link>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors">
              How It Works
            </a>
          </nav>
        </div>

        {/* Contact and Social */}
        <div className="flex flex-col items-center md:items-start">
          <h3 className="text-white font-semibold text-lg mb-4">Connect With Us</h3>
          <div className="flex flex-col space-y-3">
            <a href="mailto:hello@refilllocal.com" className="text-gray-400 hover:text-white transition-colors flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              hello@refilllocal.com
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center">
              <Phone className="w-5 h-5 mr-2" />
              (555) 123-4567
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              San Francisco, CA
            </a>
            <div className="flex space-x-4 mt-2">
              <a href="#" className="text-gray-400 hover:text-sage-400 transition-colors">
                <Instagram className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 mt-8 pt-6 text-center md:text-left">
        <p className="text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} RefillLocal. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;

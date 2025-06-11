import { Mail, Leaf, Recycle } from 'lucide-react';
import Logo from './Logo';
import MobileNav from './MobileNav';
import { Link } from 'react-router-dom';

const Header = () => (
  <header className="relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-sage-100/50 to-warm-100/30"></div>
    <MobileNav />
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 md:pt-20 md:pb-28">
      <div className="text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/">
            <Logo size="large" className="hidden md:block" />
          </Link>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
          Find Refill & Zero-Waste
          <br />
          <span className="text-sage-600">Stores Near You</span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed">
          Discover places to shop plastic-free and live more sustainably.
        </p>

        {/* CTA Button */}
        <div className="inline-block">
          <a
            href="#signup"
            className="inline-flex items-center px-6 py-3 sm:px-8 sm:py-4 bg-sage-500 text-white font-semibold rounded-full hover:bg-sage-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Mail className="w-5 h-5 mr-2" />
            Join the Waitlist
          </a>
        </div>

        {/* Hero Visual */}
        <div className="mt-10 md:mt-16 flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-sage-200 to-sage-300 rounded-full flex items-center justify-center shadow-xl">
              <Leaf className="w-12 h-12 md:w-16 md:h-16 text-sage-700" />
            </div>
            <div className="absolute -top-3 -right-3 md:-top-4 md:-right-4 w-12 h-12 md:w-16 md:h-16 bg-warm-200 rounded-full flex items-center justify-center shadow-lg">
              <Recycle className="w-6 h-6 md:w-8 md:h-8 text-warm-700" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
);

export default Header;

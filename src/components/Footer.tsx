import { Instagram } from 'lucide-react';
import Logo from './Logo';

const Footer = () => (
  <footer className="bg-gray-800 py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center space-x-2 mb-6 md:mb-0">
          <Logo />
        </div>

        <div className="flex items-center space-x-8 mb-6 md:mb-0">
          <a href="#" className="text-gray-400 hover:text-white transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors">
            Submit a Shop
          </a>
          <a href="#" className="text-gray-400 hover:text-sage-400 transition-colors">
            <Instagram className="w-5 h-5" />
          </a>
        </div>

        <p className="text-sage-400 font-medium">Refill more, waste less.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
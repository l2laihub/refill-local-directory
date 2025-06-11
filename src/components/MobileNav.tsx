import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, MapPin, ShoppingBag, MailPlus, Info } from 'lucide-react';
import Logo from './Logo';

const MobileNav: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const navItems = [
    { name: 'Home', icon: <Home className="w-5 h-5" />, path: '/' },
    { name: 'Cities', icon: <MapPin className="w-5 h-5" />, path: '/#cities' },
    { name: 'Request City', icon: <MailPlus className="w-5 h-5" />, path: '/request-city' },
    { name: 'Add Store', icon: <ShoppingBag className="w-5 h-5" />, path: '/add-store' },
    { name: 'How It Works', icon: <Info className="w-5 h-5" />, path: '/#how-it-works' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="md:hidden">
      {/* Mobile menu button */}
      <button
        onClick={toggleMenu}
        className="fixed top-4 right-4 z-50 p-2 rounded-full bg-white shadow-md"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-sage-600" />
        ) : (
          <Menu className="w-6 h-6 text-sage-600" />
        )}
      </button>

      {/* Logo for mobile */}
      <div className="fixed top-4 left-4 z-50">
        <Link to="/" className="flex items-center" onClick={closeMenu}>
          <Logo size="small" />
        </Link>
      </div>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 bg-white z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full pt-20 pb-6 px-6">
          <nav className="flex-1">
            <ul className="space-y-4">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={`flex items-center p-3 rounded-lg text-lg ${
                      isActive(item.path)
                        ? 'bg-sage-100 text-sage-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    onClick={closeMenu}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <Link
              to="#signup"
              className="flex items-center justify-center w-full px-4 py-3 bg-sage-500 text-white font-semibold rounded-lg shadow-md hover:bg-sage-600 transition-colors"
              onClick={closeMenu}
            >
              <MailPlus className="w-5 h-5 mr-2" />
              Join the Waitlist
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileNav;

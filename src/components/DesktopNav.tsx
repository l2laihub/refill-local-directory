import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'Cities', path: '/#cities' }, // Assuming this links to a section on the homepage
  { name: 'Request City', path: '/request-city' },
  { name: 'Add Store', path: '/add-store' },
  { name: 'How It Works', path: '/#how-it-works' }, // Assuming this links to a section
];

const DesktopNav: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path.includes('/#')) { // Handle hash links for sections on homepage
      return location.pathname === '/' && location.hash === path.substring(path.indexOf('#'));
    }
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="hidden md:flex items-center justify-between w-full py-4">
      <Link to="/" className="flex-shrink-0">
        <Logo size="medium" />
      </Link>
      <nav className="flex space-x-6 lg:space-x-8 items-center">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`text-base font-medium transition-colors duration-150 ease-in-out
              ${isActive(item.path)
                ? 'text-sage-600 hover:text-sage-700'
                : 'text-gray-600 hover:text-sage-600'
              }
            `}
          >
            {item.name}
          </Link>
        ))}
      </nav>
      <div>
        <Link
          to="/#signup" // Assuming waitlist signup is a section on the homepage or a dedicated page
          className="ml-6 inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-sage-500 hover:bg-sage-600 transition-colors"
        >
          Join Waitlist
        </Link>
      </div>
    </div>
  );
};

export default DesktopNav;
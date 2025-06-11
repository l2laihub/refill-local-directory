import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth
import Button from './Button'; // Import Button for logout
import Modal from './Modal'; // Import Modal
import LoginForm from './auth/LoginForm'; // Import LoginForm
import SignupForm from './auth/SignupForm'; // Import SignupForm

const baseNavItems = [
  { name: 'Home', path: '/' },
  { name: 'Cities', path: '/#cities' },
  { name: 'Request City', path: '/request-city' },
  { name: 'Add Store', path: '/add-store' },
  { name: 'How It Works', path: '/#how-it-works' },
];

const DesktopNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isLoading: authIsLoading } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

  // Determine if the user is an admin
  const userRole = user?.app_metadata?.user_role as string | undefined;
  const isAdmin = userRole === 'admin';

  let navItems = [...baseNavItems];
  if (isAdmin) {
    // Add Admin Dashboard link, which then links to moderation etc.
    navItems = [...navItems, { name: 'Admin Dashboard', path: '/admin' }];
  }
  // const navItems = isAdmin
  //   ? [...baseNavItems, { name: 'Admin Moderate', path: '/admin/moderate-stores' }]
  //   : baseNavItems;

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
    <>
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
      <div className="flex items-center space-x-3">
        {user ? (
          <>
            <Link
              to="/profile"
              className="px-4 py-2 text-sm font-medium rounded-full text-gray-600 hover:bg-gray-100 hover:text-sage-600 transition-colors"
            >
              Profile
            </Link>
            <Button
              onClick={async () => {
                await logout();
                navigate('/'); // Redirect to home after logout
              }}
              disabled={authIsLoading}
              className="px-4 py-2 text-sm font-medium rounded-full text-white bg-sage-500 hover:bg-sage-600 transition-colors"
            >
              {authIsLoading ? 'Logging out...' : 'Logout'}
            </Button>
          </>
        ) : (
          <>
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="px-4 py-2 text-sm font-medium rounded-full text-gray-600 hover:bg-gray-100 hover:text-sage-600 transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => setIsSignupModalOpen(true)}
              className="px-4 py-2 text-sm font-medium rounded-full text-white bg-sage-500 hover:bg-sage-600 transition-colors"
            >
              Sign Up
            </button>
          </>
        )}
      </div>
    </div>

    {/* Login Modal */}
    <Modal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)}>
      <LoginForm
        onSuccess={() => setIsLoginModalOpen(false)}
        onSwitchToSignup={() => {
          setIsLoginModalOpen(false);
          setIsSignupModalOpen(true);
        }}
      />
    </Modal>

    {/* Signup Modal */}
    <Modal isOpen={isSignupModalOpen} onClose={() => setIsSignupModalOpen(false)}>
      <SignupForm
        onSuccess={() => {
          setIsSignupModalOpen(false);
          // Optionally, you might want to open the login modal after signup success
          // if email confirmation is not required or if you want to prompt immediate login.
          // For now, just closing signup.
        }}
        onSwitchToLogin={() => {
          setIsSignupModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />
    </Modal>
  </>
  );
};

export default DesktopNav;
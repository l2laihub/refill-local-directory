import React, { useState, Fragment } from 'react'; // Added Fragment
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Home, MapPin, ShoppingBag, MailPlus, Info, LogIn, LogOut, UserPlus, ShieldCheck, User, LayoutDashboard } from 'lucide-react'; // Added LayoutDashboard
import Logo from './Logo';
import { useAuth } from '../contexts/AuthContext';
import Button from './Button';
import Modal from './Modal'; // Import Modal
import LoginForm from './auth/LoginForm'; // Import LoginForm
import SignupForm from './auth/SignupForm'; // Import SignupForm

const baseNavItems = [
  { name: 'Home', icon: <Home className="w-5 h-5" />, path: '/' },
  { name: 'Cities', icon: <MapPin className="w-5 h-5" />, path: '/#cities' },
  { name: 'Request City', icon: <MailPlus className="w-5 h-5" />, path: '/request-city' },
  { name: 'Add Store', icon: <ShoppingBag className="w-5 h-5" />, path: '/add-store' },
  { name: 'How It Works', icon: <Info className="w-5 h-5" />, path: '/#how-it-works' },
];

const MobileNav: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate(); // For logout redirect
  const { user, logout, isLoading: authIsLoading } = useAuth();

  // Determine if the user is an admin (placeholder logic)
  const isAdmin = user && user.app_metadata && user.app_metadata.user_role === 'admin';
  
  let navItems = [...baseNavItems];
  if (isAdmin) {
    navItems = [...navItems, { name: 'Admin Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/admin' }];
  }
  // const navItems = isAdmin
  //   ? [...baseNavItems, { name: 'Admin Moderate', icon: <ShieldCheck className="w-5 h-5" />, path: '/admin/moderate-stores' }]
  //   : baseNavItems;
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleLinkClick = (path: string) => {
    closeMenu();
    // For hash links, ensure navigation happens correctly
    if (path.includes('/#')) {
      navigate(path.substring(0, path.indexOf('#'))); // Navigate to page part
      // Scrolling to hash is handled by browser or can be done manually if needed
    } else {
      navigate(path);
    }
  };
  
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
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
                  {/* Changed Link to div and ensured onClick is correctly used with handleLinkClick */}
                  <div
                    onClick={() => handleLinkClick(item.path)}
                    className={`flex items-center p-3 rounded-lg text-lg cursor-pointer ${
                      isActive(item.path)
                        ? 'bg-sage-100 text-sage-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    role="button" // Added role for accessibility
                    tabIndex={0} // Added tabIndex for accessibility
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleLinkClick(item.path);}} // Keyboard accessibility
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                  </div>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-auto pt-6 border-t border-gray-200 space-y-3">
            {user ? (
              <>
                <div
                  onClick={() => handleLinkClick('/profile')}
                  className="flex items-center p-3 rounded-lg text-lg text-gray-600 hover:bg-gray-100 cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleLinkClick('/profile');}}
                >
                  <User className="w-5 h-5 mr-3" /> Profile
                </div>
                <Button
                  onClick={async () => {
                    closeMenu();
                    await logout();
                    navigate('/'); // Redirect to home after logout
                  }}
                  disabled={authIsLoading}
                  className="w-full flex items-center justify-center px-4 py-3 bg-red-500 text-white"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  {authIsLoading ? 'Logging out...' : 'Logout'}
                </Button>
              </>
            ) : (
              <>
                <div
                  onClick={() => {
                    closeMenu();
                    setIsLoginModalOpen(true);
                  }}
                  className="flex items-center justify-center w-full px-4 py-3 bg-sage-500 text-white font-semibold rounded-lg shadow-md hover:bg-sage-600 transition-colors cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { closeMenu(); setIsLoginModalOpen(true);}}}
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  Login
                </div>
                <div
                  onClick={() => {
                    closeMenu();
                    setIsSignupModalOpen(true);
                  }}
                  className="flex items-center justify-center w-full px-4 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-300 transition-colors cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { closeMenu(); setIsSignupModalOpen(true);}}}
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Sign Up
                </div>
              </>
            )}
          </div>
        </div>
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

export default MobileNav;

import React from 'react';
import HowItWorks from '../components/HowItWorks';
import WhyRefillLocal from '../components/WhyRefillLocal';
import ComingSoon from '../components/ComingSoon';
import EmailSignup from '../components/EmailSignup';
import CitySearch from '../components/CitySearch';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero section with city search */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Find Refill Stores Near You
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Discover local stores where you can shop plastic-free and refill your containers.
          </p>
          <CitySearch />
        </div>
        
        <HowItWorks />
        <WhyRefillLocal />
        <ComingSoon />
        <EmailSignup />
      </div>
    </div>
  );
};

export default HomePage;

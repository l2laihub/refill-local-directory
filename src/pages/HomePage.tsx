import React from 'react';
import HowItWorks from '../components/HowItWorks';
import WhyRefillLocal from '../components/WhyRefillLocal';
import ComingSoon from '../components/ComingSoon';
import EmailSignup from '../components/EmailSignup';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <HowItWorks />
        <WhyRefillLocal />
        <ComingSoon />
        <EmailSignup />
      </div>
    </div>
  );
};

export default HomePage;

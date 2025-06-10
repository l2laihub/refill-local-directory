import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="mb-8">
          <div className="w-24 h-24 bg-warm-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🌱</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Page Not Found
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            We couldn't find the page you're looking for. Let's get you back on track.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link to="/">
            <Button className="w-full bg-sage-500 text-white px-6 py-3 rounded-full hover:bg-sage-600 transition-colors">
              Return to Homepage
            </Button>
          </Link>
          
          <Link to="/coming-soon">
            <Button className="w-full border border-sage-500 text-sage-600 px-6 py-3 rounded-full hover:bg-sage-50 transition-colors">
              See Launch Cities
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;

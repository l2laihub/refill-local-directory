import React from 'react';
import { useParams } from 'react-router-dom';

const CityPage: React.FC = () => {
  const { citySlug } = useParams<{ citySlug: string }>();
  
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Refill Stores in {citySlug?.replace('-', ' ')}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover places to shop plastic-free and live more sustainably in your area.
          </p>
        </div>
        
        <div className="mt-8">
          <p className="text-center text-gray-500">
            Store listings coming soon in Phase 1 MVP.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CityPage;

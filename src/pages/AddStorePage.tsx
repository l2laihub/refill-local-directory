import React from 'react';
import Button from '../components/Button';

const AddStorePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Add a Refill Store
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Help our community by adding a refill or zero-waste store you know about.
          </p>
        </div>
        
        <div className="mt-8 bg-white shadow-lg rounded-2xl p-8">
          <p className="text-center text-gray-500 mb-8">
            Store submission form coming soon in Phase 2.
          </p>
          
          <div className="space-y-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">What information we'll need:</h3>
              <ul className="list-disc pl-5 text-gray-600 space-y-2">
                <li>Store name and contact details</li>
                <li>Location and hours</li>
                <li>Types of products available</li>
                <li>Container requirements</li>
                <li>Photos of the store (if available)</li>
              </ul>
            </div>
            
            <div className="flex justify-center">
              <Button className="bg-sage-500 text-white px-6 py-3 rounded-full hover:bg-sage-600 transition-colors">
                Join Waitlist for Early Access
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddStorePage;

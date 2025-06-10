import React from 'react';
import { useParams } from 'react-router-dom';

const StorePage: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Store Details
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Viewing store ID: {storeId}
          </p>
        </div>
        
        <div className="mt-8">
          <div className="bg-white shadow-lg rounded-2xl p-8">
            <p className="text-center text-gray-500">
              Detailed store profile coming soon in Phase 1 MVP.
            </p>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">Store Information</h3>
                <p className="text-gray-600">Store details will include hours, contact information, and location.</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">What to Bring</h3>
                <p className="text-gray-600">Information about containers and preparation will be displayed here.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorePage;

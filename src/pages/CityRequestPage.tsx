import React from 'react';
import CityRequestForm from '../components/CityRequestForm';
import CityRequestList from '../components/CityRequestList';
import { trackEvent } from '../lib/analytics';

const CityRequestPage: React.FC = () => {
  const handleRequestSuccess = () => {
    trackEvent('city_request_success', {});
  };

  const handleRequestError = (error: string) => {
    trackEvent('city_request_error', { error });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Request Your City</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Don't see your city in our listings? Let us know where you'd like to see RefillLocal expand next! 
            We prioritize new cities based on community demand.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <CityRequestForm 
            onSuccess={handleRequestSuccess}
            onError={handleRequestError}
          />
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">How We Expand to New Cities</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="font-bold text-xl mb-2">1. Request</div>
              <p className="text-gray-600">Community members request their cities through this form.</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="font-bold text-xl mb-2">2. Evaluate</div>
              <p className="text-gray-600">We analyze the number of requests and potential stores in each area.</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="font-bold text-xl mb-2">3. Launch</div>
              <p className="text-gray-600">We notify everyone who requested the city when we're ready to launch!</p>
            </div>
          </div>
        </div>
        
        <div className="mt-12">
          <CityRequestList />
        </div>
      </div>
    </div>
  );
};

export default CityRequestPage;

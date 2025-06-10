import React from 'react';
import { CITIES } from '../lib/constants';
import Button from '../components/Button';

const ComingSoonPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Coming Soon to Your City
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're launching in these cities first
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {CITIES.map((city, index) => (
            <div
              key={index}
              className="relative bg-gradient-to-br from-warm-100 to-warm-200 p-4 rounded-xl text-center group hover:from-warm-200 hover:to-warm-300 transition-all duration-200 cursor-pointer"
            >
              <div className="absolute -top-2 -right-2 bg-sage-400 text-white text-xs px-2 py-1 rounded-full shadow-lg">
                Soon
              </div>
              <p className="font-medium text-gray-700 text-sm">{city}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Don't see your city?</p>
          <Button className="text-sage-600 font-semibold hover:text-sage-700 transition-colors">
            Request My City →
          </Button>
        </div>
        
        <div className="mt-16 max-w-xl mx-auto bg-white shadow-lg rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            Join the Waitlist
          </h2>
          <p className="text-gray-600 mb-6 text-center">
            Be the first to know when we launch in your area.
          </p>
          
          <form className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-sage-500 focus:border-sage-500"
                placeholder="you@example.com"
              />
            </div>
            
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                Your City
              </label>
              <input
                type="text"
                id="city"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-sage-500 focus:border-sage-500"
                placeholder="e.g. Portland, OR"
              />
            </div>
            
            <div className="pt-2">
              <Button className="w-full bg-sage-500 text-white px-6 py-3 rounded-full hover:bg-sage-600 transition-colors">
                Join Waitlist
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ComingSoonPage;

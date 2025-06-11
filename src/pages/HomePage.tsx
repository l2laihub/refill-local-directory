import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import HowItWorks from '../components/HowItWorks';
import WhyRefillLocal from '../components/WhyRefillLocal';
import ComingSoon from '../components/ComingSoon';
import EmailSignup from '../components/EmailSignup';
import CitySearch from '../components/CitySearch';
import CityFilters from '../components/CityFilters';
import { SEO } from '../lib/seo';
import { cityServices } from '../lib/services';
import type { City } from '../lib/types';
import { trackEvent } from '../lib/analytics';

const HomePage: React.FC = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoading(true);
        const citiesData = await cityServices.getAllCities();
        setCities(citiesData.filter(city => city.is_active));
      } catch (error) {
        console.error('Error fetching cities:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCities();
  }, []);
  
  // Extract all unique regions (states) from cities
  const regions = useMemo(() => {
    const regionSet = new Set<string>();
    cities.forEach(city => regionSet.add(city.state));
    return Array.from(regionSet).sort();
  }, [cities]);
  
  // Filter cities based on active region
  const filteredCities = useMemo(() => {
    if (!activeRegion) return cities;
    return cities.filter(city => city.state === activeRegion);
  }, [cities, activeRegion]);
  
  const handleRegionChange = (region: string | null) => {
    setActiveRegion(region);
    if (region) {
      trackEvent('region_filter', { region });
    }
  };
  return (
    <div className="min-h-screen">
      <SEO 
        title="Find Refill & Zero-Waste Stores Near You"
        description="Discover local refill and zero-waste stores where you can shop plastic-free, reduce waste, and live more sustainably. Search for stores in your city."
        canonicalUrl="https://refilllocal.com"
      />
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
      
      {/* Browse Cities Section */}
      <div className="mb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-8">
          Browse Available Cities
        </h2>
        
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-pulse text-sage-600">Loading cities...</div>
          </div>
        ) : (
          <>
            {regions.length > 0 && (
              <CityFilters 
                regions={regions}
                activeFilter={activeRegion}
                onFilterChange={handleRegionChange}
                className="mb-8"
              />
            )}
            
            {filteredCities.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredCities.map(city => (
                  <Link
                    key={city.id}
                    to={`/cities/${city.slug}`}
                    className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
                    onClick={() => trackEvent('city_card_click', { 
                      city_id: city.id,
                      city_name: city.name,
                      from_homepage: true
                    })}
                  >
                    <div className="h-32 bg-gray-200 rounded-md mb-3 overflow-hidden">
                      {city.image_url ? (
                        <img 
                          src={city.image_url} 
                          alt={city.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-sage-100">
                          <MapPin className="h-8 w-8 text-sage-300" />
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-800">
                      {city.name.split(' ').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                      ).join(' ')}
                    </h3>
                    <p className="text-sm text-gray-600">{city.state}, {city.country}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center bg-sage-50 rounded-lg p-8 max-w-2xl mx-auto">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">No Cities Found</h3>
                <p className="text-gray-600">
                  {activeRegion 
                    ? `We don't have any active cities in ${activeRegion} yet.` 
                    : "We're still building our directory of refill cities."}
                </p>
                {activeRegion && (
                  <button
                    onClick={() => setActiveRegion(null)}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-sage-600 text-white rounded-md hover:bg-sage-700 transition-colors"
                  >
                    View All Cities
                  </button>
                )}
              </div>
            )}
          </>
        )}
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

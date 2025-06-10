import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Globe, Clock, Phone, Mail, ExternalLink, ArrowLeft } from 'lucide-react';
import { cityServices, storeServices } from '../lib/services';
import type { City, Store } from '../lib/types';

const CityPage: React.FC = () => {
  const { citySlug } = useParams<{ citySlug: string }>();
  const navigate = useNavigate();
  const [city, setCity] = useState<City | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchCityData = async () => {
      if (!citySlug) return;
      
      try {
        setLoading(true);
        const cityData = await cityServices.getCityBySlug(citySlug);
        
        if (!cityData) {
          setError('City not found');
          setLoading(false);
          return;
        }
        
        setCity(cityData);
        
        // Fetch stores for this city
        const storeData = await storeServices.getStoresByCity(cityData.id);
        setStores(storeData);
        
      } catch (err) {
        console.error('Error fetching city data:', err);
        setError('Failed to load city information');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCityData();
  }, [citySlug]);
  
  const formatCityName = (name: string) => {
    return name.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-sage-600">Loading...</div>
      </div>
    );
  }
  
  if (error || !city) {
    return (
      <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            {error || 'City not found'}
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Sorry, we couldn't find information for this city.
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-sage-600 hover:bg-sage-700"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Home
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center text-sage-600 hover:text-sage-700"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Home
          </button>
        </div>
        
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Refill Stores in {formatCityName(city.name)}
          </h1>
          <div className="flex items-center justify-center text-gray-600 mb-6">
            <MapPin className="h-5 w-5 mr-1" />
            <span>{city.state}, {city.country}</span>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover places to shop plastic-free and live more sustainably in {city.name}.
          </p>
        </div>
        
        <div className="mt-8">
          {stores.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stores.map(store => (
                <Link 
                  key={store.id}
                  to={`/stores/${store.id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  {store.image_url ? (
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={store.image_url} 
                        alt={store.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gray-200 flex items-center justify-center">
                      <Globe className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  
                  <div className="p-5">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{store.name}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{store.description}</p>
                    
                    <div className="flex items-start mb-2">
                      <MapPin className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                      <span className="text-gray-600 text-sm">{store.address}</span>
                    </div>
                    
                    {store.hours_of_operation && (
                      <div className="flex items-start mb-2">
                        <Clock className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                        <span className="text-gray-600 text-sm">
                          {typeof store.hours_of_operation === 'string' 
                            ? store.hours_of_operation 
                            : 'See store details for hours'}
                        </span>
                      </div>
                    )}
                    
                    <div className="mt-4 pt-4 border-t border-gray-100 text-sage-600 font-medium">
                      View Details
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center bg-sage-50 rounded-lg p-8 max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">No Stores Found</h3>
              <p className="text-gray-600 mb-6">
                We're still building our directory of refill stores in {city.name}.
              </p>
              <Link
                to="/add-store"
                className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-sage-600 hover:bg-sage-700"
              >
                Suggest a Store
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CityPage;

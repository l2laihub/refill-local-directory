import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Globe, Clock, Phone, Mail, ExternalLink, ArrowLeft, Leaf, ShoppingBag } from 'lucide-react';
import { storeServices, cityServices } from '../lib/services';
import { supabase } from '../lib/supabase';
import type { Store, City } from '../lib/types';
import analytics from '../lib/analytics';
import { SEO } from '../lib/seo';

const StorePage: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const [store, setStore] = useState<Store | null>(null);
  const [city, setCity] = useState<City | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchStoreData = async () => {
      if (!storeId) return;
      
      try {
        setLoading(true);
        const storeData = await storeServices.getStoreById(storeId);
        
        if (!storeData) {
          setError('Store not found');
          setLoading(false);
          return;
        }
        
        setStore(storeData);
        
        // Track store view with analytics
        analytics.trackStoreView(storeData.id, storeData.name);
        
        // Fetch city data for this store
        // Check if city_id is a UUID or a slug
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(storeData.city_id);
        
        let cityData = null;
        if (isUuid) {
          // If it's a UUID, we need to fetch the city directly by ID
          const { data, error } = await supabase
            .from('cities')
            .select('*')
            .eq('id', storeData.city_id)
            .single();
            
          if (!error) {
            cityData = data;
          } else {
            console.error(`Error fetching city with ID ${storeData.city_id}:`, error);
          }
        } else {
          // If it's not a UUID, assume it's a slug
          cityData = await cityServices.getCityBySlug(storeData.city_id);
        }
        
        if (cityData) {
          setCity(cityData);
        }
        
      } catch (err) {
        console.error('Error fetching store data:', err);
        setError('Failed to load store information');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStoreData();
  }, [storeId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-sage-600">Loading...</div>
      </div>
    );
  }
  
  if (error || !store) {
    return (
      <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <SEO 
          title="Store Not Found"
          description="Sorry, we couldn't find information for this store."
        />
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            {error || 'Store not found'}
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Sorry, we couldn't find information for this store.
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
      <SEO 
        title={store.name}
        description={`${store.description.substring(0, 150)}${store.description.length > 150 ? '...' : ''}`}
        canonicalUrl={`https://refilllocal.com/stores/${store.id}`}
        city={city?.name}
        state={city?.state}
        country={city?.country}
        ogType="article"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          {city && (
            <button
              onClick={() => navigate(`/cities/${city.slug}`)}
              className="inline-flex items-center text-sage-600 hover:text-sage-700"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to {city.name} Stores
            </button>
          )}
        </div>
        
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Store header with image */}
          <div className="relative h-64 bg-sage-100">
            {store.image_url ? (
              <img 
                src={store.image_url} 
                alt={store.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Globe className="h-24 w-24 text-sage-300" />
              </div>
            )}
          </div>
          
          {/* Store information */}
          <div className="p-6 md:p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{store.name}</h1>
            
            <div className="flex flex-wrap items-center text-gray-600 mb-6 gap-4">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-1 text-sage-500" />
                <span>{store.address}</span>
              </div>
              
              {store.phone && (
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-1 text-sage-500" />
                  <a href={`tel:${store.phone}`} className="hover:text-sage-600">{store.phone}</a>
                </div>
              )}
              
              {store.email && (
                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-1 text-sage-500" />
                  <a href={`mailto:${store.email}`} className="hover:text-sage-600">{store.email}</a>
                </div>
              )}
              
              {store.website_url && (
                <div className="flex items-center">
                  <ExternalLink className="h-5 w-5 mr-1 text-sage-500" />
                  <a 
                    href={store.website_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-sage-600"
                  >
                    Visit Website
                  </a>
                </div>
              )}
            </div>
            
            <div className="border-t border-gray-100 pt-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">About</h2>
              <p className="text-gray-600 whitespace-pre-line">{store.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              {/* Hours of operation */}
              <div className="bg-sage-50 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <Clock className="h-6 w-6 text-sage-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-800">Hours</h2>
                </div>
                <div className="text-gray-600">
                  {typeof store.hours_of_operation === 'string' ? (
                    <div className="whitespace-pre-line">{store.hours_of_operation}</div>
                  ) : (
                    <div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="font-medium">Monday:</div>
                        <div>
                          {store.hours_of_operation.monday.closed ? 'Closed' : 
                            `${store.hours_of_operation.monday.open} - ${store.hours_of_operation.monday.close}`}
                        </div>
                        
                        <div className="font-medium">Tuesday:</div>
                        <div>
                          {store.hours_of_operation.tuesday.closed ? 'Closed' : 
                            `${store.hours_of_operation.tuesday.open} - ${store.hours_of_operation.tuesday.close}`}
                        </div>
                        
                        <div className="font-medium">Wednesday:</div>
                        <div>
                          {store.hours_of_operation.wednesday.closed ? 'Closed' : 
                            `${store.hours_of_operation.wednesday.open} - ${store.hours_of_operation.wednesday.close}`}
                        </div>
                        
                        <div className="font-medium">Thursday:</div>
                        <div>
                          {store.hours_of_operation.thursday.closed ? 'Closed' : 
                            `${store.hours_of_operation.thursday.open} - ${store.hours_of_operation.thursday.close}`}
                        </div>
                        
                        <div className="font-medium">Friday:</div>
                        <div>
                          {store.hours_of_operation.friday.closed ? 'Closed' : 
                            `${store.hours_of_operation.friday.open} - ${store.hours_of_operation.friday.close}`}
                        </div>
                        
                        <div className="font-medium">Saturday:</div>
                        <div>
                          {store.hours_of_operation.saturday.closed ? 'Closed' : 
                            `${store.hours_of_operation.saturday.open} - ${store.hours_of_operation.saturday.close}`}
                        </div>
                        
                        <div className="font-medium">Sunday:</div>
                        <div>
                          {store.hours_of_operation.sunday.closed ? 'Closed' : 
                            `${store.hours_of_operation.sunday.open} - ${store.hours_of_operation.sunday.close}`}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* What to bring */}
              <div className="bg-sage-50 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <ShoppingBag className="h-6 w-6 text-sage-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-800">What to Bring</h2>
                </div>
                <div className="text-gray-600 whitespace-pre-line">
                  {store.what_to_bring}
                </div>
              </div>
            </div>
            
            {/* Products */}
            <div className="mt-8">
              <div className="flex items-center mb-4">
                <Leaf className="h-6 w-6 text-sage-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">Available Products</h2>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {store.products.map(product => (
                  <span 
                    key={product}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-sage-100 text-sage-800"
                  >
                    {product}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Map placeholder - would be replaced with actual map in future iteration */}
            <div className="mt-8 border-t border-gray-100 pt-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Location</h2>
              <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">
                  Map integration coming in future updates
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorePage;

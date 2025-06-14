import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Globe, Clock, Phone, Mail, ExternalLink, ArrowLeft, Map } from 'lucide-react';
import { cityServices, storeServices } from '../lib/services';
import type { City, Store } from '../lib/types';
import StoreFilters, { SortOption, FilterOption } from '../components/StoreFilters';
import { trackEvent } from '../lib/analytics';
import { SEO } from '../lib/seo';
import MapboxMap from '../components/MapboxMap';
import { useMediaQuery } from '../lib/useMediaQuery';

const CityPage: React.FC = () => {
  const { citySlug } = useParams<{ citySlug: string }>();
  const navigate = useNavigate();
  const [city, setCity] = useState<City | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilters, setActiveFilters] = useState<FilterOption[]>([]);
  const [activeSort, setActiveSort] = useState<SortOption>('name-asc');
  const [showMap, setShowMap] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  
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

        // Track city view with analytics
        trackEvent('city_view', {
          city_id: cityData.id,
          city_name: cityData.name
        });
        
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

  // Extract all unique products from stores for filtering
  const allProducts = useMemo(() => {
    const productSet = new Set<string>();
    
    stores.forEach(store => {
      store.products.forEach(product => {
        productSet.add(product);
      });
    });
    
    return Array.from(productSet).sort();
  }, [stores]);

  // Apply filters and sorting to stores
  const filteredAndSortedStores = useMemo(() => {
    // First apply filters
    let result = stores;
    
    if (activeFilters.length > 0) {
      result = result.filter(store =>
        activeFilters.some(filter => store.products.includes(filter))
      );
    }
    
    // Then apply sorting
    return result.sort((a, b) => {
      switch (activeSort) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        default:
          return 0;
      }
    });
  }, [stores, activeFilters, activeSort]);

  const handleFilterChange = (filters: FilterOption[]) => {
    setActiveFilters(filters);
    
    if (filters.length > 0) {
      trackEvent('store_filter', {
        city_id: city?.id,
        filters
      });
    }
  };

  const handleSortChange = (sort: SortOption) => {
    setActiveSort(sort);
    
    trackEvent('store_sort', {
      city_id: city?.id,
      sort
    });
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
        <SEO 
          title="City Not Found"
          description="Sorry, we couldn't find information for this city."
        />
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
      <SEO 
        title={`Refill Stores in ${formatCityName(city.name)}`}
        description={`Discover plastic-free and zero-waste stores in ${city.name}, ${city.state}. Find places to shop sustainably and reduce your environmental impact.`}
        canonicalUrl={`https://refilllocal.com/cities/${city.slug}`}
        city={city.name}
        state={city.state}
        country={city.country}
        ogType="website"
      />
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
        
        <div className="text-center mb-8">
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

        {stores.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
              <StoreFilters
                products={allProducts}
                activeFilters={activeFilters}
                activeSort={activeSort}
                onFilterChange={handleFilterChange}
                onSortChange={handleSortChange}
              />
              
              {!isDesktop && (
                <button
                  onClick={() => setShowMap(!showMap)}
                  className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-sage-100 text-sage-800 rounded-md hover:bg-sage-200 transition-colors"
                >
                  <Map className="h-4 w-4 mr-2" />
                  {showMap ? 'Show List' : 'Show Map'}
                </button>
              )}
            </div>
            
            {/* Map view for desktop (always visible) */}
            {isDesktop && stores.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Stores in {formatCityName(city.name)}</h2>
                <MapboxMap
                  locations={stores.map(store => ({
                    id: store.id,
                    name: store.name,
                    latitude: store.latitude,
                    longitude: store.longitude,
                    address: store.address
                  }))}
                  height="400px"
                  className="rounded-lg shadow-md"
                />
              </div>
            )}
            
            {/* Map view for mobile (toggled) */}
            {!isDesktop && showMap && stores.length > 0 && (
              <div className="mb-8">
                <MapboxMap
                  locations={stores.map(store => ({
                    id: store.id,
                    name: store.name,
                    latitude: store.latitude,
                    longitude: store.longitude,
                    address: store.address
                  }))}
                  height="400px"
                  className="rounded-lg shadow-md"
                />
              </div>
            )}
          </div>
        )}
        
        <div className={!isDesktop && showMap ? 'hidden' : 'mt-8'}>
          {stores.length > 0 && filteredAndSortedStores.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedStores.map(store => (
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
                        referrerPolicy="no-referrer"
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
          ) : stores.length > 0 && filteredAndSortedStores.length === 0 ? (
            <div className="text-center bg-sage-50 rounded-lg p-8 max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">No Matching Stores</h3>
              <p className="text-gray-600 mb-6">
                No stores match your current filters. Try adjusting your filter criteria.
              </p>
              <button
                onClick={() => setActiveFilters([])}
                className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-sage-600 hover:bg-sage-700"
              >
                Clear Filters
              </button>
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

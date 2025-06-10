import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { CITIES } from '../lib/constants';
import analytics from '../lib/analytics';

const CitySearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const suggestionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Close suggestions when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSuggestions([]);
      setError('');
      return;
    }

    const filteredCities = CITIES.filter((city) =>
      city.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSuggestions(filteredCities);
    
    // Clear error if we have matching cities
    if (filteredCities.length > 0) {
      setError('');
    }
  }, [searchTerm]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowSuggestions(true);
    setError('');
  };

  const handleSuggestionClick = (city: string) => {
    setSearchTerm(city);
    setShowSuggestions(false);
    navigateToCity(city);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchTerm.trim() === '') {
      setError('Please enter a city name');
      return;
    }

    // Check if the entered city is in our list
    const cityExists = CITIES.some(
      (city) => city.toLowerCase() === searchTerm.toLowerCase()
    );

    // Track the search with analytics
    analytics.trackCitySearch(searchTerm, cityExists);

    if (cityExists) {
      navigateToCity(searchTerm);
    } else {
      setError('City not found. Please select from the suggestions.');
    }
  };

  const navigateToCity = (cityName: string) => {
    const citySlug = cityName.toLowerCase().replace(/\s+/g, '-');
    navigate(`/cities/${citySlug}`);
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="relative" aria-label="Search for cities">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={() => searchTerm && setShowSuggestions(true)}
            placeholder="Search for a city..."
            className={`block w-full pl-10 pr-3 py-3 border ${
              error ? 'border-red-300' : 'border-gray-300'
            } rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-sage-500 transition duration-150 ease-in-out`}
            aria-label="City search"
          />
        </div>

        {error && (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionRef}
            className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm"
          >
            {suggestions.map((city) => (
              <div
                key={city}
                onClick={() => handleSuggestionClick(city)}
                className="cursor-pointer hover:bg-sage-50 px-4 py-2"
              >
                {city}
              </div>
            ))}
          </div>
        )}

        <button
          type="submit"
          className="mt-3 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-sage-600 hover:bg-sage-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-500 transition duration-150 ease-in-out"
        >
          Find Refill Stores
        </button>
      </form>
    </div>
  );
};

export default CitySearch;

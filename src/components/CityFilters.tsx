import React, { useState } from 'react';
import { X } from 'lucide-react';
import { trackEvent } from '../lib/analytics';

export type CityFilterOption = string;
export type CityRegion = string;

interface CityFiltersProps {
  regions: CityRegion[];
  activeFilter: CityRegion | null;
  onFilterChange: (region: CityRegion | null) => void;
  className?: string;
}

const CityFilters: React.FC<CityFiltersProps> = ({
  regions,
  activeFilter,
  onFilterChange,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterClick = (region: CityRegion) => {
    // If already active, clear the filter
    if (region === activeFilter) {
      onFilterChange(null);
      trackEvent('city_filter_clear', {});
    } else {
      onFilterChange(region);
      trackEvent('city_filter_select', { region });
    }
  };

  const clearAllFilters = () => {
    onFilterChange(null);
    trackEvent('city_filter_clear', {});
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center mb-4">
        <h2 className="text-lg font-medium text-gray-700 mb-2 md:mb-0">Filter Cities</h2>
        
        {activeFilter && (
          <button 
            onClick={clearAllFilters}
            className="text-sage-600 text-sm flex items-center ml-0 md:ml-4 hover:text-sage-800"
          >
            <X className="h-3 w-3 mr-1" />
            Clear Filter
          </button>
        )}
        
        {regions.length > 5 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sage-600 text-sm flex items-center ml-auto hover:text-sage-800"
          >
            {isExpanded ? 'Show Less' : 'Show All'}
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {regions.slice(0, isExpanded ? regions.length : 5).map((region) => (
          <button
            key={region}
            onClick={() => handleFilterClick(region)}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              activeFilter === region
                ? 'bg-sage-600 text-white'
                : 'bg-sage-100 text-sage-800 hover:bg-sage-200'
            }`}
          >
            {region}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CityFilters;

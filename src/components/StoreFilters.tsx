import React, { useState } from 'react';
import { Filter, SortAsc, SortDesc } from 'lucide-react';

export type SortOption = 'name-asc' | 'name-desc' | 'newest' | 'oldest';
export type FilterOption = string;

interface StoreFiltersProps {
  products: string[];
  onFilterChange: (filters: FilterOption[]) => void;
  onSortChange: (sort: SortOption) => void;
  activeFilters: FilterOption[];
  activeSort: SortOption;
}

const StoreFilters: React.FC<StoreFiltersProps> = ({
  products,
  onFilterChange,
  onSortChange,
  activeFilters,
  activeSort,
}) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const handleFilterToggle = (product: string) => {
    const updatedFilters = activeFilters.includes(product)
      ? activeFilters.filter(f => f !== product)
      : [...activeFilters, product];
    
    onFilterChange(updatedFilters);
  };

  const sortOptions: { value: SortOption; label: string; icon?: React.ReactNode }[] = [
    { value: 'name-asc', label: 'Name (A-Z)', icon: <SortAsc className="h-4 w-4" /> },
    { value: 'name-desc', label: 'Name (Z-A)', icon: <SortDesc className="h-4 w-4" /> },
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
  ];

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <button
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          className="flex items-center px-4 py-2 bg-white rounded-md shadow-sm text-sage-600 hover:bg-sage-50 border border-sage-200 mb-4 md:mb-0"
        >
          <Filter className="h-4 w-4 mr-2" />
          {activeFilters.length > 0 ? `Filters (${activeFilters.length})` : 'Filter'}
        </button>

        <div className="flex items-center">
          <label htmlFor="sort" className="mr-2 text-gray-600">Sort by:</label>
          <select
            id="sort"
            value={activeSort}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="px-3 py-2 bg-white rounded-md shadow-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-sage-500"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isFiltersOpen && (
        <div className="mt-4 p-4 bg-white rounded-md shadow-sm border border-gray-200">
          <h3 className="font-medium text-gray-800 mb-3">Filter by Products</h3>
          <div className="flex flex-wrap gap-2">
            {products.map((product) => (
              <button
                key={product}
                onClick={() => handleFilterToggle(product)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  activeFilters.includes(product)
                    ? 'bg-sage-500 text-white'
                    : 'bg-sage-100 text-sage-800 hover:bg-sage-200'
                }`}
              >
                {product}
              </button>
            ))}
          </div>
          {activeFilters.length > 0 && (
            <button
              onClick={() => onFilterChange([])}
              className="mt-3 text-sm text-sage-600 hover:text-sage-800"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default StoreFilters;

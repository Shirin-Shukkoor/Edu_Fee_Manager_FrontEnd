import { useState, useCallback, useRef, useEffect } from 'react';

const SearchAndFilter = ({ 
  onSearch, 
  onFilter, 
  onSort, 
  filters = [], 
  sortOptions = [], 
  searchPlaceholder = "Search...",
  showSearch = true,
  showFilters = true,
  showSort = true,
  currentFilters = {},
  currentSort = '',
  searchValue = ''
}) => {
  const [searchTerm, setSearchTerm] = useState(searchValue);
  const [activeFilters, setActiveFilters] = useState(currentFilters);
  const [sortBy, setSortBy] = useState(currentSort);
  const searchTimeoutRef = useRef(null);

  // Update local state when props change
  useEffect(() => {
    setSearchTerm(searchValue);
  }, [searchValue]);
  
  useEffect(() => {
    // Only update if there are actual filter values to preserve
    const filterValues = {};
    filters.forEach(filter => {
      if (currentFilters[filter.key]) {
        filterValues[filter.key] = currentFilters[filter.key];
      }
    });
    setActiveFilters(filterValues);
  }, [currentFilters, filters]);
  
  useEffect(() => {
    setSortBy(currentSort);
  }, [currentSort]);

  const handleSearch = useCallback((value) => {
    setSearchTerm(value);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Debounce search with 500ms delay
    searchTimeoutRef.current = setTimeout(() => {
      onSearch(value);
    }, 500);
  }, [onSearch]);

  const handleFilterChange = useCallback((filterKey, value) => {
    const newFilters = { ...activeFilters, [filterKey]: value };
    if (!value) delete newFilters[filterKey];
    setActiveFilters(newFilters);
    onFilter(newFilters);
  }, [activeFilters, onFilter]);

  const handleSortChange = useCallback((value) => {
    setSortBy(value);
    onSort(value);
  }, [onSort]);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setActiveFilters({});
    setSortBy('');
    
    // Clear search timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    onSearch('');
    onFilter({});
    onSort('');
  }, [onSearch, onFilter, onSort]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
      <div className="flex flex-wrap gap-4 items-center">
        {showSearch && (
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {showFilters && filters.map((filter) => (
          <div key={filter.key} className="min-w-40">
            <select
              value={activeFilters[filter.key] || ''}
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{filter.placeholder}</option>
              {filter.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ))}

        {showSort && sortOptions.length > 0 && (
          <div className="min-w-40">
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sort by...</option>
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          onClick={clearFilters}
          className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Clear All
        </button>
      </div>
    </div>
  );
};

export default SearchAndFilter;
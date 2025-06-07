import React from 'react';
import { Search, Filter, SortAsc } from 'lucide-react';

interface SKUFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  filterType: string;
  onFilterChange: (value: string) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (field: string, order: 'asc' | 'desc') => void;
}

const SKUFilters: React.FC<SKUFiltersProps> = ({
  search,
  onSearchChange,
  filterType,
  onFilterChange,
  sortBy,
  sortOrder,
  onSortChange,
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search SKUs by name..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          {/* Filter Dropdown */}
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => onFilterChange(e.target.value)}
              className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
            >
              <option value="">All SKUs</option>
              <option value="high_return">High Return Rate (&gt;10%)</option>
              <option value="low_content">Low Content Score (&lt;5)</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center space-x-2">
            <SortAsc className="h-5 w-5 text-gray-400" />
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                onSortChange(field, order as 'asc' | 'desc');
              }}
              className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="sales-desc">Sales (High to Low)</option>
              <option value="sales-asc">Sales (Low to High)</option>
              <option value="return_percentage-desc">Return Rate (High to Low)</option>
              <option value="return_percentage-asc">Return Rate (Low to High)</option>
              <option value="content_score-desc">Content Score (High to Low)</option>
              <option value="content_score-asc">Content Score (Low to High)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {(search || filterType) && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">Active filters:</span>
          {search && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Search: "{search}"
              <button
                type="button"
                className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200"
                onClick={() => onSearchChange('')}
              >
                ×
              </button>
            </span>
          )}
          {filterType && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
              {filterType === 'high_return' ? 'High Return Rate' : 'Low Content Score'}
              <button
                type="button"
                className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-emerald-200"
                onClick={() => onFilterChange('')}
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default SKUFilters;
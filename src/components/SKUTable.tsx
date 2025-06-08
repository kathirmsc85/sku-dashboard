import React from 'react';
import { SKU } from '../types';
import { ChevronUp, ChevronDown, TrendingUp, TrendingDown, Star } from 'lucide-react';

interface SKUTableProps {
  skus: SKU[];
  onSKUClick: (sku: SKU) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
}

const SKUTable: React.FC<SKUTableProps> = ({
  skus,
  onSKUClick,
  sortBy,
  sortOrder,
  onSort,
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  const getReturnBadge = (percentage: number) => {
    if (percentage > 10) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <TrendingUp className="h-3 w-3 mr-1" />
          High ({percentage}%)
        </span>
      );
    } else if (percentage > 5) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          {percentage}%
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <TrendingDown className="h-3 w-3 mr-1" />
          Low ({percentage}%)
        </span>
      );
    }
  };

  const getContentScoreBadge = (score: number) => {
    const stars = Math.round(score);
    const color = score >= 8 ? 'text-green-500' : score >= 6 ? 'text-yellow-500' : 'text-red-500';
    
    return (
      <div className="flex items-center space-x-1">
        <span className="text-sm font-medium">{score.toFixed(1)}</span>
        <div className="flex">
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${i < stars ? color : 'text-gray-300'} ${i < stars ? 'fill-current' : ''}`}
            />
          ))}
        </div>
      </div>
    );
  };

  const SortableHeader: React.FC<{ field: string; children: React.ReactNode; className?: string }> = ({
    field,
    children,
    className = '',
  }) => (
    <th
      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50 transition-colors ${className}`}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {getSortIcon(field)}
      </div>
    </th>
  );

  if (skus.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-12 text-center">
          <p className="text-gray-500">No SKUs found matching your criteria.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <SortableHeader field="id">SKU Id</SortableHeader>
              <SortableHeader field="name">SKU Name</SortableHeader>
              <SortableHeader field="sales">Sales</SortableHeader>
              <SortableHeader field="return_percentage">Return Rate</SortableHeader>
              <SortableHeader field="content_score">Content Score</SortableHeader>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {skus.map((sku) => (
              <tr
                key={sku.id}
                className="hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => onSKUClick(sku)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                      {sku.id}
                    </div>
                    <div className="text-sm text-gray-500">ID: {sku.id.slice(0, 8)}...</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                      {sku.name}
                    </div>
                    <div className="text-sm text-gray-500">ID: {sku.id.slice(0, 8)}...</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">
                    {formatCurrency(sku.sales)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getReturnBadge(sku.return_percentage)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getContentScoreBadge(sku.content_score)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSKUClick(sku);
                    }}
                    className="text-blue-600 hover:text-blue-900 font-medium"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SKUTable;
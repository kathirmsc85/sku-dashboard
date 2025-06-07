import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SKU } from '../types';
import { skuAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import SKUTable from './SKUTable';
import SKUFilters from './SKUFilters';
import { Package, AlertCircle, RefreshCw } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [skus, setSkus] = useState<SKU[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSKUs();
  }, [search, filterType, sortBy, sortOrder]);

  const fetchSKUs = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await skuAPI.getAll({
        search,
        filter_type: filterType,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      setSkus(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load SKUs');
    } finally {
      setLoading(false);
    }
  };

  const handleSKUClick = (sku: SKU) => {
    navigate(`/sku/${sku.id}`);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleSortChange = (field: string, order: 'asc' | 'desc') => {
    setSortBy(field);
    setSortOrder(order);
  };

  const getStatsCards = () => {
    const totalSales = skus.reduce((sum, sku) => sum + sku.sales, 0);
    const avgReturnRate = skus.length > 0 
      ? skus.reduce((sum, sku) => sum + sku.return_percentage, 0) / skus.length 
      : 0;
    const avgContentScore = skus.length > 0 
      ? skus.reduce((sum, sku) => sum + sku.content_score, 0) / skus.length 
      : 0;
    
    return [
      {
        title: 'Total SKUs',
        value: skus.length.toString(),
        icon: Package,
        color: 'blue',
      },
      {
        title: 'Total Sales',
        value: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          notation: 'compact',
          maximumFractionDigits: 1,
        }).format(totalSales),
        icon: Package,
        color: 'green',
      },
      {
        title: 'Avg Return Rate',
        value: `${avgReturnRate.toFixed(1)}%`,
        icon: Package,
        color: avgReturnRate > 10 ? 'red' : avgReturnRate > 5 ? 'yellow' : 'green',
      },
      {
        title: 'Avg Content Score',
        value: avgContentScore.toFixed(1),
        icon: Package,
        color: avgContentScore >= 8 ? 'green' : avgContentScore >= 6 ? 'yellow' : 'red',
      },
    ];
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-700 border-blue-200',
      green: 'bg-green-50 text-green-700 border-green-200',
      yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      red: 'bg-red-50 text-red-700 border-red-200',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  if (loading && skus.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your SKUs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your SKUs and track performance metrics
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {getStatsCards().map((stat, index) => (
            <div
              key={index}
              className={`bg-white rounded-lg shadow p-6 border-l-4 ${getColorClasses(stat.color)}`}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-8 w-8" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-semibold">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-red-600">{error}</p>
              </div>
              <button
                onClick={fetchSKUs}
                className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Retry</span>
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <SKUFilters
          search={search}
          onSearchChange={setSearch}
          filterType={filterType}
          onFilterChange={setFilterType}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
        />

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Updating results...</p>
          </div>
        )}

        {/* SKU Table */}
        <SKUTable
          skus={skus}
          onSKUClick={handleSKUClick}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
        />
      </div>
    </div>
  );
};

export default Dashboard;
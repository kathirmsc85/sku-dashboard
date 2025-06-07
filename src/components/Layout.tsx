import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Package, LogOut, User, Shield } from 'lucide-react';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Package className="h-8 w-8 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">SpreeTail Home-Task SKU Dashboard</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  {user?.role === 'merch_ops' ? (
                    <Shield className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <User className="h-4 w-4 text-blue-600" />
                  )}
                  <span>{user?.username}</span>
                </div>
                <span className="text-gray-400">|</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user?.role === 'merch_ops' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {user?.role === 'merch_ops' ? 'Merch Ops' : 'Brand User'}
                </span>
              </div>
              
              <button
                onClick={logout}
                className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
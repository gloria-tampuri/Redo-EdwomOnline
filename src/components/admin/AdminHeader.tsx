'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Bell, Search, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AdminHeader() {
  const { data: session } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/auth/login' });
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Search Bar */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search Order ID, Customer Name, Phone, or Email..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4 ml-6">
        {/* Notifications */}
        <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-sm font-bold">
              {session?.user?.name?.charAt(0).toUpperCase() ?? 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-gray-900">
                {session?.user?.name ?? 'User'}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {(session?.user as any)?.role ?? 'user'}
              </p>
            </div>
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="p-3 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-900">
                  {session?.user?.email}
                </p>
              </div>
              <div className="p-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

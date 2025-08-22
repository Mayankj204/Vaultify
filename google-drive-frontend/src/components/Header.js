// src/components/Header.js
import React from 'react';
import { Search } from 'lucide-react';

const Header = ({ searchQuery, setSearchQuery, userEmail }) => {
  return (
    <header className="flex items-center justify-between p-4 bg-white border-b border-border flex-shrink-0">
      {/* Search Bar */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search your drive..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      
      {/* User Profile Section */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-text-secondary">
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-text-primary">
                {userEmail ? userEmail.charAt(0).toUpperCase() : '?'}
            </div>
            <span>{userEmail}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
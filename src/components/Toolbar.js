import React from "react";
import { Plus, Search } from "lucide-react";

function Toolbar({ searchTerm, onSearchChange, onCreateProfile }) {
  return (
    <div className="h-20 bg-dark-900 border-b border-dark-700 px-8 flex items-center justify-between">
      {/* Search Bar */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            placeholder="Search profiles..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="input-field w-full pl-10"
          />
        </div>
      </div>

      {/* Create Profile Button */}
      <button
        onClick={onCreateProfile}
        className="ml-4 btn-primary flex items-center gap-2"
      >
        <Plus size={18} />
        <span>New Profile</span>
      </button>
    </div>
  );
}

export default Toolbar;

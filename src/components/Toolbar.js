import React, { useState } from "react";
import { Plus, Search, Play, Square, Globe, Zap } from "lucide-react";

function Toolbar({
  searchTerm,
  onSearchChange,
  onCreateProfile,
  onLaunchAll,
  onCloseAll,
  onOpenUrlInAll,
}) {
  const [urlInput, setUrlInput] = useState("");

  const handleOpenUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    onOpenUrlInAll(url.startsWith("http") ? url : `https://${url}`);
  };

  return (
    <div className="bg-dark-900 border-b border-dark-700 px-6 py-3 flex flex-col gap-3">
      {/* Row 1: search + bulk actions + new profile */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="flex-1 max-w-sm relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            placeholder="Search profiles..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="input-field w-full pl-9 py-2 text-sm"
          />
        </div>

        {/* Bulk Actions */}
        <button
          id="launch-all-btn"
          onClick={onLaunchAll}
          title="Launch all profiles"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/30 hover:border-green-500/50 transition-all duration-200 text-sm font-medium"
        >
          <Zap size={15} />
          Launch All
        </button>

        <button
          id="close-all-btn"
          onClick={onCloseAll}
          title="Close all running browsers"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 hover:border-red-500/50 transition-all duration-200 text-sm font-medium"
        >
          <Square size={15} />
          Close All
        </button>

        <div className="w-px h-6 bg-dark-700" />

        {/* New Profile */}
        <button
          id="new-profile-btn"
          onClick={onCreateProfile}
          className="btn-primary flex items-center gap-2 py-2 text-sm"
        >
          <Plus size={16} />
          New Profile
        </button>
      </div>

      {/* Row 2: Open URL in all browsers */}
      <div className="flex items-center gap-3">
        <Globe size={16} className="text-gray-500 shrink-0" />
        <input
          id="bulk-url-input"
          type="text"
          placeholder="Enter URL to open in all browsers (e.g. https://youtube.com)"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleOpenUrl()}
          className="input-field flex-1 py-2 text-sm"
        />
        <button
          id="open-url-all-btn"
          onClick={handleOpenUrl}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-600/20 hover:bg-accent-600/30 text-accent-400 border border-accent-600/30 hover:border-accent-500/50 transition-all duration-200 text-sm font-medium shrink-0"
        >
          <Play size={14} />
          Open in All
        </button>
      </div>
    </div>
  );
}

export default Toolbar;

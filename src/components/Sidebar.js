import React from "react";
import { Settings, Network, Zap, Code, Home } from "lucide-react";

function Sidebar({ isDarkMode, onToggleDarkMode }) {
  const menuItems = [
    { icon: Home, label: "Dashboard", id: "dashboard" },
    { icon: Network, label: "Profiles", id: "profiles" },
    { icon: Zap, label: "Automation", id: "automation" },
    { icon: Code, label: "Fingerprints", id: "fingerprints" },
  ];

  return (
    <div className="w-64 bg-dark-900 border-r border-dark-700 flex flex-col h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-dark-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">Akash</h1>
            <p className="text-gray-500 text-xs">Browser Manager</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-dark-800 transition-all duration-200"
          >
            <item.icon size={20} />
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Settings & Theme Toggle */}
      <div className="p-4 border-t border-dark-700 space-y-2">
        <button
          onClick={onToggleDarkMode}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-dark-800 transition-all duration-200"
        >
          <div className="w-5 h-5 rounded-full border border-gray-600 flex items-center justify-center">
            <div
              className={`w-2 h-2 rounded-full transition-all ${isDarkMode ? "bg-accent-500" : "bg-gray-600"}`}
            />
          </div>
          <span className="text-sm font-medium">
            {isDarkMode ? "Dark" : "Light"}
          </span>
        </button>

        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-dark-800 transition-all duration-200">
          <Settings size={20} />
          <span className="text-sm font-medium">Settings</span>
        </button>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-dark-700 text-center">
        <p className="text-xs text-gray-600">v1.0.0</p>
      </div>
    </div>
  );
}

export default Sidebar;

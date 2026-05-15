import React, { useState } from "react";
import { X, Settings } from "lucide-react";
import { motion } from "framer-motion";

function SettingsModal({ onClose }) {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-dark-800 rounded-xl border border-dark-700 w-2xl max-h-[600px] flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <div className="flex items-center gap-3">
            <Settings size={24} className="text-accent-500" />
            <h2 className="text-2xl font-bold text-white">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-dark-700">
          {[
            { id: "general", label: "General" },
            { id: "advanced", label: "Advanced" },
            { id: "about", label: "About" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-accent-400 border-b-2 border-accent-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === "general" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Chrome Path
                </label>
                <input
                  type="text"
                  placeholder="Auto-detected"
                  className="input-field w-full"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">
                  Auto-detected from system
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Theme
                </label>
                <select className="input-field w-full">
                  <option>Dark</option>
                  <option>Light</option>
                  <option>Auto</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === "advanced" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">
                  Debug Mode
                </label>
                <input type="checkbox" className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">
                  Enable Logging
                </label>
                <input type="checkbox" className="w-4 h-4" defaultChecked />
              </div>
            </div>
          )}

          {activeTab === "about" && (
            <div className="space-y-4 text-sm text-gray-400">
              <div>
                <p className="font-medium text-white mb-1">Akash Browser</p>
                <p>v1.0.0</p>
              </div>
              <div>
                <p className="font-medium text-white mb-1">Electron</p>
                <p>{process.versions?.electron || "Unknown"}</p>
              </div>
              <div>
                <p className="font-medium text-white mb-1">Made with</p>
                <p>❤️ for automation professionals</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-dark-700">
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default SettingsModal;

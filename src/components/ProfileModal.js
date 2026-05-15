import React, { useState } from "react";
import { X } from "lucide-react";
import { motion } from "framer-motion";

function ProfileModal({ onClose, onCreate }) {
  const [formData, setFormData] = useState({
    name: "",
    proxy: "",
    proxyType: "http",
    userAgent: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Profile name is required");
      return;
    }
    setLoading(true);
    try {
      await onCreate(formData);
    } catch (error) {
      console.error("Error creating profile:", error);
      alert("Failed to create profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-dark-800 rounded-xl border border-dark-700 p-8 w-96 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Create Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Profile Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Profile Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Profile 1"
              className="input-field w-full"
              required
            />
          </div>

          {/* Proxy */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Proxy (Optional)
            </label>
            <input
              type="text"
              name="proxy"
              value={formData.proxy}
              onChange={handleChange}
              placeholder="e.g., 192.168.1.1:8080"
              className="input-field w-full"
            />
          </div>

          {/* Proxy Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Proxy Type
            </label>
            <select
              name="proxyType"
              value={formData.proxyType}
              onChange={handleChange}
              className="input-field w-full"
            >
              <option value="http">HTTP</option>
              <option value="https">HTTPS</option>
              <option value="socks5">SOCKS5</option>
            </select>
          </div>

          {/* User Agent */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              User Agent (Optional)
            </label>
            <textarea
              name="userAgent"
              value={formData.userAgent}
              onChange={handleChange}
              placeholder="Custom user agent..."
              className="input-field w-full h-20 resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Profile"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default ProfileModal;

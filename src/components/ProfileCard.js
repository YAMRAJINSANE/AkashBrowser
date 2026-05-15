import React, { useState } from "react";
import { Play, Pause, Trash2, Edit2, Check, X, Wifi } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

function ProfileCard({
  profile,
  isRunning,
  onLaunch,
  onClose,
  onDelete,
  onEdit, // onEdit(newName)
}) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(profile.name);

  const handleRenameStart = () => {
    setRenameValue(profile.name);
    setIsRenaming(true);
  };

  const handleRenameConfirm = () => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== profile.name) {
      onEdit(trimmed);
    }
    setIsRenaming(false);
  };

  const handleRenameCancel = () => {
    setRenameValue(profile.name);
    setIsRenaming(false);
  };

  const handleRenameKeyDown = (e) => {
    if (e.key === "Enter") handleRenameConfirm();
    if (e.key === "Escape") handleRenameCancel();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="card-hover group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {isRenaming ? (
              <motion.div
                key="rename-input"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1"
              >
                <input
                  autoFocus
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={handleRenameKeyDown}
                  className="flex-1 min-w-0 bg-dark-700 border border-accent-500/50 rounded-md px-2 py-1 text-sm text-white focus:outline-none focus:border-accent-400"
                />
                <button
                  onClick={handleRenameConfirm}
                  title="Confirm rename"
                  className="p-1 rounded text-green-400 hover:bg-green-500/20 transition-colors"
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={handleRenameCancel}
                  title="Cancel"
                  className="p-1 rounded text-gray-400 hover:bg-dark-600 transition-colors"
                >
                  <X size={14} />
                </button>
              </motion.div>
            ) : (
              <motion.h3
                key="profile-name"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-lg font-semibold text-white group-hover:text-accent-400 transition-colors truncate"
              >
                {profile.name}
              </motion.h3>
            )}
          </AnimatePresence>
          <p className="text-xs text-gray-500 mt-1">
            {(() => {
              const d = profile.createdAt ? new Date(profile.createdAt) : null;
              return d && !isNaN(d.getTime())
                ? `Created ${formatDistanceToNow(d, { addSuffix: true })}`
                : "Just created";
            })()}
          </p>
        </div>
        {isRunning && (
          <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded-full ml-2 shrink-0">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-green-400 font-medium">Active</span>
          </div>
        )}
      </div>

      {/* Profile Info */}
      <div className="space-y-2 mb-4 text-sm text-gray-400">
        {profile.proxy && (
          <div className="flex items-center gap-2">
            <Wifi size={14} className="text-accent-400" />
            <span>
              {profile.proxyType?.toUpperCase()} • {profile.proxy}
            </span>
          </div>
        )}
        {profile.userAgent && (
          <div className="text-xs truncate text-gray-500">
            UA: {profile.userAgent.substring(0, 50)}...
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {isRunning ? (
          <button
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-all duration-200"
          >
            <Pause size={16} />
            <span className="text-sm font-medium">Close</span>
          </button>
        ) : (
          <button
            onClick={onLaunch}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-accent-600/20 hover:bg-accent-600/30 text-accent-400 transition-all duration-200"
          >
            <Play size={16} />
            <span className="text-sm font-medium">Launch</span>
          </button>
        )}
        <button
          onClick={handleRenameStart}
          title="Rename profile"
          className="px-3 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-gray-400 hover:text-accent-400 transition-all duration-200"
        >
          <Edit2 size={16} />
        </button>
        <button
          onClick={onDelete}
          title="Delete profile"
          className="px-3 py-2 rounded-lg bg-dark-700 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all duration-200"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </motion.div>
  );
}

export default ProfileCard;

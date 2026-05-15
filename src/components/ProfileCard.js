import React from "react";
import { Play, Pause, Trash2, Edit2, Wifi, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

function ProfileCard({
  profile,
  isRunning,
  onLaunch,
  onClose,
  onDelete,
  onEdit,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="card-hover group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white group-hover:text-accent-400 transition-colors">
            {profile.name}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Created{" "}
            {formatDistanceToNow(new Date(profile.createdAt), {
              addSuffix: true,
            })}
          </p>
        </div>
        {isRunning && (
          <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded-full">
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
          onClick={onEdit}
          className="px-3 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-gray-400 transition-all duration-200"
        >
          <Edit2 size={16} />
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-2 rounded-lg bg-dark-700 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all duration-200"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </motion.div>
  );
}

export default ProfileCard;

import React from "react";
import { Loader, Inbox } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import ProfileCard from "../components/ProfileCard";

function Dashboard({
  profiles,
  loading,
  onLaunchBrowser,
  onCloseBrowser,
  onFocusBrowser,
  onDeleteProfile,
  onEditProfile,
  browserStatus,
}) {
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader
            size={48}
            className="animate-spin text-accent-500 mx-auto mb-4"
          />
          <p className="text-gray-400">Loading profiles...</p>
        </div>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Inbox size={64} className="text-gray-600 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            No Profiles Yet
          </h3>
          <p className="text-gray-500">
            Create your first profile to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Your Profiles</h2>
        <p className="text-gray-400">
          {profiles.length} profile{profiles.length !== 1 ? "s" : ""} available
        </p>
      </div>

      {/* Profile Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {profiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              isRunning={browserStatus[profile.id]?.running}
              onLaunch={() => onLaunchBrowser(profile.id)}
              onClose={() => onCloseBrowser(profile.id)}
              onFocus={() => onFocusBrowser(profile.id)}
              onDelete={() => {
                if (window.confirm(`Delete profile "${profile.name}"?`)) {
                  onDeleteProfile(profile.id);
                }
              }}
              onEdit={(newName) => onEditProfile(profile.id, newName)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Dashboard;

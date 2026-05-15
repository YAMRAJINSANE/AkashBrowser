import React, { useState, useEffect } from "react";
import { useProfiles } from "./hooks/useProfiles";
import { useBrowser } from "./hooks/useBrowser";
import { useToast } from "./hooks/useToast";
import Sidebar from "./components/Sidebar";
import Toolbar from "./components/Toolbar";
import Dashboard from "./pages/Dashboard";
import ProfileModal from "./components/ProfileModal";
import SettingsModal from "./components/SettingsModal";
import "./App.css";

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { profiles, loading, createProfile, deleteProfile, updateProfile } =
    useProfiles();
  const { launchBrowser, closeBrowser, launchAllBrowsers, closeAllBrowsers, openUrlInAll, browserStatus } = useBrowser();
  const { addToast, ToastContainer } = useToast();

  useEffect(() => {
    // Load preferences from localStorage
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode !== null) {
      setIsDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  const handleToggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem("darkMode", JSON.stringify(newMode));
    addToast(`Theme changed to ${newMode ? "dark" : "light"} mode`, "info");
  };

  const handleCreateProfile = async (profileData) => {
    try {
      await createProfile(profileData);
      setShowProfileModal(false);
      addToast(`Profile "${profileData.name}" created successfully`, "success");
    } catch (error) {
      console.error("Error creating profile:", error);
      addToast("Failed to create profile", "error");
    }
  };

  const handleDeleteProfile = async (profileId) => {
    try {
      await deleteProfile(profileId);
      addToast("Profile deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting profile:", error);
      addToast("Failed to delete profile", "error");
    }
  };

  const handleLaunchBrowser = async (profileId) => {
    try {
      await launchBrowser(profileId);
      addToast("Browser launched", "success");
    } catch (error) {
      console.error("Error launching browser:", error);
      addToast("Failed to launch browser", "error");
    }
  };

  const handleCloseBrowser = async (profileId) => {
    try {
      await closeBrowser(profileId);
      addToast("Browser closed", "info");
    } catch (error) {
      console.error("Error closing browser:", error);
      addToast("Failed to close browser", "error");
    }
  };

  const handleEditProfile = async (profileId, newName) => {
    try {
      await updateProfile(profileId, { name: newName });
      addToast(`Renamed to "${newName}"`, "success");
    } catch (error) {
      console.error("Error renaming profile:", error);
      addToast("Failed to rename profile", "error");
    }
  };

  const handleLaunchAll = async () => {
    try {
      await launchAllBrowsers();
      addToast("All browsers launched", "success");
    } catch (error) {
      addToast("Failed to launch all browsers", "error");
    }
  };

  const handleCloseAll = async () => {
    try {
      await closeAllBrowsers();
      addToast("All browsers closed", "info");
    } catch (error) {
      addToast("Failed to close all browsers", "error");
    }
  };

  const handleOpenUrlInAll = async (url) => {
    try {
      await openUrlInAll(url);
      addToast(`Opened URL in all browsers`, "success");
    } catch (error) {
      addToast("Failed to open URL in all browsers", "error");
    }
  };

  const filteredProfiles = profiles.filter((profile) =>
    profile.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className={`flex h-screen ${isDarkMode ? "dark" : ""}`}>
      <style>{`
        :root {
          color-scheme: ${isDarkMode ? "dark" : "light"};
        }
      `}</style>

      <Sidebar
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
      />

      <div className="flex-1 flex flex-col overflow-hidden bg-dark-950">
        <Toolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onCreateProfile={() => setShowProfileModal(true)}
          onLaunchAll={handleLaunchAll}
          onCloseAll={handleCloseAll}
          onOpenUrlInAll={handleOpenUrlInAll}
        />

        <Dashboard
          profiles={filteredProfiles}
          loading={loading}
          onLaunchBrowser={handleLaunchBrowser}
          onCloseBrowser={handleCloseBrowser}
          onDeleteProfile={handleDeleteProfile}
          onEditProfile={handleEditProfile}
          browserStatus={browserStatus}
        />
      </div>

      {showProfileModal && (
        <ProfileModal
          onClose={() => setShowProfileModal(false)}
          onCreate={handleCreateProfile}
        />
      )}
    </div>
  );
}

export default App;

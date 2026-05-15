import { useState, useEffect, useCallback } from "react";

export function useProfiles() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const data = await window.electronAPI.getProfiles();
      setProfiles(data);
    } catch (error) {
      console.error("Error loading profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  const createProfile = useCallback(async (profileData) => {
    try {
      const newProfile = await window.electronAPI.createProfile(profileData);
      setProfiles((prev) => [newProfile, ...prev]);
      return newProfile;
    } catch (error) {
      console.error("Error creating profile:", error);
      throw error;
    }
  }, []);

  const updateProfile = useCallback(async (id, profileData) => {
    try {
      const updatedProfile = await window.electronAPI.updateProfile(
        id,
        profileData,
      );
      setProfiles((prev) =>
        prev.map((p) => (p.id === id ? updatedProfile : p)),
      );
      return updatedProfile;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  }, []);

  const deleteProfile = useCallback(async (id) => {
    try {
      await window.electronAPI.deleteProfile(id);
      setProfiles((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error deleting profile:", error);
      throw error;
    }
  }, []);

  return {
    profiles,
    loading,
    createProfile,
    updateProfile,
    deleteProfile,
    refetch: loadProfiles,
  };
}

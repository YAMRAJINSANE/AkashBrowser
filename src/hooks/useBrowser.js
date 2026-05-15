import { useState, useCallback, useEffect } from "react";

export function useBrowser() {
  const [browserStatus, setBrowserStatus] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Set up listeners for browser status changes
    if (window.electronAPI?.onBrowserStatusChanged) {
      window.electronAPI.onBrowserStatusChanged(
        (event, { profileId, status }) => {
          setBrowserStatus((prev) => ({
            ...prev,
            [profileId]: status,
          }));
        },
      );
    }
  }, []);

  const launchBrowser = useCallback(async (profileId) => {
    try {
      setLoading(true);
      const result = await window.electronAPI.launchBrowser(profileId);
      setBrowserStatus((prev) => ({
        ...prev,
        [profileId]: {
          running: true,
          pid: result.pid,
          startedAt: new Date().toISOString(),
        },
      }));
      return result;
    } catch (error) {
      console.error("Error launching browser:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const closeBrowser = useCallback(async (profileId) => {
    try {
      setLoading(true);
      await window.electronAPI.closeBrowser(profileId);
      setBrowserStatus((prev) => ({
        ...prev,
        [profileId]: { running: false },
      }));
    } catch (error) {
      console.error("Error closing browser:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getStatus = useCallback(async (profileId) => {
    try {
      const status = await window.electronAPI.getBrowserStatus(profileId);
      setBrowserStatus((prev) => ({
        ...prev,
        [profileId]: status,
      }));
      return status;
    } catch (error) {
      console.error("Error getting browser status:", error);
      throw error;
    }
  }, []);

  return {
    launchBrowser,
    closeBrowser,
    getStatus,
    browserStatus,
    loading,
  };
}

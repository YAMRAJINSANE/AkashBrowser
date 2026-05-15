const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // Profile APIs
  getProfiles: () => ipcRenderer.invoke("get-profiles"),
  createProfile: (profileData) =>
    ipcRenderer.invoke("create-profile", profileData),
  updateProfile: (id, profileData) =>
    ipcRenderer.invoke("update-profile", id, profileData),
  deleteProfile: (id) => ipcRenderer.invoke("delete-profile", id),

  // Browser APIs
  launchBrowser: (profileId) => ipcRenderer.invoke("launch-browser", profileId),
  closeBrowser: (profileId) => ipcRenderer.invoke("close-browser", profileId),
  getBrowserStatus: (profileId) =>
    ipcRenderer.invoke("get-browser-status", profileId),

  // Listeners
  onProfileCreated: (callback) => ipcRenderer.on("profile-created", callback),
  onProfileDeleted: (callback) => ipcRenderer.on("profile-deleted", callback),
  onBrowserStatusChanged: (callback) =>
    ipcRenderer.on("browser-status-changed", callback),
});

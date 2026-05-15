const { app, BrowserWindow, Menu, ipcMain } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
const Database = require("../backend/database/database");
const ProfileManager = require("../backend/managers/profileManager");
const BrowserLauncher = require("../backend/managers/browserLauncher");

let mainWindow;
let db;
let profileManager;
let browserLauncher;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
      enableRemoteModule: false,
    },
    icon: path.join(__dirname, "../assets/icon.png"),
  });

  const startUrl = isDev
    ? "http://localhost:3000"
    : `file://${path.join(__dirname, "../build/index.html")}`;

  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.on("ready", async () => {
  try {
    // Initialize database
    db = new Database();
    await db.init();

    // Initialize managers
    profileManager = new ProfileManager(db);
    browserLauncher = new BrowserLauncher();

    createWindow();
    createMenu();
  } catch (error) {
    console.error("Failed to initialize app:", error);
    app.quit();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC Handlers for Profiles
ipcMain.handle("get-profiles", async () => {
  try {
    return await profileManager.getAllProfiles();
  } catch (error) {
    console.error("Error getting profiles:", error);
    throw error;
  }
});

ipcMain.handle("create-profile", async (event, profileData) => {
  try {
    return await profileManager.createProfile(profileData);
  } catch (error) {
    console.error("Error creating profile:", error);
    throw error;
  }
});

ipcMain.handle("update-profile", async (event, id, profileData) => {
  try {
    return await profileManager.updateProfile(id, profileData);
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
});

ipcMain.handle("delete-profile", async (event, id) => {
  try {
    return await profileManager.deleteProfile(id);
  } catch (error) {
    console.error("Error deleting profile:", error);
    throw error;
  }
});

// IPC Handlers for Browser Control
ipcMain.handle("launch-browser", async (event, profileId) => {
  try {
    const profile = await profileManager.getProfile(profileId);
    if (!profile) {
      throw new Error("Profile not found");
    }
    return await browserLauncher.launch(profileId, profile);
  } catch (error) {
    console.error("Error launching browser:", error);
    throw error;
  }
});

ipcMain.handle("close-browser", async (event, profileId) => {
  try {
    return await browserLauncher.closeBrowser(profileId);
  } catch (error) {
    console.error("Error closing browser:", error);
    throw error;
  }
});

ipcMain.handle("get-browser-status", async (event, profileId) => {
  try {
    return browserLauncher.getStatus(profileId);
  } catch (error) {
    console.error("Error getting browser status:", error);
    throw error;
  }
});

// IPC Handlers for Bulk Browser Control
ipcMain.handle("launch-all-browsers", async () => {
  try {
    const profiles = await profileManager.getAllProfiles();
    const results = [];
    for (const profile of profiles) {
      try {
        const result = await browserLauncher.launch(profile.id, profile);
        results.push({ profileId: profile.id, success: true, pid: result.pid });
        if (mainWindow) {
          mainWindow.webContents.send("browser-status-changed", {
            profileId: profile.id,
            status: { running: true, pid: result.pid, startedAt: new Date().toISOString() },
          });
        }
      } catch (e) {
        results.push({ profileId: profile.id, success: false });
      }
    }
    return results;
  } catch (error) {
    console.error("Error launching all browsers:", error);
    throw error;
  }
});

ipcMain.handle("close-all-browsers", async () => {
  try {
    const profiles = await profileManager.getAllProfiles();
    for (const profile of profiles) {
      try {
        await browserLauncher.closeBrowser(profile.id);
        if (mainWindow) {
          mainWindow.webContents.send("browser-status-changed", {
            profileId: profile.id,
            status: { running: false },
          });
        }
      } catch (e) { /* already closed */ }
    }
    return { success: true };
  } catch (error) {
    console.error("Error closing all browsers:", error);
    throw error;
  }
});

ipcMain.handle("open-url-in-all", async (event, url) => {
  try {
    const profiles = await profileManager.getAllProfiles();
    const results = [];
    for (const profile of profiles) {
      try {
        // If browser is already running, navigate it; otherwise launch with the URL
        const status = browserLauncher.getStatus(profile.id);
        if (status && status.running) {
          await browserLauncher.openUrl(profile.id, url);
        } else {
          const profileWithUrl = { ...profile, startUrl: url };
          await browserLauncher.launch(profile.id, profileWithUrl);
          if (mainWindow) {
            mainWindow.webContents.send("browser-status-changed", {
              profileId: profile.id,
              status: { running: true, startedAt: new Date().toISOString() },
            });
          }
        }
        results.push({ profileId: profile.id, success: true });
      } catch (e) {
        results.push({ profileId: profile.id, success: false });
      }
    }
    return results;
  } catch (error) {
    console.error("Error opening URL in all browsers:", error);
    throw error;
  }
});

function createMenu() {
  const template = [
    {
      label: "File",
      submenu: [
        { label: "Exit", accelerator: "CmdOrCtrl+Q", click: () => app.quit() },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
        { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
        { type: "separator" },
        { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
        { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
        { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
      ],
    },
    {
      label: "View",
      submenu: [
        {
          label: "Reload",
          accelerator: "CmdOrCtrl+R",
          click: () => mainWindow?.webContents?.reload(),
        },
        {
          label: "Full Screen",
          accelerator: "F11",
          click: () => mainWindow?.setFullScreen(!mainWindow?.isFullScreen()),
        },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

module.exports = { app, mainWindow };

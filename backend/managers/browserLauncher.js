const { spawn } = require("child_process");
const path = require("path");
const os = require("os");
const fs = require("fs");
const { execSync } = require("child_process");

class BrowserLauncher {
  constructor() {
    this.processes = new Map();
    this.browserPath = this.findChrome();
  }

  findChrome() {
    const platform = process.platform;

    if (platform === "win32") {
      const possiblePaths = [
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        path.join(
          process.env.LOCALAPPDATA,
          "Google\\Chrome\\Application\\chrome.exe",
        ),
      ];

      for (const chromePath of possiblePaths) {
        if (fs.existsSync(chromePath)) {
          return chromePath;
        }
      }
    } else if (platform === "darwin") {
      return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
    } else if (platform === "linux") {
      return "/usr/bin/google-chrome";
    }

    return null;
  }

  async launch(profileId, profile) {
    try {
      if (!this.browserPath) {
        throw new Error("Chrome not found on system");
      }

      const userDataDir =
        profile.profilePath ||
        path.join(
          process.env.APPDATA || "~",
          ".akash-browser",
          `profile-${profileId}`,
        );

      // Create user data directory if it doesn't exist
      if (!fs.existsSync(userDataDir)) {
        fs.mkdirSync(userDataDir, { recursive: true });
      }

      const args = [
        `--user-data-dir=${userDataDir}`,
        "--no-first-run",
        "--disable-notifications",
        "--disable-background-networking",
        "--disable-background-timer-throttling",
        "--disable-backgrounding-occluded-windows",
        "--disable-breakpad",
        "--disable-client-side-phishing-detection",
        "--disable-component-extensions-with-background-pages",
        "--disable-component-extensions-with-background-pages",
      ];

      // Add proxy if specified
      if (profile.proxy && profile.proxyType) {
        args.push(`--proxy-server=${profile.proxy}`);
      }

      // Add user agent if specified
      if (profile.userAgent) {
        args.push(`--user-agent=${profile.userAgent}`);
      }

      const browserProcess = spawn(this.browserPath, args, {
        detached: false,
        stdio: "ignore",
      });

      const processData = {
        profileId,
        pid: browserProcess.pid,
        process: browserProcess,
        startedAt: new Date(),
        status: "running",
      };

      this.processes.set(profileId, processData);

      browserProcess.on("exit", () => {
        this.processes.delete(profileId);
      });

      return {
        success: true,
        pid: browserProcess.pid,
        profileId,
      };
    } catch (error) {
      console.error("Error launching browser:", error);
      throw error;
    }
  }

  async closeBrowser(profileId) {
    try {
      const processData = this.processes.get(profileId);
      if (processData && processData.process) {
        process.kill(-processData.pid);
        this.processes.delete(profileId);
        return { success: true };
      }
      return { success: false, message: "Browser not running" };
    } catch (error) {
      console.error("Error closing browser:", error);
      throw error;
    }
  }

  getStatus(profileId) {
    const processData = this.processes.get(profileId);
    if (processData) {
      return {
        running: true,
        pid: processData.pid,
        startedAt: processData.startedAt,
      };
    }
    return { running: false };
  }

  getAllRunningProcesses() {
    return Array.from(this.processes.values()).map((p) => ({
      profileId: p.profileId,
      pid: p.pid,
      startedAt: p.startedAt,
    }));
  }
}

module.exports = BrowserLauncher;

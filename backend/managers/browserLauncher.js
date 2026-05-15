const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

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
        if (fs.existsSync(chromePath)) return chromePath;
      }
    } else if (platform === "darwin") {
      return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
    } else if (platform === "linux") {
      return "/usr/bin/google-chrome";
    }

    return null;
  }

  // ─── Write profile name into Chrome Preferences ─────────────────────────────
  // Chrome reads this before the window opens and shows
  // "[Profile Name] — Page Title — Google Chrome" in the taskbar / title bar.
  setProfileName(userDataDir, profileName) {
    try {
      const defaultDir = path.join(userDataDir, "Default");
      if (!fs.existsSync(defaultDir)) {
        fs.mkdirSync(defaultDir, { recursive: true });
      }
      const prefPath = path.join(defaultDir, "Preferences");
      let prefs = {};
      if (fs.existsSync(prefPath)) {
        try {
          prefs = JSON.parse(fs.readFileSync(prefPath, "utf8"));
        } catch (e) {
          // file corrupt or empty — start fresh
        }
      }
      if (!prefs.profile) prefs.profile = {};
      prefs.profile.name = profileName;
      prefs.profile.using_default_name = false;
      fs.writeFileSync(prefPath, JSON.stringify(prefs, null, 2));
    } catch (e) {
      console.warn("Could not write Chrome preferences:", e.message);
    }
  }

  // ─── Append autoplay + mute params to YouTube URLs ──────────────────────────
  buildUrl(url) {
    if (!url) return null;
    try {
      const parsed = new URL(url);
      const isYouTube =
        parsed.hostname.includes("youtube.com") ||
        parsed.hostname.includes("youtu.be");
      if (isYouTube) {
        parsed.searchParams.set("autoplay", "1");
        parsed.searchParams.set("mute", "1");
        return parsed.toString();
      }
    } catch (e) {
      // invalid URL — use as-is
    }
    return url;
  }

  // ─── Launch ──────────────────────────────────────────────────────────────────
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

      if (!fs.existsSync(userDataDir)) {
        fs.mkdirSync(userDataDir, { recursive: true });
      }

      // Set profile name in Preferences so title bar/taskbar shows the name
      if (profile.name) {
        this.setProfileName(userDataDir, profile.name);
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
        // Force autoplay without requiring a user gesture
        "--autoplay-policy=no-user-gesture-required",
      ];

      if (profile.proxy && profile.proxyType) {
        args.push(`--proxy-server=${profile.proxy}`);
      }

      if (profile.userAgent) {
        args.push(`--user-agent=${profile.userAgent}`);
      }

      // URL must be last; inject autoplay+mute params for YouTube
      if (profile.startUrl) {
        args.push(this.buildUrl(profile.startUrl));
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
        profile, // keep reference for openUrl()
      };

      this.processes.set(profileId, processData);

      browserProcess.on("exit", () => {
        this.processes.delete(profileId);
      });

      return { success: true, pid: browserProcess.pid, profileId };
    } catch (error) {
      console.error("Error launching browser:", error);
      throw error;
    }
  }

  // ─── Close ───────────────────────────────────────────────────────────────────
  async closeBrowser(profileId) {
    try {
      const processData = this.processes.get(profileId);
      if (processData && processData.process) {
        // .kill() on ChildProcess works cross-platform (no -pid group kill)
        processData.process.kill("SIGTERM");
        this.processes.delete(profileId);
        return { success: true };
      }
      return { success: false, message: "Browser not running" };
    } catch (error) {
      console.error("Error closing browser:", error);
      this.processes.delete(profileId);
      return { success: false, message: error.message };
    }
  }

  // ─── Open URL in running browser ─────────────────────────────────────────────
  // Chrome subprocesses can't be navigated via Node directly, so we close and relaunch.
  async openUrl(profileId, url) {
    try {
      const processData = this.processes.get(profileId);
      if (processData) {
        const profile = { ...processData.profile, startUrl: url };
        await this.closeBrowser(profileId);
        // Wait for Chrome to release its profile lock
        await new Promise((res) => setTimeout(res, 800));
        return await this.launch(profileId, profile);
      } else {
        throw new Error("Browser not running for profile: " + profileId);
      }
    } catch (error) {
      console.error("Error opening URL in browser:", error);
      throw error;
    }
  }

  // ─── Status ──────────────────────────────────────────────────────────────────
  getStatus(profileId) {
    const processData = this.processes.get(profileId);
    if (processData) {
      return { running: true, pid: processData.pid, startedAt: processData.startedAt };
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

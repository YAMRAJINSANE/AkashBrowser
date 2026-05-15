const { spawn, execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");

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
        // Mute all audio for this Chrome instance
        "--mute-audio",
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

  // ─── Focus (bring to foreground) ─────────────────────────────────────────────
  // Finds the Chrome window for this profile by matching --user-data-dir in the
  // process command line (via WMI), then raises it using AttachThreadInput +
  // SetForegroundWindow — bypasses Windows' foreground-lock restriction.
  async focusBrowser(profileId) {
    const processData = this.processes.get(profileId);
    if (!processData) {
      return { success: false, message: "Browser not running" };
    }

    const profile = processData.profile;
    const userDataDir =
      profile.profilePath ||
      path.join(
        process.env.APPDATA || "~",
        ".akash-browser",
        `profile-${profileId}`,
      );

    if (process.platform === "win32") {
      const psScript = `
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class WinFocus {
    [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
    [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
    [DllImport("user32.dll")] public static extern bool BringWindowToTop(IntPtr hWnd);
    [DllImport("user32.dll")] public static extern int GetWindowThreadProcessId(IntPtr hWnd, out int lpdwProcessId);
    [DllImport("kernel32.dll")] public static extern int GetCurrentThreadId();
    [DllImport("user32.dll")] public static extern bool AttachThreadInput(int idAttach, int idAttachTo, bool fAttach);
}
"@

# Match Chrome processes whose command line contains our exact user-data-dir
$dir = "${userDataDir}"
$chromePids = Get-WmiObject Win32_Process -Filter "Name='chrome.exe'" -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -like "*$dir*" } |
    Select-Object -ExpandProperty ProcessId

# Among matched PIDs, find one that has a real visible window
$target = Get-Process -Name chrome -ErrorAction SilentlyContinue |
    Where-Object { $chromePids -contains $_.Id -and $_.MainWindowHandle -ne [IntPtr]::Zero } |
    Select-Object -First 1

# Fallback: any visible Chrome window
if (-not $target) {
    $target = Get-Process -Name chrome -ErrorAction SilentlyContinue |
        Where-Object { $_.MainWindowHandle -ne [IntPtr]::Zero } |
        Select-Object -First 1
}

if ($target) {
    $hwnd = $target.MainWindowHandle
    $dummy = 0
    $targetThread = [WinFocus]::GetWindowThreadProcessId($hwnd, [ref]$dummy)
    $currentThread = [WinFocus]::GetCurrentThreadId()

    [WinFocus]::ShowWindow($hwnd, 9)                                   # SW_RESTORE (un-minimise)
    [WinFocus]::AttachThreadInput($currentThread, $targetThread, $true)  # bypass foreground-lock
    [WinFocus]::BringWindowToTop($hwnd)
    [WinFocus]::SetForegroundWindow($hwnd)
    [WinFocus]::AttachThreadInput($currentThread, $targetThread, $false)

    Write-Output "focused"
} else {
    Write-Output "not_found"
}
`;

      const tmpFile = path.join(os.tmpdir(), `akash-focus-${profileId}.ps1`);
      try {
        fs.writeFileSync(tmpFile, psScript, "utf8");
        const result = execSync(
          `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File "${tmpFile}"`,
          { timeout: 8000, encoding: "utf8" },
        ).trim();
        return { success: result === "focused", message: result };
      } catch (e) {
        console.warn("focusBrowser error:", e.message);
        return { success: false, message: e.message };
      } finally {
        try { fs.unlinkSync(tmpFile); } catch (_) {}
      }
    }

    // macOS
    if (process.platform === "darwin") {
      try {
        execSync(`osascript -e 'tell application "Google Chrome" to activate'`, { timeout: 3000 });
        return { success: true };
      } catch (e) {
        return { success: false, message: e.message };
      }
    }

    return { success: false, message: "Focus not supported on this platform" };
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

import path from 'path';
import os from 'os';

class Config {
  constructor() {
    this.appName = 'Akash Browser';
    this.appId = 'com.akashbrowser.app';
    this.version = '1.0.0';
    this.isDev = process.env.NODE_ENV === 'development';
    this.debug = process.env.DEBUG === 'true';
    this.logLevel = process.env.LOG_LEVEL || 'info';
  }

  getAppDataPath() {
    const appData = process.env.APPDATA || 
      path.join(os.homedir(), 'AppData', 'Roaming');
    return path.join(appData, this.appName);
  }

  getProfilesPath() {
    return path.join(this.getAppDataPath(), 'profiles');
  }

  getDatabasePath() {
    return path.join(this.getAppDataPath(), 'data', 'profiles.db');
  }

  getLogsPath() {
    return path.join(this.getAppDataPath(), 'logs');
  }

  getChromePath() {
    const platform = process.platform;
    
    if (platform === 'win32') {
      const possiblePaths = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe')
      ];
      return possiblePaths.find(p => require('fs').existsSync(p));
    } else if (platform === 'darwin') {
      return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    } else if (platform === 'linux') {
      return '/usr/bin/google-chrome';
    }
    return null;
  }

  getConfig() {
    return {
      appName: this.appName,
      appId: this.appId,
      version: this.version,
      isDev: this.isDev,
      debug: this.debug,
      logLevel: this.logLevel,
      paths: {
        appData: this.getAppDataPath(),
        profiles: this.getProfilesPath(),
        database: this.getDatabasePath(),
        logs: this.getLogsPath()
      },
      chrome: {
        path: this.getChromePath(),
        args: [
          '--no-first-run',
          '--no-default-browser-check',
          '--disable-notifications',
          '--disable-background-networking',
          '--disable-background-timer-throttling',
          '--disable-breakpad',
          '--disable-client-side-phishing-detection'
        ]
      }
    };
  }
}

export default new Config();

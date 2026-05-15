# Akash Browser - Professional Desktop Browser Profile Manager

A modern, professional desktop application for managing browser profiles with advanced features like proxy management, browser fingerprinting, and multi-profile automation.

Built with **Electron**, **React**, and **Tailwind CSS**.

## Features

✨ **Professional UI**

- Modern dark/light mode interface
- Glass morphism design
- Smooth animations and transitions
- Responsive grid layout

🔧 **Profile Management**

- Create/edit/delete browser profiles
- Store profiles in SQLite database
- Automatic profile isolation

🌐 **Browser Control**

- Launch Chrome with isolated user-data-dir
- Each profile runs independently
- Automatic Chrome detection
- Process management

🔒 **Proxy Support**

- HTTP/HTTPS/SOCKS5 proxies
- Per-profile proxy assignment
- Proxy testing functionality
- Bulk proxy import

🎭 **Browser Fingerprinting**

- Randomized user agents
- Custom screen resolutions
- Timezone/language spoofing
- WebGL vendor/renderer customization

⚡ **Performance**

- Optimized Electron process
- Efficient resource management
- Background process tracking

## Project Structure

```
AkashBrowser/
├── electron/              # Electron main process
│   ├── main.js          # App entry point
│   └── preload.js       # Context bridge
├── src/                 # React frontend
│   ├── components/      # React components
│   ├── hooks/          # Custom hooks
│   ├── pages/          # Page components
│   ├── index.js        # React entry
│   └── App.js          # Main app component
├── backend/            # Backend services
│   ├── database/       # SQLite database
│   │   └── database.js
│   └── managers/       # Business logic
│       ├── profileManager.js
│       ├── browserLauncher.js
│       ├── fingerprintManager.js
│       └── proxyManager.js
├── assets/             # App assets
├── public/             # Static files
├── package.json        # Dependencies
├── tailwind.config.js  # Tailwind config
└── postcss.config.js   # PostCSS config
```

## Installation

### Prerequisites

- Node.js 16+
- npm or yarn
- Google Chrome installed

### Steps

1. **Clone the repository**

```bash
cd AkashBrowser
```

2. **Install dependencies**

```bash
npm install
```

3. **Start development**

```bash
npm start
```

This will start both the React dev server and Electron app simultaneously.

## Development

### Start the development environment

```bash
npm start
```

### Build the React app

```bash
npm run react-build
```

### Build Electron app (Windows)

```bash
npm run electron-build
```

### Full production build

```bash
npm run build
```

## IPC Communication

The app uses Electron IPC for communication between the main process and renderer:

### Available APIs (via `window.electronAPI`)

**Profile Management**

- `getProfiles()` - Fetch all profiles
- `createProfile(data)` - Create new profile
- `updateProfile(id, data)` - Update profile
- `deleteProfile(id)` - Delete profile

**Browser Control**

- `launchBrowser(profileId)` - Launch browser with profile
- `closeBrowser(profileId)` - Close browser process
- `getBrowserStatus(profileId)` - Get browser status

**Listeners**

- `onProfileCreated(callback)` - Profile created event
- `onProfileDeleted(callback)` - Profile deleted event
- `onBrowserStatusChanged(callback)` - Browser status change

## Database Schema

### Profiles Table

```sql
CREATE TABLE profiles (
  id INTEGER PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  profilePath TEXT NOT NULL,
  userAgent TEXT,
  screenSize TEXT,
  timezone TEXT,
  language TEXT,
  platform TEXT,
  proxy TEXT,
  proxyType TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Browser Processes Table

```sql
CREATE TABLE browserProcesses (
  id INTEGER PRIMARY KEY,
  profileId INTEGER NOT NULL,
  pid INTEGER,
  status TEXT,
  launchedAt DATETIME,
  FOREIGN KEY (profileId) REFERENCES profiles(id)
)
```

### Fingerprints Table

```sql
CREATE TABLE fingerprints (
  id INTEGER PRIMARY KEY,
  profileId INTEGER UNIQUE NOT NULL,
  userAgent TEXT,
  screenResolution TEXT,
  timezone TEXT,
  language TEXT,
  webglVendor TEXT,
  webglRenderer TEXT,
  hardwareConcurrency INTEGER,
  deviceMemory INTEGER,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (profileId) REFERENCES profiles(id)
)
```

## Next Steps

The app is ready for the following enhancements:

1. **Automation Engine** - Playwright-based browser automation
2. **Advanced Fingerprinting** - Canvas/WebGL fingerprint randomization
3. **Team Features** - Profile sharing and collaboration
4. **Cloud Sync** - Profile synchronization across devices
5. **Plugins System** - Extensible plugin architecture

## Configuration

### Electron Builder Config

Configured in `package.json` build section:

- Targets: Windows NSIS installer + Portable EXE
- App ID: `com.akashbrowser.app`
- Product name: `Akash Browser`

### Tailwind CSS

- Custom color scheme with dark/light modes
- Glass morphism utilities
- Smooth animations

## Architecture Highlights

- **IPC Communication**: Secure context-isolated communication
- **Database**: SQLite for local storage
- **Process Management**: Tracking of Chrome processes
- **Profile Isolation**: Each profile in separate user-data-dir
- **Error Handling**: Comprehensive error management

## Troubleshooting

**Chrome not detected**

- Ensure Google Chrome is installed
- Check `C:\Program Files\Google\Chrome\Application\chrome.exe`

**Database locked error**

- SQLite database file might be in use
- Check `%APPDATA%\Akash Browser\data\profiles.db`

**Build failures**

- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear build cache: `rm -rf build dist`

## Performance Tips

- Limit number of concurrent browser instances
- Use proxies with good connection speeds
- Keep fingerprints realistic
- Monitor system memory usage

## License

MIT

## Support

For issues and feature requests, please create an issue in the repository.

---

**Made with ❤️ for browser automation professionals**
# AkashBrowser

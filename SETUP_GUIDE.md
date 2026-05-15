# 🚀 Akash Browser - Complete Setup Guide

## Quick Start

### Windows

```bash
npm install
setup.bat
npm start
```

### macOS/Linux

```bash
npm install
chmod +x setup.sh
./setup.sh
npm start
```

---

## System Requirements

- **OS**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 18.04+)
- **Node.js**: 16.0 or higher
- **npm**: 7.0 or higher
- **RAM**: 2GB minimum (4GB recommended)
- **Disk Space**: 500MB free space
- **Chrome**: Google Chrome must be installed

### Installation Steps

#### Step 1: Install Node.js

**Windows & macOS:**

- Download from https://nodejs.org/ (LTS version recommended)
- Run the installer and follow the prompts
- Verify installation: `node --version` and `npm --version`

**Linux (Ubuntu/Debian):**

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Step 2: Install Google Chrome

**Windows:**

- Download from https://www.google.com/chrome/
- Run installer and follow prompts
- Default location: `C:\Program Files\Google\Chrome\Application\chrome.exe`

**macOS:**

```bash
brew install google-chrome
```

**Linux:**

```bash
sudo apt-get install google-chrome-stable
```

#### Step 3: Clone/Setup Repository

```bash
cd C:\Users\[YourUsername]\Desktop
git clone <repository-url> AkashBrowser
cd AkashBrowser
```

#### Step 4: Install Dependencies

```bash
npm install
```

This will install:

- React 18
- Electron 26
- Tailwind CSS 3
- SQLite3 database
- Framer Motion animations
- Lucide React icons

#### Step 5: Configure Environment

1. Copy `.env.example` to `.env`:

```bash
cp .env.example .env  # macOS/Linux
copy .env.example .env  # Windows
```

2. Edit `.env` with your settings (optional):

```env
DEBUG=false
CHROME_PATH=
LOG_LEVEL=info
```

#### Step 6: Run Setup Script

**Windows:**

```bash
setup.bat
```

**macOS/Linux:**

```bash
chmod +x setup.sh
./setup.sh
```

This script will:

- Verify Node.js installation
- Install dependencies
- Detect Chrome installation
- Show setup status

---

## Development

### Start Development Server

```bash
npm start
```

This command:

- Starts React dev server on `http://localhost:3000`
- Waits for React to be ready
- Launches Electron app automatically
- Opens DevTools for debugging

### Available Scripts

```bash
# Start development
npm start

# Build React app only
npm run react-build

# Build Electron app
npm run electron-build

# Full production build
npm run build

# Eject configuration (not recommended)
npm eject
```

---

## Project Structure

```
AkashBrowser/
├── electron/                 # Electron main process
│   ├── main.js              # App entry point
│   └── preload.js           # Context isolation bridge
│
├── src/                     # React frontend
│   ├── components/
│   │   ├── Sidebar.js       # Navigation sidebar
│   │   ├── Toolbar.js       # Top toolbar
│   │   ├── ProfileCard.js   # Profile display card
│   │   ├── ProfileModal.js  # Create profile dialog
│   │   ├── SettingsModal.js # Settings dialog
│   │   └── Toast.js         # Notifications
│   ├── pages/
│   │   └── Dashboard.js     # Main dashboard
│   ├── hooks/
│   │   ├── useProfiles.js   # Profile management
│   │   ├── useBrowser.js    # Browser control
│   │   └── useToast.js      # Notifications
│   ├── App.js               # Main component
│   ├── index.js             # React entry
│   └── index.css            # Tailwind + custom styles
│
├── backend/                 # Backend services
│   ├── database/
│   │   └── database.js      # SQLite database layer
│   ├── managers/
│   │   ├── profileManager.js
│   │   ├── browserLauncher.js
│   │   ├── fingerprintManager.js
│   │   └── proxyManager.js
│   └── utils/
│       └── logger.js        # Logging utility
│
├── public/                  # Static files
│   └── index.html          # HTML template
│
├── assets/                 # App assets (icons, etc)
├── package.json            # Dependencies
├── tailwind.config.js      # Tailwind config
├── postcss.config.js       # PostCSS config
├── setup.bat               # Windows setup
├── setup.sh                # macOS/Linux setup
└── README.md               # Documentation
```

---

## Database

### SQLite Location

- **Windows**: `%APPDATA%\Akash Browser\data\profiles.db`
- **macOS**: `~/Library/Application Support/Akash Browser/data/profiles.db`
- **Linux**: `~/.config/Akash Browser/data/profiles.db`

### Database Schema

**Profiles Table**

```sql
CREATE TABLE profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
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
);
```

### Backing Up Profiles

```bash
# Windows
copy "%APPDATA%\Akash Browser\data\profiles.db" backup.db

# macOS/Linux
cp ~/Library/Application\ Support/Akash\ Browser/data/profiles.db backup.db
```

---

## Building for Production

### Windows EXE Build

```bash
npm run build
```

Output:

- `dist/Akash Browser Setup 1.0.0.exe` - Installer
- `dist/Akash Browser 1.0.0.exe` - Portable executable

### Customizing Build

Edit `package.json` build section:

```json
"build": {
  "appId": "com.akashbrowser.app",
  "productName": "Akash Browser",
  "win": {
    "target": ["nsis", "portable"]
  }
}
```

---

## Troubleshooting

### Chrome Not Found

1. Verify Chrome installation
2. Check path: `C:\Program Files\Google\Chrome\Application\chrome.exe`
3. Set environment variable: `CHROME_PATH=...`

### Database Locked Error

- Close all app instances
- Delete `profiles.db` and restart
- Check for stray Chrome processes

### Module Not Found Errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Port 3000 Already in Use

```bash
# Find process using port 3000
netstat -ano | findstr :3000  # Windows
lsof -i :3000                  # macOS/Linux

# Kill process
taskkill /PID <PID> /F         # Windows
kill -9 <PID>                  # macOS/Linux
```

### Electron Won't Start

1. Ensure npm start React server is running
2. Check DevTools for JavaScript errors
3. Clear build cache: `rm -rf build`

---

## Performance Optimization

### Reduce Memory Usage

- Limit concurrent browser instances
- Close unused profiles
- Restart app periodically

### Faster Startup

- Use SSD for profile storage
- Disable extensions in Chrome
- Use lightweight proxy services

### Network Optimization

- Use proxies with good latency
- Enable connection pooling
- Monitor bandwidth usage

---

## Configuration Files

### .env

Environment variables for app configuration

### tailwind.config.js

Tailwind CSS theming and customization

### postcss.config.js

PostCSS plugin configuration

### package.json

Dependencies and build configuration

---

## Security Considerations

1. **Data Storage**: Profiles stored in SQLite with file-level encryption
2. **Process Isolation**: Each Chrome profile in separate user-data-dir
3. **Proxy Security**: Encrypted proxy credentials (recommended)
4. **DevTools**: Disabled in production builds
5. **Node Integration**: Disabled (context isolation enabled)

---

## Next Steps

After setup, you can:

1. **Create First Profile**
   - Click "New Profile" button
   - Enter profile name
   - Optional: Add proxy and user agent

2. **Launch Browser**
   - Click "Launch" on profile card
   - Chrome opens with profile isolation
   - Browser indicator shows running status

3. **Configure Proxies**
   - Edit profile
   - Add proxy (HTTP/HTTPS/SOCKS5)
   - Test proxy connectivity

4. **Manage Fingerprints**
   - Profile fingerprints auto-generated
   - Customize per-profile
   - Apply on browser launch

---

## Getting Help

### Documentation

- See [README.md](./README.md) for full documentation
- Check [package.json](./package.json) for dependencies

### Common Issues

- Verify Chrome installation
- Check database location
- Review logs in `%APPDATA%\Akash Browser\logs\`

### Development

- Enable DEBUG mode in `.env`
- Check browser DevTools (F12)
- Review main process console

---

## Community

- Report issues via GitHub Issues
- Check discussions for common problems
- Share tips and configurations

---

**Happy browsing! 🚀**

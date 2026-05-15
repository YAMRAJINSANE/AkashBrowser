# ⚡ Quick Start Guide - Akash Browser

## 30-Second Setup

### Windows
```bash
cd AkashBrowser
npm install
setup.bat
npm start
```

### macOS/Linux
```bash
cd AkashBrowser
npm install
chmod +x setup.sh && ./setup.sh
npm start
```

---

## What You'll See

1. **Electron App Opens** → React UI loads
2. **Sidebar** → Navigation menu (Dashboard, Profiles, Automation, Fingerprints)
3. **Toolbar** → Search profiles & "New Profile" button
4. **Dashboard** → Empty grid with "No Profiles Yet" message

---

## First Steps

### 1️⃣ Create Your First Profile
- Click **"New Profile"** button in toolbar
- Enter profile name (e.g., "Profile 1")
- Optional: Add proxy and custom user agent
- Click **"Create Profile"**

### 2️⃣ Launch Browser
- Click **"Launch"** on profile card
- Google Chrome opens with profile isolation
- Status badge shows "Active"

### 3️⃣ Close Browser
- Click **"Close"** on running profile card
- Chrome process terminates
- Status returns to "Launch" mode

### 4️⃣ Manage Profiles
- **Edit**: Click pencil icon (future feature)
- **Delete**: Click trash icon + confirm
- **Search**: Type name in search bar to filter

---

## Key Features (Current)

✅ **Profile Management**
- Create, read, delete profiles
- Store in SQLite database
- Search/filter functionality

✅ **Browser Control**
- Launch Chrome with profile isolation
- Close browsers from UI
- View running status

✅ **UI/UX**
- Dark mode theme
- Glass morphism design
- Smooth animations
- Responsive layout

✅ **Sidebar**
- Collapsible navigation
- Theme toggle
- Settings access

---

## File Structure

```
AkashBrowser/
├── electron/
│   ├── main.js          ← Electron app entry
│   └── preload.js       ← IPC bridge
├── src/
│   ├── components/      ← React UI components
│   ├── hooks/          ← Custom React hooks
│   ├── pages/          ← Page components
│   ├── App.js          ← Main React app
│   └── index.css       ← Tailwind styles
├── backend/
│   ├── database/       ← SQLite layer
│   ├── managers/       ← Business logic
│   └── utils/          ← Utilities
├── package.json        ← Dependencies
├── tailwind.config.js  ← CSS config
└── README.md           ← Full docs
```

---

## Common Issues & Fixes

### "Chrome not found"
- Ensure Google Chrome is installed
- Default path: `C:\Program Files\Google\Chrome\Application\chrome.exe`

### "npm install fails"
```bash
rm -rf node_modules package-lock.json
npm install
```

### "Port 3000 already in use"
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :3000
kill -9 <PID>
```

### "App won't launch"
- Check that React server started (wait ~10 seconds)
- Open DevTools: F12
- Check console for errors

---

## Development Commands

```bash
npm start              # Start dev server
npm run react-start    # React only
npm run electron-start # Electron only
npm run build          # Production build
npm run react-build    # React build only
npm run electron-build # Electron build only
```

---

## Next Steps

1. **Create multiple profiles** with different names
2. **Launch profiles** and see Chrome isolation
3. **Add proxies** to profiles (optional)
4. **Explore settings** to customize theme
5. **Read** SETUP_GUIDE.md for advanced configuration

---

## Key Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Q` | Quit app |
| `Ctrl+R` | Reload page |
| `F11` | Fullscreen |
| `F12` | DevTools |

---

## Database Location

- **Windows**: `%APPDATA%\Akash Browser\data\profiles.db`
- **macOS**: `~/Library/Application Support/Akash Browser/data/profiles.db`
- **Linux**: `~/.config/Akash Browser/data/profiles.db`

Profiles stored in SQLite with:
- Profile name
- Profile path
- Proxy config
- Created/updated timestamps

---

## System Requirements

- **Node.js**: 16+
- **npm**: 7+
- **Chrome**: Latest stable
- **RAM**: 2GB+
- **Disk**: 500MB free

---

## Architecture Overview

```
┌─────────────────────────────────────────┐
│     Electron Main Process (Node.js)    │
│  ┌─────────────┬──────────────────────┐│
│  │ Database    │ ProfileManager       ││
│  │ SQLite      │ BrowserLauncher      ││
│  └─────────────┴──────────────────────┘│
└──────────────┬──────────────────────────┘
               │ IPC
┌──────────────▼──────────────────────────┐
│   Electron Renderer Process (React)    │
│  ┌─────────────┬──────────────────────┐│
│  │ Components  │ Custom Hooks         ││
│  │ Tailwind    │ useProfiles/Browser  ││
│  └─────────────┴──────────────────────┘│
└──────────────────────────────────────────┘
```

---

## Security & Privacy

✅ **Context Isolation** - Main and renderer processes separated
✅ **Process Isolation** - Each profile launches in separate Chrome process
✅ **File System** - Profiles stored in user AppData (OS-protected)
✅ **No Remote Execution** - Node integration disabled

---

## Performance Tips

1. **Don't launch too many browsers** at once (max 3-5)
2. **Close unused profiles** to free memory
3. **Use good proxies** for fast connections
4. **Keep profiles clean** - delete old ones regularly

---

## Ready? Let's Go! 🚀

```bash
npm start
```

Your Akash Browser will open in ~5-10 seconds.

**Happy browsing!** 💻

---

## Need Help?

- 📖 See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed setup
- 🏗️ See [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details
- 📚 See [README.md](./README.md) for full documentation

---

**Built with Electron + React + Tailwind CSS** ⚡

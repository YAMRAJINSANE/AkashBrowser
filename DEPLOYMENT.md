# 📦 Production Deployment Guide

## Pre-Deployment Checklist

- [ ] All features tested locally
- [ ] No console errors in DevTools
- [ ] Database properly initialized
- [ ] Chrome path auto-detected
- [ ] All dependencies installed
- [ ] Build files cleaned
- [ ] Version number updated

---

## Building for Windows

### 1. Update Version

Edit `package.json`:
```json
{
  "version": "1.0.0"
}
```

### 2. Prepare Build

```bash
# Clean previous builds
rm -rf build dist

# Build React app
npm run react-build

# This creates optimized production build in 'build/' folder
```

### 3. Build Electron App

```bash
npm run electron-build
```

Output files:
- `dist/Akash Browser Setup 1.0.0.exe` - Installer (NSIS)
- `dist/Akash Browser 1.0.0.exe` - Portable executable
- `dist/builder-effective-config.yaml` - Build config

### 4. Verify Build

```bash
# Test portable EXE
dist/Akash Browser 1.0.0.exe

# Test installer
dist/Akash Browser Setup 1.0.0.exe
```

---

## Customization Options

### Change App Icon

1. Create 512x512 PNG icon: `assets/icon.png`
2. Electron-builder auto-converts to `.ico`
3. Rebuild: `npm run electron-build`

### Customize Installer

Edit `package.json` build section:

```json
{
  "build": {
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true,
      "shortcutName": "Akash Browser"
    }
  }
}
```

### Change Product Name

Edit `package.json`:
```json
{
  "build": {
    "productName": "Your App Name",
    "appId": "com.yourcompany.appname"
  }
}
```

---

## Release Strategy

### Version Naming
Use semantic versioning: `MAJOR.MINOR.PATCH`
- `1.0.0` - Initial release
- `1.1.0` - New features
- `1.0.1` - Bug fixes

### Release Checklist

1. **Update version** in `package.json`
2. **Update changelog** (optional)
3. **Test build** in clean environment
4. **Create git tag**: `git tag v1.0.0`
5. **Upload builds** to release server
6. **Announce release**

### Auto-Updates

Configure in main.js:
```javascript
const { autoUpdater } = require('electron-updater');

if (!isDev) {
  autoUpdater.checkForUpdatesAndNotify();
}
```

---

## Performance Optimization

### Electron Optimization

```javascript
// main.js - Already configured
app.commandLine.appendSwitch('enable-features', 'V8CodeCache');
app.commandLine.appendSwitch('enable-blink-features', 'WebComponents2');
```

### React Optimization

- Code splitting (lazy loading)
- React.memo for components
- useCallback for event handlers
- Image optimization

### Database Optimization

- Indexes on frequently queried fields
- Connection pooling
- Query batching

---

## Security Hardening

### Production Config

```javascript
// Disable DevTools in production
if (!isDev) {
  mainWindow.webContents.openDevTools = () => {};
}
```

### Environment Variables

```bash
# .env.production
DEBUG=false
LOG_LEVEL=warn
NODE_ENV=production
```

### Code Signing (Windows)

For code signing, set environment variables before build:

```batch
set CSC_KEY_PASSWORD=your_password
set CSC_LINK=path/to/certificate.pfx
npm run electron-build
```

---

## Distribution Methods

### Method 1: Installer (Recommended)

```bash
# Users download and run setup.exe
# App installs to Program Files
# Creates Start Menu shortcuts
```

### Method 2: Portable Executable

```bash
# Users download .exe
# No installation required
# Run directly from USB or network
```

### Method 3: Enterprise Distribution

```bash
# Deploy via Group Policy (Windows)
# Deploy via MDM (Mobile Device Management)
# Custom installer automation
```

---

## Troubleshooting Build Issues

### "Code signing failed"

```bash
# Skip code signing for test builds
unset CSC_LINK
unset CSC_KEY_PASSWORD
npm run electron-build
```

### "Build size too large"

Check included files in `package.json` build section:
```json
{
  "files": [
    "build/**/*",
    "node_modules/**/*",
    "!node_modules/electron-*"
  ]
}
```

### "Dependencies missing in build"

```bash
# Rebuild native modules
npm rebuild sqlite3
npm run electron-build
```

---

## Performance Metrics

After deploying, monitor:

| Metric | Target | Actual |
|--------|--------|--------|
| App startup | < 5s | - |
| Profile load | < 1s | - |
| Browser launch | < 3s | - |
| Memory usage | < 300MB | - |
| Disk space | < 100MB | - |

---

## Monitoring & Support

### Crash Reporting

Implement Sentry or similar:
```javascript
import * as Sentry from "@sentry/electron";

Sentry.init({
  dsn: "your-sentry-dsn"
});
```

### User Feedback

- In-app feedback form
- Error reporting
- Feature requests

### Analytics

Track:
- App usage
- Feature adoption
- Performance metrics
- Error rates

---

## Rollback Plan

If issues detected post-release:

1. **Don't push updates**
2. **Investigate issue** locally
3. **Create patch** (e.g., 1.0.1)
4. **Test thoroughly**
5. **Release patch** with fix
6. **Document** what went wrong

---

## Long-Term Maintenance

### Regular Updates

- Security patches: ASAP
- Bug fixes: Monthly
- Features: Quarterly
- Major releases: Yearly

### Support Timeline

- Active support: 1 year
- Security patches: 2 years
- End of life: Notify users 3 months prior

---

## Deployment Checklist

### Pre-Release
- [ ] All tests passing
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Documentation updated
- [ ] Changelog prepared
- [ ] Screenshots/videos updated

### Release
- [ ] Build created successfully
- [ ] Portable EXE tested
- [ ] Installer tested
- [ ] File size documented
- [ ] Hash/signature verified
- [ ] Upload to server
- [ ] URL/download links working

### Post-Release
- [ ] Announce to users
- [ ] Monitor error reports
- [ ] Check download metrics
- [ ] Gather user feedback
- [ ] Plan next release

---

## Final Notes

- Keep builds backward compatible when possible
- Test on clean Windows installations
- Document breaking changes clearly
- Provide clear upgrade instructions
- Maintain security updates priority

---

**Your Akash Browser is ready for the world!** 🚀

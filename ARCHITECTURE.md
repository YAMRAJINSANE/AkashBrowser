# Architecture Guide

## System Architecture

```
┌─────────────────────────────────────────────────┐
│         Electron Main Process (Node.js)         │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  main.js - App Lifecycle Manager         │  │
│  │  - Window management                     │  │
│  │  - IPC routing                           │  │
│  │  - Menu setup                            │  │
│  └──────────────────────────────────────────┘  │
│                     │                           │
│  ┌──────────────┬───▼────────────┬────────────┐ │
│  │              │                │            │ │
│  ▼              ▼                ▼            ▼ │
│ Database    ProfileManager  BrowserLauncher  ... │
│ (SQLite)    (Logic)         (Chrome Control)    │
└─────────────────────────────────────────────────┘
         │              │              │
         │ IPC          │ IPC          │ IPC
         │              │              │
┌────────▼──────────────▼──────────────▼─────────────┐
│       Electron Renderer Process (React)            │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │          React App (App.js)                  │ │
│  │  - State Management                          │ │
│  │  - UI Rendering                              │ │
│  └──────────────────────────────────────────────┘ │
│                     │                             │
│  ┌──────────────────▼──────────────────────────┐ │
│  │       Custom Hooks (useProfiles, etc)       │ │
│  │  - Handle IPC calls                         │ │
│  │  - Manage component state                   │ │
│  └──────────────────────────────────────────────┘ │
│                     │                             │
│  ┌──────────────────▼──────────────────────────┐ │
│  │         React Components                    │ │
│  │  - Sidebar, Toolbar, Cards, Modals         │ │
│  └──────────────────────────────────────────────┘ │
│                     │                             │
│  ┌──────────────────▼──────────────────────────┐ │
│  │        Tailwind CSS Styling                 │ │
│  └──────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────┘
```

## Data Flow

### Profile Creation Flow

```
1. User clicks "New Profile" button
   ↓
2. ProfileModal component opens
   ↓
3. User fills form and clicks "Create"
   ↓
4. React calls: window.electronAPI.createProfile(data)
   ↓
5. Preload.js forwards to main process via IPC
   ↓
6. main.js 'create-profile' handler invoked
   ↓
7. ProfileManager.createProfile() called
   ↓
8. Database.createProfile() writes to SQLite
   ↓
9. Profile ID returned back through IPC chain
   ↓
10. React updates state with new profile
    ↓
11. Dashboard re-renders with new profile card
```

### Browser Launch Flow

```
1. User clicks "Launch" on profile card
   ↓
2. onLaunchBrowser() hook called
   ↓
3. window.electronAPI.launchBrowser(profileId)
   ↓
4. IPC reaches main.js 'launch-browser' handler
   ↓
5. Profile fetched from database
   ↓
6. BrowserLauncher.launch(profileId, profile) called
   ↓
7. Chrome spawned with:
   - --user-data-dir={profilePath}
   - --proxy-server={proxy}
   - Other security flags
   ↓
8. Process tracked in BrowserLauncher.processes Map
   ↓
9. Process ID returned to React
   ↓
10. UI updated with "Running" status
    ↓
11. Chrome window opens with isolated profile
```

## Module Responsibilities

### Frontend (React)

**App.js**

- Main component orchestrator
- State initialization
- Dark/light mode toggle

**Hooks**

- `useProfiles`: Profile CRUD operations
- `useBrowser`: Browser process control
- `useToast`: Notification management

**Components**

- `Sidebar`: Navigation and menu
- `Toolbar`: Search and action bar
- `ProfileCard`: Profile display
- `ProfileModal`: Create/edit profile
- `SettingsModal`: App settings
- `Toast`: Notifications

### Backend (Node.js)

**Database Layer**

- SQLite connection management
- Query execution
- Data persistence
- Migration handling

**Profile Manager**

- Profile business logic
- Validation
- Path generation
- Metadata management

**Browser Launcher**

- Chrome detection
- Process spawning
- Process tracking
- Signal handling

**Fingerprint Manager**

- Fingerprint generation
- Randomization logic
- UA parsing

**Proxy Manager**

- Proxy validation
- Connection testing
- Format parsing

### Electron Main Process

**main.js**

- IPC handler registration
- App lifecycle
- Window management
- Menu creation
- Error handling

**preload.js**

- Context bridge setup
- API exposure
- Security layer

---

## IPC Communication Protocol

### Handler Pattern

```javascript
// Main process
ipcMain.handle("operation-name", async (event, param1, param2) => {
  try {
    const result = await doSomething(param1, param2);
    return result;
  } catch (error) {
    throw error; // Sent to renderer
  }
});

// Renderer process (via preload)
const result = await window.electronAPI.operationName(param1, param2);
```

### Response Format

```javascript
{
  success: boolean,
  data: any,
  error: string | null
}
```

---

## Database Design

### Relationships

```
profiles (1) ──────── (N) browserProcesses
  id                    profileId

profiles (1) ──────── (1) fingerprints
  id                    profileId
```

### Normalization

- All tables in 3NF
- Foreign key constraints
- Indexes on frequent queries

---

## Process Management

### Chrome Process Lifecycle

```
1. Profile created (no process)
   ↓
2. Launch button clicked
   ↓
3. Child process spawned
   ↓
4. Process tracked in memory
   ↓
5. Browser window opens
   ↓
6. User closes browser or app
   ↓
7. Process terminated
   ↓
8. Entry removed from tracking
```

### Cleanup Handlers

```javascript
- Process.on('exit'): Clean up on normal exit
- Process.on('SIGTERM'): Handle termination
- App.on('before-quit'): Kill all browser processes
```

---

## Security Architecture

### Context Isolation

- Main process separate from renderer
- No direct `require()` in renderer
- Preload script acts as gateway

### API Surface Exposed

```javascript
window.electronAPI = {
  // Profile operations
  getProfiles(),
  createProfile(data),
  updateProfile(id, data),
  deleteProfile(id),

  // Browser operations
  launchBrowser(profileId),
  closeBrowser(profileId),
  getBrowserStatus(profileId),

  // Listeners
  onProfileCreated(callback),
  onProfileDeleted(callback),
  onBrowserStatusChanged(callback)
}
```

### File System Access

- Database in user AppData (OS-protected)
- Chrome profiles isolated directories
- Logs in dedicated folder

---

## Error Handling

### Error Propagation

```
Backend Error → IPC Error → React Error Handler → UI Notification
```

### Error Types

1. **Database Errors**: Query failures, constraints
2. **File System Errors**: Permission, path issues
3. **Process Errors**: Chrome not found, spawn failures
4. **IPC Errors**: Timeout, disconnection
5. **Validation Errors**: Invalid input data

### Recovery Strategies

- Retry logic for transient errors
- Graceful degradation
- User notifications
- Logging for debugging

---

## Performance Considerations

### Memory Management

- Process map cleaned on exit
- Event listeners removed
- Database connections pooled

### Database Performance

- Indexes on `id`, `name`, `createdAt`
- Lazy loading of profiles
- Pagination for large lists

### UI Rendering

- React.memo for ProfileCard
- useCallback for event handlers
- AnimatePresence for efficient animations

---

## Scalability Path

### Current Limitations

- Single process database
- In-memory process tracking
- SQLite for local storage

### Future Enhancements

1. Cloud sync (profiles to server)
2. Team collaboration
3. Advanced automation engine
4. Plugin system
5. Distributed process management

---

## Testing Strategy

### Unit Tests

- Managers: Logic validation
- Hooks: State management
- Utils: Helper functions

### Integration Tests

- IPC communication
- Database operations
- Browser launching

### E2E Tests

- Full profile lifecycle
- Browser automation
- UI interactions

---

## Deployment Model

### Desktop App

- Electron packaged as standalone exe
- Auto-updates via electron-builder
- Self-contained dependencies

### Update Flow

1. Check for updates
2. Download update package
3. Prompt user
4. Install on next launch
5. Restart application

---

## Debugging

### Enable Debug Mode

```env
DEBUG=true
LOG_LEVEL=debug
```

### Access Points

1. **DevTools**: F12 in electron app
2. **Main Process**: DevTools for Node
3. **Database**: SQLite browser tools
4. **Logs**: `%APPDATA%\Akash Browser\logs\`

### Debug Commands

```javascript
// In React components
console.log(); // DevTools console

// In main process
console.log(); // Terminal output

// Database
this.db.all(); // Raw query execution
```

---

This architecture ensures:

- ✅ Security through process isolation
- ✅ Maintainability with clear separation of concerns
- ✅ Scalability for future features
- ✅ Performance through optimized data flow
- ✅ Reliability with comprehensive error handling

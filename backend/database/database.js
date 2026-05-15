const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const { app } = require("electron");
const fs = require("fs");

class Database {
  constructor() {
    const dbDir = path.join(app.getPath("userData"), "data");
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    this.dbPath = path.join(dbDir, "profiles.db");
    this.db = null;
  }

  init() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) reject(err);
        else {
          this.createTables();
          resolve();
        }
      });
    });
  }

  createTables() {
    this.db.serialize(() => {
      // Profiles table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS profiles (
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
        )
      `);

      // Browser processes table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS browserProcesses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          profileId INTEGER NOT NULL,
          pid INTEGER,
          status TEXT,
          launchedAt DATETIME,
          FOREIGN KEY (profileId) REFERENCES profiles(id)
        )
      `);

      // Fingerprints table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS fingerprints (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      `);
    });
  }

  // Profile queries
  getAllProfiles() {
    return new Promise((resolve, reject) => {
      this.db.all(
        `
        SELECT * FROM profiles ORDER BY createdAt DESC
      `,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        },
      );
    });
  }

  getProfile(id) {
    return new Promise((resolve, reject) => {
      this.db.get(
        `
        SELECT * FROM profiles WHERE id = ?
      `,
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        },
      );
    });
  }

  createProfile(profileData) {
    return new Promise((resolve, reject) => {
      const { name, profilePath, proxy, proxyType } = profileData;
      this.db.run(
        `
        INSERT INTO profiles (name, profilePath, proxy, proxyType)
        VALUES (?, ?, ?, ?)
      `,
        [name, profilePath, proxy || null, proxyType || null],
        function (err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, ...profileData });
        },
      );
    });
  }

  updateProfile(id, profileData) {
    return new Promise((resolve, reject) => {
      const fields = Object.keys(profileData)
        .map((key) => `${key} = ?`)
        .join(", ");
      const values = Object.values(profileData);
      values.push(id);

      this.db.run(
        `
        UPDATE profiles SET ${fields}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?
      `,
        values,
        (err) => {
          if (err) reject(err);
          else resolve({ id, ...profileData });
        },
      );
    });
  }

  deleteProfile(id) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `
        DELETE FROM profiles WHERE id = ?
      `,
        [id],
        (err) => {
          if (err) reject(err);
          else resolve({ success: true });
        },
      );
    });
  }

  // Browser process queries
  createBrowserProcess(profileId, pid) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `
        INSERT INTO browserProcesses (profileId, pid, status, launchedAt)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      `,
        [profileId, pid, "running"],
        function (err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, profileId, pid, status: "running" });
        },
      );
    });
  }

  getBrowserProcess(profileId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        `
        SELECT * FROM browserProcesses WHERE profileId = ? ORDER BY launchedAt DESC LIMIT 1
      `,
        [profileId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        },
      );
    });
  }

  updateBrowserProcessStatus(id, status) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `
        UPDATE browserProcesses SET status = ? WHERE id = ?
      `,
        [status, id],
        (err) => {
          if (err) reject(err);
          else resolve({ success: true });
        },
      );
    });
  }

  // Fingerprint queries
  getFingerprint(profileId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        `
        SELECT * FROM fingerprints WHERE profileId = ?
      `,
        [profileId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        },
      );
    });
  }

  saveFingerprint(profileId, fingerprintData) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `
        INSERT OR REPLACE INTO fingerprints (profileId, userAgent, screenResolution, timezone, language, webglVendor, webglRenderer, hardwareConcurrency, deviceMemory)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          profileId,
          fingerprintData.userAgent,
          fingerprintData.screenResolution,
          fingerprintData.timezone,
          fingerprintData.language,
          fingerprintData.webglVendor,
          fingerprintData.webglRenderer,
          fingerprintData.hardwareConcurrency,
          fingerprintData.deviceMemory,
        ],
        function (err) {
          if (err) reject(err);
          else resolve({ success: true });
        },
      );
    });
  }
}

module.exports = Database;

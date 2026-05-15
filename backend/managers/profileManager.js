const path = require("path");
const os = require("os");

class ProfileManager {
  constructor(db) {
    this.db = db;
  }

  async getAllProfiles() {
    try {
      const profiles = await this.db.getAllProfiles();
      return profiles.map((profile) => ({
        ...profile,
        createdAt: new Date(profile.createdAt).toISOString(),
        updatedAt: new Date(profile.updatedAt).toISOString(),
      }));
    } catch (error) {
      console.error("Error fetching profiles:", error);
      throw error;
    }
  }

  async getProfile(id) {
    try {
      return await this.db.getProfile(id);
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw error;
    }
  }

  async createProfile(profileData) {
    try {
      const { name, proxy, proxyType } = profileData;
      const appDataPath =
        process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming");
      const profilePath = path.join(
        appDataPath,
        "Akash Browser",
        "profiles",
        name,
      );

      const profile = await this.db.createProfile({
        name,
        profilePath,
        proxy,
        proxyType,
        userAgent: profileData.userAgent || null,
        screenSize: profileData.screenSize || null,
        timezone: profileData.timezone || null,
        language: profileData.language || null,
        platform: profileData.platform || null,
      });

      return profile;
    } catch (error) {
      console.error("Error creating profile:", error);
      throw error;
    }
  }

  async updateProfile(id, profileData) {
    try {
      return await this.db.updateProfile(id, profileData);
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  }

  async deleteProfile(id) {
    try {
      return await this.db.deleteProfile(id);
    } catch (error) {
      console.error("Error deleting profile:", error);
      throw error;
    }
  }

  async renameProfile(id, newName) {
    try {
      return await this.db.updateProfile(id, { name: newName });
    } catch (error) {
      console.error("Error renaming profile:", error);
      throw error;
    }
  }

  async updateProxy(id, proxy, proxyType) {
    try {
      return await this.db.updateProfile(id, { proxy, proxyType });
    } catch (error) {
      console.error("Error updating proxy:", error);
      throw error;
    }
  }

  async testProxy(proxy, proxyType) {
    try {
      // Implement proxy testing logic
      // For now, just return success
      return { success: true, proxy, proxyType };
    } catch (error) {
      console.error("Error testing proxy:", error);
      throw error;
    }
  }
}

module.exports = ProfileManager;

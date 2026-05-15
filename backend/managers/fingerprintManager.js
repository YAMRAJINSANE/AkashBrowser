class FingerprintManager {
  constructor() {
    this.userAgents = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    ];

    this.timezones = [
      "America/New_York",
      "America/Chicago",
      "America/Denver",
      "America/Los_Angeles",
      "Europe/London",
      "Europe/Paris",
      "Europe/Berlin",
      "Asia/Tokyo",
      "Asia/Shanghai",
      "Asia/Hong_Kong",
      "Australia/Sydney",
    ];

    this.languages = [
      "en-US",
      "en-GB",
      "de-DE",
      "fr-FR",
      "it-IT",
      "es-ES",
      "ja-JP",
      "zh-CN",
      "ko-KR",
    ];

    this.screenResolutions = [
      "1920x1080",
      "1366x768",
      "1440x900",
      "1536x864",
      "2560x1440",
      "1280x720",
      "1680x1050",
      "2560x1600",
    ];
  }

  generateFingerprint() {
    return {
      userAgent: this.getRandomItem(this.userAgents),
      screenResolution: this.getRandomItem(this.screenResolutions),
      timezone: this.getRandomItem(this.timezones),
      language: this.getRandomItem(this.languages),
      webglVendor: "Intel Inc.",
      webglRenderer: "Intel Iris Graphics 550",
      hardwareConcurrency: this.getRandomInt(2, 8),
      deviceMemory: this.getRandomInt(4, 16),
      platform: "Win32",
    };
  }

  getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  validateFingerprint(fingerprint) {
    const required = ["userAgent", "screenResolution", "timezone", "language"];
    return required.every((field) => fingerprint[field]);
  }
}

module.exports = FingerprintManager;

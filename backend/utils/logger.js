const fs = require("fs");
const path = require("path");
const { app } = require("electron");

class Logger {
  constructor() {
    this.logDir = path.join(app.getPath("userData"), "logs");
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
    this.logFile = path.join(
      this.logDir,
      `app-${new Date().toISOString().split("T")[0]}.log`,
    );
  }

  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}${data ? " " + JSON.stringify(data) : ""}\n`;

    // Console output
    console[level === "error" ? "error" : level === "warn" ? "warn" : "log"](
      logEntry,
    );

    // File output
    fs.appendFileSync(this.logFile, logEntry);
  }

  info(message, data) {
    this.log("info", message, data);
  }

  warn(message, data) {
    this.log("warn", message, data);
  }

  error(message, data) {
    this.log("error", message, data);
  }

  debug(message, data) {
    if (process.env.DEBUG === "true") {
      this.log("debug", message, data);
    }
  }
}

module.exports = new Logger();

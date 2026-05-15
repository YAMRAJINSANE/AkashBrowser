const http = require("http");
const https = require("https");
const { SocksClient } = require("socks");

class ProxyManager {
  async testProxy(proxyUrl, proxyType = "http") {
    try {
      const startTime = Date.now();

      if (proxyType === "socks5") {
        return await this.testSocks5Proxy(proxyUrl);
      } else {
        return await this.testHttpProxy(proxyUrl);
      }
    } catch (error) {
      console.error("Proxy test error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  testHttpProxy(proxyUrl) {
    return new Promise((resolve) => {
      const [host, port] = proxyUrl.split(":");
      const options = {
        host: host,
        port: parseInt(port),
        method: "HEAD",
        path: "http://www.google.com/",
        timeout: 5000,
      };

      const startTime = Date.now();
      const request = http.request(options, (response) => {
        const latency = Date.now() - startTime;
        resolve({
          success: true,
          proxy: proxyUrl,
          latency,
          statusCode: response.statusCode,
        });
        request.destroy();
      });

      request.on("error", (error) => {
        resolve({
          success: false,
          proxy: proxyUrl,
          error: error.message,
        });
      });

      request.on("timeout", () => {
        request.destroy();
        resolve({
          success: false,
          proxy: proxyUrl,
          error: "Timeout",
        });
      });

      request.end();
    });
  }

  testSocks5Proxy(proxyUrl) {
    return new Promise((resolve) => {
      const [host, port] = proxyUrl.split(":");
      const startTime = Date.now();

      SocksClient.createConnection(
        {
          proxy: {
            host,
            port: parseInt(port),
            type: 5,
          },
          target: {
            host: "www.google.com",
            port: 80,
          },
          timeout: 5000,
        },
        (error, socket) => {
          if (error) {
            resolve({
              success: false,
              proxy: proxyUrl,
              error: error.message,
            });
          } else {
            const latency = Date.now() - startTime;
            socket.destroy();
            resolve({
              success: true,
              proxy: proxyUrl,
              latency,
              type: "socks5",
            });
          }
        },
      );
    });
  }

  parseProxy(proxyString) {
    // Parse proxy format: "http://user:pass@host:port" or "host:port"
    try {
      if (proxyString.includes("://")) {
        const url = new URL(proxyString);
        return {
          protocol: url.protocol.replace(":", ""),
          username: url.username || null,
          password: url.password || null,
          host: url.hostname,
          port: url.port,
        };
      } else {
        const [host, port] = proxyString.split(":");
        return {
          protocol: "http",
          host,
          port: parseInt(port),
          username: null,
          password: null,
        };
      }
    } catch (error) {
      throw new Error("Invalid proxy format");
    }
  }
}

module.exports = ProxyManager;

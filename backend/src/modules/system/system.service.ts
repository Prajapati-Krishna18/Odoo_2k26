/**
 * @file    system.service.ts
 * @desc    Service layer for system health diagnostics and version information.
 */

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { prisma } from "../../config/prisma.js";

// Read version details from package.json dynamically
let appVersion = "1.0.0";
try {
  const packageJsonPath = path.resolve(process.cwd(), "package.json");
  const content = fs.readFileSync(packageJsonPath, "utf-8");
  const pkg = JSON.parse(content);
  appVersion = pkg.version || "1.0.0";
} catch {
  appVersion = "1.0.0";
}

export class VersionService {
  static getVersionInfo() {
    return {
      version: appVersion,
      buildDate: new Date().toISOString(), // Mock build date for runtime compile
      environment: process.env["NODE_ENV"] || "development",
    };
  }
}

export class SystemHealthService {
  /**
   * Run diagnostic probes: database ping, CPU metrics, and process statistics.
   */
  static async getHealthCheck() {
    // 1. Check Database connection
    let dbStatus = "UP";
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (err) {
      console.error("❌  Database diagnostic probe failed:", err);
      dbStatus = "DOWN";
    }

    // 2. Fetch System resources
    const freeMemoryBytes = os.freemem();
    const totalMemoryBytes = os.totalmem();
    const memoryUsagePercentage = parseFloat(
      (((totalMemoryBytes - freeMemoryBytes) / totalMemoryBytes) * 100).toFixed(2)
    );

    const cpus = os.cpus();
    const cpuModel = cpus[0]?.model || "Unknown CPU";
    const cpuUsage = os.loadavg(); // Returns load averages [1 min, 5 min, 15 min]

    return {
      status: dbStatus === "UP" ? "HEALTHY" : "UNHEALTHY",
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus,
      },
      process: {
        uptimeSeconds: Math.floor(process.uptime()),
        nodeVersion: process.version,
        memoryUsage: process.memoryUsage(),
      },
      system: {
        platform: process.platform,
        arch: process.arch,
        freeMemoryGB: parseFloat((freeMemoryBytes / 1024 / 1024 / 1024).toFixed(2)),
        totalMemoryGB: parseFloat((totalMemoryBytes / 1024 / 1024 / 1024).toFixed(2)),
        memoryUsagePercent: memoryUsagePercentage,
        cpu: {
          model: cpuModel,
          cores: cpus.length,
          loadAverage1Min: cpuUsage[0],
        },
      },
    };
  }

  static getSystemInfo() {
    return {
      appName: "AssetFlow Enterprise ERP",
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      uptimeSeconds: Math.floor(process.uptime()),
    };
  }
}

/**
 * @file    server.ts
 * @desc    Application entry point.
 *
 *          1. Validates environment variables (via env.ts import).
 *          2. Connects Prisma to the database.
 *          3. Starts the Express HTTP server.
 *          4. Registers graceful shutdown handlers for SIGINT / SIGTERM.
 */

import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";
import app from "./app.js";
import { APP_NAME } from "./constants/app.js";
import { initJobs } from "./jobs/index.js";

// ────────────────────────────────────────────────────────────
// Start server
// ────────────────────────────────────────────────────────────

async function bootstrap(): Promise<void> {
  try {
    // 1 — Connect to the database
    await prisma.$connect();
    console.log("✅  Database connected successfully");

    // Initialize scheduled background jobs
    initJobs();

    // 2 — Start listening
    const server = app.listen(env.PORT, () => {
      console.log(
        `🚀  ${APP_NAME} server running on http://localhost:${env.PORT} [${env.NODE_ENV}]`
      );
    });

    // ──────────────────────────────────────────────────────────
    // Graceful shutdown
    // ──────────────────────────────────────────────────────────

    const shutdown = async (signal: string): Promise<void> => {
      console.log(`\n🛑  Received ${signal}. Shutting down gracefully…`);

      server.close(async () => {
        console.log("   HTTP server closed");

        await prisma.$disconnect();
        console.log("   Database disconnected");

        process.exit(0);
      });

      // Force-exit after 10 s if graceful shutdown stalls
      setTimeout(() => {
        console.error("   ⚠️  Forced shutdown after timeout");
        process.exit(1);
      }, 10_000);
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("❌  Failed to start server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

bootstrap();

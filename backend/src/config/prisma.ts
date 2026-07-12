/**
 * @file    prisma.ts
 * @desc    Singleton PrismaClient instance using Prisma 7 driver adapter.
 *
 *          In development, the client is cached on `globalThis` so that
 *          hot-reloads (tsx watch / nodemon) do not create multiple connections.
 *
 *          Prisma 7 requires a driver adapter (e.g. @prisma/adapter-pg)
 *          instead of the legacy `datasourceUrl` option.
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "./env.js";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

  return new PrismaClient({
    adapter,
    log: env.isDevelopment ? ["query", "info", "warn", "error"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (env.isDevelopment) {
  globalForPrisma.prisma = prisma;
}

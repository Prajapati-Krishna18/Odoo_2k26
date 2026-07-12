/**
 * @file    seed.ts
 * @desc    Prisma database seed script.
 *
 *          Creates default roles for RBAC system.
 *          Idempotent — safe to run multiple times.
 *
 *          Usage:  npx prisma db seed
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";
import path from "node:path";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const DATABASE_URL = process.env["DATABASE_URL"];
if (!DATABASE_URL) {
  console.error("❌  DATABASE_URL is not set");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ────────────────────────────────────────────────────────────
// Seed data
// ────────────────────────────────────────────────────────────

const ROLES = ["ADMIN", "EMPLOYEE", "ASSET_MANAGER", "IT_MANAGER", "AUDITOR"];

async function main(): Promise<void> {
  console.log("🌱  Seeding database roles...\n");

  // Upsert roles - idempotent operation
  for (const roleName of ROLES) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
    console.log(`   ✅  Role: ${roleName}`);
  }

  console.log("\n🎉  Role seeding complete!");
}

main()
  .catch((error) => {
    console.error("❌  Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

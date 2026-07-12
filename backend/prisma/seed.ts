/**
 * @file    seed.ts
 * @desc    Prisma database seed script.
 *
 *          Creates the four default roles and one admin user.
 *          Idempotent — safe to run multiple times.
 *
 *          Usage:  npx prisma db seed
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";
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

const ROLES = ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD", "EMPLOYEE"];

const ADMIN_USER = {
  fullName: "System Admin",
  email: "admin@assetflow.com",
  password: "Admin@123",
  phone: "0000000000",
};

async function main(): Promise<void> {
  console.log("🌱  Seeding database...\n");

  // 1 — Upsert roles
  for (const roleName of ROLES) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
    console.log(`   ✅  Role: ${roleName}`);
  }

  // 2 — Upsert admin user
  const adminRole = await prisma.role.findUnique({
    where: { name: "ADMIN" },
  });

  if (!adminRole) {
    throw new Error("ADMIN role not found after seeding");
  }

  const hashedPassword = await bcrypt.hash(ADMIN_USER.password, 12);

  await prisma.user.upsert({
    where: { email: ADMIN_USER.email },
    update: {},
    create: {
      fullName: ADMIN_USER.fullName,
      email: ADMIN_USER.email,
      password: hashedPassword,
      phone: ADMIN_USER.phone,
      roleId: adminRole.id,
      isActive: true,
      emailVerified: true,
    },
  });
  console.log(`   ✅  Admin: ${ADMIN_USER.email}\n`);

  console.log("🎉  Seeding complete!");
}

main()
  .catch((error) => {
    console.error("❌  Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

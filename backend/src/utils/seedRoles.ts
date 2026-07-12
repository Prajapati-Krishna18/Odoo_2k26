/**
 * @file    seedRoles.ts
 * @desc    Utility to seed default roles on application startup.
 *          Idempotent - safe to call multiple times.
 */

import { prisma } from "../config/prisma.js";

const DEFAULT_ROLES = ["ADMIN", "EMPLOYEE", "ASSET_MANAGER", "IT_MANAGER", "AUDITOR"];

export async function seedDefaultRoles(): Promise<void> {
  try {
    for (const roleName of DEFAULT_ROLES) {
      await prisma.role.upsert({
        where: { name: roleName },
        update: {},
        create: { name: roleName },
      });
    }
    console.log("✅  Default roles verified/seeded successfully");
  } catch (error) {
    console.error("❌  Failed to seed default roles:", error);
    throw error;
  }
}

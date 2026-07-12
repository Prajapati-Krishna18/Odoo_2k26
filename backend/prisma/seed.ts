/**
 * @file    seed.ts
 * @desc    Prisma database seed script.
 *          Creates roles, the default Admin user, permissions mapping, and default settings.
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

// ── Seed Constants ────────────────────────────────────────────

const ROLES = ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD", "EMPLOYEE"];

const ADMIN_USER = {
  fullName: "System Admin",
  email: "admin@assetflow.com",
  password: "Admin@123",
  phone: "0000000000",
  employeeCode: "EMP-ADMIN",
  designation: "System Administrator",
};

const DEFAULT_SETTINGS = {
  companyName: "AssetFlow Corporation",
  companyLogo: null,
  address: "Surat, Gujarat, India",
  timezone: "Asia/Kolkata",
  dateFormat: "YYYY-MM-DD",
  currency: "INR",
  language: "en",
  theme: "dark",
  auditRetentionDays: 90,
  auditLogLevel: "INFO",
  auditEnabledModules: ["AUTH", "DEPARTMENT", "EMPLOYEE"],
};

const PERMISSIONS = [
  "Department.Create",
  "Department.Update",
  "Employee.View",
  "Report.Export",
  "Dashboard.View",
  "Notification.Manage",
];

const ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMIN: PERMISSIONS,
  ASSET_MANAGER: ["Employee.View", "Report.Export", "Dashboard.View", "Notification.Manage"],
  DEPARTMENT_HEAD: ["Employee.View", "Dashboard.View", "Notification.Manage"],
  EMPLOYEE: ["Employee.View", "Notification.Manage"],
};

// ── Main Seed Flow ────────────────────────────────────────────

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

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_USER.email },
    update: {
      employeeCode: ADMIN_USER.employeeCode,
      designation: ADMIN_USER.designation,
      joiningDate: new Date(),
    },
    create: {
      fullName: ADMIN_USER.fullName,
      email: ADMIN_USER.email,
      password: hashedPassword,
      phone: ADMIN_USER.phone,
      roleId: adminRole.id,
      isActive: true,
      emailVerified: true,
      employeeCode: ADMIN_USER.employeeCode,
      designation: ADMIN_USER.designation,
      joiningDate: new Date(),
    },
  });
  console.log(`   ✅  Admin: ${ADMIN_USER.email}`);

  // 3 — Upsert default settings
  const existingSettings = await prisma.systemSetting.findFirst();
  if (!existingSettings) {
    await prisma.systemSetting.create({
      data: DEFAULT_SETTINGS,
    });
    console.log("   ✅  System Settings seeded with defaults");
  } else {
    console.log("   ℹ️   System Settings already exist");
  }

  // 3.5 — Seed default Resources/Assets
  const resourcesToSeed = [
    { name: "Conference Room A", type: "MEETING_ROOM" as const, status: "AVAILABLE" as const, location: "HQ Office - Sector 62", capacity: 12, quantity: 1, description: "Executive conference room with AV equipment" },
    { name: "Ford Transit Van", type: "VEHICLE" as const, status: "AVAILABLE" as const, location: "Warehouse Depot", capacity: 8, quantity: 1, description: "Logistics van for asset transportation" },
    { name: "Logitech Rally Kit", type: "EQUIPMENT" as const, status: "AVAILABLE" as const, location: "HQ Office - Sector 62", quantity: 1, description: "Mobile video conferencing system" },
    { name: "MacBook Pro 16\"", type: "EQUIPMENT" as const, status: "AVAILABLE" as const, location: "IT Support Office", quantity: 10, description: "M3 Max Developer laptops" },
    { name: "Dell UltraSharp 32\"", type: "EQUIPMENT" as const, status: "AVAILABLE" as const, location: "IT Support Office", quantity: 5, description: "4K Color-accurate displays" },
    { name: "iPad Pro 11\"", type: "EQUIPMENT" as const, status: "AVAILABLE" as const, location: "Marketing HQ", quantity: 5, description: "Creative presentation tablets" },
    { name: "FortiGate 100F Firewall", type: "EQUIPMENT" as const, status: "MAINTENANCE" as const, location: "Main Server Room", quantity: 1, description: "Core security gateway" }
  ];

  for (const res of resourcesToSeed) {
    const existingRes = await prisma.resource.findFirst({ where: { name: res.name } });
    if (!existingRes) {
      await prisma.resource.create({ data: res });
      console.log(`   ✅  Resource: ${res.name}`);
    }
  }

  // 4 — Upsert permissions
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { name: perm },
      update: {},
      create: { name: perm },
    });
  }
  console.log(`   ✅  Permissions pre-registered: ${PERMISSIONS.length}`);

  // 5 — Map permissions to roles
  for (const roleName of ROLES) {
    const roleRecord = await prisma.role.findUnique({ where: { name: roleName } });
    if (!roleRecord) continue;

    const allowedPerms = ROLE_PERMISSIONS[roleName] || [];
    for (const permName of allowedPerms) {
      const permRecord = await prisma.permission.findUnique({ where: { name: permName } });
      if (!permRecord) continue;

      // Upsert composition
      const key = {
        roleId: roleRecord.id,
        permissionId: permRecord.id,
      };

      const existingRP = await prisma.rolePermission.findUnique({
        where: {
          roleId_permissionId: key,
        },
      });

      if (!existingRP) {
        await prisma.rolePermission.create({
          data: key,
        });
      }
    }
  }
  console.log("   ✅  Role-Permission matrices configured");

  console.log("\n🎉  Seeding complete!");
}

main()
  .catch((error) => {
    console.error("❌  Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

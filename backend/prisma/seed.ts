/**
 * @file    seed.ts
 * @desc    Prisma database seed script.
 *          Creates the four default roles, one admin user, and dummy assets/bookings/maintenance.
 *          Idempotent — safe to run multiple times.
 */

import { PrismaClient, ResourceType, ResourceStatus, BookingStatus, MaintenanceStatus, Priority } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const DATABASE_URL = process.env["DATABASE_URL"];
if (!DATABASE_URL) {
  console.error("❌  DATABASE_URL is not set");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const ROLES = ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD", "EMPLOYEE"];

const ADMIN_USER = {
  fullName: "System Admin",
  email: "admin@assetflow.com",
  password: "Admin@123",
  phone: "0000000000",
};

async function main(): Promise<void> {
  console.log("🌱  Seeding database with default roles, admin, and dummy data...\n");

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
  console.log(`   ✅  Admin: ${ADMIN_USER.email}`);

  // Create an employee role and user for sample bookings/maintenance
  const employeeRole = await prisma.role.upsert({
    where: { name: "EMPLOYEE" },
    update: {},
    create: { name: "EMPLOYEE" },
  });

  const employeePassword = await bcrypt.hash("Employee@123", 12);
  const employeeUser = await prisma.user.upsert({
    where: { email: "employee@assetflow.com" },
    update: {},
    create: {
      fullName: "John Employee",
      email: "employee@assetflow.com",
      password: employeePassword,
      phone: "1234567890",
      roleId: employeeRole.id,
      isActive: true,
      emailVerified: true,
    },
  });
  console.log(`   ✅  Employee: employee@assetflow.com`);

  // 3 — Upsert resources (Rooms, Vehicles, Equipment)
  const boardroom = await prisma.resource.upsert({
    where: { id: "a1111111-1111-1111-1111-111111111111" },
    update: {},
    create: {
      id: "a1111111-1111-1111-1111-111111111111",
      name: "Boardroom Alpha",
      type: ResourceType.MEETING_ROOM,
      status: ResourceStatus.AVAILABLE,
      description: "Executive boardroom with 4K display, Polycom sound bar, and seating for 16 people.",
      location: "5th Floor, Suite 501",
      capacity: 16,
      quantity: 1,
      imageUrl: "https://images.unsplash.com/photo-1517502884422-41eaaced0168?auto=format&fit=crop&w=800&q=80",
    },
  });

  const huddle = await prisma.resource.upsert({
    where: { id: "a2222222-2222-2222-2222-222222222222" },
    update: {},
    create: {
      id: "a2222222-2222-2222-2222-222222222222",
      name: "Huddle Room Beta",
      type: ResourceType.MEETING_ROOM,
      status: ResourceStatus.AVAILABLE,
      description: "Casual creative space with whiteboards, Apple TV, and seating for 6 people.",
      location: "2nd Floor, West Wing",
      capacity: 6,
      quantity: 1,
      imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
    },
  });

  const tesla = await prisma.resource.upsert({
    where: { id: "a3333333-3333-3333-3333-333333333333" },
    update: {},
    create: {
      id: "a3333333-3333-3333-3333-333333333333",
      name: "Tesla Model Y (Electric)",
      type: ResourceType.VEHICLE,
      status: ResourceStatus.AVAILABLE,
      description: "All-wheel-drive corporate EV. Fully charged, autopilot enabled.",
      location: "Basement Parking B2, Slot 42",
      quantity: 1,
      imageUrl: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=800&q=80",
    },
  });

  const laptop = await prisma.resource.upsert({
    where: { id: "a4444444-4444-4444-4444-444444444444" },
    update: {},
    create: {
      id: "a4444444-4444-4444-4444-444444444444",
      name: "MacBook Pro M3 Max",
      type: ResourceType.EQUIPMENT,
      status: ResourceStatus.AVAILABLE,
      description: "High performance laptops for engineering/design presentations.",
      location: "IT Helpdesk Locker B",
      quantity: 8,
      imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
    },
  });
  console.log("   ✅  Resources seeded: Boardroom Alpha, Huddle Room Beta, Tesla Model Y, MacBook Pro units.");

  // 4 — Seed some sample bookings
  const now = new Date();
  
  // Clean old bookings to keep it fresh
  await prisma.booking.deleteMany({});
  await prisma.maintenanceRequest.deleteMany({});

  const formatOffset = (hours: number) => new Date(now.getTime() + hours * 60 * 60 * 1000);

  // Booking 1: Boardroom Alpha - Approved
  await prisma.booking.create({
    data: {
      resourceId: boardroom.id,
      userId: employeeUser.id,
      title: "Quarterly Planning Sync",
      description: "Review of Q2 deliverables and planning for Q3 expansion.",
      startTime: formatOffset(1),
      endTime: formatOffset(3),
      status: BookingStatus.APPROVED,
      attendeeCount: 12,
      isExclusive: true,
    },
  });

  // Booking 2: Boardroom Alpha - Pending
  await prisma.booking.create({
    data: {
      resourceId: boardroom.id,
      userId: employeeUser.id,
      title: "Marketing Interview Loop",
      description: "Interviews for the Senior Designer role.",
      startTime: formatOffset(4),
      endTime: formatOffset(5),
      status: BookingStatus.PENDING,
      attendeeCount: 4,
      isExclusive: true,
    },
  });

  // Booking 3: Tesla Model Y - Approved
  await prisma.booking.create({
    data: {
      resourceId: tesla.id,
      userId: employeeUser.id,
      title: "Client Site Visit",
      description: "Trip to industrial complex to inspect hardware installation.",
      startTime: formatOffset(2),
      endTime: formatOffset(6),
      status: BookingStatus.APPROVED,
      purpose: "Hardware installation inspection",
      isExclusive: true,
    },
  });

  // Booking 4: MacBook Pro - Overlapping approved units (Equipment quantity > 1 allows this!)
  await prisma.booking.create({
    data: {
      resourceId: laptop.id,
      userId: employeeUser.id,
      title: "UI Design Workshop",
      description: "Need 1 unit for rendering mocks.",
      startTime: formatOffset(1),
      endTime: formatOffset(4),
      status: BookingStatus.APPROVED,
      isExclusive: false,
    },
  });

  await prisma.booking.create({
    data: {
      resourceId: laptop.id,
      userId: admin.id,
      title: "AI Inference Run",
      description: "Need 1 unit to run local inference test.",
      startTime: formatOffset(2),
      endTime: formatOffset(5),
      status: BookingStatus.APPROVED,
      isExclusive: false,
    },
  });
  console.log("   ✅  Dummy Bookings created successfully");

  // 5 — Seed some maintenance requests
  await prisma.maintenanceRequest.create({
    data: {
      resourceId: boardroom.id,
      requestedById: employeeUser.id,
      title: "Projector color balance distorted",
      description: "The ceiling projector has a heavy green tint making slides unreadable. Lamp replacement might be required.",
      priority: Priority.HIGH,
      status: MaintenanceStatus.REQUESTED,
    },
  });

  await prisma.maintenanceRequest.create({
    data: {
      resourceId: tesla.id,
      requestedById: admin.id,
      title: "Annual tire rotation and software check",
      description: "Scheduled servicing window for the Model Y to ensure alignment and rotation.",
      priority: Priority.MEDIUM,
      status: MaintenanceStatus.APPROVED,
      scheduledStart: formatOffset(24),
      scheduledEnd: formatOffset(28),
      approvedById: admin.id,
    },
  });
  console.log("   ✅  Dummy Maintenance Requests created successfully");

  console.log("\n🎉  Database successfully populated with rich dummy data!");
}

main()
  .catch((error) => {
    console.error("❌  Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

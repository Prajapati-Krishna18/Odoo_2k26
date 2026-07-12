/**
 * @file    maintenance.service.ts
 */
import { ApiError } from "../../utils/ApiError.js";
import * as repo from "./maintenance.repository.js";
import * as resourceRepo from "../asset/resource.repository.js";
import { notify } from "../notification/notify.js";
import type {
  CreateMaintenanceDTO,
  UpdateMaintenanceDTO,
  ApproveMaintenanceDTO,
  RejectMaintenanceDTO,
} from "./maintenance.dto.js";
import { MaintenanceStatus, Priority, ResourceStatus } from "@prisma/client";

// Config toggle: If true, approving maintenance cancels conflicting bookings and notifies users.
// Set to false to only block new bookings.
const MAINTENANCE_AUTO_CANCEL = true;

// ── State Machine Transition Rules ───────────────────────────
const ALLOWED_TRANSITIONS: Record<MaintenanceStatus, MaintenanceStatus[]> = {
  [MaintenanceStatus.REQUESTED]: [MaintenanceStatus.APPROVED, MaintenanceStatus.REJECTED, MaintenanceStatus.CANCELLED],
  [MaintenanceStatus.APPROVED]: [MaintenanceStatus.IN_PROGRESS, MaintenanceStatus.CANCELLED],
  [MaintenanceStatus.REJECTED]: [],
  [MaintenanceStatus.IN_PROGRESS]: [MaintenanceStatus.COMPLETED],
  [MaintenanceStatus.COMPLETED]: [],
  [MaintenanceStatus.CANCELLED]: [],
};

function validateTransition(from: MaintenanceStatus, to: MaintenanceStatus) {
  const allowed = ALLOWED_TRANSITIONS[from];
  if (!allowed || !allowed.includes(to)) {
    throw ApiError.badRequest(`Invalid transition: Cannot move maintenance request from ${from} to ${to}`);
  }
}

// ── createMaintenanceRequest ─────────────────────────────────

export async function createMaintenanceRequest(userId: string, dto: CreateMaintenanceDTO) {
  const resource = await resourceRepo.findResourceById(dto.resourceId);
  if (!resource) throw ApiError.notFound("Resource not found");

  const req = await repo.create({
    resourceId: dto.resourceId,
    requestedById: userId,
    title: dto.title,
    description: dto.description,
    priority: dto.priority,
  });

  return req;
}

// ── getMaintenanceRequests ───────────────────────────────────

export async function getMaintenanceRequests(q: {
  resourceId?: string; status?: string; reported_by?: string;
  page?: number; limit?: number;
}) {
  const page = q.page ?? 1; const limit = q.limit ?? 20; const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    repo.findMany({ resourceId: q.resourceId, status: q.status as MaintenanceStatus, reportedBy: q.reported_by, skip, take: limit }),
    repo.count({ resourceId: q.resourceId, status: q.status as MaintenanceStatus, reportedBy: q.reported_by }),
  ]);
  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

// ── getMaintenanceById ───────────────────────────────────────

export async function getMaintenanceById(id: string) {
  const req = await repo.findById(id);
  if (!req) throw ApiError.notFound("Maintenance request not found");
  return req;
}

// ── updateMaintenanceRequest ─────────────────────────────────

export async function updateMaintenanceRequest(id: string, userId: string, role: string, dto: UpdateMaintenanceDTO) {
  const request = await getMaintenanceById(id);
  if (request.requestedById !== userId && !["ADMIN", "ASSET_MANAGER"].includes(role)) {
    throw ApiError.forbidden("Access denied");
  }
  if (request.status !== "REQUESTED") {
    throw ApiError.badRequest("Only pending maintenance requests can be updated");
  }
  return repo.update(id, dto);
}

// ── approveMaintenanceRequest ────────────────────────────────

export async function approveMaintenanceRequest(id: string, approverId: string, dto: ApproveMaintenanceDTO) {
  const request = await getMaintenanceById(id);
  validateTransition(request.status, MaintenanceStatus.APPROVED);

  // Update request schedule & status
  const updated = await repo.update(id, {
    status: MaintenanceStatus.APPROVED,
    approvedById: approverId,
    scheduledStart: dto.scheduledStart,
    scheduledEnd: dto.scheduledEnd,
  });

  // Check if window is active now, if so flip resource status to MAINTENANCE
  const now = new Date();
  if (dto.scheduledStart <= now && dto.scheduledEnd >= now) {
    await resourceRepo.updateResource(request.resourceId, { status: ResourceStatus.MAINTENANCE });
  }

  // Handle conflicts
  if (MAINTENANCE_AUTO_CANCEL) {
    const conflicts = await repo.findOverlappingBookings(request.resourceId, dto.scheduledStart, dto.scheduledEnd);
    if (conflicts.length > 0) {
      const conflictIds = conflicts.map(c => c.id);
      const cancelReason = `Resource placed under maintenance scheduled for ${dto.scheduledStart.toISOString()} to ${dto.scheduledEnd.toISOString()}`;
      await repo.cancelBookings(conflictIds, cancelReason);

      // Notify each affected user
      for (const b of conflicts) {
        await notify({
          userId: b.userId,
          type: "BOOKING_CANCELLED",
          title: "Booking Cancelled due to Maintenance 🔧",
          message: `Your booking "${b.title}" was cancelled because the resource was scheduled for maintenance.`,
          bookingId: b.id,
        });
      }
    }
  }

  // Notify reporter
  await notify({
    userId: request.requestedById,
    type: "MAINTENANCE_APPROVED",
    title: "Maintenance Request Approved",
    message: `Your maintenance request "${request.title}" was approved & scheduled.`,
    maintenanceRequestId: id,
  });

  return updated;
}

// ── rejectMaintenanceRequest ─────────────────────────────────

export async function rejectMaintenanceRequest(id: string, dto: RejectMaintenanceDTO) {
  const request = await getMaintenanceById(id);
  validateTransition(request.status, MaintenanceStatus.REJECTED);

  const updated = await repo.update(id, {
    status: MaintenanceStatus.REJECTED,
    rejectedReason: dto.rejectedReason,
  });

  // Notify reporter
  await notify({
    userId: request.requestedById,
    type: "MAINTENANCE_REJECTED",
    title: "Maintenance Request Rejected",
    message: `Your maintenance request "${request.title}" was rejected. Reason: ${dto.rejectedReason}`,
    maintenanceRequestId: id,
  });

  return updated;
}

// ── startMaintenanceRequest ──────────────────────────────────

export async function startMaintenanceRequest(id: string) {
  const request = await getMaintenanceById(id);
  validateTransition(request.status, MaintenanceStatus.IN_PROGRESS);

  const updated = await repo.update(id, {
    status: MaintenanceStatus.IN_PROGRESS,
    startedAt: new Date(),
  });

  // Flip resource status to MAINTENANCE
  await resourceRepo.updateResource(request.resourceId, { status: ResourceStatus.MAINTENANCE });

  // Notify reporter
  await notify({
    userId: request.requestedById,
    type: "MAINTENANCE_STARTING_SOON",
    title: "Maintenance In Progress",
    message: `Maintenance work has started on "${request.resource.name}".`,
    maintenanceRequestId: id,
  });

  return updated;
}

// ── completeMaintenanceRequest ───────────────────────────────

export async function completeMaintenanceRequest(id: string) {
  const request = await getMaintenanceById(id);
  validateTransition(request.status, MaintenanceStatus.COMPLETED);

  const updated = await repo.update(id, {
    status: MaintenanceStatus.COMPLETED,
    completedAt: new Date(),
  });

  // Flip resource status back to AVAILABLE
  await resourceRepo.updateResource(request.resourceId, { status: ResourceStatus.AVAILABLE });

  // Notify reporter
  await notify({
    userId: request.requestedById,
    type: "MAINTENANCE_COMPLETED",
    title: "Maintenance Completed",
    message: `Maintenance on "${request.resource.name}" has been completed.`,
    maintenanceRequestId: id,
  });

  return updated;
}

// ── cancelMaintenanceRequest ─────────────────────────────────

export async function cancelMaintenanceRequest(id: string, userId: string, role: string) {
  const request = await getMaintenanceById(id);
  validateTransition(request.status, MaintenanceStatus.CANCELLED);

  if (request.requestedById !== userId && !["ADMIN", "ASSET_MANAGER"].includes(role)) {
    throw ApiError.forbidden("Access denied");
  }

  const updated = await repo.update(id, { status: MaintenanceStatus.CANCELLED });

  // If currently locked as maintenance, revert status
  if (request.status === MaintenanceStatus.IN_PROGRESS) {
    await resourceRepo.updateResource(request.resourceId, { status: ResourceStatus.AVAILABLE });
  }

  return updated;
}

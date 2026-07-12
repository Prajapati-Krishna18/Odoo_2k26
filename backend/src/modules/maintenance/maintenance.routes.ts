/**
 * @file    maintenance.routes.ts
 */
import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import * as c from "./maintenance.controller.js";

const router = Router();
router.use(authenticate);

router.post("/", asyncHandler(c.createMaintenanceRequest));
router.get("/", asyncHandler(c.getMaintenanceRequests));
router.get("/:id", asyncHandler(c.getMaintenanceById));
router.patch("/:id", asyncHandler(c.updateMaintenanceRequest));
router.put("/:id/cancel", asyncHandler(c.cancelMaintenanceRequest));

// Admin/Facility Manager actions
router.put("/:id/approve", authorize("ADMIN", "ASSET_MANAGER"), asyncHandler(c.approveMaintenanceRequest));
router.put("/:id/reject", authorize("ADMIN", "ASSET_MANAGER"), asyncHandler(c.rejectMaintenanceRequest));
router.put("/:id/start", authorize("ADMIN", "ASSET_MANAGER"), asyncHandler(c.startMaintenanceRequest));
router.put("/:id/complete", authorize("ADMIN", "ASSET_MANAGER"), asyncHandler(c.completeMaintenanceRequest));

export default router;

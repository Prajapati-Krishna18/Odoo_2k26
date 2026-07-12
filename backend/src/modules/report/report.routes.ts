/**
 * @file    report.routes.ts
 * @desc    Routes for Reports and Exports.
 *          Protected by authenticate and authorize(ADMIN, ASSET_MANAGER, DEPARTMENT_HEAD).
 */

import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import * as reportController from "./report.controller.js";

const router = Router();

// Apply auth protection globally to all report routes
router.use(authenticate, authorize("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"));

router.get("/summary", asyncHandler(reportController.getSummary));
router.get("/providers", asyncHandler(reportController.listProviders));
router.post("/custom/:providerName", asyncHandler(reportController.runCustomReport));
router.get("/export", asyncHandler(reportController.exportDirectory));

export default router;

/**
 * @file    dashboard.routes.ts
 * @desc    Routes for Dashboard analytics.
 *          Protected by authenticate and authorize(ADMIN, DEPARTMENT_HEAD, ASSET_MANAGER).
 */

import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import * as dashboardController from "./dashboard.controller.js";

const router = Router();

// Apply auth protection globally to all dashboard routes
router.use(authenticate, authorize("ADMIN", "DEPARTMENT_HEAD", "ASSET_MANAGER"));

router.get("/", asyncHandler(dashboardController.getStats));

export default router;

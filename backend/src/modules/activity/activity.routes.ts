/**
 * @file    activity.routes.ts
 * @desc    Routes for Activity Log administration.
 *          Protected by authenticate and authorize(ADMIN).
 */

import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import * as activityController from "./activity.controller.js";

const router = Router();

// Apply auth protection globally to all activity endpoints
router.use(authenticate, authorize("ADMIN"));

router.get("/", asyncHandler(activityController.list));

export default router;

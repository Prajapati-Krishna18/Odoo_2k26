/**
 * @file    analytics.routes.ts
 * @desc    Routes for Analytics metrics.
 *          Protected by authenticate and authorize(ADMIN).
 */

import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import * as analyticsController from "./analytics.controller.js";

const router = Router();

// Apply auth protection globally, restricting to ADMIN
router.use(authenticate, authorize("ADMIN"));

router.get("/", asyncHandler(analyticsController.getTrends));

export default router;

/**
 * @file    settings.routes.ts
 * @desc    Routes for System Settings.
 *          Protected by authenticate and authorize(ADMIN).
 */

import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import * as settingsController from "./settings.controller.js";

const router = Router();

// Apply auth protection globally, restricting to ADMIN
router.use(authenticate, authorize("ADMIN"));

router.get("/", asyncHandler(settingsController.get));
router.patch("/", asyncHandler(settingsController.update));

export default router;

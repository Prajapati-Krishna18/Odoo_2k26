/**
 * @file    system.routes.ts
 * @desc    Routes for system diagnostics and health checks.
 *          Protected by authenticate middleware.
 */

import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import * as systemController from "./system.controller.js";

const router = Router();

// Apply auth protection globally
router.use(authenticate);

router.get("/health", asyncHandler(systemController.getHealth));
router.get("/info", asyncHandler(systemController.getInfo));
router.get("/version", asyncHandler(systemController.getVersion));

export default router;

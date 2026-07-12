/**
 * @file    asset.routes.ts
 * @desc    Routes for Asset management.
 *          Protected by authenticate and authorize(ADMIN).
 */

import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import * as assetController from "./asset.controller.js";

const router = Router();

// Apply auth protection globally to all asset routes
router.use(authenticate, authorize("ADMIN"));

router.post("/", asyncHandler(assetController.create));
router.get("/", asyncHandler(assetController.list));
router.get("/:id", asyncHandler(assetController.getDetails));
router.patch("/:id", asyncHandler(assetController.update));
router.patch("/:id/status", asyncHandler(assetController.updateStatus));
router.delete("/:id", asyncHandler(assetController.remove));

export default router;

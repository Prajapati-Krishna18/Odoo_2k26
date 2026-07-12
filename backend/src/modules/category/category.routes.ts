/**
 * @file    category.routes.ts
 * @desc    Routes for Asset Category management.
 *          Protected by authenticate and authorize(ADMIN).
 */

import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import * as categoryController from "./category.controller.js";

const router = Router();

// Apply auth protection globally to all category routes
router.use(authenticate, authorize("ADMIN"));

router.post("/", asyncHandler(categoryController.create));
router.get("/", asyncHandler(categoryController.list));
router.get("/:id", asyncHandler(categoryController.getDetails));
router.patch("/:id", asyncHandler(categoryController.update));
router.patch("/:id/status", asyncHandler(categoryController.updateStatus));
router.delete("/:id", asyncHandler(categoryController.remove));

export default router;

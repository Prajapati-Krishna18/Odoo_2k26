/**
 * @file    department.routes.ts
 * @desc    Routes for Department management.
 *          Protected by authenticate and authorize(ADMIN).
 */

import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import * as departmentController from "./department.controller.js";

const router = Router();

// Apply auth protection globally to all department routes
router.use(authenticate, authorize("ADMIN"));

router.post("/", asyncHandler(departmentController.create));
router.get("/", asyncHandler(departmentController.list));
router.get("/:id", asyncHandler(departmentController.getDetails));
router.patch("/:id", asyncHandler(departmentController.update));
router.patch("/:id/status", asyncHandler(departmentController.updateStatus));
router.delete("/:id", asyncHandler(departmentController.remove));

export default router;

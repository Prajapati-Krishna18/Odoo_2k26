/**
 * @file    employee.routes.ts
 * @desc    Routes for Employee Directory administration.
 *          Protected by authenticate and authorize(ADMIN).
 */

import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import * as employeeController from "./employee.controller.js";

const router = Router();

// Apply auth protection globally to all employee administrative routes
router.use(authenticate, authorize("ADMIN"));

router.get("/", asyncHandler(employeeController.list));
router.get("/:id", asyncHandler(employeeController.getDetails));
router.patch("/:id", asyncHandler(employeeController.updateProfile));
router.patch("/:id/promote", asyncHandler(employeeController.promote));
router.patch("/:id/department", asyncHandler(employeeController.transfer));
router.patch("/:id/status", asyncHandler(employeeController.updateStatus));

export default router;

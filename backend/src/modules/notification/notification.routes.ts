/**
 * @file    notification.routes.ts
 * @desc    Routes for user notifications.
 *          Protected by authenticate.
 */

import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import * as notificationController from "./notification.controller.js";

const router = Router();

// Apply auth protection globally to all notification endpoints
router.use(authenticate);

router.get("/", asyncHandler(notificationController.list));
router.patch("/mark-all-read", asyncHandler(notificationController.markAllRead));
router.patch("/:id/read", asyncHandler(notificationController.markAsRead));
router.delete("/:id", asyncHandler(notificationController.remove));

export default router;

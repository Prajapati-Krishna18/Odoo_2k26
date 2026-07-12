import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import * as c from "./notification.controller.js";

const router = Router();
router.use(authenticate);
router.get("/", asyncHandler(c.getNotifications));
router.put("/read-all", asyncHandler(c.markAllRead));
router.put("/:id/read", asyncHandler(c.markRead));
router.delete("/:id", asyncHandler(c.deleteNotification));
export default router;

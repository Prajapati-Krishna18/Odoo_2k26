/**
 * @file    booking.routes.ts
 */
import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import * as c from "./booking.controller.js";

const router = Router();
router.use(authenticate);

router.post("/", asyncHandler(c.createBooking));
router.get("/", asyncHandler(c.getBookings));
router.get("/calendar", asyncHandler(c.getCalendar));
router.get("/calendar/availability", asyncHandler(c.getAvailability));
router.get("/:id", asyncHandler(c.getBookingById));
router.patch("/:id", asyncHandler(c.updateBooking));
router.put("/:id/cancel", asyncHandler(c.cancelBooking));

// Manager-only actions
router.put("/:id/approve", authorize("ADMIN", "ASSET_MANAGER"), asyncHandler(c.approveBooking));
router.put("/:id/reject", authorize("ADMIN", "ASSET_MANAGER"), asyncHandler(c.rejectBooking));

export default router;

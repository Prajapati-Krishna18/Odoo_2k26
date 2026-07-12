/**
 * @file    auth.routes.ts
 * @desc    Route definitions for the authentication module.
 *
 *          POST /register       — Create an Employee account
 *          POST /login          — Authenticate and receive tokens
 *          POST /logout         — Invalidate the refresh token
 *          POST /refresh-token  — Get a new access token
 *          GET  /me             — Get the current user's profile (protected)
 */

import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import * as authController from "./auth.controller.js";

const router = Router();

router.post("/register", asyncHandler(authController.register));
router.post("/login", asyncHandler(authController.login));
router.post("/logout", asyncHandler(authController.logout));
router.post("/refresh-token", asyncHandler(authController.refreshToken));
router.get("/me", authenticate, asyncHandler(authController.getMe));

export default router;

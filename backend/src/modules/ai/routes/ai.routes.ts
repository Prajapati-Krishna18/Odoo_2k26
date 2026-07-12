/**
 * @file    ai.routes.ts
 * @desc    Routing configuration for AI Assistant endpoints.
 *          Protected by JWT authentication middleware.
 */

import { Router } from "express";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { authenticate } from "../../../middleware/auth.middleware.js";
import * as aiController from "../controller/ai.controller.js";

const router = Router();

// Require authenticated token session for the assistant chat
router.post("/chat", authenticate, asyncHandler(aiController.chat));

export default router;

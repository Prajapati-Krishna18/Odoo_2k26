/**
 * @file    search.routes.ts
 * @desc    Routes for global search.
 *          Protected by authenticate.
 */

import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import * as searchController from "./search.controller.js";

const router = Router();

// Apply auth protection globally
router.use(authenticate);

router.get("/", asyncHandler(searchController.search));

export default router;

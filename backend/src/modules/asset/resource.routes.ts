import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import * as c from "./resource.controller.js";

const router = Router();
router.use(authenticate);
router.get("/", asyncHandler(c.getResources));
router.get("/:id", asyncHandler(c.getResourceById));
router.post("/", authorize("ADMIN", "ASSET_MANAGER"), asyncHandler(c.createResource));
router.patch("/:id", authorize("ADMIN", "ASSET_MANAGER"), asyncHandler(c.updateResource));
router.delete("/:id", authorize("ADMIN"), asyncHandler(c.deleteResource));
export default router;

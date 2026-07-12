/**
 * @file    upload.routes.ts
 * @desc    Routes for shared file uploads.
 *          Protected by authenticate. Handles Multer error interception.
 */

import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { upload } from "./upload.service.js";
import * as uploadController from "./upload.controller.js";
import multer from "multer";
import { ApiError } from "../../utils/ApiError.js";

const router = Router();

// Apply auth protection globally
router.use(authenticate);

// ── Interceptor Middlewares ───────────────────────────────────

const handleSingleUpload = (req: any, res: any, next: any) => {
  const single = upload.single("file");
  single(req, res, (err: any) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          next(ApiError.badRequest("File size exceeds 5MB limit"));
          return;
        }
        next(ApiError.badRequest(`Upload error: ${err.message}`));
        return;
      }
      next(err);
      return;
    }
    next();
  });
};

const handleMultipleUpload = (req: any, res: any, next: any) => {
  const multiple = upload.array("files", 10);
  multiple(req, res, (err: any) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          next(ApiError.badRequest("One of the files exceeds the 5MB size limit"));
          return;
        }
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
          next(ApiError.badRequest("Cannot upload more than 10 files at once"));
          return;
        }
        next(ApiError.badRequest(`Upload error: ${err.message}`));
        return;
      }
      next(err);
      return;
    }
    next();
  });
};

// ── Mount Routes ──────────────────────────────────────────────

router.post("/single", handleSingleUpload, asyncHandler(uploadController.uploadSingle));
router.post("/multiple", handleMultipleUpload, asyncHandler(uploadController.uploadMultiple));

export default router;

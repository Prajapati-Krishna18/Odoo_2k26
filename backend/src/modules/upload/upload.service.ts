/**
 * @file    upload.service.ts
 * @desc    Shared file upload utility using Multer.
 *          Provides reusable storage and file filtering configurations.
 */

import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { ApiError } from "../../utils/ApiError.js";

const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");

// Ensure main upload directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// ── Storage Configuration ────────────────────────────────────

const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    // Dynamically categorize uploads by mimetype prefix (e.g. images vs docs)
    let folder = UPLOADS_DIR;
    if (file.mimetype.startsWith("image/")) {
      folder = path.join(UPLOADS_DIR, "images");
    } else if (file.mimetype === "application/pdf") {
      folder = path.join(UPLOADS_DIR, "documents");
    }

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    cb(null, folder);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// ── File Filter (Mime + Extension validation) ────────────────

const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedExtensions = [".png", ".jpg", ".jpeg", ".webp", ".pdf", ".docx", ".xlsx"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowedExtensions.includes(ext)) {
    cb(
      ApiError.badRequest(
        `Invalid file type. Only ${allowedExtensions.join(", ")} files are allowed.`
      ) as any
    );
    return;
  }

  const allowedMimeTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    cb(
      ApiError.badRequest(
        "Invalid MIME type. Only standard images, PDFs, Word, and Excel documents are allowed."
      ) as any
    );
    return;
  }

  cb(null, true);
};

// ── Export Shared Multer Instance ─────────────────────────────

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Max size: 5MB
  },
});

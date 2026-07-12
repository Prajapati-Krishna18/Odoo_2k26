/**
 * @file    upload.controller.ts
 * @desc    HTTP request handlers for shared file uploads.
 */

import type { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import path from "node:path";

export const uploadSingle = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    throw ApiError.badRequest("No file uploaded");
  }

  // Get path relative to project root, using forward slashes for URL compatibility
  const relativePath = path
    .relative(process.cwd(), req.file.path)
    .replace(/\\/g, "/");

  const response = ApiResponse.ok("File uploaded successfully", {
    url: `/${relativePath}`,
    mimetype: req.file.mimetype,
    size: req.file.size,
  });

  res.status(response.statusCode).json(response);
};

export const uploadMultiple = async (req: Request, res: Response): Promise<void> => {
  const files = req.files as Express.Multer.File[] | undefined;

  if (!files || files.length === 0) {
    throw ApiError.badRequest("No files uploaded");
  }

  const fileData = files.map((file) => {
    const relativePath = path
      .relative(process.cwd(), file.path)
      .replace(/\\/g, "/");

    return {
      url: `/${relativePath}`,
      mimetype: file.mimetype,
      size: file.size,
    };
  });

  const response = ApiResponse.ok("Files uploaded successfully", fileData);
  res.status(response.statusCode).json(response);
};

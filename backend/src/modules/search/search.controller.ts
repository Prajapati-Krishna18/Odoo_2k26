/**
 * @file    search.controller.ts
 * @desc    HTTP request handlers for global search endpoints.
 */

import type { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import { SearchManager } from "./search.service.js";

export const search = async (req: Request, res: Response): Promise<void> => {
  const query = req.query["q"] as string | undefined;

  if (!query || query.trim() === "") {
    throw ApiError.badRequest("Search query parameter 'q' is required and cannot be empty");
  }

  const limit = req.query["limit"]
    ? parseInt(req.query["limit"] as string, 10)
    : 5;

  const results = await SearchManager.searchAll(query.trim(), isNaN(limit) ? 5 : limit);
  const response = ApiResponse.ok("Search results retrieved successfully", results);
  res.status(response.statusCode).json(response);
};

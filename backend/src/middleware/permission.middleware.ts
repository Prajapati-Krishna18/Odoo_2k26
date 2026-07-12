/**
 * @file    permission.middleware.ts
 * @desc    Express middleware to enforce permission-based authorization.
 *          Resolves user role permissions from the database.
 */

import type { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Middleware checking if the authenticated user's role possesses the required permission.
 * Admins skip all permission checks automatically.
 *
 * @param permissionName Name of the permission (e.g. "Department.Create")
 */
export const checkPermission = (permissionName: string) => {
  return asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw ApiError.unauthorized("Authentication required");
    }

    const userRole = req.user.role;

    // 1. ADMIN bypasses all permission checks
    if (userRole === "ADMIN") {
      return next();
    }

    // 2. Query DB to check if this role has the requested permission
    const association = await prisma.rolePermission.findFirst({
      where: {
        role: { name: userRole },
        permission: { name: permissionName },
      },
    });

    if (!association) {
      throw ApiError.forbidden(
        `Access denied: Insufficient permissions. Requires permission '${permissionName}'`
      );
    }

    next();
  });
};

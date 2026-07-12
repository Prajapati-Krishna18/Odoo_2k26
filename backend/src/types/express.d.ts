/**
 * @file    express.d.ts
 * @desc    Augment the Express Request interface.
 *
 *          Adds the authenticated user payload so that downstream
 *          handlers can access `req.user` after the `authenticate`
 *          middleware runs.
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      requestId?: string;

      /** Populated by the `authenticate` middleware after JWT verification. */
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

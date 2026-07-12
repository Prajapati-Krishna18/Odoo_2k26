/**
 * @file    express.d.ts
 * @desc    Augment the Express Request interface.
 *
 *          Add custom properties here as the application grows
 *          (e.g., authenticated user, tenant context).
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      /** Placeholder — extend with user, tenant, etc. in future phases. */
      requestId?: string;
    }
  }
}

/**
 * @file    notification.validator.ts
 * @desc    Zod validation schemas for Notification requests.
 */

import { z } from "zod";

export const notificationQuerySchema = z.object({
  page: z.preprocess((val) => parseInt(val as string, 10), z.number().int().min(1).default(1)),
  limit: z.preprocess((val) => parseInt(val as string, 10), z.number().int().min(1).max(100).default(10)),
  isRead: z.preprocess(
    (val) => (val === undefined ? undefined : val === "true" || val === true),
    z.boolean().optional()
  ),
});

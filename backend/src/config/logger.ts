/**
 * @file    logger.ts
 * @desc    Morgan format configuration.
 *          Uses 'dev' format in development for colored, concise output.
 *          Uses 'combined' in production for full Apache-style access logs.
 */

import { env } from "./env.js";

export const morganFormat: string = env.isDevelopment ? "dev" : "combined";

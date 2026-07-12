/**
 * @file    prisma.config.ts
 * @desc    Prisma 7.x configuration file.
 *          Connection URLs are defined here instead of schema.prisma.
 *          See: https://pris.ly/d/config-datasource
 */

import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DIRECT_URL"),
  },
});

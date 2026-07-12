/**
 * @file    settings.repository.ts
 * @desc    Data-access layer for SystemSettings.
 *          Resolves a singleton settings row and seeds a default row if missing.
 */

import { prisma } from "../../config/prisma.js";
import { type UpdateSettingsDTO } from "./settings.dto.js";

const DEFAULT_SETTINGS = {
  companyName: "AssetFlow Corporation",
  companyLogo: null,
  address: "Surat, Gujarat, India",
  timezone: "Asia/Kolkata",
  dateFormat: "YYYY-MM-DD",
  currency: "INR",
  language: "en",
  theme: "dark",
  auditRetentionDays: 90,
  auditLogLevel: "INFO",
  auditEnabledModules: ["AUTH", "DEPARTMENT", "EMPLOYEE"],
};

export const get = async () => {
  const settings = await prisma.systemSetting.findFirst();
  if (settings) {
    return settings;
  }

  // Seed default settings row if completely missing
  return prisma.systemSetting.create({
    data: DEFAULT_SETTINGS,
  });
};

export const update = async (data: UpdateSettingsDTO) => {
  const current = await get();

  return prisma.systemSetting.update({
    where: { id: current.id },
    data: {
      companyName: data.companyName,
      companyLogo: data.companyLogo,
      address: data.address,
      timezone: data.timezone,
      dateFormat: data.dateFormat,
      currency: data.currency,
      language: data.language,
      theme: data.theme,
      auditRetentionDays: data.auditRetentionDays,
      auditLogLevel: data.auditLogLevel,
      auditEnabledModules: data.auditEnabledModules,
    },
  });
};

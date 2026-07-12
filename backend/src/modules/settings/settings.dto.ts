/**
 * @file    settings.dto.ts
 * @desc    Data Transfer Objects for System Settings.
 */

export interface UpdateSettingsDTO {
  companyName?: string;
  companyLogo?: string | null;
  address?: string | null;
  timezone?: string;
  dateFormat?: string;
  currency?: string;
  language?: string;
  theme?: string;

  // Audit configuration updates
  auditRetentionDays?: number;
  auditLogLevel?: string;
  auditEnabledModules?: string[];
}

export interface SettingsResponseDTO {
  id: string;
  companyName: string;
  companyLogo: string | null;
  address: string | null;
  timezone: string;
  dateFormat: string;
  currency: string;
  language: string;
  theme: string;

  // Audit configurations
  auditRetentionDays: number;
  auditLogLevel: string;
  auditEnabledModules: string[];
  
  updatedAt: Date;
}

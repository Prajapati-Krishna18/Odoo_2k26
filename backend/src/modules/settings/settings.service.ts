/**
 * @file    settings.service.ts
 * @desc    Business logic for System Settings.
 */

import * as settingsRepo from "./settings.repository.js";
import { type UpdateSettingsDTO } from "./settings.dto.js";

export async function getSettings() {
  return settingsRepo.get();
}

export async function updateSettings(dto: UpdateSettingsDTO) {
  return settingsRepo.update(dto);
}

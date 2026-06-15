import type { UpdateSettingInput } from "./setting.schema";
import { updateSettingsRecord, upsertSettings } from "./setting.repository";

export function getSettings() {
  return upsertSettings();
}

export async function updateSettings(data: UpdateSettingInput) {
  await getSettings();
  return updateSettingsRecord(data);
}

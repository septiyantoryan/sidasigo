import { prisma } from "../../lib/prisma";
import type { UpdateSettingInput } from "./setting.schema";

export const SINGLETON_ID = "singleton";

const DEFAULTS = {
  siteTitle: "SIDASI-GO",
  siteSubtitle: "Sistem Data Inovasi Kabupaten Grobogan",
  heroWelcomeText: "Selamat datang di SIDASI-GO",
};

export function upsertSettings() {
  return prisma.systemSetting.upsert({
    where: { id: SINGLETON_ID },
    create: { id: SINGLETON_ID, ...DEFAULTS },
    update: {},
  });
}

export function updateSettingsRecord(data: UpdateSettingInput) {
  return prisma.systemSetting.update({ where: { id: SINGLETON_ID }, data });
}

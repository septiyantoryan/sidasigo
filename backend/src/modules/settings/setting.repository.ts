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

// --- HeroImage ---

export function findAllHeroImages() {
  return prisma.heroImage.findMany({ orderBy: { sort: "asc" } });
}

export function createHeroImage(path: string, sort?: number) {
  return prisma.heroImage.create({ data: { path, sort: sort ?? 0 } });
}

export function deleteHeroImage(id: string) {
  return prisma.heroImage.delete({ where: { id } });
}

export async function reorderHeroImages(ids: string[]) {
  await prisma.$transaction(
    ids.map((id, index) =>
      prisma.heroImage.update({ where: { id }, data: { sort: index } }),
    ),
  );
}

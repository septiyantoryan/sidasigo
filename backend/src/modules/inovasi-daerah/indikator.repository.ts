import { prisma } from "../../lib/prisma";

export type IndikatorPayload = {
  regulasi?: string | null;
  sdm?: string | null;
  dukunganAnggaran?: string | null;
  alatKerja?: string | null;
  bimtek?: string | null;
  integrasiRKPD?: string | null;
  aktorInovasi?: string | null;
  pelaksana?: string | null;
  jejaringInovasi?: string | null;
  sosialisasi?: string | null;
  pedomanTeknis?: string | null;
  kemudahanInfoLayanan?: string | null;
  kecepatanProses?: string | null;
  penyelesaianPengaduan?: string | null;
  layananTerintegrasi?: string | null;
  replikasi?: string | null;
  kecepatanPenciptaan?: string | null;
  kemanfaatan?: string | null;
  monitoringEvaluasi?: string | null;
  kualitasVideo?: string | null;
};

export function findIndikatorByInovasiId(inovasiDaerahId: string) {
  return prisma.indikatorInovasiDaerah.findUnique({ where: { inovasiDaerahId } });
}

export function upsertIndikator(inovasiDaerahId: string, data: IndikatorPayload) {
  return prisma.indikatorInovasiDaerah.upsert({
    where: { inovasiDaerahId },
    create: { ...data, inovasiDaerahId },
    update: data,
  });
}

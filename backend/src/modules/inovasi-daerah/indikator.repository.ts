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

/** Get all attachments for an inovasi, grouped by field name. */
export function findAttachmentsByInovasiId(inovasiDaerahId: string) {
  return prisma.indikatorAttachment.findMany({
    where: { inovasiDaerahId },
    select: { id: true, field: true, path: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
}

/** Create a single attachment record. */
export function createAttachment(inovasiDaerahId: string, field: string, path: string) {
  return prisma.indikatorAttachment.create({
    data: { inovasiDaerahId, field, path },
  });
}

/** Delete an attachment by id. */
export function deleteAttachment(id: string) {
  return prisma.indikatorAttachment.delete({ where: { id } });
}

/** Delete all attachments for a field of a given inovasi. */
export function deleteAttachmentsByField(inovasiDaerahId: string, field: string) {
  return prisma.indikatorAttachment.deleteMany({
    where: { inovasiDaerahId, field },
  });
}

/** Get all attachment file paths for an inovasi (for cleanup on delete). */
export function findAttachmentPaths(inovasiDaerahId: string): Promise<string[]> {
  return prisma.indikatorAttachment
    .findMany({
      where: { inovasiDaerahId },
      select: { path: true },
    })
    .then((rows) => rows.map((r) => r.path));
}

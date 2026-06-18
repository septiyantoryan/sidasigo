import { prisma } from "../../lib/prisma";

/**
 * Determine whether a privately served file (referenced by its stored
 * filename) may be accessed by the given user. A user owns a file when it is
 * referenced by one of their Krenova documents or by an indikator belonging to
 * one of their InovasiDaerah records.
 */
export async function isFileAccessibleBy(userId: string, filename: string): Promise<boolean> {
  if (!filename) return false;

  const krenova = await prisma.krenova.findFirst({
    where: {
      userId,
      OR: [
        { dokumenProposal: filename },
        { lampiranOriginalitas: filename },
        { lampiranIdentitas: filename },
      ],
    },
    select: { id: true },
  });
  if (krenova) return true;

  // Check KrenovaAttachment table.
  const krenovaAtt = await prisma.krenovaAttachment.findFirst({
    where: { krenova: { userId }, path: filename },
    select: { id: true },
  });
  if (krenovaAtt) return true;

  const indikator = await prisma.indikatorInovasiDaerah.findFirst({
    where: {
      inovasiDaerah: { userId },
      OR: [
        { regulasi: filename },
        { sdm: filename },
        { dukunganAnggaran: filename },
        { alatKerja: filename },
        { bimtek: filename },
        { integrasiRKPD: filename },
        { aktorInovasi: filename },
        { pelaksana: filename },
        { jejaringInovasi: filename },
        { sosialisasi: filename },
        { pedomanTeknis: filename },
        { kemudahanInfoLayanan: filename },
        { kecepatanProses: filename },
        { penyelesaianPengaduan: filename },
        { layananTerintegrasi: filename },
        { replikasi: filename },
        { kecepatanPenciptaan: filename },
        { kemanfaatan: filename },
        { monitoringEvaluasi: filename },
      ],
    },
    select: { id: true },
  });
  if (indikator) return true;

  // Also check the IndikatorAttachment table (multi-file uploads).
  const attachment = await prisma.indikatorAttachment.findFirst({
    where: {
      inovasiDaerah: { userId },
      path: filename,
    },
    select: { id: true },
  });
  return Boolean(attachment);
}

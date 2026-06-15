import type { Prisma } from "@prisma/client";
import {
  deleteFile,
  deleteUploadFolder,
  relocateUploadedFile,
} from "../../utils/file";
import { buildPaginated } from "../../utils/pagination";
import type { AdminKrenovaQuery, KrenovaListQuery } from "../shared/pagination.schema";
import {
  countMyKrenovaStats,
  createKrenovaRecord,
  deleteKrenovaRecord,
  findAdminKrenovaRows,
  findKrenovaById,
  findKrenovaFiles,
  findMyKrenovaRows,
  findPublicKrenovaRows,
  findVisibleKrenovaById,
  setKrenovaApproved,
  setKrenovaRejected,
  updateKrenovaRecord,
} from "./krenova.repository";

export async function findKrenovaPaginated(input: KrenovaListQuery) {
  const [items, total] = await findPublicKrenovaRows(input);
  return buildPaginated(items, total, input.page, input.pageSize);
}

export async function findMyKrenovaPaginated(userId: string, input: KrenovaListQuery) {
  const [items, total] = await findMyKrenovaRows(userId, input);
  return buildPaginated(items, total, input.page, input.pageSize);
}

export async function findMyKrenovaStats(userId: string) {
  const [total, pending, disetujui, ditolak] = await countMyKrenovaStats(userId);
  return { total, pending, disetujui, ditolak };
}

export async function findAdminKrenovaPaginated(input: AdminKrenovaQuery) {
  const [items, total] = await findAdminKrenovaRows(input);
  return buildPaginated(items, total, input.page, input.pageSize);
}

export async function createKrenova(userId: string, data: Prisma.KrenovaUncheckedCreateInput) {
  const created = await createKrenovaRecord(userId, data);

  // Files were uploaded to the staging root before the record existed; move
  // them into krenova/<id>/ and persist the relative paths.
  const subdir = `krenova/${created.id}`;
  const [dokumenProposal, lampiranOriginalitas, lampiranIdentitas] = await Promise.all([
    relocateUploadedFile(created.dokumenProposal, subdir),
    relocateUploadedFile(created.lampiranOriginalitas, subdir),
    relocateUploadedFile(created.lampiranIdentitas, subdir),
  ]);

  const changed =
    dokumenProposal !== created.dokumenProposal ||
    lampiranOriginalitas !== created.lampiranOriginalitas ||
    lampiranIdentitas !== created.lampiranIdentitas;

  if (!changed) return created;

  return updateKrenovaRecord(created.id, {
    dokumenProposal,
    lampiranOriginalitas,
    lampiranIdentitas,
  });
}

export { findKrenovaById };

export { findVisibleKrenovaById };

export async function updateKrenova(id: string, data: Prisma.KrenovaUpdateInput) {
  // Relocate any newly-uploaded (staging) files into krenova/<id>/. Unchanged
  // values already carry a separator and are left untouched by the helper.
  const subdir = `krenova/${id}`;
  const next: Prisma.KrenovaUpdateInput = { ...data };

  for (const field of [
    "dokumenProposal",
    "lampiranOriginalitas",
    "lampiranIdentitas",
  ] as const) {
    const value = next[field];
    if (typeof value === "string") {
      next[field] = await relocateUploadedFile(value, subdir);
    }
  }

  return updateKrenovaRecord(id, next);
}

export async function deleteKrenova(id: string) {
  const krenova = await findKrenovaFiles(id);

  if (krenova) {
    for (const filePath of [
      krenova.dokumenProposal,
      krenova.lampiranOriginalitas,
      krenova.lampiranIdentitas,
    ]) {
      if (filePath) {
        await deleteFile(filePath);
      }
    }
  }

  const result = await deleteKrenovaRecord(id);
  // Remove the per-record folder (and any stray files) after the row is gone.
  await deleteUploadFolder(`krenova/${id}`);
  return result;
}

export function approveKrenova(id: string) {
  return setKrenovaApproved(id);
}

export function rejectKrenova(id: string, reason?: string) {
  return setKrenovaRejected(id, reason);
}

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
  createKrenovaAttachment,
  createKrenovaRecord,
  deleteKrenovaAttachmentsByField,
  deleteKrenovaRecord,
  findAdminKrenovaRows,
  findKrenovaAttachmentPaths,
  findKrenovaAttachments,
  findKrenovaById,
  findKrenovaFiles,
  findMyKrenovaRows,
  findPublicKrenovaRows,
  findVisibleKrenovaById,
  setKrenovaApproved,
  setKrenovaRejected,
  updateKrenovaRecord,
} from "./krenova.repository";

async function processAttachments(
  krenovaId: string,
  attachments: { field: string; path: string }[],
) {
  const subdir = `krenova/${krenovaId}`;
  const grouped = new Map<string, string[]>();
  for (const att of attachments) {
    const relocated = await relocateUploadedFile(att.path, subdir);
    const list = grouped.get(att.field) ?? [];
    list.push(relocated);
    grouped.set(att.field, list);
  }
  for (const [field, paths] of grouped) {
    await deleteKrenovaAttachmentsByField(krenovaId, field);
    for (const path of paths) {
      await createKrenovaAttachment(krenovaId, field, path);
    }
  }
}

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

export async function createKrenova(
  userId: string,
  data: Prisma.KrenovaUncheckedCreateInput & {
    attachments?: { field: string; path: string }[];
  },
) {
  const { attachments, ...recordData } = data;
  const created = await createKrenovaRecord(userId, recordData);

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

  if (changed) {
    await updateKrenovaRecord(created.id, {
      dokumenProposal,
      lampiranOriginalitas,
      lampiranIdentitas,
    });
  }

  if (attachments && attachments.length > 0) {
    await processAttachments(created.id, attachments);
  }

  return created;
}

export { findKrenovaById };

export { findVisibleKrenovaById };

export async function updateKrenova(
  id: string,
  data: Prisma.KrenovaUpdateInput & {
    attachments?: { field: string; path: string }[];
  },
) {
  const { attachments, ...recordData } = data;
  const subdir = `krenova/${id}`;
  const next: Prisma.KrenovaUpdateInput = { ...recordData };

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

  const result = await updateKrenovaRecord(id, next);

  if (attachments && attachments.length > 0) {
    await processAttachments(id, attachments);
  }

  return result;
}

export async function deleteKrenova(id: string) {
  const krenova = await findKrenovaFiles(id);
  const filePaths: string[] = [];

  if (krenova) {
    for (const filePath of [
      krenova.dokumenProposal,
      krenova.lampiranOriginalitas,
      krenova.lampiranIdentitas,
    ]) {
      if (filePath) {
        filePaths.push(filePath);
      }
    }
  }

  // Also get attachment paths
  const attPaths = await findKrenovaAttachmentPaths(id);
  filePaths.push(...attPaths);

  const result = await deleteKrenovaRecord(id);
  await Promise.all(filePaths.map((p) => deleteFile(p)));
  await deleteUploadFolder(`krenova/${id}`);
  return result;
}

export function approveKrenova(id: string) {
  return setKrenovaApproved(id);
}

export function rejectKrenova(id: string, reason?: string) {
  return setKrenovaRejected(id, reason);
}

import type { Prisma } from "@prisma/client";
import {
  deleteFile,
  deleteUploadFolder,
  relocateUploadedFile,
} from "../../utils/file";
import { buildPaginated } from "../../utils/pagination";
import type { AdminInovasiQuery, InovasiListQuery } from "../shared/pagination.schema";
import {
  createAttachment,
  deleteAttachmentsByField,
  findAttachmentsByInovasiId,
  findIndikatorByInovasiId,
  findAttachmentPaths,
  type IndikatorPayload,
  upsertIndikator,
} from "./indikator.repository";
import {
  countMyInovasiStats,
  createInovasi,
  deleteInovasi,
  findAdminInovasiRows,
  findInovasiById,
  findMyInovasiRows,
  findPublicInovasiRows,
  findVisibleInovasiById,
  setInovasiApproved,
  setInovasiRejected,
  updateInovasi,
} from "./inovasi-daerah.repository";

const indikatorFileFields: Array<keyof IndikatorPayload> = [
  "regulasi",
  "sdm",
  "dukunganAnggaran",
  "alatKerja",
  "bimtek",
  "integrasiRKPD",
  "aktorInovasi",
  "pelaksana",
  "jejaringInovasi",
  "sosialisasi",
  "pedomanTeknis",
  "kemudahanInfoLayanan",
  "kecepatanProses",
  "penyelesaianPengaduan",
  "layananTerintegrasi",
  "replikasi",
  "kecepatanPenciptaan",
  "kemanfaatan",
  "monitoringEvaluasi",
];

export async function findInovasiDaerahPaginated(input: InovasiListQuery) {
  const [items, total] = await findPublicInovasiRows(input);
  return buildPaginated(items, total, input.page, input.pageSize);
}

export async function findMyInovasiDaerahPaginated(userId: string, input: InovasiListQuery) {
  const [items, total] = await findMyInovasiRows(userId, input);
  return buildPaginated(items, total, input.page, input.pageSize);
}

export async function findAdminInovasiDaerahPaginated(input: AdminInovasiQuery) {
  const [items, total] = await findAdminInovasiRows(input);
  return buildPaginated(items, total, input.page, input.pageSize);
}

export async function findMyInovasiDaerahStats(userId: string) {
  const [total, pending, disetujui, ditolak] = await countMyInovasiStats(userId);
  return { total, pending, disetujui, ditolak };
}

export { findInovasiById as findInovasiDaerahById };

export { findVisibleInovasiById as findVisibleInovasiDaerahById };

export function createInovasiDaerah(userId: string, data: Omit<Prisma.InovasiDaerahUncheckedCreateInput, "userId" | "id">) {
  return createInovasi(userId, data);
}

export function updateInovasiDaerah(id: string, data: Prisma.InovasiDaerahUpdateInput) {
  return updateInovasi(id, data);
}

export async function deleteInovasiDaerah(id: string) {
  // Snapshot file paths before DB deletion so concurrent indikator updates
  // cannot introduce new file references that escape cleanup.
  const indikator = await findIndikatorByInovasiId(id);
  const filePaths: string[] = [];

  if (indikator) {
    for (const field of indikatorFileFields) {
      const value = indikator[field as keyof typeof indikator];
      if (typeof value === "string" && value.length > 0) {
        filePaths.push(value);
      }
    }
  }

  // Snapshot attachment file paths as well.
  const attachmentPaths = await findAttachmentPaths(id);
  filePaths.push(...attachmentPaths);

  // Cascade-deletes indikator row and attachment rows via FK.
  await deleteInovasi(id);

  // Clean up disk files after the DB row is gone.
  await Promise.all(filePaths.map((p) => deleteFile(p)));
  // Remove the per-record folder (and any stray files) as well.
  await deleteUploadFolder(`inovasi/${id}`);
}

export function approveInovasiDaerah(id: string) {
  return setInovasiApproved(id);
}

export function rejectInovasiDaerah(id: string, reason?: string) {
  return setInovasiRejected(id, reason);
}

export async function createOrUpdateIndikator(
  inovasiDaerahId: string,
  data: IndikatorPayload,
  attachments?: { field: string; path: string }[],
) {
  // Relocate any newly-uploaded (staging) document files into inovasi/<id>/
  // before persisting. Unchanged values already carry a separator and are left
  // untouched by the helper; the kualitasVideo URL is not a file field.
  const subdir = `inovasi/${inovasiDaerahId}`;
  const payload: IndikatorPayload = { ...data };
  for (const field of indikatorFileFields) {
    const value = payload[field];
    if (typeof value === "string" && value.length > 0) {
      payload[field] = await relocateUploadedFile(value, subdir);
    }
  }

  const existing = await findIndikatorByInovasiId(inovasiDaerahId);

  if (existing) {
    for (const field of indikatorFileFields) {
      const oldValue = existing[field as keyof typeof existing];
      const newValue = payload[field];
      if (
        typeof oldValue === "string" &&
        oldValue.length > 0 &&
        typeof newValue === "string" &&
        newValue !== oldValue
      ) {
        await deleteFile(oldValue);
      }
    }
  }

  const result = await upsertIndikator(inovasiDaerahId, payload);

  // Handle multi-file attachments: replace all attachments per field.
  if (attachments) {
    // Group attachments by field and delete old ones.
    const grouped = new Map<string, string[]>();
    for (const att of attachments) {
      const relocated = await relocateUploadedFile(att.path, subdir);
      const list = grouped.get(att.field) ?? [];
      list.push(relocated);
      grouped.set(att.field, list);
    }

    for (const [field, paths] of grouped) {
      await deleteAttachmentsByField(inovasiDaerahId, field);
      for (const path of paths) {
        await createAttachment(inovasiDaerahId, field, path);
      }
    }
  }

  return result;
}

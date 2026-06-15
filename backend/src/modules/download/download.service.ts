import type { Prisma } from "@prisma/client";
import { deletePublicFile } from "../../utils/file";
import { buildPaginated } from "../../utils/pagination";
import type { AdminDownloadQuery, DownloadListQuery } from "../shared/pagination.schema";
import {
  countDownloadByFilePath,
  createDownloadRecord,
  deleteDownloadRecord,
  findAdminDownloadRows,
  findDownloadById,
  findDownloadFile,
  findPublicDownloadRows,
  updateDownloadRecord,
} from "./download.repository";

export async function findDownloadPaginated(input: DownloadListQuery) {
  const [items, total] = await findPublicDownloadRows(input);
  return buildPaginated(items, total, input.page, input.pageSize);
}

export async function findAdminDownloadPaginated(input: AdminDownloadQuery) {
  const [items, total] = await findAdminDownloadRows(input);
  return buildPaginated(items, total, input.page, input.pageSize);
}

export { findDownloadById };

export function createDownload(data: Prisma.DownloadCreateInput) {
  return createDownloadRecord(data);
}

export async function updateDownload(id: string, data: Prisma.DownloadUpdateInput) {
  // If file is being replaced, delete the previous one (unless shared).
  if (typeof data.filePath === "string") {
    const existing = await findDownloadFile(id);
    if (existing?.filePath && existing.filePath !== data.filePath) {
      const shared = await countDownloadByFilePath(existing.filePath, id);
      if (shared === 0) await deletePublicFile(existing.filePath);
    }
  }
  return updateDownloadRecord(id, data);
}

export async function deleteDownload(id: string) {
  const existing = await findDownloadFile(id);
  if (existing?.filePath) {
    const shared = await countDownloadByFilePath(existing.filePath, id);
    if (shared === 0) await deletePublicFile(existing.filePath);
  }
  return deleteDownloadRecord(id);
}

import type { Prisma } from "@prisma/client";
import { deletePublicFile } from "../../utils/file";
import { buildPaginated } from "../../utils/pagination";
import type { AdminRisetQuery, RisetListQuery } from "../shared/pagination.schema";
import {
  countRisetByFilePath,
  createRisetRecord,
  deleteRisetRecord,
  findAdminRisetRows,
  findPublicRisetRows,
  findRisetById,
  findRisetFile,
  updateRisetRecord,
} from "./riset.repository";

export async function findRisetPaginated(input: RisetListQuery) {
  const [items, total] = await findPublicRisetRows(input);
  return buildPaginated(items, total, input.page, input.pageSize);
}

export async function findAdminRisetPaginated(input: AdminRisetQuery) {
  const [items, total] = await findAdminRisetRows(input);
  return buildPaginated(items, total, input.page, input.pageSize);
}

export { findRisetById };

export function createRiset(data: Prisma.RisetCreateInput) {
  return createRisetRecord(data);
}

export async function updateRiset(id: string, data: Prisma.RisetUpdateInput) {
  // If file is being replaced, delete the previous one (unless shared).
  if (typeof data.filePath === "string") {
    const existing = await findRisetFile(id);
    if (existing?.filePath && existing.filePath !== data.filePath) {
      const shared = await countRisetByFilePath(existing.filePath, id);
      if (shared === 0) await deletePublicFile(existing.filePath);
    }
  }
  return updateRisetRecord(id, data);
}

export async function deleteRiset(id: string) {
  const existing = await findRisetFile(id);
  if (existing?.filePath) {
    const shared = await countRisetByFilePath(existing.filePath, id);
    if (shared === 0) await deletePublicFile(existing.filePath);
  }
  return deleteRisetRecord(id);
}

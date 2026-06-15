import type { Prisma } from "@prisma/client";
import { deletePublicFile } from "../../utils/file";
import { buildPaginated } from "../../utils/pagination";
import type { AdminBeritaQuery, BeritaListQuery } from "../shared/pagination.schema";
import {
  countBeritaByPosterPath,
  createBeritaRecord,
  deleteBeritaRecord,
  findAdminBeritaRows,
  findBeritaById,
  findBeritaPoster,
  findPublicBeritaRows,
  updateBeritaRecord,
} from "./berita.repository";

export async function findBeritaPaginated(input: BeritaListQuery) {
  const [items, total] = await findPublicBeritaRows(input);
  return buildPaginated(items, total, input.page, input.pageSize);
}

export async function findAdminBeritaPaginated(input: AdminBeritaQuery) {
  const [items, total] = await findAdminBeritaRows(input);
  return buildPaginated(items, total, input.page, input.pageSize);
}

export { findBeritaById };

export function createBerita(data: Prisma.BeritaCreateInput) {
  return createBeritaRecord(data);
}

export async function updateBerita(id: string, data: Prisma.BeritaUpdateInput) {
  // If poster is being replaced, delete the previous one (unless shared).
  if (typeof data.posterPath === "string") {
    const existing = await findBeritaPoster(id);
    if (existing?.posterPath && existing.posterPath !== data.posterPath) {
      const shared = await countBeritaByPosterPath(existing.posterPath, id);
      if (shared === 0) await deletePublicFile(existing.posterPath);
    }
  }
  return updateBeritaRecord(id, data);
}

export async function deleteBerita(id: string) {
  const existing = await findBeritaPoster(id);
  if (existing?.posterPath) {
    const shared = await countBeritaByPosterPath(existing.posterPath, id);
    if (shared === 0) await deletePublicFile(existing.posterPath);
  }
  return deleteBeritaRecord(id);
}

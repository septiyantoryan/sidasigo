import { type Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { resolveOrderBy, resolveSortDir, toSkipTake } from "../../utils/pagination";
import type { AdminDownloadQuery, DownloadListQuery } from "../shared/pagination.schema";

function buildSearchWhere(search: string): Prisma.DownloadWhereInput | undefined {
  if (!search) return undefined;
  return { judul: { contains: search } };
}

function downloadOrderBy(
  input: DownloadListQuery | AdminDownloadQuery,
): Prisma.DownloadOrderByWithRelationInput {
  const dir = resolveSortDir(input.sortDir, input.sort);
  return resolveOrderBy<Prisma.DownloadOrderByWithRelationInput>(
    {
      judul: (d) => ({ judul: d }),
      createdAt: (d) => ({ createdAt: d }),
    },
    input.sortBy,
    dir,
    (d) => ({ createdAt: d }),
  );
}

export async function findPublicDownloadRows(input: DownloadListQuery) {
  const { page, pageSize, search } = input;
  const { skip, take } = toSkipTake(page, pageSize);
  const where: Prisma.DownloadWhereInput = {
    ...(buildSearchWhere(search) ?? {}),
  };

  return prisma.$transaction([
    prisma.download.findMany({
      where,
      orderBy: downloadOrderBy(input),
      skip,
      take,
    }),
    prisma.download.count({ where }),
  ]);
}

export async function findAdminDownloadRows(input: AdminDownloadQuery) {
  const { page, pageSize, search } = input;
  const { skip, take } = toSkipTake(page, pageSize);
  const where: Prisma.DownloadWhereInput = {
    ...(buildSearchWhere(search) ?? {}),
  };

  return prisma.$transaction([
    prisma.download.findMany({
      where,
      orderBy: downloadOrderBy(input),
      skip,
      take,
    }),
    prisma.download.count({ where }),
  ]);
}

export function findDownloadById(id: string) {
  return prisma.download.findUnique({ where: { id } });
}

export function findDownloadFile(id: string) {
  return prisma.download.findUnique({ where: { id }, select: { filePath: true } });
}

export function countDownloadByFilePath(filePath: string, excludeId: string) {
  return prisma.download.count({ where: { filePath, id: { not: excludeId } } });
}

export function createDownloadRecord(data: Prisma.DownloadCreateInput) {
  return prisma.download.create({ data });
}

export function updateDownloadRecord(id: string, data: Prisma.DownloadUpdateInput) {
  return prisma.download.update({ where: { id }, data });
}

export function deleteDownloadRecord(id: string) {
  return prisma.download.delete({ where: { id } });
}

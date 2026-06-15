import { type Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { resolveOrderBy, resolveSortDir, toSkipTake } from "../../utils/pagination";
import type { AdminBeritaQuery, BeritaListQuery } from "../shared/pagination.schema";

function buildSearchWhere(search: string): Prisma.BeritaWhereInput | undefined {
  if (!search) return undefined;
  return { caption: { contains: search } };
}

function beritaOrderBy(
  input: BeritaListQuery | AdminBeritaQuery,
): Prisma.BeritaOrderByWithRelationInput {
  const dir = resolveSortDir(input.sortDir, input.sort);
  return resolveOrderBy<Prisma.BeritaOrderByWithRelationInput>(
    {
      caption: (d) => ({ caption: d }),
      createdAt: (d) => ({ createdAt: d }),
    },
    input.sortBy,
    dir,
    (d) => ({ createdAt: d }),
  );
}

export async function findPublicBeritaRows(input: BeritaListQuery) {
  const { page, pageSize, search } = input;
  const { skip, take } = toSkipTake(page, pageSize);
  const where: Prisma.BeritaWhereInput = {
    ...(buildSearchWhere(search) ?? {}),
  };

  return prisma.$transaction([
    prisma.berita.findMany({
      where,
      orderBy: beritaOrderBy(input),
      skip,
      take,
    }),
    prisma.berita.count({ where }),
  ]);
}

export async function findAdminBeritaRows(input: AdminBeritaQuery) {
  const { page, pageSize, search } = input;
  const { skip, take } = toSkipTake(page, pageSize);
  const where: Prisma.BeritaWhereInput = {
    ...(buildSearchWhere(search) ?? {}),
  };

  return prisma.$transaction([
    prisma.berita.findMany({
      where,
      orderBy: beritaOrderBy(input),
      skip,
      take,
    }),
    prisma.berita.count({ where }),
  ]);
}

export function findBeritaById(id: string) {
  return prisma.berita.findUnique({ where: { id } });
}

export function findBeritaPoster(id: string) {
  return prisma.berita.findUnique({ where: { id }, select: { posterPath: true } });
}

export function countBeritaByPosterPath(posterPath: string, excludeId: string) {
  return prisma.berita.count({ where: { posterPath, id: { not: excludeId } } });
}

export function createBeritaRecord(data: Prisma.BeritaCreateInput) {
  return prisma.berita.create({ data });
}

export function updateBeritaRecord(id: string, data: Prisma.BeritaUpdateInput) {
  return prisma.berita.update({ where: { id }, data });
}

export function deleteBeritaRecord(id: string) {
  return prisma.berita.delete({ where: { id } });
}

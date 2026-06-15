import { type Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { resolveOrderBy, resolveSortDir, toSkipTake } from "../../utils/pagination";
import type { AdminRisetQuery, RisetListQuery } from "../shared/pagination.schema";

function buildSearchWhere(search: string): Prisma.RisetWhereInput | undefined {
  if (!search) return undefined;
  return {
    OR: [
      { judulKajian: { contains: search } },
      { timPeneliti: { contains: search } },
    ],
  };
}

function risetOrderBy(
  input: RisetListQuery | AdminRisetQuery,
): Prisma.RisetOrderByWithRelationInput {
  const dir = resolveSortDir(input.sortDir, input.sort);
  return resolveOrderBy<Prisma.RisetOrderByWithRelationInput>(
    {
      judulKajian: (d) => ({ judulKajian: d }),
      timPeneliti: (d) => ({ timPeneliti: d }),
      jenis: (d) => ({ jenis: d }),
      tahunPublikasi: (d) => ({ tahunPublikasi: d }),
      createdAt: (d) => ({ createdAt: d }),
    },
    input.sortBy,
    dir,
    (d) => ({ createdAt: d }),
  );
}

export async function findPublicRisetRows(input: RisetListQuery) {
  const { page, pageSize, search, jenis } = input;
  const { skip, take } = toSkipTake(page, pageSize);
  const where: Prisma.RisetWhereInput = {
    ...(jenis ? { jenis } : {}),
    ...(buildSearchWhere(search) ?? {}),
  };

  return prisma.$transaction([
    prisma.riset.findMany({
      where,
      orderBy: risetOrderBy(input),
      skip,
      take,
    }),
    prisma.riset.count({ where }),
  ]);
}

export async function findAdminRisetRows(input: AdminRisetQuery) {
  const { page, pageSize, search, jenis } = input;
  const { skip, take } = toSkipTake(page, pageSize);
  const where: Prisma.RisetWhereInput = {
    ...(jenis ? { jenis } : {}),
    ...(buildSearchWhere(search) ?? {}),
  };

  return prisma.$transaction([
    prisma.riset.findMany({
      where,
      orderBy: risetOrderBy(input),
      skip,
      take,
    }),
    prisma.riset.count({ where }),
  ]);
}

export function findRisetById(id: string) {
  return prisma.riset.findUnique({ where: { id } });
}

export function findRisetFile(id: string) {
  return prisma.riset.findUnique({ where: { id }, select: { filePath: true } });
}

export function countRisetByFilePath(filePath: string, excludeId: string) {
  return prisma.riset.count({ where: { filePath, id: { not: excludeId } } });
}

export function createRisetRecord(data: Prisma.RisetCreateInput) {
  return prisma.riset.create({ data });
}

export function updateRisetRecord(id: string, data: Prisma.RisetUpdateInput) {
  return prisma.riset.update({ where: { id }, data });
}

export function deleteRisetRecord(id: string) {
  return prisma.riset.delete({ where: { id } });
}

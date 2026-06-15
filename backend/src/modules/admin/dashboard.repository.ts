import { Role, Status, type Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { resolveSortDir, toSkipTake, type SortDirection } from "../../utils/pagination";
import type { AdminSubmissionsQuery } from "../shared/pagination.schema";

export const MAX_MERGE_PER_TABLE = 5000;

function buildInovasiSearchWhere(search: string): Prisma.InovasiDaerahWhereInput | undefined {
  if (!search) return undefined;
  return { OR: [{ namaInovasi: { contains: search } }, { user: { name: { contains: search } } }] };
}

function buildKrenovaSearchWhere(search: string): Prisma.KrenovaWhereInput | undefined {
  if (!search) return undefined;
  return { OR: [{ judulInovasi: { contains: search } }, { user: { name: { contains: search } } }] };
}

function inovasiSubmissionOrderBy(
  sortBy: string | undefined,
  dir: SortDirection,
): Prisma.InovasiDaerahOrderByWithRelationInput {
  if (sortBy === "title") return { namaInovasi: dir };
  if (sortBy === "submitter") return { user: { name: dir } };
  if (sortBy === "status") return { status: dir };
  return { createdAt: dir };
}

function krenovaSubmissionOrderBy(
  sortBy: string | undefined,
  dir: SortDirection,
): Prisma.KrenovaOrderByWithRelationInput {
  if (sortBy === "title") return { judulInovasi: dir };
  if (sortBy === "submitter") return { user: { name: dir } };
  if (sortBy === "status") return { status: dir };
  return { createdAt: dir };
}

export function countDashboardStats() {
  return Promise.all([
    prisma.user.count(),
    prisma.inovasiDaerah.count(),
    prisma.krenova.count(),
    prisma.inovasiDaerah.count({ where: { status: Status.Pending } }),
    prisma.krenova.count({ where: { status: Status.Pending } }),
    prisma.inovasiDaerah.count({ where: { status: Status.Disetujui } }),
    prisma.krenova.count({ where: { status: Status.Disetujui } }),
    prisma.inovasiDaerah.count({ where: { status: Status.Ditolak } }),
    prisma.krenova.count({ where: { status: Status.Ditolak } }),
    prisma.riset.count(),
    prisma.berita.count(),
    prisma.download.count(),
    prisma.user.count({ where: { role: Role.OPD } }),
    prisma.user.count({ where: { accounts: { some: { providerId: "google" } } } }),
  ]);
}

/**
 * Number of approved/total inovasi each OPD has uploaded. Only OPD users with
 * at least one inovasi are returned, ordered by count descending.
 */
export async function findInovasiCountPerOpd() {
  const rows = await prisma.user.findMany({
    where: { role: Role.OPD, inovasiDaerah: { some: {} } },
    select: {
      name: true,
      _count: { select: { inovasiDaerah: true } },
    },
    orderBy: { inovasiDaerah: { _count: "desc" } },
  });

  return rows.map((row) => ({ name: row.name, total: row._count.inovasiDaerah }));
}

export function findPendingInovasiSubmissionRows(input: AdminSubmissionsQuery) {
  const { page, pageSize, search } = input;
  const dir = resolveSortDir(input.sortDir, input.sort);
  const { skip, take } = toSkipTake(page, pageSize);
  const where: Prisma.InovasiDaerahWhereInput = { status: Status.Pending, ...(buildInovasiSearchWhere(search) ?? {}) };

  return prisma.$transaction([
    prisma.inovasiDaerah.findMany({
      where,
      select: { id: true, namaInovasi: true, createdAt: true, status: true, user: { select: { name: true } } },
      orderBy: inovasiSubmissionOrderBy(input.sortBy, dir),
      skip,
      take,
    }),
    prisma.inovasiDaerah.count({ where }),
  ]);
}

export function findPendingKrenovaSubmissionRows(input: AdminSubmissionsQuery) {
  const { page, pageSize, search } = input;
  const dir = resolveSortDir(input.sortDir, input.sort);
  const { skip, take } = toSkipTake(page, pageSize);
  const where: Prisma.KrenovaWhereInput = { status: Status.Pending, ...(buildKrenovaSearchWhere(search) ?? {}) };

  return prisma.$transaction([
    prisma.krenova.findMany({
      where,
      select: { id: true, judulInovasi: true, createdAt: true, status: true, user: { select: { name: true } } },
      orderBy: krenovaSubmissionOrderBy(input.sortBy, dir),
      skip,
      take,
    }),
    prisma.krenova.count({ where }),
  ]);
}

export function findMergedPendingSubmissionRows(input: AdminSubmissionsQuery) {
  const { page, pageSize, search } = input;
  const dir = resolveSortDir(input.sortDir, input.sort);
  const inovasiWhere: Prisma.InovasiDaerahWhereInput = { status: Status.Pending, ...(buildInovasiSearchWhere(search) ?? {}) };
  const krenovaWhere: Prisma.KrenovaWhereInput = { status: Status.Pending, ...(buildKrenovaSearchWhere(search) ?? {}) };
  // Fetch enough from each table to cover the target page after merge + sort.
  const take = Math.min(page * pageSize + pageSize, MAX_MERGE_PER_TABLE);

  return prisma.$transaction([
    prisma.inovasiDaerah.findMany({
      where: inovasiWhere,
      select: { id: true, namaInovasi: true, createdAt: true, status: true, user: { select: { name: true } } },
      orderBy: inovasiSubmissionOrderBy(input.sortBy, dir),
      take,
    }),
    prisma.inovasiDaerah.count({ where: inovasiWhere }),
    prisma.krenova.findMany({
      where: krenovaWhere,
      select: { id: true, judulInovasi: true, createdAt: true, status: true, user: { select: { name: true } } },
      orderBy: krenovaSubmissionOrderBy(input.sortBy, dir),
      take,
    }),
    prisma.krenova.count({ where: krenovaWhere }),
  ]);
}

import { Status, type Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { resolveOrderBy, resolveSortDir, toSkipTake } from "../../utils/pagination";
import type { AdminInovasiQuery, InovasiListQuery } from "../shared/pagination.schema";

function buildSearchWhere(search: string): Prisma.InovasiDaerahWhereInput | undefined {
  if (!search) return undefined;
  return {
    OR: [
      { namaInovasi: { contains: search } },
      { inisiator: { contains: search } },
      { bentukInovasi: { contains: search } },
    ],
  };
}

function inovasiOrderBy(
  input: InovasiListQuery | AdminInovasiQuery,
): Prisma.InovasiDaerahOrderByWithRelationInput {
  const dir = resolveSortDir(input.sortDir, input.sort);
  return resolveOrderBy<Prisma.InovasiDaerahOrderByWithRelationInput>(
    {
      namaInovasi: (d) => ({ namaInovasi: d }),
      inisiator: (d) => ({ inisiator: d }),
      jenisInovasi: (d) => ({ jenisInovasi: d }),
      tglPenerapan: (d) => ({ tglPenerapan: d }),
      status: (d) => ({ status: d }),
      createdAt: (d) => ({ createdAt: d }),
    },
    input.sortBy,
    dir,
    (d) => ({ createdAt: d }),
  );
}

export async function findPublicInovasiRows(input: InovasiListQuery) {
  const { page, pageSize, search, jenis } = input;
  const { skip, take } = toSkipTake(page, pageSize);
  const where: Prisma.InovasiDaerahWhereInput = {
    status: Status.Disetujui,
    ...(jenis ? { jenisInovasi: jenis } : {}),
    ...(buildSearchWhere(search) ?? {}),
  };

  return prisma.$transaction([
    prisma.inovasiDaerah.findMany({
      where,
      orderBy: inovasiOrderBy(input),
      select: {
        id: true,
        namaInovasi: true,
        inisiator: true,
        jenisInovasi: true,
        bentukInovasi: true,
        tglUjiCoba: true,
        tglPenerapan: true,
        rancangBangun: true,
        tujuan: true,
        manfaat: true,
        hasil: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      skip,
      take,
    }),
    prisma.inovasiDaerah.count({ where }),
  ]);
}

export async function findMyInovasiRows(userId: string, input: InovasiListQuery) {
  const { page, pageSize, search, jenis, status } = input;
  const { skip, take } = toSkipTake(page, pageSize);
  const where: Prisma.InovasiDaerahWhereInput = {
    userId,
    ...(jenis ? { jenisInovasi: jenis } : {}),
    ...(status ? { status } : {}),
    ...(buildSearchWhere(search) ?? {}),
  };

  return prisma.$transaction([
    prisma.inovasiDaerah.findMany({
      where,
      orderBy: inovasiOrderBy(input),
      include: { indikator: true },
      skip,
      take,
    }),
    prisma.inovasiDaerah.count({ where }),
  ]);
}

export async function findAdminInovasiRows(input: AdminInovasiQuery) {
  const { page, pageSize, search, jenis, status } = input;
  const { skip, take } = toSkipTake(page, pageSize);
  const where: Prisma.InovasiDaerahWhereInput = {
    ...(jenis ? { jenisInovasi: jenis } : {}),
    ...(status ? { status } : {}),
    ...(buildSearchWhere(search) ?? {}),
  };

  return prisma.$transaction([
    prisma.inovasiDaerah.findMany({
      where,
      orderBy: inovasiOrderBy(input),
      include: { user: { select: { id: true, name: true, email: true } } },
      skip,
      take,
    }),
    prisma.inovasiDaerah.count({ where }),
  ]);
}

export function countMyInovasiStats(userId: string) {
  return prisma.$transaction([
    prisma.inovasiDaerah.count({ where: { userId } }),
    prisma.inovasiDaerah.count({ where: { userId, status: Status.Pending } }),
    prisma.inovasiDaerah.count({ where: { userId, status: Status.Disetujui } }),
    prisma.inovasiDaerah.count({ where: { userId, status: Status.Ditolak } }),
  ]);
}

export function findInovasiById(id: string) {
  return prisma.inovasiDaerah.findUnique({
    where: { id },
    include: {
      indikator: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });
}

export function findVisibleInovasiById(id: string, user?: { id: string; role: string }) {
  const where: Prisma.InovasiDaerahWhereInput =
    user?.role === "Admin"
      ? { id }
      : {
          id,
          OR: [
            { status: Status.Disetujui },
            ...(user ? [{ userId: user.id }] : []),
          ],
        };

  return prisma.inovasiDaerah.findFirst({
    where,
    include: {
      indikator: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });
}

export function createInovasi(userId: string, data: Omit<Prisma.InovasiDaerahUncheckedCreateInput, "userId" | "id">) {
  return prisma.inovasiDaerah.create({ data: { ...data, userId, status: Status.Pending } });
}

export function updateInovasi(id: string, data: Prisma.InovasiDaerahUpdateInput) {
  return prisma.inovasiDaerah.update({ where: { id }, data });
}

export function deleteInovasi(id: string) {
  return prisma.inovasiDaerah.delete({ where: { id } });
}

export function setInovasiApproved(id: string) {
  return prisma.inovasiDaerah.update({ where: { id }, data: { status: Status.Disetujui } });
}

export function setInovasiRejected(id: string, reason?: string) {
  return prisma.inovasiDaerah.update({
    where: { id },
    data: { status: Status.Ditolak, alasanPenolakan: reason || null },
  });
}

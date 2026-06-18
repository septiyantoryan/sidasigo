import { Status, type Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { resolveOrderBy, resolveSortDir, toSkipTake } from "../../utils/pagination";
import type { AdminKrenovaQuery, KrenovaListQuery } from "../shared/pagination.schema";

function buildSearchWhere(search: string): Prisma.KrenovaWhereInput | undefined {
  if (!search) return undefined;
  return {
    OR: [
      { judulInovasi: { contains: search } },
      { namaInovator1: { contains: search } },
    ],
  };
}

function krenovaOrderBy(
  input: KrenovaListQuery | AdminKrenovaQuery,
): Prisma.KrenovaOrderByWithRelationInput {
  const dir = resolveSortDir(input.sortDir, input.sort);
  return resolveOrderBy<Prisma.KrenovaOrderByWithRelationInput>(
    {
      judulInovasi: (d) => ({ judulInovasi: d }),
      namaInovator1: (d) => ({ namaInovator1: d }),
      jenisInovasi: (d) => ({ jenisInovasi: d }),
      statusPelaku: (d) => ({ statusPelaku: d }),
      waktuPenerapan: (d) => ({ waktuPenerapan: d }),
      status: (d) => ({ status: d }),
      createdAt: (d) => ({ createdAt: d }),
    },
    input.sortBy,
    dir,
    (d) => ({ createdAt: d }),
  );
}

function buildPrivateSearchWhere(search: string): Prisma.KrenovaWhereInput | undefined {
  const where = buildSearchWhere(search);
  if (!where) return undefined;
  return { OR: [...(where.OR ?? []), { alamat: { contains: search } }] };
}

export async function findPublicKrenovaRows(input: KrenovaListQuery) {
  const { page, pageSize, search, jenis, statusPelaku } = input;
  const { skip, take } = toSkipTake(page, pageSize);
  const where: Prisma.KrenovaWhereInput = {
    status: Status.Disetujui,
    ...(jenis ? { jenisInovasi: jenis } : {}),
    ...(statusPelaku ? { statusPelaku } : {}),
    ...(buildSearchWhere(search) ?? {}),
  };

  return prisma.$transaction([
    prisma.krenova.findMany({
      where,
      orderBy: krenovaOrderBy(input),
      select: {
        id: true,
        judulInovasi: true,
        jenisInovasi: true,
        waktuUjiCoba: true,
        waktuPenerapan: true,
        tahapInovasi: true,
        statusPelaku: true,
        namaInovator1: true,
        namaInovator2: true,
        namaInovator3: true,
        namaInovator4: true,
        namaInovator5: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      skip,
      take,
    }),
    prisma.krenova.count({ where }),
  ]);
}

export async function findMyKrenovaRows(userId: string, input: KrenovaListQuery) {
  const { page, pageSize, search, jenis, statusPelaku, status } = input;
  const { skip, take } = toSkipTake(page, pageSize);
  const where: Prisma.KrenovaWhereInput = {
    userId,
    ...(jenis ? { jenisInovasi: jenis } : {}),
    ...(statusPelaku ? { statusPelaku } : {}),
    ...(status ? { status } : {}),
    ...(buildPrivateSearchWhere(search) ?? {}),
  };

  return prisma.$transaction([
    prisma.krenova.findMany({ where, orderBy: krenovaOrderBy(input), skip, take }),
    prisma.krenova.count({ where }),
  ]);
}

export function countMyKrenovaStats(userId: string) {
  return prisma.$transaction([
    prisma.krenova.count({ where: { userId } }),
    prisma.krenova.count({ where: { userId, status: Status.Pending } }),
    prisma.krenova.count({ where: { userId, status: Status.Disetujui } }),
    prisma.krenova.count({ where: { userId, status: Status.Ditolak } }),
  ]);
}

export async function findAdminKrenovaRows(input: AdminKrenovaQuery) {
  const { page, pageSize, search, jenis, statusPelaku, status } = input;
  const { skip, take } = toSkipTake(page, pageSize);
  const where: Prisma.KrenovaWhereInput = {
    ...(jenis ? { jenisInovasi: jenis } : {}),
    ...(statusPelaku ? { statusPelaku } : {}),
    ...(status ? { status } : {}),
    ...(buildSearchWhere(search) ?? {}),
  };

  return prisma.$transaction([
    prisma.krenova.findMany({
      where,
      orderBy: krenovaOrderBy(input),
      include: { user: { select: { id: true, name: true, email: true } } },
      skip,
      take,
    }),
    prisma.krenova.count({ where }),
  ]);
}

export function createKrenovaRecord(userId: string, data: Prisma.KrenovaUncheckedCreateInput) {
  return prisma.krenova.create({ data: { ...data, userId, status: Status.Pending } });
}

export function findKrenovaById(id: string) {
  return prisma.krenova.findUnique({
    where: { id },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
}

export function findVisibleKrenovaById(id: string, user?: { id: string; role: string }) {
  const where: Prisma.KrenovaWhereInput =
    user?.role === "Admin"
      ? { id }
      : {
          id,
          OR: [
            { status: Status.Disetujui },
            ...(user ? [{ userId: user.id }] : []),
          ],
        };

  return prisma.krenova.findFirst({
    where,
    include: {
      user: { select: { id: true, name: true, email: true } },
      attachments: { select: { id: true, field: true, path: true, createdAt: true } },
    },
  });
}

export function updateKrenovaRecord(id: string, data: Prisma.KrenovaUpdateInput) {
  return prisma.krenova.update({ where: { id }, data });
}

export function findKrenovaFiles(id: string) {
  return prisma.krenova.findUnique({
    where: { id },
    select: { dokumenProposal: true, lampiranOriginalitas: true, lampiranIdentitas: true },
  });
}

export function deleteKrenovaRecord(id: string) {
  return prisma.krenova.delete({ where: { id } });
}

export function setKrenovaApproved(id: string) {
  return prisma.krenova.update({ where: { id }, data: { status: Status.Disetujui } });
}

export function setKrenovaRejected(id: string, reason?: string) {
  return prisma.krenova.update({ where: { id }, data: { status: Status.Ditolak, alasanPenolakan: reason || null } });
}

// --- KrenovaAttachment ---

export function findKrenovaAttachments(krenovaId: string) {
  return prisma.krenovaAttachment.findMany({
    where: { krenovaId },
    select: { id: true, field: true, path: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
}

export function createKrenovaAttachment(krenovaId: string, field: string, path: string) {
  return prisma.krenovaAttachment.create({ data: { krenovaId, field, path } });
}

export function deleteKrenovaAttachmentsByField(krenovaId: string, field: string) {
  return prisma.krenovaAttachment.deleteMany({ where: { krenovaId, field } });
}

export async function findKrenovaAttachmentPaths(krenovaId: string): Promise<string[]> {
  const rows = await prisma.krenovaAttachment.findMany({
    where: { krenovaId },
    select: { path: true },
  });
  return rows.map((r) => r.path);
}

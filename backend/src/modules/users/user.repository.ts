import { Role, type Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { resolveOrderBy, resolveSortDir, toSkipTake } from "../../utils/pagination";
import type { AdminGoogleUsersQuery, AdminUsersQuery } from "../shared/pagination.schema";

function buildSearchWhere(search: string): Prisma.UserWhereInput | undefined {
  if (!search) return undefined;
  return { OR: [{ name: { contains: search } }, { email: { contains: search } }, { username: { contains: search } }] };
}

function usersOrderBy(input: AdminUsersQuery): Prisma.UserOrderByWithRelationInput {
  const dir = resolveSortDir(input.sortDir, input.sort);
  return resolveOrderBy<Prisma.UserOrderByWithRelationInput>(
    {
      name: (d) => ({ name: d }),
      email: (d) => ({ email: d }),
      username: (d) => ({ username: d }),
      role: (d) => ({ role: d }),
      createdAt: (d) => ({ createdAt: d }),
    },
    input.sortBy,
    dir,
    (d) => ({ createdAt: d }),
  );
}

export async function findUsersRows(input: AdminUsersQuery) {
  const { page, pageSize, search, role } = input;
  const { skip, take } = toSkipTake(page, pageSize);
  const where: Prisma.UserWhereInput = {
    role: role === "Admin" ? Role.Admin : role === "OPD" ? Role.OPD : { in: [Role.Admin, Role.OPD] },
    ...(buildSearchWhere(search) ?? {}),
  };

  return prisma.$transaction([
    prisma.user.findMany({
      where,
      orderBy: usersOrderBy(input),
      skip,
      take,
      select: { id: true, name: true, email: true, username: true, role: true, createdAt: true },
    }),
    prisma.user.count({ where }),
  ]);
}

function buildGoogleSearchWhere(search: string): Prisma.UserWhereInput | undefined {
  if (!search) return undefined;
  return { OR: [{ name: { contains: search } }, { email: { contains: search } }] };
}

function googleUsersOrderBy(
  input: AdminGoogleUsersQuery,
): Prisma.UserOrderByWithRelationInput {
  const dir = resolveSortDir(input.sortDir, input.sort);
  return resolveOrderBy<Prisma.UserOrderByWithRelationInput>(
    {
      name: (d) => ({ name: d }),
      email: (d) => ({ email: d }),
      createdAt: (d) => ({ createdAt: d }),
    },
    input.sortBy,
    dir,
    (d) => ({ createdAt: d }),
  );
}

export async function findGoogleUsersRows(input: AdminGoogleUsersQuery) {
  const { page, pageSize, search } = input;
  const { skip, take } = toSkipTake(page, pageSize);
  const where: Prisma.UserWhereInput = {
    accounts: { some: { providerId: "google" } },
    ...(buildGoogleSearchWhere(search) ?? {}),
  };

  return prisma.$transaction([
    prisma.user.findMany({
      where,
      orderBy: googleUsersOrderBy(input),
      skip,
      take,
      select: { id: true, name: true, email: true, createdAt: true },
    }),
    prisma.user.count({ where }),
  ]);
}

export function findUserByUsername(username: string) {
  return prisma.user.findUnique({ where: { username } });
}

export function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true },
  });
}

export function setUserAsOpd(id: string, username: string) {
  return prisma.user.update({
    where: { id },
    data: { role: Role.OPD, username, emailVerified: true },
    select: { id: true, name: true, email: true, username: true, role: true, createdAt: true },
  });
}

export function deleteUserById(id: string) {
  return prisma.user.delete({ where: { id } });
}

export function findCredentialAccountByUserId(userId: string) {
  return prisma.account.findFirst({
    where: { userId, providerId: "credential", password: { not: null } },
  });
}

export function updateAccountPassword(accountId: string, hashedPassword: string) {
  return prisma.account.update({
    where: { id: accountId },
    data: { password: hashedPassword },
  });
}

export function updateUserUsername(userId: string, username: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { username },
  });
}

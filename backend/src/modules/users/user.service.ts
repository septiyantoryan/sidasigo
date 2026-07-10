import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { auth } from "../../lib/auth";
import { AppError } from "../../utils/app-error";
import { buildPaginated } from "../../utils/pagination";
import type { AdminGoogleUsersQuery, AdminUsersQuery } from "../shared/pagination.schema";
import type { ChangePasswordAdminInput, ChangePasswordSelfInput, ChangeUsernameAdminInput, ChangeUsernameSelfInput, CreateOpdUserInput, ChangeEmailSelfInput, ChangeEmailAdminInput } from "./user.schema";
import {
  deleteUserById,
  findCredentialAccountByUserId,
  findGoogleUsersRows,
  findUserByEmail,
  findUserById,
  findUserByUsername,
  findUsersRows,
  setUserAsOpd,
  updateAccountPassword,
  updateUserEmail,
  updateUserUsername,
} from "./user.repository";

export async function listUsers(input: AdminUsersQuery) {
  const [items, total] = await findUsersRows(input);
  return buildPaginated(items, total, input.page, input.pageSize);
}

export async function listGoogleUsers(input: AdminGoogleUsersQuery) {
  const [items, total] = await findGoogleUsersRows(input);
  return buildPaginated(items, total, input.page, input.pageSize);
}

export async function createOpdUser(input: CreateOpdUserInput) {
  if (await findUserByUsername(input.username)) {
    throw new AppError("CONFLICT", "Username sudah dipakai", 409);
  }
  if (await findUserByEmail(input.email)) {
    throw new AppError("CONFLICT", "Email sudah dipakai", 409);
  }

  await auth.api.signUpEmail({ body: { email: input.email, password: input.password, name: input.name } });

  const created = await findUserByEmail(input.email);
  if (!created) {
    throw new Error("Failed to create user");
  }

  try {
    return await setUserAsOpd(created.id, input.username);
  } catch (err) {
    // Roll back the half-created account so the email/user isn't left dangling
    // as a Masyarakat record without username/role.
    await deleteUserById(created.id).catch(() => undefined);
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const target = (err.meta as { target?: string[] } | undefined)?.target ?? [];
      if (target.includes("username")) {
        throw new AppError("CONFLICT", "Username sudah dipakai", 409);
      }
    }
    throw err;
  }
}

export async function deleteUser(id: string, requesterId?: string) {
  if (requesterId && id === requesterId) {
    throw new AppError("FORBIDDEN", "Tidak dapat menghapus akun sendiri", 403);
  }
  const target = await findUserById(id);
  if (!target) {
    throw new AppError("NOT_FOUND", "User tidak ditemukan", 404);
  }
  if (target.role === "Admin") {
    throw new AppError("FORBIDDEN", "Akun Admin tidak dapat dihapus", 403);
  }
  await deleteUserById(id);
}

export async function changeOwnPassword(userId: string, input: ChangePasswordSelfInput) {
  const account = await findCredentialAccountByUserId(userId);
  if (!account || !account.password) {
    throw new AppError("NOT_FOUND", "Akun kredensial tidak ditemukan", 404);
  }

  const valid = bcrypt.compareSync(input.oldPassword, account.password);
  if (!valid) {
    throw new AppError("UNAUTHORIZED", "Password lama tidak sesuai", 401);
  }

  const hashed = bcrypt.hashSync(input.newPassword, 10);
  await updateAccountPassword(account.id, hashed);
}

export async function changeOwnUsername(userId: string, input: ChangeUsernameSelfInput) {
  const account = await findCredentialAccountByUserId(userId);
  if (!account || !account.password) {
    throw new AppError("NOT_FOUND", "Akun kredensial tidak ditemukan", 404);
  }

  const valid = bcrypt.compareSync(input.password, account.password);
  if (!valid) {
    throw new AppError("UNAUTHORIZED", "Password tidak sesuai", 401);
  }

  const existing = await findUserByUsername(input.username);
  if (existing && existing.id !== userId) {
    throw new AppError("CONFLICT", "Username sudah dipakai", 409);
  }

  await updateUserUsername(userId, input.username);
}

export async function adminChangeUsername(userId: string, input: ChangeUsernameAdminInput) {
  const existing = await findUserByUsername(input.username);
  if (existing && existing.id !== userId) {
    throw new AppError("CONFLICT", "Username sudah dipakai", 409);
  }

  await updateUserUsername(userId, input.username);
}

export async function adminChangePassword(userId: string, input: ChangePasswordAdminInput) {
  const account = await findCredentialAccountByUserId(userId);
  if (!account) {
    throw new AppError("NOT_FOUND", "Akun kredensial tidak ditemukan", 404);
  }

  const hashed = bcrypt.hashSync(input.newPassword, 10);
  await updateAccountPassword(account.id, hashed);
}

export async function changeOwnEmail(userId: string, input: ChangeEmailSelfInput) {
  const user = await findUserById(userId);
  if (!user) {
    throw new AppError("NOT_FOUND", "User tidak ditemukan", 404);
  }
  if (user.role !== "Admin" && user.role !== "OPD") {
    throw new AppError("FORBIDDEN", "Hanya Admin atau OPD yang dapat mengubah email", 403);
  }

  const account = await findCredentialAccountByUserId(userId);
  if (!account) {
    throw new AppError("NOT_FOUND", "Akun kredensial tidak ditemukan", 404);
  }

  if (!account.password || !bcrypt.compareSync(input.password, account.password)) {
    throw new AppError("UNAUTHORIZED", "Password tidak sesuai", 401);
  }

  const existing = await findUserByEmail(input.email);
  if (existing && existing.id !== userId) {
    throw new AppError("CONFLICT", "Email sudah dipakai", 409);
  }

  await updateUserEmail(userId, input.email);
}

export async function adminChangeEmail(userId: string, input: ChangeEmailAdminInput) {
  const user = await findUserById(userId);
  if (!user) {
    throw new AppError("NOT_FOUND", "User tidak ditemukan", 404);
  }
  if (user.role !== "Admin" && user.role !== "OPD") {
    throw new AppError("FORBIDDEN", "Hanya Admin atau OPD yang dapat mengubah email", 403);
  }

  const existing = await findUserByEmail(input.email);
  if (existing && existing.id !== userId) {
    throw new AppError("CONFLICT", "Email sudah dipakai", 409);
  }

  await updateUserEmail(userId, input.email);
}

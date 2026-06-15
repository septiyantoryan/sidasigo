import type { RequestHandler } from "express";
import { uploadPublicSingle } from "../../lib/public-upload";
import { error, success } from "../../utils/response";
import { findAdminInovasiDaerahPaginated } from "../inovasi-daerah/inovasi-daerah.service";
import { findAdminKrenovaPaginated } from "../krenova/krenova.service";
import {
  adminGoogleUsersQuerySchema,
  adminInovasiQuerySchema,
  adminKrenovaQuerySchema,
  adminSubmissionsQuerySchema,
  adminUsersQuerySchema,
} from "../shared/pagination.schema";
import { getSettings, updateSettings } from "../settings/setting.service";
import { createOpdUser, deleteUser, listGoogleUsers, listUsers } from "../users/user.service";
import { changePasswordAdminSchema, changeUsernameAdminSchema } from "../users/user.schema";
import { adminChangePassword, adminChangeUsername } from "../users/user.service";
import { getDashboardStats, getPendingSubmissionsPaginated } from "./dashboard.service";

export { uploadPublicSingle };

export const getAdminDashboard: RequestHandler = async (_request, response) => {
  success(response, await getDashboardStats());
};

export const getAdminSubmissions: RequestHandler = async (request, response) => {
  const parsed = adminSubmissionsQuerySchema.safeParse(request.query);
  if (!parsed.success) {
    error(response, "VALIDATION_ERROR", "Invalid query", 400, parsed.error.issues);
    return;
  }
  success(response, await getPendingSubmissionsPaginated(parsed.data));
};

export const getAdminUsers: RequestHandler = async (request, response) => {
  const parsed = adminUsersQuerySchema.safeParse(request.query);
  if (!parsed.success) {
    error(response, "VALIDATION_ERROR", "Invalid query", 400, parsed.error.issues);
    return;
  }
  success(response, await listUsers(parsed.data));
};

export const getAdminGoogleUsers: RequestHandler = async (request, response) => {
  const parsed = adminGoogleUsersQuerySchema.safeParse(request.query);
  if (!parsed.success) {
    error(response, "VALIDATION_ERROR", "Invalid query", 400, parsed.error.issues);
    return;
  }
  success(response, await listGoogleUsers(parsed.data));
};

export const postAdminUser: RequestHandler = async (request, response) => {
  success(response, await createOpdUser(request.body), 201);
};

export const deleteAdminUser: RequestHandler = async (request, response) => {
  const id = String(request.params.id);
  await deleteUser(id, request.user?.id);
  success(response, { id });
};

export const getAdminInovasiDaerah: RequestHandler = async (request, response) => {
  const parsed = adminInovasiQuerySchema.safeParse(request.query);
  if (!parsed.success) {
    error(response, "VALIDATION_ERROR", "Invalid query", 400, parsed.error.issues);
    return;
  }
  success(response, await findAdminInovasiDaerahPaginated(parsed.data));
};

export const getAdminKrenova: RequestHandler = async (request, response) => {
  const parsed = adminKrenovaQuerySchema.safeParse(request.query);
  if (!parsed.success) {
    error(response, "VALIDATION_ERROR", "Invalid query", 400, parsed.error.issues);
    return;
  }
  success(response, await findAdminKrenovaPaginated(parsed.data));
};

export const getAdminSettings: RequestHandler = async (_request, response) => {
  success(response, await getSettings());
};

export const putAdminSettings: RequestHandler = async (request, response) => {
  success(response, await updateSettings(request.body));
};

export const postHeroImage: RequestHandler = async (request, response) => {
  if (!request.file) {
    error(response, "VALIDATION_ERROR", "File is required", 400);
    return;
  }

  const publicPath = `/api/public-files/${request.file.filename}`;
  const data = await updateSettings({ heroImagePath: publicPath });
  success(response, { path: publicPath, setting: data }, 201);
};

export const putAdminUserPassword: RequestHandler = async (request, response) => {
  const parsed = changePasswordAdminSchema.safeParse(request.body);
  if (!parsed.success) {
    error(response, "VALIDATION_ERROR", "Input tidak valid", 400, parsed.error.issues);
    return;
  }

  try {
    await adminChangePassword(String(request.params.id), parsed.data);
    success(response, { message: "Password berhasil diubah" });
  } catch (err) {
    if (err instanceof Error && err.message === "Akun kredensial tidak ditemukan") {
      error(response, "NOT_FOUND", err.message, 404);
      return;
    }
    throw err;
  }
};

export const putAdminUsername: RequestHandler = async (request, response) => {
  const parsed = changeUsernameAdminSchema.safeParse(request.body);
  if (!parsed.success) {
    error(response, "VALIDATION_ERROR", "Input tidak valid", 400, parsed.error.issues);
    return;
  }

  try {
    await adminChangeUsername(String(request.params.id), parsed.data);
    success(response, { message: "Username berhasil diubah" });
  } catch (err) {
    if (err instanceof Error && err.message === "Username sudah dipakai") {
      error(response, "CONFLICT", err.message, 409);
      return;
    }
    throw err;
  }
};

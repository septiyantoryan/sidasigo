import type { RequestHandler } from "express";
import { changeOwnPassword, changeOwnUsername } from "./user.service";
import { changePasswordSelfSchema, changeUsernameSelfSchema } from "./user.schema";
import { error, success } from "../../utils/response";

export const putChangePassword: RequestHandler = async (request, response) => {
  const parsed = changePasswordSelfSchema.safeParse(request.body);
  if (!parsed.success) {
    error(response, "VALIDATION_ERROR", "Input tidak valid", 400, parsed.error.issues);
    return;
  }

  try {
    await changeOwnPassword(request.user!.id, parsed.data);
    success(response, { message: "Password berhasil diubah" });
  } catch (err) {
    if (err instanceof Error && err.message === "Password lama tidak sesuai") {
      error(response, "UNAUTHORIZED", err.message, 401);
      return;
    }
    throw err;
  }
};

export const putChangeUsername: RequestHandler = async (request, response) => {
  const parsed = changeUsernameSelfSchema.safeParse(request.body);
  if (!parsed.success) {
    error(response, "VALIDATION_ERROR", "Input tidak valid", 400, parsed.error.issues);
    return;
  }

  try {
    await changeOwnUsername(request.user!.id, parsed.data);
    success(response, { message: "Username berhasil diubah" });
  } catch (err) {
    if (err instanceof Error && err.message === "Password tidak sesuai") {
      error(response, "UNAUTHORIZED", err.message, 401);
      return;
    }
    if (err instanceof Error && err.message === "Username sudah dipakai") {
      error(response, "CONFLICT", err.message, 409);
      return;
    }
    throw err;
  }
};

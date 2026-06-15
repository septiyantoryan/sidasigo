import type { ErrorRequestHandler } from "express";
import { Prisma } from "@prisma/client";
import { MulterError } from "multer";
import { ZodError } from "zod";
import { AppError } from "../utils/app-error";
import { error } from "../utils/response";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    error(res, err.code, err.message, err.status);
    return;
  }

  if (err instanceof ZodError) {
    error(res, "VALIDATION_ERROR", "Validation failed", 400, err.issues);
    return;
  }

  if (err instanceof MulterError) {
    error(res, "FILE_TOO_LARGE", err.message, 400);
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      error(res, "NOT_FOUND", "Data tidak ditemukan", 404);
      return;
    }
    if (err.code === "P2002") {
      error(res, "CONFLICT", "Data sudah ada", 409);
      return;
    }
    error(res, "BAD_REQUEST", "Permintaan tidak dapat diproses", 400);
    return;
  }

  if (err instanceof Error && err.message === "FILE_TYPE_INVALID") {
    error(res, "FILE_TYPE_INVALID", "Invalid file type", 400);
    return;
  }

  // Unknown error: log detail server-side, return generic message to client.
  console.error("[error]", err);
  error(res, "INTERNAL_ERROR", "Terjadi kesalahan internal", 500);
};

import type { RequestHandler } from "express";
import { Status } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { error } from "../utils/response";

export const ownInovasiDaerah: RequestHandler = async (request, response, next) => {
  if (!request.user) {
    error(response, "UNAUTHORIZED", "Unauthorized", 401);
    return;
  }

  if (request.user.role === "Admin") {
    next();
    return;
  }

  const inovasi = await prisma.inovasiDaerah.findUnique({
    where: { id: String(request.params.id) },
    select: { userId: true, status: true },
  });

  if (!inovasi) {
    error(response, "NOT_FOUND", "Inovasi daerah not found", 404);
    return;
  }

  if (inovasi.userId !== request.user.id) {
    error(response, "FORBIDDEN", "Forbidden", 403);
    return;
  }

  request.owningEntity = { id: String(request.params.id), status: inovasi.status };
  next();
};

export const ownKrenova: RequestHandler = async (request, response, next) => {
  if (!request.user) {
    error(response, "UNAUTHORIZED", "Unauthorized", 401);
    return;
  }

  if (request.user.role === "Admin") {
    next();
    return;
  }

  const krenova = await prisma.krenova.findUnique({
    where: { id: String(request.params.id) },
    select: { userId: true, status: true },
  });

  if (!krenova) {
    error(response, "NOT_FOUND", "Krenova not found", 404);
    return;
  }

  if (krenova.userId !== request.user.id) {
    error(response, "FORBIDDEN", "Forbidden", 403);
    return;
  }

  request.owningEntity = { id: String(request.params.id), status: krenova.status };
  next();
};

/**
 * Pemilik (non-admin) hanya boleh menghapus / mengubah row dengan status Pending.
 * Admin dilewatkan tanpa pengecekan.
 */
export const requirePendingForOwner = (
  entity: "inovasi" | "krenova",
): RequestHandler => async (request, response, next) => {
  if (!request.user) {
    error(response, "UNAUTHORIZED", "Unauthorized", 401);
    return;
  }

  if (request.user.role === "Admin") {
    next();
    return;
  }

  // Reuse entity data already fetched by ownInovasiDaerah / ownKrenova.
  if (request.owningEntity) {
    if (request.owningEntity.status !== Status.Pending) {
      error(response, "FORBIDDEN", "Hanya submission berstatus Pending yang dapat diubah atau dihapus.", 403);
      return;
    }
    next();
    return;
  }

  const id = String(request.params.id);

  const row =
    entity === "inovasi"
      ? await prisma.inovasiDaerah.findUnique({
          where: { id },
          select: { status: true },
        })
      : await prisma.krenova.findUnique({
          where: { id },
          select: { status: true },
        });

  if (!row) {
    error(
      response,
      "NOT_FOUND",
      entity === "inovasi" ? "Inovasi daerah not found" : "Krenova not found",
      404,
    );
    return;
  }

  if (row.status !== Status.Pending) {
    error(
      response,
      "FORBIDDEN",
      "Hanya submission berstatus Pending yang dapat diubah atau dihapus.",
      403,
    );
    return;
  }

  request.owningEntity = { id, status: row.status };
  next();
};

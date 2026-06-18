import type { RequestHandler } from "express";
import { error, success } from "../../utils/response";
import { inovasiListQuerySchema } from "../shared/pagination.schema";
import {
  approveInovasiDaerah,
  createInovasiDaerah,
  createOrUpdateIndikator,
  deleteInovasiDaerah,
  findInovasiDaerahById,
  findInovasiDaerahPaginated,
  findMyInovasiDaerahPaginated,
  findMyInovasiDaerahStats,
  findVisibleInovasiDaerahById,
  rejectInovasiDaerah,
  updateInovasiDaerah,
} from "./inovasi-daerah.service";

export const getPublicInovasiDaerah: RequestHandler = async (request, response) => {
  const parsed = inovasiListQuerySchema.safeParse(request.query);
  if (!parsed.success) {
    error(response, "VALIDATION_ERROR", "Invalid query", 400, parsed.error.issues);
    return;
  }
  const result = await findInovasiDaerahPaginated(parsed.data);
  success(response, result);
};

export const getMyInovasiDaerah: RequestHandler = async (request, response) => {
  if (!request.user) {
    error(response, "UNAUTHORIZED", "Unauthorized", 401);
    return;
  }
  const parsed = inovasiListQuerySchema.safeParse(request.query);
  if (!parsed.success) {
    error(response, "VALIDATION_ERROR", "Invalid query", 400, parsed.error.issues);
    return;
  }
  const result = await findMyInovasiDaerahPaginated(request.user.id, parsed.data);
  success(response, result);
};

export const getMyInovasiStats: RequestHandler = async (request, response) => {
  if (!request.user) {
    error(response, "UNAUTHORIZED", "Unauthorized", 401);
    return;
  }
  const result = await findMyInovasiDaerahStats(request.user.id);
  success(response, result);
};

export const getInovasiDaerahDetail: RequestHandler = async (request, response) => {
  const data = await findVisibleInovasiDaerahById(String(request.params.id), request.user);
  if (!data) {
    error(response, "NOT_FOUND", "Inovasi daerah not found", 404);
    return;
  }
  const canViewOwner = request.user?.role === "Admin" || request.user?.id === data.userId;
  if (!canViewOwner) {
    // Explicit allowlist for public consumers: never leak userId/user or the
    // private indikator (which references auth-gated document files).
    success(response, {
      id: data.id,
      namaInovasi: data.namaInovasi,
      inisiator: data.inisiator,
      jenisInovasi: data.jenisInovasi,
      bentukInovasi: data.bentukInovasi,
      tglUjiCoba: data.tglUjiCoba,
      tglPenerapan: data.tglPenerapan,
      rancangBangun: data.rancangBangun,
      tujuan: data.tujuan,
      manfaat: data.manfaat,
      hasil: data.hasil,
      status: data.status,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
    return;
  }
  success(response, data);
};

export const postInovasiDaerah: RequestHandler = async (request, response) => {
  if (!request.user) {
    error(response, "UNAUTHORIZED", "Unauthorized", 401);
    return;
  }
  const created = await createInovasiDaerah(request.user.id, request.body);
  success(response, created, 201);
};

export const putInovasiDaerah: RequestHandler = async (request, response) => {
  const updated = await updateInovasiDaerah(String(request.params.id), request.body);
  success(response, updated);
};

export const deleteInovasiDaerahHandler: RequestHandler = async (request, response) => {
  const id = String(request.params.id);
  await deleteInovasiDaerah(id);
  success(response, { id });
};

export const putApproveInovasiDaerah: RequestHandler = async (request, response) => {
  const approved = await approveInovasiDaerah(String(request.params.id));
  success(response, approved);
};

export const putRejectInovasiDaerah: RequestHandler = async (request, response) => {
  const rejected = await rejectInovasiDaerah(String(request.params.id), request.body?.reason);
  success(response, rejected);
};

export const putIndikator: RequestHandler = async (request, response) => {
  const { attachments, ...indikatorData } = request.body as {
    attachments?: { field: string; path: string }[];
    [key: string]: unknown;
  };
  const result = await createOrUpdateIndikator(
    String(request.params.id),
    indikatorData,
    attachments,
  );
  success(response, result);
};

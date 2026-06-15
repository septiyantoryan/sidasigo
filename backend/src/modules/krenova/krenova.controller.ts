import type { RequestHandler } from "express";
import { error, success } from "../../utils/response";
import { krenovaListQuerySchema } from "../shared/pagination.schema";
import {
  approveKrenova,
  createKrenova,
  deleteKrenova,
  findKrenovaById,
  findKrenovaPaginated,
  findMyKrenovaPaginated,
  findMyKrenovaStats,
  findVisibleKrenovaById,
  rejectKrenova,
  updateKrenova,
} from "./krenova.service";

export const getPublicKrenova: RequestHandler = async (request, response) => {
  const parsed = krenovaListQuerySchema.safeParse(request.query);
  if (!parsed.success) {
    error(response, "VALIDATION_ERROR", "Invalid query", 400, parsed.error.issues);
    return;
  }
  success(response, await findKrenovaPaginated(parsed.data));
};

export const getMyKrenova: RequestHandler = async (request, response) => {
  if (!request.user) {
    error(response, "UNAUTHORIZED", "Unauthorized", 401);
    return;
  }
  const parsed = krenovaListQuerySchema.safeParse(request.query);
  if (!parsed.success) {
    error(response, "VALIDATION_ERROR", "Invalid query", 400, parsed.error.issues);
    return;
  }
  success(response, await findMyKrenovaPaginated(request.user.id, parsed.data));
};

export const getMyKrenovaStats: RequestHandler = async (request, response) => {
  if (!request.user) {
    error(response, "UNAUTHORIZED", "Unauthorized", 401);
    return;
  }
  success(response, await findMyKrenovaStats(request.user.id));
};

export const getKrenovaDetail: RequestHandler = async (request, response) => {
  const data = await findVisibleKrenovaById(String(request.params.id), request.user);
  if (!data) {
    error(response, "NOT_FOUND", "Krenova not found", 404);
    return;
  }
  const canViewPrivate = request.user?.role === "Admin" || request.user?.id === data.userId;
  if (!canViewPrivate) {
    // Explicit allowlist for public consumers: never leak applicant contact
    // details (alamat, nomorHp), document file paths, or userId/user.
    success(response, {
      id: data.id,
      judulInovasi: data.judulInovasi,
      jenisInovasi: data.jenisInovasi,
      waktuUjiCoba: data.waktuUjiCoba,
      waktuPenerapan: data.waktuPenerapan,
      tahapInovasi: data.tahapInovasi,
      statusPelaku: data.statusPelaku,
      namaInovator1: data.namaInovator1,
      namaInovator2: data.namaInovator2,
      namaInovator3: data.namaInovator3,
      namaInovator4: data.namaInovator4,
      namaInovator5: data.namaInovator5,
      status: data.status,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
    return;
  }
  success(response, data);
};

export const postKrenova: RequestHandler = async (request, response) => {
  if (!request.user) {
    error(response, "UNAUTHORIZED", "Unauthorized", 401);
    return;
  }
  success(response, await createKrenova(request.user.id, request.body), 201);
};

export const putKrenova: RequestHandler = async (request, response) => {
  success(response, await updateKrenova(String(request.params.id), request.body));
};

export const deleteKrenovaHandler: RequestHandler = async (request, response) => {
  const id = String(request.params.id);
  await deleteKrenova(id);
  success(response, { id });
};

export const putApproveKrenova: RequestHandler = async (request, response) => {
  success(response, await approveKrenova(String(request.params.id)));
};

export const putRejectKrenova: RequestHandler = async (request, response) => {
  success(response, await rejectKrenova(String(request.params.id), request.body?.reason));
};

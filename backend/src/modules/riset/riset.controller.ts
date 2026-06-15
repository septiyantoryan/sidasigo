import type { RequestHandler } from "express";
import { error, success } from "../../utils/response";
import { risetListQuerySchema, adminRisetQuerySchema } from "../shared/pagination.schema";
import {
  createRiset,
  deleteRiset,
  findAdminRisetPaginated,
  findRisetById,
  findRisetPaginated,
  updateRiset,
} from "./riset.service";

export const getPublicRiset: RequestHandler = async (request, response) => {
  const parsed = risetListQuerySchema.safeParse(request.query);
  if (!parsed.success) {
    error(response, "VALIDATION_ERROR", "Invalid query", 400, parsed.error.issues);
    return;
  }
  success(response, await findRisetPaginated(parsed.data));
};

export const getRisetDetail: RequestHandler = async (request, response) => {
  const data = await findRisetById(String(request.params.id));
  if (!data) {
    error(response, "NOT_FOUND", "Riset/Kajian tidak ditemukan", 404);
    return;
  }
  success(response, data);
};

export const getAdminRiset: RequestHandler = async (request, response) => {
  const parsed = adminRisetQuerySchema.safeParse(request.query);
  if (!parsed.success) {
    error(response, "VALIDATION_ERROR", "Invalid query", 400, parsed.error.issues);
    return;
  }
  success(response, await findAdminRisetPaginated(parsed.data));
};

export const postRiset: RequestHandler = async (request, response) => {
  success(response, await createRiset(request.body), 201);
};

export const putRiset: RequestHandler = async (request, response) => {
  const id = String(request.params.id);
  const existing = await findRisetById(id);
  if (!existing) {
    error(response, "NOT_FOUND", "Riset/Kajian tidak ditemukan", 404);
    return;
  }
  success(response, await updateRiset(id, request.body));
};

export const deleteRisetHandler: RequestHandler = async (request, response) => {
  const id = String(request.params.id);
  const existing = await findRisetById(id);
  if (!existing) {
    error(response, "NOT_FOUND", "Riset/Kajian tidak ditemukan", 404);
    return;
  }
  await deleteRiset(id);
  success(response, { id });
};

export const postRisetUpload: RequestHandler = (request, response) => {
  if (!request.file) {
    error(response, "VALIDATION_ERROR", "File is required", 400);
    return;
  }

  const publicPath = `/api/public-files/${request.file.filename}`;
  success(response, { path: publicPath }, 201);
};

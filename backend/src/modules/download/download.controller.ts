import type { RequestHandler } from "express";
import { error, success } from "../../utils/response";
import { downloadListQuerySchema, adminDownloadQuerySchema } from "../shared/pagination.schema";
import {
  createDownload,
  deleteDownload,
  findAdminDownloadPaginated,
  findDownloadById,
  findDownloadPaginated,
  updateDownload,
} from "./download.service";

export const getPublicDownload: RequestHandler = async (request, response) => {
  const parsed = downloadListQuerySchema.safeParse(request.query);
  if (!parsed.success) {
    error(response, "VALIDATION_ERROR", "Invalid query", 400, parsed.error.issues);
    return;
  }
  success(response, await findDownloadPaginated(parsed.data));
};

export const getAdminDownload: RequestHandler = async (request, response) => {
  const parsed = adminDownloadQuerySchema.safeParse(request.query);
  if (!parsed.success) {
    error(response, "VALIDATION_ERROR", "Invalid query", 400, parsed.error.issues);
    return;
  }
  success(response, await findAdminDownloadPaginated(parsed.data));
};

export const getDownloadDetail: RequestHandler = async (request, response) => {
  const data = await findDownloadById(String(request.params.id));
  if (!data) {
    error(response, "NOT_FOUND", "Dokumen tidak ditemukan", 404);
    return;
  }
  success(response, data);
};

export const postDownload: RequestHandler = async (request, response) => {
  success(response, await createDownload(request.body), 201);
};

export const putDownload: RequestHandler = async (request, response) => {
  const id = String(request.params.id);
  const existing = await findDownloadById(id);
  if (!existing) {
    error(response, "NOT_FOUND", "Dokumen tidak ditemukan", 404);
    return;
  }
  success(response, await updateDownload(id, request.body));
};

export const deleteDownloadHandler: RequestHandler = async (request, response) => {
  const id = String(request.params.id);
  const existing = await findDownloadById(id);
  if (!existing) {
    error(response, "NOT_FOUND", "Dokumen tidak ditemukan", 404);
    return;
  }
  await deleteDownload(id);
  success(response, { id });
};

export const postDownloadUpload: RequestHandler = (request, response) => {
  if (!request.file) {
    error(response, "VALIDATION_ERROR", "File is required", 400);
    return;
  }

  const publicPath = `/api/public-files/${request.file.filename}`;
  success(response, { path: publicPath }, 201);
};

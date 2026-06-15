import type { RequestHandler } from "express";
import { error, success } from "../../utils/response";
import { beritaListQuerySchema, adminBeritaQuerySchema } from "../shared/pagination.schema";
import {
  createBerita,
  deleteBerita,
  findAdminBeritaPaginated,
  findBeritaById,
  findBeritaPaginated,
  updateBerita,
} from "./berita.service";

export const getPublicBerita: RequestHandler = async (request, response) => {
  const parsed = beritaListQuerySchema.safeParse(request.query);
  if (!parsed.success) {
    error(response, "VALIDATION_ERROR", "Invalid query", 400, parsed.error.issues);
    return;
  }
  success(response, await findBeritaPaginated(parsed.data));
};

export const getBeritaDetail: RequestHandler = async (request, response) => {
  const data = await findBeritaById(String(request.params.id));
  if (!data) {
    error(response, "NOT_FOUND", "Berita tidak ditemukan", 404);
    return;
  }
  success(response, data);
};

export const getAdminBerita: RequestHandler = async (request, response) => {
  const parsed = adminBeritaQuerySchema.safeParse(request.query);
  if (!parsed.success) {
    error(response, "VALIDATION_ERROR", "Invalid query", 400, parsed.error.issues);
    return;
  }
  success(response, await findAdminBeritaPaginated(parsed.data));
};

export const postBerita: RequestHandler = async (request, response) => {
  success(response, await createBerita(request.body), 201);
};

export const putBerita: RequestHandler = async (request, response) => {
  const id = String(request.params.id);
  const existing = await findBeritaById(id);
  if (!existing) {
    error(response, "NOT_FOUND", "Berita tidak ditemukan", 404);
    return;
  }
  success(response, await updateBerita(id, request.body));
};

export const deleteBeritaHandler: RequestHandler = async (request, response) => {
  const id = String(request.params.id);
  const existing = await findBeritaById(id);
  if (!existing) {
    error(response, "NOT_FOUND", "Berita tidak ditemukan", 404);
    return;
  }
  await deleteBerita(id);
  success(response, { id });
};

export const postBeritaUpload: RequestHandler = (request, response) => {
  if (!request.file) {
    error(response, "VALIDATION_ERROR", "File is required", 400);
    return;
  }

  const publicPath = `/api/public-files/${request.file.filename}`;
  success(response, { path: publicPath }, 201);
};

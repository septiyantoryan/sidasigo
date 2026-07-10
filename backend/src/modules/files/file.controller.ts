import fs from "node:fs";
import path from "node:path";
import type { RequestHandler } from "express";
import { resolveUploadPath, uploadRoot } from "../../utils/file";
import { error } from "../../utils/response";
import { isFileAccessibleBy, isPublicKrenovaPhoto } from "./file.repository";

export const getFile: RequestHandler = async (request, response) => {
  const filename = String(request.params.filename ?? "");
  const resolved = resolveUploadPath(filename);

  if (!resolved) {
    error(response, "BAD_REQUEST", "Invalid file path", 400);
    return;
  }

  // Use the canonical relative path inside the upload root (e.g.
  // "inovasi/<id>/<file>") so access checks match stored values for both the
  // new category/id layout and legacy bare filenames.
  const relative = path.relative(uploadRoot, resolved).replace(/\\/g, "/");

  // Public Krenova detail pages show product photos to unauthenticated users,
  // but other private upload files remain protected.
  const publicKrenovaPhoto = await isPublicKrenovaPhoto(relative);

  // Object-level authorization: admins can access any file; other users may
  // only access files referenced by their own records, unless the file is a
  // public Krenova product photo from an approved submission.
  if (request.user?.role !== "Admin" && !publicKrenovaPhoto) {
    if (!request.user) {
      error(response, "UNAUTHORIZED", "Unauthorized", 401);
      return;
    }
    const allowed = await isFileAccessibleBy(request.user.id, relative);
    if (!allowed) {
      error(response, "FORBIDDEN", "Forbidden", 403);
      return;
    }
  }

  if (!fs.existsSync(resolved)) {
    error(response, "NOT_FOUND", "File tidak ditemukan", 404);
    return;
  }

  response.sendFile(resolved);
};

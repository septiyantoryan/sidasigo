import type { RequestHandler } from "express";
import { success } from "../../utils/response";

export const uploadSingleHandler: RequestHandler = (request, response) => {
  if (!request.file) {
    response.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "File is required", details: [] },
    });
    return;
  }

  success(response, {
    filename: request.file.filename,
    path: request.file.filename,
    mimeType: request.file.mimetype,
    size: request.file.size,
  });
};

import type { RequestHandler } from "express";
import type { ZodSchema } from "zod";
import { error } from "../utils/response";

export function validate<T>(schema: ZodSchema<T>): RequestHandler {
  return (request, response, next) => {
    const result = schema.safeParse(request.body);

    if (!result.success) {
      error(
        response,
        "VALIDATION_ERROR",
        "Validation failed",
        400,
        result.error.issues,
      );
      return;
    }

    request.body = result.data;
    next();
  };
}

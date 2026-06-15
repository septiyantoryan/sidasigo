import type { Response } from "express";

export function success<T>(response: Response, data: T, status = 200) {
  return response.status(status).json({
    success: true,
    data,
  });
}

export function error(
  response: Response,
  code: string,
  message: string,
  status: number,
  details: unknown[] = [],
) {
  return response.status(status).json({
    success: false,
    error: {
      code,
      message,
      details,
    },
  });
}

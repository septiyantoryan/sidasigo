import type { RequestHandler } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth";
import { error } from "../utils/response";

export const requireAuth: RequestHandler = async (request, response, next) => {
  if (process.env.NODE_ENV === "test" && typeof process.env.VITEST !== "undefined") {
    const role = request.header("x-test-role");
    const userId = request.header("x-test-user-id");

    if (!role || !userId) {
      error(response, "UNAUTHORIZED", "Unauthorized", 401);
      return;
    }

    request.user = {
      id: userId,
      role: role as never,
    };
    next();
    return;
  }

  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    });

    if (!session?.user) {
      error(response, "UNAUTHORIZED", "Unauthorized", 401);
      return;
    }

    const role = (session.user as { role?: string }).role ?? "Masyarakat";

    request.user = {
      id: session.user.id,
      role: role as never,
    };

    next();
  } catch {
    error(response, "UNAUTHORIZED", "Unauthorized", 401);
  }
};

export const optionalAuth: RequestHandler = async (request, _response, next) => {
  if (process.env.NODE_ENV === "test" && typeof process.env.VITEST !== "undefined") {
    const role = request.header("x-test-role");
    const userId = request.header("x-test-user-id");

    if (role && userId) {
      request.user = {
        id: userId,
        role: role as never,
      };
    }

    next();
    return;
  }

  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    });

    if (session?.user) {
      const role = (session.user as { role?: string }).role ?? "Masyarakat";

      request.user = {
        id: session.user.id,
        role: role as never,
      };
    }
  } catch {
    // Public endpoints should remain public when session lookup fails.
  }

  next();
};

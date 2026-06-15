import type { RequestHandler } from "express";
import { error } from "../utils/response";

function roleGuard(expectedRole: string): RequestHandler {
  return (request, response, next) => {
    if (request.user?.role !== expectedRole) {
      error(response, "FORBIDDEN", "Forbidden", 403);
      return;
    }

    next();
  };
}

export function rolesAllowed(...allowed: string[]): RequestHandler {
  return (request, response, next) => {
    const role = request.user?.role;
    if (!role || !allowed.includes(role)) {
      error(response, "FORBIDDEN", "Forbidden", 403);
      return;
    }

    next();
  };
}

export const adminOnly = roleGuard("Admin");
export const opdOnly = roleGuard("OPD");
export const masyarakatOnly = roleGuard("Masyarakat");

export const adminOrOpd = rolesAllowed("Admin", "OPD");
export const adminOrMasyarakat = rolesAllowed("Admin", "Masyarakat");

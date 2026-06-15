import { api } from "@/lib/api";

/**
 * Resolve a stored public file path to an absolute URL. Handles:
 * - empty/null → "" (caller should provide a fallback)
 * - absolute http(s) URLs → returned as-is
 * - relative paths (e.g. "/api/public-files/x.jpg") → prefixed with api.baseUrl
 */
export function resolvePublicUrl(path?: string | null): string {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path;
  return `${api.baseUrl}${path}`;
}

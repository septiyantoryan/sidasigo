import type { SyntheticEvent } from "react";
import { api } from "./api";

export const FALLBACK_IMAGE = "/image.jpg";

/**
 * Resolves an image path to a full URL.
 * Handles absolute URLs (http/https) and relative paths.
 */
export function resolveImageUrl(
  path: string | null | undefined,
): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return `${api.baseUrl}${path}`;
}

/**
 * onError handler untuk <img>. Jika gambar gagal dimuat (mis. file upload
 * tidak ditemukan / 404), ganti dengan gambar fallback dari public/image.jpg.
 * Anti-loop berbasis src (bukan flag persisten), sehingga aman saat node DOM
 * dipakai ulang untuk item berbeda.
 */
export function handleImageError(event: SyntheticEvent<HTMLImageElement>) {
  const img = event.currentTarget;
  if (img.src.endsWith(FALLBACK_IMAGE)) return;
  img.src = FALLBACK_IMAGE;
}

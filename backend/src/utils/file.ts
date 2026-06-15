import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";

export const uploadRoot = path.join(process.cwd(), "uploads");

/**
 * Ensure the upload directories exist. Safe to call repeatedly (recursive).
 * Called at server startup so freshly cloned/deployed environments always
 * have the upload folders even though `uploads/` is gitignored.
 */
export function ensureUploadDirs() {
  fsSync.mkdirSync(uploadRoot, { recursive: true });
  fsSync.mkdirSync(publicUploadRoot, { recursive: true });
}

/**
 * Resolve a stored file value against the upload root and guard against
 * path traversal. Accepts a bare filename, a relative path inside uploads,
 * or a legacy absolute path that still points inside the upload root.
 * Returns null if the resolved path escapes the upload root.
 */
export function resolveUploadPath(value: string): string | null {
  if (!value) return null;
  const resolved = path.resolve(uploadRoot, value);
  if (resolved !== uploadRoot && !resolved.startsWith(uploadRoot + path.sep)) {
    return null;
  }
  return resolved;
}

export async function deleteFile(value: string) {
  if (!value) return;
  // Only delete files that resolve inside the upload root. Anything that
  // escapes uploads/ (e.g. user-supplied absolute paths to server files) is
  // ignored to prevent arbitrary file deletion.
  const target = resolveUploadPath(value);
  if (!target || target === uploadRoot) return;
  await fs.unlink(target).catch(() => undefined);
}

/**
 * Relocate a freshly-uploaded staging file into a category/id subfolder so
 * stored files are organized as `uploads/<subdir>/<filename>`.
 *
 * Best-effort by design:
 * - Empty values are returned unchanged.
 * - Values that already contain a path separator are assumed to be already
 *   relocated (or legacy nested paths) and are returned unchanged.
 * - If the staging file does not exist on disk (e.g. seeded test fixtures),
 *   the value is returned unchanged instead of throwing.
 *
 * Returns the normalized relative path (`<subdir>/<filename>`, forward slashes)
 * to store in the database, or the original value when relocation is skipped.
 */
export async function relocateUploadedFile(
  value: string,
  subdir: string,
): Promise<string> {
  if (!value) return value;
  // Already contains a separator → treat as already-relocated / legacy path.
  if (/[\\/]/.test(value)) return value;

  const source = resolveUploadPath(value);
  if (!source || source === uploadRoot) return value;

  // Guard the destination directory against traversal.
  const targetDir = path.resolve(uploadRoot, subdir);
  if (targetDir !== uploadRoot && !targetDir.startsWith(uploadRoot + path.sep)) {
    return value;
  }

  const filename = path.basename(source);
  const destination = path.join(targetDir, filename);

  try {
    if (!fsSync.existsSync(source)) return value;
    await fs.mkdir(targetDir, { recursive: true });
    await fs.rename(source, destination);
  } catch {
    // If the move fails for any reason, keep the original stored value so the
    // record still references a resolvable path.
    return value;
  }

  return `${subdir}/${filename}`.replace(/\\/g, "/");
}

/**
 * Recursively delete an upload subfolder (e.g. `inovasi/<id>`), constrained to
 * the upload root. Safe to call when the folder does not exist.
 */
export async function deleteUploadFolder(subdir: string) {
  if (!subdir) return;
  const target = path.resolve(uploadRoot, subdir);
  if (target === uploadRoot) return;
  if (!target.startsWith(uploadRoot + path.sep)) return;
  await fs.rm(target, { recursive: true, force: true }).catch(() => undefined);
}

export function getFileUrl(filename: string) {
  return `/api/files/${filename}`;
}

export const publicUploadRoot = path.join(process.cwd(), "uploads", "public");

/**
 * Delete a publicly served file. Accepts a stored value that may be a bare
 * filename or a path like "/api/public-files/<name>"; only the basename is
 * used and the target is constrained to uploads/public to prevent traversal.
 */
export async function deletePublicFile(value: string) {
  if (!value) return;
  const name = value.split(/[\\/]/).pop();
  if (!name) return;
  const target = path.resolve(publicUploadRoot, name);
  if (target !== publicUploadRoot && !target.startsWith(publicUploadRoot + path.sep)) {
    return;
  }
  await fs.unlink(target).catch(() => undefined);
}

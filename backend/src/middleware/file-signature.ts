import fs from "node:fs";
import type { RequestHandler } from "express";
import { error } from "../utils/response";

const SIGNATURES: Record<string, number[][]> = {
  "application/pdf": [
    [0x25, 0x50, 0x44, 0x46], // %PDF
  ],
  "image/jpeg": [
    [0xff, 0xd8, 0xff], // JFIF/EXIF
  ],
  "image/png": [
    [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], // \x89PNG\r\n\x1a\n
  ],
  "image/webp": [
    [0x52, 0x49, 0x46, 0x46], // RIFF
  ],
  "application/msword": [
    [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1], // OLE2 container
  ],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    [0x50, 0x4b, 0x03, 0x04], // ZIP container
  ],
};

function checkSignature(filePath: string, allowedTypes: Set<string>): string | null {
  const fd = fs.openSync(filePath, "r");
  try {
    const header = Buffer.alloc(12);
    const bytesRead = fs.readSync(fd, header, 0, header.length, 0);
    fs.closeSync(fd);

    for (const mime of allowedTypes) {
      const sigs = SIGNATURES[mime];
      if (!sigs) continue;
      for (const sig of sigs) {
        if (bytesRead >= sig.length) {
          let match = true;
          for (let i = 0; i < sig.length; i++) {
            if (header[i] !== sig[i]) {
              match = false;
              break;
            }
          }
          if (match) {
            // WebP is a RIFF container; require the "WEBP" fourcc at offset 8
            // so other RIFF files (AVI/WAV) are not accepted as images.
            if (mime === "image/webp") {
              const isWebp =
                bytesRead >= 12 &&
                header[8] === 0x57 && // W
                header[9] === 0x45 && // E
                header[10] === 0x42 && // B
                header[11] === 0x50; // P
              if (!isWebp) continue;
            }
            return mime;
          }
        }
      }
    }

    return null;
  } catch {
    try { fs.closeSync(fd); } catch { /* ignore */ }
    return null;
  }
}

export function validateFileSignature(allowedMimeTypes: string[]): RequestHandler {
  const allowedSet = new Set(allowedMimeTypes);

  return (request, response, next) => {
    if (!request.file) {
      next();
      return;
    }

    const detected = checkSignature(request.file.path, allowedSet);
    if (!detected) {
      // Remove the file that failed validation.
      try { fs.unlinkSync(request.file.path); } catch { /* ignore */ }
      error(response, "FILE_TYPE_INVALID", "Invalid file content", 400);
      return;
    }

    next();
  };
}

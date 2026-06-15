import path from "node:path";
import crypto from "node:crypto";
import multer from "multer";

const uploadRoot = path.join(process.cwd(), "uploads");

const allowedMimeTypes = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadRoot);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

export const uploadSingle = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      cb(new Error("FILE_TYPE_INVALID"));
      return;
    }

    cb(null, true);
  },
}).single("file");

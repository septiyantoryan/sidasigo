import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import multer from "multer";

const publicUploadRoot = path.join(process.cwd(), "uploads", "public");

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    fs.mkdir(publicUploadRoot, { recursive: true }, (err) => {
      cb(err, publicUploadRoot);
    });
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

export const uploadPublicSingle = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      cb(new Error("FILE_TYPE_INVALID"));
      return;
    }

    cb(null, true);
  },
}).single("file");

const allowedDocMimeTypes = new Set(["application/pdf"]);

export const uploadPublicDocSingle = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowedDocMimeTypes.has(file.mimetype)) {
      cb(new Error("FILE_TYPE_INVALID"));
      return;
    }

    cb(null, true);
  },
}).single("file");

import { Router } from "express";
import { validate } from "../../middleware/validate";
import { validateFileSignature } from "../../middleware/file-signature";
import { uploadPublicSingle } from "../../lib/public-upload";
import { createBeritaSchema, updateBeritaSchema } from "./berita.schema";
import {
  deleteBeritaHandler,
  getAdminBerita,
  postBerita,
  postBeritaUpload,
  putBerita,
} from "./berita.controller";

// Auth (requireAuth + adminOnly) is enforced by the parent admin router.
const router = Router();

router.get("/", getAdminBerita);
router.post("/", validate(createBeritaSchema), postBerita);
router.put("/:id", validate(updateBeritaSchema), putBerita);
router.delete("/:id", deleteBeritaHandler);
router.post(
  "/upload",
  uploadPublicSingle,
  validateFileSignature(["image/jpeg", "image/png", "image/webp"]),
  postBeritaUpload,
);

export default router;

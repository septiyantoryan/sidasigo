import { Router } from "express";
import { validate } from "../../middleware/validate";
import { validateFileSignature } from "../../middleware/file-signature";
import { uploadPublicDocSingle } from "../../lib/public-upload";
import { createDownloadSchema, updateDownloadSchema } from "./download.schema";
import {
  deleteDownloadHandler,
  getAdminDownload,
  getDownloadDetail,
  postDownload,
  postDownloadUpload,
  putDownload,
} from "./download.controller";

// Auth (requireAuth + adminOnly) is enforced by the parent admin router.
const router = Router();

router.get("/", getAdminDownload);
router.get("/:id", getDownloadDetail);
router.post("/", validate(createDownloadSchema), postDownload);
router.put("/:id", validate(updateDownloadSchema), putDownload);
router.delete("/:id", deleteDownloadHandler);
router.post(
  "/upload",
  uploadPublicDocSingle,
  validateFileSignature(["application/pdf"]),
  postDownloadUpload,
);

export default router;

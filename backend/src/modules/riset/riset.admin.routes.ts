import { Router } from "express";
import { validate } from "../../middleware/validate";
import { validateFileSignature } from "../../middleware/file-signature";
import { uploadPublicDocSingle } from "../../lib/public-upload";
import { createRisetSchema, updateRisetSchema } from "./riset.schema";
import {
  deleteRisetHandler,
  getAdminRiset,
  postRiset,
  postRisetUpload,
  putRiset,
} from "./riset.controller";

// Auth (requireAuth + adminOnly) is enforced by the parent admin router.
const router = Router();

router.get("/", getAdminRiset);
router.post("/", validate(createRisetSchema), postRiset);
router.put("/:id", validate(updateRisetSchema), putRiset);
router.delete("/:id", deleteRisetHandler);
router.post(
  "/upload",
  uploadPublicDocSingle,
  validateFileSignature(["application/pdf"]),
  postRisetUpload,
);

export default router;

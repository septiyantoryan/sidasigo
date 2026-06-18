import { Router } from "express";
import { uploadSingle } from "../../lib/upload";
import { requireAuth } from "../../middleware/auth";
import { validateFileSignature } from "../../middleware/file-signature";
import { uploadSingleHandler } from "./upload.controller";

const router = Router();

router.post("/single", requireAuth, uploadSingle, validateFileSignature(["application/pdf", "image/jpeg", "image/png", "image/webp", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]), uploadSingleHandler);

export default router;

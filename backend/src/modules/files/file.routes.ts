import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { getFile } from "./file.controller";

const router = Router();

router.get("/:filename", requireAuth, getFile);

export default router;

import { Router } from "express";
import { optionalAuth } from "../../middleware/auth";
import { getFile } from "./file.controller";

const router = Router();

router.get("/:filename", optionalAuth, getFile);

export default router;

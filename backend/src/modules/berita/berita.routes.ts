import { Router } from "express";
import { getPublicBerita, getBeritaDetail } from "./berita.controller";

const router = Router();

router.get("/", getPublicBerita);
router.get("/:id", getBeritaDetail);

export default router;

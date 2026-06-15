import { Router } from "express";
import { getPublicDownload } from "./download.controller";

const router = Router();

router.get("/", getPublicDownload);

export default router;

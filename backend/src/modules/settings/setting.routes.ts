import { Router } from "express";
import { getPublicSettings } from "./setting.controller";

const router = Router();

router.get("/", getPublicSettings);

export default router;

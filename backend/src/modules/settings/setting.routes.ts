import { Router } from "express";
import { getPublicHeroImages, getPublicSettings } from "./setting.controller";

const router = Router();

router.get("/", getPublicSettings);
router.get("/hero-images", getPublicHeroImages);

export default router;

import { Router } from "express";
import { getPublicRiset, getRisetDetail } from "./riset.controller";

const router = Router();

router.get("/", getPublicRiset);
router.get("/:id", getRisetDetail);

export default router;

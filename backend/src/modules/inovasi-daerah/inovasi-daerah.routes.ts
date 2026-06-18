import { Router } from "express";
import { optionalAuth, requireAuth } from "../../middleware/auth";
import { ownInovasiDaerah, requirePendingForOwner } from "../../middleware/ownership";
import { adminOnly, adminOrOpd, opdOnly } from "../../middleware/role";
import { validate } from "../../middleware/validate";
import { updateIndikatorSchema } from "./indikator.schema";
import {
  deleteInovasiDaerahHandler,
  getInovasiDaerahDetail,
  getMyInovasiDaerah,
  getMyInovasiStats,
  getPublicInovasiDaerah,
  postInovasiDaerah,
  putApproveInovasiDaerah,
  putIndikator,
  putInovasiDaerah,
  putRejectInovasiDaerah,
} from "./inovasi-daerah.controller";
import { createInovasiDaerahSchema, updateInovasiDaerahSchema } from "./inovasi-daerah.schema";

const router = Router();

router.get("/", getPublicInovasiDaerah);
router.get("/my/list", requireAuth, opdOnly, getMyInovasiDaerah);
router.get("/my/stats", requireAuth, opdOnly, getMyInovasiStats);
router.get("/:id", optionalAuth, getInovasiDaerahDetail);
router.post("/", requireAuth, opdOnly, validate(createInovasiDaerahSchema), postInovasiDaerah);
router.put("/:id", requireAuth, adminOrOpd, ownInovasiDaerah, requirePendingForOwner("inovasi"), validate(updateInovasiDaerahSchema), putInovasiDaerah);
router.delete("/:id", requireAuth, adminOrOpd, ownInovasiDaerah, requirePendingForOwner("inovasi"), deleteInovasiDaerahHandler);
router.put("/:id/approve", requireAuth, adminOnly, putApproveInovasiDaerah);
router.put("/:id/reject", requireAuth, adminOnly, putRejectInovasiDaerah);
router.put("/:id/indikator", requireAuth, adminOrOpd, ownInovasiDaerah, requirePendingForOwner("inovasi"), validate(updateIndikatorSchema), putIndikator);

export default router;

import { Router } from "express";
import { optionalAuth, requireAuth } from "../../middleware/auth";
import { ownKrenova, requirePendingForOwner } from "../../middleware/ownership";
import { adminOnly, adminOrMasyarakat, masyarakatOnly } from "../../middleware/role";
import { validate } from "../../middleware/validate";
import {
  deleteKrenovaHandler,
  getKrenovaDetail,
  getMyKrenova,
  getMyKrenovaStats,
  getPublicKrenova,
  postKrenova,
  putApproveKrenova,
  putKrenova,
  putRejectKrenova,
} from "./krenova.controller";
import { createKrenovaSchema, updateKrenovaSchema } from "./krenova.schema";

const router = Router();

router.get("/", getPublicKrenova);
router.get("/my/list", requireAuth, masyarakatOnly, getMyKrenova);
router.get("/my/stats", requireAuth, masyarakatOnly, getMyKrenovaStats);
router.get("/:id", optionalAuth, getKrenovaDetail);
router.post("/", requireAuth, masyarakatOnly, validate(createKrenovaSchema), postKrenova);
router.put("/:id", requireAuth, adminOrMasyarakat, ownKrenova, requirePendingForOwner("krenova"), validate(updateKrenovaSchema), putKrenova);
router.delete("/:id", requireAuth, adminOrMasyarakat, ownKrenova, requirePendingForOwner("krenova"), deleteKrenovaHandler);
router.put("/:id/approve", requireAuth, adminOnly, putApproveKrenova);
router.put("/:id/reject", requireAuth, adminOnly, putRejectKrenova);

export default router;

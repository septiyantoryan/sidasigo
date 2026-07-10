import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { adminOrOpd } from "../../middleware/role";
import { putChangeEmail, putChangePassword, putChangeUsername } from "./user.controller";

const router = Router();

router.put("/change-password", requireAuth, putChangePassword);
router.put("/change-username", requireAuth, putChangeUsername);
router.put("/change-email", requireAuth, adminOrOpd, putChangeEmail);

export default router;

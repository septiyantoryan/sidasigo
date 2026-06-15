import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { putChangePassword, putChangeUsername } from "./user.controller";

const router = Router();

router.put("/change-password", requireAuth, putChangePassword);
router.put("/change-username", requireAuth, putChangeUsername);

export default router;

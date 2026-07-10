import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { adminOnly } from "../../middleware/role";
import { validate } from "../../middleware/validate";
import { validateFileSignature } from "../../middleware/file-signature";
import { updateSettingSchema } from "../settings/setting.schema";
import { createOpdUserSchema, changeEmailAdminSchema, changePasswordAdminSchema, changeUsernameAdminSchema } from "../users/user.schema";
import {
  deleteAdminUser,
  getAdminDashboard,
  getAdminGoogleUsers,
  getAdminInovasiDaerah,
  getAdminKrenova,
  getAdminSettings,
  getAdminSubmissions,
  getAdminUsers,
  getHeroImages,
  postAdminUser,
  postHeroImage,
  postHeroImages,
  putAdminSettings,
  putAdminUserPassword,
  putAdminUsername,
  putAdminEmail,
  deleteHeroImageHandler,
  putHeroImageReorder,
  uploadPublicSingle,
} from "./admin.controller";
import { uploadPublicArray } from "../../lib/public-upload";
import risetAdminRoutes from "../riset/riset.admin.routes";
import beritaAdminRoutes from "../berita/berita.admin.routes";
import downloadAdminRoutes from "../download/download.admin.routes";

const router = Router();

router.use(requireAuth, adminOnly);

// Feature sub-routers (auth already enforced above).
router.use("/riset", risetAdminRoutes);
router.use("/berita", beritaAdminRoutes);
router.use("/download", downloadAdminRoutes);

router.get("/dashboard", getAdminDashboard);
router.get("/submissions", getAdminSubmissions);
router.get("/users", getAdminUsers);
router.get("/google-users", getAdminGoogleUsers);
router.post("/users", validate(createOpdUserSchema), postAdminUser);
router.delete("/users/:id", deleteAdminUser);
router.put("/users/:id/change-password", validate(changePasswordAdminSchema), putAdminUserPassword);
router.put("/users/:id/change-username", validate(changeUsernameAdminSchema), putAdminUsername);
router.put("/users/:id/change-email", validate(changeEmailAdminSchema), putAdminEmail);
router.get("/inovasi-daerah", getAdminInovasiDaerah);
router.get("/krenova", getAdminKrenova);
router.get("/settings", getAdminSettings);
router.put("/settings", validate(updateSettingSchema), putAdminSettings);
router.post("/settings/hero-image", uploadPublicSingle, validateFileSignature(["image/jpeg", "image/png", "image/webp"]), postHeroImage);
router.get("/settings/hero-images", getHeroImages);
router.post("/settings/hero-images", uploadPublicArray, validateFileSignature(["image/jpeg", "image/png", "image/webp"]), postHeroImages);
router.delete("/settings/hero-images/:id", deleteHeroImageHandler);
router.put("/settings/hero-images/reorder", putHeroImageReorder);

export default router;

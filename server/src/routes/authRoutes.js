import { Router } from "express";
import {
  getCurrentUser,
  login,
  logout,
  signup,
  uploadIdCard,
  checkStatus,
  reapplyVerification,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { attachUserIfPresent, requireAuth } from "../middleware/auth.js";
import { setupIdCardUpload } from "../utils/upload.js";

const router = Router();

router.post("/signup", setupIdCardUpload.single("idCard"), signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/status", checkStatus);
router.post(
  "/reapply",
  setupIdCardUpload.single("idCard"),
  reapplyVerification,
);
router.get("/me", attachUserIfPresent, getCurrentUser);
router.post(
  "/upload-id-card",
  requireAuth,
  setupIdCardUpload.single("idCard"),
  uploadIdCard,
);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;

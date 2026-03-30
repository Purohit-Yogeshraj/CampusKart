import { Router } from "express";
import { getCurrentUser, login, logout, signup } from "../controllers/authController.js";
import { attachUserIfPresent } from "../middleware/auth.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", attachUserIfPresent, getCurrentUser);

export default router;

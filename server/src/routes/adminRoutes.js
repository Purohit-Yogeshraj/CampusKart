import { Router } from "express";
import { getVerifiedUsers } from "../controllers/adminController.js";
import { requireAuth } from "../middleware/auth.js";
import {
  getPendingVerifications,
  verifyStudentId,
  getAllListings,
  deleteListing,
  getVerificationStats,
  getColleges,
  addCollege,
  removeCollege,
} from "../controllers/adminController.js";

const router = Router();

router.use(requireAuth);

router.get("/pending-verifications", getPendingVerifications);
router.put("/verify-student/:userId", verifyStudentId);
router.get("/all-listings", getAllListings);
router.delete("/listing/:listingId", deleteListing);
router.get("/stats", getVerificationStats);
router.get("/colleges", getColleges);
router.post("/colleges", addCollege);
router.delete("/colleges/:collegeId", removeCollege);
router.get("/verified-users", getVerifiedUsers);

export default router;

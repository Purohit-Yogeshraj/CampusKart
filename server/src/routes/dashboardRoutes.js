import { Router } from "express";
import { requireAuth, attachUserIfPresent } from "../middleware/auth.js";
import {
  getUserListings,
  updateListingStatus,
  getUserProfile,
  updateUserProfile,
  getPublicProfile,
  shareContactInfo,
} from "../controllers/dashboardController.js";

const router = Router();

router.get("/my-listings", requireAuth, getUserListings);
router.put("/listing/status/:listingId", requireAuth, updateListingStatus);
router.get("/profile", requireAuth, getUserProfile);
router.put("/profile", requireAuth, updateUserProfile);
router.get("/public-profile/:userId", attachUserIfPresent, getPublicProfile);
router.post("/share-contact", requireAuth, shareContactInfo);

export default router;

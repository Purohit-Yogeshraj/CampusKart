import { Router } from "express";
import {
  createListing,
  deleteListing,
  getListingById,
  getListings,
  getMyListings,
  updateListing,
} from "../controllers/listingController.js";
import { requireAuth } from "../middleware/auth.js";
import { upload } from "../utils/upload.js";

const router = Router();

router.get("/", getListings);
router.get("/mine", requireAuth, getMyListings);
router.get("/:id", getListingById);
router.post("/", requireAuth, upload.single("image"), createListing);
router.put("/:id", requireAuth, upload.single("image"), updateListing);
router.delete("/:id", requireAuth, deleteListing);

export default router;


import { Router } from "express";
import { attachUserIfPresent } from "../middleware/auth.js";
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  isInWishlist,
} from "../controllers/wishlistController.js";

const router = Router();

router.post("/add", attachUserIfPresent, addToWishlist);
router.delete("/remove/:listingId", attachUserIfPresent, removeFromWishlist);
router.get("/", attachUserIfPresent, getWishlist);
router.get("/check/:listingId", attachUserIfPresent, isInWishlist);

export default router;

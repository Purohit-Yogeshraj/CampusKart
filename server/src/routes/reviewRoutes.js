import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  addReview,
  getReviewsForUser,
  replyToReview,
  getUserRating,
} from "../controllers/reviewController.js";

const router = Router();

router.post("/add", requireAuth, addReview);
router.get("/user/:userId", getReviewsForUser);
router.put("/reply/:reviewId", requireAuth, replyToReview);
router.get("/rating/:userId", getUserRating);

export default router;

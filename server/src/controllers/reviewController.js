import { Review } from "../models/Review.js";
import { User } from "../models/User.js";
import { Listing } from "../models/Listing.js";

export async function addReview(req, res) {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Login required" });
    }

    const { revieweeId, listingId, rating, comment, type } = req.body;

    if (!revieweeId || !listingId || !rating || !type) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ success: false, message: "Rating must be between 1 and 5" });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res
        .status(404)
        .json({ success: false, message: "Listing not found" });
    }

    if (req.user._id.toString() === revieweeId) {
      return res
        .status(400)
        .json({ success: false, message: "You cannot review yourself" });
    }

    const validTypes = ["seller", "buyer"];
    if (!validTypes.includes(type)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid review type" });
    }

    if (type === "seller" && listing.user.toString() !== revieweeId) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Seller review must target the listing owner",
        });
    }

    const existingReview = await Review.findOne({
      reviewer: req.user._id,
      reviewee: revieweeId,
      listing: listingId,
      type,
      isResponse: false,
    });

    if (existingReview) {
      return res
        .status(400)
        .json({
          success: false,
          message: "You already submitted a review for this deal",
        });
    }

    // Create review
    const review = await Review.create({
      reviewer: req.user._id,
      reviewee: revieweeId,
      listing: listingId,
      rating,
      comment: comment || "",
      type,
    });

    // Update user rating
    const reviews = await Review.find({ reviewee: revieweeId, type });
    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await User.findByIdAndUpdate(
      revieweeId,
      {
        rating: parseFloat(avgRating.toFixed(1)),
        ratingCount: reviews.length,
      },
      { new: true },
    );

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      review,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getReviewsForUser(req, res) {
  try {
    const { userId } = req.params;

    const reviews = await Review.find({ reviewee: userId })
      .populate("reviewer", "username -_id")
      .populate("listing", "title")
      .sort({ createdAt: -1 });

    // Separate seller reviews from buyer reviews
    const sellerReviews = reviews.filter((r) => r.type === "seller");
    const buyerReviews = reviews.filter((r) => r.type === "buyer");

    res.json({
      success: true,
      reviews: {
        sellerReviews,
        buyerReviews,
        totalReviews: reviews.length,
        averageRating:
          reviews.length > 0
            ? (
                reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
              ).toFixed(1)
            : 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function replyToReview(req, res) {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Login required" });
    }

    const { reviewId } = req.params;
    const { comment } = req.body;

    // Find original review
    const originalReview = await Review.findById(reviewId);
    if (!originalReview) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    // Only the reviewed person can reply
    if (originalReview.reviewee.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only reply to reviews about yourself",
      });
    }

    // Create response review
    const responseReview = await Review.create({
      reviewer: req.user._id,
      reviewee: originalReview.reviewer,
      listing: originalReview.listing,
      rating: originalReview.rating,
      comment,
      type: originalReview.type,
      isResponse: true,
      responseToReview: reviewId,
    });

    res.status(201).json({
      success: true,
      message: "Reply added successfully",
      review: responseReview,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getUserRating(req, res) {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("rating ratingCount");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      rating: user.rating,
      ratingCount: user.ratingCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

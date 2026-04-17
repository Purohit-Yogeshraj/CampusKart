import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
    // Type of review (transaction type)
    type: {
      type: String,
      enum: ["seller", "buyer"],
      required: true,
    },
    // Whether this is a response/counter-review
    isResponse: {
      type: Boolean,
      default: false,
    },
    responseToReview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
reviewSchema.index({ reviewee: 1, rating: 1 });
reviewSchema.index({ reviewer: 1, type: 1 });

export const Review = mongoose.model("Review", reviewSchema);

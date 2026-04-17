import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "Textbooks",
        "Notes",
        "Lab Coats",
        "Electronics",
        "Drafters",
        "Stationery",
        "Accessories",
        "Other",
      ],
      default: "Other",
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    college: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: String,
      enum: ["1st Year", "2nd Year", "3rd Year", "4th Year", "All Years"],
      default: "All Years",
    },
    department: {
      type: String,
      required: true,
      enum: [
        "BCA",
        "MCA",
        "B.Sc",
        "M.Sc",
        "B.A",
        "M.A",
        "B.Com",
        "M.Com",
        "Engineering",
        "All Courses",
      ],
      default: "All Courses",
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    imagePath: {
      type: String,
      default: "",
    },
    demoSellerName: {
      type: String,
      default: "",
    },
    // Listing status
    status: {
      type: String,
      enum: ["active", "sold", "removed"],
      default: "active",
    },
    // Reviews and ratings
    reviews: [
      {
        buyer: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        comment: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

export const Listing = mongoose.model("Listing", listingSchema);

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female", "other"],
    },
    dob: {
      type: Date,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    contact: {
      type: String,
      required: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    // VNSGU-specific fields
    enrollmentNo: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    college: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
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
      ],
      default: "BCA",
    },
    semester: {
      type: Number,
      min: 1,
      max: 8,
      default: 1,
    },
    passingYear: {
      type: Number,
      min: new Date().getFullYear(),
      max: new Date().getFullYear() + 10,
    },
    // ID Verification
    idCardPath: {
      type: String,
      default: "",
    },
    idCardStatus: {
      type: String,
      enum: ["not-submitted", "pending", "verified", "rejected"],
      default: "not-submitted",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationDate: {
      type: Date,
    },
    // Rating system
    rating: {
      type: Number,
      default: 5,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    // Role management
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    // Verification rejection reason (for admin)
    rejectionReason: {
      type: String,
      default: "",
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  {
    timestamps: true,
  },
);

export const User = mongoose.model("User", userSchema);

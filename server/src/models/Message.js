import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    // Conversation participants
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Associated listing
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
    },
    // Message content
    message: {
      type: String,
      required: true,
      trim: true,
    },
    // Read status
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    // Block status (for privacy)
    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying conversations
messageSchema.index({ sender: 1, recipient: 1 });
messageSchema.index({ recipient: 1, isRead: 1 });

export const Message = mongoose.model("Message", messageSchema);

import { Listing } from "../models/Listing.js";
import { User } from "../models/User.js";
import { Review } from "../models/Review.js";
import { Message } from "../models/Message.js";

export async function getUserListings(req, res) {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Login required" });
    }

    const listings = await Listing.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      listings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function shareContactInfo(req, res) {
  try {
    const senderId = req.user._id;
    const { recipientId } = req.body;

    if (!recipientId) {
      return res
        .status(400)
        .json({ success: false, message: "Recipient ID is required." });
    }

    const sender = await User.findById(senderId).select(
      "username email contact",
    );
    if (!sender) {
      return res
        .status(404)
        .json({ success: false, message: "Sender user profile not found." });
    }

    const messageContent = `This user has shared their contact details with you.\nEmail: ${sender.email}\nPhone: ${sender.contact}`;

    // Create a new message in the database
    const message = await Message.create({
      sender: senderId,
      recipient: recipientId,
      message: messageContent,
      type: "contact_share", // A special type for custom rendering on the frontend
    });

    // Populate the message with sender info to send over socket
    const populatedMessage = await Message.findById(message._id).populate({
      path: "sender",
      select: "username",
    });

    // Get the socket.io instance and active users map from the app instance
    const io = req.app.get("socketio");
    const activeUsers = req.app.get("activeUsers");

    // Emit the new message to the recipient if they are online
    const recipientSocketId = activeUsers.get(recipientId.toString());
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("new-message", populatedMessage);
    }

    // Also emit the message to the sender so it appears in their own chat window
    const senderSocketId = activeUsers.get(senderId.toString());
    if (senderSocketId) {
      io.to(senderSocketId).emit("new-message", populatedMessage);
    }

    return res.json({ success: true, message: "Contact information shared." });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "A server error occurred." });
  }
}

export async function updateListingStatus(req, res) {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Login required" });
    }

    const { listingId } = req.params;
    const { status } = req.body;

    // Validate status
    if (!["active", "sold", "removed"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res
        .status(404)
        .json({ success: false, message: "Listing not found" });
    }

    // Check if user owns the listing
    if (listing.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    listing.status = status;
    await listing.save();

    res.json({
      success: true,
      message: `Listing marked as ${status}`,
      listing,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getUserProfile(req, res) {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Login required" });
    }

    const user = await User.findById(req.user._id).select("-passwordHash");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Get user statistics
    const totalListings = await Listing.countDocuments({ user: user._id });
    const activeListing = await Listing.countDocuments({
      user: user._id,
      status: "active",
    });
    const soldListings = await Listing.countDocuments({
      user: user._id,
      status: "sold",
    });

    // Get recent reviews
    const recentReviews = await Review.find({
      reviewee: user._id,
    })
      .populate("reviewer", "username -_id")
      .limit(5)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      profile: {
        ...user.toObject(),
        stats: {
          totalListings,
          activeListing,
          soldListings,
        },
        recentReviews,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateUserProfile(req, res) {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Login required" });
    }

    const { username, semester, passingYear, department } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        ...(username && { username }),
        ...(semester && { semester: parseInt(semester) }),
        ...(passingYear && { passingYear: parseInt(passingYear) }),
        ...(department && { department }),
      },
      { new: true },
    ).select("-passwordHash");

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getPublicProfile(req, res) {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select(
      "username email college department semester passingYear rating ratingCount idCardStatus",
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Get user's active listings
    const listings = await Listing.find({
      user: userId,
      status: "active",
    })
      .select("title price imagePath category")
      .limit(6);

    // Get reviews
    const reviews = await Review.find({ reviewee: userId })
      .populate("reviewer", "username -_id")
      .limit(5);

    res.json({
      success: true,
      profile: {
        ...user.toObject(),
        listings,
        reviews,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

import { User } from "../models/User.js";
import { Listing } from "../models/Listing.js";
import { College } from "../models/College.js";
import { createCollegeSlug } from "../utils/colleges.js";

// Check if user is admin
async function checkAdmin(req, res) {
  const isAdmin =
    req.user && req.user.role && req.user.role.toLowerCase() === "admin";
  if (!isAdmin) {
    return res
      .status(403)
      .json({ success: false, message: "Admin access required" });
  }
  return null;
}

// Get pending verification requests
export async function getPendingVerifications(req, res) {
  try {
    const adminCheck = await checkAdmin(req, res);
    if (adminCheck) return;

    const pendingUsers = await User.find({
      idCardStatus: "pending",
    }).select("-passwordHash");

    res.json({ success: true, users: pendingUsers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Verify student ID
export async function verifyStudentId(req, res) {
  try {
    const adminCheck = await checkAdmin(req, res);
    if (adminCheck) return;

    const { userId } = req.params;
    const { isApproved, rejectionReason } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        isVerified: isApproved,
        idCardStatus: isApproved ? "verified" : "rejected",
        rejectionReason: isApproved ? "" : rejectionReason,
        verificationDate: isApproved ? new Date() : null,
      },
      { new: true },
    ).select("-passwordHash");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message: isApproved
        ? "User verified successfully"
        : "User verification rejected",
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Get all listings for moderation
export async function getAllListings(req, res) {
  try {
    const adminCheck = await checkAdmin(req, res);
    if (adminCheck) return;

    const listings = await Listing.find()
      .populate("user", "username email college")
      .sort({ createdAt: -1 });

    res.json({ success: true, listings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Delete listing (moderation)
export async function deleteListing(req, res) {
  try {
    const adminCheck = await checkAdmin(req, res);
    if (adminCheck) return;

    const { listingId } = req.params;
    const { reason } = req.body;

    const listing = await Listing.findByIdAndDelete(listingId);

    if (!listing) {
      return res
        .status(404)
        .json({ success: false, message: "Listing not found" });
    }

    // TODO: Send notification to user about removal

    res.json({
      success: true,
      message: `Listing removed. Reason: ${reason}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Get verification statistics
export async function getVerificationStats(req, res) {
  try {
    const adminCheck = await checkAdmin(req, res);
    if (adminCheck) return;

    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const pendingVerifications = await User.countDocuments({
      idCardStatus: "pending",
    });
    const totalListings = await Listing.countDocuments();
    const activeListing = await Listing.countDocuments({ status: "active" });
    const soldListings = await Listing.countDocuments({ status: "sold" });

    res.json({
      success: true,
      stats: {
        totalUsers,
        verifiedUsers,
        unverifiedUsers: totalUsers - verifiedUsers,
        pendingVerifications,
        totalListings,
        activeListing,
        soldListings,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getColleges(req, res) {
  try {
    const adminCheck = await checkAdmin(req, res);
    if (adminCheck) return;

    const colleges = await College.find().sort({ active: -1, name: 1 });
    res.json({ success: true, colleges });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function addCollege(req, res) {
  try {
    const adminCheck = await checkAdmin(req, res);
    if (adminCheck) return;

    const name = String(req.body.name || "").trim();
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "College name is required" });
    }

    const existingCollege = await College.findOne({ name });
    if (existingCollege) {
      if (!existingCollege.active) {
        existingCollege.active = true;
        await existingCollege.save();
        return res.json({
          success: true,
          message: "College reactivated successfully",
          college: existingCollege,
        });
      }

      return res
        .status(400)
        .json({ success: false, message: "College already exists" });
    }

    const college = await College.create({
      name,
      slug: createCollegeSlug(name),
      active: true,
    });

    res
      .status(201)
      .json({ success: true, message: "College added successfully", college });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function removeCollege(req, res) {
  try {
    const adminCheck = await checkAdmin(req, res);
    if (adminCheck) return;

    const college = await College.findById(req.params.collegeId);
    if (!college) {
      return res
        .status(404)
        .json({ success: false, message: "College not found" });
    }

    const [userCount, listingCount] = await Promise.all([
      User.countDocuments({ college: college.name }),
      Listing.countDocuments({ college: college.name }),
    ]);

    if (userCount > 0 || listingCount > 0) {
      college.active = false;
      await college.save();
      return res.json({
        success: true,
        message:
          "College has active users or listings, so it was hidden from new selections instead of being deleted",
        college,
      });
    }

    await college.deleteOne();
    res.json({ success: true, message: "College removed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Get all verified users for export
export async function getVerifiedUsers(req, res) {
  try {
    const adminCheck = await checkAdmin(req, res);
    if (adminCheck) return;

    const users = await User.find({ isVerified: true }).select("-passwordHash");
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

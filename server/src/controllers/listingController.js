import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Listing } from "../models/Listing.js";
import { User } from "../models/User.js";
import { isAllowedCollege, normalizeCollegeName } from "../utils/colleges.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, "../../uploads");

function formatListingForViewer(listing, viewerId = null) {
  const ownerId =
    listing.user?._id?.toString?.() || listing.user?.toString?.() || "";
  const isOwner = viewerId && ownerId && ownerId === viewerId.toString();

  return {
    id: listing._id,
    title: listing.title,
    category: listing.category,
    price: listing.price,
    college: listing.college,
    year: listing.year,
    department: listing.department || "All Courses",
    description: listing.description,
    phone: isOwner ? listing.phone : "",
    imagePath: listing.imagePath,
    status: listing.status,
    postedAt: listing.createdAt,
    sellerName: listing.demoSellerName || listing.user?.username || "",
    sellerRating: listing.user?.rating ?? 0,
    sellerRatingCount: listing.user?.ratingCount ?? 0,
    sellerVerified: false,
    userId: listing.user?._id || listing.user,
    reviews: listing.reviews?.length || 0,
  };
}

function removeUploadIfPresent(imagePath) {
  if (!imagePath) {
    return;
  }

  const filename = imagePath.split("/").pop();
  const fullPath = path.join(uploadsDir, filename);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
}

export async function getListings(req, res) {
  const {
    search = "",
    category = "",
    college = "",
    year = "",
    department = "",
    status = "active",
  } = req.query;
  const filters = { status };

  if (category) {
    filters.category = category;
  }

  if (college) {
    filters.college = college;
  }

  if (year) {
    filters.year = year;
  }

  if (department) {
    filters.department = department;
  }

  if (search) {
    filters.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const listings = await Listing.find(filters)
    .populate("user", "username rating ratingCount isVerified")
    .sort({ createdAt: -1 })
    .lean();

  return res.json({
    success: true,
    listings: listings.map((listing) =>
      formatListingForViewer(listing, req.user?._id),
    ),
  });
}

export async function getMyListings(req, res) {
  const listings = await Listing.find({ user: req.user._id })
    .populate("user", "username")
    .sort({ createdAt: -1 });

  return res.json({
    success: true,
    listings: listings.map((listing) =>
      formatListingForViewer(listing, req.user._id),
    ),
  });
}

export async function getListingById(req, res) {
  const listing = await Listing.findById(req.params.id).populate({
    path: "user",
    select:
      "username email rating ratingCount college department semester isVerified",
  });

  if (!listing) {
    return res
      .status(404)
      .json({ success: false, message: "Listing not found" });
  }

  return res.json({
    success: true,
    listing: {
      ...formatListingForViewer(listing, req.user?._id),
      phone: listing.phone,
    },
  });
}

export async function createListing(req, res) {
  try {
    // Check if user is verified
    const user = await User.findById(req.user._id);
    if (!user || !user.isVerified) {
      if (req.file) {
        removeUploadIfPresent(`/uploads/${req.file.filename}`);
      }
      return res.status(403).json({
        success: false,
        message: "Please complete ID verification before posting listings",
      });
    }

    const { title, category, price, year, department, description } = req.body;
    const normalizedCollege = normalizeCollegeName(user.college);
    const phone = user.contact;

    if (
      !title ||
      !category ||
      !price ||
      !normalizedCollege ||
      !year ||
      !department ||
      !description ||
      !phone
    ) {
      if (req.file) {
        removeUploadIfPresent(`/uploads/${req.file.filename}`);
      }
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Validate category
    const validCategories = [
      "Textbooks",
      "Notes",
      "Lab Coats",
      "Electronics",
      "Drafters",
      "Stationery",
      "Accessories",
      "Other",
    ];
    if (!validCategories.includes(category)) {
      if (req.file) {
        removeUploadIfPresent(`/uploads/${req.file.filename}`);
      }
      return res
        .status(400)
        .json({ success: false, message: "Invalid category" });
    }

    if (!(await isAllowedCollege(normalizedCollege))) {
      if (req.file) {
        removeUploadIfPresent(`/uploads/${req.file.filename}`);
      }
      return res
        .status(400)
        .json({ success: false, message: "Invalid college selection" });
    }

    const listing = await Listing.create({
      user: req.user._id,
      title,
      category,
      price: Number(price),
      college: normalizedCollege,
      year,
      department,
      description,
      phone,
      imagePath: req.file ? `/uploads/${req.file.filename}` : "",
    });

    await listing.populate("user", "username rating ratingCount");
    return res.status(201).json({
      success: true,
      message: "Ad posted successfully!",
      listing: formatListingForViewer(listing, req.user._id),
    });
  } catch (error) {
    if (req.file) {
      removeUploadIfPresent(`/uploads/${req.file.filename}`);
    }
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateListing(req, res) {
  const listing = await Listing.findOne({
    _id: req.params.id,
    user: req.user._id,
  }).populate("user", "username");

  if (!listing) {
    if (req.file) {
      removeUploadIfPresent(`/uploads/${req.file.filename}`);
    }
    return res
      .status(404)
      .json({ success: false, message: "Ad not found or access denied" });
  }

  if (req.file) {
    removeUploadIfPresent(listing.imagePath);
    listing.imagePath = `/uploads/${req.file.filename}`;
  }

  listing.title = req.body.title ?? listing.title;
  listing.category = req.body.category ?? listing.category;
  listing.price = Number(req.body.price ?? listing.price);
  listing.year = req.body.year ?? listing.year;
  listing.department = req.body.department ?? listing.department;
  listing.description = req.body.description ?? listing.description;

  await listing.save();
  await listing.populate("user", "username");

  return res.json({
    success: true,
    message: "Ad updated successfully",
    listing: formatListingForViewer(listing, req.user._id),
  });
}

export async function deleteListing(req, res) {
  const listing = await Listing.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!listing) {
    return res
      .status(404)
      .json({ success: false, message: "Ad not found or access denied" });
  }

  removeUploadIfPresent(listing.imagePath);
  await listing.deleteOne();

  return res.json({ success: true, message: "Ad deleted successfully" });
}

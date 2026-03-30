import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Listing } from "../models/Listing.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, "../../uploads");

function formatListing(listing) {
  return {
    id: listing._id,
    title: listing.title,
    category: listing.category,
    price: listing.price,
    location: listing.location,
    description: listing.description,
    phone: listing.phone,
    imagePath: listing.imagePath,
    postedAt: listing.createdAt,
    sellerName: listing.demoSellerName || listing.user?.username || "",
    userId: listing.user?._id || listing.user,
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
  const { search = "", category = "" } = req.query;
  const filters = {};

  if (category) {
    filters.category = category;
  }

  if (search) {
    filters.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
    ];
  }

  const listings = await Listing.find(filters)
    .populate("user", "username")
    .sort({ createdAt: -1 });

  return res.json({ success: true, listings: listings.map(formatListing) });
}

export async function getMyListings(req, res) {
  const listings = await Listing.find({ user: req.user._id })
    .populate("user", "username")
    .sort({ createdAt: -1 });

  return res.json({ success: true, listings: listings.map(formatListing) });
}

export async function getListingById(req, res) {
  const listing = await Listing.findById(req.params.id).populate("user", "username");

  if (!listing) {
    return res.status(404).json({ success: false, message: "Listing not found" });
  }

  return res.json({ success: true, listing: formatListing(listing) });
}

export async function createListing(req, res) {
  const { title, category, price, location, description, phone } = req.body;

  if (!title || !category || !price || !location || !description || !phone) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  const listing = await Listing.create({
    user: req.user._id,
    title,
    category,
    price: Number(price),
    location,
    description,
    phone,
    imagePath: req.file ? `/uploads/${req.file.filename}` : "",
  });

  await listing.populate("user", "username");
  return res.status(201).json({
    success: true,
    message: "Ad posted successfully!",
    listing: formatListing(listing),
  });
}

export async function updateListing(req, res) {
  const listing = await Listing.findOne({ _id: req.params.id, user: req.user._id }).populate("user", "username");

  if (!listing) {
    if (req.file) {
      removeUploadIfPresent(`/uploads/${req.file.filename}`);
    }
    return res.status(404).json({ success: false, message: "Ad not found or access denied" });
  }

  if (req.file) {
    removeUploadIfPresent(listing.imagePath);
    listing.imagePath = `/uploads/${req.file.filename}`;
  }

  listing.title = req.body.title ?? listing.title;
  listing.category = req.body.category ?? listing.category;
  listing.price = Number(req.body.price ?? listing.price);
  listing.phone = req.body.phone ?? listing.phone;
  listing.location = req.body.location ?? listing.location;
  listing.description = req.body.description ?? listing.description;

  await listing.save();
  await listing.populate("user", "username");

  return res.json({
    success: true,
    message: "Ad updated successfully",
    listing: formatListing(listing),
  });
}

export async function deleteListing(req, res) {
  const listing = await Listing.findOne({ _id: req.params.id, user: req.user._id });

  if (!listing) {
    return res.status(404).json({ success: false, message: "Ad not found or access denied" });
  }

  removeUploadIfPresent(listing.imagePath);
  await listing.deleteOne();

  return res.json({ success: true, message: "Ad deleted successfully" });
}

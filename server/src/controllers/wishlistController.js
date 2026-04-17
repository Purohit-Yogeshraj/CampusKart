import { Wishlist } from "../models/Wishlist.js";
import { Listing } from "../models/Listing.js";

export async function addToWishlist(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Login required" });
    }

    const { listingId } = req.body;

    if (!listingId) {
      return res.status(400).json({ success: false, message: "Listing ID is required" });
    }

    // Check if listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    // Find or create user's wishlist
    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        items: [{ listing: listingId }],
      });
    } else {
      // Check if already in wishlist
      const existingItem = wishlist.items.find((item) => item.listing.toString() === listingId);
      if (existingItem) {
        return res
          .status(400)
          .json({ success: false, message: "Item already in wishlist" });
      }

      wishlist.items.push({ listing: listingId });
      await wishlist.save();
    }

    await wishlist.populate("items.listing");

    res.json({
      success: true,
      message: "Added to wishlist",
      wishlist,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function removeFromWishlist(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Login required" });
    }

    const { listingId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      return res.status(404).json({ success: false, message: "Wishlist not found" });
    }

    wishlist.items = wishlist.items.filter((item) => item.listing.toString() !== listingId);
    await wishlist.save();

    await wishlist.populate("items.listing");

    res.json({
      success: true,
      message: "Removed from wishlist",
      wishlist,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getWishlist(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Login required" });
    }

    const wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
      path: "items.listing",
      populate: {
        path: "user",
        select: "username email -_id",
      },
    });

    if (!wishlist) {
      return res.json({
        success: true,
        wishlist: {
          user: req.user._id,
          items: [],
        },
      });
    }

    res.json({
      success: true,
      wishlist,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function isInWishlist(req, res) {
  try {
    if (!req.user) {
      return res.json({ success: true, inWishlist: false });
    }

    const { listingId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });

    const inWishlist = wishlist
      ? wishlist.items.some((item) => item.listing.toString() === listingId)
      : false;

    res.json({ success: true, inWishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export async function requireAuth(req, res, next) {
  try {
    // Check cookies first, fallback to Authorization header
    const token =
      req.cookies.campuskart_token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Login required" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId).select("-passwordHash");

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid session" });
    }

    req.user = user;
    next();
  } catch (_error) {
    return res.status(401).json({ success: false, message: "Invalid session" });
  }
}

export async function attachUserIfPresent(req, _res, next) {
  try {
    // Check cookies first, fallback to Authorization header
    const token =
      req.cookies.campuskart_token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      req.user = null;
      return next();
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId).select("-passwordHash");
    req.user = user || null;
    return next();
  } catch (_error) {
    req.user = null;
    return next();
  }
}

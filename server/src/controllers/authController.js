import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { createToken, setAuthCookie } from "../utils/token.js";

function sanitizeUser(user) {
  return {
    id: user._id,
    username: user.username,
    gender: user.gender,
    dob: user.dob,
    email: user.email,
    contact: user.contact,
  };
}

export async function signup(req, res) {
  const { username, gender, dob, email, contact, pass1, pass2 } = req.body;

  if (!username || !gender || !dob || !email || !contact || !pass1 || !pass2) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  if (pass1 !== pass2) {
    return res.status(400).json({ success: false, message: "Passwords do not match" });
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(400).json({ success: false, message: "Email already registered" });
  }

  const passwordHash = await bcrypt.hash(pass1, 10);
  const user = await User.create({
    username,
    gender,
    dob,
    email: email.toLowerCase(),
    contact,
    passwordHash,
  });

  return res.status(201).json({
    success: true,
    message: "Registration successful",
    user: sanitizeUser(user),
  });
}

export async function login(req, res) {
  const { email, pass } = req.body;

  if (!email || !pass) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(400).json({ success: false, message: "Invalid email or password" });
  }

  const isMatch = await bcrypt.compare(pass, user.passwordHash);
  if (!isMatch) {
    return res.status(400).json({ success: false, message: "Invalid email or password" });
  }

  const token = createToken(user._id.toString());
  setAuthCookie(res, token);

  return res.json({
    success: true,
    message: "Login successful",
    user: sanitizeUser(user),
  });
}

export async function logout(_req, res) {
  res.clearCookie("campuskart_token");
  return res.json({ success: true, message: "Logged out successfully" });
}

export async function getCurrentUser(req, res) {
  return res.json({ success: true, user: req.user || null });
}

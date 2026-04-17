import crypto from "crypto";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { createToken, setAuthCookie } from "../utils/token.js";
import { isAllowedCollege, normalizeCollegeName } from "../utils/colleges.js";

function sanitizeUser(user) {
  return {
    id: user._id,
    username: user.username,
    gender: user.gender,
    dob: user.dob,
    email: user.email,
    contact: user.contact,
    enrollmentNo: user.enrollmentNo,
    college: user.college,
    department: user.department,
    semester: user.semester,
    passingYear: user.passingYear,
    isVerified: user.isVerified,
    idCardStatus: user.idCardStatus,
    rating: user.rating,
    ratingCount: user.ratingCount,
    role: user.role,
  };
}

// Email domain validation
const ALLOWED_EMAIL_DOMAINS = (process.env.ALLOWED_EMAIL_DOMAINS || "gmail.com")
  .split(",")
  .map((domain) => domain.trim().toLowerCase())
  .filter(Boolean);

function validateEmailDomain(email) {
  const domain = email.split("@")[1]?.toLowerCase();
  return ALLOWED_EMAIL_DOMAINS.includes(domain);
}

export async function signup(req, res) {
  try {
    const {
      username,
      gender,
      dob,
      email,
      contact,
      pass1,
      pass2,
      enrollmentNo: rawEnrollmentNo,
      spid,
      college,
      department,
      semester,
      passingYear,
    } = req.body;
    const normalizedCollege = normalizeCollegeName(college);
    const enrollmentNo = String(spid || rawEnrollmentNo || "").trim();

    // Validate required fields
    if (
      !username ||
      !gender ||
      !dob ||
      !email ||
      !contact ||
      !pass1 ||
      !pass2
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Validate SPID and VNSGU details
    if (
      !enrollmentNo ||
      !normalizedCollege ||
      !department ||
      !semester ||
      !passingYear
    ) {
      return res.status(400).json({
        success: false,
        message: "SPID and VNSGU enrollment details are required",
      });
    }

    if (!/^\d{10}$/.test(enrollmentNo)) {
      return res.status(400).json({
        success: false,
        message: "SPID must be exactly 10 numeric digits",
      });
    }

    if (pass1 !== pass2) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match" });
    }

    // Validate email domain
    if (!validateEmailDomain(email)) {
      return res.status(400).json({
        success: false,
        message: `Please use your campus email (${ALLOWED_EMAIL_DOMAINS.join(", ")})`,
      });
    }

    if (!(await isAllowedCollege(normalizedCollege))) {
      return res.status(400).json({
        success: false,
        message:
          "Please select a valid VNSGU-affiliated college from the admin-approved list",
      });
    }

    // Check existing user by email
    const existingUserByEmail = await User.findOne({
      email: email.toLowerCase(),
    });
    if (existingUserByEmail) {
      return res.status(400).json({
        success: false,
        message:
          "Email already registered! Please use a DIFFERENT email for your test.",
      });
    }

    // Check existing user by SPID
    const existingUserByEnrollment = await User.findOne({ enrollmentNo });
    if (existingUserByEnrollment) {
      return res.status(400).json({
        success: false,
        message:
          "SPID already registered! Please use a DIFFERENT 10-digit SPID for your test.",
      });
    }

    const passwordHash = await bcrypt.hash(pass1, 10);
    const userData = {
      username,
      gender,
      dob,
      email: email.toLowerCase(),
      contact,
      passwordHash,
      enrollmentNo,
      college: normalizedCollege,
      department,
      semester: parseInt(semester),
      passingYear: parseInt(passingYear),
      isVerified: false, // Users must be verified before selling
    };

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          "ID Card image is missing. Please ensure you attached a valid image file.",
      });
    }

    userData.idCardPath = `/uploads/id-cards/${req.file.filename}`;
    userData.idCardStatus = "pending";

    // Create the user in the database
    const newUser = await User.create(userData);
    console.log("New user created with ID Card Status:", newUser.idCardStatus);

    return res.status(201).json({
      success: true,
      message:
        "Registration successful! Your account is pending verification. Please wait for admin approval to access all features.",
    });
  } catch (error) {
    console.error("🔥 Error during signup:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during signup: " + error.message,
    });
  }
}

export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes

    await user.save();

    // Send email
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // ALWAYS log the link to the console so you can test even if email fails
    console.log("\n👉 PASSWORD RESET LINK (Copy & Paste in browser):");
    console.log(resetUrl, "\n");

    // If no SMTP credentials are provided, just log the URL to the console (useful for local development)
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("\n⚠️ SMTP credentials missing in .env file.");
      console.log("👉 PASSWORD RESET LINK (Copy & Paste in browser):");
      console.log(resetUrl, "\n");
      return res.json({
        success: true,
        message:
          "Dev Mode: Password reset link printed in the backend terminal.",
      });
    }

    const mailOptions = {
      to: user.email,
      from: process.env.SMTP_USER,
      subject: "CampusKart Password Reset",
      text: `You requested a password reset. Please click on the following link to complete the process:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "Password reset email sent." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message:
        "Could not send email. Check your backend terminal to copy the reset link manually! Error: " +
        (error?.message || ""),
    });
  }
}

export async function resetPassword(req, res) {
  try {
    const { token } = req.params;
    const password = req.body.password || req.body.pass; // Accept 'password' or 'pass'

    if (!password) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide a new password." });
    }

    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Token is invalid or has expired." });
    }

    user.passwordHash = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({
      success: true,
      message: "Password reset successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
}

export async function login(req, res) {
  const { email, pass } = req.body;

  if (!email || !pass) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required" });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid email or password" });
  }

  const isAdmin = user.role && user.role.toLowerCase() === "admin";

  // Admins can always log in. For other users, check if they are verified.
  if (!isAdmin && !user.isVerified) {
    if (user.idCardStatus === "pending") {
      return res.status(403).json({
        success: false,
        message:
          "Your account is pending verification. Please wait for admin approval to log in.",
      });
    }
    if (user.idCardStatus === "rejected") {
      return res.status(403).json({
        success: false,
        message:
          "Your verification was rejected. Please contact support for assistance.",
      });
    }
    return res.status(403).json({
      success: false,
      message:
        "Your account is not yet verified. Please complete the verification process to log in.",
    });
  }

  const isMatch = await bcrypt.compare(pass, user.passwordHash);
  if (!isMatch) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid email or password" });
  }

  const token = createToken(user._id.toString());
  setAuthCookie(res, token);

  return res.json({
    success: true,
    message: "Login successful",
    user: sanitizeUser(user),
    token,
  });
}

export async function logout(_req, res) {
  res.clearCookie("campuskart_token");
  return res.json({ success: true, message: "Logged out successfully" });
}

export async function getCurrentUser(req, res) {
  if (!req.user) {
    return res.json({ success: true, user: null });
  }

  const user = await User.findById(req.user._id);
  return res.json({ success: true, user: user ? sanitizeUser(user) : null });
}

export async function uploadIdCard(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        idCardPath: `/uploads/id-cards/${req.file.filename}`,
        idCardStatus: "pending",
      },
      { new: true },
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.json({
      success: true,
      message: "ID card uploaded successfully. Awaiting admin verification.",
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Upload ID card error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function checkStatus(req, res) {
  const { email, pass } = req.body;

  if (!email || !pass) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required" });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid email or password" });
  }

  const isMatch = await bcrypt.compare(pass, user.passwordHash);
  if (!isMatch) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid email or password" });
  }

  return res.json({
    success: true,
    user: {
      username: user.username,
      idCardStatus: user.idCardStatus,
      isVerified: user.isVerified,
      rejectionReason: user.rejectionReason,
      department: user.department,
      semester: user.semester,
      contact: user.contact,
      gender: user.gender,
      dob: user.dob,
      enrollmentNo: user.enrollmentNo,
      college: user.college,
      passingYear: user.passingYear,
    },
  });
}

export async function reapplyVerification(req, res) {
  try {
    const {
      email,
      pass,
      username,
      gender,
      dob,
      contact,
      spid,
      college,
      department,
      semester,
      passingYear,
    } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    if (username) user.username = username;
    if (gender) user.gender = gender;
    if (dob) user.dob = dob;
    if (contact) user.contact = contact;
    if (spid) user.enrollmentNo = String(spid).trim();
    if (college) user.college = normalizeCollegeName(college);
    if (department) user.department = department;
    if (semester) user.semester = parseInt(semester);
    if (passingYear) user.passingYear = parseInt(passingYear);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "New ID Card image is required to reapply.",
      });
    }

    user.idCardPath = `/uploads/id-cards/${req.file.filename}`;
    user.idCardStatus = "pending";
    user.rejectionReason = "";

    await user.save();

    return res.json({
      success: true,
      message:
        "Application re-submitted successfully! Your status is now pending.",
    });
  } catch (error) {
    console.error("Error during reapply:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during reapply: " + error.message,
    });
  }
}

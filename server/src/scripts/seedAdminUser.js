import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { connectDatabase } from "../config/db.js";
import { User } from "../models/User.js";

dotenv.config();

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@campuskart.local").toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin1";
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "CampusKart Admin";
const ADMIN_CONTACT = process.env.ADMIN_CONTACT || "0000000000";
const ADMIN_ENROLLMENT = process.env.ADMIN_ENROLLMENT || "ADMIN-001";
const ADMIN_COLLEGE = process.env.ADMIN_COLLEGE || "CAMPUSKART ADMIN";

async function seedAdminUser() {
  await connectDatabase();

  const existingAdmin = await User.findOne({ role: "admin" });
  const emailConflictUser = await User.findOne({ email: ADMIN_EMAIL, role: { $ne: "admin" } });

  if (emailConflictUser) {
    console.error(
      `Cannot assign admin email ${ADMIN_EMAIL}. This email is already used by another non-admin account.`
    );
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  if (existingAdmin) {
    existingAdmin.email = ADMIN_EMAIL;
    existingAdmin.passwordHash = passwordHash;
    existingAdmin.username = ADMIN_USERNAME;
    existingAdmin.contact = ADMIN_CONTACT;
    existingAdmin.enrollmentNo = ADMIN_ENROLLMENT;
    existingAdmin.college = ADMIN_COLLEGE;

    await existingAdmin.save();
    console.log(`Admin account updated: ${ADMIN_EMAIL}`);
  } else {
    await User.create({
      username: ADMIN_USERNAME,
      gender: "other",
      dob: new Date("2000-01-01"),
      email: ADMIN_EMAIL,
      contact: ADMIN_CONTACT,
      passwordHash,
      enrollmentNo: ADMIN_ENROLLMENT,
      college: ADMIN_COLLEGE,
      department: "BCA",
      semester: 1,
      passingYear: new Date().getFullYear() + 1,
      isVerified: true,
      idCardStatus: "verified",
      role: "admin",
    });

    console.log(`Admin account created: ${ADMIN_EMAIL}`);
  }

  process.exit(0);
}

seedAdminUser().catch((error) => {
  console.error("Failed to seed admin account", error);
  process.exit(1);
});
